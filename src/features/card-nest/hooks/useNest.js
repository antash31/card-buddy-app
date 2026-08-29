// #genai: Feature-scoped query hooks. Query keys stay next to the hook that owns them.
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { haptics } from '@/lib/haptics';

import * as nestApi from '../api/nestApi';

export const nestKeys = {
  all: ['nest'],
  list: ['nest', 'list'],
  search: (q, bank) => ['nest', 'search', q ?? '', bank ?? ''],
};

export function useMyCards() {
  return useQuery({
    queryKey: nestKeys.list,
    queryFn: nestApi.fetchMyCards,
  });
}

const SEARCH_DEBOUNCE_MS = 350;

/** A single letter matches most of the catalog, so text-only search waits for two. */
export const MIN_QUERY_LENGTH = 2;

export function useCatalogSearch({ q, bank }) {
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [q]);

  const typed = q.trim();
  const settled = debouncedQ.trim();

  // A bank chip is a filter in its own right, so it can search with no text at all.
  const isActive = Boolean(bank) || settled.length >= MIN_QUERY_LENGTH;

  const query = useQuery({
    queryKey: nestKeys.search(settled, bank),
    queryFn: () => nestApi.searchCatalog({ q: settled || undefined, bank: bank || undefined }),
    enabled: isActive,
    placeholderData: keepPreviousData,
  });

  // The input runs ahead of the debounce. Reporting that gap keeps the screen from claiming
  // "no cards match" about a search it has not run yet.
  const isSettling = typed !== settled;

  return {
    // Cached results outlive the query being disabled, so clearing the search box would
    // otherwise leave the last hits on screen next to the "start typing" prompt.
    cards: isActive ? (query.data?.cards ?? []) : [],
    error: query.error,
    isActive,
    isSearching: isActive && (query.isFetching || isSettling),
    // Only trustworthy once the debounce has caught up and the request has come back.
    hasResolved: isActive && query.isSuccess && !isSettling && !query.isFetching,
  };
}

export function useAddCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nestApi.addCard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: nestKeys.list });
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}

export function useRemoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nestApi.removeCard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: nestKeys.list });
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}
