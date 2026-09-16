// #genai: Query hooks for wallet comparison.
import { useMutation } from '@tanstack/react-query';

import { haptics } from '@/lib/haptics';

import * as swipemaxApi from '../api/swipemaxApi';

export function useComparePurchase() {
  return useMutation({
    mutationFn: swipemaxApi.comparePurchase,
    onSuccess: () => haptics.success(),
    onError: () => haptics.error(),
  });
}
