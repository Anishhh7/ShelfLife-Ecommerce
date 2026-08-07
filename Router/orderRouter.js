import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as OrderController from '../Controller/orderController.js';
import { validate } from '../Utils/validate.js';
import * as OrderValidation from '../Validation/orderValidation.js';

const router = express.Router();

router.use(AuthController.protect);

router.post(
  '/',
  validate(OrderValidation.placeOrderSchema),
  OrderController.placeOrder
);

router.get(
  '/my-orders',
  AuthController.restrictTo(...permission.order.myOrders),
  OrderController.getMyOrders
);

router.get(
  '/vendor-orders',
  AuthController.restrictTo(...permission.order.vendorOrder),
  OrderController.getVendorOrders
);

router.get(
  '/all',
  AuthController.restrictTo(...permission.order.readAll),
  OrderController.getAllOrders
);

router.patch(
  '/:orderId/cancel',
  AuthController.restrictTo(...permission.order.cancel),
  OrderController.cancelOrder
);

router.patch(
  '/:orderId/items/:itemId/vendor-status',
  AuthController.restrictTo(...permission.order.updateVendorStatus),
  validate(OrderValidation.updateVendorItemStatusSchema),
  OrderController.updateVendorItemStatus
);
router.patch(
  '/:orderId/items/:itemId/status',
  AuthController.restrictTo(...permission.order.updateAdminStatus),
  validate(OrderValidation.adminItemStatusSchema),
  OrderController.updateAdminItemStatus
);

router.get('/:id/tracking', OrderController.getOrderTracking);

export default router;
