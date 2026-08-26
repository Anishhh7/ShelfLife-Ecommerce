import permission from '../config/permission';
import { validate } from '../utils/validate';
import { createReviewSchema } from '../validation/reviewValidation';
import * as AuthController from '../controller/authController';
import * as ReviewController from '../controller/reviewController';
import express from 'express';

const router = express.Router({ mergeParams: true });
router.use(AuthController.protect);

router.get('/', ReviewController.getAllReviews);

router.get(
  '/my-reviews',
  AuthController.restrictTo(permission.review.GetAllMyReview),
  ReviewController.getAllMyReviews
);
router.post(
  '/:productId',
  AuthController.restrictTo(permission.review.CreateReview),
  validate(createReviewSchema),
  ReviewController.createReview
);

router.delete(
  '/:reviewId/delete',
  AuthController.restrictTo(permission.review.DeleteReview),
  ReviewController.deleteReview
);

export default router;