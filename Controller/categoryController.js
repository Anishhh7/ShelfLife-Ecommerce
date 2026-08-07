import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import APIFeatures from '../Utils/apiFeatures.js';
import sendResponse from '../Utils/sendResponse.js';
import Category from '../Model/categoryModel.js';

export const createCategory = catchAsync(async (req, res, next) => {
  const categories = await Category.create({ ...req.body });

  sendResponse(res, 201, categories);
});

export const getAllCategory = catchAsync(async (req, res, next) => {
  const categories = await Category.find().sort('name');

  sendResponse(res, 200, {
    results: categories.length,
    data: categories,
  });
});

export const getCategoryById = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with this ID', 404));
  }

  sendResponse(res, 200, category);
});

export const updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!category) {
    return next(new AppError('No category found with this ID', 404));
  }

  sendResponse(res, 200, category, 'Category updated successfully');
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError('No category found with this ID', 404));
  }

  sendResponse(res, 204, null, 'Category deleted successfully');
});
