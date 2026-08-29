// #genai: One active card in the nest, with a two-step remove.
//
// A ruled row, not a card. Wrapping each card in its own bordered panel made the nest read as a
// stack of unrelated tiles; a rule between rows makes it read as one list — which is what it is.
//
// The leading numeral, set in the Didone, is the detail that ties the screen to its printed-statement
// idea. It also does real work: it tells the user how many cards they hold without a counter.
//
// Remove is deliberately two steps and deliberately inline. A modal for a destructive action this
// small is heavier than the action, and the confirmation belongs next to the thing it will delete so
// there is never a question of *which* card is about to go.
import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { CardIdentity } from './CardIdentity';

export function NestCardRow({
  card,
  index,
  isLast,
  confirming,
  removing,
  onAskRemove,
  onCancel,
  onConfirm,
}) {
  const theme = useTheme();

  return (
    <Reveal delay={stagger(Math.min(index, 6), 40)}>
      <View style={{ paddingVertical: theme.spacing.lg, gap: theme.spacing.md }}>
        <View style={[styles.row, { gap: theme.spacing.lg }]}>
          <Text
            style={[
              theme.textStyles.title,
              styles.numeral,
              { color: theme.colors.textFaint, fontFamily: theme.fonts.display.regular },
            ]}
          >
            {String(index + 1).padStart(2, '0')}
          </Text>

          <CardIdentity bank={card.bank} cardName={card.cardName} network={card.network} />

          {!confirming ? (
            <TextLink
              label="Remove"
              tone="muted"
              align="start"
              underline={false}
              onPress={onAskRemove}
              style={styles.removeLink}
            />
          ) : null}
        </View>

        {/* Indented to the identity column so the confirmation clearly belongs to this row. */}
        {confirming ? (
          <View style={{ gap: theme.spacing.md, marginLeft: NUMERAL_WIDTH + theme.spacing.lg }}>
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
        ) : null}
      </View>

      {!isLast ? <Rule /> : null}
    </Reveal>
  );
}

const NUMERAL_WIDTH = 30;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numeral: {
    width: NUMERAL_WIDTH,
    // Locked to a fixed width and tabular figures so the identity column never shifts between rows.
    fontVariant: ['tabular-nums'],
  },
  removeLink: {
    alignSelf: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
  },
  confirmButton: {
    flex: 1,
  },
});
