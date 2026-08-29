// #genai: Assembled theme objects consumed through the `useTheme` hook.
import { darkColors, lightColors } from './colors';
import { fonts } from './fonts';
import { darkMaterials, lightMaterials } from './materials';
import { springs, timings } from './motion';
import { metrics, radius, shadow, spacing, textStyles, typography } from './tokens';

const base = {
  spacing,
  radius,
  typography,
  textStyles,
  shadow,
  metrics,
  fonts,
  springs,
  timings,
};

export const lightTheme = {
  ...base,
  mode: 'light',
  colors: lightColors,
  materials: lightMaterials,
};

export const darkTheme = {
  ...base,
  mode: 'dark',
  colors: darkColors,
  materials: darkMaterials,
};

export const themes = { light: lightTheme, dark: darkTheme };

export { spacing, radius, typography, textStyles, shadow, metrics, fonts, springs, timings };
