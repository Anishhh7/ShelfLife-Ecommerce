import { z } from 'zod';
import type { Page } from '../types/api';

export class InvalidQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidQueryError';
  }
}

export type Direction = 'asc' | 'desc';

export type OrderByTable<TOrderBy> = Readonly<
  Record<string, (direction: Direction) => TOrderBy>
>;

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().min(1).max(100).optional(),
});

export const sortSchema = <TOrderBy>(
  table: OrderByTable<TOrderBy>,
  fallback: string
) => {
  const tokens = Object.keys(table).flatMap((field) => [
    field,
    `-${field}`,
  ]);

  if (!tokens.includes(fallback)) {
    throw new Error(`Invalid fallback sort field: ${fallback}`);
  }

  return z
    .enum(tokens as [string, ...string[]], {
      message: `must be one of: ${tokens.join(', ')}`,
    })
    .default(fallback)
    .transform((token) => {
      const desc = token.startsWith('-');

      return {
        field: desc ? token.slice(1) : token,
        direction: (desc ? 'desc' : 'asc') as Direction,
      };
    });
};

export const range = <T extends number | Date>(gte?: T, lte?: T) => {
  if (gte === undefined && lte === undefined) {
    return undefined;
  }

  const filter: { gte?: T; lte?: T } = {};

  if (gte !== undefined) {
    filter.gte = gte;
  }

  if (lte !== undefined) {
    filter.lte = lte;
  }

  return filter;
};

export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  raw: unknown
): z.infer<T> {
  const result = schema.safeParse(raw);

  if (!result.success) {
    throw new InvalidQueryError(
      result.error.issues
        .map(
          (issue) =>
            `${issue.path.join('.') || 'query'}: ${issue.message}`
        )
        .join('; ')
    );
  }

  return result.data;
}

interface ListDelegate {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
}

export function createQuery<
  TSchema extends z.ZodTypeAny,
  TScope,
  TWhere,
  TOrderBy,
>(definition: {
  model: ListDelegate;
  schema: TSchema;
  orderBy: OrderByTable<TOrderBy>;
  select: object | ((scope: TScope) => object);
  where: (input: z.infer<TSchema>, scope: TScope) => TWhere;
  tiebreak?: string;
}) {
  return {
    schema: definition.schema,

    async list<TRow>(
      rawQuery: unknown,
      scope: TScope
    ): Promise<Page<TRow>> {
      console.log('rawQuery:', rawQuery);
      const input = parseOrThrow(
        definition.schema,
        rawQuery
      ) as z.infer<TSchema> & {
        page: number;
        limit: number;
        sort: {
          field: string;
          direction: Direction;
        };
      };

      const where = definition.where(input, scope);

      const build = definition.orderBy[input.sort.field];

      if (!build) {
        throw new InvalidQueryError(
          `Cannot sort by '${input.sort.field}'`
        );
      }

      const orderBy: TOrderBy[] = [build(input.sort.direction)];

      const tiebreak = definition.tiebreak;

      if (
        tiebreak &&
        tiebreak !== input.sort.field &&
        definition.orderBy[tiebreak]
      ) {
        orderBy.push(
          definition.orderBy[tiebreak]!(input.sort.direction)
        );
      }

      const [rows, total] = await Promise.all([
        definition.model.findMany({
          where,
          orderBy,
          select:
            typeof definition.select === 'function'
              ? definition.select(scope)
              : definition.select,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),

        definition.model.count({ where }),
      ]);

      return {
        data: rows as TRow[],
        meta: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    },
  };
}
