// #genai: Turn statement and due-date reminders on or off.
//
// A reminder is the point where this feature stops being a screen you check and starts looking out
// for you. It asks for notification permission only when switched on, and if the system refuses it
// says so and points at Settings instead of leaving a switch that looks on and does nothing.
import { StyleSheet, Switch, Text, View } from 'react-native';

import { TextLink } from '@/components/actions/TextLink';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { useReminderToggle } from '../hooks/useReminders';
import { STATEMENT_LEAD_DAYS, DUE_LEAD_DAYS } from '../lib/reminders';

export function ReminderToggle({ hasDates }) {
  const theme = useTheme();
  const { supported, enabled, blocked, toggle, openSettings } = useReminderToggle();

  if (!supported) return null;

  return (
    <Surface contentStyle={{ gap: theme.spacing.md }}>
      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <View style={styles.copy}>
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>Reminders</Text>
          <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
            {enabled
              ? `At 9am, ${STATEMENT_LEAD_DAYS} days before each statement and ${DUE_LEAD_DAYS} days before each payment due date.`
              : 'A nudge before each statement and due date, so a card does not tip over 30% or a payment slip by.'}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Reminders"
          value={enabled}
          onValueChange={toggle}
          trackColor={{ false: theme.colors.borderStrong, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
          ios_backgroundColor={theme.colors.borderStrong}
        />
      </View>

      {!hasDates ? (
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
          Add a statement day to a card first. Reminders follow those dates.
        </Text>
      ) : null}

      {blocked ? (
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>
            Notifications are turned off for Card Buddy, so there is nothing to remind you with.
          </Text>
          <TextLink label="Open Settings" onPress={openSettings} align="start" />
        </View>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
