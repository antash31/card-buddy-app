// #genai: Card Finder's short form — for someone who does not know which card to get.
//
// Four questions: what they want back, roughly what they spend, how they usually pay, and (when they
// hold cards) whether to count those. Everyday spend is open from the start; bills and the rest sit
// behind one link, so a first-time user sees five sliders, not fourteen. The buckets and slider
// ranges come from the API, the same list the audit uses.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/actions/Chip';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { Slider } from '@/components/forms/Slider';
import { FormBanner } from '@/components/forms/FormBanner';
import { ArrowRightIcon } from '@/components/icons';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import {
  BUCKET_GROUP_LABELS,
  GOAL_OPTIONS,
  monthlyTotal,
  nestChoiceLabel,
  PAY_MIX_OPTIONS,
  totalText,
} from '../lib/finderCopy';

function ChipRow({ options, value, onChange }) {
  const theme = useTheme();
  return (
    <View style={[styles.chips, { gap: theme.spacing.sm }]}>
      {options.map((option) => (
        <Chip
          key={String(option.value)}
          label={option.label}
          accessibilityRole="radio"
          selected={value === option.value}
          showCheck
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

function BucketGroup({ group, buckets, monthly, onChange }) {
  const theme = useTheme();
  const rows = buckets.filter((bucket) => bucket.group === group);
  if (rows.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionLabel label={BUCKET_GROUP_LABELS[group]} />
      <Surface contentStyle={{ gap: theme.spacing.xl - 4 }}>
        {rows.map((bucket) => (
          <Slider
            key={bucket.id}
            label={bucket.label}
            hint={bucket.hint}
            value={monthly[bucket.id] ?? 0}
            max={bucket.max}
            step={bucket.step}
            onChange={(value) => onChange(bucket.id, value)}
          />
        ))}
      </Surface>
    </View>
  );
}

export function FinderForm({ form, draft, onChange, onSubmit, submitting, error }) {
  const theme = useTheme();
  // Open by default only when the person already has spend there (from the audit).
  const [showAll, setShowAll] = useState(() =>
    form.buckets.some((bucket) => bucket.group !== 'everyday' && (draft.monthly[bucket.id] ?? 0) > 0),
  );

  const setBucket = (id, value) => onChange({ ...draft, monthly: { ...draft.monthly, [id]: value } });
  const total = monthlyTotal(draft.monthly);

  return (
    <View style={{ gap: theme.spacing.xl }}>
      <View style={{ gap: theme.spacing.md }}>
        <SectionLabel label="What do you want back?" />
        <ChipRow options={GOAL_OPTIONS} value={draft.goal} onChange={(goal) => onChange({ ...draft, goal })} />
      </View>

      <BucketGroup group="everyday" buckets={form.buckets} monthly={draft.monthly} onChange={setBucket} />
      {showAll ? (
        <>
          <BucketGroup group="recurring" buckets={form.buckets} monthly={draft.monthly} onChange={setBucket} />
          <BucketGroup group="other" buckets={form.buckets} monthly={draft.monthly} onChange={setBucket} />
        </>
      ) : (
        <TextLink label="Add bills, rent and other spend" onPress={() => setShowAll(true)} align="start" />
      )}

      <Text style={[theme.textStyles.bodyStrong, { color: total > 0 ? theme.colors.text : theme.colors.textMuted }]}>
        {totalText(draft.monthly)}
      </Text>

      <View style={{ gap: theme.spacing.md }}>
        <SectionLabel label="How do you usually pay?" />
        <ChipRow options={PAY_MIX_OPTIONS} value={draft.payMix} onChange={(payMix) => onChange({ ...draft, payMix })} />
      </View>

      {form.nestCount > 0 ? (
        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label="Your cards" />
          <ChipRow
            options={[
              { value: true, label: nestChoiceLabel(form.nestCount) },
              { value: false, label: 'Start from scratch' },
            ]}
            value={draft.includeNest}
            onChange={(includeNest) => onChange({ ...draft, includeNest })}
          />
          <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
            {draft.includeNest
              ? 'Cards are ranked by what they add to the ones you hold, so you are not told to get a card you already have.'
              : 'Cards are ranked as if you held none, including ones you already have.'}
          </Text>
        </View>
      ) : null}

      {error ? <FormBanner message={error.message} /> : null}

      <PrimaryButton
        label="Find my card"
        trailingIcon={ArrowRightIcon}
        loading={submitting}
        disabled={total <= 0}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
