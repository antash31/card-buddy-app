// #genai: Points Bank through the Express API.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function fetchPointsBank() {
  return apiClient.get(endpoints.pointsBank.overview);
}

/** `balance` is a number, or `null` to clear it. The response is the whole recomputed bank. */
export function saveBalance({ userCardId, balance }) {
  return apiClient.put(endpoints.pointsBank.balance(userCardId), { balance });
}
