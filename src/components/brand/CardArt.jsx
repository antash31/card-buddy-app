// #genai: Generated card art — a bright gradient plate with a pane of glass across its lower third.
//
// This is the card from the reference design, rebuilt as a component: a saturated diagonal
// gradient, a huge translucent monogram clipped by the right edge, the network mark top-left, and a
// pane of glass along the bottom that carries the card's name. The pane is a real blur, so the
// monogram and gradient show softly through it — smoked (dark) under white type, frosted (light)
// under dark type, chosen per tone so the name always clears 4.5:1 (see `theme/materials.js`).
//
// It exists because the catalog has no card images, and a wallet of identical white rows tells you
// nothing at a glance. Colour is derived from the *bank*, so every card from one issuer shares a
// hue — an at-a-glance grouping cue, not a claim about the issuer's real branding.
//
// Nothing here is a real card number. Where digits appear (the welcome hero) they are ornamental,
// and the nest never shows any: real card numbers are never stored, let alone displayed.
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReduceTransparency } from '@/hooks/useMotionPreferences';
import { useTheme } from '@/providers/ThemeProvider';

import { cardHeight, monogramFor, toneForBank } from './cardTone';

const GHOST_OPACITY = 0.2;

export function CardArt({
  width = 280,
  tone,
  bank,
  monogram,
  // Off for cards that are mostly hidden behind another: a thin strip of a giant letter reads as a
  // rendering glitch, not as a monogram.
  ghost = true,
  network,
  title,
  subtitle,
  style,
  accessibilityLabel,
}) {
  const theme = useTheme();
  const reduceTransparency = useReduceTransparency();

  const height = cardHeight(width);
  const radius = Math.round(width * 0.1);
  const palette = theme.materials.cardTones[tone ?? toneForBank(bank)];
  const detailed = width >= 150;
  const smoked = palette.band === 'smoked';
  const bandHeight = Math.round(height * 0.36);
  const canBlur = !reduceTransparency && Platform.OS !== 'android';

  const ghostOpacity = useSharedValue(ghost ? GHOST_OPACITY : 0);
  useEffect(() => {
    ghostOpacity.value = withTiming(ghost ? GHOST_OPACITY : 0, { duration: 260 });
  }, [ghost, ghostOpacity]);
  const ghostStyle = useAnimatedStyle(() => ({ opacity: ghostOpacity.value }));

  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      style={[{ width, height, borderRadius: radius }, style]}
    >
      <View style={[styles.clip, { borderRadius: radius }]}>
        <LinearGradient
          colors={palette.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* The monogram: huge, translucent, and cut off by the card's own edge. */}
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.ghost,
            {
              color: palette.on,
              fontFamily: theme.fonts.display.bold,
              fontSize: height * 0.98,
              lineHeight: height * 1.05,
              right: -height * 0.1,
              top: -height * 0.06,
              letterSpacing: -height * 0.05,
            },
            ghostStyle,
          ]}
        >
          {monogram ?? monogramFor(bank)}
        </Animated.Text>

        <LinearGradient
          colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.10)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {detailed && network ? (
          <Text
            style={[
              styles.network,
              {
                color: palette.on,
                fontFamily: theme.fonts.display.bold,
                fontSize: Math.max(13, height * 0.1),
                left: width * 0.07,
                top: height * 0.1,
                // Decorative, and sitting on the lightest part of the gradient: lift it with a shadow.
                ...(smoked ? styles.labelShadow : null),
              },
            ]}
          >
            {network}
          </Text>
        ) : null}

        {detailed && (title || subtitle) ? (
          <View style={[styles.band, { height: bandHeight }]}>
            {canBlur ? (
              <BlurView
                intensity={smoked ? 28 : 34}
                tint={smoked ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: smoked ? 'rgba(10,20,50,0.26)' : 'rgba(255,255,255,0.22)' },
                // Without a real blur (reduce-transparency, Android) the fill carries all the contrast.
                (reduceTransparency || !canBlur) && {
                  backgroundColor: smoked ? 'rgba(10,20,50,0.5)' : 'rgba(255,255,255,0.42)',
                },
              ]}
            />
            <View
              style={[
                styles.bandEdge,
                { backgroundColor: smoked ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.5)' },
              ]}
            />

            <View style={[styles.bandText, { paddingHorizontal: width * 0.07 }]}>
              {title ? (
                <Text
                  numberOfLines={1}
                  style={{
                    color: palette.on,
                    fontFamily: theme.fonts.text.semibold,
                    fontSize: Math.max(13, height * 0.092),
                    letterSpacing: 0.2,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text
                  numberOfLines={1}
                  style={{
                    color: palette.on,
                    opacity: 0.78,
                    fontFamily: theme.fonts.text.regular,
                    fontSize: Math.max(11, height * 0.07),
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
  },
  ghost: {
    position: 'absolute',
    includeFontPadding: false,
  },
  network: {
    position: 'absolute',
    letterSpacing: 0.4,
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  bandEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth * 2,
  },
  labelShadow: {
    textShadowColor: 'rgba(8, 18, 48, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  bandText: {
    gap: 2,
  },
});
