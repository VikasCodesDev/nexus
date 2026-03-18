import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Settings } from '../models/Settings';
import { Activity } from '../models/Activity';
import { signToken } from '../utils/jwt';
import { clearAuthCookie, setAuthCookie } from '../utils/cookies';
import { AuthRequest } from '../middlewares/auth';

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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const signup = async (req: Request, res: Response) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    passwordHash,
    online: true,
    lastSeen: new Date()
  });

  await Settings.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { user: user._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Activity.create({
    user: user._id,
    type: 'pilot_initialized',
    message: 'Initialized a new pilot profile'
  });

  const token = signToken({ userId: user.id });
  setAuthCookie(res, token);

  return res.status(201).json({
    user: serializeUser(user),
    token
  });
};

export const login = async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? normalizeEmail(req.body.email) : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  user.online = true;
  user.lastSeen = new Date();
  await user.save();
  await Activity.create({
    user: user._id,
    type: 'sign_in',
    message: 'Signed into NEXUS'
  });

  const token = signToken({ userId: user.id });
  setAuthCookie(res, token);

  return res.json({
    user: serializeUser(user),
    token
  });
};

export const logout = async (req: AuthRequest, res: Response) => {
  if (req.userId) {
    await User.findByIdAndUpdate(req.userId, { online: false, lastSeen: new Date() });
    await Activity.create({
      user: req.userId,
      type: 'sign_out',
      message: 'Signed out of NEXUS'
    }).catch(() => undefined);
  }

  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
};

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.json({ user: null, settings: null });
  }

  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    clearAuthCookie(res);
    return res.status(401).json({ message: 'Session expired', user: null, settings: null });
  }

  const settings = await Settings.findOneAndUpdate(
    { user: req.userId },
    { $setOnInsert: { user: req.userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json({ user: serializeUser(user), settings });
};
