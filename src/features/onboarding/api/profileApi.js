// #genai: Profile reads/writes through the Express API.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function fetchProfile() {
  return apiClient.get(endpoints.profile.root);
}

export function updateProfile(changes) {
  return apiClient.patch(endpoints.profile.root, changes);
}

export function fetchOnboardingStatus() {
  return apiClient.get(endpoints.profile.onboarding);
}

export function saveIdentity(identity) {
  return apiClient.patch(endpoints.profile.onboardingIdentity, identity);
}

export function saveFinancialSnapshot(snapshot) {
  return apiClient.patch(endpoints.profile.onboardingFinancial, snapshot);
}

export function saveOptimizationGoal(optimizationGoal) {
  return apiClient.post(endpoints.profile.onboardingGoal, { optimizationGoal });
}
