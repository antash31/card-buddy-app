// #genai: A card the audit suggests adding — only ever one whose cost is known.
import { StyleSheet, Text, View } from 'react-native';

import { CardArt } from '@/components/brand/CardArt';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

const THUMB = 64;

export function ApplySuggestionRow({ suggestion }) {
  const theme = useTheme();

  const feeText = suggestion.feeWaived
    ? 'fee waived at your spend'
    : suggestion.annualFee > 0
      ? `${formatRupeesWhole(suggestion.annualFee)} annual fee`
      : 'no annual fee';

  return (
    <Surface tone="tinted" radius={theme.radius.xl} contentStyle={{ gap: theme.spacing.md, padding: theme.spacing.lg }}>
      <View style={[styles.header, { gap: theme.spacing.md }]}>
        <CardArt width={THUMB} bank={suggestion.bank} />
        <View style={styles.identity}>
          <Text numberOfLines={1} style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
            {suggestion.bank}
          </Text>
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{suggestion.cardName}</Text>
        </View>
      </View>

      <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
        Would add about{' '}
        <Text style={{ color: theme.colors.success, fontFamily: theme.fonts.text.bold }}>
          {formatRupeesWhole(suggestion.annualGain)} a year
        </Text>{' '}
        to your wallet — {feeText}
        {suggestion.joiningFee ? `, plus a ${formatRupeesWhole(suggestion.joiningFee)} joining fee` : ''}.
      </Text>

      {suggestion.topBuckets.length > 0 ? (
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
          Would take your{' '}
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.text.semibold }}>
            {suggestion.topBuckets.map((bucket) => bucket.label.toLowerCase()).join(', ')}
          </Text>{' '}
          spend.
        </Text>
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
});
