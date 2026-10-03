// #genai: A glass-and-blue slider for choosing an amount.
//
// Built from a pan gesture and Reanimated rather than the native slider: the native control cannot
// be restyled to match the rest of the product, and a stock iOS slider in the middle of soft cards
// would be the one off-brand element on the screen. The thumb and fill run on the UI thread so they
// follow the finger without waiting on React; only the *snapped* value crosses back to JS, and only
// when it changes.
//
// Dragging sideways anywhere on the track moves the thumb, and tapping the track jumps it there —
// aiming at a 28pt thumb is the hard part of a slider on a phone. A vertical swipe is *not* a slider
// gesture: it fails the drag and scrolls the page, so the sliders can sit in a long scrolling form.
// For screen readers it is an adjustable element with increment / decrement actions, one step each.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { fireHaptic } from '@/lib/haptics';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';
import { springs } from '@/theme/motion';

import { nudge, ratioOf, valueAt } from './sliderMath';

const THUMB = 28;
const TRACK = 8;
const HIT_HEIGHT = 40;

export function Slider({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  formatValue = formatRupeesWhole,
  disabled = false,
}) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();

  const [width, setWidth] = useState(0);
  const span = Math.max(width - THUMB, 1);

  const progress = useSharedValue(ratioOf(value, min, max));
  const lifted = useSharedValue(0);
  const lastEmitted = useSharedValue(value);
  const dragging = useRef(false);

  // Follow the controlled value — but never fight the finger while it is down.
  useEffect(() => {
    if (dragging.current) return;
    progress.value = ratioOf(value, min, max);
    lastEmitted.value = value;
  }, [value, min, max, progress, lastEmitted]);

  const begin = () => {
    dragging.current = true;
  };
  const end = () => {
    dragging.current = false;
    fireHaptic('selection');
  };

  // Both gestures read the finger's absolute position on the track, so a tap and a drag agree.
  const place = (x) => {
    'worklet';
    const next = valueAt((x - THUMB / 2) / span, min, max, step);
    progress.value = ratioOf(next, min, max);
    if (next !== lastEmitted.value) {
      lastEmitted.value = next;
      runOnJS(onChange)(next);
    }
  };

  // The drag only *claims* the touch once it has moved sideways. A slider sits in the middle of a
  // scrolling form, and a vertical swipe that happens to start on one must scroll the page, not
  // yank the value — so vertical movement makes this gesture fail and hands the touch to the scroll.
  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-6, 6])
    .failOffsetY([-12, 12])
    .onStart((event) => {
      lifted.value = reduceMotion ? 1 : withSpring(1, springs.press);
      runOnJS(begin)();
      place(event.x);
    })
    .onUpdate((event) => place(event.x))
    .onFinalize(() => {
      lifted.value = reduceMotion ? 0 : withSpring(0, springs.press);
      runOnJS(end)();
    });

  // A plain tap on the track jumps the thumb there.
  const tap = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(300)
    .onEnd((event, success) => {
      if (success) {
        place(event.x);
        runOnJS(end)();
      }
    });

  const gesture = Gesture.Race(pan, tap);

  const fillStyle = useAnimatedStyle(() => ({ width: progress.value * span + THUMB / 2 }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * span }, { scale: 1 + lifted.value * 0.14 }],
  }));

  const active = value > min;

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityValue={{ min, max, now: value, text: formatValue(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        onChange(nudge(value, event.nativeEvent.actionName === 'increment' ? 1 : -1, min, max, step))
      }
      style={{ gap: theme.spacing.xs }}
    >
      <View style={styles.header}>
        <Text style={[theme.textStyles.bodyStrong, styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
        <Text
          style={[
            theme.textStyles.numeric,
            { color: active ? theme.colors.primary : theme.colors.textMuted },
          ]}
        >
          {formatValue(value)}
        </Text>
      </View>

      {hint ? (
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{hint}</Text>
      ) : null}

      <GestureDetector gesture={gesture}>
        <View style={[styles.hit, disabled && styles.disabled]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <View
            pointerEvents="none"
            style={[
              styles.track,
              {
                backgroundColor: theme.materials.inset.background,
                borderColor: theme.colors.border,
                borderRadius: TRACK / 2,
              },
            ]}
          >
            <Animated.View style={[styles.fill, { backgroundColor: theme.colors.primary, borderRadius: TRACK / 2 }, fillStyle]} />
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                backgroundColor: '#FFFFFF',
                borderColor: theme.colors.primary,
                ...theme.materials.shadow.sm,
              },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flexShrink: 1,
  },
  hit: {
    height: HIT_HEIGHT,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    height: TRACK,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 2,
  },
});
