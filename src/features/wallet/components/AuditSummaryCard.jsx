// #genai: The headline of the audit: what the wallet earns in a year, net of what it costs.
//
// A pane of tinted glass, like the SwipeMax verdict — the one number the screen exists to give. The
// figure is *net* (rewards minus annual fees), because a wallet that earns Rs.30,000 and costs
// Rs.25,000 to hold is a Rs.5,000 wallet, and saying "Rs.30,000" would flatter it.
import { StyleSheet, Text, View } from 'react-native';

import { Surface } from '@/components/surfaces/Surface';
import { Rule } from '@/components/surfaces/Rule';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

import { bandNote, formatPct } from '../lib/auditCopy';

function Line({ label, value, tone }) {
  const theme = useTheme();

  return (
    <View style={styles.line}>
      <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[theme.textStyles.numeric, { color: tone ?? theme.colors.text }]}>{value}</Text>
    </View>
  );
}

export function AuditSummaryCard({ summary, bandCheck }) {
  const theme = useTheme();
  const note = bandNote(bandCheck);

  return (
    <Surface tone="glassTinted" shadow="lg" contentStyle={{ gap: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>Your wallet earns, net of fees</Text>
        <Text style={[theme.textStyles.figure, { color: theme.colors.text }]}>
          {formatRupeesWhole(summary.annualNet)}
          <Text style={[theme.textStyles.title, { color: theme.colors.textMuted }]}> a year</Text>
        </Text>
        <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}>
          {formatPct(summary.effectiveRatePct)} back on {formatRupeesWhole(summary.annualTotal)} of spend
        </Text>
      </View>

      <Rule />

      <View style={{ gap: theme.spacing.sm }}>
        <Line label="Rewards earned" value={formatRupeesWhole(summary.annualRewards)} tone={theme.colors.success} />
        <Line label="Annual fees" value={`${'−'}${formatRupeesWhole(summary.annualFees)}`} />
      </View>

      {note ? <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{note}</Text> : null}

      {summary.unplacedMonthly > 0 ? (
        <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>
          {formatRupeesWhole(summary.unplacedMonthly)} a month of your spend earns nothing on any card in your wallet.
        </Text>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
});
