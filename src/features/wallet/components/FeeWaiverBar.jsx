// #genai: Progress towards a spend-based annual-fee waiver.
//
// "Spend Rs.8,00,000 a year and the fee goes away" is the single most decision-relevant fact on a
// premium card, and a bar makes the distance to it legible at a glance. The spend shown is what the
// audit places on this card — if the user moves spend, the bar and the verdict move together.
import { StyleSheet, Text, View } from 'react-native';

import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

export function FeeWaiverBar({ waiver, waived }) {
  const theme = useTheme();
  const share = Math.min(waiver.spendOnCard / waiver.threshold, 1);

  return (
    <View
      accessible
      accessibilityLabel={
        waived
          ? `Fee waived. ${formatRupeesWhole(waiver.spendOnCard)} of spend meets the ${formatRupeesWhole(waiver.threshold)} threshold.`
          : `${formatRupeesWhole(waiver.spendOnCard)} of ${formatRupeesWhole(waiver.threshold)} spend towards a fee waiver.`
      }
      style={{ gap: theme.spacing.xs + 2 }}
    >
      <View style={[styles.track, { backgroundColor: theme.materials.inset.background }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(share * 100, share > 0 ? 3 : 0)}%`, backgroundColor: waived ? theme.colors.success : theme.colors.primary },
          ]}
        />
      </View>
      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
        {waived
          ? `Fee waived: your ${formatRupeesWhole(waiver.spendOnCard)} a year meets the ${formatRupeesWhole(waiver.threshold)} threshold.`
          : `${formatRupeesWhole(waiver.spendOnCard)} of ${formatRupeesWhole(waiver.threshold)} a year to waive the fee.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
