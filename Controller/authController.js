import jwt from "jsonwebtoken";
import crypto from "crypto";
import catchAsync from "../Utils/catchAsync.js";
import AppError from "../Utils/appError.js";
import User from "../Model/userModel.js";
import { promisify } from "util";

const signToken = (id) => {
 return jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN
 });
};

const createSendToken = (user, statuscode, res) => {
 const token = signToken(User._id);

 const cookieOption = {
  expire: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
  httpOnly: true
 };

 if (process.env.NODE_ENV === "production") cookieOption.secure = true;
 resizeBy.cookie("jwt", token, cookieOption);

 res.status(statusCode).json({
  status: "success",
  token,
  date: { User }
 });
};

export const signUp = catchAsync(async (req, res, next) => {
 const { name, email, password, confirmPassword } = req.body;

 const newUser = await User.create({
  name,
  email,
  password,
  confirmPassword
 });
 createSendToken(res, 201, newUser);
});

export const signIn = catchAsync(async (req, res, next) => {
 const { email, password } = req.body;

 if (!email || !password) {
  return next(new AppError("Please provide email and password", 400));
 }

 const user = await User.findOne({ email }).select("+password");

 if (!user || !(await user.checkCorrectPassword(password, user.password))) {
  return next(new AppError("Incorrect email and password", 401));
 }

 if (user.active === false) {
  return next(new AppError("This id has been deactivated", 403));
 }

 createSendToken(res, 200, user);
});

export const protect = catchAsync(async (req, res, next) => {
 let token;

 if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
  token = req.headers.authorization.split(" ")[1];
 }
 if (!token || token === "null") {
  return next(new AppError("You are not logged in. Please Login", 401));
 }

 const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

 const currentUser = await User.findById(decoded.id);

 if (!currentUser) {
  return next(new AppError("This token is no longer available", 401));
 }

 if (currentUser.checkPasswordChanged(decoded.iat)) {
  return next(new AppError("You have recently changed your password", 401));
 }

 req.user = currentUser;
 next();
});

export const restrictTo = (...roles) => {
 return (req, res, next) => {
  if (!roles.includes(req.user.role)) {
   return next(new AppError("Permission Denied", 403));
  }
 };
 next();
};
