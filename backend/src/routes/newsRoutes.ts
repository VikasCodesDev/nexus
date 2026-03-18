import { Router } from 'express';
import { getNews } from '../controllers/newsController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getNews));

export default router;
