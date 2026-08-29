// #genai: The base interactive element for the whole app.
//
// Three things make this feel direct rather than "like a computer":
//   1. Feedback starts on touch-DOWN, not on release. Waiting for the tap to complete before
//      showing anything is the single biggest source of "dead" feeling UI.
//   2. The scale is driven by a spring, which always animates from the value currently on
//      screen. Press, release and re-press mid-flight all blend instead of jumping.
//   3. Hit slop extends the target beyond its painted bounds, and dragging out then back in
//      cancels/restores the press rather than committing.
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { fireHaptic } from '@/lib/haptics';
import { springs, timings } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DEFAULT_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export function PressableScale({
  children,
  onPress,
  disabled = false,
  scaleTo = 0.97,
  dimTo = 0.92,
  haptic = false,
  hitSlop = DEFAULT_HIT_SLOP,
  style,
  ...rest
}) {
  const reduceMotion = useReduceMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const progress = pressed.value;

    // Reduced motion keeps the confirmation but drops the vestibular part of it.
    if (reduceMotion) {
      return { opacity: 1 - progress * (1 - dimTo) };
    }

    return {
      transform: [{ scale: 1 - progress * (1 - scaleTo) }],
      opacity: 1 - progress * (1 - dimTo),
    };
  }, [reduceMotion, scaleTo, dimTo]);

  const setPressed = (value) => {
    pressed.value = reduceMotion
      ? withTiming(value, { duration: timings.fast })
      : withSpring(value, springs.press);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => {
        setPressed(1);
        fireHaptic(haptic);
      }}
      onPressOut={() => setPressed(0)}
      onPress={onPress}
      style={[styles.base, animatedStyle, disabled && styles.disabled, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    // Keeps children from inheriting the pressed opacity twice.
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
});
