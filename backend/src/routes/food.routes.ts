import { Router } from 'express';
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from '../controllers/food.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllFoods);
router.get('/:id', getFoodById);

// Admin routes
router.post('/', authenticate, requireAdmin, createFood);
router.put('/:id', authenticate, requireAdmin, updateFood);
router.delete('/:id', authenticate, requireAdmin, deleteFood);

export default router;
