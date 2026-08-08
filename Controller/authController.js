import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import User from '../Model/userModel.js';
import { promisify } from 'util';
import { ref } from 'process';
import sendEmail from '../Utils/sendEmail.js';

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signRefreshToken = (id, family) => {
  return jwt.sign({ id, family }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
const createSendToken = async (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);

  const family = crypto.randomUUID();
  const refreshToken = signRefreshToken(user._id, family);

  user.refreshTokenHash = hashToken(refreshToken);

  user.refreshFamily = family;
  user.refreshTokenExpires = new Date(
    Date.now() +
      process.env.JWT_REFRESH_EXPIRES_IN.replace('d', '') *
        24 *
        60 *
        60 *
        1000
  );

  await user.save({ validateBeforeSave: false });

  const accessCookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  const refreshCookieOptions = {
    expires: user.refreshTokenExpires,
    httpOnly: true,
    path: '/api/v1/users/refresh',
  };

  if (process.env.NODE_ENV === 'production') {
    accessCookieOptions.secure = true;
    refreshCookieOptions.secure = true;
  }

  res.cookie('jwt', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: { user },
  });
};

const createSendTokenRotated = async (user, family, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id, family);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenFamily = family;
  user.refreshTokenExpires = new Date(
    Date.now() +
      process.env.JWT_REFRESH_EXPIRES_IN.replace('d', '') *
        24 *
        60 *
        60 *
        1000
  );

  await user.save({ validateBeforeSave: false });

  const accessCookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  const refreshCookieOptions = {
    expires: user.refreshTokenExpires,
    httpOnly: true,
    path: '/api/v1/users/refresh',
  };
  if (process.env.NODE_ENV === 'production') {
    accessCookieOptions.secure = true;
    refreshCookieOptions.secure = true;
  }

  res.cookie('jwt', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(200).json({ status: 'success', token: accessToken });
};

export const signUp = catchAsync(async (req, res, next) => {
  req.body.approved = req.body.role !== 'vendor';
  const userData = {
    ...req.body,
    approve: req.body.role !== 'vendor',
  };

  const newUser = await User.create(userData);

  await createSendToken(newUser, 201, res);
});

export const signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user.active === false) {
    return next(new AppError('This id has been deactivated', 403));
  }

  const isCorrect = await user.checkCorrectPassword(
    password,
    user.password
  );

  if (!isCorrect) {
    return next(new AppError('Incorrect email or password', 401));
  }

  await createSendToken(user, 200, res);
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
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new AppError('No account found with that email address', 404)
    );
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
  const { otp, password, passwordConfirm } = req.body;
  const hashedOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  const user = await User.findOne({
    email: req.user.email,
    passwordResetOTP: hashedOTP,
    passwordResetOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('OTP is Invalid or has expired', 400));
  }
  user.password =password
  user.passwordConfirm = passwordConfirm
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;

  await user.save();

  await createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('No user found with this ID', 404));
  }

  if (
    !(await user.checkCorrectPassword(passwordCurrent, user.password))
  ) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  await createSendToken(user, 200, res);
});

export const refresh = catchAsync(async (req, res, next) => {
  const rawToken = req.cookies?.refreshToken;

  if (!rawToken) {
    return next(
      new AppError('You are not logged in. Please log in.', 401)
    );
  }

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(
      rawToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (err) {
    return next(
      new AppError(
        'Invalid or expired refresh token. Please log in again.',
        401
      )
    );
  }

  const user = await User.findById(decoded.id).select(
    '+refreshTokenHash'
  );

  if (!user || !user.refreshTokenHash) {
    return next(
      new AppError('Invalid session. Please log in again.', 401)
    );
  }

  const incomingHash = hashToken(rawToken);

  if (
    incomingHash !== user.refreshTokenHash ||
    decoded.family !== user.refreshTokenFamily
  ) {
    user.refreshTokenHash = undefined;
    user.refreshTokenFamily = undefined;
    user.refreshTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.clearCookie('refreshToken', {
      path: '/api/v1/users/refresh',
    });

    return next(
      new AppError('Session invalid. Please log in again.', 401)
    );
  }

  if (
    user.refreshTokenExpires &&
    user.refreshTokenExpires < Date.now()
  ) {
    return next(
      new AppError('Session expired. Please log in again.', 401)
    );
  }

  await createSendTokenRotated(user, decoded.family, res);
});

export const logout = catchAsync(async (req, res, next) => {
  if (req.user) {
    req.user.refreshTokenHash = undefined;
    req.user.refreshTokenFamily = undefined;
    req.user.refreshTokenExpires = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.clearCookie('refreshToken', { path: '/api/v1/users/refresh' });

  res.status(200).json({
    status: 'success',
  });
});
