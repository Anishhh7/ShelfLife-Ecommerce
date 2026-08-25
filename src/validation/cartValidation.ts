import { z } from 'zod';

export const createCartSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().positive(),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().positive(),
});

export const removeItemsSchema = z.object({
  itemsIds: z.array(z.number().int().positive()).min(1),
});
