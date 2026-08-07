import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as WishlistController from '../Controller/wishlistController.js';
import { validate } from '../Utils/validate.js';
import * as WishlistValidation from '../Validation/wishlistValidation.js';

const router = express.Router();

router.use(AuthController.protect);

router
  .route('/')
  .get(
    AuthController.restrictTo(...permission.wishlist.readAll),
    WishlistController.getWishlist
  )
  .post(
    AuthController.restrictTo(...permission.wishlist.create),
    validate(WishlistValidation.addWishlistSchema),
    WishlistController.addToWishlist
  );

router.delete(
  '/:productId',
  AuthController.restrictTo(...permission.wishlist.remove),
  validate(WishlistValidation.wishlistParamSchema),
  WishlistController.removeFromWishlist
);

export default router;
