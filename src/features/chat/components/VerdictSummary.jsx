// #genai: The scored answer, set as a statement rather than printed as engine text.
//
// The engine's `verdictText` is a terminal-style block ("  USE: X -> Rs.240.00"). It stays the
// ground truth for the model, but showing it to a person at a counter is unreadable — so this
// renders the same numbers from the structured `ranked` array: one headline card, one figure, and
// ruled runner-up rows underneath.
import { StyleSheet, Text, View } from 'react-native';

import { Rule } from '@/components/surfaces/Rule';
import { formatRupees } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';

const EYEBROWS = {
  winner: 'Use',
  tie: 'Either one',
  no_positive_option: 'No positive option',
  needs_clarification: 'Conditional result',
};

const RUNNERS_SHOWN = 3;

function NoteGroup({ label, lines, tone }) {
  const theme = useTheme();
  if (lines.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>{label}</Text>
      {lines.map((line, index) => (
        <Text
          key={`${label}-${index}`}
          style={[theme.textStyles.caption, { color: tone ?? theme.colors.textMuted }]}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

export function VerdictSummary({ verdict }) {
  const theme = useTheme();

  const ranked = Array.isArray(verdict?.ranked) ? verdict.ranked : [];
  const top = verdict?.bestGuaranteed ?? ranked[0];
  const runners = ranked.slice(1, 1 + RUNNERS_SHOWN);
  const hiddenCount = Math.max(ranked.length - 1 - RUNNERS_SHOWN, 0);
  const pending = verdict?.pendingSelfReport ?? [];

  const conditional = verdict?.conditionalWinners ?? [];
  const conditionText = (requirements) =>
    (requirements ?? []).map((requirement) => requirement.reason).join(' and ');

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>
        {EYEBROWS[verdict?.verdict] ?? 'No ranking'}
      </Text>

      {top ? (
        <View style={{ gap: theme.spacing.xs }}>
          <View style={[styles.headline, { gap: theme.spacing.md }]}>
            <Text
              numberOfLines={2}
              style={[theme.textStyles.title, styles.grow, { color: theme.colors.text }]}
            >
              {top.cardName}
            </Text>
            <Text
              style={[
                theme.textStyles.numeric,
                styles.figure,
                { color: theme.colors.primary, fontFamily: theme.fonts.text.semibold },
              ]}
            >
              {formatRupees(top.rewardValue ?? 0)}
            </Text>
          </View>

          {top.capped ? (
            <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>
              Cap reached — this is the capped amount.
            </Text>
          ) : null}
          {(top.feeCost ?? 0) > 0 ? (
            <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>
              Fee {formatRupees(Math.max(0, top.feeCost - (top.feeWaiver ?? 0)))} · net benefit{' '}
              {formatRupees(top.netBenefit ?? 0)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {conditional.length > 0 ? (
        <NoteGroup
          label="If this is true"
          lines={conditional.map(
            (path) =>
              `${conditionText(path.requirements)} — ${path.cardName}: ${formatRupees(path.rewardValue ?? 0)} rewards${
                (path.feeCost ?? 0) > 0
                  ? `, ${formatRupees(path.netBenefit ?? 0)} net benefit after fees`
                  : ''
              }`,
          )}
        />
      ) : null}

      {verdict?.recommendedClarification ? (
        <NoteGroup label="One question" lines={[verdict.recommendedClarification.reason]} />
      ) : null}

      {runners.length > 0 ? (
        <View>
          {runners.map((row, index) => (
            <View key={row.cardId ?? `${row.cardName}-${index}`}>
              <Rule />
              <View style={[styles.row, { paddingVertical: theme.spacing.md }]}>
                <Text
                  style={[theme.textStyles.micro, styles.rank, { color: theme.colors.textFaint }]}
                >
                  {index + 2}
                </Text>
                <View style={[styles.grow, { gap: theme.spacing.hair }]}>
                  <Text
                    numberOfLines={1}
                    style={[theme.textStyles.label, { color: theme.colors.text }]}
                  >
                    {row.cardName}
                  </Text>
                  {top && (row.rewardValue ?? 0) < (top.rewardValue ?? 0) ? (
                    <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>
                      {formatRupees((top.rewardValue ?? 0) - (row.rewardValue ?? 0))} less reward
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    theme.textStyles.numeric,
                    { color: theme.colors.text, fontSize: theme.textStyles.caption.fontSize },
                  ]}
                >
                  {formatRupees(row.rewardValue ?? 0)}
                </Text>
              </View>
            </View>
          ))}
          <Rule />
          {hiddenCount > 0 ? (
            <Text
              style={[
                theme.textStyles.micro,
                { color: theme.colors.textFaint, paddingTop: theme.spacing.sm },
              ]}
            >
              {hiddenCount} more {hiddenCount === 1 ? 'card' : 'cards'} ranked lower
            </Text>
          ) : null}
        </View>
      ) : null}

      <NoteGroup
        label="Cap usage needed"
        lines={pending.map(
          (cap) => `${cap.cardName} — tell me how much of "${cap.label}" has already been used.`,
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headline: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grow: {
    flex: 1,
  },
  figure: {
    // Figures sit in a column across turns; a fixed alignment keeps them from wandering.
    textAlign: 'right',
  },
  rank: {
    width: 14,
  },
});
