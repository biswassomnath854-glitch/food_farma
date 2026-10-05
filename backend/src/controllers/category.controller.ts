import { Request, Response } from 'express';
import { Category, Food } from '../models';
import { sendSuccess, sendError } from '../utils/response';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
      include: [{ model: Food, as: 'foods', attributes: ['id'] }],
    });

    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch categories', 500);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, image, description } = req.body;

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return sendError(res, 'Category already exists', 400);
    }

    const category = await Category.create({ name, image, description });
    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create category', 500);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    const { name, image, description } = req.body;
    if (name) category.name = name;
    if (image) category.image = image;
    if (description !== undefined) category.description = description;

    await category.save();

    return sendSuccess(res, 'Category updated successfully', category);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update category', 500);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    await category.destroy();

    return sendSuccess(res, 'Category deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete category', 500);
  }
};
