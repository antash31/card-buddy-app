// #genai: One card in CIBIL Protector: its ceiling, this cycle's tracked spend, and what to do next.
//
// A card with no limit gets an invitation to add one rather than a row of dashes, because every
// figure here hangs on the limit. The numbers beneath are the evidence; the sentence above them is
// the advice. "Tracked" is deliberate: this is spend Card Buddy has *seen*, not a bank balance.
import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { CardArt } from '@/components/brand/CardArt';
import { Reveal } from '@/components/motion/Reveal';
import { Surface } from '@/components/surfaces/Surface';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { adviceText, dueLine, formatPct, statementLine, STATUS_LABELS } from '../lib/creditCopy';
import { CreditProfileForm } from './CreditProfileForm';
import { UtilisationBar } from './UtilisationBar';

const THUMB = 64;

function Stat({ label, value }) {
  const theme = useTheme();

  return (
    <View style={styles.stat}>
      <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[theme.textStyles.numeric, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

function StatusPill({ status }) {
  const theme = useTheme();
  const above = status === 'above';
  const within = status === 'within';

  const foreground = above ? theme.colors.warning : within ? theme.colors.success : theme.colors.textMuted;
  const background = above
    ? theme.colors.warningSubtle
    : within
      ? theme.colors.successSubtle
      : theme.materials.inset.background;

  return (
    <View
      accessibilityLabel={`Status: ${STATUS_LABELS[status]}`}
      style={[styles.pill, { backgroundColor: background, borderRadius: theme.radius.full }]}
    >
      <Text style={[theme.textStyles.micro, { color: foreground }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

export function CreditCardRow({ card, index, editing, saving, error, onEdit, onCancel, onSave }) {
  const theme = useTheme();
  const measured = card.status === 'within' || card.status === 'above';
  const hasLimit = card.status !== 'setup_needed';

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
          <StatusPill status={card.status} />
        </View>

        {editing ? (
          <CreditProfileForm profile={card.profile} saving={saving} error={error} onSave={onSave} onCancel={onCancel} />
        ) : (
          <>
            <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{adviceText(card)}</Text>

            {hasLimit ? (
              <View style={[styles.stats, { backgroundColor: theme.materials.inset.background, borderRadius: theme.radius.md }]}>
                <Stat label="Limit" value={formatRupeesWhole(card.profile.creditLimit)} />
                <Stat label="Safe ceiling" value={formatRupeesWhole(card.ceiling)} />
                <Stat label="Tracked" value={measured ? formatRupeesWhole(card.spent) : '—'} />
              </View>
            ) : null}

            {measured ? (
              <View style={{ gap: theme.spacing.xs + 2 }}>
                <UtilisationBar pct={card.utilisationPct} />
                <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
                  {formatPct(card.utilisationPct)} of the limit this cycle
                </Text>
              </View>
            ) : null}

            {card.cycle ? (
              <View style={{ gap: 2 }}>
                <Text style={[theme.textStyles.caption, { color: theme.colors.text }]}>{statementLine(card.cycle)}</Text>
                {card.due ? (
                  <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{dueLine(card.due)}</Text>
                ) : null}
              </View>
            ) : null}

            {hasLimit ? (
              <TextLink label="Edit details" onPress={onEdit} align="start" />
            ) : (
              <SecondaryButton label="Add limit and dates" onPress={onEdit} />
            )}
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
  pill: {
    height: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    gap: 8,
  },
  stat: {
    gap: 2,
    flexShrink: 1,
  },
});
