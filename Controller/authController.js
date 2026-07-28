import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import User from '../Model/userModel.js';
import { promisify } from 'util';
import sendResponse from '../Utils/sendResponse.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expire: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production')
    cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (req.body.role && !['customer', 'vendor'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,
    role,
    approved: role === 'vendor' ? false : true,
  });

  createSendToken(newUser, 201, res);
});

export const signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400)
    );
  }

  const user = await User.findOne({ email }).select('+password');

  if (
    !user ||
    !(await user.checkCorrectPassword(password, user.password))
  ) {
    return next(new AppError('Incorrect email and password', 401));
  }

  if (user.active === false) {
    return next(new AppError('This id has been deactivated', 403));
  }

  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token || token === 'null') {
    return next(
      new AppError('You are not logged in. Please Login', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('This token is no longer available', 401)
    );
  }

  if (currentUser.checkPasswordChanged(decoded.iat)) {
    return next(
      new AppError('You have recently changed your password', 401)
    );
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Permission Denied', 403));
    }

    if (req.user.role === 'vendor' && req.user.approved === false) {
      return next(new AppError('You are not verified yet', 403));
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body?.email,
  });

  if (!user) {
    return next(new AppError('Can not found any email address', 404));
  }

  const otp = user.createPasswordResetOTP();
  await user.save({ validateBeforeSave: false });

  const message = `Your password reset OTP is ${otp}. It is valid for 10 minutes. If you didn't request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset OTP valid for 10 minutes.',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'OTP has been sent to your email address',
    });
  } catch (err) {
    console.error('📬 ACTUAL EMAIL UTILITY ERROR:', err);
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the OTP. Try again later!!',
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.otp)
    .digest('hex');

  const user = await User.findOne({
    email: req.user.email,
    passwordResetOTP: hashedOTP,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('OTP is Invalid or has expired', 400));
  }
  user.password = req.body?.password;
  user.passwordConfirm = req.body?.passwordConfirm;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (
    !(await user.checkCorrecPassword(
      req.body.passwordCurrent,
      user.password
    ))
  ) {
    return next(
      new AppError('Password is not matched with User!!', 401)
    );
  }

  user.password = req.body.password;
  user.passwordConfir = req.body.passwordConfirm;

  await user.save();

  createSendToken(user, 200, res);
});
