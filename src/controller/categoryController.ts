import * as categoryService from '../service/categoryService';
import catchAsync from '../utils/catchAsync';
import { sendPage, sendResponse } from '../utils/sendResponse';

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
  const categories = await categoryService.getAllCategories(
    req.query
  );
  sendPage(res, 200, categories);
});

export const getCategoryById = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await categoryService.getCategoryById(
    Number(categoryId)
  );

  sendResponse(res, 200, category);
});

export const changeCoverImage = catchAsync(async (req, res, next) => {
  const categoryId = Number(req.params.categoryId);

  const image = await categoryService.changeCoverImage(
    categoryId,
    req.file!
  );

  sendResponse(
    res,
    200,
    image,
    'Category cover image updated successfully'
  );
});
