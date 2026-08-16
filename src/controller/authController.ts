import jwt from 'jsonwebtoken';
import ms, { type StringValue } from 'ms';
import crypto from 'crypto';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { type User } from '../generated/prisma/client';
import prisma from '../config/prisma';
import type { CookieOptions } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  hashPassword,
  checkPassword,
  checkChangedPassword,
  createResetPasswordOtp,
} from '../utils/authUtils';
import type { Role } from '../generated/prisma/client';
import { sanitizeUser } from '../utils/authUtils';

const signAccessToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
  });
};

const signRefreshToken = (id: number, family: string): string => {
  return jwt.sign({ id, family }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
  });
};

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const createSendToken = async (
  user: User,
  statusCode: number,
  res: Response
) => {
  const accessToken = signAccessToken(user.id);
  const family = crypto.randomUUID();
  const refreshToken = signRefreshToken(user.id, family);
  const refreshTokenHash = hashToken(refreshToken);

  const refreshTokenExpires = new Date(
    Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN as StringValue)
  );

  const accessTokenExpires = new Date(
    Date.now() + ms(process.env.JWT_COOKIE_EXPIRES_IN as StringValue)
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshFamily: family,
      refreshTokenHash: refreshTokenHash,
      refreshTokenExpires: refreshTokenExpires,
    },
  });
  const isProduction = process.env.NODE_ENV === 'production';

  const accessCookieOptions: CookieOptions = {
    expires: accessTokenExpires,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  };

  const refreshCookieOptions: CookieOptions = {
    expires: refreshTokenExpires,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/v1/users/refresh',
  };

  res.cookie('jwt', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  const safeuser = sanitizeUser(user);

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: { user: safeuser },
  });
};

const createSendTokenRotated = async (
  user: User,
  family: string,
  res: Response
) => {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id, family);
  const refreshTokenHash = hashToken(refreshToken);
  const refreshTokenExpires = new Date(
    Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN as StringValue)
  );

  const accessTokenExpires = new Date(
    Date.now() + ms(process.env.JWT_COOKIE_EXPIRES_IN as StringValue)
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshTokenExpires: refreshTokenExpires,
      refreshFamily: family,
      refreshTokenHash: refreshTokenHash,
    },
  });
  const isProduction = process.env.NODE_ENV === 'production';

  const accessCookieOptions: CookieOptions = {
    expires: accessTokenExpires,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  };

  const refreshCookieOptions: CookieOptions = {
    expires: refreshTokenExpires,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/v1/users/refresh',
  };

  res.cookie('jwt', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(200).json({
    status: 'success',
    token: accessToken,
  });
};

export const signUp = catchAsync(async (req, res) => {
  const hashedPassword = await hashPassword(req.body.password);

  const newUser = await prisma.user.create({
    data: { ...req.body, password: hashedPassword },
  });

  await createSendToken(newUser, 201, res);
});

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await checkPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (user?.active === false) {
    return next(new AppError('This id has been deactivated', 403));
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
      new AppError('You are not loggd in. Please login', 401)
    );
  }

  type AccessTokenPayload = {
    id: number;
    iat: number;
    exp: number;
  };

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as AccessTokenPayload;

  const currentUser = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!currentUser) {
    return next(new AppError('User no longer exists', 401));
  }

  if (
    await checkChangedPassword(
      decoded.iat,
      currentUser.passwordChangedAt
    )
  ) {
    return next(
      new AppError('User have recently changed their password', 401)
    );
  }
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Permission denied', 403));
    }
    if (req.user.role === 'Vendor' && req.user.approved === false) {
      return next(new AppError('You are not verified yet', 403));
    }
    next();
  };
};
