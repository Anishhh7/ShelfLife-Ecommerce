import { Router } from 'express';
import * as PaymentController from '../controller/paymentController';
import { validate } from '../utils/validate';
import { checkOutSchema } from '../validation/paymentValidation';

const router = Router();

router.post(
  '/checkout',
  validate(checkOutSchema),
  PaymentController.createCheckoutSession
);

export default router;
