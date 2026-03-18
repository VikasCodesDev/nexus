import { Router } from 'express';
import { getGames, getGameById } from '../controllers/gameController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getGames));
router.get('/:id', asyncHandler(getGameById));

export default router;
