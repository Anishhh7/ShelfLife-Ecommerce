import User from "../Model/userModel.js";
import catchAsync from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";
import sendResponse from "../Utils/sendResponse.js";

const filterObj = (obj, ...allowFields) => {
 const newObj = {};
 Object.keys(obj).forEach((el) => {
  if (allowFields.includes(el)) newObj[el] = obj[el];
 });
 return newObj;
};

export const createAdministartion = catchAsync(async (req, res, next) => {
 const { name, email, password, role } = req.body;

 if (!["customer", "staff"].includes(role)) {
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
  results: staff.length
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
 if (req.body.role && !["customer", "staff"].includes(req.body.role)) {
  return next(new AppError("Invalid role", 400));
 }

 const filterBody = filterObj(req.body, "name", "email", "password", "role", "active");

 const administartion = await User.findByIdAndUpdate(req.params.id, filterBody, {
  returnDocument: "after",
  runValidators: true
 });

 if (!administartion) {
  return next(new AppError("No administartion found with this Id", 404));
 }

 sendResponse(res, 200, staff, "Administartion updated successfully");
});

export default deleteAdministartion = catchAsync(async (req, res, next) => {
 const administartion = await User.findByIdAndUpdate(req.params.id);

 if (!administartion) {
  return next(new AppError("No administartion found with this Id", 404));
 }

 sendResponse(res, 204, null, "Administartion deleted successfully");
});
