import { z } from 'zod';

export const addWishlistSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
});
export const wishlistParamSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
});
