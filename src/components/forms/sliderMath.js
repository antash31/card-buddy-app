// #genai: Pure maths for the Slider, kept out of the component so it can be tested without a gesture.
//
// These run inside Reanimated worklets as well as on the JS thread, hence the directive.

/** Clamp to [low, high]. */
export function clamp(value, low, high) {
  'worklet';
  return Math.min(Math.max(value, low), high);
}

/** Where `value` sits in [min, max], as 0–1. */
export function ratioOf(value, min, max) {
  'worklet';
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

/** The value a 0–1 position maps to, snapped to the nearest `step` and kept inside the range. */
export function valueAt(ratio, min, max, step) {
  'worklet';
  const raw = min + clamp(ratio, 0, 1) * (max - min);
  return clamp(Math.round(raw / step) * step, min, max);
}

/** The value one step up or down, kept inside the range (for screen-reader increment/decrement). */
export function nudge(value, direction, min, max, step) {
  'worklet';
  return clamp(value + direction * step, min, max);
}
