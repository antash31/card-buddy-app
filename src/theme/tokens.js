// #genai: Non-colour design tokens shared by both themes.
import { fonts } from './fonts';

/**
 * 4pt scale. 8pt alone is too coarse — the gap between a label and its field is 12, and rounding
 * that to 8 or 16 is visibly wrong.
 */
export const spacing = {
  none: 0,
  hair: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  giant: 96,
};

/**
 * Generous, and nested on purpose. A surface's radius is always larger than the radius of anything
 * sitting inside it (outer = inner + padding), which is what makes stacked soft cards look
 * machined rather than blobby. `full` is for pills, avatars and dots.
 */
export const radius = {
  none: 0,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  full: 999,
};

/**
 * Fixed px steps, not fluid clamps: this is a product UI, not a marketing page. Ratios sit at
 * ~1.25 from `body` upward so hierarchy is unmistakable at a glance.
 */
export const typography = {
  fontSize: {
    micro: 11,
    caption: 13,
    body: 16,
    heading: 19,
    title: 25,
    display: 33,
    hero: 42,
    figure: 38,
  },
  lineHeight: {
    micro: 14,
    caption: 18,
    body: 24,
    heading: 25,
    title: 30,
    display: 38,
    hero: 46,
    figure: 42,
  },
  // Tracking is size-specific, never one value for every size: heavy type reads loose as it grows
  // and needs pulling in, while tiny caps need opening up to stay legible.
  tracking: {
    micro: 0.9,
    caption: 0,
    body: 0,
    heading: -0.3,
    title: -0.6,
    display: -1,
    hero: -1.5,
    figure: -1.2,
  },
};

/**
 * Ready-made family + size + leading + tracking sets, so hierarchy is never built from size alone.
 * Note the absence of `fontWeight` — see the note in `fonts.js`.
 */
export const textStyles = {
  /** Once per screen at most — the headline of a landing moment. */
  hero: {
    fontFamily: fonts.display.bold,
    fontSize: typography.fontSize.hero,
    lineHeight: typography.lineHeight.hero,
    letterSpacing: typography.tracking.hero,
  },
  /** Screen titles. */
  display: {
    fontFamily: fonts.display.bold,
    fontSize: typography.fontSize.display,
    lineHeight: typography.lineHeight.display,
    letterSpacing: typography.tracking.display,
  },
  title: {
    fontFamily: fonts.display.semibold,
    fontSize: typography.fontSize.title,
    lineHeight: typography.lineHeight.title,
    letterSpacing: typography.tracking.title,
  },
  heading: {
    fontFamily: fonts.text.semibold,
    fontSize: typography.fontSize.heading,
    lineHeight: typography.lineHeight.heading,
    letterSpacing: typography.tracking.heading,
  },
  body: {
    fontFamily: fonts.text.regular,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    letterSpacing: typography.tracking.body,
  },
  bodyStrong: {
    fontFamily: fonts.text.semibold,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    letterSpacing: typography.tracking.body,
  },
  label: {
    fontFamily: fonts.text.medium,
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    letterSpacing: typography.tracking.caption,
  },
  caption: {
    fontFamily: fonts.text.regular,
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    letterSpacing: typography.tracking.caption,
  },
  /**
   * The eyebrow: small, tracked caps. It names a region ("WALLET", "LAST ACTIONS") above the thing
   * it labels, and is the one place a counter or blue emphasis is allowed to ride along.
   */
  micro: {
    fontFamily: fonts.text.semibold,
    fontSize: typography.fontSize.micro,
    lineHeight: typography.lineHeight.micro,
    letterSpacing: typography.tracking.micro,
    textTransform: 'uppercase',
  },
  /** Big money. The balance tile, a verdict amount. */
  figure: {
    fontFamily: fonts.display.bold,
    fontSize: typography.fontSize.figure,
    lineHeight: typography.lineHeight.figure,
    letterSpacing: typography.tracking.figure,
    fontVariant: ['tabular-nums'],
  },
  /** Figures that sit in a column and must not jitter as they change. */
  numeric: {
    fontFamily: fonts.text.semibold,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontVariant: ['tabular-nums'],
  },
  /** Button labels. */
  button: {
    fontFamily: fonts.text.semibold,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    letterSpacing: -0.1,
  },
};

/**
 * Soft, blue-tinted, long and low. Shadows are how a card says "I am above the canvas", so every
 * raised surface carries one; their colour is the ink tone at low alpha, never pure black, so they
 * read as shade rather than dirt. Dark mode swaps them for deeper, tighter ones (see `materials`).
 */
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#1B2A4E',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  md: {
    shadowColor: '#1B2A4E',
    shadowOpacity: 0.09,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  lg: {
    shadowColor: '#1B2A4E',
    shadowOpacity: 0.15,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
};

/** Control heights, tab bar geometry and the like — shared so screens can reserve exact space. */
export const metrics = {
  fieldHeight: 60,
  buttonHeight: 56,
  /** Round icon buttons: back, add, send. */
  iconButton: 44,
  /** The floating tab capsule's own height. */
  tabBarHeight: 66,
  /** Gap between the capsule and the bottom safe-area edge. */
  tabBarGap: 10,
  /** Room a scrolling screen must leave under its content so the last row clears the capsule. */
  tabBarReserve: 66 + 10 + 24,
  /** Horizontal page margin. */
  gutter: 20,
};
