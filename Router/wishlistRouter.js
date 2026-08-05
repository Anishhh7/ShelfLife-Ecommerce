import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as WishlistController from '../Controller/wishlistController.js';

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
    WishlistController.addToWishlist
  );

router.delete(
  '/:productId',
  AuthController.restrictTo(...permission.wishlist.remove),
  WishlistController.removeFromWishlist
);


export default router;