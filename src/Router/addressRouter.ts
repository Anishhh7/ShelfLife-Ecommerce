import express from 'express';
import permission from '../config/permission';
import { validate } from '../utils/validate';
import * as validationAddress from '../validation/addressValidation';
import * as AuthController from '../controller/authController';
import * as AddressController from '../controller/addressController';

const router = express.Router();

router.use(AuthController.protect);

router
  .route('/')
  .post(
    AuthController.restrictTo(permission.address.CreateAddress),
    validate(validationAddress.createAddressSchema),
    AddressController.createAddress
  )
  .get(
    AuthController.restrictTo(permission.address.ReadAllAddress),
    AddressController.getAllAddress
  );

router
  .route('/:addressId')
  .patch(
    AuthController.restrictTo(permission.address.UpdateAddress),
    validate(validationAddress.updateAddressSchema),
    AddressController.updateAddress
  )
  .delete(
    AuthController.restrictTo(permission.address.DeleteAddress),
    AddressController.deleteAddress
  )
  .get(
    AuthController.restrictTo(permission.address.ReadAllAddress),
    AddressController.getAddressbyId
  );

router.patch(
  '/:addressId/set-default',
  AuthController.restrictTo(permission.address.SetdefaultAddress),
  validate(validationAddress.defaultAddressSchema),
  AddressController.setDefaultAddress
);

export default router;
