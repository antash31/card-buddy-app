// #genai: Wallet Audit — tell us what you spend, and we tell you what each card is worth.
//
// One screen, two modes. The form collects the inputs the doc asks for in order: the current stack
// (read from the Card Nest, not retyped), income (from the profile), and monthly spend by category on
// sliders. The results mode shows the net value of the whole wallet, a verdict per card, and cards
// worth adding. Finishing the form is what unlocks Wallet Categorisation, so the results end by
// handing the user straight to it.
//
// Every figure comes from the API. The screen composes sentences from the API's reason codes and
// formats rupees; it never computes a reward, a fee or a verdict itself.
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/actions/Chip';
import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { useMyCards } from '@/features/card-nest/hooks/useNest';
import { formatRupeesWhole } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { ApplySuggestionRow } from '../components/ApplySuggestionRow';
import { AuditCardRow } from '../components/AuditCardRow';
import { AuditSummaryCard } from '../components/AuditSummaryCard';
import { SpendSliders } from '../components/SpendSliders';
import { useAnswerFact, useAudit, useSaveAudit } from '../hooks/useWallet';
import { bandHint, PAY_MIX_OPTIONS } from '../lib/auditCopy';

function BackButton() {
  const router = useRouter();

  return (
    <IconButton
      accessibilityLabel="Back to Card Nest"
      icon={ArrowLeftIcon}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={styles.back}
    />
  );
}

function Fact({ label, value }) {
  const theme = useTheme();

  return (
    <View style={styles.fact}>
      <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{value || '—'}</Text>
    </View>
  );
}

