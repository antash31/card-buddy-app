// #genai: The single most prominent action on a screen.
//
// A full pill, lit from above: a vertical blue gradient (lighter at the top, as if the glass were
// back-lit), a 1px specular rim along the top edge, and a glow in the button's own colour beneath
// it. The glow is what lifts it off the canvas — it should read as the one thing on the page that
// is emitting light rather than reflecting it, which is why there is only ever one per screen.
//
// The loading state swaps the label for a spinner *in place* and keeps the button's height, so
// submitting never reflows the form. The button stays mounted rather than disappearing, which keeps
// the user oriented while the request is in flight.
//
// Structure matters: the shadow sits on the outer pressable and the clipping on an inner view,
// because one view cannot both clip its content and cast a shadow on iOS.
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon: Icon,
  trailingIcon: TrailingIcon,
  style,
}) {
  const theme = useTheme();
  const isInactive = disabled || loading;
  const { button } = theme.materials;
  const height = theme.metrics.buttonHeight;

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      haptic="medium"
      onPress={onPress}
      scaleTo={0.97}
      dimTo={0.92}
      style={[
        { height, borderRadius: theme.radius.full },
        // A glowing button that is disabled would look live; drop the glow with the interactivity.
        !isInactive && button.glow,
        style,
      ]}
    >
      <View style={[styles.clip, { borderRadius: theme.radius.full }]}>
        <LinearGradient
          colors={button.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* The specular rim: a short bright line hugging the top edge. */}
        <View style={[styles.rim, { backgroundColor: button.rim }]} pointerEvents="none" />

        {loading ? (
          <ActivityIndicator color={theme.colors.onPrimary} size="small" />
        ) : (
          <View style={[styles.content, { gap: theme.spacing.sm }]}>
            {Icon && <Icon size={18} color={theme.colors.onPrimary} />}
            <Text
              numberOfLines={1}
              style={[theme.textStyles.button, { color: theme.colors.onPrimary }]}
            >
              {label}
            </Text>
            {TrailingIcon && <TrailingIcon size={18} color={theme.colors.onPrimary} />}
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  rim: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: StyleSheet.hairlineWidth * 2,
    borderRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
