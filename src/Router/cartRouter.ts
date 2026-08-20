import express from 'express';
import permission from '../config/permission';
import { validate } from '../utils/validate';
import * as AuthController from '../controller/authController';
import * as CartController from '../controller/cartController';
import * as ValidationCart from '../validation/cartValidation';

const router = express.Router();

router.use(AuthController.protect);

router.get(
  '/',
  AuthController.restrictTo(permission.cart.RealAll),
  CartController.getCart
);

router
  .route('/items')
  .post(
    AuthController.restrictTo(permission.cart.AddToCart),
    validate(ValidationCart.createCartSchema),
    CartController.addToCart
  );

router.delete(
  '/:userId/items',
  AuthController.restrictTo(permission.cart.RemoveFromCart),
  validate(ValidationCart.removeItemsSchema),
  CartController.removeItemsFromCart
);

router.patch(
  '/items/:itemId',
  AuthController.restrictTo(permission.cart.UpdateCart),
  validate(ValidationCart.updateCartSchema),
  CartController.updateCart
);

export default router;
