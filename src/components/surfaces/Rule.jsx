// #genai: A hairline rule — the workhorse of this design system.
//
// Almost every place a generic UI would reach for a bordered card, this design uses a rule instead.
// A rule separates two things without implying either is contained, which keeps lists reading as
// one continuous document rather than a stack of tiles.
//
// `weight="strong"` is for the rule that closes a section; the default is for rows inside one.
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
          height: weight === 'strong' ? 1 : StyleSheet.hairlineWidth,
          backgroundColor: weight === 'strong' ? theme.colors.borderStrong : theme.colors.border,
          marginLeft: inset,
        },
        style,
      ]}
    />
  );
}
