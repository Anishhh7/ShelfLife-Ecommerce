import * as AuthController from '../controller/authController';
import permission from '../config/permission';
import { validate } from '../utils/validate';
import * as ValidationOrder from '../validation/orderValidation';
import * as OrderController from '../controller/orderController';
import express from 'express';

const router = express.Router();

router.use(AuthController.protect);

router.post(
  '/',
  AuthController.restrictTo(permission.order.PlaceOrder),
  validate(ValidationOrder.placeOrderSchema),
  OrderController.placeOrder
);


export default router;