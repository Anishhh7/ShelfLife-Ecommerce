import prisma from '../lib/prisma';
import { categoryQuery } from '../query/categoryQuery';
import AppError from '../utils/AppError';
import { changeCloudinaryImage } from '../utils/uploadToCloudinary';

export const createCategory = async (categoryData: any) => {
  const categoryName = categoryData.name;

  const category = await prisma.category.findFirst({
    where: {
      name: categoryName,
    },
  });

  if (category) {
    throw new AppError('This category had been already exits', 400);
  }

  return prisma.category.create({
    data: {
      ...categoryData,
    },
  });
};

export const updateCategory = async (
  categoryId: number,
  categoryData: any
) => {
  if (!categoryId) {
    throw new AppError('Invalid category id', 400);
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError('Category does not exist with this id', 404);
  }

  return prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      ...categoryData,
    },
  });
};

export const deleteCategory = async (categoryId: number) => {
  if (!categoryId) {
    throw new AppError('Invalid category id', 400);
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError('Category does not exist with this id', 404);
  }

  return prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

export const getCategoryById = async (categoryId: number) => {
  if (!categoryId) {
    throw new AppError('Invalid category id', 400);
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError('Category does not exist with this id', 404);
  }

  return category;
};

export const getAllCategories = async (query: unknown) => {
  return categoryQuery.list(query, {});
};

export const changeCoverImage = async (
  categoryId: number,
  file: Express.Multer.File
) => {
  if (!file) {
    throw new AppError('Cover photo is required', 400);
  }
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const newImage = await changeCloudinaryImage(
    category.coverImagePublicId,
    file,
    'shelflife/categories'
  );

  return prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      coverImageUrl: newImage.url,
      coverImagePublicId: newImage.publicId,
    },
  });
};
