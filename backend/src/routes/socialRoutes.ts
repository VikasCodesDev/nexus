import { Router } from 'express';
import {
  acceptFriendRequest,
  getActivity,
  getMessages,
  listFriends,
  sendFriendRequest
} from '../controllers/socialController';
import { requireAuth } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/friends', requireAuth, asyncHandler(listFriends));
router.post('/friends/request', requireAuth, asyncHandler(sendFriendRequest));
router.post('/friends/accept', requireAuth, asyncHandler(acceptFriendRequest));
router.get('/messages/:friendId', requireAuth, asyncHandler(getMessages));
router.get('/activity', requireAuth, asyncHandler(getActivity));

export default router;
