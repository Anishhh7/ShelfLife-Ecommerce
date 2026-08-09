import { z } from 'zod';

export const addCartSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),

  quantity: z.number().int().positive(),
});

export const updateCartSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID')
    .optional(),

  quantity: z.number().int().positive().optional(),
});

export const removeMultipleCartItemsSchema = z.object({
  productIds: z
    .array(
      z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID')
    )
    .min(1),
});
