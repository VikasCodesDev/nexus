import { Router } from 'express';
import { getProfile, updateProfile, updateSettings } from '../controllers/userController';
import { requireAuth } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/profile', requireAuth, asyncHandler(getProfile));
router.patch('/profile', requireAuth, asyncHandler(updateProfile));
router.patch('/settings', requireAuth, asyncHandler(updateSettings));

export default router;
