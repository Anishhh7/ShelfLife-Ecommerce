import { z } from 'zod';

const id = z.number().int().positive();

export const placeOrderSchema = z
  .object({
    cartItemsIds: z
      .array(id)
      .min(1, 'Select at least one item')
      .max(20, 'Too many items in one order'),

    addressId: id,
    paymentMethod: z
      .enum(['CreditCard', 'DebitCard', 'Wallet', 'COD'])
      .default('COD'),
  })
  .strict()
  .refine(
    (d) => new Set(d.cartItemsIds).size === d.cartItemsIds.length,
    {
      message: 'Duplicate item in selection',
      path: ['cartItemsIds'],
    }
  );
