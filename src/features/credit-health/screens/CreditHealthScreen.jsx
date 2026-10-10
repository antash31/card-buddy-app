// #genai: CIBIL Protector — keep every card's balance under 30% of its limit.
//
// A card's limit and billing dates live on the bank's statement, so the screen asks for them once per
// card; everything else is derived. Tracked spend comes from the alerts Card Buddy has already read,
// which means it is a *lower bound* on what a card reports, and the screen says so rather than
// presenting it as a balance. This is guidance toward a widely quoted rule of thumb, not a credit
// score and not a prediction of one.
//
// Every figure comes from the API. The screen formats rupees and dates and composes sentences; it
// never computes a ceiling, a cycle or a utilisation itself.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { CreditCardRow } from '../components/CreditCardRow';
import { OverallCard } from '../components/OverallCard';
import { ReminderToggle } from '../components/ReminderToggle';
import { useCreditHealth, useSaveCreditProfile } from '../hooks/useCreditHealth';

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

const NOTES = [
  'Most lenders report the balance on your statement date, so that is the number worth keeping low, card by card and across all your cards.',
  'The 30% figure is a widely quoted guideline. It is not a credit score, and a bureau’s own formula may differ.',
  '“Tracked” is spend Card Buddy has read from your alerts in the current billing cycle, net of refunds. It cannot see a balance carried from the last statement, or a payment you make mid-cycle, so your real balance can be higher or lower.',
  'Limits and dates are what you enter. Check them against your latest statement.',
];

export function CreditHealthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const health = useCreditHealth();
  const save = useSaveCreditProfile();

  const [editingId, setEditingId] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  const cards = health.data?.cards ?? [];
  const thresholdPct = (health.data?.threshold ?? 0.3) * 100;

  const startEditing = (card) => {
    save.reset();
    setEditingId(card.userCardId);
  };

  const submit = (card, body) =>
    save.mutate({ userCardId: card.userCardId, body }, { onSuccess: () => setEditingId(null) });

  if (health.isPending) {
    return (
      <AppScreen>
        <BackButton />
        {health.error ? (
          <>
            <FormBanner message={health.error.message} />
            <SecondaryButton label="Try again" onPress={health.refetch} />
          </>
        ) : (
          <View style={[styles.centered, { paddingVertical: theme.spacing.xxxl }]}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
      </AppScreen>
    );
  }

  if (health.error && !health.data) {
    return (
      <AppScreen>
        <BackButton />
        <FormBanner message={health.error.message} />
        <SecondaryButton label="Try again" onPress={health.refetch} />
      </AppScreen>
    );
  }

  if (cards.length === 0) {
    return (
      <AppScreen>
        <BackButton />
        <ScreenHeader
          eyebrow="CIBIL Protector"
          title="Stay under 30%"
          description="Add your cards first. Then add each one’s limit and statement date and Card Buddy will show how much of it is safe to use."
        />
        <PrimaryButton label="Find your first card" trailingIcon={ArrowRightIcon} onPress={() => router.replace('/add-card')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <BackButton />
      <ScreenHeader
        eyebrow="CIBIL Protector"
        title="Stay under 30%"
        description="Keep the balance each card reports under 30% of its limit. Add a limit and a statement date for each card and Card Buddy tracks the cycle for you."
      />

      {health.error ? <FormBanner message={health.error.message} /> : null}

      <OverallCard overall={health.data.overall} cardsTotal={cards.length} thresholdPct={thresholdPct} />

      <ReminderToggle hasDates={cards.some((card) => card.upcoming)} />

      <View style={{ gap: theme.spacing.md }}>
        <SectionLabel label="Your cards" count={cards.length} />
        {cards.map((card, index) => (
          <CreditCardRow
            key={card.userCardId}
            card={card}
            index={index}
            editing={editingId === card.userCardId}
            saving={save.isPending}
            error={editingId === card.userCardId ? save.error : null}
            onEdit={() => startEditing(card)}
            onCancel={() => setEditingId(null)}
            onSave={(body) => submit(card, body)}
          />
        ))}
      </View>

      <TextLink
        label={showNotes ? 'Hide how this works' : 'How this works'}
        onPress={() => setShowNotes((open) => !open)}
        align="start"
      />
      {showNotes ? (
        <Surface tone="inset" contentStyle={{ gap: theme.spacing.md }}>
          {NOTES.map((note) => (
            <Text key={note} style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
              {note}
            </Text>
          ))}
        </Surface>
      ) : null}
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
