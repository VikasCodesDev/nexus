import OpenAI from 'openai';
import { env } from '../config/env';
import { fetchGames, fetchGameDetails, Game } from './gameData';

const client = env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    })
  : null;

const parseJsonArray = (text: string) => {
  try {
    return JSON.parse(text) as Array<{ title: string; reason: string }>;
  } catch {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) {
      return [];
    }

    try {
      return JSON.parse(text.slice(start, end + 1)) as Array<{ title: string; reason: string }>;
    } catch {
      return [];
    }
  }
};

const getRecommendationsFromGames = (mood: string, games: Game[], preferences: string[] = []) => {
  const moodText = `${mood} ${preferences.join(' ')}`.toLowerCase();

  const scored = games.map((game) => {
    let score = game.rating;

    if (preferences.some((item) => game.genre.join(' ').toLowerCase().includes(item.toLowerCase()))) {
      score += 1.8;
    }
    if (moodText.includes('multiplayer') || moodText.includes('co-op') || moodText.includes('squad')) {
      score += game.multiplayer ? 1.6 : -0.5;
    }
    if (moodText.includes('competitive') || moodText.includes('ranked') || moodText.includes('fast')) {
      score += ['FPS', 'Competitive', 'Shooter', 'Racing'].some((tag) => game.genre.includes(tag)) ? 1.5 : 0;
    }
    if (moodText.includes('story') || moodText.includes('immersive') || moodText.includes('chill')) {
      score += ['RPG', 'Adventure'].some((tag) => game.genre.includes(tag)) ? 1.25 : 0;
    }

    const reasonParts = [
      `${game.genre.join(' / ')} profile`,
      game.multiplayer ? 'strong squad energy' : 'great solo immersion'
    ];

    return {
      ...game,
      score,
      reason: `Best match for ${mood}. It brings ${reasonParts.join(' and ')}.`
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((game) => ({
      title: game.title,
      reason: game.reason,
      image: game.image
    }));
};

const fallbackRecommendations = async (mood: string, preferences: string[] = []) => {
  const games = await fetchGames({ page_size: 15 });
  return getRecommendationsFromGames(mood, games, preferences);
};

const fallbackCopilotReply = async (message: string, context?: string) => {
  const prompt = message.toLowerCase();

  if (prompt.includes('recommend') || prompt.includes('play')) {
    const picksResults = await fallbackRecommendations(message, []);
    const picks = picksResults.slice(0, 2).map((game) => game.title).join(' and ');
    return `Queue ${picks} next. They best fit your current mood and the ${context || 'active'} module.`;
  }

  if (prompt.includes('friend') || prompt.includes('squad') || prompt.includes('party')) {
    return 'Open the Social panel, lock onto an online pilot, and send a squad ping before you launch matchmaking.';
  }

  if (prompt.includes('news') || prompt.includes('update')) {
    return 'Use the News pulse row for fresh drops, then pin anything interesting into your command deck for later.';
  }

  return 'Copilot fallback is active. Sweep the hero panel for featured drops, then use the dock to jump between Library, AI, and Social.';
};

export const recommendGames = async (mood: string, preferences: string[] = []) => {
  const games = await fetchGames({ page_size: 20 });
  
  if (!client) {
    return getRecommendationsFromGames(mood, games, preferences);
  }

  const catalog = games.map((g: Game) => `${g.title} | ${g.genre.join(', ')} | rating:${g.rating}`).join('\n');
  const prompt = `User mood: ${mood}\nPreferences: ${preferences.join(', ') || 'none'}\nGames:\n${catalog}\nReturn strict JSON array: [{"title":"","reason":""}] max 4.`;

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are a game recommendation copilot.' },
        { role: 'user', content: prompt }
      ]
    });

    const text = completion.choices[0]?.message?.content || '[]';
    const parsed = parseJsonArray(text);

    if (!parsed.length) {
      return getRecommendationsFromGames(mood, games, preferences);
    }

    return parsed.slice(0, 4).map((item: { title: string; reason: string }) => {
      const match = games.find((g: Game) => g.title.toLowerCase() === item.title.toLowerCase());
      return {
        title: match?.title || item.title,
        reason: item.reason,
        image: match?.image || (games[0]?.image || 'https://via.placeholder.com/60x60?text=AI')
      };
    });
  } catch {
    return getRecommendationsFromGames(mood, games, preferences);
  }
};

export const copilotReply = async (message: string, context?: string) => {
  if (!client) {
    return await fallbackCopilotReply(message, context);
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content:
            'You are NEXUS Copilot. Give concise gaming guidance, system navigation help, and tactical suggestions.'
        },
        { role: 'user', content: `Context: ${context || 'general'}\nMessage: ${message}` }
      ]
    });

    return completion.choices[0]?.message?.content || 'Copilot is standing by.';
  } catch {
    return await fallbackCopilotReply(message, context);
  }
};
