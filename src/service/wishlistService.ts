import AppError from '../utils/AppError';
import prisma from '../lib/prisma';

export const addToWishlist = async (
  userId: number,
  productId: number
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('Invalid user id', 404);
  }

  const exitingWishlist = await prisma.wishlist.findFirst({
    where: {
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!exitingWishlist) {
    const wishlist = await prisma.wishlist.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        items: {
          create: {
            product: {
              connect: {
                id: productId,
              },
            },
          },
        },
      },
    });
    return { wishlist, action: 'created' as const };
  }

  const item = await prisma.wishlistItem.findFirst({
    where: {
      id: exitingWishlist.id,
      productId,
    },
  });

  if (item) {
    throw new AppError('This item is already in your wishlist', 400);
  }
  await prisma.wishlistItem.create({
    data: {
      wishlistId: exitingWishlist.id,
      productId,
    },
  });

  return { item, action: 'added' as const };
};

export const removeFromWishlist = async (
  userId: number,
  productId: number
) => {
  const wishlist = await prisma.wishlist.findFirst({
    where: {
      userId,
    },
  });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });
  if (!wishlistItem) {
    throw new AppError('Product is not in your wishlist', 404);
  }

  return prisma.wishlistItem.delete({
    where: {
      id: wishlistItem.id,
    },
    include: {
      product: true,
    },
  });
};

export const getAllWishlists = async (userId: number) => {
  const wishlist = await prisma.wishlist.findFirst({
    where: {
      userId,
    },
  });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  return await prisma.wishlistItem.findMany({
    where: {
      wishlistId: wishlist.id,
    },
  });
};
