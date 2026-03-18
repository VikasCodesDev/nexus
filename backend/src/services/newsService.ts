import axios from 'axios';
import { env } from '../config/env';

const NEWS_API_KEY = env.NEWS_API_KEY;
const fallbackNews = [
  {
    id: 'fallback-1',
    title: 'NEXUS briefing: esports scrims, live-service updates, and launch windows are accelerating this week.',
    link: 'https://www.pcgamer.com/',
    pubDate: new Date().toISOString(),
    contentSnippet: 'Curated fallback feed while the live RSS pulse reconnects.',
    source: 'NEXUS Central'
  },
  {
    id: 'fallback-2',
    title: 'Co-op shooters and extraction sandboxes continue dominating squad playlists.',
    link: 'https://www.pcgamer.com/',
    pubDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    contentSnippet: 'Curated fallback feed while the live RSS pulse reconnects.',
    source: 'NEXUS Central'
  }
];

interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  description: string;
  content: string;
  source: { name: string };
  urlToImage: string;
}

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
  image?: string;
}

export const fetchGamingNews = async (): Promise<NewsItem[]> => {
  try {
    if (!NEWS_API_KEY) throw new Error('News API key missing');

    const keywords = [
      'gaming', 'video games', 'esports', 'PlayStation', 'Xbox', 'PC games', 'game release',
      'Nintendo Switch', 'Steam Deck', 'Valve', 'Epic Games Store', 'RPG', 'FPS', 'Multiplayer'
    ];

    const excludeKeywords = [
      'politics', 'election', 'stock market', 'finance', 'economy', 'war', 'climate change',
      'unrelated tech', 'smartphone', 'electric vehicle', 'crypto'
    ];

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'gaming OR "video games" OR esports OR "PC games" OR PlayStation OR Xbox',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 40, // Fetch more to filter down
        apiKey: NEWS_API_KEY
      }
    });

    const items = response.data.articles
      .map((article: NewsArticle, idx: number): NewsItem => ({
        id: article.url || String(idx),
        title: article.title || 'Untitled update',
        link: article.url || '#',
        pubDate: article.publishedAt || new Date().toISOString(),
        contentSnippet: article.description || article.content || 'Latest gaming news pulse.',
        source: article.source?.name || 'Gaming News',
        image: article.urlToImage
      }))
      .filter((item: NewsItem) => {
        const text = `${item.title} ${item.contentSnippet}`.toLowerCase();
        
        // Post-fetch filter: must contain gaming keywords
        const matchesGaming = keywords.some(k => text.includes(k.toLowerCase()));
        
        // Extra filter: exclude irrelevant topics
        const matchesExcluded = excludeKeywords.some(k => text.includes(k.toLowerCase()));

        // Ensure image exists for "good news with images"
        return matchesGaming && !matchesExcluded && !!item.image;
      })
      .slice(0, 15); // Return final 15 relevant items

    return items.length ? items : fallbackNews;
  } catch (error) {
    console.warn('Unable to fetch live gaming news from API', error);
    return fallbackNews;
  }
};
