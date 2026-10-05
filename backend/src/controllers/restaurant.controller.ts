import { Request, Response } from 'express';
import { Restaurant, Food, Review, Category } from '../models';
import { sendSuccess, sendError } from '../utils/response';
import { Op } from 'sequelize';

export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const { search, cuisine, minRating, isOpen } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    if (cuisine) {
      whereClause.cuisines = { [Op.like]: `%${cuisine}%` };
    }

    if (minRating) {
      whereClause.rating = { [Op.gte]: parseFloat(minRating as string) };
    }

    if (isOpen !== undefined) {
      whereClause.isOpen = isOpen === 'true';
    }

    const restaurants = await Restaurant.findAll({
      where: whereClause,
      order: [['rating', 'DESC'], ['name', 'ASC']],
    });

    return sendSuccess(res, 'Restaurants retrieved successfully', restaurants);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch restaurants', 500);
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: Food,
          as: 'foods',
          include: [{ model: Category, as: 'category' }],
        },
        {
          model: Review,
          as: 'reviews',
          limit: 10,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    return sendSuccess(res, 'Restaurant details retrieved successfully', restaurant);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch restaurant', 500);
  }
};

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const { name, description, address, cuisines, rating, deliveryTime, minOrder, image, isOpen } = req.body;

    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      cuisines: Array.isArray(cuisines) ? cuisines.join(', ') : cuisines,
      rating: rating || 4.5,
      deliveryTime: deliveryTime || '30-40 min',
      minOrder: minOrder || 100,
      image,
      isOpen: isOpen !== undefined ? isOpen : true,
    });

    return sendSuccess(res, 'Restaurant created successfully', restaurant, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create restaurant', 500);
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    const { name, description, address, cuisines, rating, deliveryTime, minOrder, image, isOpen } = req.body;

    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    if (address) restaurant.address = address;
    if (cuisines) restaurant.cuisines = Array.isArray(cuisines) ? cuisines.join(', ') : cuisines;
    if (rating !== undefined) restaurant.rating = rating;
    if (deliveryTime) restaurant.deliveryTime = deliveryTime;
    if (minOrder !== undefined) restaurant.minOrder = minOrder;
    if (image) restaurant.image = image;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;

    await restaurant.save();

    return sendSuccess(res, 'Restaurant updated successfully', restaurant);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update restaurant', 500);
  }
};

export const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    await restaurant.destroy();

    return sendSuccess(res, 'Restaurant deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete restaurant', 500);
  }
};
