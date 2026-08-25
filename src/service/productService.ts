import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { productQuery } from '../query/productQuery';
import type { Prisma } from '../generated/prisma/client';

export const createProduct = async (
  vendorId: number,
  productData: any
) => {
  const { categoryId, ...data } = productData;
  const name = productData.name;

  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
      role: 'Vendor',
    },
  });

  if (!vendor) {
    throw new AppError(
      'Vendor account not found or unauthorized',
      404
    );
  }

  const category = await prisma.category.findUnique({
    where: {
      id: Number(categoryId),
    },
  });

  if (!category) {
    throw new AppError('Please choose a valid category', 400);
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      vendorId,
      name,
    },
  });

  if (existingProduct) {
    throw new AppError(
      'You can not create another product with same name',
      400
    );
  }

  return prisma.product.create({
    data: {
      ...data,
      vendor: {
        connect: {
          id: vendorId,
        },
      },
      category: {
        connect: {
          id: Number(categoryId),
        },
      },
    },
    include: {
      category: true,
    },
  });
};

export const updateProduct = async (
  vendorId: number,
  productId: number,
  productData: any
) => {
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
      role: 'Vendor',
    },
  });

  if (!vendor) {
    throw new AppError('Can not verified your id', 404);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      vendorId,
    },
  });

  if (!product) {
    throw new AppError(
      'Product not found or you are not authorized to update it',
      404
    );
  }

  const { categoryId, ...data } = productData;

  if (categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new AppError('Please choose a valid category', 400);
    }
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data,
    include: {
      category: true,
    },
  });
};

export const deleteProduct = async (
  vendorId: number,
  productId: number
) => {
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
      role: 'Vendor',
    },
  });

  if (!vendor) {
    throw new AppError('Can not verified your id', 404);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      vendorId,
    },
  });

  if (!product) {
    throw new AppError(
      'Product not found or you are not authorized to update it',
      404
    );
  }

  return prisma.product.delete({
    where: {
      id: productId,
    },
  });
};

export const getAllActiveProducts = (query: unknown) => {
  return productQuery.list(query, { active: true });
};

export const getActiveProductById = async (productId: number) => {
  if (!productId) {
    throw new AppError('Invalid or missing product ID', 400);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
      active: true,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return prisma.product.findUnique({
    where: {
      id: productId,
    },
  });
};

export const getAllVendorProducts = async (
  vendorId: number,
  query: unknown
) => {
  if (!Number.isInteger(vendorId) || vendorId < 0) {
    throw new AppError('Invalid or missing vendor ID', 400);
  }

  return productQuery.list(query, { vendorId });
};

export const getVendorProductById = async (
  vendorId: number,
  productId: number
) => {
  if (!productId || !vendorId) {
    throw new AppError('Invalid or missing product ID', 400);
  }

  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
    },
  });

  if (!vendor) {
    throw new AppError('You are not authorized', 401);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      vendorId,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return prisma.product.findUnique({
    where: {
      vendorId,
      id: productId,
    },
    include: {
      category: true,
    },
  });
};
