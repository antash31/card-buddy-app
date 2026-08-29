// #genai: Entrance animation for content arriving on a screen.
//
// The slide is deliberately short. Motion should hint at where a thing came from, not travel a
// distance the eye has to follow. When reduced motion is on, the translation is dropped entirely
// and only the cross-fade remains.
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { springs, timings } from '@/theme/motion';

export function Reveal({ children, delay = 0, distance = 14, from = 'bottom', style, ...rest }) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      reduceMotion ? withTiming(1, { duration: timings.base }) : withSpring(1, springs.default),
    );
  }, [delay, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const offset = (1 - progress.value) * distance;

    if (reduceMotion) {
      return { opacity: progress.value };
    }

    return {
      opacity: progress.value,
      transform:
        from === 'bottom'
          ? [{ translateY: offset }]
          : from === 'top'
            ? [{ translateY: -offset }]
            : from === 'left'
              ? [{ translateX: -offset }]
              : [{ translateX: offset }],
    };
  }, [distance, from, reduceMotion]);

  return (
    <Animated.View style={[animatedStyle, style]} {...rest}>
      {children}
    </Animated.View>
  );
}
