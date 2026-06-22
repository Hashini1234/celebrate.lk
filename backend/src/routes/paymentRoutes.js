import { Router } from 'express';
import { createPayHerePayment, handlePayHereNotification } from '../controllers/paymentController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/create', protect, requireRole('customer'), createPayHerePayment);
router.post('/payhere/notify', handlePayHereNotification);

export default router;
