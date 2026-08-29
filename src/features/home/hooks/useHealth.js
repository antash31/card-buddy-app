// #genai: Feature-scoped query hook. Query keys stay next to the hook that owns them.
import { useQuery } from '@tanstack/react-query';

import { fetchConnectionStatus, fetchHealth } from '../api/healthApi';

export const healthKeys = {
  all: ['health'],
  connection: ['health', 'connection'],
};

export function useHealth({ enabled = false } = {}) {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: fetchHealth,
    enabled,
  });
}

export function useConnectionStatus({ enabled = false } = {}) {
  return useQuery({
    queryKey: healthKeys.connection,
    queryFn: fetchConnectionStatus,
    enabled,
    retry: 1,
  });
}
