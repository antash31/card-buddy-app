// #genai: How a card names itself, everywhere it appears.
//
// The previous version put the bank and network in rounded pill badges. Pills are the default
// decoration of generated UI and they made every row shout at the same volume. A statement sets the
// issuer as a small tracked caps line above the item and lets the name itself be the loud part —
// which is also the correct hierarchy, since the user is scanning for the card, not the bank.
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function CardIdentity({ bank, cardName, network }) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { gap: theme.spacing.xs }]}>
      <View style={[styles.meta, { gap: theme.spacing.sm }]}>
        <Text
          numberOfLines={1}
          style={[theme.textStyles.micro, styles.bank, { color: theme.colors.textMuted }]}
        >
          {bank}
        </Text>

        {network ? (
          <>
            {/* A mid-dot rather than another badge: it separates without adding a second shape. */}
            <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>·</Text>
            <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>
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
