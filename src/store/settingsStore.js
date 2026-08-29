// #genai: Zustand store for client-only UI state.
// Server state belongs in React Query, not here.
import { create } from 'zustand';

import { StorageKeys } from '@/constants/storageKeys';
import { storage } from '@/lib/storage';

const VALID_PREFERENCES = ['system', 'light', 'dark'];

export const useSettingsStore = create((set) => ({
  // 'system' follows the OS appearance; 'light'/'dark' pin it.
  themePreference: 'system',
  hydrated: false,

  setThemePreference: (preference) => {
    if (!VALID_PREFERENCES.includes(preference)) return;
    set({ themePreference: preference });
    storage.set(StorageKeys.themePreference, preference);
  },

  hydrate: async () => {
    const stored = await storage.get(StorageKeys.themePreference);
    set({
      themePreference: VALID_PREFERENCES.includes(stored) ? stored : 'system',
      hydrated: true,
    });
  },
}));
