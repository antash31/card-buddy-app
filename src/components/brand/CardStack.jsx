// #genai: The hero graphic on the welcome screen — a stack of bright cards, the front one draggable.
//
// The stacked-cards composition from the reference's "Cards" screen: a sun-yellow card, a graphite
// card and a blue card in front, each peeking over the one below, the blue one with a pane of
// frosted glass across its lower third (that is `CardArt`'s band). The numerals are ornamental.
//
// The top card is grabbable. Three details make it feel physical rather than scripted:
//   - It tracks the finger 1:1 while inside a comfortable range, then rubber-bands: resistance
//     grows the further it is dragged, so the limit reads as "nothing more here" instead of a
//     frozen UI.
//   - Release hands the finger's velocity straight into the spring, so there is no seam between
//     dragging and animating.
//   - Because it is a spring, the card can be caught mid-flight and thrown again.
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
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

import { CardArt } from './CardArt';

const CARD_WIDTH = 276;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.63);
const CARD_RADIUS = Math.round(CARD_WIDTH * 0.1);

// Back to front. `lift` is how far each card rises above the one in front of it.
const LAYERS = [
  { tone: 'sun', monogram: 'RP', network: 'RUPAY', title: '6521  ····  ····  0417', lift: 52, rotate: 3, scale: 0.86 },
  { tone: 'graphite', monogram: 'MC', network: 'MASTERCARD', title: '5390  ····  ····  1148', lift: 26, rotate: -3, scale: 0.93 },
];

function FloatingCard({ index, layer, reduceMotion }) {
  const float = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(float);
      float.value = 0;
      return;
    }

    float.value = withRepeat(
      withTiming(1, { duration: 4200 + index * 800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    return () => cancelAnimation(float);
  }, [float, index, reduceMotion]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateY: -layer.lift + float.value * -5 },
        { rotate: `${layer.rotate}deg` },
        { scale: layer.scale },
      ],
    }),
    [layer],
  );

  return (
    <Animated.View style={[styles.layer, animatedStyle]} pointerEvents="none">
      <CardArt
        width={CARD_WIDTH}
        tone={layer.tone}
        monogram={layer.monogram}
        network={layer.network}
        title={layer.title}
      />
    </Animated.View>
  );
}

export function CardStack() {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const { width } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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
      { rotate: `${interpolate(translateX.value, [-160, 160], [-9, 9])}deg` },
    ],
  }));

  return (
    <View style={styles.root} pointerEvents="box-none">
      {LAYERS.map((layer, index) => (
        <FloatingCard key={layer.tone} index={index} layer={layer} reduceMotion={reduceMotion} />
      ))}

      <GestureDetector gesture={pan}>
        <Animated.View
          accessibilityHint="Drag to move the card"
          accessibilityLabel="Card Buddy rewards card"
          accessibilityRole="image"
          // The shadow is cast by this wrapper, so it needs the card's own corner radius — without it
          // web draws a rectangular shadow behind a rounded card.
          style={[styles.layer, { borderRadius: CARD_RADIUS }, theme.materials.shadow.lg, topCardStyle]}
        >
          <CardArt
            width={CARD_WIDTH}
            tone="blue"
            monogram="CB"
            network="VISA"
            title="9042  ····  ····  3316"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: CARD_HEIGHT + 78,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  layer: {
    position: 'absolute',
    bottom: 6,
  },
});
