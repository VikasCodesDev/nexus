import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { clearAuthCookie } from '../utils/cookies';

export type AuthRequest = Request & { userId?: string };

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith('Bearer ')) {
    return undefined;
  }

  return authorization.slice('Bearer '.length).trim() || undefined;
};

export const getRequestToken = (req: Request) =>
  (req.cookies.token as string | undefined) || getBearerToken(req.header('authorization'));

export const attachOptionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = getRequestToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
  } catch {
    req.userId = undefined;
    clearAuthCookie(res);
  }

  next();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = getRequestToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    clearAuthCookie(res);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
