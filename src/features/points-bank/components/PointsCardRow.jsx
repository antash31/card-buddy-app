// #genai: One card in the Points Bank: its balance, what that comes to, and how it can be redeemed.
//
// Two figures, deliberately: what the balance is worth *taken as cash* and what it is worth *at
// most* through the best route. The gap between them is why this screen exists. The best figure is
// always labelled "at most" and says when the route is limited, because it is only true for someone
// who uses that route.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { CardArt } from '@/components/brand/CardArt';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { formatBalance, freshness, minimumNote, unvaluedText, valueLines } from '../lib/pointsCopy';
import { BalanceForm } from './BalanceForm';
import { RouteList } from './RouteList';

const THUMB = 64;

export function PointsCardRow({ card, index, editing, saving, error, onEdit, onCancel, onSave }) {
  const theme = useTheme();
  const [showRoutes, setShowRoutes] = useState(false);

  const lines = valueLines(card);
  const note = minimumNote(card);
  const fresh = freshness(card);
  const unvalued = unvaluedText(card);
  const canEnter = card.status !== 'no_routes';

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
        </View>

        {editing ? (
          <BalanceForm balance={card.balance} saving={saving} error={error} onSave={onSave} onCancel={onCancel} />
        ) : (
          <>
            {unvalued ? <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{unvalued}</Text> : null}

            {card.balance !== null ? (
              <View style={{ gap: 2 }}>
                <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>Balance</Text>
                <Text style={[theme.textStyles.title, { color: theme.colors.text }]}>
                  {formatBalance(card.balance)}
                  <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}> points</Text>
                </Text>
                {fresh ? (
                  <Text style={[theme.textStyles.caption, { color: fresh.stale ? theme.colors.warning : theme.colors.textMuted }]}>
                    {fresh.text}
                  </Text>
                ) : null}
              </View>
            ) : canEnter ? (
              <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
                No balance entered. Add one to see what it comes to.
              </Text>
            ) : null}

            {lines.length > 0 ? (
              <View style={[styles.values, { backgroundColor: theme.materials.inset.background, borderRadius: theme.radius.md }]}>
                {lines.map((line, position) => (
                  <View key={line.key} style={{ gap: theme.spacing.xs }}>
                    {position > 0 ? <Rule /> : null}
                    <View style={styles.valueRow}>
                      <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}>{line.label}</Text>
                      <Text style={[theme.textStyles.numeric, { color: theme.colors.text }]}>{formatRupeesWhole(line.amount)}</Text>
                    </View>
                    <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{line.detail}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {note ? <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>{note}</Text> : null}

            {card.routes.length > 0 ? (
              <>
                <TextLink
                  label={showRoutes ? 'Hide routes' : `All routes (${card.routes.length})`}
                  onPress={() => setShowRoutes((open) => !open)}
                  align="start"
                />
                {showRoutes ? <RouteList routes={card.routes} /> : null}
              </>
            ) : null}

            {canEnter ? (
              card.balance !== null ? (
                <TextLink label="Edit balance" onPress={onEdit} align="start" />
              ) : (
                <SecondaryButton label="Enter balance" onPress={onEdit} />
              )
            ) : null}
          </>
        )}
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
  values: {
    padding: 14,
    gap: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
});
