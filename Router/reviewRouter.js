import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as ReviewController from '../Controller/reviewController.js';

const router = express.Router({ mergeParams: true });

router.use(AuthController.protect);

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(
    AuthController.restrictTo(...permission.review.create),
    ReviewController.createReview
  );

router.get(
  '/vendor',
  AuthController.restrictTo(...permission.review.vendorReadAll),
  ReviewController.getAllVendorReviews
);

router.delete(
  '/:id',
  AuthController.restrictTo(...permission.review.delete),
  ReviewController.deleteReview
);

export default router;
