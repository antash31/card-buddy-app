// #genai: Whether the user wants credit reminders. Client-only, so it lives here and not in React Query.
//
// Off until they turn it on: the first "on" is what triggers the system permission prompt, which is
// best asked for in the moment the person has just said they want it.
import { create } from 'zustand';

import { StorageKeys } from '@/constants/storageKeys';
import { storage } from '@/lib/storage';

export const useReminderStore = create((set) => ({
  enabled: false,
  hydrated: false,

  setEnabled: (enabled) => {
    set({ enabled: enabled === true });
    storage.set(StorageKeys.creditReminders, { enabled: enabled === true });
  },

  hydrate: async () => {
    const stored = await storage.get(StorageKeys.creditReminders);
    set({ enabled: stored?.enabled === true, hydrated: true });
  },
}));
