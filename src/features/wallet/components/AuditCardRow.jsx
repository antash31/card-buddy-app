// #genai: One card in the audit: what it earns, what it costs, and what to do about it.
//
// The sentence under the name is the verdict's reason; the numbers beneath it are the evidence.
// Everything is per year, because fees are annual and "Rs.1,179" means something different per month.
// A card the audit could not value gets a question or an explanation instead of numbers — showing
// "Rs.0" there would read as "this card is worthless", which is a claim we cannot make.
import { StyleSheet, Text, View } from 'react-native';

import { CardArt } from '@/components/brand/CardArt';
import { Reveal } from '@/components/motion/Reveal';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { pillVerdict, reasonText } from '../lib/auditCopy';
import { FeeWaiverBar } from './FeeWaiverBar';
import { NeedsInfoPrompt } from './NeedsInfoPrompt';
import { VerdictPill } from './VerdictPill';

const THUMB = 64;

function Stat({ label, value, tone }) {
  const theme = useTheme();

  return (
    <View style={styles.stat}>
      <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[theme.textStyles.numeric, { color: tone ?? theme.colors.text }]}>{value}</Text>
    </View>
  );
}

export function AuditCardRow({ card, index, answering, onAnswer }) {
  const theme = useTheme();
  const scored = card.status === 'ok';

  return (
    <Reveal delay={stagger(Math.min(index, 6), 40)}>
      <Surface radius={theme.radius.xl} contentStyle={{ gap: theme.spacing.md, padding: theme.spacing.lg }}>
        <View style={[styles.header, { gap: theme.spacing.md }]}>
          <CardArt width={THUMB} bank={card.bank} />
          <View style={styles.identity}>
            <Text numberOfLines={1} style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
              {card.bank}
            </Text>
            <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{card.cardName}</Text>
          </View>
          <VerdictPill verdict={pillVerdict(card)} />
        </View>

        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{reasonText(card)}</Text>

        {scored ? (
          <View style={[styles.stats, { backgroundColor: theme.materials.inset.background, borderRadius: theme.radius.md }]}>
            <Stat label="Spend / yr" value={formatRupeesWhole(card.annualSpend)} />
            <Stat label="Earns / yr" value={formatRupeesWhole(card.annualRewards)} />
            <Stat
              label="Fee / yr"
              value={card.feeKnown ? (card.feeWaived ? 'Waived' : formatRupeesWhole(card.annualFee)) : 'Unknown'}
              tone={card.feeWaived ? theme.colors.success : undefined}
            />
          </View>
        ) : null}

        {scored && card.waiver ? <FeeWaiverBar waiver={card.waiver} waived={card.feeWaived} /> : null}

        {scored && card.topBuckets.length > 0 ? (
          <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
            Best used for{' '}
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.text.semibold }}>
              {card.topBuckets.map((bucket) => `${bucket.label} (${Math.round(bucket.share * 100)}%)`).join(', ')}
            </Text>
          </Text>
        ) : null}

        {card.status === 'needs_info'
          ? card.needs.map((fact) => (
              <NeedsInfoPrompt
                key={fact.conditionKey}
                cardId={card.cardId}
                fact={fact}
                pending={answering}
                onAnswer={onAnswer}
              />
            ))
          : null}
      </Surface>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    gap: 8,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
});
