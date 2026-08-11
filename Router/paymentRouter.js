import express from 'express';
import * as AuthController from '../Controller/authController.js';
import * as PaymentController from '../Controller/paymentController.js';
import { validate } from '../Utils/validate.js';
import * as PaymentValidation from '../Validation/paymentValidation.js';

const router = express.Router();

router.use(AuthController.protect);

router.post(
  '/checkout',
  validate(PaymentValidation.checkoutSchema),
  PaymentController.createCheckoutSession
);

export default router;
