// #genai: Motion tokens calibrated to Apple's "Designing Fluid Interfaces" guidance.
//
// Apple describes springs with two designer-facing parameters instead of mass/stiffness/damping:
//   - dampingRatio — overshoot. 1.0 settles with no bounce; below 1.0 overshoots.
//   - response     — how quickly the value reaches its target.
// Reanimated accepts exactly this pair (`dampingRatio` + `duration`), so the numbers below are
// Apple's published values with response expressed in milliseconds.
//
// Rule of thumb: default to a critically damped spring (no bounce). Only add overshoot when the
// user's own gesture carried momentum into the animation — bounce on a menu that merely faded in
// reads as noise, bounce on a card you flicked reads as physics.

export const springs = {
  /** Everyday UI: move, reposition, reveal. Apple's PiP move spring. */
  default: { dampingRatio: 1, duration: 400 },
  /** Press / release feedback — must feel immediate. */
  press: { dampingRatio: 1, duration: 180 },
  /** Snappier reveal for small elements. */
  snappy: { dampingRatio: 1, duration: 280 },
  /** Sheets and drawers. */
  drawer: { dampingRatio: 0.8, duration: 300 },
  /** Only for motion the user threw or flicked. */
  momentum: { dampingRatio: 0.8, duration: 400 },
  /**
   * The glass lens sliding under the active tab, and the wallet stack re-ordering. A touch of
   * overshoot is earned here: the user's tap is the momentum, and a liquid surface settles rather
   * than stops.
   */
  liquid: { dampingRatio: 0.78, duration: 460 },
};

/** Fade-only equivalents used when the user asks for reduced motion. */
export const timings = {
  fast: 140,
  base: 220,
  slow: 320,
};

/**
 * Projects where a flick would come to rest, matching iOS scroll deceleration.
 * Apple ships this exponential-decay form — not the textbook v^2/(2a).
 */
export function projectMomentum(velocity, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Progressive resistance past a boundary. A hard stop reads as "frozen"; easing the
 * overshoot reads as "responsive, but there is nothing more here".
 */
export function rubberband(overshoot, dimension, constant = 0.55) {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Staggered entrance delay so lists resolve as a sequence rather than a single block. */
export function stagger(index, step = 60) {
  return index * step;
}
