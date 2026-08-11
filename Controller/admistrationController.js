import User from '../Model/userModel.js';
import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import sendResponse from '../Utils/sendResponse.js';
import { changeCloudinaryImage } from '../Utils/uploadToCloudinary.js';

const filterObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const createAdministraation = catchAsync(
  async (req, res, next) => {
    const administration = await User.create({
      ...req.body,
    });

    sendResponse(
      res,
      201,
      administration,
      'Administration created successfully'
    );
  }
);

export const getAllAdministration = catchAsync(
  async (req, res, next) => {
    const administration = await User.find({ role: 'staff' });

    sendResponse(res, 200, administration, {
      results: administration.length,
    });
  }
);

export const getAdministrationById = catchAsync(
  async (req, res, next) => {
    const administration = await User.findById(req.params.id);

    if (!administration) {
      return next(
        new AppError('No administration found with this Id', 404)
      );
    }

    sendResponse(res, 200, administartion);
  }
);

export const updateAdministration = catchAsync(
  async (req, res, next) => {
    const filterBody = filterObj(
      req.body,
      'name',
      'email',
      'role',
      'active'
    );

    const administration = await User.findByIdAndUpdate(
      req.params.id,
      filterBody,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!administration) {
      return next(
        new AppError('No administration found with this Id', 404)
      );
    }

    sendResponse(
      res,
      200,
      administration,
      'Administration updated successfully'
    );
  }
);

export const deleteAdministration = catchAsync(
  async (req, res, next) => {
    const administration = await User.findByIdAndDelete(
      req.params.id
    );

    if (!administration) {
      return next(
        new AppError('No administration found with this Id', 404)
      );
    }

    sendResponse(
      res,
      204,
      null,
      'Administration deleted successfully'
    );
  }
);

export const getPendingVendors = catchAsync(
  async (req, res, next) => {
    const vendor = await User.find({
      role: 'vendor',
      approved: false,
    });

    sendResponse(res, 200, vendor, undefined, {
      results: vendor.length,
    });
  }
);

export const approvedVendors = catchAsync(async (req, res, next) => {
  const vendor = await User.findById(req.params.id);

  if (!vendor) {
    return next(new AppError('No vendor found with this ID', 404));
  }

  if (vendor.role !== 'vendor') {
    return next(new AppError('User is not a vendor', 400));
  }

  if (vendor.approved) {
    return next(new AppError('Vendor is already approved', 400));
  }

  const updatedVendor = await User.findByIdAndUpdate(
    req.params.id,
    { approved: req.body.approved },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  sendResponse(
    res,
    200,
    updatedVendor,
    'Vendor approved updated successfully'
  );
});

export const getAllvendors = catchAsync(async (req, res, next) => {
  const vendor = await User.find({ role: 'vendor' });

  sendResponse(res, 200, vendor, {
    results: vendor.length,
  });
});

export const changeVendorImage = catchAsync(
  async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    const vendor = await User.findById(req.user.id);

    if (!vendor) {
      return next(new AppError('Vendor not found', 404));
    }

    const newImage = await changeCloudinaryImage(
      vendor.vendorImage?.publicId,
      req.file,
      'shelflife/vendors'
    );

    vendor.vendorImage = newImage;

    await vendor.save();

    sendResponse(
      res,
      200,
      newImage,
      'Vendor image updated successfully'
    );
  }
);

export const changeStaffImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const staff = await User.findById(req.user.id);

  if (!staff) {
    return next(new AppError('Vendor not found', 404));
  }

  const newImage = await changeCloudinaryImage(
    staff.staffImage?.publicId,
    req.file,
    'shelflife/administration'
  );

  staff.staffImage = newImage;

  await staff.save();

  sendResponse(
    res,
    200,
    newImage,
    'Staff image updated successfully'
  );
});
