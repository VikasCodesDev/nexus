import axios from 'axios';
import { env } from '../config/env';

const RAWG_API_KEY = env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  genre: string[];
  multiplayer: boolean;
  releaseDate: string;
  playtime?: number;
  platforms?: string[];
  developers?: string[];
  publishers?: string[];
  website?: string;
  stores?: { store: { name: string; slug: string } }[];
  price?: string;
  approxSize?: string;
}

// Logic-based mapping for download sources
const getDownloadSource = (game: any): string => {
  const name = game.name.toLowerCase();
  const developers = game.developers?.map((d: any) => d.name.toLowerCase()) || [];
  
  if (name.includes('gta') || name.includes('red dead') || developers.includes('rockstar games')) return 'Rockstar / Steam';
  if (name.includes('valorant') || name.includes('league of legends') || developers.includes('riot games')) return 'Riot Games';
  if (name.includes('fortnite') || developers.includes('epic games')) return 'Epic Games';
  if (name.includes('minecraft')) return 'Microsoft Store';
  
  return 'Steam / Epic Games';
};

// Logic-based estimation for price (RAWG doesn't provide it)
const estimatePrice = (game: any): string => {
  if (game.tags?.some((t: any) => t.slug === 'free-to-play') || game.genres?.some((g: any) => g.slug === 'free-to-play')) {
    return 'Free';
  }
  
  // AAA games usually have high metacritic or certain genres
  if (game.metacritic > 80 || game.ratings_count > 5000) {
    return '₹2,999 - ₹4,999 (Paid)';
  }
  
  return '₹499 - ₹1,999 (Paid)';
};

// Logic-based estimation for size
const estimateSize = (game: any): string => {
  const isAAA = game.metacritic > 75 || game.ratings_count > 2000;
  const isOpenWorld = game.tags?.some((t: any) => t.slug === 'open-world');
  
  if (isAAA && isOpenWorld) return 'Approx Size: 80GB – 150GB';
  if (isAAA) return 'Approx Size: 40GB – 80GB';
  if (game.genres?.some((g: any) => g.slug === 'indie')) return 'Approx Size: 1GB – 10GB';
  
  return 'Approx Size: 10GB – 40GB';
};

const mapRawgToGame = (game: any): Game => {
  const genres = game.genres?.map((g: any) => g.name) || [];
  const rating = Math.round(game.rating * 2) || 0;
  
  // Dynamic description fallback if description_raw is missing (common in list API)
  let description = game.description_raw || game.description;
  if (!description) {
    const platformStr = game.platforms?.slice(0, 2).map((p: any) => p.platform.name).join(' and ') || 'modern platforms';
    description = `An immersive ${genres[0] || 'gaming'} experience rated ${rating}/10 by the community. Explore high-stakes gameplay and rich environments on ${platformStr}.`;
  }

  return {
    id: String(game.id),
    title: game.name,
    description,
    image: game.background_image || 'https://via.placeholder.com/600x400?text=No+Image',
    rating,
    genre: genres,
    multiplayer: game.tags?.some((t: any) => t.slug.includes('multiplayer')) || false,
    releaseDate: game.released || 'Unknown',
    platforms: game.platforms?.map((p: any) => p.platform.name) || [],
    price: estimatePrice(game),
    approxSize: estimateSize(game),
    stores: game.stores,
    website: getDownloadSource(game)
  };
};

export const fetchGames = async (params: any = {}) => {
  try {
    if (!RAWG_API_KEY) throw new Error('RAWG API key missing');

    const response = await axios.get(`${RAWG_BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        page_size: 20,
        ordering: '-added',
        ...params
      }
    });

    return response.data.results.map((g: any) => mapRawgToGame(g));
  } catch (error) {
    console.error('Error fetching games from RAWG', error);
    return [];
  }
};

export const fetchGameDetails = async (id: string) => {
  try {
    if (!RAWG_API_KEY) throw new Error('RAWG API key missing');

    const response = await axios.get(`${RAWG_BASE_URL}/games/${id}`, {
      params: { key: RAWG_API_KEY }
    });

    return mapRawgToGame(response.data);
  } catch (error) {
    console.error(`Error fetching game details for ${id}`, error);
    return null;
  }
};

