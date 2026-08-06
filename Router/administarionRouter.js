import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as AdministrationController from '../Controller/admistrationController.js';

const router = express.Router();

router.get(
  '/',
  AuthController.restrictTo(...permission.staff.create),
  AdministrationController.getAllAdministartion
);

router.post(
  '/create-staff',
  AuthController.restrictTo(...permission.staff.create),
  AdministrationController.createAdministartion
);

router
  .route('/pending-vendors')
  .get(
    AuthController.restrictTo(...permission.staff.create),
    AdministrationController.getPendingVendors
  );

router.patch(
  '/:id/approve',
  AuthController.restrictTo(...permission.staff.create),
  AdministrationController.approvedVendors
);

router
  .route('/:id')
  .get(
    AuthController.restrictTo(...permission.staff.create),
    AdministrationController.getAdministartionById
  )

  .patch(
    AuthController.restrictTo(...permission.staff.create),
    AdministrationController.updateAdministartion
  )
  .delete(
    AuthController.restrictTo(...permission.staff.create),
    AdministrationController.deleteAdministartion
  );

export default router;
