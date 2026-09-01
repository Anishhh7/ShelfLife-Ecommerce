import { z } from 'zod';

export const addToWishlist = z.object({
  productId: z.number().int().positive(),
});

export const removeFromWishlist = addToWishlist;
