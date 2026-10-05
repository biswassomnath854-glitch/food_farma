import { Router } from 'express';
import { addReview, getRestaurantReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.post('/', authenticate, addReview);

export default router;
