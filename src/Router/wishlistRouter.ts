import { validate } from '../utils/validate';
import {
  addToWishlist,
  removeFromWishlist,
} from '../validation/wishlistValidation';
import * as AuthController from '../controller/authController';
import * as WishlistController from '../controller/wishlistController';
import express from 'express';
import { Role } from '../generated/prisma/enums';

const router = express.Router();

router.use(AuthController.protect);
router.use(AuthController.restrictTo(Role.Customer));

router
  .route('/')
  .get(WishlistController.getAllMyWishlist)
  .post(validate(addToWishlist), WishlistController.addToWishlist);

router.delete(
  '/:productId',
  validate(removeFromWishlist),
  WishlistController.removeFromWishlist
);

export default router