import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import sendResponse from '../Utils/sendResponse.js';
import APIFeatures from '../Utils/apiFeatures.js';
import Product from '../Model/productModel.js';
import Category from '../Model/categoryModel.js';

export const createProduct = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.body.categoryId);
  if (!category) {
    return next(new AppError('Inavalid Category', 404));
  }

  const product = await Product.create({
    ...req.body,
    category: req.body.categoryId,
    vendor: req.user.id,
  });

  sendResponse(res, 201, product, 'Product created successfully');
});

export const getAllProduct = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .search(['name', 'description'])
    .sort()
    .limitFields()
    .pagination();

  const products = await features.query
    .populate({
      path: 'vendor',
      select: 'storeName location address ',
    })
    .populate({ path: 'category', select: 'name coverImage' });
  const total = await Product.countDocuments(
    features.filterConditions
  );
  const totalPages = Math.ceil(total / features.limit);

  sendResponse(res, 200, products, undefined, {
    results: products.length,
    total,
    page: features.page,
    totalPages,
  });
});

export const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    'category'
  );

  if (!product) {
    return next(new AppError('No product found with this ID', 404));
  }

  sendResponse(res, 200, product);
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with this ID', 404));
  }

  if (product.vendor.toString() !== req.user.id) {
    return next(
      new AppError(
        'You are not authorized to update this product',
        404
      )
    );
  }

  if (req.body.categoryId) {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return next(new AppError('Inavalid Category', 400));
    }
  }

  Object.assign(product, req.body);
  await product.save();

  sendResponse(res, 200, product, 'Product updated successfully');
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with this ID', 404));
  }

  if (product.vendor.toString() !== req.user.id) {
    return next(
      new AppError(
        'You are not authorized to update this product',
        403
      )
    );
  }

  await product.deleteOne();

  sendResponse(res, 204, null, 'Product deleted successfully');
});

export const getMyProduct = catchAsync(async (req, res, next) => {
  const products = await Product.find({ vendor: req.user.id });

  if (product.length === 0) {
    return sendResponse(
      res,
      200,
      [],
      'You do not have any products yet'
    );
  }
  sendResponse(res, 200, products);
});
