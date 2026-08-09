import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import Review from '../Model/reviewModel.js';
import sendResponse from '../Utils/sendResponse.js';
import Product from '../Model/productModel.js';
import Order from '../Model/orderModel.js';
import mongoose from 'mongoose';

export const createReview = catchAsync(async (req, res, next) => {
  const { review: reviewText, rating } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('Can not find the product', 404));
  }

  const hasPurchased = await Order.findOne({
    user: req.user.id,
    items: {
      $elemMatch: {
        product: productId,
        itemStatus: 'Delivered',
      },
    },
  });

  if (!hasPurchased) {
    return next(
      new AppError(
        'You can only review products you have purchased and received',
        403
      )
    );
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
  const { productId } = req.params;

  const reviews = await Review.find({
    product: req.params.productId,
  })
    .select('rating review product productVendor reviewUser')
    .populate('product', 'productName')
    .populate('productVendor', 'name')
    .populate('reviewUser', 'name');

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: 'product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  sendResponse(res, 200, {
    averageRating: stats[0]?.averageRating || 0,
    totalReviews: stats[0]?.totalReviews || 0,
    items: reviews,
  });
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
