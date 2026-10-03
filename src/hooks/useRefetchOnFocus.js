// #genai: Refetch a query whenever its screen regains focus.
//
// `refetchOnMount` only fires when a screen mounts, and a tab navigator keeps a visited screen
// mounted, so coming back to it (after adding a card, say) never remounts it and the data would be
// stale. Focus is the moment that actually means "the user is looking at this again".
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

export function useRefetchOnFocus(query) {
  const { refetch } = query;
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // The first focus coincides with the mount fetch; fetching again would just double the work.
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
}
