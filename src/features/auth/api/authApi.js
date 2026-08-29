// #genai: Every auth network call the app makes.
//
// The app never talks to Supabase Auth directly — the Express API proxies it, so credential
// handling, rate limiting and error shaping all live in one auditable place.
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { ApiError } from '@/api/ApiError';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

import { createPkcePair, extractAuthCode } from '../lib/pkce';

export function signUp({ email, password, fullName }) {
  return apiClient.post(endpoints.auth.signUp, { email, password, fullName }, { skipAuth: true });
}

export function signIn({ email, password }) {
  return apiClient.post(endpoints.auth.signIn, { email, password }, { skipAuth: true });
}

export function signOut() {
  return apiClient.post(endpoints.auth.signOut);
}

export function fetchCurrentUser() {
  return apiClient.get(endpoints.auth.me);
}

export function forgotPassword(email) {
  return apiClient.post(endpoints.auth.forgotPassword, { email }, { skipAuth: true });
}

export function resendConfirmation(email) {
  return apiClient.post(endpoints.auth.resendConfirmation, { email }, { skipAuth: true });
}

export function updatePassword(password) {
  return apiClient.post(endpoints.auth.updatePassword, { password });
}

/**
 * Runs the full OAuth round trip: ask the API for a consent URL, open the system browser, then
 * trade the returned code plus our locally held verifier for a session.
 */
export async function signInWithProvider(provider) {
  const { verifier, challenge } = await createPkcePair();

  // Resolves to the dev-client URL under Expo Go and to `cardbuddy://` in a build. Whatever it
  // resolves to must be allow-listed in Supabase → Authentication → URL Configuration.
  const redirectTo = Linking.createURL('auth/callback');

  const { url } = await apiClient.post(
    endpoints.auth.oauthUrl,
    { provider, codeChallenge: challenge, redirectTo },
    { skipAuth: true },
  );

  const result = await WebBrowser.openAuthSessionAsync(url, redirectTo, {
    preferEphemeralSession: true,
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new ApiError({ message: 'Sign-in was cancelled.', code: 'OAUTH_CANCELLED', status: 0 });
  }

  const { code, error } = extractAuthCode(result.url);

  if (error || !code) {
    throw new ApiError({
      message: error || 'That provider did not return a valid sign-in.',
      code: 'OAUTH_FAILED',
      status: 400,
    });
  }

  return apiClient.post(
    endpoints.auth.oauthCallback,
    { code, codeVerifier: verifier },
    { skipAuth: true },
  );
}
