// #genai: Surface materials — where the "liquid glass" look is actually defined.
//
// Glass is built from five layers, bottom to top, and every layer is a token here so the effect can
// be tuned in one file:
//   1. blur      — the backdrop, softened (`intensity`, `tint`)
//   2. fill      — a translucent wash that sets how much of the backdrop shows through
//   3. sheen     — a diagonal gradient, bright at the top-left and fading out, which is what makes
//                  a flat pane read as a curved lens catching light
//   4. edge      — a 1px specular rim, brighter than the fill, that defines the silhouette
//   5. shadow    — soft, blue-tinted, and *below* the surface, so the pane floats
//
// Glass only looks like glass when there is something behind it to refract, which is why the
// canvas carries `orbs`: a few large, blurred pools of colour. Without them a blurred pane over a
// flat fill is just a lighter rectangle.
//
// Android gets the translucent fill without the blur (real-time blur is expensive there), and
// reduce-transparency gets the opaque colour — see `Glass`.

// Shared glass geometry. Only the colours differ between themes.
const lightGlass = {
  regular: {
    tint: 'light',
    intensity: 48,
    fill: 'rgba(255, 255, 255, 0.58)',
    sheen: ['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.20)'],
    edge: 'rgba(255, 255, 255, 0.9)',
    opaque: '#FFFFFF',
  },
  thick: {
    tint: 'light',
    intensity: 80,
    fill: 'rgba(255, 255, 255, 0.66)',
    sheen: ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.30)'],
    edge: 'rgba(255, 255, 255, 0.95)',
    opaque: '#FFFFFF',
  },
  clear: {
    tint: 'light',
    intensity: 26,
    fill: 'rgba(255, 255, 255, 0.32)',
    sheen: ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.12)'],
    edge: 'rgba(255, 255, 255, 0.7)',
    opaque: '#F4F7FC',
  },
  // A glass pane stained with the accent — the hero of a result, never a control.
  tinted: {
    tint: 'light',
    intensity: 50,
    fill: 'rgba(40, 99, 227, 0.16)',
    sheen: ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.16)'],
    edge: 'rgba(255, 255, 255, 0.8)',
    opaque: '#DCE8FF',
  },
};

const darkGlass = {
  regular: {
    tint: 'dark',
    intensity: 40,
    fill: 'rgba(255, 255, 255, 0.075)',
    sheen: ['rgba(255, 255, 255, 0.20)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.05)'],
    edge: 'rgba(255, 255, 255, 0.17)',
    opaque: '#151A27',
  },
  thick: {
    tint: 'dark',
    intensity: 70,
    fill: 'rgba(255, 255, 255, 0.12)',
    sheen: ['rgba(255, 255, 255, 0.26)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.07)'],
    edge: 'rgba(255, 255, 255, 0.22)',
    opaque: '#1B2133',
  },
  clear: {
    tint: 'dark',
    intensity: 24,
    fill: 'rgba(255, 255, 255, 0.04)',
    sheen: ['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.03)'],
    edge: 'rgba(255, 255, 255, 0.12)',
    opaque: '#10141F',
  },
  tinted: {
    tint: 'dark',
    intensity: 44,
    fill: 'rgba(110, 163, 255, 0.18)',
    sheen: ['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.05)'],
    edge: 'rgba(160, 196, 255, 0.34)',
    opaque: '#1B2C52',
  },
};

// Tones for generated card art. Each is [top-left, bottom-right], the colour of type on it, and the
// style of the glass band that carries the card's name:
//   smoked   a dark-tinted pane with white type — blue, graphite, violet and coral, where a white
//            frosted band would leave white type at 2.3–3.4:1. Smoked brings it to 5.2–11:1.
//   frosted  a light pane with dark type — sun and mint, which are too light for white type at all.
// Contrast was computed for the band's lightest (bottom-left) and darkest (bottom-right) regions.
// The network label on the plate's face is a decorative duplicate of the network shown in text
// beside the card, so it relies on a soft shadow rather than meeting 4.5:1 on its own.
const cardTones = {
  blue: { colors: ['#5B9BFF', '#2D69EE'], on: '#FFFFFF', band: 'smoked' },
  graphite: { colors: ['#666A76', '#26282F'], on: '#FFFFFF', band: 'smoked' },
  sun: { colors: ['#FFEF7A', '#F2C93A'], on: '#2A2406', band: 'frosted' },
  violet: { colors: ['#9380FF', '#6342EA'], on: '#FFFFFF', band: 'smoked' },
  coral: { colors: ['#FF8670', '#EE4630'], on: '#FFFFFF', band: 'smoked' },
  mint: { colors: ['#86E8BE', '#14A672'], on: '#05281C', band: 'frosted' },
};

