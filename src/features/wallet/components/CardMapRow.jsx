// #genai: One card, and the categories it is the card for.
//
// The inverse of `BucketCard`: instead of "for groceries, use these cards", "for this card, use it
// for these categories". Brand and app bonuses sit underneath — they are not in the category map
// (they need a particular merchant or app), but they are often the reason to hold the card at all.
import { StyleSheet, Text, View } from 'react-native';

import { CardArt } from '@/components/brand/CardArt';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { formatPct } from '../lib/auditCopy';

const THUMB = 64;

function Labels({ ids, labelFor }) {
  return ids.map((id) => labelFor(id)).join(', ');
}

export function CardMapRow({ card, labelFor }) {
  const theme = useTheme();

  return (
    <Surface contentStyle={{ gap: theme.spacing.md, padding: theme.spacing.lg }}>
      <View style={[styles.header, { gap: theme.spacing.md }]}>
        <CardArt width={THUMB} bank={card.bank} />
        <View style={styles.identity}>
          <Text numberOfLines={1} style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
            {card.bank}
          </Text>
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{card.cardName}</Text>
        </View>
      </View>

      {card.status !== 'ok' ? (
        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
          {card.status === 'needs_info'
            ? 'We cannot place spend on this card yet. Answer its question in your wallet audit to include it.'
            : 'We cannot place spend on this card yet, because its rewards depend on terms we do not model. It is left out, not counted as zero.'}
        </Text>
      ) : card.primaryFor.length > 0 ? (
        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
          Your card for{' '}
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.text.semibold }}>
            <Labels ids={card.primaryFor} labelFor={labelFor} />
          </Text>
          .
          {card.alsoFor.length > 0 ? (
            <>
              {' '}
              It also takes some{' '}
              <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.text.semibold }}>
                <Labels ids={card.alsoFor} labelFor={labelFor} />
              </Text>{' '}
              spend.
            </>
          ) : null}
        </Text>
      ) : card.alsoFor.length > 0 ? (
        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
          A second card for{' '}
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.text.semibold }}>
            <Labels ids={card.alsoFor} labelFor={labelFor} />
          </Text>
          , once your main card there is capped.
        </Text>
      ) : (
        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
          It is not the best card for any of your spend right now.
        </Text>
      )}

      {card.bonuses.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>Brand and app bonuses</Text>
          {card.bonuses.map((bonus) => (
            <View key={bonus.label} style={styles.bonus}>
              <Text style={[theme.textStyles.body, styles.bonusLabel, { color: theme.colors.text }]}>
                {bonus.label}
                {bonus.conditional ? <Text style={{ color: theme.colors.textMuted }}> · if eligible</Text> : null}
              </Text>
              <Text style={[theme.textStyles.numeric, { color: theme.colors.success }]}>{formatPct(bonus.ratePct)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Surface>
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
  bonus: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  bonusLabel: {
    flexShrink: 1,
  },
});
