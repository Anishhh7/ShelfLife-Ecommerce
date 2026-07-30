import permission from '../Config/permission.js';
import * as AdministrationController from '../Controller/admistrationController.js';
import * as AuthController from '../Controller/authController.js';
import express from 'express';

const router = express.Router();

router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/forgot-password', AuthController.forgotPassword);
router.patch('/resetPassword', AuthController.resetPassword);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.protect, AuthController.logout);

router.use(AuthController.protect);

router
  .route('/updateMyPassword')
  .patch(AuthController.updatePassword);

router
  .route('/')
  .post(
    AuthController.restrictTo(...permission.staff.create),
    AdministrationController.createAdministartion
  )
  .get(
    AuthController.restrictTo(...permission.staff.create),
    AdministrationController.getAllAdministartion
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
