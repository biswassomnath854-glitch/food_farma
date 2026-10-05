import { z } from 'zod';

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID'),
  items: z.array(
    z.object({
      foodId: z.string().uuid('Invalid food ID'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one item'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  paymentMethod: z.enum(['ONLINE', 'COD']),
  deliveryInstructions: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
});
