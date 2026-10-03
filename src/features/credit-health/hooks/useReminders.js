// #genai: The reminders switch: asks for permission when it is turned on, and keeps the phone's
// scheduled notifications in step with the data.
import { Linking } from 'react-native';
import { useCallback, useState } from 'react';

import { notificationsSupported, requestPermission } from '@/lib/notifications';

import { useReminderStore } from '../store/reminderStore';

export function useReminderToggle() {
  const enabled = useReminderStore((state) => state.enabled);
  const setEnabled = useReminderStore((state) => state.setEnabled);
  const [blocked, setBlocked] = useState(false);

  const toggle = useCallback(
    async (next) => {
      if (!next) {
        setBlocked(false);
        setEnabled(false);
        return;
      }

      const status = await requestPermission();
      if (status === 'granted') {
        setBlocked(false);
        setEnabled(true);
      } else {
        // The person said yes, but the system said no (now, or earlier). Say so; do not pretend.
        setBlocked(true);
        setEnabled(false);
      }
    },
    [setEnabled],
  );

  return {
    supported: notificationsSupported,
    enabled,
    blocked,
    toggle,
    openSettings: () => Linking.openSettings(),
  };
}
