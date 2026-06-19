import { Router } from 'express';
import { createVendor, deleteVendor, listVendors, updateVendor } from '../controllers/vendorController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listVendors);
router.post('/', protect, requireRole('admin'), createVendor);
router.put('/:id', protect, requireRole('admin'), updateVendor);
router.delete('/:id', protect, requireRole('admin'), deleteVendor);

export default router;
