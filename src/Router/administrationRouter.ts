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
  '/pending-vendors',
  AuthController.restrictTo(
    permission.administration.ReadPendingVendors
  ),
  AdministrationController.getPendingVendors
);

router.patch(
  '/:vendorId',
  AuthController.restrictTo(permission.administration.Approvval),
  validate(AdministrationValidation.approvedVendorSchema),
  AdministrationController.approvedVendors
);

router.get(
  '/vendors',
  AuthController.restrictTo(permission.administration.ReadVendor),
  AdministrationController.getAllVendors
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
  .delete(
    AuthController.restrictTo(permission.administration.DeleteStaff),
    AdministrationController.deleteStaff
  );

export default router;
