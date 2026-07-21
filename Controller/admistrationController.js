import User from "../Model/userModel.js";
import catchAsync from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";
import sendResponse from "../Utils/sendResponse.js";
import { truncates } from "bcryptjs";

const filterObj = (obj, ...allowFields) => {
 const newObj = {};
 Object.keys(obj).forEach((el) => {
  if (allowFields.includes(el)) newObj[el] = obj[el];
 });
 return newObj;
};

export const createAdministartion = catchAsync(async (req, res, next) => {
 const { name, email, password, role } = req.body;

 if (!["staff"].includes(role)) {
  return next(new AppError("Permission Denied", 401));
 }

 const administartion = await User.create({
  name,
  email,
  password,
  role
 });

 sendResponse(res, 201, administartion, "Administartion created successfully");
});

export const getAllAdministartion = catchAsync(async (req, res, next) => {
 const administartion = await User.find();

 sendResponse(res, 200, administartion, undefined, {
  results: administartion.length
 });
});

export const getAdministartionById = catchAsync(async (req, res, next) => {
 const administartion = await User.findById(req.params.id);

 if (!administartion) {
  return next(new AppError("No administartion found with this Id", 404));
 }

 sendResponse(res, 200, administartion);
});

export const updateAdministartion = catchAsync(async (req, res, next) => {
 if (req.body.role && !["staff"].includes(req.body.role)) {
  return next(new AppError("Invalid role", 400));
 }

 const filterBody = filterObj(req.body, "name", "email", "role", "active");

 const administartion = await User.findByIdAndUpdate(req.params.id, filterBody, {
  returnDocument: "after",
  runValidators: true
 });

 if (!administartion) {
  return next(new AppError("No administartion found with this Id", 404));
 }

 sendResponse(res, 200, administartion, "Administartion updated successfully");
});

export const deleteAdministartion = catchAsync(async (req, res, next) => {
 const administartion = await User.findByIdAndDelete(req.params.id);

 if (!administartion) {
  return next(new AppError("No administartion found with this Id", 404));
 }

 sendResponse(res, 204, null, "Administartion deleted successfully");
});

export const getPendingVendors = catchAsync(async (req, res, next) => {
 const vendor = await User.find({ role: "vendor", approved: false });

 sendResponse(res, 200, vendor, undefined, {
  results: vendor.length
 });
});

export const approvedVendors = catchAsync(async (req, res, next) => {
    
    const vendor = await User.findByIdAndUpdate(req.params.id, { approved: true }, {
        returnDocument: "after",
        runValidators:true
    })
    
    if (!vendor) {
        return next (new AppError('No vendor found with this ID', 404))
    }

    sendResponse(res, 200, vendor, 'Vendor approved updated successfully')

});