const lightMaterials = {
  mode: 'light',

  /** Top to bottom. A gentle brightening toward the top, like a lit tabletop. */
  canvas: ['#F6F8FC', '#EDF1F6', '#E5EBF3'],

  /**
   * Ambient light pools painted behind everything. `cx` / `cy` are fractions of the screen,
   * `r` a fraction of its width. They are large and low-contrast: you feel them in the glass, you
   * do not see them as shapes.
   */
  orbs: [
    { color: '#9EC3FF', opacity: 0.62, cx: 0.02, cy: 0.0, r: 0.95 },
    { color: '#CDBBFF', opacity: 0.55, cx: 1.0, cy: 0.26, r: 0.8 },
    { color: '#D9F7A0', opacity: 0.42, cx: 0.1, cy: 0.98, r: 0.85 },
  ],

  glass: lightGlass,

  /** Solid raised surfaces (the "white card"). */
  card: {
    background: '#FFFFFF',
    rim: 'rgba(255, 255, 255, 0.9)',
  },
  /** Recessed tiles and inactive chips. */
  inset: {
    background: 'rgba(20, 32, 64, 0.045)',
  },

  field: {
    background: '#FFFFFF',
    // The same field when it sits on a white card: recessed rather than raised.
    onCard: '#F3F5F9',
    border: 'rgba(20, 32, 64, 0.07)',
    borderFocused: '#2863E3',
    borderError: '#D93A2B',
    focusRing: 'rgba(40, 99, 227, 0.20)',
  },

  /** The primary button: lit from above, with a glow in its own colour beneath. */
  button: {
    // White label sits mid-button: 4.9:1 there, 4.0:1 at the lit top edge, 6.1:1 at the base.
    gradient: ['#3C7AF0', '#2358D8'],
    rim: 'rgba(255, 255, 255, 0.45)',
    glow: {
      shadowColor: '#2863E3',
      shadowOpacity: 0.38,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 9 },
      elevation: 8,
    },
  },

  shadow: {
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
      shadowOpacity: 0.16,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 18 },
      elevation: 12,
    },
  },

  cardTones,
  /** Soft tint behind small brand accents. */
  brandSubtle: 'rgba(40, 99, 227, 0.10)',
};

const darkMaterials = {
  mode: 'dark',

  canvas: ['#0E1320', '#090C13', '#05070C'],

  orbs: [
    { color: '#2557E8', opacity: 0.46, cx: 0.02, cy: 0.0, r: 0.95 },
    { color: '#6A47E6', opacity: 0.34, cx: 1.0, cy: 0.3, r: 0.8 },
    { color: '#0E8F7A', opacity: 0.2, cx: 0.1, cy: 0.98, r: 0.85 },
  ],

  glass: darkGlass,

  card: {
    background: '#151A27',
    rim: 'rgba(255, 255, 255, 0.07)',
  },
  inset: {
    background: 'rgba(255, 255, 255, 0.05)',
  },

  field: {
    background: '#151A27',
    onCard: 'rgba(255, 255, 255, 0.055)',
    border: 'rgba(255, 255, 255, 0.10)',
    borderFocused: '#6EA3FF',
    borderError: '#FF7A6B',
    focusRing: 'rgba(110, 163, 255, 0.26)',
  },

  button: {
    gradient: ['#8DB9FF', '#5B93F5'],
    rim: 'rgba(255, 255, 255, 0.4)',
    glow: {
      shadowColor: '#5B93F5',
      shadowOpacity: 0.45,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },

  shadow: {
    sm: {
      shadowColor: '#000000',
      shadowOpacity: 0.28,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOpacity: 0.42,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    lg: {
      shadowColor: '#000000',
      shadowOpacity: 0.55,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 18 },
      elevation: 12,
    },
  },

  cardTones,
  brandSubtle: 'rgba(110, 163, 255, 0.16)',
};

export { lightMaterials, darkMaterials };
