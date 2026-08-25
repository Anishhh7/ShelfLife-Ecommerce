import * as AuthController from '../controller/authController';
import permission from '../config/permission';
import { validate } from '../utils/validate';
import * as ValidationOrder from '../validation/orderValidation';
import * as OrderController from '../controller/orderController';
import express from 'express';

const router = express.Router();

router.use(AuthController.protect);

router.post(
  '/',
  AuthController.restrictTo(permission.order.PlaceOrder),
  validate(ValidationOrder.placeOrderSchema),
  OrderController.placeOrder
);

router.get(
  '/all',
  AuthController.restrictTo(...permission.order.ReadAll),
  OrderController.getAllOrders
);

router.get(
  '/vendor-orders',
  AuthController.restrictTo(permission.order.ReadVendorOrders),
  OrderController.getAllVendorOrders
);

router.get(
  '/my-orders',
  AuthController.restrictTo(permission.order.ReadMyOrders),
  OrderController.getAllMyOrders
);

router.get(
  '/:orderId/track-order',
  AuthController.restrictTo(...permission.order.TrackOrder),
  OrderController.getTrackingOrder
);

router.patch(
  '/:orderId/cancel',
  AuthController.restrictTo(...permission.order.CancelOrder),
  OrderController.cancelOrder
);

router.patch(
  '/items/:itemId/status-vendor',
  AuthController.restrictTo(permission.order.UpdateVendorStatus),
  validate(ValidationOrder.vendorUpdateItemStatusSchema),
  OrderController.updateVendorStatus
);
router.patch(
  '/items/:itemId/status',
  AuthController.restrictTo(...permission.order.UpdateAdminStatus),
  validate(ValidationOrder.adminUpdateItemStatusSchema),
  OrderController.updateAdminStatus
);

export default router;
