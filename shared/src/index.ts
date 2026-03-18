export type Game = {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  genre: string[];
  multiplayer: boolean;
  releaseDate: string;
};

export type UserStats = {
  level: number;
  xp: number;
  achievements: number;
};

export type AiRecommendationRequest = {
  mood: string;
  preferences?: string[];
};

export type AiRecommendation = {
  title: string;
  reason: string;
  image: string;
};
