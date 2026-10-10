// #genai: Makes the phone's scheduled notifications match the current credit-health data.
//
// Idempotent and cheap: it clears this feature's reminders and schedules the current set, with stable
// ids, so running it twice, or twice at once, ends in the same place. It is safe to call whenever the
// data might have changed.
import { logger } from '@/lib/logger';
import * as notifications from '@/lib/notifications';

import { buildReminders, ID_PREFIX } from './reminders';

/**
 * @returns {Promise<{ scheduled: number, reason?: 'disabled' | 'no-data' | 'permission' }>}
 */
export async function syncReminders({ overview, enabled, now = new Date(), api = notifications }) {
  if (!enabled) {
    await api.cancelByPrefix(ID_PREFIX);
    return { scheduled: 0, reason: 'disabled' };
  }

  // No data yet (or the fetch failed): leave whatever is already scheduled alone rather than clear it.
  if (!overview) return { scheduled: 0, reason: 'no-data' };

  if ((await api.getPermission()) !== 'granted') {
    await api.cancelByPrefix(ID_PREFIX);
    return { scheduled: 0, reason: 'permission' };
  }

  await api.cancelByPrefix(ID_PREFIX);

  const reminders = buildReminders(overview.cards, now);
  let scheduled = 0;
  for (const reminder of reminders) {
    try {
      await api.scheduleAt(reminder);
      scheduled += 1;
    } catch (error) {
      // One bad notification must not stop the rest.
      logger.warn('reminders', `could not schedule ${reminder.id}`, error?.message);
    }
  }

  // Ask the system what it actually holds, not just what we asked for: a scheduling call that
  // resolves is not proof the notification is pending.
  const pending = await api.countByPrefix(ID_PREFIX);
  logger.debug('reminders', `scheduled ${scheduled} credit reminders; system has ${pending} pending`);
  return { scheduled };
}

/** Called on sign-out: another account's cards must not keep reminding this phone. */
export function clearReminders(api = notifications) {
  return api.cancelByPrefix(ID_PREFIX);
}
