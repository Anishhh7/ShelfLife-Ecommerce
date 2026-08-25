import catchAsync from '../utils/catchAsync';
import { sendPage, sendResponse } from '../utils/sendResponse';
import * as orderService from '../service/orderService';

export const placeOrder = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);
  const { addressId, cartItemsIds, paymentMethod } = req.body;

  const order = await orderService.placeOrder(
    userId,
    addressId,
    cartItemsIds,
    paymentMethod
  );

  sendResponse(res, 201, order, 'Your order has been created');
});

export const cancelOrder = catchAsync(async (req, res, next) => {
  const orderId = Number(req.params.id);
  const userId = Number(req.user?.id);

  const order = await orderService.canCancel(orderId, userId);

  sendResponse(
    res,
    200,
    order,
    'Your order has been cancelled successfully'
  );
});

export const getTrackingOrder = catchAsync(async (req, res, next) => {
  const orderId = Number(req.params.orderId);
  const userId = Number(req.user?.id);

  const orderTracking = await orderService.getOrderTracking(
    orderId,
    userId
  );

  sendResponse(res, 200, orderTracking);
});

export const updateAdminStatus = catchAsync(
  async (req, res, next) => {
    const userId = Number(req.user?.id)
    const itemId = Number(req.params.itemId);
    const { status } = req.body;

    const updateOrder = await orderService.updateAdminItemStatus(
      itemId,
      userId,
      status
    );
    sendResponse(res, 200, updateOrder);
  }
);

export const updateVendorStatus = catchAsync(
  async (req, res, next) => {
    const vendorId = Number(req.user?.id);
    const itemId = Number(req.params.itemId);
    const { status } = req.body;

    const updateOrder = await orderService.updateVendorItemStatus(
      vendorId,
      itemId,
      status
    );
    sendResponse(res, 200, updateOrder);
  }
);

export const getAllMyOrders = catchAsync(async (req, res) => {
  const userId = Number(req.user?.id);

  const myOrders = await orderService.getAllMyOrders(
    userId,
    req.query
  );

  sendPage(res, 200, myOrders);
});

export const getAllVendorOrders = catchAsync(async (req, res) => {
  const vendorId = Number(req.user?.id);

  const vendorOrders = await orderService.getAllVendorOrders(
    vendorId,
    req.query
  );
  sendPage(res, 200, vendorOrders);
});

export const getAllOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getAllOrders(req.query);
  sendPage(res, 200, orders);
});
