import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().positive().min(1),
  review: z.string().max(500).optional(),
});

