// #genai: One catalog hit in the Add-a-Card typeahead.
//
// Rows live together inside one soft card, separated by an inset rule, rather than each being its own
// tile — a search result list is one object. Each row leads with the generated card art so the
// issuer's colour is recognisable before the name is read.
//
// The whole row is the target, so the "Add" affordance is a pill *label* rather than a nested button
// — a button inside a pressable row gives the user two overlapping targets and no idea which one
// they hit. Cards already held stay visible and legible: hiding them would leave the user wondering
// whether the search was broken.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CardArt } from '@/components/brand/CardArt';
import { CheckIcon, PlusIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';

const THUMB = 60;

export function CatalogResult({ card, alreadyInNest, adding, isLast, onAdd }) {
  const theme = useTheme();
  const pad = theme.spacing.md;

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
        hitSlop={0}
        style={[styles.row, { padding: pad, gap: theme.spacing.md }]}
      >
        <CardArt width={THUMB} bank={card.bank} />

        <View style={[styles.identity, { gap: theme.spacing.xs }]}>
          <Text
            numberOfLines={1}
            style={[theme.textStyles.micro, { color: theme.colors.primary }]}
          >
            {card.bank}
            {card.network ? `  ·  ${card.network}` : ''}
          </Text>
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
            {card.cardName}
          </Text>
        </View>

        <View style={styles.action}>
          {adding ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : alreadyInNest ? (
            <View
              style={[
                styles.pill,
                { backgroundColor: theme.colors.successSubtle, gap: theme.spacing.xs },
              ]}
            >
              <CheckIcon size={13} color={theme.colors.success} strokeWidth={2.4} />
              <Text style={[theme.textStyles.micro, { color: theme.colors.success }]}>Held</Text>
            </View>
          ) : (
            <View
              style={[
                styles.pill,
                { backgroundColor: theme.colors.primarySubtle, gap: theme.spacing.xs },
              ]}
            >
              <PlusIcon size={13} color={theme.colors.primary} strokeWidth={2.4} />
              <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>Add</Text>
            </View>
          )}
        </View>
      </PressableScale>

      {!isLast ? <Rule inset={pad + THUMB + theme.spacing.md} /> : null}
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
    minWidth: 60,
    alignItems: 'flex-end',
  },
  pill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
