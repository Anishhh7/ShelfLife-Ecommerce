import { z } from 'zod';

export const checkoutSchema = z.object({
  order: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID'),
  provider: z.enum(['stripe']),
  method: z.enum(['Credit-card']),
});
