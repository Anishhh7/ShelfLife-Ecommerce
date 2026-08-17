import { z } from 'zod';


export const createAddressSchema = z.object({
  label: z.enum(['Home', 'Office', 'Others']).default('Home'),
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
  .partial();

export const defaultAddressSchema = z.object({
  isDefault: z.boolean(),
});
