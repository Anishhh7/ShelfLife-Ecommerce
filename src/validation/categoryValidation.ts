import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, 'Title must have 5 characters')
    .max(50, 'Title can not exceeds 50 characters'),

  description: z
    .string()
    .trim()
    .max(500, 'Description can not exceeds 500 characters'),

  active: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();
