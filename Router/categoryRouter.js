import express from 'express';
import * as AuthController from '../Controller/authController.js';
import permission from '../Config/permission.js';
import * as CategoryController from '../Controller/categoryController.js';

const router = express.Router();

router.get('/', CategoryController.getAllCategory);

router.get('/:id', CategoryController.getCategoryById);

router.use(AuthController.protect);

router.post(
  '/',
  AuthController.restrictTo(...permission.category.create),
  CategoryController.createCategory
);

router
  .route('/:id')
  .patch(
    AuthController.restrictTo(...permission.category.update),
    CategoryController.updateCategory
  )
  .delete(
    AuthController.restrictTo(...permission.category.delete),
    CategoryController.deleteCategory
  );

export default router;
