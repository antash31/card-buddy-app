// #genai: Card Lab through the Express API.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function fetchCardLab() {
  return apiClient.get(endpoints.cardLab.overview);
}
