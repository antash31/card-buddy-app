// #genai: Session state for the whole app.
//
// This is deliberately Zustand rather than React Query: navigation gating reads it on every
// render, and it must have a synchronous answer to "is this person signed in?". React Query still
// owns everything fetched *because* of a session.
import { clearSmsOnLogout, nativeSession } from '@/features/tracking/native';
import { queryClient } from '@/api/queryClient';
import { create } from 'zustand';

import { configureSessionBridge } from '@/api/sessionBridge';
import { StorageKeys } from '@/constants/storageKeys';
import { logger } from '@/lib/logger';
import { secureStorage } from '@/lib/storage';

async function persistTokens(session) {
  await Promise.all([
    secureStorage.set(StorageKeys.accessToken, session.accessToken),
    secureStorage.set(StorageKeys.refreshToken, session.refreshToken),
  ]);
}

async function clearTokens() {
  await clearSmsOnLogout();
  queryClient.clear();
  await Promise.all([
    secureStorage.remove(StorageKeys.accessToken),
    secureStorage.remove(StorageKeys.refreshToken),
  ]);
}

export const useAuthStore = create((set) => ({
  // 'loading' until the persisted session has been checked, so the router never flashes the
  // sign-in screen at someone who is already authenticated.
  status: 'loading',
  user: null,
  profile: null,

  /** Stores a freshly issued session and marks the user signed in. */
  signedIn: async ({ session, user, profile }) => {
    await clearSmsOnLogout();
    await persistTokens(session);
    set({ status: 'authenticated', user, profile: profile ?? null });
  },

  signedOut: async () => {
    await clearTokens();
    set({ status: 'unauthenticated', user: null, profile: null });
  },

  setProfile: (profile) => set({ profile }),

  /** Restores a session at launch by validating the stored token against the API. */
  hydrate: async () => {
    await nativeSession();
    const token = await secureStorage.get(StorageKeys.accessToken);

    if (!token) {
      set({ status: 'unauthenticated', user: null, profile: null });
      return;
    }

    try {
      // Imported lazily: the API layer pulls in config that expects the app to be running.
      const { fetchCurrentUser } = await import('@/features/auth/api/authApi');
      const { user, profile } = await fetchCurrentUser();
      set({ status: 'authenticated', user, profile });
    } catch (error) {
      // A failed restore is a normal cold-start outcome (expired or revoked token).
      logger.debug('auth', 'could not restore session', error?.message);
      await clearTokens();
      set({ status: 'unauthenticated', user: null, profile: null });
    }
  },
}));

// The axios client refreshes tokens on its own; these keep the store in step with it.
configureSessionBridge({
  onSessionRefreshed: ({ user, profile }) => {
    useAuthStore.setState((state) => ({
      status: 'authenticated',
      user: user ?? state.user,
      profile: profile ?? state.profile,
    }));
  },
  onSessionExpired: () => {
    void clearTokens();
    useAuthStore.setState({ status: 'unauthenticated', user: null, profile: null });
  },
});

/** True once a session exists but the profile step has not been finished. */
export function selectNeedsOnboarding(state) {
  return state.status === 'authenticated' && state.profile?.onboardingCompleted === false;
}
