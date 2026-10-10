// #genai: Query hooks for the wallet features. Keys stay next to the hooks that own them.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { haptics } from '@/lib/haptics';

import * as walletApi from '../api/walletApi';

export const walletKeys = {
  all: ['wallet'],
  status: ['wallet', 'status'],
  audit: ['wallet', 'audit'],
  categorisation: ['wallet', 'categorisation'],
};

/** Cheap: whether the audit has been done. Safe to read on every visit to the Card Nest. */
export function useWalletStatus() {
  return useQuery({ queryKey: walletKeys.status, queryFn: walletApi.fetchWalletStatus });
}

// The audit and the map are functions of the user's *current* cards and the catalog, so they are
// recomputed whenever the screen opens rather than trusted from a cache that predates an added card.
//
// "Opens" needs two triggers: `refetchOnMount` for the first visit, and focus (`useRefetchOnFocus`)
// for every return to a screen the tab navigator kept mounted.
const ALWAYS_FRESH = { staleTime: 0, refetchOnMount: 'always' };

export function useAudit() {
  const query = useQuery({ queryKey: walletKeys.audit, queryFn: walletApi.fetchAudit, ...ALWAYS_FRESH });
  useRefetchOnFocus(query);
  return query;
}

export function useCategorisation() {
  const query = useQuery({ queryKey: walletKeys.categorisation, queryFn: walletApi.fetchCategorisation, ...ALWAYS_FRESH });
  useRefetchOnFocus(query);
  return query;
}

export function useSaveAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletApi.saveAudit,
    onSuccess: (data) => {
      // The response is the fresh audit state, so the results can render without a second round trip.
      queryClient.setQueryData(walletKeys.audit, data);
      queryClient.invalidateQueries({ queryKey: walletKeys.status });
      queryClient.invalidateQueries({ queryKey: walletKeys.categorisation });
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}

/** Answers a question the audit raised ("which version of this card do you hold?"). */
export function useAnswerFact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletApi.answerFact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.audit });
      await queryClient.invalidateQueries({ queryKey: walletKeys.categorisation });
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}
