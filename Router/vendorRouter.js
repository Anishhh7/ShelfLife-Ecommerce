import express from 'express';
import * as AuthController from '../Controller/authController.js';
import * as AdministrationController from '../Controller/admistrationController.js';
import upload from '../Config/multer.js';
import { validate } from '../Utils/validate.js';
import  {ImageFiledSchema}  from '../Utils/fileValidation.js';

const router = express.Router();

router.use(AuthController.protect);

router.patch(
  '/me/vendor-image',
  AuthController.restrictTo('vendor'),
  upload.single('image'),
  validate(ImageFiledSchema, 'file'),
  AdministrationController.changeVendorImage
);

export default router;
