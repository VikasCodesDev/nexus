import dns from 'node:dns';
import mongoose, { ConnectOptions } from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);
mongoose.set('autoIndex', env.NODE_ENV !== 'production');

const applyMongoDnsServers = () => {
  const servers = env.MONGO_DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean);
  if (!servers.length) return;

  try {
    dns.setServers(servers);
    console.log(`Mongo DNS servers: ${servers.join(', ')}`);
  } catch (error) {
    console.warn('Failed to set custom DNS servers for MongoDB', error);
  }
};

const connectionOptions: ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  family: 4,
  autoIndex: env.NODE_ENV !== 'production',
  maxPoolSize: 10
};

const tryConnect = async (uri: string) => {
  await mongoose.connect(uri, connectionOptions);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetries = async (uri: string, label: string, attempts = 3) => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await tryConnect(uri);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`MongoDB ${label} connection attempt ${attempt}/${attempts} failed`);
      if (attempt < attempts) {
        await wait(attempt * 1500);
      }
    }
  }

  throw lastError;
};

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  applyMongoDnsServers();

  try {
    await connectWithRetries(env.MONGO_URI, 'primary');
    console.log('MongoDB connected');
    return;
  } catch (primaryError) {
    const isSrvFailure =
      env.MONGO_URI.startsWith('mongodb+srv://') &&
      (String((primaryError as { code?: string })?.code || '').includes('ECONNREFUSED') ||
        String(primaryError).includes('querySrv'));

    if (isSrvFailure && env.MONGO_FALLBACK_URI) {
      console.warn('Primary MongoDB SRV connection failed, trying MONGO_FALLBACK_URI');
      await connectWithRetries(env.MONGO_FALLBACK_URI, 'fallback');
      console.log('MongoDB connected using fallback URI');
      return;
    }

    throw primaryError;
  }
};
