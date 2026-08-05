import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import sendResponse from '../Utils/sendResponse.js';
import AddressBook from '../Model/addressBookModel.js';
import User from '../Model/userModel.js';

export const createAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('Invalid User', 404));
  }

  if (req.body.isDefault === true) {
    await AddressBook.updateMany(
      { user: req.user.id, isDefault: true },
      { isDefault: false }
    );
  }

  const address = await AddressBook.create({
    ...req.body,
    user: req.user.id,
  });

  sendResponse(
    res,
    201,
    address,
    `${user.name} your address has been saved successfully`
  );
});

export const getMyAddresses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('Invalid User', 404));
  }

  const addresses = await AddressBook.find({ user: req.user.id });

  sendResponse(res, 200, addresses);
});

export const updateAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('Invalid User', 404));
  }

  if (req.body.isDefault === true) {
    await AddressBook.updateMany(
      { user: req.user.id, isDefault: true },
      { isDefault: false }
    );
  }

  const address = await AddressBook.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!address) {
    return next(
      new AppError('No address found with that Id for this user', 404)
    );
  }

  sendResponse(res, 200, address, 'Address updated successfully');
});

export const deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('Invalid User', 404));
  }

  const address = await AddressBook.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!address) {
    return next(
      new AppError('No address found with that Id for this user', 404)
    );
  }

  if (address.isDefault) {
    const nextAddress = await AddressBook.findOne({
      user: req.user.id,
    }).sort({ updatedAt: -1 });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  sendResponse(res, 204, null, 'Address deleted successfully');
});

export const setDefaultAddress = catchAsync(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('Invalid User', 404));
    }

    await AddressBook.updateMany(
      {
        user: req.user.id,
        isDefault: true,
      },
      {
        isDefault: false,
      }
    );

    const address = await AddressBook.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      { isDefault: true },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!address) {
      return next(
        new AppError(
          'No address found with that ID for this user',
          404
        )
      );
    }

    sendResponse(
      res,
      200,
      address,
      'Default address set successfully'
    );
  }
);
