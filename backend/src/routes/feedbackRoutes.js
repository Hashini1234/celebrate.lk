import { Router } from 'express';
import { createFeedback, listFeedback } from '../controllers/feedbackController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', listFeedback);
router.post('/', protect, requireRole('customer'), createFeedback);

export default router;
