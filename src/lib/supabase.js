// #genai — Supabase JS client for the app (anon key + AsyncStorage session)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';
import { logger } from '@/lib/logger';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  logger.warn(
    'supabase',
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY — client will not work until .env is set',
  );
}

export const supabase = createClient(env.supabaseUrl || 'https://placeholder.supabase.co', env.supabaseAnonKey || 'placeholder', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/** Lightweight connectivity check against Supabase Auth (anon key). */
export async function pingSupabase() {
  const { error } = await supabase.auth.getSession();
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true, message: 'reachable', url: env.supabaseUrl };
}
