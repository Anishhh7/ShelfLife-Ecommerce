import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as ProductController from '../Controller/productController.js';
import reviewRouter from './reviewRouter.js';

const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router.get('/', ProductController.getAllProduct);
router.get('/:id', ProductController.getProductById);

router.use(AuthController.protect);

router.post(
  '/',
  AuthController.restrictTo(...permission.product.create),
  ProductController.createProduct
);

router
  .route('/:id')
  .patch(
    AuthController.restrictTo(...permission.product.create),
    ProductController.updateProduct
  )
  .delete(
    AuthController.restrictTo(...permission.product.create),
    ProductController.deleteProduct
  );

export default router;
