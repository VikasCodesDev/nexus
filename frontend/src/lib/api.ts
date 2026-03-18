import axios, { AxiosHeaders } from 'axios';

const AUTH_TOKEN_KEY = 'nexus_auth_token';
const RUNTIME_CONFIG_KEY = 'nexus_runtime_config';
const RUNTIME_CONFIG_PATH = '/nexus-runtime.json';

const isDev = process.env.NODE_ENV === 'development';
const defaultApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const defaultSocketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || defaultApiBaseUrl.replace(/\/api$/, '')).replace(/\/+$/, '');

type RuntimeConfig = {
  apiBaseUrl: string;
  socketUrl: string;
  port?: number;
};

let runtimeConfigCache: RuntimeConfig | null = null;
let runtimeConfigPromise: Promise<RuntimeConfig> | null = null;

const normalizeRuntimeConfig = (value: unknown): RuntimeConfig | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const config = value as Record<string, unknown>;
  if (typeof config.apiBaseUrl !== 'string' || typeof config.socketUrl !== 'string') {
    return null;
  }

  return {
    apiBaseUrl: config.apiBaseUrl.replace(/\/+$/, ''),
    socketUrl: config.socketUrl.replace(/\/+$/, ''),
    port: typeof config.port === 'number' ? config.port : undefined
  };
};

const getDefaultRuntimeConfig = (): RuntimeConfig => ({
  apiBaseUrl: defaultApiBaseUrl,
  socketUrl: defaultSocketUrl
});

const readStoredRuntimeConfig = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return normalizeRuntimeConfig(JSON.parse(window.localStorage.getItem(RUNTIME_CONFIG_KEY) || 'null'));
  } catch {
    return null;
  }
};

const storeRuntimeConfig = (config: RuntimeConfig) => {
  runtimeConfigCache = config;

  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(config));
};

export const resolveRuntimeConfig = async (forceRefresh = false): Promise<RuntimeConfig> => {
  if (typeof window === 'undefined' || !isDev) {
    return getDefaultRuntimeConfig();
  }

  if (!forceRefresh) {
    if (runtimeConfigCache) {
      return runtimeConfigCache;
    }

    const stored = readStoredRuntimeConfig();
    if (stored) {
      runtimeConfigCache = stored;
      return stored;
    }
  }

  if (!runtimeConfigPromise) {
    runtimeConfigPromise = fetch(`${RUNTIME_CONFIG_PATH}?ts=${Date.now()}`, {
      cache: 'no-store'
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Runtime config fetch failed with ${response.status}`);
        }

        const data = normalizeRuntimeConfig(await response.json());
        if (!data) {
          throw new Error('Runtime config payload is invalid');
        }

        storeRuntimeConfig(data);
        return data;
      })
      .catch(() => {
        const fallback = readStoredRuntimeConfig() || getDefaultRuntimeConfig();
        storeRuntimeConfig(fallback);
        return fallback;
      })
      .finally(() => {
        runtimeConfigPromise = null;
      });
  }

  return runtimeConfigPromise;
};

export const apiBaseUrl = defaultApiBaseUrl;
export const socketUrl = defaultSocketUrl;

export const getStoredAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setStoredAuthToken = (token?: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string } | undefined;
    return payload?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

api.interceptors.request.use((config) => {
  return resolveRuntimeConfig().then((runtimeConfig) => {
    config.baseURL = runtimeConfig.apiBaseUrl;

    const token = getStoredAuthToken();
    if (!token) {
      return config;
    }

    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;

    return config;
  });
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as (typeof error.config & { _retriedWithRuntimeRefresh?: boolean }) | undefined;

    if (axios.isAxiosError(error) && !error.response && !config?._retriedWithRuntimeRefresh) {
      const refreshed = await resolveRuntimeConfig(true);
      if (config) {
        config._retriedWithRuntimeRefresh = true;
        config.baseURL = refreshed.apiBaseUrl;
        return api.request(config);
      }
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url || '';
      if (url.includes('/auth/me') || url.includes('/auth/logout')) {
        setStoredAuthToken(null);
      }
    }

    return Promise.reject(error);
  }
);
