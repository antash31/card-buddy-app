// #genai: One active card in the nest — a soft card with a card-art thumbnail and a two-step remove.
//
// Each card gets its own raised surface (the list is "a stack of soft cards", not a ruled
// statement). The thumbnail is the same generated art as the wallet stack above, so the row and the
// stack visibly refer to the same object; tapping the row selects it, which brings it to the front
// of that stack. The selected row is tinted so the link between the two is never in doubt.
//
// Remove is deliberately two steps and deliberately inline. A modal for a destructive action this
// small is heavier than the action, and the confirmation belongs next to the thing it will delete so
// there is never a question of *which* card is about to go.
import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { CardArt } from '@/components/brand/CardArt';
import { ChevronRightIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { Reveal } from '@/components/motion/Reveal';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { CardIdentity } from './CardIdentity';

const THUMB_WIDTH = 76;

export function NestCardRow({
  card,
  index,
  selected,
  confirming,
  removing,
  onSelect,
  onAskRemove,
  onCancel,
  onConfirm,
  onDetails,
}) {
  const theme = useTheme();

  return (
    <Reveal delay={stagger(Math.min(index, 6), 40)}>
      <Surface
        tone={selected ? 'tinted' : 'raised'}
        radius={theme.radius.xl}
        shadow={selected ? 'sm' : 'md'}
        contentStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}
      >
        <PressableScale
          accessibilityLabel={`${card.cardName}, ${card.bank}`}
          accessibilityState={{ selected }}
          haptic="selection"
          onPress={onSelect}
          scaleTo={0.985}
          hitSlop={0}
          style={[styles.row, { gap: theme.spacing.md }]}
        >
          <CardArt width={THUMB_WIDTH} bank={card.bank} />
          <CardIdentity bank={card.bank} cardName={card.cardName} network={card.network} />
        </PressableScale>

        {confirming ? (
          <View style={{ gap: theme.spacing.md }}>
            <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
              Removing this only takes it out of your nest. You can add it back at any time.
            </Text>
            <View style={[styles.confirmRow, { gap: theme.spacing.sm }]}>
              <SecondaryButton
                label="Keep"
                variant="outline"
                onPress={onCancel}
                disabled={removing}
                style={styles.confirmButton}
              />
              <SecondaryButton
                label="Remove"
                tone="danger"
                loading={removing}
                onPress={onConfirm}
                style={styles.confirmButton}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.actions, { gap: theme.spacing.sm }]}>
            <PressableScale
              accessibilityLabel={`Transactions and details for ${card.cardName}`}
              haptic="selection"
              onPress={onDetails}
              scaleTo={0.97}
              hitSlop={0}
              style={[
                styles.detailsPill,
                {
                  backgroundColor: theme.materials.inset.background,
                  borderRadius: theme.radius.full,
                  paddingHorizontal: theme.spacing.md,
                  gap: theme.spacing.xs,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  theme.textStyles.label,
                  styles.detailsLabel,
                  { color: theme.colors.primary, fontFamily: theme.fonts.text.semibold },
                ]}
              >
                Transactions & details
              </Text>
              <ChevronRightIcon size={14} color={theme.colors.primary} />
            </PressableScale>

            <TextLink label="Remove" tone="muted" align="start" onPress={onAskRemove} />
          </View>
        )}
      </Surface>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsPill: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsLabel: {
    flexShrink: 1,
  },
  confirmRow: {
    flexDirection: 'row',
  },
  confirmButton: {
    flex: 1,
  },
});
