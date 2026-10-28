// #genai: One card's page in Card Lab: what it costs, then prizes, gifts, lounges and other free
// things, each in plain words. Sections with nothing in them are left out and named in one line.
//
// The page states the rules; it never says how far along someone is. Hard words are explained once,
// under the first thing that uses them (see `cardView`).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { FormBanner } from '@/components/forms/FormBanner';
import { ArrowLeftIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { CostCard } from '../components/CostCard';
import { LabSection } from '../components/LabSection';
import { useCardLab } from '../hooks/useCardLab';
import { SOURCE_NOTE, cardView } from '../lib/cardLabCopy';

function BackButton() {
  const router = useRouter();

  return (
    <IconButton
      accessibilityLabel="Back"
      icon={ArrowLeftIcon}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/card-lab'))}
      style={{ alignSelf: 'flex-start' }}
    />
  );
}

export function CardLabCardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userCardId } = useLocalSearchParams();
  const lab = useCardLab();

  if (lab.isPending || (lab.error && !lab.data)) {
    return (
      <AppScreen>
        <BackButton />
        {lab.error ? (
          <>
            <FormBanner message={lab.error.message} />
            <SecondaryButton label="Try again" onPress={lab.refetch} />
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xxxl }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
      </AppScreen>
    );
  }

  const card = lab.data.cards.find((each) => each.userCardId === userCardId);

  if (!card) {
    return (
      <AppScreen>
        <BackButton />
        <ScreenHeader eyebrow="Card Lab" title="We could not find this card" description="It may have been taken out of your Card Nest." />
        <SecondaryButton label="See all your cards" onPress={() => router.replace('/card-lab')} />
      </AppScreen>
    );
  }

  const view = cardView(card);

  return (
    <AppScreen>
      <BackButton />
      <ScreenHeader eyebrow={card.bank} title={card.cardName} titleLines={3} description="What this card costs, and what it gives you." />

      {lab.error ? <FormBanner message={lab.error.message} /> : null}

      <Reveal delay={stagger(1)}>
        <CostCard cost={view.cost} />
      </Reveal>

      {view.sections.map((section, index) => (
        <Reveal key={section.key} delay={stagger(Math.min(index + 2, 6))}>
          <LabSection section={section} />
        </Reveal>
      ))}

      <View style={{ gap: theme.spacing.sm }}>
        {view.missing ? <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{view.missing}</Text> : null}
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{SOURCE_NOTE}</Text>
      </View>
    </AppScreen>
  );
}
