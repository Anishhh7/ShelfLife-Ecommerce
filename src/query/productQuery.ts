import { z } from 'zod';

import {
  createQuery,
  listQuery,
  sortSchema,
  type OrderByTable,
} from '../utils/query.js';
import prisma from '../config/prisma.js';
import { Prisma } from '../generated/prisma/client.js';

const productOrderBy: OrderByTable<Prisma.ProductOrderByWithRelationInput> =
  {
    id: (direction) => ({ id: direction }),
    name: (direction) => ({ name: direction }),
    price: (direction) => ({ price: direction }),
    stock: (direction) => ({ stock: direction }),
    createdAt: (direction) => ({ createdAt: direction }),
  };

export const productListSchema = listQuery.extend({
  sort: sortSchema(productOrderBy, 'createdAt'),
});

export const productQuery = createQuery({
  model: prisma.product,

  schema: productListSchema,

  orderBy: productOrderBy,

  select: {
    id: true,
    name: true,
    description: true,
    price: true,
    stock: true,
    active: true,
    categoryId: true,
    vendorId: true,
    createdAt: true,

    category: {
      select: {
        id: true,
        name: true,
        description: true,
      },
    },
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
