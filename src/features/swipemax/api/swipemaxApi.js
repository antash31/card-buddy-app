// #genai: SwipeMax compare + cap self-report through Express.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function comparePurchase(body) {
  return apiClient.post(endpoints.swipemax.compare, body);
}

export function fetchCapConsumption(capId) {
  return apiClient.get(endpoints.swipemax.capConsumption(capId));
}

export function reportCapUsage(capId, reportedValue) {
  return apiClient.post(endpoints.swipemax.capSelfReport(capId), { reportedValue });
}
