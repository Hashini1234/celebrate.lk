import { Router } from 'express';
import { applyVendor, listVendorApplications, updateVendorApplicationStatus } from '../controllers/vendorApplicationController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post(
  '/',
  upload.fields([
    { name: 'portfolioImages', maxCount: 6 },
    { name: 'businessRegistration', maxCount: 1 }
  ]),
  applyVendor
);
router.get('/', protect, requireRole('admin'), listVendorApplications);
router.patch('/:id/status', protect, requireRole('admin'), updateVendorApplicationStatus);

export default router;
