import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import prisma from '../config/prisma';
import * as categoryService from '../service/categoryService';
import AppError from '../utils/AppError';

export const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  sendResponse(res, 201, category, 'Category created successfully');
});

export const updateCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const category = await categoryService.updateCategory(
    Number(categoryId),
    req.body
  );

  sendResponse(res, 200, category, 'Category updated successfully');
});

export const deleteCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const category = await categoryService.deleteCategory(
    Number(categoryId)
  );

  sendResponse(res, 204, null, 'Category deleted successfully');
});

export const getAllCategory = catchAsync(async (req, res, next) => {
  const category = await prisma.category.findMany({});

  sendResponse(res, 200, category, { results: category.length });
});

export const getCategoryById = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await categoryService.getCategoryById(
    Number(categoryId)
  );

  sendResponse(res, 200, category);
});
