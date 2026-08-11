import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as AdministrationController from '../Controller/admistrationController.js';
import { validate } from '../Utils/validate.js';
import * as AuthValidation from '../Validation/administrationValidate.js';
import upload from '../Config/multer.js';
import { ImageFiledSchema } from '../Utils/fileValidation.js';

const router = express.Router();
router.use(AuthController.protect);

router.get(
  '/',
  AuthController.restrictTo(...permission.staff.readAll),
  AdministrationController.getAllAdministration
);

router.get(
  '/all-vendors',
  AuthController.restrictTo(...permission.staff.readAll),
  AdministrationController.getAllvendors
);

router.post(
  '/create-staff',
  AuthController.restrictTo(...permission.staff.create),
  validate(AuthValidation.createStaffSchema),
  AdministrationController.createAdministraation
);

router.patch(
  '/staff/change-profile-picture',
  AuthController.restrictTo(...permission.staff.changeImage),
  upload.single('image'),
  validate(ImageFiledSchema, 'file'),
  AdministrationController.changeStaffImage
);

router
  .route('/pending-vendors')
  .get(
    AuthController.restrictTo(...permission.staff.getvendor),
    AdministrationController.getPendingVendors
  );

router.patch(
  '/:id/approve',
  AuthController.restrictTo(...permission.staff.vendorApprove),
  validate(AuthValidation.approvedVendorSchema),
  AdministrationController.approvedVendors
);

router
  .route('/:id')
  .get(
    AuthController.restrictTo(...permission.staff.readAll),
    AdministrationController.getAdministrationById
  )

  .patch(
    AuthController.restrictTo(...permission.staff.update),
    validate(AuthValidation.updateStaffSchema),
    AdministrationController.updateAdministration
  )
  .delete(
    AuthController.restrictTo(...permission.staff.delete),
    AdministrationController.deleteAdministration
  );

export default router;
