// #genai: Optional bank filter for the Add-a-Card typeahead.
//
// A horizontally scrolling strip of `Chip`s. Selection is the glowing accent fill — a binary state
// deserves an unambiguous signal, and this screen has no other accent competing for it.
//
// "All banks" is an explicit chip. Relying on tapping the selected chip again to clear it is a
// hidden affordance, and this filter is the one place a mis-set state silently empties the results.
import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/actions/Chip';
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
      style={{ marginHorizontal: -theme.metrics.gutter, marginVertical: -14 }}
    >
      {options.map((option) => (
        <Chip
          key={option.label}
          label={option.label}
          selected={value === option.key}
          onPress={() => onChange(option.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // Room for the chips' glows (radius ~10, dropped ~5), which the scroll view would otherwise clip
    // into a hard horizontal edge. The negative margin on the strip cancels the extra height.
    paddingVertical: 22,
  },
});
