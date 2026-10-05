import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Order, OrderItem, Cart, CartItem, Food, Address, Restaurant, Payment, Review, OrderStatus } from '../models';
import { razorpayInstance } from '../config/razorpay';
import { sendSuccess, sendError } from '../utils/response';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    if (req.user.role === 'ADMIN') {
      return sendError(res, 'Administrators cannot place customer orders. Please sign in with a customer account.', 403);
    }

    const { addressId, paymentMethod = 'ONLINE', deliveryInstructions } = req.body;

    const address = await Address.findOne({ where: { id: addressId, userId: req.user.id } });
    if (!address) {
      return sendError(res, 'Delivery address not found', 404);
    }

    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Food,
              as: 'food',
            },
          ],
        },
      ],
    });

    const items = (cart as any)?.items || [];
    if (items.length === 0) {
      return sendError(res, 'Your cart is empty', 400);
    }

    // Determine restaurantId from cart items
    const firstFood = items[0].food;
    if (!firstFood) {
      return sendError(res, 'Invalid items in cart', 400);
    }
    const restaurantId = firstFood.restaurantId;

    let subtotal = 0;
    const orderItemsData: any[] = [];

    items.forEach((item: any) => {
      const foodItem = item.food;
      if (foodItem) {
        const itemPrice = foodItem.discountPrice || foodItem.price;
        subtotal += itemPrice * item.quantity;

        orderItemsData.push({
          foodId: foodItem.id,
          foodName: foodItem.name,
          price: itemPrice,
          quantity: item.quantity,
          foodType: foodItem.foodType,
        });
      }
    });

    const deliveryFee = 40;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    const formattedAddress = `${address.fullName}, ${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode} (Ph: ${address.phone})`;

    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      addressId: address.id,
      deliveryAddress: formattedAddress,
      subtotal,
      discount: 0,
      deliveryFee,
      tax,
      totalAmount,
      status: 'PENDING',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      deliveryInstructions,
    });

    // Bulk create order items
    await Promise.all(
      orderItemsData.map((itemData) =>
        OrderItem.create({
          orderId: order.id,
          ...itemData,
        })
      )
    );

    // Create payment record
    await Payment.create({
      orderId: order.id,
      amount: totalAmount,
      currency: 'INR',
      status: 'PENDING',
      method: paymentMethod,
    });

    // Clear user cart items
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image'] },
        { model: Payment, as: 'payment' },
      ],
    });

    return sendSuccess(res, 'Order created successfully', createdOrder, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to place order', 500);
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: OrderItem, as: 'items' },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address'] },
        { model: Payment, as: 'payment' },
        { model: Address, as: 'address' },
        { model: Review, as: 'review' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Orders retrieved successfully', orders);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch orders', 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;

    const whereClause: any = { id };
    if (req.user.role !== 'ADMIN') {
      whereClause.userId = req.user.id;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        { model: OrderItem, as: 'items' },
        { model: Restaurant, as: 'restaurant' },
        { model: Address, as: 'address' },
        { model: Payment, as: 'payment' },
        { model: Review, as: 'review' },
      ],
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, 'Order details retrieved', order);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch order', 500);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const order = await Order.findOne({ where: { id, userId: req.user.id } });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.status === 'CANCELLED') {
      return sendError(res, 'This order has already been cancelled', 400);
    }

    // Refund policy: Refund & cancellation only allowed BEFORE ready stage (PENDING, CONFIRMED, PREPARING)
    const allowedRefundStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING'];

    if (!allowedRefundStatuses.includes(order.status)) {
      return sendError(
        res,
        `Refund unavailable: Food preparation is already completed (${order.status} stage). Cancellations and refunds can only be made before or during the preparing stage.`,
        400
      );
    }

    let refundProcessed = false;
    let refundId = `rfnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Process refund if online payment was completed
    if (order.paymentStatus === 'SUCCESS') {
      const payment = await Payment.findOne({ where: { orderId: order.id } });
      if (payment) {
        if (payment.razorpayPaymentId && razorpayInstance && !payment.razorpayPaymentId.startsWith('pay_mock_')) {
          try {
            const rzpRefund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
              amount: Math.round(order.totalAmount * 100),
              notes: {
                orderId: order.id,
                userId: req.user.id,
                reason: req.body.reason || 'Customer cancelled order before ready stage',
              },
            });
            if (rzpRefund && rzpRefund.id) {
              refundId = rzpRefund.id;
            }
          } catch (rzpErr: any) {
            console.warn('Razorpay refund API call failed, using simulation refund:', rzpErr.message);
          }
        }

        payment.status = 'REFUNDED';
        await payment.save();
      }

      order.paymentStatus = 'REFUNDED';
      order.refundId = refundId;
      order.refundAmount = order.totalAmount;
      order.refundReason = req.body.reason || 'Cancelled by customer before food was ready (preparing stage)';
      order.refundedAt = new Date();
      refundProcessed = true;
    } else {
      // Unpaid / COD
      const payment = await Payment.findOne({ where: { orderId: order.id } });
      if (payment) {
        payment.status = 'FAILED';
        await payment.save();
      }
    }

    order.status = 'CANCELLED';
    await order.save();

    const message = refundProcessed
      ? `Order cancelled and refund of ₹${order.totalAmount} processed successfully (Refund ID: ${order.refundId}).`
      : 'Order cancelled successfully.';

    return sendSuccess(res, message, order);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to cancel order', 500);
  }
};
