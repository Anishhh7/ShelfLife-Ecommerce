import prisma from '../config/prisma';
import AppError from '../utils/AppError';
import { userQuery } from '../query/userQuery';

export const approvedVendors = async (vendorId: number) => {
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
    },
  });

  if (!vendor) {
    throw new AppError('Invalid vendor id', 404);
  }

  if (vendor.role !== 'Vendor') {
    throw new AppError('User is not a vendor', 400);
  }

  if (vendor.approved === true) {
    throw new AppError('Vendor is already approved', 400);
  }

  return prisma.user.update({
    where: {
      id: vendorId,
      approved: false,
    },
    data: {
      approved: true,
    },
  });
};

export const getAllAdministration = async (query: unknown) => {
  return userQuery.list( query, {role:'Staff'}  );
};

export const getAllVendors = async (query: unknown) => {
  return userQuery.list(query, { role: 'Vendor', approved: true });
};
export const getAllPendingVendors = async (query: unknown) => {
  return userQuery.list(query, { role: 'Vendor', approved: false });
};
