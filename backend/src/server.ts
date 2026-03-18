import fs from 'node:fs/promises';
import http from 'http';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { initSocket } from './sockets';

const runtimeConfigPath = path.resolve(process.cwd(), '..', 'frontend', 'public', 'nexus-runtime.json');
const maxPortAttempts = 20;

let started = false;
let activeServer: http.Server | null = null;

const persistRuntimeConfig = async (port: number) => {
  const payload = {
    port,
    apiBaseUrl: `http://localhost:${port}/api`,
    socketUrl: `http://localhost:${port}`,
    timestamp: new Date().toISOString()
  };

  try {
    await fs.writeFile(runtimeConfigPath, JSON.stringify(payload, null, 2));
  } catch (error) {
    console.warn('Unable to persist runtime config for frontend discovery', error);
  }
};

const listenOnAvailablePort = (server: http.Server, preferredPort: number) =>
  new Promise<number>((resolve, reject) => {
    let attempts = 0;
    let currentPort = preferredPort;

    const cleanup = () => {
      server.off('error', onError);
      server.off('listening', onListening);
    };

    const onListening = () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        cleanup();
        reject(new Error('Unable to resolve bound server address'));
        return;
      }

      cleanup();
      resolve((address as AddressInfo).port);
    };

    const tryListen = () => {
      attempts += 1;
      server.once('listening', onListening);
      server.listen(currentPort);
    };

    const onError = (error: NodeJS.ErrnoException) => {
      server.off('listening', onListening);

      if (error.code === 'EADDRINUSE' && attempts < maxPortAttempts) {
        currentPort += 1;
        tryListen();
        return;
      }

      cleanup();
      reject(error);
    };

    server.on('error', onError);
    tryListen();
  });

const start = async () => {
  if (started && activeServer) {
    return;
  }

  started = true;
  await connectDatabase();

  const server = http.createServer(app);
  initSocket(server);
  activeServer = server;

  const port = await listenOnAvailablePort(server, env.PORT);
  await persistRuntimeConfig(port);

  if (port !== env.PORT) {
    console.warn(`Port ${env.PORT} is busy, NEXUS backend moved to http://localhost:${port}`);
  }

  console.log(`NEXUS backend running on http://localhost:${port}`);
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
