import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ms, { type StringValue } from 'ms';
import type { User } from '../generated/prisma/client';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const checkPassword = async (
  candidatePassword: string,
  userPassword: string
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const checkChangedPassword = async (
  JWTTimeStamp: number,
  passwordChangeAt?: Date | null
) => {
  if (passwordChangeAt) {
    const changedTimeStamp = passwordChangeAt.getTime() / 1000;
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

export const createResetPasswordOtp = async () => {
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOTP = crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');

  const passwordResetOTPExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  return {
    OTP,
    hashedOTP,
    passwordResetOTPExpires,
  };
};

export const signAccessToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
  });
};

export const signRefreshToken = (
  id: number,
  family: string
): string => {
  return jwt.sign({ id, family }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
  });
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const createRefreshFamily = () => {
  return crypto.randomUUID();
};

export const getRefreshTokenExpiration = () => {
  return new Date(
    Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN as StringValue)
  );
};

export const sanitizeUser = <T extends Partial<User>>(user: T) => {
  const common = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };

  if (user.role === 'Customer') {
    return {
      ...common,
      profileImageUrl: user.profileImageUrl,
      active: user.active,
    };
  }

  if (user.role === 'Vendor') {
    return {
      ...common,
      approved: user.approved,
      storeName: user.storeName,
      vendorImageUrl: user.vendorImageUrl,
      vendorImagePublicId: user.vendorImagePublicId,
      location: user.location,
      coordinates: user.coordinates,
      address: user.address,
      description: user.description,
    };
  }

  if (user.role === 'Staff') {
    return {
      ...common,
      staffImageUrl: user.staffImageUrl,
      staffImagePublicId: user.staffImagePublicId,
      address: user.address,
    };
  }

  return common;
};
