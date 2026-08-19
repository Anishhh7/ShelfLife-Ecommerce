import { type ParsedQs } from 'qs';

type QueryObject = Record<string, any>;

type PrismaFindManyArgs = {
  where?: QueryObject;
  orderBy?: Record<string, 'asc' | 'desc'>;
  select?: Record<string, boolean>;
  skip?: number;
  take?: number;
};

type FieldTypeMap = Record<
  string,
  'string' | 'number' | 'boolean' | 'date'
>;

const OPERATOR_MAP: Record<string, string> = {
  gte: 'gte',
  gt: 'gt',
  lte: 'lte',
  lt: 'lt',
};

class APIFeatures {
  public filterConditions: QueryObject;

  constructor(
    public query: PrismaFindManyArgs = {},
    public queryString: ParsedQs,
    private allowedFilterFields: string[] = [],
    private allowedSortFields: string[] = [],
    private allowedSelectFields: string[] = [],
    private fieldTypes: FieldTypeMap = {}
  ) {
    this.filterConditions = {};
  }

  private coerceValue(field: string, value: any) {
    const type = this.fieldTypes[field];

    if (type === 'number') return Number(value);
    if (type === 'boolean') return value === 'true';
    if (type === 'date') return new Date(value as string);

    return value;
  }

  filter() {
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'search',
    ];

    const conditions: QueryObject = {};

    Object.keys(this.queryString).forEach((key) => {
      if (excludedFields.includes(key)) return;
      if (!this.allowedFilterFields.includes(key)) return;

      const rawValue = this.queryString[key];

      if (
        typeof rawValue === 'object' &&
        rawValue !== null &&
        !Array.isArray(rawValue)
      ) {
        const rangeCondition: QueryObject = {};

        Object.entries(rawValue as Record<string, string>).forEach(
          ([op, val]) => {
            const prismaOp = OPERATOR_MAP[op];

            if (prismaOp) {
              rangeCondition[prismaOp] = this.coerceValue(key, val);
            }
          }
        );

        if (Object.keys(rangeCondition).length > 0) {
          conditions[key] = rangeCondition;
        }

        return;
      }

      conditions[key] = this.coerceValue(key, rawValue);
    });

    this.filterConditions = conditions;

    this.query.where = {
      ...this.query.where,
      ...conditions,
    };

    return this;
  }

  search(fields: string[]) {
    const searchTerm = this.queryString.search as string;

    if (!searchTerm) return this;

    const safeFields = fields.filter((field) =>
      this.allowedFilterFields.includes(field)
    );

    if (safeFields.length === 0) return this;

    const searchConditions = safeFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }));

    this.query.where = {
      ...this.query.where,
      OR: searchConditions,
    };

    return this;
  }

  sort() {
    const sortParam = this.queryString.sort as string;

    if (!sortParam) {
      this.query.orderBy = {
        createdAt: 'desc',
      };

      return this;
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};

    sortParam.split(',').forEach((rawField) => {
      const isDesc = rawField.startsWith('-');

      const field = isDesc ? rawField.substring(1) : rawField;

      if (!this.allowedSortFields.includes(field)) return;

      orderBy[field] = isDesc ? 'desc' : 'asc';
    });

    this.query.orderBy =
      Object.keys(orderBy).length > 0
        ? orderBy
        : { createdAt: 'desc' };

    return this;
  }

  limitFields() {
    const limitParam = this.queryString.fields as string;

    if (!limitParam) return this;

    const select: Record<string, boolean> = {};

    limitParam.split(',').forEach((field) => {
      if (this.allowedSelectFields.includes(field)) {
        select[field] = true;
      }
    });

    if (Object.keys(select).length > 0) {
      this.query.select = select;
    }

    return this;
  }

  pagination() {
    const page = Math.max(1, Number(this.queryString.page) || 1);

    const limit = Math.min(
      100,
      Math.max(1, Number(this.queryString.limit) || 10)
    );

    const skip = (page - 1) * limit;

    this.query.skip = skip;
    this.query.take = limit;

    return this;
  }
}

export default APIFeatures;
