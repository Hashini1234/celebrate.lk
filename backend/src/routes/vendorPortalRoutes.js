import { Router } from 'express';
import {
  createVendorService,
  deleteVendorService,
  updateVendorBookingResponse,
  updateVendorService,
  uploadVendorPortfolio,
  vendorDashboard
} from '../controllers/vendorPortalController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect, requireRole('vendor'));
router.get('/dashboard', vendorDashboard);
router.post('/services', createVendorService);
router.put('/services/:id', updateVendorService);
router.delete('/services/:id', deleteVendorService);
router.patch('/bookings/:id/respond', updateVendorBookingResponse);
router.post('/portfolio', upload.array('images', 8), uploadVendorPortfolio);

export default router;
