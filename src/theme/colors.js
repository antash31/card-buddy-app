// #genai: The "Statement" palette — raw tones plus the semantic light/dark tokens built from them.
//
// Components read semantic tokens (`theme.colors.*`) only, never the raw palette, so re-theming
// stays a single-file change.
//
// Two hues carry the whole product:
//   - Paper / ink, hue ~70°. Warm neutrals, because cold grey reads clinical and this has to read
//     considered. Every neutral is tinted, so nothing is ever pure black or pure white.
//   - Pine, hue 155°. The only saturated colour in the system, reserved for the primary action,
//     selection, and positive value. It works *because* it is rare.
// Oxide (25°) and ochre (70°) exist purely for destructive and cautionary states.
//
// Each tone was designed in OKLCH for perceptual uniformity and converted to hex, because React
// Native's style engine does not parse `oklch()`. The source coordinate is kept beside each value —
// edit the OKLCH, re-run `node scripts/oklch.mjs`, paste the hex back.

const palette = {
  // ── Paper: warm neutrals, light end ────────────────────────────  oklch(L C 75)
  paper: '#FCF9F5', //        0.984 0.006
  paperRaised: '#FFFDFC', //  0.996 0.003
  paperSunken: '#F4F0EB', //  0.956 0.008
  rule: '#DEDAD5', //         0.890 0.008
  ruleStrong: '#C2BDB7', //   0.800 0.010

  // ── Ink: warm neutrals, dark end ───────────────────────────────  oklch(L C ~65)
  inkFaint: '#8E8881', //     0.630 0.012
  inkMuted: '#69625B', //     0.500 0.014
  ink: '#251E18', //          0.240 0.016
  inkDeep: '#120C07', //      0.160 0.014

  // ── Pine: the accent ───────────────────────────────────────────  oklch(L C 155)
  pine: '#326445', //         0.460 0.075
  pinePressed: '#245337', //  0.400 0.070
  pineEdge: '#C2D7C9', //     0.860 0.030
  pineSubtle: '#E1EFE5', //   0.940 0.020
  pineLight: '#6BB888', //    0.720 0.105 — legible on a dark ground
  pineLightPressed: '#569E71', // 0.640 0.100
  pineEdgeDark: '#243F2E', // 0.340 0.045
  pineSubtleDark: '#17291D', //   0.260 0.032

  // ── Oxide: destructive ─────────────────────────────────────────  oklch(L C 25)
  oxide: '#A83634', //        0.500 0.150
  oxideSubtle: '#FDE7E4', //  0.945 0.025
  oxideLight: '#DB6C66', //   0.660 0.140
  oxideSubtleDark: '#3E1E1C', //  0.280 0.050

  // ── Ochre: caution ─────────────────────────────────────────────  oklch(L C ~70)
  ochre: '#A56C26', //        0.580 0.110
  ochreSubtle: '#FBECD9', //  0.950 0.030
  ochreLight: '#D79E59', //   0.740 0.110
  ochreSubtleDark: '#3A2A16', //  0.300 0.040

  // ── Paper: dark end (the same warm hue, inverted) ──────────────  oklch(L C 72)
  paperDark: '#0E0C09', //    0.155 0.008
  paperDarkRaised: '#181511', //  0.198 0.009
  paperDarkSunken: '#080604', //  0.125 0.007
  ruleDark: '#2C2824', //     0.280 0.010
  ruleDarkStrong: '#443F39', //   0.370 0.012
  inkFaintDark: '#6D6862', // 0.520 0.012
  inkMutedDark: '#979189', // 0.660 0.014
  inkLight: '#F1EEEA', //     0.950 0.006
};

const lightColors = {
  background: palette.paper,
  surface: palette.paperRaised,
  surfaceAlt: palette.paperSunken,
  border: palette.rule,
  borderStrong: palette.ruleStrong,

  text: palette.ink,
  textMuted: palette.inkMuted,
  // Non-text and large-text only — 3.34:1. Never body copy.
  textFaint: palette.inkFaint,
  textInverted: palette.paper,

  primary: palette.pine,
  primaryPressed: palette.pinePressed,
  primarySubtle: palette.pineSubtle,
  primaryEdge: palette.pineEdge,
  onPrimary: palette.paper,

  success: palette.pine,
  successSubtle: palette.pineSubtle,
  warning: palette.ochre,
  warningSubtle: palette.ochreSubtle,
  danger: palette.oxide,
  dangerSubtle: palette.oxideSubtle,

  overlay: 'rgba(18, 12, 7, 0.42)',
};

const darkColors = {
  background: palette.paperDark,
  surface: palette.paperDarkRaised,
  surfaceAlt: palette.paperDarkSunken,
  border: palette.ruleDark,
  borderStrong: palette.ruleDarkStrong,

  text: palette.inkLight,
  textMuted: palette.inkMutedDark,
  textFaint: palette.inkFaintDark,
  textInverted: palette.paperDark,

  primary: palette.pineLight,
  primaryPressed: palette.pineLightPressed,
  primarySubtle: palette.pineSubtleDark,
  primaryEdge: palette.pineEdgeDark,
  // The accent is light in dark mode, so its label has to flip to the dark ground.
  onPrimary: palette.paperDark,

  success: palette.pineLight,
  successSubtle: palette.pineSubtleDark,
  warning: palette.ochreLight,
  warningSubtle: palette.ochreSubtleDark,
  danger: palette.oxideLight,
  dangerSubtle: palette.oxideSubtleDark,

  overlay: 'rgba(8, 6, 4, 0.66)',
};

export { palette, lightColors, darkColors };
