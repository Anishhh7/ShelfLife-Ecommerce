import AppError from '../utils/AppError';
import prisma from '../lib/prisma';
import { ItemStatus, PaymentStatus } from '../generated/prisma/enums';
import { reviewQuery } from '../query/reviewQuery';

export const createReview = async (
  userId: number,
  productId: number,
  rating: number
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('Invalid user Id', 400);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const hasPurchased = await prisma.order.findFirst({
    where: {
      userId,
      productId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
  });

  const item = hasPurchased?.items.find(
    (item) => item.productId === productId
  );

  const canReview =
    hasPurchased?.paymentStatus === PaymentStatus.Paid &&
    item?.itemStatus === ItemStatus.Delivered;

  if (!canReview) {
    throw new AppError(
      'You can review this product only after purchasing and receiving it',
      400
    );
  }

  const alreadyReviewed = await prisma.review.findFirst({
    where: {
      userId,
      productId,
    },
  });

  if (alreadyReviewed) {
    throw new AppError('You have already reviewed this product', 400);
  }

  return prisma.review.create({
    data: {
      userId,
      productId,
      vendorId: product.vendorId,
      rating,
    },
  });
};

export const getAllReviews = async (
  productId: number,
  query: any
) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
    },
  });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return reviewQuery.list(query, { productId });
};

export const getAllMyReviews = async (
  userId: number,
  query: unknown
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError('Invalid user Id', 400);
  }

  return reviewQuery.list(query, { userId });
};

export const deleteReview = async (reviewId: number) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  return prisma.review.delete({
    where: {
      id: reviewId,
    },
  });
};
