import { z } from 'zod';

export const createReviewSchema = z.object({
  review: z
    .string()
    .trim()
    .min(6, 'Review must be at least 6 characters')
    .max(500, 'Review can not be exceed 500 characters')
    .optional(),

  rating: z
    .number()
    .min(1, 'A rating should be equal to 1')
    .max(5, 'A rating should equal or less than 5')
    .positive(),

  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID')
    .optional(),
});
