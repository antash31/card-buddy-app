// #genai: Single source of truth for runtime configuration.
// Expo inlines `process.env.EXPO_PUBLIC_*` at build time, so these must be read as
// full static member expressions (no destructuring of `process.env`).
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_URL = 'http://localhost:3001/api';
const DEFAULT_TIMEOUT = 15000;

const LOOPBACK_HOSTS = ['localhost', '127.0.0.1'];
// The Android emulator is a separate VM; this alias routes to the host machine's loopback.
const ANDROID_EMULATOR_HOST = '10.0.2.2';

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Host serving the Metro bundle (e.g. "192.168.1.2") — normally the same machine as the API.
function getDevServerHost() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  const host = hostUri?.split('://').pop()?.split('/')[0]?.split(':')[0];
  return host || null;
}

// On a simulator, emulator or phone, "localhost" is the device itself — not the machine
// running the API. Resolve an address the device can actually reach.
function getReachableHost() {
  // On web the bundle runs on the host machine, so loopback is already correct.
  if (Platform.OS === 'web') return null;

  const devHost = getDevServerHost();
  if (devHost && !LOOPBACK_HOSTS.includes(devHost)) return devHost;

  // Dev server is itself on loopback (e.g. tunnel or `--localhost`).
  return Platform.OS === 'android' ? ANDROID_EMULATOR_HOST : null;
}

// Only loopback URLs are rewritten, so a real staging/production URL passes through untouched.
function resolveApiUrl(configuredUrl) {
  const host = getReachableHost();
  if (!host) return configuredUrl;

  return configuredUrl.replace(
    /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/i,
    (_match, scheme) => `${scheme}${host}`,
  );
}

export const env = {
  apiUrl: resolveApiUrl(process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL),
  apiTimeout: toNumber(process.env.EXPO_PUBLIC_API_TIMEOUT, DEFAULT_TIMEOUT),
  name: process.env.EXPO_PUBLIC_ENV ?? 'development',
  // #genai — public Supabase config for auth / RLS client (never service role)
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const isDev = __DEV__;
