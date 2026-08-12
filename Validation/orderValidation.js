import { number, z } from 'zod';

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
      })
    )
    .min(1, 'Select at least one item'),

  addressId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Address ID'),

  paymentMethod: z.string().min(1, 'Payment method is required'),
});

export const updateVendorItemStatusSchema = z.object({
  itemStatus: z.enum(['Pending', 'Confirmed', 'Packed']),
});

export const adminItemStatusSchema = z.object({
  itemStatus: z.enum([
    'Pending',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ]),
});
