// #genai: The headline: what all your points come to, at most.
//
// A pane of tinted glass, like the other headlines. The figure is "up to" because it values every
// balance at the best route the catalog lists, which only holds for someone who uses those routes;
// the line beneath says what it comes to as plain statement credit when that can be said for every
// card, and says plainly which balances were left out because the catalog has no value for them.
import { Text, View } from 'react-native';

import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

import { summaryText } from '../lib/pointsCopy';

export function PointsSummaryCard({ totals }) {
  const theme = useTheme();
  const hasValue = totals.valuedCards > 0;

  return (
    <Surface tone="glassTinted" shadow="lg" contentStyle={{ gap: theme.spacing.sm }}>
      <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>Your points are worth</Text>
      {hasValue ? (
        <View style={{ gap: 2 }}>
          <Text style={[theme.textStyles.figure, { color: theme.colors.text }]}>
            <Text style={[theme.textStyles.title, { color: theme.colors.textMuted }]}>up to </Text>
            {formatRupeesWhole(totals.atBest)}
          </Text>
        </View>
      ) : (
        <Text style={[theme.textStyles.title, { color: theme.colors.text }]}>Nothing to value yet</Text>
      )}
      <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{summaryText(totals)}</Text>
    </Surface>
  );
}
