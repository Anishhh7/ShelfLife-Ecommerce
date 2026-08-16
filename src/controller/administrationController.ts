import { type User } from '../generated/prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import sendResponse from '../utils/sendResponse';
import prisma from '../config/prisma';
import { hashPassword, sanitizeUser } from '../utils/authUtils';

export const createStaff = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, ...userData } = req.body;

  const hashedPassword = await hashPassword(password);

  const newStaff = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  const safeStaff = sanitizeUser(newStaff);

  sendResponse(res, 200, safeStaff, 'Staff created successfully');
});

export const getAllStaff = catchAsync(async (req, res, next) => {
  const staffLists = await prisma.user.findMany({
    where: {
      role: 'Staff',
    },
  });

  const staffs = staffLists.map(sanitizeUser);
  sendResponse(res, 200, staffs, { results: staffs.length });
});

export const getStaffbyId = catchAsync(async (req, res, next) => {
  const staffList = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!staffList) {
    return next(new AppError('No staff found with this id', 404));
  }

  const staff = sanitizeUser(staffList);

  sendResponse(res, 200, staff);
});

export const updateStaff = catchAsync(async (req, res, next) => {
  const { name, email, phone, active } = req.body;
  const staffId = Number(req.params.id);

  if (!staffId) {
    return next(new AppError('Invalid staff id', 400));
  }

  const staff = await prisma.user.update({
    where: {
      id: staffId,
    },
    data: {
      name,
      email,
      phone,
      active,
    },
  });

  sendResponse(res, 200, staff, 'Staff Updated Successfully');
});

export const deleteStaff = catchAsync(async (req, res, next) => {
  const staffId = Number(req.params.id);

  if (!staffId) {
    return next(new AppError('Invalid staff id', 400));
  }
  const staff = await prisma.user.delete({
    where: {
      id: staffId,
    },
  });
  sendResponse(res, 204, null, 'Staff deleted successfully');
});

export const getPendingVendors = catchAsync(
  async (req, res, next) => {
    const vendor = await prisma.user.findMany({
      where: {
        role: 'Vendor',
        approved: false,
      },
    });

    sendResponse(res, 200, vendor, { results: vendor.length });
  }
);

export const approvedVendors = catchAsync(async (req, res, next) => {
  const { approved } = req.body;
  const vendorId = Number(req.params.id);

  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
    },
  });

  if (!vendor) {
    return next(new AppError('Invalid vendor id', 404));
  }

  if (vendor.role !== 'Vendor') {
    return next(new AppError('User is not a vendor', 400));
  }
  if (vendor.approved) {
    return next(new AppError('Vendor is already approved', 400));
  }

  const updateVendor = await prisma.user.update({
    where: {
      id: vendorId,
    },
    data: { approved },
  });

  sendResponse(
    res,
    200,
    updateVendor,
    'Vendor approved successfully'
  );
});

export const getAllVendors = catchAsync(async (req, res, next) => {
  const vendor = await prisma.user.findMany({
    where: {
      role: 'Vendor',
      approved: true,
    },
  });
});
