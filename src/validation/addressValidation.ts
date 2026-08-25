import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.enum(['Home', 'Office', 'Other']).default('Home'),
  city: z.string(),
  addressLine1: z.string().trim(),
  addressLine2: z.string().trim().optional(),
  postalCode: z.string(),
  country: z.string().default('Nepal'),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema
  .omit({
    country: true,
  })

  .extend({
    fullName: z
      .string()
      .trim()
      .min(3, 'Name must have 3 characters')
      .max(30, 'Name can not be exceeded more than 30 characters'),

    email: z.email().trim(),

    mobileNumber: z
      .string()
      .trim()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        'Please provide a valid phone number'
      ),
  })
  .partial();

export const defaultAddressSchema = z.object({
  isDefault: z.boolean(),
});
