import express, { Router } from 'express';
import * as AuthController from '../Controller/authController.js';
import * as CartController from '../Controller/cartController.js';

const router = express.Router();

router.use(AuthController.protect);

router
  .route('/')
  .get(CartController.getCart)
  .post(CartController.addToCart)
  .delete(CartController.clearCart);

router
  .route('/:productId')
  .patch(CartController.updateCartItem)
  .delete(CartController.removeCartItem);


export default router;