import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import sendResponse from '../utils/sendResponse';
import prisma from '../config/prisma';
import { Label } from '../generated/prisma/enums';

export const createAddress = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);

  if (!userId || isNaN(userId)) {
    return next(new AppError('Invalid or missing user ID', 400));
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return next(new AppError('Invalid user id', 404));
  }

  const existingAddress = await prisma.address.findFirst({
    where: {
      id: userId,
      label: req.body.label,
    },
  });

  if (existingAddress) {
    return next(
      new AppError(
        `You already have a ${req.body.label} address`,
        400
      )
    );
  }

  const address = await prisma.address.create({
    data: {
      userId,
      fullName: user.name,
      email: user.email,
      mobileNumber: user.phone,
      ...req.body,
    },
  });

  sendResponse(res, 201, address, 'Address created successfully');
});

export const updateAddress = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);
  const { addressId } = req.params;
  const { fullName, email, mobileNumber, ...addressData } = req.body;

  if (!userId) {
    return next(new AppError('Invalid or missing user ID', 400));
  }

  const addressToUpdate = await prisma.user.findFirst({
    where: {
      id: Number(addressId),
      userId,
    },
  });

  if (!addressToUpdate) {
    return next(
      new AppError('Address not found or unauthorized', 404)
    );
  }

  if (req.body.isDefault === true) {
    await prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const updateAddress = await prisma.address.update({
    where: {
      id: Number(addressId),
    },
    data: {
      fullName,
      email,
      ...addressData,
    },
    select: {
      country: true,
    },
  });

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

  const address = await prisma.address.findUnique({
    where: {
      id: Number(addressId),
      userId,
    },
  });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  if (address?.isDefault) {
    return next(
      new AppError('You can not delete your default address', 400)
    );
  }

  await prisma.address.delete({
    where: {
      id: Number(addressId),
    },
  });

  sendResponse(res, 204, null, 'Address deleted successfully');
});

export const getAllAddress = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);

  if (!userId) {
    return next(new AppError('Invalid or missing user ID', 400));
  }
  const addresses = await prisma.address.findMany({
    where: {
      id: userId,
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

    const address = await prisma.user.findUnique({
      where: {
        id: Number(addressId),
        userId,
      },
    });

    if (!address) {
      return next(
        new AppError(
          'No address found with that ID for this user',
          404
        )
      );
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          id: Number(addressId),
          isDefault: false,
        },
        data: {
          isDefault: true,
        },
      }),
      prisma.address.update({
        where: { id: Number(addressId) },
        data: { isDefault: true },
      }),
    ]);

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
  const addressId = Number(req.params);

  if (!userId || isNaN(userId) || isNaN(Number(addressId))) {
    return next(new AppError('Invalid user or address ID', 400));
  }

  const address = await prisma.address.findUnique({
    where: {
      id: addressId,
      userId,
    },
  });

  sendResponse(res, 200, address);
});
