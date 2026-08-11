import { z } from 'zod';

export const createStaffSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(25, 'Name can not be exceed 25 characters'),

    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        'Please provide a valid phone number'
      )
      .optional(),

    email: z
      .string()
      .trim()
      .email('Please Provide a valid email address'),

    password: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .max(30, 'Password cannot exceed 30 characters'),

    passwordConfirm: z.string(),
    role: z.literal('staff').default('staff'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export const updateStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(25, 'Name can not be exceed 25 characters')
    .optional(),

  email: z
    .string()
    .trim()
    .email('Please Provide a valid email address')
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      'Please provide a valid phone number'
    )
    .optional(),

  role: z.literal('staff').optional(),
  active: z.boolean().optional(),
});

export const approvedVendorSchema = z.object({
  approved: z.boolean(),
});
