// #genai: The hero graphic on the welcome screen — a fanned stack of credit cards.
//
// Deliberately *not* skeuomorphic. There is no gloss highlight and no gold chip, because a drawn
// imitation of a plastic card competes with the real cards in the user's hand and loses. These are
// engraved plates: tonal, matte, inscribed with hairlines, with the numerals set in the Didone. The
// numbers are ornamental — real card numbers are never stored, let alone displayed.
//
// The top card is grabbable. Three details make it feel physical rather than scripted:
//   - It tracks the finger 1:1 while inside a comfortable range, then rubber-bands: resistance
//     grows the further it is dragged, so the limit reads as "nothing more here" instead of a
//     frozen UI.
//   - Release hands the finger's velocity straight into the spring, so there is no seam between
//     dragging and animating.
//   - Because it is a spring, the card can be caught mid-flight and thrown again.
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { useTheme } from '@/providers/ThemeProvider';
import { rubberband, springs } from '@/theme/motion';

const CARD_WIDTH = 268;
const CARD_HEIGHT = 168;

function CardFace({ colors, label, digits }) {
  const theme = useTheme();
  const { plateRule, onPlate } = theme.materials;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: theme.radius.xl }, theme.materials.elevated]}
    >
      {/* The lip of the plate catching light — one hairline, not a sheen across the whole face. */}
      <View style={[styles.topEdge, { backgroundColor: plateRule }]} pointerEvents="none" />

      <View style={styles.cardTop}>
        <View style={[styles.chip, { borderColor: plateRule, borderRadius: theme.radius.xs }]}>
          <View style={[styles.chipLine, { backgroundColor: plateRule }]} />
          <View style={[styles.chipLine, { backgroundColor: plateRule }]} />
        </View>

        <Text style={[theme.textStyles.micro, { color: onPlate, opacity: 0.72 }]}>{label}</Text>
      </View>

      <View style={styles.digitsRow}>
        {digits.map((group, index) => (
          <Text
            key={index}
            style={[
              styles.digitGroup,
              {
                color: onPlate,
                fontFamily: theme.fonts.display.medium,
                opacity: 0.88,
              },
            ]}
          >
            {group}
          </Text>
        ))}
      </View>
    </LinearGradient>
  );
}

function FloatingCard({ index, colors, label, digits, reduceMotion }) {
  const float = useSharedValue(0);

  // Fanned symmetrically around the front card so both back cards show a corner, rather than one
  // sitting directly behind and reading as a flat slab.
  const restingRotation = index === 1 ? -9 : 9;
  const restingOffsetY = index * -9;
  const restingScale = 1 - index * 0.04;

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(float);
      float.value = 0;
      return;
    }

    float.value = withRepeat(
      withTiming(1, { duration: 4200 + index * 700, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    return () => cancelAnimation(float);
  }, [float, index, reduceMotion]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateY: restingOffsetY + float.value * -6 },
        { rotate: `${restingRotation}deg` },
        { scale: restingScale },
      ],
      opacity: 1 - index * 0.18,
    }),
    [index, restingOffsetY, restingRotation, restingScale],
  );

  return (
    <Animated.View style={[styles.layer, animatedStyle]} pointerEvents="none">
      <CardFace colors={colors} label={label} digits={digits} />
    </Animated.View>
  );
}

export function CardStack() {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const { width } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const plates = theme.materials.plates;

  const pan = Gesture.Pan()
    // A few pixels of hysteresis stops an intended tap from registering as a drag.
    .activeOffsetX([-8, 8])
    .activeOffsetY([-8, 8])
    .onUpdate((event) => {
      // X and Y get independent resistance; a single 2D spring desyncs when the axes carry
      // different velocities.
      translateX.value = rubberband(event.translationX, width);
      translateY.value = rubberband(event.translationY, width);
    })
    .onEnd((event) => {
      translateX.value = withSpring(0, { ...springs.momentum, velocity: event.velocityX });
      translateY.value = withSpring(0, { ...springs.momentum, velocity: event.velocityY });
    });

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      // Tilting into the drag telegraphs the direction of travel.
      { rotate: `${interpolate(translateX.value, [-160, 160], [-10, 10])}deg` },
    ],
  }));

  return (
    <View style={styles.root} pointerEvents="box-none">
      {[2, 1].map((index) => (
        <FloatingCard
          key={index}
          index={index}
          colors={plates[index]}
          label={index === 2 ? 'Travel' : 'Cashback'}
          digits={index === 2 ? ['4821', '••••', '••••', '7702'] : ['5390', '••••', '••••', '1148']}
          reduceMotion={reduceMotion}
        />
      ))}

      <GestureDetector gesture={pan}>
        <Animated.View
          accessibilityHint="Drag to move the card"
          accessibilityLabel="Card Buddy rewards card"
          accessibilityRole="image"
          style={[styles.layer, topCardStyle]}
        >
          <CardFace colors={plates[0]} label="Rewards" digits={['9042', '••••', '••••', '3316']} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: CARD_HEIGHT + 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    width: 38,
    height: 28,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 7,
  },
  chipLine: {
    height: StyleSheet.hairlineWidth,
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  digitGroup: {
    fontSize: 17,
    letterSpacing: 1.5,
  },
});
