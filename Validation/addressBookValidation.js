import { z } from 'zod';

export const createAddressBookSchema = z.object({
  label: z.enum(['Home', 'Office', 'Other']),
  fullName: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(25, 'Name can not be exceed 25 characters'),

  mobileNumber: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      'Please provide a valid phone number'
    ),

  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),

  province: z.string(),

  postalCode: z.string(),

  country: z.string(),

  isDefault: z.boolean().default(false).optional(),
});

export const updateAddressBookSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(25, 'Name can not be exceed 25 characters')
    .optional(),

  mobileNumber: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      'Please provide a valid phone number'
    )
    .optional(),

  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),

  province: z.string().optional(),

  postalCode: z.string().optional(),

  country: z.string().optional(),

  isDefault: z.boolean().optional(),
});
