// #genai: Inline textual action (e.g. "Forgot password?", "Remove").
//
// Blue semibold text — the same treatment as "Upgrade my plan" in the reference. Padded well beyond
// the glyphs so the tap target clears the 44pt minimum even though the text itself is small.
//
// Colour alone is a weak affordance (invisible with a colour-vision deficiency), so a link in the
// middle of a sentence should pass `underline`. Standalone links — a row on its own, in the blue
// accent colour, with a verb for a label — are recognisable without one.
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function TextLink({
  label,
  onPress,
  tone = 'primary',
  align = 'center',
  underline = false,
  style,
}) {
  const theme = useTheme();

  const color =
    tone === 'muted'
      ? theme.colors.textMuted
      : tone === 'danger'
        ? theme.colors.danger
        : theme.colors.primary;

  return (
    <PressableScale
      accessibilityLabel={label}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.96}
      dimTo={0.6}
      style={[styles.shell, { alignSelf: align === 'center' ? 'center' : 'flex-start' }, style]}
    >
      <View style={styles.stack}>
        <Text style={[theme.textStyles.label, { color, fontFamily: theme.fonts.text.semibold }]}>
          {label}
        </Text>
        {underline ? <View style={[styles.rule, { backgroundColor: color }]} /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  stack: {
    gap: 3,
  },
  rule: {
    height: StyleSheet.hairlineWidth * 2,
    // The rule tracks the label's width rather than the padded target, so it reads as an underline
    // and not as a divider.
    alignSelf: 'stretch',
    opacity: 0.5,
  },
});
