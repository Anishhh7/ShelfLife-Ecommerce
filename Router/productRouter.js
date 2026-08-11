import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as ProductController from '../Controller/productController.js';
import reviewRouter from './reviewRouter.js';
import { validate } from '../Utils/validate.js';
import * as ProductValidation from '../Validation/productValidation.js';
import upload from '../Config/multer.js';
import * as FileValidation from '../Utils/fileValidation.js';

const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router.get('/', ProductController.getAllProduct);
router.get('/:id', ProductController.getProductById);

router.use(AuthController.protect);

router.post(
  '/',
  AuthController.restrictTo(...permission.product.create),
  upload.array('images', 5),
  validate(FileValidation.multipleImagesSchema, 'file'),
  validate(ProductValidation.createProductSchema),
  ProductController.createProduct
);

router.post(
  '/:productId/images',
  AuthController.restrictTo(...permission.product.update),
  upload.array('images', 5),
  validate(FileValidation.multipleImagesSchema, 'file'),
  ProductController.addProductImages
);

router.delete(
  '/:productId/images',
  AuthController.restrictTo(...permission.product.delete),
  ProductController.removeProductImages
);

router
  .route('/:id')
  .patch(
    AuthController.restrictTo(...permission.product.update),
    validate(ProductValidation.updateProductSchema),
    ProductController.updateProduct
  )
  .delete(
    AuthController.restrictTo(...permission.product.delete),
    ProductController.deleteProduct
  );

export default router;
