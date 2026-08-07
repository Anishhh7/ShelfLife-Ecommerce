import express from 'express';
import * as AuthController from '../Controller/authController.js';
import permission from '../Config/permission.js';
import * as CategoryController from '../Controller/categoryController.js';
import { validate } from '../Utils/validate.js';
import * as CategoryValidation from '../Validation/categoryValidation.js';

const router = express.Router();

router.get('/', CategoryController.getAllCategory);

router.get('/:id', CategoryController.getCategoryById);

router.use(AuthController.protect);

router.post(
  '/',
  AuthController.restrictTo(...permission.category.create),
  validate(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

router
  .route('/:id')
  .patch(
    AuthController.restrictTo(...permission.category.update),
    validate(CategoryValidation.updateCategorySchema),
    CategoryController.updateCategory
  )
  .delete(
    AuthController.restrictTo(...permission.category.delete),
    CategoryController.deleteCategory
  );

export default router;
