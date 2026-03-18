import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Settings } from '../models/Settings';

const serializeUser = (user: {
  id?: string;
  _id?: { toString(): string };
  username: string;
  email: string;
  avatar: string;
  stats: {
    level: number;
    xp: number;
    achievements: number;
  };
  favoriteGames: string[];
  online?: boolean;
  lastSeen?: Date;
}) => ({
  id: user.id ?? user._id?.toString() ?? '',
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  stats: user.stats,
  favoriteGames: user.favoriteGames,
  online: user.online,
  lastSeen: user.lastSeen
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const settings = await Settings.findOneAndUpdate(
    { user: req.userId },
    { $setOnInsert: { user: req.userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json({ user: serializeUser(user), settings });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { avatar, favoriteGames, stats } = req.body;
  const updates: Record<string, unknown> = {};

  if (typeof avatar === 'string' && avatar.trim()) {
    updates.avatar = avatar.trim();
  }

  if (Array.isArray(favoriteGames)) {
    updates.favoriteGames = favoriteGames.filter((game): game is string => typeof game === 'string').slice(0, 20);
  }

  if (stats && typeof stats === 'object') {
    const safeStats = stats as Record<string, unknown>;
    if (typeof safeStats.level === 'number') {
      updates['stats.level'] = safeStats.level;
    }
    if (typeof safeStats.xp === 'number') {
      updates['stats.xp'] = safeStats.xp;
    }
    if (typeof safeStats.achievements === 'number') {
      updates['stats.achievements'] = safeStats.achievements;
    }
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    Object.keys(updates).length ? { $set: updates } : {},
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: serializeUser(user) });
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  const { theme, soundEnabled } = req.body;
  const updates: Record<string, unknown> = {};

  if (theme === 'dark' || theme === 'midnight') {
    updates.theme = theme;
  }

  if (typeof soundEnabled === 'boolean') {
    updates.soundEnabled = soundEnabled;
  }

  const settings = await Settings.findOneAndUpdate(
    { user: req.userId },
    {
      ...(Object.keys(updates).length ? { $set: updates } : {}),
      $setOnInsert: { user: req.userId }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return res.json({ settings });
};
