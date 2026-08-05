import express from 'express';
import permission from '../Config/permission.js';
import * as AuthController from '../Controller/authController.js';
import * as AddressBookController from '../Controller/addressBookController.js';

const router = express.Router();

router.use(AuthController.protect);

router
  .route('/')
  .get(
    AuthController.restrictTo(...permission.address.readAll),
    AddressBookController.getMyAddresses
  )
  .post(
    AuthController.restrictTo(...permission.address.create),
    AddressBookController.createAddress
  );

router
  .route('/:id')
  .patch(
    AuthController.restrictTo(...permission.address.update),
    AddressBookController.updateAddress
  )
  .delete(
    AuthController.restrictTo(...permission.address.delete),
    AddressBookController.deleteAddress
  );

router.patch(
  '/:id/set-default',
  AuthController.restrictTo(...permission.address.setDefault),
  AddressBookController.setDefaultAddress
);

export default router;
