// #genai: A soft divider, for the places a card holds several rows.
//
// Inside a `Surface`, rows are separated by one of these rather than by wrapping each row in its own
// card — a list of tiles inside a tile reads as noise. Inset it past the leading icon so it looks
// like it belongs to the row text, not the card edge.
//
// `weight="strong"` is for closing off a section; the default is for rows inside one.
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function Rule({ weight = 'hair', inset = 0, style }) {
  const theme = useTheme();

  return (
    <View
      // A divider is decoration to a screen reader — it must not become a stop in the tree.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          height: StyleSheet.hairlineWidth * (weight === 'strong' ? 2 : 1),
          backgroundColor: weight === 'strong' ? theme.colors.borderStrong : theme.colors.border,
          marginLeft: inset,
        },
        style,
      ]}
    />
  );
}
