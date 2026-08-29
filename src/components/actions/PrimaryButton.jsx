// #genai: The single most prominent action on a screen.
//
// Solid pine, not a gradient. A gradient on a button is decoration that implies depth the button
// does not have, and it is one of the clearest tells of generated UI. The colour is doing enough
// work on its own — it is the only saturated thing on the page.
//
// The loading state swaps the label for a spinner *in place* and keeps the button's height, so
// submitting never reflows the form. The button stays mounted rather than disappearing, which keeps
// the user oriented while the request is in flight.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon: Icon,
  style,
}) {
  const theme = useTheme();
  const isInactive = disabled || loading;

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      haptic="medium"
      onPress={onPress}
      scaleTo={0.98}
      dimTo={0.9}
      style={[
        styles.shell,
        {
          height: theme.metrics.buttonHeight,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.primary,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary} size="small" />
      ) : (
        <View style={[styles.content, { gap: theme.spacing.sm }]}>
          {Icon && <Icon size={17} color={theme.colors.onPrimary} />}
          <Text
            numberOfLines={1}
            style={[theme.textStyles.bodyStrong, styles.label, { color: theme.colors.onPrimary }]}
          >
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    letterSpacing: 0.1,
  },
});
