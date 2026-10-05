import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Cart, CartItem, Food, Restaurant } from '../models';
import { sendSuccess, sendError } from '../utils/response';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Food,
              as: 'food',
              include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] }],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
      cart = await Cart.findByPk(cart.id, {
        include: [{ model: CartItem, as: 'items' }],
      }) as Cart;
    }

    const items = (cart as any).items || [];
    let subtotal = 0;
    items.forEach((item: any) => {
      if (item.food) {
        const itemPrice = item.food.discountPrice || item.food.price;
        subtotal += itemPrice * item.quantity;
      }
    });

    const deliveryFee = subtotal > 0 ? 40 : 0;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST tax
    const totalAmount = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    return sendSuccess(res, 'Cart retrieved successfully', {
      id: cart.id,
      userId: cart.userId,
      items,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch cart', 500);
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    if (req.user.role === 'ADMIN') {
      return sendError(res, 'Administrators cannot add items to cart. Please sign in with a customer account.', 403);
    }

    const { foodId, quantity = 1 } = req.body;

    const food = await Food.findByPk(foodId);
    if (!food) {
      return sendError(res, 'Food item not found', 404);
    }

    let [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id },
    });

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, foodId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        foodId,
        quantity,
      });
    }

    return sendSuccess(res, 'Item added to cart', cartItem);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add item to cart', 500);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return sendError(res, 'Cart not found', 404);
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      return sendError(res, 'Cart item not found', 404);
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return sendSuccess(res, 'Item removed from cart');
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return sendSuccess(res, 'Cart item updated', cartItem);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update cart item', 500);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { itemId } = req.params;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return sendError(res, 'Cart not found', 404);
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      return sendError(res, 'Cart item not found', 404);
    }

    await cartItem.destroy();

    return sendSuccess(res, 'Item removed from cart');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to remove item from cart', 500);
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    return sendSuccess(res, 'Cart cleared successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to clear cart', 500);
  }
};
