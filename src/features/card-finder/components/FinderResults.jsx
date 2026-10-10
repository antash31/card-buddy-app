// #genai: Card Finder's answer, whatever the spend came from (the audit, or the form's answers).
//
// The plan first, then the best card for the goal when the plan's first pick does not suit it, every
// other card we can price, cards that would help but whose fee we do not have, and cards we cannot
// score. `actions` is the footer the screen chooses (change spend, edit answers…).
import { useState } from 'react';
import { Text, View } from 'react-native';

import { TextLink } from '@/components/actions/TextLink';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import {
  feeText,
  feeUnknownText,
  gainText,
  GOAL_PHRASES,
  HOW_IT_WORKS,
  noPlanText,
  planCaption,
  unrankedText,
} from '../lib/finderCopy';
import { CardList } from './CardList';
import { FinderSummaryCard } from './FinderSummaryCard';
import { PickCard } from './PickCard';

export function FinderResults({ report, actions = null }) {
  const theme = useTheme();
  const [showNotes, setShowNotes] = useState(false);

  const { plan, goal, bestForGoal, options, feeUnknown, unranked } = report;
  const inPlan = new Set(plan.steps.map((step) => step.cardId));
  const others = options.filter((pick) => !inPlan.has(pick.cardId) && pick.cardId !== bestForGoal?.cardId);

  return (
    <>
      <FinderSummaryCard report={report} />

      <View style={{ gap: theme.spacing.md }}>
        <SectionLabel label="The plan" count={plan.steps.length || undefined} />
        {plan.steps.length > 0 ? (
          plan.steps.map((step) => (
            <PickCard key={step.cardId} pick={step} caption={planCaption(step.step)} goal={goal} />
          ))
        ) : (
          <Surface tone="inset">
            <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{noPlanText(report.threshold)}</Text>
          </Surface>
        )}
      </View>

      {bestForGoal ? (
        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label={`Best for ${GOAL_PHRASES[goal.style]}`} />
          <PickCard pick={bestForGoal} goal={goal} />
        </View>
      ) : null}

      {others.length > 0 ? (
        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label="Other cards we can price" count={others.length} />
          <CardList
            rows={others.map((pick) => ({
              key: pick.cardId,
              title: pick.cardName,
              subtitle: `${pick.bank} · ${feeText(pick)}`,
              value: gainText(pick.annualGain),
              valueTone: pick.annualGain >= report.threshold ? 'success' : 'muted',
            }))}
          />
        </View>
      ) : null}

      {feeUnknown.length > 0 ? (
        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label="Fee not in our data" count={feeUnknown.length} />
          <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
            These would earn you more, but Card Finder will not recommend a card until it knows what it costs.
          </Text>
          <CardList
            rows={feeUnknown.map((card) => ({ key: card.cardId, title: card.cardName, subtitle: feeUnknownText(card) }))}
          />
        </View>
      ) : null}

      {unranked.length > 0 ? (
        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label="Not scored yet" count={unranked.length} />
          <CardList
            rows={unranked.map((card) => ({ key: card.cardId, title: card.cardName, subtitle: unrankedText(card) }))}
          />
        </View>
      ) : null}

      {actions}

      <TextLink
        label={showNotes ? 'Hide how this works' : 'How this works'}
        onPress={() => setShowNotes((open) => !open)}
        align="start"
      />
      {showNotes ? (
        <Surface tone="inset" contentStyle={{ gap: theme.spacing.md }}>
          {[
            ...HOW_IT_WORKS,
            `Card Finder compares the ${report.candidatesConsidered} catalog cards with reward data${report.countsNest ? ' that you do not hold' : ''}.`,
            ...report.assumptions,
          ].map((note) => (
            <Text key={note} style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
              {note}
            </Text>
          ))}
        </Surface>
      ) : null}
    </>
  );
}
