import { Request, Response } from 'express';
import { fetchGames, fetchGameDetails } from '../services/gameData';

export const getGames = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    
    if (search) {
      const results = await fetchGames({ search });
      return res.json({ trending: results, topRated: [], multiplayer: [], newReleases: [], featured: results[0] });
    }

    const [trendingRaw, topRated, multiplayer, newReleases] = await Promise.all([
      fetchGames({ ordering: '-added', page_size: 10 }),
      fetchGames({ ordering: '-rating', page_size: 15 }),
      fetchGames({ tags: 'multiplayer', page_size: 15 }),
      fetchGames({ ordering: '-released', page_size: 15 })
    ]);

    // Fetch full details for the top 5 trending games to get real descriptions for the carousel
    const trending = await Promise.all(
      trendingRaw.slice(0, 5).map(g => fetchGameDetails(g.id))
    ).then(details => {
      const validDetails = details.filter(d => d !== null) as any[];
      // Mix them back with the remaining raw ones to keep the list size
      return [...validDetails, ...trendingRaw.slice(5)];
    });

    return res.json({ 
      trending, 
      topRated, 
      multiplayer, 
      newReleases, 
      featured: trending[0] 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching games' });
  }
};

export const getGameById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await fetchGameDetails(id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    return res.json(game);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching game details' });
  }
};
