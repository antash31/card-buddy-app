// #genai: How a card names itself, everywhere it appears.
//
// The issuer rides above the name as a small tracked-caps line (with the network after a mid-dot),
// and the card's own name is the loud part — which is the correct hierarchy, since the user is
// scanning for the card, not the bank.
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function CardIdentity({ bank, cardName, network }) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { gap: theme.spacing.xs }]}>
      <View style={[styles.meta, { gap: theme.spacing.sm }]}>
        <Text
          numberOfLines={1}
          style={[theme.textStyles.micro, styles.bank, { color: theme.colors.primary }]}
        >
          {bank}
        </Text>

        {network ? (
          <>
            {/* A mid-dot rather than another badge: it separates without adding a second shape. */}
            <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>·</Text>
            <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>
              {network}
            </Text>
          </>
        ) : null}
      </View>

      <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{cardName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bank: {
    // Long issuer names truncate before they can push the network off the row.
    flexShrink: 1,
  },
});
