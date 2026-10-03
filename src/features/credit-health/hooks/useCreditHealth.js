// #genai: Query hooks for CIBIL Protector. Keys stay next to the hooks that own them.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { haptics } from '@/lib/haptics';

import * as creditHealthApi from '../api/creditHealthApi';

export const creditKeys = {
  overview: ['credit-health'],
};

const overviewQuery = {
  queryKey: creditKeys.overview,
  queryFn: creditHealthApi.fetchCreditHealth,
  staleTime: 0,
  refetchOnMount: 'always',
};

/**
 * The overview without any navigation coupling, so it can be read from the app shell. `enabled: false`
 * keeps it from asking the server while nobody is signed in.
 */
export function useCreditOverview({ enabled = true } = {}) {
  return useQuery({ ...overviewQuery, enabled });
}

// Utilisation is derived from tracked spend, which moves whenever an alert is synced, so it is
// recomputed on every visit rather than trusted from a cache.
export function useCreditHealth() {
  const query = useCreditOverview();
  useRefetchOnFocus(query);
  return query;
}

export function useSaveCreditProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creditHealthApi.saveCreditProfile,
    onSuccess: (overview) => {
      // The response is the recomputed overview, so the screen updates without a second round trip.
      queryClient.setQueryData(creditKeys.overview, overview);
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}
