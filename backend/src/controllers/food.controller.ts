import { Request, Response } from 'express';
import { Food, Restaurant, Category } from '../models';
import { sendSuccess, sendError } from '../utils/response';
import { Op } from 'sequelize';

export const getAllFoods = async (req: Request, res: Response) => {
  try {
    const { restaurantId, categoryId, foodType, search, minPrice, maxPrice, isAvailable } = req.query;

    const whereClause: any = {};

    if (restaurantId) {
      whereClause.restaurantId = restaurantId;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (foodType) {
      whereClause.foodType = foodType;
    }

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice as string);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice as string);
    }

    if (isAvailable !== undefined) {
      whereClause.isAvailable = isAvailable === 'true';
    }

    const foods = await Food.findAll({
      where: whereClause,
      include: [
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'rating', 'deliveryTime'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'image'] },
      ],
      order: [['rating', 'DESC'], ['name', 'ASC']],
    });

    return sendSuccess(res, 'Food items retrieved successfully', foods);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch foods', 500);
  }
};

export const getFoodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const food = await Food.findByPk(id, {
      include: [
        { model: Restaurant, as: 'restaurant' },
        { model: Category, as: 'category' },
      ],
    });

    if (!food) {
      return sendError(res, 'Food item not found', 404);
    }

    return sendSuccess(res, 'Food item details retrieved successfully', food);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch food item', 500);
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const { restaurantId, categoryId, name, description, price, discountPrice, image, foodType, rating, isAvailable } = req.body;

    const food = await Food.create({
      restaurantId,
      categoryId,
      name,
      description,
      price,
      discountPrice,
      image,
      foodType: foodType || 'VEG',
      rating: rating || 4.5,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    return sendSuccess(res, 'Food item created successfully', food, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create food item', 500);
  }
};

export const updateFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const food = await Food.findByPk(id);

    if (!food) {
      return sendError(res, 'Food item not found', 404);
    }

    const { restaurantId, categoryId, name, description, price, discountPrice, image, foodType, rating, isAvailable } = req.body;

    if (restaurantId) food.restaurantId = restaurantId;
    if (categoryId) food.categoryId = categoryId;
    if (name) food.name = name;
    if (description) food.description = description;
    if (price !== undefined) food.price = price;
    if (discountPrice !== undefined) food.discountPrice = discountPrice;
    if (image) food.image = image;
    if (foodType) food.foodType = foodType;
    if (rating !== undefined) food.rating = rating;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;

    await food.save();

    return sendSuccess(res, 'Food item updated successfully', food);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update food item', 500);
  }
};

export const deleteFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const food = await Food.findByPk(id);

    if (!food) {
      return sendError(res, 'Food item not found', 404);
    }

    await food.destroy();

    return sendSuccess(res, 'Food item deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete food item', 500);
  }
};
