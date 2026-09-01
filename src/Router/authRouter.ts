import { Router } from 'express';
import upload from '../config/multer';
import * as AuthController from '../controller/authController';
import { validate } from '../utils/validate';
import * as AuthValidation from '../validation/authValidation';

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

router.use(AuthController.protect);

router.patch(
  '/change-profile-image',
  upload.single('image'),
  AuthController.changeProfilePhoto
);

export default router;
