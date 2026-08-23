import { Role, type User } from '../generated/prisma/client';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { sendPage, sendResponse } from '../utils/sendResponse';
import prisma from '../lib/prisma';
import { hashPassword, sanitizeUser } from '../utils/authUtils';
import * as administrationService from '../service/administrationService';
import { logger } from '../lib/logger';

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

export const getAllStaff = catchAsync(async (req, res, _next) => {
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


export const getPendingVendors = catchAsync(
  async (req, res, next) => {
    const vendors = await administrationService.getAllPendingVendors(
      req.query
    );

    sendPage(res, 200, vendors);
  }
);

export const approvedVendors = catchAsync(async (req, res, next) => {
  const vendorId = Number(req.params.vendorId);

  const updateVendor =
    await administrationService.approvedVendors(vendorId);

  logger.info(
    { vendorId, approvedBy: req.user?.id },
    'Vendor Approved'
  );

  sendResponse(
    res,
    200,
    sanitizeUser(updateVendor),
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

const makeDeleteUser = (role: Role) =>
  catchAsync(async (req, res, next) => {
    const ids = [...new Set<number>(req.body.ids)];

    if (req.user && ids.includes(req.user.id)) {
      throw new AppError('You cannot delete your own account', 400);
    }
    const deletedIds = await administrationService.deleteUserByRole(
      role,
      ids
    );
    logger.warn(
      { role, deletedIds, deletedBy: req.user?.id },
      'users deleted'
    );

    res.sendStatus(204);
  });

export const deleteCustomers = makeDeleteUser('Customer');
export const deleteVendors = makeDeleteUser('Vendor');
export const deleteStaff = makeDeleteUser('Staff');