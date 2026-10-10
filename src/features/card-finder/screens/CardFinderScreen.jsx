// #genai: Card Finder — which card to get next.
//
// Two ways in, one answer. Someone who has done the wallet audit sees recommendations on that spend
// straight away, and can try other answers. Someone who has not (including someone with no cards at
// all) gets a short form instead of a dead end: what they want back, roughly what they spend, how they
// pay. Both are scored by the same engine; the form's answers are not stored.
//
// Every figure comes from the API. The screen formats rupees and composes sentences; it never
// computes a value itself.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { ArrowLeftIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useTheme } from '@/providers/ThemeProvider';

import { FinderForm } from '../components/FinderForm';
import { FinderResults } from '../components/FinderResults';
import { useFinderForm, usePreview, useRecommendations } from '../hooks/useCardFinder';
import { initialDraft } from '../lib/finderCopy';

function BackButton() {
  const router = useRouter();

  return (
    <IconButton
      accessibilityLabel="Back"
      icon={ArrowLeftIcon}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={styles.back}
    />
  );
}

const RESULTS_HEADER = {
  eyebrow: 'Card finder',
  title: 'Your next card',
  description: 'Ranked by what each card would add in a year, after its fee, on your spend.',
};

const FORM_HEADER = {
  eyebrow: 'Card finder',
  title: 'Find your next card',
  description:
    'Tell us roughly what you spend in a month. Card Finder ranks every card it can price by what it would earn you in a year, after its fee.',
};

function Loading() {
  const theme = useTheme();
  return (
    <View style={[styles.centered, { paddingVertical: theme.spacing.xxxl }]}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

export function CardFinderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const audit = useRecommendations();
  const form = useFinderForm();
  const preview = usePreview();

  // `null` follows the data: results when the audit has spend, the form when it does not.
  const [view, setView] = useState(null);
  const [draft, setDraft] = useState(null);

  // Start the form from the audit's spend and the sign-up goal, once, when its questions arrive.
  useEffect(() => {
    if (form.data && draft === null) setDraft(initialDraft(form.data));
  }, [form.data, draft]);

  if (audit.isPending) {
    return (
      <AppScreen>
        <BackButton />
        <Loading />
      </AppScreen>
    );
  }

  const noAudit = audit.error?.code === 'AUDIT_INCOMPLETE';
  if (audit.error && !noAudit && !audit.data && view !== 'form' && view !== 'answers') {
    return (
      <AppScreen>
        <BackButton />
        <FormBanner message={audit.error.message} />
        <SecondaryButton label="Try again" onPress={audit.refetch} />
      </AppScreen>
    );
  }

  const showing = view ?? (noAudit ? 'form' : 'audit');

  if (showing === 'form') {
    const hasResults = Boolean(audit.data || preview.data);
    // A key per view, so switching between the form and the results starts at the top of the page.
    return (
      <AppScreen key="form">
        <BackButton />
        <ScreenHeader {...FORM_HEADER} />
        {form.error && !form.data ? (
          <>
            <FormBanner message={form.error.message} />
            <SecondaryButton label="Try again" onPress={form.refetch} />
          </>
        ) : !form.data || !draft ? (
          <Loading />
        ) : (
          <FinderForm
            form={form.data}
            draft={draft}
            onChange={setDraft}
            submitting={preview.isPending}
            error={preview.error}
            onSubmit={() => preview.mutate(draft, { onSuccess: () => setView('answers') })}
          />
        )}
        {hasResults ? (
          <TextLink
            label="Back to the results"
            onPress={() => setView(preview.data ? 'answers' : 'audit')}
            align="start"
          />
        ) : null}
      </AppScreen>
    );
  }

  const fromAnswers = showing === 'answers' && preview.data;
  const report = fromAnswers ? preview.data : audit.data;

  return (
    <AppScreen key={fromAnswers ? 'answers' : 'audit'}>
      <BackButton />
      <ScreenHeader {...RESULTS_HEADER} />
      {!fromAnswers && audit.error ? <FormBanner message={audit.error.message} /> : null}
      <FinderResults
        report={report}
        actions={
          fromAnswers ? (
            <SecondaryButton label="Change my answers" onPress={() => setView('form')} />
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              <SecondaryButton label="Change my spend" onPress={() => router.push('/wallet-audit')} />
              <TextLink label="Try different answers" onPress={() => setView('form')} align="start" />
            </View>
          )
        }
      />
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
});
