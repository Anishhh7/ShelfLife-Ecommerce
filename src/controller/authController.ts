import jwt from 'jsonwebtoken';
import ms, { type StringValue } from 'ms';
import crypto from 'crypto';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { type User } from '../generated/prisma/client';
import prisma from '../config/prisma';
import { response, type CookieOptions } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  hashPassword,
  checkPassword,
  checkChangedPassword,
  createResetPasswordOtp,
} from '../utils/authUtils';
import type { Role } from '../generated/prisma/client';
import { sanitizeUser } from '../utils/authUtils';
import * as authService from '../service/authService';

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  refreshTokenExpires: Date
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const accessTokenExpires = new Date(
    Date.now() + ms(process.env.JWT_COOKIE_EXPIRES_IN as StringValue)
  );

  res.cookie('jwt', accessToken, {
    expires: accessTokenExpires,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });

  res.cookie('refreshToken', refreshToken, {
    expires: refreshTokenExpires,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/v1/users/refresh',
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const user = await authService.signUp(req.body);

  setAuthCookies(
    res,
    user.accessToken,
    user.refreshToken,
    user.refreshTokenExpires
  );

  const safeUser = sanitizeUser(user.user);

  res.status(201).json({
    status: 'success',
    token: user.accessToken,
    data: {
      user: safeUser,
    },
  });
});

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await authService.signIn(email, password);

  setAuthCookies(
    res,
    result.accessToken,
    result.refreshToken,
    result.refreshTokenExpires
  );

  const safeUser = sanitizeUser(result.user);

  res.status(200).json({
    status: 'success',
    token: result.accessToken,
    data: {
      user: safeUser,
    },
  });
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
      new AppError('You are not logged in. Please login', 401)
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
