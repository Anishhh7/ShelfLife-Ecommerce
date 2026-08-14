import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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

export const sanitizeUser = (user: User) => {
  const common = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    active: user.active,
  };

  if (user.role === 'Customer') {
    return {
      ...common,
      profileImageUrl: user.profileImageUrl,
      
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