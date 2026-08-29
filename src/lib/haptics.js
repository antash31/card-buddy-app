// #genai: Haptics wrapper — no-ops on web and never throws on unsupported hardware.
//
// Feedback is only worth firing on genuinely meaningful moments (commit, success, failure).
// Over-feedback trains people to ignore all of it, so callers opt in deliberately.
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

function run(action) {
  if (!isSupported) return;
  action().catch(() => {
    // Haptics are decorative; a failure must never interrupt the interaction.
  });
}

export const haptics = {
  /** Light tap for pressing an interactive element. */
  selection: () => run(() => Haptics.selectionAsync()),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

/** Maps a `haptic` prop value onto the matching effect. */
export function fireHaptic(kind) {
  if (!kind) return;
  const effect = haptics[kind];
  if (effect) effect();
}
