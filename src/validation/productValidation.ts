import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, 'Title must have 5 characters')
    .max(50, 'Title can not exceeds 50 characters'),

  description: z
    .string()
    .trim()
    .max(500, 'Description can not exceeds 500 characters')
    .optional(),

  price: z
    .number('Price is mandatory')
    .positive('Price can not be in negative'),
  stock: z
    .number('Stock should be in number')
    .int('Stock can not be zero')
    .positive('Stock should greater than 0'),

  active: z.boolean().default(true),

  categoryId: z.int(),
});

export const updateProductSchema = createProductSchema.partial();
