import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import Review from '../Model/reviewModel.js';
import sendResponse from '../Utils/sendResponse.js';
import Product from '../Model/productModel.js';

export const createReview = catchAsync(async (req, res, next) => {
  const { productId, review: reviewText, rating } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('Can not find the product', 404));
  }

  const existingReview = await Review.findOne({
    product: productId,
    reviewUser: req.user.id,
  });

  if (existingReview) { 
    return next(
      new AppError('You have already reviewed this product.', 400)
    );
  }

  const newReview = await Review.create({
    product: product._id,
    review: reviewText,
    rating,
    productVendor: product.vendor,
    reviewUser: req.user.id,
  });

  sendResponse(
    res,
    201,
    newReview,
    'Your review has been created successfully.'
  );
});

export const getAllReviews = catchAsync(async (req, res, next) => {
  const review = await Review.find()
    .select('rating review product productVendor reviewUser')
    .populate('product', 'productName')
    .populate('productVendor', 'name')
    .populate('reviewUser', 'name'); 
  sendResponse(res, 200, review);
});

export const getAllVendorReviews = catchAsync(
  async (req, res, next) => {
    const reviews = await Review.find({ productVendor: req.user.id })
      .select('rating review product reviewUser')
      .populate('product', 'productName')
      .populate('reviewUser', 'name');

    sendResponse(res, 200, reviews);
  }
);

export const getAllUserReviews = catchAsync(
  async (req, res, next) => {
    const reviews = await Review.find({ reviewUser: req.user.id })
      .select('rating review product productVendor')
      .populate('product', 'productName')
      .populate('productVendor', 'name');

    sendResponse(res, 200, reviews);
  }
);

export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(
      new AppError('Can not find review with this id', 404)
    );
  }

  sendResponse(res, 204, null, 'Review has deleted successfully.');
});
