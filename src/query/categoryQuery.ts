import { z } from 'zod';

import {
  createQuery,
  listQuery,
  sortSchema,
  type OrderByTable,
} from '../utils/query.js';
import prisma from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client';

// Fields that Category is allowed to sort by
const categoryOrderBy: OrderByTable<Prisma.CategoryOrderByWithRelationInput> =
  {
    id: (direction) => ({ id: direction }),
    name: (direction) => ({ name: direction }),
    createdAt: (direction) => ({ createdAt: direction }),
  };

// Query validation for Category
export const categoryListSchema = listQuery.extend({
  sort: sortSchema(categoryOrderBy, 'createdAt'),
});

// Create reusable Category query
export const categoryQuery = createQuery({
  model: prisma.category,

  schema: categoryListSchema,

  orderBy: categoryOrderBy,

  select: {
    id: true,
    name: true,
    createdAt: true,
  },

  where: (input) => ({
    ...(input.search
      ? {
          name: {
            contains: input.search,
            mode: 'insensitive',
          },
        }
      : {}),
  }),

  tiebreak: 'id',
});
