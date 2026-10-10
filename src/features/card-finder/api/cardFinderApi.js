// #genai: Card Finder through the Express API.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** Recommendations on the spend saved in the wallet audit (409 AUDIT_INCOMPLETE until there is some). */
export function fetchRecommendations() {
  return apiClient.get(endpoints.recommendations.root);
}

/** The form's questions, and the saved spend and goal to start it from. */
export function fetchFinderForm() {
  return apiClient.get(endpoints.recommendations.form);
}

/** Recommendations on answers given in the form. Nothing is stored. */
export function previewRecommendations({ monthly, payMix, goal, includeNest }) {
  return apiClient.post(endpoints.recommendations.preview, { monthly, payMix, goal: goal ?? null, includeNest });
}
