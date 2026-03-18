'use client';

import { create } from 'zustand';
import { ChatMessage } from '@/lib/types';
import { io, Socket } from 'socket.io-client';
import { resolveRuntimeConfig, socketUrl } from '@/lib/api';

type SocialState = {
  onlineUsers: Record<string, boolean>;
  messages: ChatMessage[];
  socket: Socket | null;
  connect: (userId: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (to: string, content: string) => void;
};

export const useSocialStore = create<SocialState>((set, get) => ({
  onlineUsers: {},
  messages: [],
  socket: null,
  connect: async (userId) => {
    const current = get().socket;
    if (current) return;

    const runtime = await resolveRuntimeConfig();
    if (get().socket) return;

    const socket = io(runtime.socketUrl || socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { userId }
    });

    socket.on('presence:update', ({ userId: id, online }) => {
      set((s) => ({ onlineUsers: { ...s.onlineUsers, [id]: online } }));
    });

    socket.on('chat:message', (message: ChatMessage) => {
      set((s) => ({ messages: [...s.messages, message] }));
    });

    set({ socket });
  },
  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: {}, messages: [] });
  },
  sendMessage: (to, content) => {
    const trimmed = content.trim();
    if (!to || !trimmed) return;
    get().socket?.emit('chat:send', { to, content: trimmed });
  }
}));
