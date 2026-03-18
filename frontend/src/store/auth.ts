'use client';

import { create } from 'zustand';
import { User } from '@/lib/types';
import { api, setStoredAuthToken } from '@/lib/api';

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  fetchMe: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  fetchMe: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/auth/me');
      set({
        user: res.data.user ?? null,
        loading: false,
        initialized: true
      });
      return res.data.user ?? null;
    } catch {
      setStoredAuthToken(null);
      set({ user: null, loading: false, initialized: true });
      return null;
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      setStoredAuthToken(res.data.token);
      set({ user: res.data.user, loading: false, initialized: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  signup: async (username, email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/signup', { username, email, password });
      setStoredAuthToken(res.data.token);
      set({ user: res.data.user, loading: false, initialized: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setStoredAuthToken(null);
      set({ user: null, loading: false, initialized: true });
    }
  }
}));
