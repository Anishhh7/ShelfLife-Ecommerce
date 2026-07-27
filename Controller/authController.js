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

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}: //${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you didn't forget your password, please ignore this email. `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset token valid for 10 minutes.',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token has sent to email address',
    });
  } catch (err) {
    console.error('📬 ACTUAL EMAIL UTILITY ERROR:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending this email. Try again later!!'
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.tokeb)
    .digest('hex');

  const useer = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is Invalid', 404));
  }
  user.password = req.body?.password;
  user.passwordConfirm = req.body?.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

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
