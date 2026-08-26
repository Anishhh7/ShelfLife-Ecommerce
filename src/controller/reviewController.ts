import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { sendResponse, sendPage } from '../utils/sendResponse';
import * as reviewService from '../service/reviewService';

export const createReview = catchAsync(async (req, res) => {
  const userId = Number(req.user?.id);
  const productId = Number(req.params.productId);
  const { rating } = req.body;

  const review = await reviewService.createReview(
    userId,
    productId,
    rating
  );
  sendResponse(res, 201, review, 'Review has created successfully');
});

export const getAllReviews = catchAsync(async (req, res) => {
  const productId = Number(req.params.productId);

  const review = await reviewService.getAllReviews(
    productId,
    req.query
  );
  sendPage(res, 200, review);
});

export const getAllMyReviews = catchAsync(async (req, res) => {
  const userId = Number(req.user?.id);

  const review = await reviewService.getAllMyReviews(
    userId,
    req.query
  );
  sendPage(res, 200, review);
});

export const deleteReview = catchAsync(async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  await reviewService.deleteReview(reviewId);

  sendResponse(res, 204, null);
});
