import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
