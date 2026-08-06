import { z } from 'zod';

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(25, 'Name can not be exceed 25 characters'),

    email: z
      .string()
      .trim()
      .email('Please provide a valid email address'),

    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        'Please provide a valid phone number'
      ),

    password: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .max(30, 'Password cannot exceed 30 characters'),

    passwordConfirm: z.string(),

    role: z
      .enum(['customer', 'vendor', 'staff', 'admin'])
      .default('customer'),

    storeName: z.string().optional(),
    address: z.string().optional(),

    coordinates: z.array(z.number()).length(2).optional(),

    location: z.literal('Point').optional(),
    description: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
  .refine(
    (data) =>
      data.role !== 'vendor' ||
      (data.storeName &&
        data.address &&
        data.location &&
        data.coordinates),
    {
      message: 'Store information is required for vendors',
      path: ['storeName'],
    }
  );

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(8, ' please provide a password'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers')
    .email('Please provide a valid email'),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Current password is required'),

    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(30, 'New password cannot exceed 30 characters'),

    passwordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: 'Password do not match',
    path: ['passwordConfirm'],
  });

export const resetPasswordSchema = z
  .object({
    otp: z
      .number()
      .int()
      .min(100000)
      .max(999999),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),

    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });
