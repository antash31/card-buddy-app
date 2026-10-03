// #genai: The user's active wallet — a stack of their cards, and a list to manage them.
//
// The screen is the reference's "Cards" screen: a header with a glass "+" lens, the cards stacked
// up top (the selected one in front), and a labelled list of soft cards below. Adding a card is a
// header action (and its own tab) once the nest has anything in it; the empty state is the
// exception, because a nest with nothing in it has exactly one useful next action.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { CardArt } from '@/components/brand/CardArt';
import { FormBanner } from '@/components/forms/FormBanner';
import { PlusIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Reveal } from '@/components/motion/Reveal';
import { Surface } from '@/components/surfaces/Surface';
import { CreditHealthEntry } from '@/features/credit-health/components/CreditHealthEntry';
import { WalletToolsCard } from '@/features/wallet/components/WalletToolsCard';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { stagger } from '@/theme/motion';

import { NestCardRow } from '../components/NestCardRow';
import { WalletStack } from '../components/WalletStack';
import { useMyCards, useRemoveCard } from '../hooks/useNest';

export function CardNestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);

  const nest = useMyCards();
  const remove = useRemoveCard();
  const [confirmingId, setConfirmingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [banner, setBanner] = useState(null);

  const cards = nest.data?.cards ?? [];
  const empty = nest.isSuccess && cards.length === 0;
  const firstName = profile?.fullName?.split(' ')[0];

  // The selection survives a removal gracefully: if the chosen card is gone, fall back to the first.
  const activeId = cards.some((card) => card.userCardId === selectedId)
    ? selectedId
    : cards[0]?.userCardId;

  const openDetails = (card) =>
    router.push({ pathname: '/card-details', params: { userCardId: card.userCardId } });

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
        eyebrow="Wallet"
        title="Card Nest"
        description={
          firstName
            ? `${firstName}, this is the set Card Buddy scores against. Keep it honest and the advice stays accurate.`
            : 'The cards you actually hold. Card Buddy scores every recommendation against this list.'
        }
        trailing={
          <IconButton
            accessibilityLabel="Add a card"
            icon={PlusIcon}
            onPress={() => router.push('/add-card')}
          />
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
          <Surface tone="raised" contentStyle={{ gap: theme.spacing.xl, alignItems: 'stretch' }}>
            <View style={styles.sample}>
              <View style={styles.sampleCard}>
                <CardArt
                  width={188}
                  tone="blue"
                  monogram="+"
                  network="YOUR CARD"
                  title="Nothing in the nest yet"
                />
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Text style={[theme.textStyles.heading, { color: theme.colors.text }]}>
                Add the cards in your wallet
              </Text>
              <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
                Card Buddy only ever recommends from this list, so a card you leave out is a card it
                will never suggest — and one you add by mistake will skew every comparison.
              </Text>
            </View>

            <PrimaryButton
              label="Find your first card"
              icon={PlusIcon}
              onPress={() => router.push('/add-card')}
            />
          </Surface>
        </Reveal>
      ) : null}

      {cards.length ? (
        <>
          <Reveal delay={stagger(3)}>
            <WalletStack
              cards={cards}
              selectedId={activeId}
              onSelect={(card) => setSelectedId(card.userCardId)}
              onOpen={openDetails}
            />
          </Reveal>

          <Reveal delay={stagger(4)} style={{ gap: theme.spacing.md }}>
            <SectionLabel label="Wallet tools" />
            <WalletToolsCard />
          </Reveal>

          <Reveal delay={stagger(4)} style={{ gap: theme.spacing.md }}>
            <SectionLabel label="Credit health" />
            <CreditHealthEntry />
          </Reveal>

          <View style={{ gap: theme.spacing.md }}>
            <SectionLabel label="Your cards" count={cards.length} />

            <View style={{ gap: theme.spacing.md }}>
              {cards.map((card, index) => (
                <NestCardRow
                  key={card.userCardId}
                  card={card}
                  index={index}
                  selected={card.userCardId === activeId}
                  confirming={confirmingId === card.userCardId}
                  removing={remove.isPending && remove.variables === card.userCardId}
                  onSelect={() => setSelectedId(card.userCardId)}
                  onDetails={() => openDetails(card)}
                  onAskRemove={() => {
                    setBanner(null);
                    setConfirmingId(card.userCardId);
                  }}
                  onCancel={() => setConfirmingId(null)}
                  onConfirm={() => confirmRemove(card)}
                />
              ))}
            </View>
          </View>
        </>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sample: {
    alignItems: 'center',
    paddingTop: 8,
  },
  sampleCard: {
    transform: [{ rotate: '-4deg' }],
    opacity: 0.95,
  },
});
