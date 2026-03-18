import { Schema, model } from 'mongoose';

export interface IGameCache {
  category: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    rating: number;
    genre: string[];
    multiplayer: boolean;
    releaseDate: string;
  }>;
}

const gameItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, required: true },
    genre: { type: [String], required: true },
    multiplayer: { type: Boolean, required: true },
    releaseDate: { type: String, required: true }
  },
  { _id: false }
);

const gameCacheSchema = new Schema<IGameCache>(
  {
    category: { type: String, required: true, unique: true },
    items: { type: [gameItemSchema], default: [] }
  },
  { timestamps: true }
);

export const GameCache = model<IGameCache>('GameCache', gameCacheSchema);
