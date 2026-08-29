// #genai: Inline textual action (e.g. "Forgot password?").
//
// Padded well beyond the glyphs so the tap target clears the 44pt minimum even though the text
// itself is small. The rule under the label is what marks it as an action — colour alone is not a
// sufficient affordance, and it is invisible to anyone with a red-green deficiency.
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function TextLink({
  label,
  onPress,
  tone = 'primary',
  align = 'center',
  underline = true,
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
      scaleTo={0.97}
      dimTo={0.6}
      style={[styles.shell, { alignSelf: align === 'center' ? 'center' : 'flex-start' }, style]}
    >
      <View style={styles.stack}>
        <Text
          style={[
            theme.textStyles.label,
            styles.label,
            { color, fontFamily: theme.fonts.text.semibold },
          ]}
        >
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
  label: {
    letterSpacing: 0.15,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    // The rule tracks the label's width rather than the padded target, so it reads as an underline
    // and not as a divider.
    alignSelf: 'stretch',
    opacity: 0.5,
  },
});
