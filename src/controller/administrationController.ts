import { type User } from '../generated/prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { sendPage, sendResponse } from '../utils/sendResponse';
import prisma from '../lib/prisma';
import { hashPassword, sanitizeUser } from '../utils/authUtils';
import * as administrationService from '../service/administrationService';

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
  const staffs = await administrationService.getAllAdministration(
    req.query
  );

  sendPage(res, 200, staffs);
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
    const vendors = await administrationService.getAllPendingVendors(
      req.query
    );

    sendPage(res, 200, vendors);
  }
);

export const approvedVendors = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  const updateVendor = await administrationService.approvedVendors(
    Number(vendorId)
  );

  const vendorDetails = sanitizeUser(updateVendor);

  sendResponse(
    res,
    200,
    vendorDetails,
    'Vendor approved successfully'
  );
});

export const getAllApprovedVendors = catchAsync(
  async (req, res, next) => {
    const vendors = await administrationService.getAllVendors(
      req.query
    );

    sendPage(res, 200, vendors);
  }
);

export const getAllCustomers = catchAsync(async (req, res) => {
  const customers = await administrationService.getAllCustomers(
    req.query
  );

  sendPage(res, 200, customers);
});

export const deleteCustomers = catchAsync(async (req, res, next) => {
  const { customerIds } = req.body;

  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    return next(new AppError('Customer IDs are required', 400));
  }

  const customers = await prisma.user.findMany({
    where: {
      id: { in: customerIds },
      role: 'Customer',
    },
    select: {
      id: true,
    },
  });

  if (customers.length === 0) {
    return next(new AppError('No valid customers found', 404));
  }

  const validCustomerIds = customers.map((customer) => customer.id);

  await prisma.$transaction(async (tx) => {
    await tx.address.deleteMany({
      where: {
        userId: { in: validCustomerIds },
      },
    });

    await tx.user.deleteMany({
      where: {
        id: { in: validCustomerIds },
        role: 'Customer',
      },
    });
  });

  sendResponse(res, 204, null);
});
