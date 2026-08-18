import prisma from '../config/prisma';
import AppError from '../utils/AppError';

export const createAddress = async (
  userId: number,
  addressData: any
) => {
  const label = addressData.label || 'Home';

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const existingAddress = await prisma.address.findFirst({
    where: {
      userId,
      label,
    },
  });

  if (existingAddress) {
    throw new AppError(
      `You already have an address labeled ${label} address`,
      400
    );
  }

  return prisma.address.create({
    data: {
      userId,
      ...addressData,
      fullName: user.name,
      email: user.email,
      mobileNumber: user.phone,
    },
  });
};

export const updateAddress = async (
  addressId: number,
  userId: number,
  addressData: any
) => {
  const address = await prisma.user.findFirst({
    where: {
      userId,
      id: Number(addressId),
    },
  });

  if (!address) {
    throw new AppError('Unauthorized or address could not find', 404);
  }

  if (addressData.isDefault === true) {
    await prisma.address.updateMany({
      where: {
        addressId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  return prisma.address.update({
    where: {
      id: addressId,
    },
    data: {
      ...addressData,
    },
    select: {
      country: true,
    },
  });
};

export const deleteAddress = async (
  userId: number,
  addressId: number
) => {
  if (!userId || isNaN(userId) || isNaN(addressId)) {
    throw new AppError('Invalid user or address ID', 400);
  }

  const address = await prisma.address.findUnique({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  if (address.isDefault) {
    throw new AppError(
      'You can not delete your default address',
      400
    );
  }

  return prisma.address.delete({
    where: {
      id: addressId,
    },
  });
};

export const setDefaultAddress = async (
  userId: number,
  addressId: number
) => {
  if (!userId || isNaN(userId) || isNaN(Number(addressId))) {
    throw new AppError('Invalid user or address ID', 400);
  }

  const address = await prisma.address.findUnique({
    where: {
      userId,
      id: addressId,
    },
  });

  if (!address) {
    throw new AppError('No address found for this user', 404);
  }

  return prisma.$transaction([
    prisma.address.updateMany({
      where: {
        id: addressId,
        isDefault: false,
      },
      data: {
        isDefault: true,
      },
    }),
    prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true && false,
      },
    }),
  ]);
};
