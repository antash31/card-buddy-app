// #genai: Lower-emphasis actions — a soft raised pill, or a bare ghost.
//
// Not every action gets the glowing blue. A white pill here and a text link below it is what makes
// the one blue button on the screen mean something. These are solid soft surfaces, not glass:
// screens like Tracking carry a dozen of them, and a live blur on each would cost real frames for
// no visible gain at this size. Glass is for the few things that genuinely float.
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
  const isSolid = variant === 'outline';
  const isInactive = disabled || loading;

  const contentColor =
    tone === 'danger'
      ? theme.colors.danger
      : variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.text;

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.97}
      style={[
        styles.shell,
        {
          height: theme.metrics.buttonHeight,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.xl,
        },
        isSolid && {
          backgroundColor: theme.materials.card.background,
          borderColor: theme.colors.border,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.materials.shadow.sm,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <View style={[styles.content, { gap: theme.spacing.sm }]}>
          {Icon && <Icon size={18} color={contentColor} />}
          <Text numberOfLines={1} style={[theme.textStyles.button, { color: contentColor }]}>
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
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
