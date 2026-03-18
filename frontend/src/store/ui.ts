'use client';

import { create } from 'zustand';

type UiState = {
  module: string;
  breadcrumb: string;
  notifications: number;
  soundEnabled: boolean;
  setModule: (module: string, breadcrumb: string) => void;
  setNotifications: (count: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  module: 'Home',
  breadcrumb: 'Dashboard / Home',
  notifications: 2,
  soundEnabled: true,
  setModule: (module, breadcrumb) => set({ module, breadcrumb }),
  setNotifications: (notifications) => set({ notifications }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled }))
}));
