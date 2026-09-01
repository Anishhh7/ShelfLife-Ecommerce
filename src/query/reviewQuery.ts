import { z } from 'zod';
import {
  createQuery,
  sortSchema,
  type OrderByTable,
} from '../utils/query';
import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';

type ReviewScope = {
  productId?: number;
  userId?: number;
};

const reviewOrderBy: OrderByTable<Prisma.ReviewOrderByWithRelationInput> =
  {
    id: (direction) => ({ id: direction }),
    review: (direction) => ({ review: direction }),
    createdAt: (direction) => ({ createdAt: direction }),
    rating: (direction) => ({ rating: direction }),
  };

export const reviewListSchema = z.object({
  sort: sortSchema(reviewOrderBy, 'createdAt'),
});

export const reviewQuery = createQuery({
  model: prisma.review,
  schema: reviewListSchema,
  orderBy: reviewOrderBy,

  select: {
    id: true,
    review: true,
    rating: true,
    createdAt: true,
  },
  where: (input, scope: ReviewScope) => ({
    ...(scope.productId !== undefined
      ? { productId: scope.productId }
      : {}),

    ...(scope.userId !== undefined ? { userID: scope.userId } : {}),
  }),
  tiebreak: 'id',
});
