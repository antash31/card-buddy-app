// #genai: CIBIL Protector through the Express API.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function fetchCreditHealth() {
  return apiClient.get(endpoints.creditHealth.overview);
}

/** `body` carries only what changed; `null` clears a field. The response is the whole overview. */
export function saveCreditProfile({ userCardId, body }) {
  return apiClient.put(endpoints.creditHealth.card(userCardId), body);
}
