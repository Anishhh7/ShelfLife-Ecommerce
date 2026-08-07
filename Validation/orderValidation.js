import { z } from 'zod';

export const placeOrderSchema = z.object({
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
