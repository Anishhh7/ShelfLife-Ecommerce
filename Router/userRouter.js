import express from 'express';
import * as AuthController from '../Controller/authController.js';
import { validate } from '../Utils/validate.js';
import * as AuthValidation from '../Validation/authValidation.js';
import permission from '../Config/permission.js';
import upload from '../Config/multer.js';

const router = express.Router();

router.post(
  '/signup',
  validate(AuthValidation.signUpSchema),
  AuthController.signUp
);
router.post(
  '/signin',
  validate(AuthValidation.loginSchema),
  AuthController.signIn
);
router.post(
  '/forgot-password',
  validate(AuthValidation.forgotPasswordSchema),
  AuthController.forgotPassword
);
router.patch(
  '/resetPassword',
  validate(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword
);
router.post('/refresh', AuthController.refresh);

router.use(AuthController.protect);

router.post('/logout', AuthController.logout);
router.patch(
  '/updateMyPassword',
  validate(AuthValidation.updatePasswordSchema),
  AuthController.updatePassword
);

router.patch(
  '/me/profile-image',
  AuthController.restrictTo('customer'),
  upload.single('image'),
  AuthController.changeUserProfile
);

export default router;
