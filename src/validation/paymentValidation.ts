import { z } from 'zod';

export const checkOutSchema = z.object({
  orderId: z.coerce.number(),
  provider: z.enum(['stripe']),
  method: z.enum(['Credit-card']).default('Credit-card'),
});
