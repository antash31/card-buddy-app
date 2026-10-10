import { useEffect } from 'react';
import { AppState } from 'react-native';

import { queryClient } from '@/api/queryClient';
import { useAuthStore } from '@/store/authStore';

import { trackingApi } from './api';
import { flushSms, nativeSession, smsStatus } from './native';

export function TrackingLifecycle() {
  const userId = useAuthStore((s) => s.user?.id);
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    let running = false;
    let last = 0;
    const sync = async () => {
      if (running || Date.now() - last < 60000) return;
      running = true; last = Date.now();
      try {
        await smsStatus(); await nativeSession(); await flushSms();
        const data = await trackingApi.connections();
        for (const connection of data.connections) {
          if (cancelled || useAuthStore.getState().user?.id !== userId) break;
          if (!['connected', 'retry'].includes(connection.status)) continue;
          try { await trackingApi.sync(connection.connectionId); } catch { /* Status is available in tracking settings. */ }
        }
        if (!cancelled) await queryClient.invalidateQueries({ queryKey: ['tracking', userId] });
      } catch { /* Offline: native WorkManager and scheduled provider workers retry. */ }
      finally { running = false; }
    };
    void sync();
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') void sync(); });
    return () => { cancelled = true; listener.remove(); };
  }, [userId]);
  return null;
}
