import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { sendResponse } from '../utils/sendResponse';
import * as orderService from '../service/orderService';
import { logger } from '../lib/logger';

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
