import { Router } from 'express';
import { copilot, recommend } from '../controllers/aiController';
import { requireAuth } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/recommend', requireAuth, asyncHandler(recommend));
router.post('/copilot', requireAuth, asyncHandler(copilot));

export default router;
