// #genai: The liquid-glass pane — the defining surface of the product.
//
// Five layers, bottom to top (the recipe lives in `theme/materials.js`):
//   blur  →  fill  →  sheen  →  edge  →  content, with a soft shadow underneath the lot.
//
// The sheen is the part that makes it "liquid" rather than "frosted": a diagonal gradient that is
// bright in the top-left and fades to nothing, then picks back up faintly at the bottom-right. It
// reads as light raking across a curved surface. The edge is a 1px rim brighter than the fill, the
// way the cut edge of real glass catches light.
//
// Two structural rules:
//   - The shadow lives on the outer view and the clipping on an inner one. Putting both on one view
//     makes iOS clip the shadow away.
//   - Content is laid out by the OUTER view, so the pane sizes to what is in it. The glass layers
//     are absolutely positioned behind it and never affect layout.
//
// Degradation, in order of preference: full blur (iOS, web) → translucent fill without blur
// (Android, where live blur is costly) → opaque fill (reduce-transparency, always honoured).
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';

import { useReduceTransparency } from '@/hooks/useMotionPreferences';
import { useTheme } from '@/providers/ThemeProvider';

const SHEEN_START = { x: 0, y: 0 };
const SHEEN_END = { x: 1, y: 1 };
const SHEEN_STOPS = [0, 0.55, 1];

export function Glass({
  children,
  variant = 'regular',
  radius,
  shadow = 'md',
  blur = true,
  clip = false,
  style,
  contentStyle,
  ...rest
}) {
  const theme = useTheme();
  const reduceTransparency = useReduceTransparency();

  const preset = theme.materials.glass[variant] ?? theme.materials.glass.regular;
  const borderRadius = radius ?? theme.radius.xl;

  const isAndroid = Platform.OS === 'android';
  const showBlur = blur && !reduceTransparency && !isAndroid;
  const fill = reduceTransparency ? preset.opaque : isAndroid ? preset.opaque : preset.fill;
  const shadowStyle = shadow ? theme.materials.shadow[shadow] : null;

  return (
    <View style={[{ borderRadius }, shadowStyle, style]} {...rest}>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}
      >
        {showBlur ? (
          <BlurView
            intensity={preset.intensity}
            tint={preset.tint}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: fill },
            // Without a real blur the Android fill is nearly opaque; let a little ground through.
            isAndroid && !reduceTransparency ? styles.androidFill : null,
          ]}
        />

        {!reduceTransparency ? (
          <LinearGradient
            colors={preset.sheen}
            locations={SHEEN_STOPS}
            start={SHEEN_START}
            end={SHEEN_END}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </View>

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: preset.edge },
        ]}
      />

      <View style={[{ borderRadius }, clip && styles.clip, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  androidFill: {
    opacity: 0.94,
  },
  clip: {
    overflow: 'hidden',
  },
});
