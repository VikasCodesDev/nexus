import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Friendship } from '../models/Friendship';
import { Message } from '../models/Message';
import { Activity } from '../models/Activity';
import { User } from '../models/User';

const resolveFriend = (
  friendship: {
    requester: {
      id?: string;
      _id?: { toString(): string };
      username?: string;
      avatar?: string;
      online?: boolean;
      lastSeen?: Date;
    };
    recipient: {
      id?: string;
      _id?: { toString(): string };
      username?: string;
      avatar?: string;
      online?: boolean;
      lastSeen?: Date;
    };
  },
  currentUserId: string
) => {
  const requester = friendship.requester as {
    id?: string;
    _id?: { toString(): string };
    username?: string;
    avatar?: string;
    online?: boolean;
    lastSeen?: Date;
  };
  const recipient = friendship.recipient as typeof requester;
  const requesterId = requester.id || requester._id?.toString() || '';
  const friend = requesterId === currentUserId ? recipient : requester;

  return {
    id: friend.id || friend._id?.toString() || '',
    username: friend.username || 'Unknown Pilot',
    avatar: friend.avatar || 'https://api.dicebear.com/9.x/bottts/svg?seed=nexus',
    online: Boolean(friend.online),
    lastSeen: friend.lastSeen
  };
};

export const listFriends = async (req: AuthRequest, res: Response) => {
  const friendships = await Friendship.find({
    $or: [{ requester: req.userId }, { recipient: req.userId }]
  })
    .populate('requester', 'username avatar online lastSeen')
    .populate('recipient', 'username avatar online lastSeen')
    .sort({ updatedAt: -1 });

  const friends = friendships
    .filter((friendship) => friendship.status === 'accepted')
    .map((friendship) => ({
      friendshipId: friendship.id,
      ...resolveFriend(
        friendship.toObject() as unknown as {
          requester: {
            id?: string;
            _id?: { toString(): string };
            username?: string;
            avatar?: string;
            online?: boolean;
            lastSeen?: Date;
          };
          recipient: {
            id?: string;
            _id?: { toString(): string };
            username?: string;
            avatar?: string;
            online?: boolean;
            lastSeen?: Date;
          };
        },
        req.userId || ''
      )
    }));

  return res.json({ friendships, friends });
};

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  const { recipientId } = req.body;
  if (!recipientId) {
    return res.status(400).json({ message: 'recipientId is required' });
  }

  if (recipientId === req.userId) {
    return res.status(400).json({ message: 'You cannot add yourself as a friend' });
  }

  const recipient = await User.findById(recipientId).select('_id');
  if (!recipient) {
    return res.status(404).json({ message: 'Recipient not found' });
  }

  const existing = await Friendship.findOne({
    $or: [
      { requester: req.userId, recipient: recipientId },
      { requester: recipientId, recipient: req.userId }
    ]
  });

  if (existing) {
    return res.status(409).json({ message: `Friend request already ${existing.status}` });
  }

  const friendship = await Friendship.create({ requester: req.userId, recipient: recipientId });

  await Activity.create({
    user: req.userId,
    type: 'friend_request',
    message: 'Sent a friend request',
    metadata: { recipientId }
  });

  return res.status(201).json({ friendship });
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  const { friendshipId } = req.body;
  if (!friendshipId) {
    return res.status(400).json({ message: 'friendshipId is required' });
  }

  const friendship = await Friendship.findOneAndUpdate(
    { _id: friendshipId, recipient: req.userId },
    { status: 'accepted' },
    { new: true }
  );

  if (!friendship) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  await Activity.create({
    user: req.userId,
    type: 'friend_accept',
    message: 'Accepted a squad invite'
  });

  return res.json({ friendship });
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const { friendId } = req.params;
  if (!friendId) {
    return res.status(400).json({ message: 'friendId is required' });
  }

  const messages = await Message.find({
    $or: [
      { from: req.userId, to: friendId },
      { from: friendId, to: req.userId }
    ]
  }).sort({ createdAt: 1 });

  return res.json({ messages });
};

export const getActivity = async (req: AuthRequest, res: Response) => {
  const friendships = await Friendship.find({
    status: 'accepted',
    $or: [{ requester: req.userId }, { recipient: req.userId }]
  }).select('requester recipient');

  const relatedUserIds = new Set<string>([req.userId || '']);
  friendships.forEach((friendship) => {
    const requesterId = friendship.requester.toString();
    const recipientId = friendship.recipient.toString();
    relatedUserIds.add(requesterId === req.userId ? recipientId : requesterId);
  });

  const activity = await Activity.find({ user: { $in: Array.from(relatedUserIds) } })
    .populate('user', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(20);

  return res.json({ activity });
};
