// #genai: React Query mutations for auth, wired into the session store.
//
// Screens get `{ mutate, isPending, error }` and never touch storage or the store directly, so
// the "what happens after a successful sign-in" rule lives in exactly one place.
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

import * as authApi from '../api/authApi';

/** Shared success path for anything that produces a session. */
function useSessionMutation(mutationFn) {
  const signedIn = useAuthStore((state) => state.signedIn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (data) => {
      // Sign-up with email confirmation enabled returns no session; the screen routes to the
      // "check your inbox" step instead.
      if (!data?.session) return;

      await signedIn(data);
      queryClient.clear();
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}

export function useSignIn() {
  return useSessionMutation(authApi.signIn);
}

export function useSignUp() {
  return useSessionMutation(authApi.signUp);
}

export function useOAuthSignIn() {
  return useSessionMutation(authApi.signInWithProvider);
}

export function useSignOut() {
  const signedOut = useAuthStore((state) => state.signedOut);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,
    // Local state is cleared either way: if the server call fails the user still asked to leave,
    // and the stored token is no longer trustworthy.
    onSettled: async () => {
      await signedOut();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => haptics.success(),
    onError: () => haptics.error(),
  });
}

export function useResendConfirmation() {
  return useMutation({
    mutationFn: authApi.resendConfirmation,
    onSuccess: () => haptics.success(),
  });
}
