// #genai: One spend category and the cards that serve it.
//
// A category can have several cards — a capped 10% card for the first slice of spend and a steady
// card for the rest — so each row shows the card's rate *and* the share of the category it takes.
// The rate is quoted at a fixed Rs.5,000 purchase with fresh caps so cards in the same category are
// comparable; the share is what the audit actually places on the card at the user's real spend.
import { StyleSheet, Text, View } from 'react-native';

import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

import { formatPct, ROLE_LABELS } from '../lib/auditCopy';

function CardLine({ row }) {
  const theme = useTheme();
  const role = ROLE_LABELS[row.role];
  const leading = row.role === 'primary';

  return (
    <View style={[styles.line, { gap: theme.spacing.md }]}>
      <View style={styles.copy}>
        <Text
          numberOfLines={1}
          style={[leading ? theme.textStyles.bodyStrong : theme.textStyles.body, { color: theme.colors.text }]}
        >
          {row.cardName}
        </Text>
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
          {row.assignedMonthly > 0
            ? `${Math.round(row.share * 100)}% of this spend · ${formatRupeesWhole(row.assignedMonthly)} a month`
            : row.bank}
          {row.capped ? ' · capped' : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[theme.textStyles.numeric, { color: leading ? theme.colors.primary : theme.colors.text }]}>
          {formatPct(row.ratePct)}
        </Text>
        {role ? <Text style={[theme.textStyles.micro, { color: leading ? theme.colors.primary : theme.colors.textMuted }]}>{role}</Text> : null}
      </View>
    </View>
  );
}

export function BucketCard({ bucket }) {
  const theme = useTheme();

  return (
    <Surface contentStyle={{ gap: theme.spacing.md }}>
      <View style={styles.header}>
        <Text style={[theme.textStyles.heading, { color: theme.colors.text }]}>{bucket.label}</Text>
        <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}>
          {bucket.monthly > 0 ? `${formatRupeesWhole(bucket.monthly)} a month` : 'No spend entered'}
        </Text>
      </View>

      {bucket.noCardEarns ? (
        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
          No card in your wallet earns rewards on this. Paying another way costs you nothing.
        </Text>
      ) : (
        bucket.cards.map((row, index) => (
          <View key={row.cardId} style={{ gap: theme.spacing.md }}>
            {index > 0 ? <Rule /> : null}
            <CardLine row={row} />
          </View>
        ))
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
