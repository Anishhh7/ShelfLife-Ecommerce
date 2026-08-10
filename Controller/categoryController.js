import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import APIFeatures from '../Utils/apiFeatures.js';
import sendResponse from '../Utils/sendResponse.js';
import Category from '../Model/categoryModel.js';
import { changeCloudinaryImage } from '../Utils/uploadToCloudinary.js';

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

export const changeCategoryCoverImage = catchAsync(
  async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const newImage = await changeCloudinaryImage(
      category.coverImage?.publicId,
      req.file,
      'shelflife/categories'
    );

    category.coverImage = newImage;

    await category.save();

    sendResponse(
      res,
      200,
      category,
      'Category cover image updated successfully'
    );
  }
);
