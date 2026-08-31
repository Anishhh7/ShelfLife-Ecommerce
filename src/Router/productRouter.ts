import express from 'express';
import upload from '../config/multer';
import permission from '../config/permission';
import * as AuthController from '../controller/authController';
import * as ProductController from '../controller/productController';
import { validate } from '../utils/validate';
import * as ValidationProduct from '../validation/productValidation';
import reviewRouter from './reviewRouter';

const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router.get('/', ProductController.getAllActiveProducts);
router.get('/:productId', ProductController.getActiveProductById);

router.use(AuthController.protect);

router.post(
  '/',
  AuthController.restrictTo(permission.product.CreateProduct),
  validate(ValidationProduct.createProductSchema),
  ProductController.createProduct
);

router.get(
  '/vendors/myProducts',
  AuthController.restrictTo(permission.product.ReadAllProduct),
  ProductController.getAllVendorProduct
);

router
  .route('/:productId')
  .patch(
    AuthController.restrictTo(permission.product.UpdateProduct),
    validate(ValidationProduct.updateProductSchema),
    ProductController.updateProduct
  )
  .delete(
    AuthController.restrictTo(permission.product.DeleteProduct),
    ProductController.deleteProduct
  );

router.post(
  '/:productId/images',
  AuthController.restrictTo(permission.product.uploadImages),
  upload.array('images', 5),
  ProductController.addProductImages
);

router.delete(
  '/:productId/images/delete',
  AuthController.restrictTo(permission.product.deleteImage),
  ProductController.removeProductImages
);

router.get(
  '/vendors/myProducts/:productId',
  AuthController.restrictTo(permission.product.ReadAllProduct),
  ProductController.getVendorProductById
);

export default router;
