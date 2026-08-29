// #genai: Accessibility preferences that motion and material code must respect.
//
// Reduced motion does not mean "no feedback" — it means a gentler, non-vestibular equivalent:
// cross-fades instead of slides, and no overshoot. Reduced transparency means frosted surfaces
// become solid rather than disappearing.
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Hoisted so the effect dependencies stay referentially stable across renders.
const readReduceMotion = () =>
  typeof AccessibilityInfo.isReduceMotionEnabled === 'function'
    ? AccessibilityInfo.isReduceMotionEnabled()
    : Promise.resolve(false);

// iOS-only setting; Android has no equivalent and reports false.
const readReduceTransparency = () =>
  typeof AccessibilityInfo.isReduceTransparencyEnabled === 'function'
    ? AccessibilityInfo.isReduceTransparencyEnabled()
    : Promise.resolve(false);

function useAccessibilityFlag(read, event) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    read()
      .then((value) => {
        if (active) setEnabled(Boolean(value));
      })
      .catch(() => {
        // Platforms without the setting simply keep the default.
      });

    const subscription = AccessibilityInfo.addEventListener(event, (value) => {
      setEnabled(Boolean(value));
    });

    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, [read, event]);

  return enabled;
}

export function useReduceMotion() {
  return useAccessibilityFlag(readReduceMotion, 'reduceMotionChanged');
}

export function useReduceTransparency() {
  return useAccessibilityFlag(readReduceTransparency, 'reduceTransparencyChanged');
}
