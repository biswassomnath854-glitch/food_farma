import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth.middleware';
import { Order, OrderItem, User, Restaurant, Food, Payment, Address, Review } from '../models';
import { razorpayInstance } from '../config/razorpay';
import { sendSuccess, sendError } from '../utils/response';
import { OrderStatus } from '../models/Order';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.count({ where: { role: 'USER' } });
    const totalRestaurants = await Restaurant.count();
    const totalFoods = await Food.count();
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'PENDING' } });
    const deliveredOrders = await Order.count({ where: { status: 'DELIVERED' } });

    const totalRevenueResult = await Order.sum('totalAmount', {
      where: {
        paymentStatus: 'SUCCESS',
        status: { [Op.ne]: 'CANCELLED' },
      },
    });
    const totalRevenue = Math.round((Number(totalRevenueResult) || 0) * 100) / 100;

    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
      ],
    });

    return sendSuccess(res, 'Admin dashboard stats retrieved', {
      metrics: {
        totalUsers,
        totalRestaurants,
        totalFoods,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch dashboard stats', 500);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'address', 'image'] },
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
        { model: Address, as: 'address' },
        { model: Review, as: 'review' },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    return sendSuccess(res, 'All orders retrieved', {
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      orders,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch orders', 500);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    const validStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid order status: ${status}`, 400);
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      const allowedRefundStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING'];
      if (allowedRefundStatuses.includes(order.status) && order.paymentStatus === 'SUCCESS') {
        const payment = await Payment.findOne({ where: { orderId: order.id } });
        let refundId = `rfnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        if (payment && payment.razorpayPaymentId && razorpayInstance && !payment.razorpayPaymentId.startsWith('pay_mock_')) {
          try {
            const rzpRefund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
              amount: Math.round(order.totalAmount * 100),
            });
            if (rzpRefund && rzpRefund.id) refundId = rzpRefund.id;
          } catch (e: any) {
            console.warn('Admin refund fallback:', e.message);
          }
        }

        if (payment) {
          payment.status = 'REFUNDED';
          await payment.save();
        }

        order.paymentStatus = 'REFUNDED';
        order.refundId = refundId;
        order.refundAmount = order.totalAmount;
        order.refundReason = 'Order cancelled and refunded by Administrator';
        order.refundedAt = new Date();
      }
    }

    order.status = status;
    await order.save();

    return sendSuccess(res, `Order status updated to ${status}`, order);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update order status', 500);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Users retrieved successfully', users);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch users', 500);
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.role === 'ADMIN') {
      return sendError(res, 'Cannot change status of Admin user', 400);
    }

    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await user.save();

    const userObj = user.toJSON();
    delete (userObj as any).password;

    return sendSuccess(res, `User account ${user.status.toLowerCase()}`, userObj);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update user status', 500);
  }
};
