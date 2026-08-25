import {
  createQuery,
  listQuery,
  sortSchema,
  type OrderByTable,
} from '../utils/query';
import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';

type OrderScope = {
  userId?: number;
  vendorId?: number;
};

const orderOrderby: OrderByTable<Prisma.OrderOrderByWithRelationInput> =
  {
    id: (direction) => ({ id: direction }),
    userId: (direction) => ({ userId: direction }),
    createdAt: (direction) => ({ createdAt: direction }),
    updatedAt: (direction) => ({ updatedAt: direction }),
    totalAmount: (direction) => ({ totalAmount: direction }),
    orderNumber: (direction) => ({ orderNumber: direction }),
    paymentStatus: (direction) => ({ paymentStatus: direction }),
  };

export const orderListSchema = listQuery.extend({
  sort: sortSchema(orderOrderby, 'createdAt'),
});

export const orderQuery = createQuery({
  model: prisma.order,
  schema: orderListSchema,
  orderBy: orderOrderby,

  select: {
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    orderNumber: true,
    paymentStatus: true,
    totalAmount: true,

    items: {
      select: {
        id: true,
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    },
  },

  where: (input, scope: OrderScope) => ({
    ...(scope.userId
      ? {
          userId: scope.userId,
        }
      : {}),

    ...(scope.vendorId
      ? {
          items: {
            some: {
              product: {
                vendorId: scope.vendorId,
              },
            },
          },
        }
      : {}),

    ...(input.search
      ? {
          OR: [
            {
              name: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              orderNumber: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              storeName: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              category: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}),
  }),
  tiebreak: 'id',
});
