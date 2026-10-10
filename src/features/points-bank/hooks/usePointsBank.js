// #genai: Query hooks for Points Bank. Keys stay next to the hooks that own them.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { haptics } from '@/lib/haptics';

import * as pointsBankApi from '../api/pointsBankApi';

export const pointsKeys = {
  overview: ['points-bank'],
};

// Values come from the catalog's redemption routes, which can change, so the bank is recomputed on
// every visit rather than trusted from a cache.
export function usePointsBank() {
  const query = useQuery({
    queryKey: pointsKeys.overview,
    queryFn: pointsBankApi.fetchPointsBank,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  useRefetchOnFocus(query);
  return query;
}

export function useSaveBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pointsBankApi.saveBalance,
    onSuccess: (bank) => {
      // The response is the recomputed bank, so the screen updates without a second round trip.
      queryClient.setQueryData(pointsKeys.overview, bank);
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}
