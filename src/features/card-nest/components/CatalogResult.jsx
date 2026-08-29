// #genai: One catalog hit in the Add-a-Card typeahead.
//
// The whole row is the target, so the "Add" affordance is a label rather than a button — a button
// inside a pressable row gives the user two overlapping targets and no idea which one they hit.
// Cards already held stay visible and stay legible: hiding them would leave the user wondering
// whether the search was broken, and dimming them to grey on paper reads as a rendering fault.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, PlusIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';

export function CatalogResult({ card, alreadyInNest, adding, isLast, onAdd }) {
  const theme = useTheme();

  return (
    <View>
      <PressableScale
        accessibilityLabel={
          alreadyInNest ? `${card.cardName}, already in your Card Nest` : `Add ${card.cardName}`
        }
        accessibilityState={{ disabled: alreadyInNest, busy: adding }}
        disabled={alreadyInNest || adding}
        haptic="selection"
        onPress={onAdd}
        scaleTo={0.99}
        dimTo={0.96}
        style={[styles.row, { paddingVertical: theme.spacing.lg, gap: theme.spacing.lg }]}
      >
        <CardIdentityColumn card={card} />

        <View style={styles.action}>
          {adding ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : alreadyInNest ? (
            <View style={[styles.inline, { gap: theme.spacing.xs }]}>
              <CheckIcon size={14} color={theme.colors.success} />
              <Text style={[theme.textStyles.micro, { color: theme.colors.success }]}>Held</Text>
            </View>
          ) : (
            <View style={[styles.inline, { gap: theme.spacing.xs }]}>
              <PlusIcon size={14} color={theme.colors.primary} />
              <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>Add</Text>
            </View>
          )}
        </View>
      </PressableScale>

      {!isLast ? <Rule /> : null}
    </View>
  );
}

// Kept local rather than reusing `CardIdentity` verbatim so the search list can lead with the
// issuer — when you are hunting for a card you half-remember, the bank is the thing you are sure of.
function CardIdentityColumn({ card }) {
  const theme = useTheme();

  return (
    <View style={[styles.identity, { gap: theme.spacing.xs }]}>
      <Text numberOfLines={1} style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>
        {card.bank}
        {card.network ? `  ·  ${card.network}` : ''}
      </Text>
      <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
        {card.cardName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identity: {
    flex: 1,
  },
  action: {
    minWidth: 52,
    alignItems: 'flex-end',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
