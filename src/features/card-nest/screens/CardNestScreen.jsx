// #genai: The user's active wallet — list and soft-remove the cards they hold.
//
// There is no "Add a card" button on this screen once the nest has anything in it: adding lives in
// its own tab, one tap away, and a second route to the same place would just compete with the tab
// bar. The empty state is the exception, because a nest with nothing in it has exactly one useful
// next action.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { FormBanner } from '@/components/forms/FormBanner';
import { PlusIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { stagger } from '@/theme/motion';

import { NestCardRow } from '../components/NestCardRow';
import { useMyCards, useRemoveCard } from '../hooks/useNest';

export function CardNestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);

  const nest = useMyCards();
  const remove = useRemoveCard();
  const [confirmingId, setConfirmingId] = useState(null);
  const [banner, setBanner] = useState(null);

  const cards = nest.data?.cards ?? [];
  const empty = nest.isSuccess && cards.length === 0;
  const firstName = profile?.fullName?.split(' ')[0];

  const confirmRemove = (card) => {
    setBanner(null);
    remove.mutate(card.userCardId, {
      onSuccess: () => {
        setConfirmingId(null);
        setBanner({ tone: 'success', message: `${card.cardName} is no longer in your nest.` });
      },
      onError: (error) => setBanner({ tone: 'error', message: error.message }),
    });
  };

  return (
    <AppScreen
      refreshControl={
        <RefreshControl
          refreshing={nest.isRefetching}
          onRefresh={nest.refetch}
          tintColor={theme.colors.textMuted}
          colors={[theme.colors.primary]}
        />
      }
    >
      <ScreenHeader
        // The count rides in the eyebrow rather than getting its own metric block — it is a fact
        // about the list, not a headline.
        eyebrow={
          cards.length
            ? `Wallet · ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}`
            : 'Wallet'
        }
        title="Card Nest"
        description={
          firstName
            ? `${firstName}, this is the set Card Buddy scores against. Keep it honest and the advice stays accurate.`
            : 'The cards you actually hold. Card Buddy scores every recommendation against this list.'
        }
      />

      {banner ? <FormBanner message={banner.message} tone={banner.tone} /> : null}
      {nest.error ? <FormBanner message={nest.error.message} /> : null}

      {nest.isPending ? (
        <View style={[styles.centered, { paddingVertical: theme.spacing.xxxl }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {empty ? (
        <Reveal delay={stagger(4)}>
          <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.sm }}>
            <View style={{ gap: theme.spacing.md }}>
              <Text style={[theme.textStyles.heading, { color: theme.colors.text }]}>
                Nothing in the nest yet
              </Text>
              <Text
                style={[theme.textStyles.body, styles.prose, { color: theme.colors.textMuted }]}
              >
                Add the cards already in your wallet. Card Buddy only ever recommends from this
                list, so a card you leave out is a card it will never suggest — and one you add by
                mistake will skew every comparison.
              </Text>
            </View>

            <PrimaryButton
              label="Find your first card"
              icon={PlusIcon}
              onPress={() => router.push('/add-card')}
            />
          </View>
        </Reveal>
      ) : null}

      {cards.length ? (
        <View>
          {cards.map((card, index) => (
            <NestCardRow
              key={card.userCardId}
              card={card}
              index={index}
              isLast={index === cards.length - 1}
              confirming={confirmingId === card.userCardId}
              removing={remove.isPending && remove.variables === card.userCardId}
              onAskRemove={() => {
                setBanner(null);
                setConfirmingId(card.userCardId);
              }}
              onCancel={() => setConfirmingId(null)}
              onConfirm={() => confirmRemove(card)}
            />
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  prose: {
    maxWidth: 460,
  },
});
