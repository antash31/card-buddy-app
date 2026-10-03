// #genai: The wallet — the user's cards stacked like the "Cards" screen of the reference design.
//
// The selected card sits in front, full size; up to two more peek out above it, each a little
// smaller and fainter. Selecting a different card (from the list below, or by tapping a peeking
// one) does not swap them — each card springs to its new slot, so the stack visibly re-shuffles.
// Motion is on a shared `slot` value per card, so a second selection mid-flight simply re-aims the
// springs instead of queueing.
//
// Tapping the front card opens its details; tapping a peeking card brings it forward. That keeps
// one gesture meaning one thing per position.
//
// Cards past the third fade out behind the stack rather than being clipped, so a wallet of ten
// still reads as a stack and not a list.
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CardArt } from '@/components/brand/CardArt';
import { PressableScale } from '@/components/motion/PressableScale';
import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { useTheme } from '@/providers/ThemeProvider';
import { springs, timings } from '@/theme/motion';

const LIFT = 18;
const SHRINK = 0.055;
const MAX_WIDTH = 316;
const VISIBLE_SLOTS = 3;

function StackCard({ card, slot, width, onPress }) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(slot);

  useEffect(() => {
    progress.value = reduceMotion
      ? withTiming(slot, { duration: timings.fast })
      : withSpring(slot, springs.liquid);
  }, [slot, reduceMotion, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const s = Math.min(progress.value, VISIBLE_SLOTS);

    return {
      transform: [{ translateY: -s * LIFT }, { scale: 1 - s * SHRINK }],
      // Slots 0–2 dim gently; past the visible three the card dissolves into the stack.
      opacity: interpolate(s, [0, 1, 2, 3], [1, 0.94, 0.82, 0]),
    };
  });

  return (
    <Animated.View
      pointerEvents={slot < VISIBLE_SLOTS ? 'auto' : 'none'}
      style={[
        styles.layer,
        // Matches CardArt's corner radius so the cast shadow is rounded too (web draws it as a box).
        { zIndex: 10 - Math.min(slot, 9), borderRadius: Math.round(width * 0.1) },
        theme.materials.shadow.md,
        animatedStyle,
      ]}
    >
      <PressableScale
        accessibilityLabel={`${card.cardName}, ${card.bank}${slot === 0 ? '. Opens details' : '. Bring to front'}`}
        haptic={slot === 0 ? 'light' : 'selection'}
        onPress={onPress}
        scaleTo={0.985}
        dimTo={0.96}
        hitSlop={0}
      >
        <CardArt
          width={width}
          bank={card.bank}
          ghost={slot === 0}
          network={card.network}
          title={card.cardName}
          subtitle={card.bank}
        />
      </PressableScale>
    </Animated.View>
  );
}

export function WalletStack({ cards, selectedId, onSelect, onOpen }) {
  const { width: screenWidth } = useWindowDimensions();
  const theme = useTheme();

  const width = Math.min(screenWidth - theme.metrics.gutter * 2 - 24, MAX_WIDTH);
  const height = Math.round(width * 0.63);

  // Selected first, then the rest in their natural order.
  const ordered = [
    ...cards.filter((card) => card.userCardId === selectedId),
    ...cards.filter((card) => card.userCardId !== selectedId),
  ];

  const peek = Math.min(ordered.length, VISIBLE_SLOTS) - 1;

  return (
    <View
      style={[styles.root, { height: height + Math.max(peek, 0) * LIFT + 6 }]}
      accessibilityLabel={`Wallet stack, ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}`}
    >
      {ordered.map((card, slot) => (
        <StackCard
          key={card.userCardId}
          card={card}
          slot={slot}
          width={width}
          onPress={() => (slot === 0 ? onOpen(card) : onSelect(card))}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  layer: {
    position: 'absolute',
    bottom: 0,
  },
});
