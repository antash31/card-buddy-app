// #genai: Wallet Audit + Wallet Categorisation through the Express API.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function fetchWalletStatus() {
  return apiClient.get(endpoints.wallet.status);
}

export function fetchAudit() {
  return apiClient.get(endpoints.wallet.audit);
}

export function saveAudit({ monthly, payMix }) {
  return apiClient.put(endpoints.wallet.audit, { monthly, payMix });
}

export function fetchCategorisation() {
  return apiClient.get(endpoints.wallet.categorisation);
}

export function answerFact({ conditionKey, value, cardId }) {
  return apiClient.put(endpoints.wallet.facts, { conditionKey, value, ...(cardId ? { cardId } : {}) });
}
