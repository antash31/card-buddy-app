// #genai: Lower-emphasis actions — outlined and ghost variants.
//
// Not every action gets pine. An outline here and a text link below it is what makes the one solid
// button on the screen mean something.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function SecondaryButton({
  label,
  onPress,
  variant = 'outline',
  tone = 'default',
  icon: Icon,
  loading = false,
  disabled = false,
  style,
}) {
  const theme = useTheme();
  const isOutline = variant === 'outline';
  const isInactive = disabled || loading;

  const contentColor = tone === 'danger' ? theme.colors.danger : theme.colors.text;
  const borderColor = tone === 'danger' ? theme.colors.danger : theme.colors.borderStrong;

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.98}
      style={[
        styles.shell,
        {
          height: theme.metrics.buttonHeight,
          borderRadius: theme.radius.md,
          borderWidth: isOutline ? StyleSheet.hairlineWidth : 0,
          borderColor,
          backgroundColor: isOutline ? theme.colors.surface : 'transparent',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <View style={[styles.content, { gap: theme.spacing.sm }]}>
          {Icon && <Icon size={17} color={contentColor} />}
          <Text
            numberOfLines={1}
            style={[theme.textStyles.bodyStrong, styles.label, { color: contentColor }]}
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
