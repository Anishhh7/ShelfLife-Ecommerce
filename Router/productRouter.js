import express from "express";
import permission from "../Config/permission.js";
import * as AuthController from "../Controller/authController.js";
import * as ProductController from "../Controller/productController.js";

const router = express.Router();

router.route("/").get(ProductController.getAllProduct);
router.route("/:id").get(ProductController.getProductById);

router.use(AuthController.protect);

router
 .route("/")
 .post(
  AuthController.restrictTo(...permission.product.create),
  ProductController.createProduct
 );

router
 .route("/:id")
 .patch(
  AuthController.restrictTo(...permission.product.create),
  ProductController.updateProduct
 )
 .delete(
  AuthController.restrictTo(...permission.product.create),
  ProductController.deleteProduct
 );

export default router;
