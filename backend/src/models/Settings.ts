import { Schema, model, Types } from 'mongoose';

export interface ISettings {
  user: Types.ObjectId;
  theme: 'dark' | 'midnight';
  soundEnabled: boolean;
}

const settingsSchema = new Schema<ISettings>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['dark', 'midnight'], default: 'dark' },
    soundEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Settings = model<ISettings>('Settings', settingsSchema);
