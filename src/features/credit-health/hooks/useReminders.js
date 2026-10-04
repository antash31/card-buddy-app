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
  const [failed, setFailed] = useState(false);

  const toggle = useCallback(
    async (next) => {
      if (!next) {
        setBlocked(false);
        setFailed(false);
        setEnabled(false);
        return;
      }

      let status;
      try {
        status = await requestPermission();
      } catch {
        // The request itself failed (not a refusal). Say that, and leave the switch off.
        setFailed(true);
        setEnabled(false);
        return;
      }

      setFailed(false);
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
    failed,
    toggle,
    openSettings: () => Linking.openSettings(),
  };
}
