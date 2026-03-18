import { Request, Response } from 'express';
import { fetchGamingNews } from '../services/newsService';

export const getNews = async (_req: Request, res: Response) => {
  const news = await fetchGamingNews();
  return res.json({ news });
};
