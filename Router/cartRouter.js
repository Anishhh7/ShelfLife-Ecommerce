import express, { Router } from 'express';
import * as AuthController from '../Controller/authController.js';
import * as CartController from '../Controller/cartController.js';
import { validate } from '../Utils/validate.js';
import * as CartValidation from '../Validation/cartValidation.js';

const router = express.Router();

router.use(AuthController.protect);

router
  .route('/')
  .get(CartController.getCart)
  .post(
    validate(CartValidation.addCartSchema),
    CartController.addToCart
  );

router.delete(
  '/items',
  validate(CartValidation.removeMultipleCartItemsSchema),
  CartController.removeMultipleCartItems
);

router
  .route('/item/:productId')
  .patch(
    validate(CartValidation.updateCartSchema),
    CartController.updateCartItem
  )
  .delete(CartController.removeCartItem);

export default router;
