// #genai: The headline: how much of all your limits is in use, against the 30% line.
//
// A pane of tinted glass, like the Wallet Audit headline — the one figure the screen exists to give.
// It pools only the cards that have both a limit and a statement day, and says so when some are
// left out, because a figure quietly computed over three of five cards would flatter the wallet.
import { StyleSheet, Text, View } from 'react-native';

import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

import { formatPct, overallText } from '../lib/creditCopy';
import { UtilisationBar } from './UtilisationBar';

function Line({ label, value }) {
  const theme = useTheme();

  return (
    <View style={styles.line}>
      <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[theme.textStyles.numeric, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

export function OverallCard({ overall, cardsTotal, thresholdPct }) {
  const theme = useTheme();

  return (
    <Surface tone="glassTinted" shadow="lg" contentStyle={{ gap: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>Across your cards</Text>
        {overall ? (
          <Text style={[theme.textStyles.figure, { color: theme.colors.text }]}>
            {formatPct(overall.utilisationPct)}
            <Text style={[theme.textStyles.title, { color: theme.colors.textMuted }]}> of your limits</Text>
          </Text>
        ) : (
          <Text style={[theme.textStyles.title, { color: theme.colors.text }]}>Nothing to measure yet</Text>
        )}
        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{overallText(overall, cardsTotal)}</Text>
      </View>

      {overall ? (
        <>
          <UtilisationBar pct={overall.utilisationPct} thresholdPct={thresholdPct} />
          <Rule />
          <View style={{ gap: theme.spacing.sm }}>
            <Line label="Tracked this cycle" value={formatRupeesWhole(overall.totalSpent)} />
            <Line label="Combined limits" value={formatRupeesWhole(overall.totalLimit)} />
            <Line label="30% ceiling" value={formatRupeesWhole(overall.ceiling)} />
          </View>
        </>
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
