import { Role } from '../generated/prisma/enums';
import prisma from '../lib/prisma';
import emailQueue from '../queue/email.queue';
import AppError from '../utils/AppError';
import {
  hashPassword,
  checkPassword,
  signAccessToken,
  signRefreshToken,
  hashToken,
  createRefreshFamily,
  getRefreshTokenExpiration,
} from '../utils/authUtils';
import {
  customerWelcomeEmail,
  vendorWelcomeEmail,
} from '../utils/emailTemplates';

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
