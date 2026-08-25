import { z } from 'zod';
import { ItemStatus } from '../generated/prisma/enums';

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

export const vendorUpdateItemStatusSchema = z.object({
  status: z.enum([
    ItemStatus.Confirmed,
    ItemStatus.Packed,
    ItemStatus.Shipped,
  ]),
});

export const adminUpdateItemStatusSchema = z
  .object({
    status: z.enum([
      ItemStatus.Pending,
      ItemStatus.Confirmed,
      ItemStatus.Packed,
      ItemStatus.Shipped,
      ItemStatus.OutForDelivery,
      ItemStatus.Delivered,
      ItemStatus.Cancelled,
    ]),
    reason: z.string().min(5).optional(),
  })
  .refine((data) => data.status !== ItemStatus.Cancelled || !data.reason, {
    message: 'Cancellation reason is required',
    path: ['reason'],
  });

  export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .min(5, "Cancellation reason must be at least 5 characters")
    .optional(),
});
