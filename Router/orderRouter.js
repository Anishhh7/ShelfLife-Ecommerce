import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as OrderController from '../Controller/orderController.js';

const router = express.Router();

router.use(AuthController.protect);

router.route('/').post(OrderController.placeOrder);

router.route('/my-orders').get(
  AuthController.restrictTo(...permission.order.myOrders),
  OrderController.getMyOrders
);

router.route('/vendor-orders').get(
  AuthController.restrictTo(...permission.order.vendorOrder),
  OrderController.getVendorOrders
);

router.route('/all').get(
  AuthController.restrictTo(...permission.order.readAll),
  OrderController.getAllOrders
);

router.route('/:orderId/items/:itemId').patch(
  AuthController.restrictTo(...permission.order.updateStatus),
  OrderController.updateItemStatus
);

export default router;