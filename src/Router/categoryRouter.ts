import express from 'express';
import permission from '../config/permission';
import * as AuthController from '../controller/authController';
import * as CategoryController from '../controller/categoryController';
import { validate } from '../utils/validate';
import * as ValidationCategory from '../validation/categoryValidation';

const router = express.Router();

router.get('/', CategoryController.getAllCategory);
router.get('/:categoryId', CategoryController.getCategoryById);

router.use(AuthController.protect);
router.post(
  '/',
  AuthController.restrictTo(permission.category.CreateCategory),
  validate(ValidationCategory.createCategorySchema),
  CategoryController.createCategory
);

router
  .route('/:categoryId')
  .patch(
    AuthController.restrictTo(permission.category.UpdateCategory),
    validate(ValidationCategory.updateCategorySchema),
    CategoryController.updateCategory
  )
  .delete(
    AuthController.restrictTo(permission.category.DeleteCategory),
    CategoryController.deleteCategory
  );

export default router;
     