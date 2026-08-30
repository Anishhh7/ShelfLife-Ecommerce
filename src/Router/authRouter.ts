import express, { Router } from 'express';
import * as AuthController from '../controller/authController';
import * as AuthValidation from '../validation/authValidation';
import { validate } from '../utils/validate';

const router = Router();

router.post(
  '/signup',
  validate(AuthValidation.signUpSchema),
  AuthController.signUp
);

router.post(
  '/login',
  validate(AuthValidation.loginSchema),
  AuthController.signin
);

router.post('/forgot-password', AuthController.forgotPassword);

export default router;
