import { email, z } from 'zod';

const nameSchema = z
  .string()
  .trim()
  .min(3, 'Name must be at least 3 characters')
  .max(25, 'Name can not be exceed 25 characters');

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, 'Please provide a valid phone number');

const emailSchema = z
  .string()
  .trim()
  .email('Please provide a valid email address');

export const createStaffSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema,
    password: z
      .string()
      .trim()
      .min(4, 'Password must be at least 4 characters')
      .max(8),
    passwordConfirm: z.string(),
    role: z.literal('Staff').default('Staff'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Password does not match',
    path: ['passwordConfirm'],
  });

export const updateStaffSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  active: z.boolean().optional,
});

export const approvedVendorSchema = z.object({
  approved: z.boolean(),
});

export const deleteUsersSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1).max(100),
});
