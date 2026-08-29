// #genai: Optional bank filter for the Add-a-Card typeahead.
//
// Squared-off chips rather than pills: at this radius they read as tabs on a filing divider, which
// is the same idea as the tab bar's marker. Selection is a solid pine fill — a binary state deserves
// an unambiguous signal, and this screen has no other accent competing for it.
//
// "All banks" is an explicit chip. Relying on tapping the selected chip again to clear it is a
// hidden affordance, and this filter is the one place a mis-set state silently empties the results.
import { ScrollView, StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

import { CARD_BANKS } from '../lib/banks';

export function BankFilter({ value, onChange }) {
  const theme = useTheme();
  const options = [
    { key: null, label: 'All banks' },
    ...CARD_BANKS.map((b) => ({ key: b, label: b })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.row,
        { gap: theme.spacing.sm, paddingHorizontal: theme.metrics.gutter },
      ]}
      // Bleeds past the screen gutter so the strip reads as continuing off the page rather than
      // stopping short of it.
      style={styles.strip}
    >
      {options.map((option) => {
        const selected = value === option.key;

        return (
          <PressableScale
            key={option.label}
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            haptic="selection"
            onPress={() => onChange(option.key)}
            scaleTo={0.96}
            style={[
              styles.chip,
              {
                borderRadius: theme.radius.sm,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.primary : 'transparent',
                paddingHorizontal: theme.spacing.md,
              },
            ]}
          >
            <Text
              style={[
                theme.textStyles.micro,
                { color: selected ? theme.colors.onPrimary : theme.colors.textMuted },
              ]}
            >
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    marginHorizontal: -24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  chip: {
    height: 34,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
