// #genai: Query hook for Card Lab. The list and the card page share one query: the whole nest.
import { useQuery } from '@tanstack/react-query';

import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';

import * as cardLabApi from '../api/cardLabApi';

export const cardLabKeys = {
  overview: ['card-lab'],
};

// The catalog's rules change when a card is reloaded, and a rule can end on any day, so the lab is
// read fresh on every visit rather than trusted from a cache.
export function useCardLab() {
  const query = useQuery({
    queryKey: cardLabKeys.overview,
    queryFn: cardLabApi.fetchCardLab,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  useRefetchOnFocus(query);
  return query;
}
