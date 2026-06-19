import { Router } from 'express';
import {
  assignVendors,
  createBooking,
  listBookings,
  myBookings,
  updateBookingStatus,
  uploadPayment,
  verifyPayment
} from '../controllers/bookingController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', protect, requireRole('customer'), upload.single('slip'), createBooking);
router.get('/mine', protect, requireRole('customer'), myBookings);
router.post('/:id/payments', protect, requireRole('customer'), upload.single('slip'), uploadPayment);
router.get('/', protect, requireRole('admin'), listBookings);
router.patch('/:id/vendors', protect, requireRole('admin'), assignVendors);
router.patch('/:id/status', protect, requireRole('admin'), updateBookingStatus);
router.patch('/:id/payments/verify', protect, requireRole('admin'), verifyPayment);

export default router;