export function WalletAuditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const nest = useMyCards();
  const audit = useAudit();
  const save = useSaveAudit();
  const answer = useAnswerFact();

  const [mode, setMode] = useState(null);
  const [monthly, setMonthly] = useState({});
  const [payMix, setPayMix] = useState('balanced');
  const [showMethod, setShowMethod] = useState(false);
  const seeded = useRef(false);

  // Seed the form from a saved audit exactly once, so a refetch never overwrites what is being edited.
  useEffect(() => {
    if (!audit.data || seeded.current) return;
    seeded.current = true;
    if (audit.data.inputs) {
      setMonthly(audit.data.inputs.monthly);
      setPayMix(audit.data.inputs.payMix);
    }
    setMode(audit.data.report ? 'results' : 'form');
  }, [audit.data]);

  const cards = nest.data?.cards ?? [];
  const total = useMemo(() => Object.values(monthly).reduce((sum, amount) => sum + (amount || 0), 0), [monthly]);
  const profile = audit.data?.profile;

  const run = () =>
    save.mutate(
      { monthly: Object.fromEntries(Object.entries(monthly).filter(([, amount]) => amount > 0)), payMix },
      { onSuccess: () => setMode('results') },
    );

  // ---- loading and dead ends ------------------------------------------------------------------
  if (audit.isPending || nest.isPending || mode === null) {
    if (audit.error) {
      return (
        <AppScreen>
          <BackButton />
          <FormBanner message={audit.error.message} />
          <SecondaryButton label="Try again" onPress={audit.refetch} />
        </AppScreen>
      );
    }
    return (
      <AppScreen>
        <BackButton />
        <View style={[styles.centered, { paddingVertical: theme.spacing.huge }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </AppScreen>
    );
  }

  if (cards.length === 0) {
    return (
      <AppScreen>
        <BackButton />
        <ScreenHeader eyebrow="Wallet audit" title="Add your cards first" description="The audit tests the cards you actually hold. Add them to your Card Nest, then come back." />
        <PrimaryButton label="Find your first card" trailingIcon={ArrowRightIcon} onPress={() => router.replace('/add-card')} />
      </AppScreen>
    );
  }

  // ---- results --------------------------------------------------------------------------------
  if (mode === 'results' && audit.data.report) {
    const { report } = audit.data;
    const scored = report.cards.filter((card) => card.status === 'ok');

    return (
      <AppScreen key="results">
        <BackButton />
        <ScreenHeader
          eyebrow="Wallet audit"
          title="Your wallet, audited"
          description={`Based on ${formatRupeesWhole(report.summary.monthlyTotal)} of monthly spend across ${scored.length} ${scored.length === 1 ? 'card' : 'cards'}.`}
        />

        {answer.error ? <FormBanner message={answer.error.message} /> : null}

        <Reveal delay={stagger(3)}>
          <AuditSummaryCard summary={report.summary} bandCheck={report.bandCheck} />
        </Reveal>

        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label="Your cards" count={report.cards.length} />
          {report.cards.map((card, index) => (
            <AuditCardRow
              key={card.cardId}
              card={card}
              index={index}
              answering={answer.isPending}
              onAnswer={(fact) => answer.mutate(fact)}
            />
          ))}
          {report.notLoaded.map((card) => (
            <Surface key={card.cardId} tone="inset" contentStyle={{ gap: theme.spacing.xs }}>
              <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{card.cardName}</Text>
              <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
                We have not loaded this card’s reward data yet, so it is not in the numbers.
              </Text>
            </Surface>
          ))}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label="Cards worth adding" count={report.apply.length || undefined} />
          {report.apply.length > 0 ? (
            report.apply.map((suggestion) => <ApplySuggestionRow key={suggestion.cardId} suggestion={suggestion} />)
          ) : (
            <Surface tone="inset">
              <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
                None of the cards we have loaded would add enough to this wallet to be worth a new application.
              </Text>
            </Surface>
          )}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <TextLink
            label={showMethod ? 'Hide how we worked this out' : 'How we worked this out'}
            align="start"
            onPress={() => setShowMethod((previous) => !previous)}
          />
          {showMethod ? (
            <Surface tone="inset" contentStyle={{ gap: theme.spacing.sm }}>
              {report.assumptions.map((line) => (
                <Text key={line} style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
                  {'•  '}
                  {line}
                </Text>
              ))}
            </Surface>
          ) : null}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <PrimaryButton
            label="See wallet categorisation"
            trailingIcon={ArrowRightIcon}
            onPress={() => router.push('/wallet-categories')}
          />
          <SecondaryButton label="Change my spend" onPress={() => setMode('form')} />
        </View>
      </AppScreen>
    );
  }

  // ---- form -----------------------------------------------------------------------------------
  const hint = bandHint(profile?.monthlySpendBand, total);

  return (
    <AppScreen key="form">
      <BackButton />
      <ScreenHeader
        eyebrow="Wallet audit"
        title="Audit your wallet"
        description="Tell us roughly what you spend each month. We will test your cards against it and say which to keep, close or add."
      />

      {save.error ? <FormBanner message={save.error.message} /> : null}

      <Reveal delay={stagger(3)} style={{ gap: theme.spacing.md }}>
        <SectionLabel label="Your stack" count={cards.length} />
        <Surface padded={false}>
          {cards.map((card, index) => (
            <View key={card.userCardId}>
              {index > 0 ? <Rule inset={theme.spacing.lg + theme.spacing.xs} /> : null}
              <View style={[styles.stackRow, { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
                <View style={styles.stackCopy}>
                  <Text numberOfLines={1} style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
                    {card.bank}
                  </Text>
                  <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{card.cardName}</Text>
                </View>
              </View>
            </View>
          ))}
        </Surface>
        <TextLink label="Change cards in Card Nest" align="start" onPress={() => router.replace('/')} />
      </Reveal>

      <Reveal delay={stagger(4)} style={{ gap: theme.spacing.md }}>
        <SectionLabel label="From your profile" />
        <Surface contentStyle={{ gap: theme.spacing.md }}>
          <Fact label="Annual income" value={profile?.incomeBand} />
          <Rule />
          <Fact label="Employment" value={profile?.employmentClass} />
        </Surface>
      </Reveal>

      <Surface tone="tinted" contentStyle={{ gap: theme.spacing.xs }}>
        <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>Your monthly spend</Text>
        <Text style={[theme.textStyles.figure, { color: theme.colors.text }]}>{formatRupeesWhole(total)}</Text>
        <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}>
          {formatRupeesWhole(total * 12)} a year{hint ? `. ${hint}` : ''}
        </Text>
      </Surface>

      <SpendSliders
        buckets={audit.data.buckets}
        monthly={monthly}
        disabled={save.isPending}
        onChange={(id, value) => setMonthly((previous) => ({ ...previous, [id]: value }))}
      />

      <View style={{ gap: theme.spacing.md }}>
        <SectionLabel label="How do you usually pay?" />
        <View style={[styles.mix, { gap: theme.spacing.sm }]}>
          {PAY_MIX_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              accessibilityRole="radio"
              selected={payMix === option.value}
              onPress={() => setPayMix(option.value)}
              style={styles.mixChip}
            />
          ))}
        </View>
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
          Online and in-store spend earn differently on some cards. This sets how we split groceries, dining,
          shopping, travel and education.
        </Text>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <PrimaryButton
          label="Run my audit"
          trailingIcon={ArrowRightIcon}
          onPress={run}
          loading={save.isPending}
          disabled={total <= 0}
        />
        {audit.data.report ? <SecondaryButton label="Cancel" variant="ghost" onPress={() => setMode('results')} /> : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
  },
  centered: {
    alignItems: 'center',
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  stackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackCopy: {
    flex: 1,
    gap: 2,
  },
  mix: {
    flexDirection: 'row',
  },
  mixChip: {
    flex: 1,
  },
});
