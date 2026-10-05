import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/webhook', razorpayWebhook);

export default router;
