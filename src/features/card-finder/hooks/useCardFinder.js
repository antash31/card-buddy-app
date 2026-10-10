// #genai: Query hooks for Card Finder. The keys stay next to the hooks that own them.
import { useMutation, useQuery } from '@tanstack/react-query';

import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { haptics } from '@/lib/haptics';

import * as cardFinderApi from '../api/cardFinderApi';

export const cardFinderKeys = {
  all: ['card-finder'],
  form: ['card-finder', 'form'],
};

/**
 * Recommendations are a function of the cards held, the audit's spend and the catalog, so they are
 * recomputed whenever the screen opens: on mount for the first visit, on focus for every return to
 * a screen the tab navigator kept mounted (after adding a card, say).
 */
export function useRecommendations() {
  const query = useQuery({
    queryKey: cardFinderKeys.all,
    queryFn: cardFinderApi.fetchRecommendations,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  useRefetchOnFocus(query);
  return query;
}

/** The form's questions, plus the saved spend, goal and card count it starts from (those change). */
export function useFinderForm() {
  return useQuery({ queryKey: cardFinderKeys.form, queryFn: cardFinderApi.fetchFinderForm, staleTime: 0 });
}

/** Scores the form's answers. Stateless on the server; the result lives in the mutation. */
export function usePreview() {
  return useMutation({
    mutationFn: cardFinderApi.previewRecommendations,
    onSuccess: () => haptics.success(),
    onError: () => haptics.error(),
  });
}
