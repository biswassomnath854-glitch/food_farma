import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Review, Restaurant, User } from '../models';
import { sendSuccess, sendError } from '../utils/response';

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { restaurantId, rating, comment, orderId } = req.body;

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    const review = await Review.create({
      userId: req.user.id,
      restaurantId,
      orderId: orderId || null,
      rating,
      comment,
    });

    // Recalculate restaurant average rating
    const reviews = await Review.findAll({ where: { restaurantId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    restaurant.rating = Math.round(avgRating * 10) / 10;
    await restaurant.save();

    return sendSuccess(res, 'Review added successfully', review, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to submit review', 500);
  }
};

export const getRestaurantReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.findAll({
      where: { restaurantId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Reviews retrieved successfully', reviews);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch reviews', 500);
  }
};
