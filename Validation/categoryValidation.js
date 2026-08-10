import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(25, 'Name can not be exceed 25 characters'),

  description: z.string().max(500).optional(),

  active: z.boolean().default(true),

  image: z
    .object({
      url: z.string().url(),
      publicId: z.string(),
    })
    .optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(25, 'Name can not be exceed 25 characters')
    .optional(),

  description: z.string().max(500).optional(),

  active: z.boolean().optional(),

  image: z
    .object({
      url: z.string().url(),
      publicId: z.string(),
    })
    .optional(),
});
