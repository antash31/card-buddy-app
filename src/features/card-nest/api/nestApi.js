// #genai: Card Nest + catalog search through the Express API.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function searchCatalog({ q, bank } = {}) {
  return apiClient.get(endpoints.cards.search, {
    params: {
      ...(q ? { q } : {}),
      ...(bank ? { bank } : {}),
    },
  });
}

export function fetchMyCards() {
  return apiClient.get(endpoints.userCards.root);
}

export function addCard(cardId) {
  return apiClient.post(endpoints.userCards.root, { cardId });
}

export function removeCard(userCardId) {
  return apiClient.patch(endpoints.userCards.remove(userCardId));
}
