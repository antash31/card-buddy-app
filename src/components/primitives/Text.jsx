// #genai: Themed Text primitive. Prefer this over react-native's Text so family, size, leading and
// tracking always travel together — picking a size without its matching leading and tracking is how
// type hierarchy quietly falls apart.
import { Text as RNText } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

// Maps the primitive's variant names onto the theme's ready-made text styles.
const VARIANTS = {
  hero: 'hero',
  display: 'display',
  title: 'title',
  heading: 'heading',
  subtitle: 'bodyStrong',
  body: 'body',
  label: 'label',
  caption: 'caption',
  micro: 'micro',
};

export function Text({ variant = 'body', color, style, ...rest }) {
  const theme = useTheme();
  const styleName = VARIANTS[variant] ?? 'body';

  return (
    <RNText
      style={[theme.textStyles[styleName], { color: color ?? theme.colors.text }, style]}
      {...rest}
    />
  );
}
