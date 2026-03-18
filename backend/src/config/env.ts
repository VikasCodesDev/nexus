import path from 'node:path';
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1),
  MONGO_FALLBACK_URI: z.string().optional().transform((value) => value?.trim() || undefined),
  MONGO_DNS_SERVERS: z.string().default('8.8.8.8,1.1.1.1'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  GROQ_API_KEY: z.string().optional().transform((value) => value?.trim() || undefined),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  RAWG_API_KEY: z.string().min(1),
  NEWS_API_KEY: z.string().min(1)
});

export const env = envSchema.parse({
  ...process.env,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
});

export const isProduction = env.NODE_ENV === 'production';
export const allowedOrigins = Array.from(
  new Set([env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'])
);
