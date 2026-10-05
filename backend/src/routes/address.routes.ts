import { Router } from 'express';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getUserAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
