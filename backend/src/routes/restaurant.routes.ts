import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurant.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Admin routes
router.post('/', authenticate, requireAdmin, createRestaurant);
router.put('/:id', authenticate, requireAdmin, updateRestaurant);
router.delete('/:id', authenticate, requireAdmin, deleteRestaurant);

export default router;
