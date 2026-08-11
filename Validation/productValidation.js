import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Product name must be at least 3 characters'),

  description: z
    .string()
    .trim()
    .max(1000, 'Decription can not be longer than 1000 characters')
    .optional(),

  price: z.coerce.number().positive(),

  stock: z.coerce.number().positive(),

  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, 'Decription can not be longer than 1000 characters')
    .optional(),

  price: z.number().positive().optional(),

  stock: z.number().int().positive().optional(),

  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID')
    .optional(),

  active: z.boolean().optional(),
});
