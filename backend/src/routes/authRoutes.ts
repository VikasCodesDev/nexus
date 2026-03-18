import { Router } from 'express';
import { login, logout, me, signup } from '../controllers/authController';
import { attachOptionalAuth } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/signup', authLimiter, asyncHandler(signup));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/logout', attachOptionalAuth, asyncHandler(logout));
router.get('/me', attachOptionalAuth, asyncHandler(me));

export default router;
