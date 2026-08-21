import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import {sendResponse} from '../utils/sendResponse';
import prisma from '../config/prisma';
import * as addressService from '../service/addressService';

export const createAddress = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);

  if (!userId || isNaN(userId)) {
    return next(new AppError('Invalid or missing user ID', 400));
  }

  const address = await addressService.createAddress(
    userId,
    req.body
  );

  sendResponse(res, 201, address, 'Address created successfully');
});

export const updateAddress = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);
  const addressId = Number(req.params);

  if (!userId || isNaN(userId)) {
    return next(new AppError('Invalid or missing user ID', 400));
  }

  const updateAddress = await addressService.updateAddress(
    userId,
    addressId,
    req.body
  );

  sendResponse(
    res,
    200,
    updateAddress,
    'Address updated successfully'
  );
});

export const deleteAddress = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);
  const { addressId } = req.params;

  if (!userId || isNaN(userId) || isNaN(Number(addressId))) {
    return next(new AppError('Invalid user or address ID', 400));
  }

  await addressService.deleteAddress(userId, Number(addressId));
  sendResponse(res, 204, null, 'Address deleted successfully');
});

export const getAllAddress = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);

  if (!userId) {
    return next(new AppError('Invalid or missing user ID', 400));
  }
  const addresses = await prisma.address.findMany({
    where: {
      userId,
    },
  });

  sendResponse(res, 200, addresses);
});

export const setDefaultAddress = catchAsync(
  async (req, res, next) => {
    const userId = Number(req.user?.id);
    const { addressId } = req.params;

    if (!userId || isNaN(userId) || isNaN(Number(addressId))) {
      return next(new AppError('Invalid user or address ID', 400));
    }

    await addressService.setDefaultAddress(userId, Number(addressId));

    sendResponse(
      res,
      200,
      null,
      'Default address updated successfully'
    );
  }
);

export const getAddressbyId = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);
  const { addressId } = req.params;

  if (!userId || isNaN(userId) || isNaN(Number(addressId))) {
    return next(new AppError('Invalid user or address ID', 400));
  }

  const address = await prisma.address.findUnique({
    where: {
      id: Number(addressId),
      userId,
    },
  });

  sendResponse(res, 200, address);
});
