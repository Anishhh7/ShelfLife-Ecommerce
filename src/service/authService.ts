import { Role } from '../generated/prisma/enums';
import prisma from '../lib/prisma';
import emailQueue from '../queue/email.queue';
import AppError from '../utils/AppError';
import {
  checkPassword,
  createRefreshFamily,
  createResetPasswordOtp,
  getRefreshTokenExpiration,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
} from '../utils/authUtils';
import {
  customerWelcomeEmail,
  vendorWelcomeEmail,
} from '../utils/emailTemplates';
import { changeCloudinaryImage } from '../utils/uploadToCloudinary';

export const createAuthentication = async (user: any) => {
  const accessToken = signAccessToken(user.id);
  const family = createRefreshFamily();
  const refreshToken = signRefreshToken(user.id, family);

  const refreshTokenHash = hashToken(refreshToken);

  const refreshTokenExpires = getRefreshTokenExpiration();

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshFamily: family,
      refreshTokenHash,
      refreshTokenExpires,
    },
  });
  return {
    user,
    accessToken,
    refreshToken,
    refreshTokenExpires,
  };
};

export const signUp = async (userData: any) => {
  const { password, passwordConfirm, ...data } = userData;

  if (password !== passwordConfirm) {
    throw new AppError('Passwords do not match', 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  const email =
    user.role === Role.Vendor
      ? vendorWelcomeEmail(user.name)
      : customerWelcomeEmail(user.name);

  await emailQueue.add('welcome-email', {
    email: user.email,
    ...email,
  });
  return createAuthentication(user);
};

export const signIn = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || !(await checkPassword(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.active === false) {
    throw new AppError('This id has been deactivated', 403);
  }

  return createAuthentication(user);
};

export const rotateRefreshToken = async (
  userId: number,
  family: string
) => {
  const accessToken = signAccessToken(userId);

  const refreshToken = signRefreshToken(userId, family);

  const refreshTokenHash = hashToken(refreshToken);

  const refreshTokenExpires = getRefreshTokenExpiration();

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshFamily: family,
      refreshTokenHash,
      refreshTokenExpires,
    },
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenExpires,
  };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new AppError('Invalid email', 404);
  }

  const { OTP, hashedOTP, passwordResetOTPExpires } =
    createResetPasswordOtp();

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordResetOTP: hashedOTP,
      passwordResetOTPExpires,
    },
  });
  const message = `Your password reset OTP is ${OTP}. It is valid for 10 minutes. If you didn't request this, please ignore this email.`;

  await emailQueue.add('password-reset-otp', {
    email: user.email,
    subject: 'Reset OTP',
    message,
  });
};

export const changeUserProfile = async (
  userId: number,
  file: Express.Multer.File
) => {
  if (!file) {
    throw new AppError('Please upload an image', 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      role: Role.Customer || Role.Vendor,
    },
  });

  if (!user) {
    throw new AppError('User not found', 400);
  }

  const newImage = await changeCloudinaryImage(
    user.profileImagePublicId,
    file,
    'shelflife/users'
  );
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profileImageUrl: newImage.url,
      profileImagePublicId: newImage.publicId,
    },
  });
};
