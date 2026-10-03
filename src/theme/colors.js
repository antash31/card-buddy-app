// #genai: The "Lumen" palette — raw tones plus the semantic light/dark tokens built from them.
//
// Components read semantic tokens (`theme.colors.*`) only, never the raw palette, so re-theming
// stays a single-file change.
//
// Three ideas carry the whole product:
//   - A cool, bright canvas (blue-grey, hue ~250°) that glass can sit on. Neutrals are tinted blue,
//     never pure grey, so every white surface reads as lit rather than flat.
//   - One confident blue (hue ~262°) for the primary action, selection and links. It is the
//     brand colour and the only chromatic colour a control is ever painted in.
//   - A handful of bright "illustration" accents (lime, coral, violet, sun…) that are allowed on
//     decorative surfaces only — card art, avatars, ambient light — and never on text or controls.
//
// Contrast is computed, not eyeballed (WCAG ratios, light mode): `text` 16–18:1, `textMuted` 5.6–6.3:1,
// `primary` 5.3:1 on white / 4.65:1 on the canvas, `success` 4.9–5.5:1 and `danger` 4.6–5.4:1 on
// white, the canvas and their tinted fills — so all of them may colour small text. `textFaint` is ~3.2:1: icons,
// separators, placeholders and large type only, never a fact the user has to read. In dark mode
// the accent flips to a lighter blue (6.9–7.8:1), which means its label has to flip to near-black
// (`onPrimary`, 7.3:1) to stay legible.
//
// Tones are written as hex because React Native's style engine does not parse `oklch()`.

const palette = {
  // ── Canvas & surfaces, light ───────────────────────────────────
  canvas: '#EDF1F6',
  canvasHigh: '#F6F8FC',
  canvasLow: '#E3E9F1',
  white: '#FFFFFF',
  mist: '#F4F6FA', //            sunken tiles, inactive chips
  hairline: 'rgba(20, 32, 64, 0.08)',
  hairlineStrong: 'rgba(20, 32, 64, 0.16)',

  // ── Ink, light ─────────────────────────────────────────────────
  ink: '#0F1521',
  inkMuted: '#566075',
  inkFaint: '#8791A4',

  // ── Blue: the one accent ───────────────────────────────────────
  blue: '#2863E3',
  bluePressed: '#1F52C4',
  blueSubtle: '#E7EFFF',
  blueEdge: '#C4D6FA',
  blueBright: '#4C8DFF', //      for gradients and ambient light only
  blueLight: '#6EA3FF', //       the accent on a dark ground
  blueLightPressed: '#5890F0',
  blueSubtleDark: 'rgba(110, 163, 255, 0.16)',
  blueEdgeDark: 'rgba(110, 163, 255, 0.34)',

  // ── Status ─────────────────────────────────────────────────────
  green: '#0A7849',
  greenSubtle: '#E1F5EB',
  greenLight: '#46D39A',
  greenSubtleDark: 'rgba(70, 211, 154, 0.14)',
  amber: '#A25F00',
  amberSubtle: '#FFF1D6',
  amberLight: '#F2B24A',
  amberSubtleDark: 'rgba(242, 178, 74, 0.14)',
  red: '#C9301F',
  redSubtle: '#FDEBE8',
  redLight: '#FF7A6B',
  redSubtleDark: 'rgba(255, 122, 107, 0.14)',

  // ── Canvas & surfaces, dark ────────────────────────────────────
  canvasDark: '#090C13',
  canvasDarkHigh: '#0F1420',
  canvasDarkLow: '#05070C',
  cardDark: '#151A27',
  mistDark: '#0F131D',
  hairlineDark: 'rgba(255, 255, 255, 0.09)',
  hairlineStrongDark: 'rgba(255, 255, 255, 0.18)',

  // ── Ink, dark ──────────────────────────────────────────────────
  inkLight: '#EEF2FA',
  inkMutedDark: '#9EA9BE',
  inkFaintDark: '#6C778C',

  // ── Illustration accents — decorative surfaces only ────────────
  lime: '#C8F24A',
  coral: '#FF5A47',
  violet: '#7B61F2',
  sky: '#7DB6FF',
  sun: '#FFD84A',
  graphite: '#3A3D45',
  mint: '#3DD6A0',
  peach: '#FFB38A',
  rose: '#FF8FB1',
};

const lightColors = {
  background: palette.canvas,
  surface: palette.white,
  surfaceAlt: palette.mist,
  border: palette.hairline,
  borderStrong: palette.hairlineStrong,

  text: palette.ink,
  textMuted: palette.inkMuted,
  // Non-text and large-text only — ~3.2:1. Never body copy.
  textFaint: palette.inkFaint,
  textInverted: palette.white,

  primary: palette.blue,
  primaryPressed: palette.bluePressed,
  primarySubtle: palette.blueSubtle,
  primaryEdge: palette.blueEdge,
  onPrimary: palette.white,

  success: palette.green,
  successSubtle: palette.greenSubtle,
  warning: palette.amber,
  warningSubtle: palette.amberSubtle,
  danger: palette.red,
  dangerSubtle: palette.redSubtle,

  overlay: 'rgba(15, 21, 33, 0.40)',
};

const darkColors = {
  background: palette.canvasDark,
  surface: palette.cardDark,
  surfaceAlt: palette.mistDark,
  border: palette.hairlineDark,
  borderStrong: palette.hairlineStrongDark,

  text: palette.inkLight,
  textMuted: palette.inkMutedDark,
  textFaint: palette.inkFaintDark,
  textInverted: palette.canvasDark,

  primary: palette.blueLight,
  primaryPressed: palette.blueLightPressed,
  primarySubtle: palette.blueSubtleDark,
  primaryEdge: palette.blueEdgeDark,
  // The accent is light in dark mode, so its label has to flip to the dark ground.
  onPrimary: '#06132E',

  success: palette.greenLight,
  successSubtle: palette.greenSubtleDark,
  warning: palette.amberLight,
  warningSubtle: palette.amberSubtleDark,
  danger: palette.redLight,
  dangerSubtle: palette.redSubtleDark,

  overlay: 'rgba(3, 5, 10, 0.66)',
};

export { palette, lightColors, darkColors };
