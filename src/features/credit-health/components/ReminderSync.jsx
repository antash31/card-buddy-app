// #genai: Keeps statement and due-date reminders scheduled, from the app shell.
//
// Mounted once for the signed-in area, so reminders stay in step with the data wherever the user is,
// not only while the CIBIL Protector screen is open. It re-reads the data when the app returns to the
// foreground (the moment a date or limit may have changed elsewhere) and sends a tapped reminder to
// the screen it is about. Renders nothing.
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { logger } from '@/lib/logger';
import { configureNotifications, onNotificationOpened } from '@/lib/notifications';
import { useAuthStore } from '@/store/authStore';

import { creditKeys, useCreditOverview } from '../hooks/useCreditHealth';
import { syncReminders } from '../lib/reminderSync';
import { useReminderStore } from '../store/reminderStore';

export function ReminderSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signedIn = useAuthStore((state) => state.status === 'authenticated');
  // Nothing to schedule, and nothing to ask the server, unless someone is signed in.
  const { data } = useCreditOverview({ enabled: signedIn });

  const enabled = useReminderStore((state) => state.enabled);
  const hydrated = useReminderStore((state) => state.hydrated);
  const hydrate = useReminderStore((state) => state.hydrate);

  useEffect(() => {
    configureNotifications();
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || !signedIn) return;
    // A reminder that cannot be scheduled is a missing nudge, never a crash.
    syncReminders({ overview: data, enabled }).catch((error) => {
      logger.warn('reminders', 'sync failed', error?.message);
    });
  }, [data, enabled, hydrated, signedIn]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void queryClient.invalidateQueries({ queryKey: creditKeys.overview });
    });
    return () => subscription.remove();
  }, [queryClient]);

  useEffect(
    () =>
      onNotificationOpened((payload) => {
        if (payload?.screen === 'credit-health') router.push('/credit-health');
      }),
    [router],
  );

  return null;
}
