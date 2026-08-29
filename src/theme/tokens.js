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
 * Deliberately tight. Heavy rounding reads as friendly-consumer; a printed statement has crisp
 * corners. `full` exists only for genuinely circular things (avatars, dots).
 */
export const radius = {
  none: 0,
  xs: 3,
  sm: 5,
  md: 8,
  lg: 11,
  xl: 14,
  xxl: 18,
  full: 999,
};

/**
 * Fixed px steps, not fluid clamps: this is a product UI, not a marketing page, and no major
 * design system ships fluid type in an app shell. Ratios sit at ~1.25–1.3 from `body` upward so
 * hierarchy is unmistakable at a glance.
 */
export const typography = {
  fontSize: {
    micro: 11,
    caption: 13,
    body: 16,
    heading: 20,
    title: 26,
    display: 34,
    hero: 44,
  },
  lineHeight: {
    micro: 14,
    caption: 18,
    body: 24,
    heading: 26,
    title: 30,
    display: 38,
    hero: 46,
  },
  // Tracking is size-specific, never one value for every size: letters read too far apart as type
  // grows and too tight as it shrinks. The Didone in particular needs pulling in at hero size.
  tracking: {
    micro: 1.2,
    caption: 0.1,
    body: 0,
    heading: -0.2,
    title: -0.4,
    display: -0.8,
    hero: -1.2,
  },
};

/**
 * Ready-made family + size + leading + tracking sets, so hierarchy is never built from size alone.
 * Note the absence of `fontWeight` — see the note in `fonts.js`.
 */
export const textStyles = {
  /** Once per screen at most. Bodoni at 44px is the loudest thing in the product. */
  hero: {
    fontFamily: fonts.display.bold,
    fontSize: typography.fontSize.hero,
    lineHeight: typography.lineHeight.hero,
    letterSpacing: typography.tracking.hero,
  },
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
  /** Section headings drop to the grotesque — a serif at 20px starts to look like a mistake. */
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
    fontFamily: fonts.text.medium,
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
   * The statement label: small, wide-tracked caps used to title a region the way a printed
   * statement titles a column. Carries a lot of the aesthetic — use it instead of a bigger heading.
   */
  micro: {
    fontFamily: fonts.text.semibold,
    fontSize: typography.fontSize.micro,
    lineHeight: typography.lineHeight.micro,
    letterSpacing: typography.tracking.micro,
    textTransform: 'uppercase',
  },
  /** Figures that sit in a column and must not jitter as they change. */
  numeric: {
    fontFamily: fonts.text.medium,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontVariant: ['tabular-nums'],
  },
};

/**
 * Almost nothing in this design is elevated. Shadows are reserved for surfaces that genuinely
 * float above scrolling content — in practice, the tab bar.
 */
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#120C07',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#120C07',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
};

/** Field height, tab bar height and the like — shared so screens can reserve exact space. */
export const metrics = {
  fieldHeight: 60,
  buttonHeight: 54,
  tabBarHeight: 60,
  /** The horizontal margin that gives the "wide margins on good paper" feel. */
  gutter: 24,
};
