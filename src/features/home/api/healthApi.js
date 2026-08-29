// #genai: Feature-scoped API calls. Each feature owns its own requests.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { pingSupabase } from '@/lib/supabase';

export function fetchHealth() {
  return apiClient.get(endpoints.health);
}

/** Backend readiness (+ Supabase via service role) and direct anon client ping. */
export async function fetchConnectionStatus() {
  const [ready, direct] = await Promise.all([
    // 503 is a valid "degraded" readiness response — still unwrap the envelope
    apiClient.get(endpoints.healthReady, {
      validateStatus: (status) => status === 200 || status === 503,
    }),
    pingSupabase(),
  ]);

  return {
    backend: ready,
    supabaseDirect: direct,
  };
}
