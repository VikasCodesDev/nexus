import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import gameRoutes from './routes/gameRoutes';
import aiRoutes from './routes/aiRoutes';
import newsRoutes from './routes/newsRoutes';
import socialRoutes from './routes/socialRoutes';
import { globalLimiter } from './middlewares/rateLimit';
import { allowedOrigins, env } from './config/env';

export const app = express();
app.disable('x-powered-by');

// Bare health probe — no CORS or auth required (used by Render, UptimeRobot, etc.)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
};

app.use(
  cors(corsOptions)
);
app.options('*', cors(corsOptions));
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/social', socialRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status && err.status >= 400 ? err.status : 500;
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message: status === 500 ? 'Internal Server Error' : err.message || 'Request failed'
  });
});
