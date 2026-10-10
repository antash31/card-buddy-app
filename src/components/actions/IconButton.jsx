// #genai: A round icon-only button — back, add, send.
//
// Three treatments, matching how the reference design uses its circular controls:
//   glass   a small clear lens over the canvas. Navigation and secondary affordances (back, add).
//   solid   the accent, lit like the primary button. The one forward action in a bar (send).
//   plain   no container at all, just the glyph with a generous hit area.
//
// An icon is never the only label: `accessibilityLabel` is required in practice, and callers pass it.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { Glass } from '@/components/surfaces/Glass';
import { useTheme } from '@/providers/ThemeProvider';

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  variant = 'glass',
  size,
  iconSize = 20,
  disabled = false,
  haptic = 'selection',
  style,
}) {
  const theme = useTheme();
  const dimension = size ?? theme.metrics.iconButton;
  const { button } = theme.materials;

  const color = variant === 'solid' ? theme.colors.onPrimary : theme.colors.text;
  const glyph = Icon ? <Icon size={iconSize} color={color} /> : null;

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      haptic={haptic}
      onPress={onPress}
      scaleTo={0.9}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={[{ width: dimension, height: dimension }, style]}
    >
      {variant === 'glass' ? (
        <Glass
          variant="regular"
          radius={dimension / 2}
          shadow="sm"
          style={{ width: dimension, height: dimension }}
          contentStyle={styles.center}
        >
          {glyph}
        </Glass>
      ) : variant === 'solid' ? (
        <View
          style={[
            styles.center,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              overflow: 'hidden',
            },
            !disabled && button.glow,
          ]}
        >
          <LinearGradient
            colors={button.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {glyph}
        </View>
      ) : (
        <View style={[styles.center, { width: dimension, height: dimension }]}>{glyph}</View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
