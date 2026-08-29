// #genai: Form-level status message (request failed, email sent, etc).
//
// Used only for feedback that belongs to the whole form. Anything about a single field is shown
// beneath that field instead, where the user is already looking.
//
// The tone is carried by a background tint and a full hairline border — deliberately not by a thick
// coloured stripe down one edge, which is the most overused "design touch" in this category of UI
// and never looks intentional.
import { StyleSheet, Text, View } from 'react-native';

import { AlertIcon, CheckIcon } from '@/components/icons';
import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';

const TONES = {
  error: { accent: 'danger', fill: 'dangerSubtle', Icon: AlertIcon },
  success: { accent: 'success', fill: 'successSubtle', Icon: CheckIcon },
  info: { accent: 'primary', fill: 'primarySubtle', Icon: AlertIcon },
  warning: { accent: 'warning', fill: 'warningSubtle', Icon: AlertIcon },
};

export function FormBanner({ message, tone = 'error' }) {
  const theme = useTheme();

  if (!message) return null;

  const { accent, fill, Icon } = TONES[tone] ?? TONES.error;

  return (
    <Reveal key={message} distance={6}>
      <View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[
          styles.banner,
          {
            borderRadius: theme.radius.sm,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
            backgroundColor: theme.colors[fill],
            borderColor: theme.colors[accent],
          },
        ]}
      >
        <Icon size={16} color={theme.colors[accent]} />
        <Text style={[theme.textStyles.label, styles.text, { color: theme.colors.text }]}>
          {message}
        </Text>
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    flex: 1,
  },
});
