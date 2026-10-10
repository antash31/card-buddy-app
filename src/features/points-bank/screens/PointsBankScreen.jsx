// #genai: Points Bank — what the points on your cards are worth, and how to redeem them.
//
// A balance is what the cardholder enters, because it lives in the bank's app. Everything else is
// derived: each card's redemption routes come from the catalog, ranked by what a point yields after
// conversion loss, and a balance is valued at the default route (taken as cash) and at the best
// route (the most it is worth, to someone who uses that route).
//
// Every figure comes from the API. The screen formats rupees and composes sentences; it never
// computes a value itself.
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

import { PointsCardRow } from '../components/PointsCardRow';
import { PointsSummaryCard } from '../components/PointsSummaryCard';
import { usePointsBank, useSaveBalance } from '../hooks/usePointsBank';

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
  'Values are the rupee-per-point figures the card’s own terms publish. Card Buddy does not set them and cannot see your bank account.',
  '“At most” is the best route the catalog lists. It is only true if you use that route, and routes often carry limits, such as a share of a booking or a monthly cap, so a large balance can take several redemptions.',
  '“Taken as cash” is the conservative figure: the default route, usually a statement credit.',
  'Balances are what you enter. Check them against your latest statement, and check when your points expire.',
];

export function PointsBankScreen() {
  const theme = useTheme();
  const router = useRouter();
  const bank = usePointsBank();
  const save = useSaveBalance();

  const [editingId, setEditingId] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  const startEditing = (card) => {
    save.reset();
    setEditingId(card.userCardId);
  };

  const submit = (card, balance) =>
    save.mutate({ userCardId: card.userCardId, balance }, { onSuccess: () => setEditingId(null) });

  if (bank.isPending || (bank.error && !bank.data)) {
    return (
      <AppScreen>
        <BackButton />
        {bank.error ? (
          <>
            <FormBanner message={bank.error.message} />
            <SecondaryButton label="Try again" onPress={bank.refetch} />
          </>
        ) : (
          <View style={[styles.centered, { paddingVertical: theme.spacing.xxxl }]}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
      </AppScreen>
    );
  }

  const { cards, totals } = bank.data;

  if (cards.length === 0) {
    return (
      <AppScreen>
        <BackButton />
        <ScreenHeader
          eyebrow="Points bank"
          title="What your points are worth"
          description="Add your cards first. Then enter what each one holds and Card Buddy shows what it comes to."
        />
        <PrimaryButton label="Find your first card" trailingIcon={ArrowRightIcon} onPress={() => router.replace('/add-card')} />
      </AppScreen>
    );
  }

  // Cards the catalog has nothing on go last: they cannot be valued, so they are not where to start.
  const ordered = [...cards.filter((card) => card.status !== 'no_routes'), ...cards.filter((card) => card.status === 'no_routes')];

  return (
    <AppScreen>
      <BackButton />
      <ScreenHeader
        eyebrow="Points bank"
        title="What your points are worth"
        description="Enter what each card holds. Card Buddy shows what it comes to as cash, and the most it could be worth through the best route the catalog lists."
      />

      {bank.error ? <FormBanner message={bank.error.message} /> : null}

      <PointsSummaryCard totals={totals} />

      <View style={{ gap: theme.spacing.md }}>
        <SectionLabel label="Your cards" count={cards.length} />
        {ordered.map((card, index) => (
          <PointsCardRow
            key={card.userCardId}
            card={card}
            index={index}
            editing={editingId === card.userCardId}
            saving={save.isPending}
            error={editingId === card.userCardId ? save.error : null}
            onEdit={() => startEditing(card)}
            onCancel={() => setEditingId(null)}
            onSave={(balance) => submit(card, balance)}
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
