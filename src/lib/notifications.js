// #genai: The one place that talks to expo-notifications.
//
// Everything else asks for "permission", "schedule this at that time" or "cancel mine" and never
// imports the package, so a screen or a test cannot trip over its native module, and a platform that
// cannot schedule local notifications (web) just reports itself unsupported.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { logger } from './logger';

/** Local scheduled notifications are not available in a browser. */
export const notificationsSupported = Platform.OS !== 'web';

export const CHANNEL_ID = 'credit-reminders';

let configured = false;

/** Idempotent: a notification that arrives while the app is open still shows as a banner. */
export function configureNotifications() {
  if (!notificationsSupported || configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Statement and due-date reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** 'granted' | 'denied' | 'undetermined'. Never prompts. */
export async function getPermission() {
  if (!notificationsSupported) return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Shows the system prompt if the user has not decided yet. Returns the resulting status. */
export async function requestPermission() {
  if (!notificationsSupported) return 'denied';
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted' || !current.canAskAgain) return current.status;
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/** Schedules a one-off notification. Re-using an `id` replaces the earlier one. */
export async function scheduleAt({ id, title, body, date, data }) {
  await ensureChannel();
  return Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
  });
}

/** How many scheduled notifications have an id starting with `prefix`. */
export async function countByPrefix(prefix) {
  if (!notificationsSupported) return 0;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.filter((item) => item.identifier.startsWith(prefix)).length;
  } catch {
    return 0;
  }
}

/** Cancels every scheduled notification whose id starts with `prefix`. Returns how many. */
export async function cancelByPrefix(prefix) {
  if (!notificationsSupported) return 0;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const mine = scheduled.filter((item) => item.identifier.startsWith(prefix));
    await Promise.all(mine.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
    return mine.length;
  } catch (error) {
    // Clearing reminders must never be the reason a sign-out or a sync fails.
    logger.warn('notifications', 'could not cancel scheduled notifications', error?.message);
    return 0;
  }
}

/** Calls `handler(data)` when the user taps a notification, including the one that launched the app. */
export function onNotificationOpened(handler) {
  if (!notificationsSupported) return () => {};

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handler(response.notification.request.content.data ?? {});
  });

  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) handler(response.notification.request.content.data ?? {});
    })
    .catch(() => {});

  return () => subscription.remove();
}
