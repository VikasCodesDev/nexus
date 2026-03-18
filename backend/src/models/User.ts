import { Schema, model } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  stats: {
    level: number;
    xp: number;
    achievements: number;
  };
  favoriteGames: string[];
  online: boolean;
  lastSeen?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: 'https://api.dicebear.com/9.x/bottts/svg?seed=nexus' },
    stats: {
      level: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 }
    },
    favoriteGames: { type: [String], default: [] },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
