import { Request, Response } from 'express';
import { recommendGames, copilotReply } from '../services/aiService';

export const recommend = async (req: Request, res: Response) => {
  const { mood, preferences } = req.body;
  if (!mood) {
    return res.status(400).json({ message: 'mood is required' });
  }

  const recommendations = await recommendGames(mood, preferences || []);
  return res.json({ recommendations });
};

export const copilot = async (req: Request, res: Response) => {
  const { message, context } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'message is required' });
  }

  const reply = await copilotReply(message, context);
  return res.json({ reply });
};
