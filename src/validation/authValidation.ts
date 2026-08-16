import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('Please provide a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(30, 'Password cannot exceed 30 characters');

const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(25, 'Name cannot exceed 25 characters'),

    email: emailSchema,

    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        'Please provide a valid phone number'
      ),

    password: passwordSchema,
    passwordConfirm: z.string(),

    role: z.enum(['Customer', 'Vendor']).default('Customer'),

    storeName: z.string().trim().optional(),

    address: z.string().trim().optional(),

    coordinates: z
      .array(z.number())
      .length(2, 'Coordinates must be [longitude, latitude]')
      .optional(),

    location: z.literal('Point').optional(),

    description: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
  .superRefine((data, ctx) => {
    if (data.role === 'Vendor') {
      const requiredVendorFields = [
        'storeName',
        'address',
        'location',
        'coordinates',
      ] as const;

      for (const field of requiredVendorFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field} is required for vendors`,
            path: [field],
          });
        }
      }
    }
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export const resetPasswordSchema = z
  .object({
    otp: otpSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });
