import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

export const trackingApi = {
  connections: () => apiClient.get('/financial-connections'),
  start: (provider) => apiClient.post(`/financial-connections/${provider}/start`),
  sync: (id) => apiClient.post(`/financial-connections/${id}/sync`, {}, { timeout: 120000 }),
  disconnect: (id) => apiClient.delete(`/financial-connections/${id}`),
  recent: (id) => apiClient.get(`/user-cards/${id}/transactions`, { params: { limit: 10 } }),
  suffix: (id, cardLast4) => apiClient.patch(`/user-cards/${id}/tracking-details`, { cardLast4 }),
  review: () => apiClient.get('/spend-events', { params: { state: 'needs_review' } }),
  events: () => apiClient.get('/spend-events'),
  catalog: () => apiClient.get('/spend-events/catalog'),
  patch: (id, patch) => apiClient.patch(`/spend-events/${id}`, patch),
  remove: (id) => apiClient.delete(`/spend-events/${id}`),
  purge: () => apiClient.delete('/spend-events'),
  manual: (body) => apiClient.post('/spend-events/manual', { body }),
};
export function useTrackingQuery(key, fn, enabled = true) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({ queryKey: ['tracking', userId, ...key], queryFn: fn, enabled: !!userId && enabled, retry: 1 });
}
export function useTrackingMutation(fn) {
  const client = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: async () => {
    await client.invalidateQueries({ queryKey: ['tracking'] });
    await client.invalidateQueries({ queryKey: ['swipemax'] });
  } });
}
