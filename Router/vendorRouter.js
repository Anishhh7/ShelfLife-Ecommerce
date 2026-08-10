import express from 'express';
import * as AuthController from '../Controller/authController.js';
import * as AdministrationController from '../Controller/admistrationController.js';
import upload from '../Config/multer.js';

const router = express.Router();

router.use(AuthController.protect);

router.patch(
  '/me/vendor-image',
  AuthController.restrictTo('vendor'),
  upload.single('image'),
  AdministrationController.changeVendorImage
);

export default router;
