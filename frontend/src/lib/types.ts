export type Game = {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  genre: string[];
  multiplayer: boolean;
  releaseDate: string;
  platforms?: string[];
  price?: string;
  approxSize?: string;
  website?: string;
};

export type User = {
  id: string;
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
  lastSeen?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source?: string;
  image?: string;
};

export type AiRecommendation = {
  title: string;
  reason: string;
  image: string;
};

export type SocialFriend = {
  id: string;
  username: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  friendshipId?: string;
};

export type ActivityItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user?: {
    id?: string;
    username?: string;
    avatar?: string;
  };
};

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
};
