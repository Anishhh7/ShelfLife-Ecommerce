import {
  createQuery,
  listQuery,
  sortSchema,
  type OrderByTable,
} from '../utils/query';
import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

type UserScope = {
  role: 'Vendor' | 'Staff' | 'Customer';
  approved?: boolean;
};

const userOrderBy: OrderByTable<Prisma.UserOrderByWithRelationInput> =
  {
    id: (direction) => ({ id: direction }),
    storeName: (direction) => ({ storeName: direction }),
    name: (direction) => ({ name: direction }),
    email: (direction) => ({ email: direction }),
    createdAt: (direction) => ({ createdAt: direction }),
  };

export const userListSchema = listQuery.extend({
  sort: sortSchema(userOrderBy, 'createdAt'),
});

export const userQuery = createQuery({
  model: prisma.user,
  schema: userListSchema,
  orderBy: userOrderBy,
  select: (scope: UserScope) => {
    if (scope.role === 'Vendor') {
      return {
        id: true,
        name: true,
        email: true,
        phone: true,
        storeName: true,
        approved: true,
        createdAt: true,
      };
    }

    return {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    };
  },

  where: (input, scope: UserScope) => ({
    role: scope.role,

    ...(scope.approved !== undefined
      ? {
          approved: scope.approved,
        }
      : {}),
    
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' } },
            {
              email: { contains: input.search, mode: 'insensitive' },
            },
            {
              phone: { contains: input.search, mode: 'insensitive' },
            },
          ],
        }
      : {}),
  }),
  tiebreak: 'id',
});
