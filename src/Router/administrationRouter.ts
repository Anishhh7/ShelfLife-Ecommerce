import { validate } from '../utils/validate';
import * as AdministrationValidation from '../validation/administrationValidation';
import * as AuthController from '../controller/authController';
import permission from '../config/permission';
import * as AdministrationController from '../controller/administrationController';
import express, { Router } from 'express';

const router = Router();

router.use(AuthController.protect);

router.get(
  '/',
  AuthController.restrictTo(permission.administration.ReadAllStaff),
  AdministrationController.getAllStaff
);

router.post(
  '/create',
  AuthController.restrictTo(permission.administration.CreateStaff),
  validate(AdministrationValidation.createStaffSchema),
  AdministrationController.createStaff
);

router.get(
  '/customers',
  AuthController.restrictTo(
    permission.administration.ReadAllCustomers
  ),
  AdministrationController.getAllCustomers
);

router.get(
  '/pending-vendors',
  AuthController.restrictTo(
    permission.administration.ReadPendingVendors
  ),
  AdministrationController.getPendingVendors
);

router.patch(
  '/:vendorId/approved',
  AuthController.restrictTo(permission.administration.Approval),
  validate(AdministrationValidation.approvedVendorSchema),
  AdministrationController.approvedVendors
);

router.get(
  '/vendors',
  AuthController.restrictTo(permission.administration.ReadVendor),
  AdministrationController.getAllApprovedVendors
);

router.delete(
  '/customers',
  AuthController.restrictTo(permission.administration.DeleteCustomer),
  validate(AdministrationValidation.deleteUsersSchema),
  AdministrationController.deleteCustomers
);

router.delete(
  '/vendors',
  AuthController.restrictTo(permission.administration.DeleteVendor),
  validate(AdministrationValidation.deleteUsersSchema),
  AdministrationController.deleteVendors
);

router.delete(
  '/staff',
  AuthController.restrictTo(permission.administration.DeleteStaff),
  validate(AdministrationValidation.deleteUsersSchema),
  AdministrationController.deleteStaff
);

router
  .route('/:id')
  .get(
    AuthController.restrictTo(permission.administration.ReadAllStaff),
    AdministrationController.getStaffbyId
  )
  .patch(
    AuthController.restrictTo(permission.administration.UpdateStaff),
    validate(AdministrationValidation.updateStaffSchema),
    AdministrationController.updateStaff
  )

export default router;
