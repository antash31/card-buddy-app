// #genai: The headline. With cards counted: what the wallet earns a year after fees now, and with the
// plan. Without (a first card, or "start from scratch"): what the plan's cards would earn on their own.
//
// A pane of tinted glass, like the other tools' headlines. Every figure comes from the API.
import { Text } from 'react-native';

import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

import { basisText } from '../lib/finderCopy';

export function FinderSummaryCard({ report }) {
  const theme = useTheme();
  const { wallet, plan } = report;
  const hasPlan = plan.steps.length > 0;
  const cardsWord = plan.steps.length === 1 ? 'the card below' : `the ${plan.steps.length} cards below`;

  const notCounted =
    report.countsNest && wallet.cardsNotCounted > 0
      ? ` ${wallet.cardsNotCounted} of your cards ${wallet.cardsNotCounted === 1 ? 'is' : 'are'} not counted yet: we cannot value ${wallet.cardsNotCounted === 1 ? 'it' : 'them'}.`
      : '';

  return (
    <Surface tone="glassTinted" shadow="lg" contentStyle={{ gap: theme.spacing.sm }}>
      {report.countsNest ? (
        <>
          <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>Your wallet a year, after fees</Text>
          <Text style={[theme.textStyles.figure, { color: theme.colors.text }]}>{formatRupeesWhole(wallet.annualNet)}</Text>
          {hasPlan ? (
            <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
              With {cardsWord}: {formatRupeesWhole(plan.walletNetAfter)}{' '}
              <Text style={{ color: theme.colors.success }}>(+{formatRupeesWhole(plan.annualGain)})</Text>
            </Text>
          ) : null}
        </>
      ) : (
        <>
          <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
            {hasPlan ? `What ${cardsWord} would earn you` : 'Your spend'}
          </Text>
          {hasPlan ? (
            <Text style={[theme.textStyles.figure, { color: theme.colors.text }]}>
              {formatRupeesWhole(plan.walletNetAfter)}
              <Text style={[theme.textStyles.title, { color: theme.colors.textMuted }]}> a year</Text>
            </Text>
          ) : null}
          {hasPlan ? (
            <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>After annual fees, with GST.</Text>
          ) : null}
        </>
      )}

      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
        {basisText(report)}
        {notCounted}
      </Text>
    </Surface>
  );
}
