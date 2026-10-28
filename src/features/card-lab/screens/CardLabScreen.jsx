// #genai: Card Lab — every card in the nest, each with its price and how many free things it gives.
//
// One list, one line per card. Tapping a card opens its page. Nothing here is computed: the API
// sends each card's rules and the copy file turns the counts into words.
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { FormBanner } from '@/components/forms/FormBanner';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { LAB_ROW_THUMB, LabCardRow } from '../components/LabCardRow';
import { useCardLab } from '../hooks/useCardLab';
import { SOURCE_NOTE } from '../lib/cardLabCopy';

function BackButton() {
  const router = useRouter();

  return (
    <IconButton
      accessibilityLabel="Back to Card Nest"
      icon={ArrowLeftIcon}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={{ alignSelf: 'flex-start' }}
    />
  );
}

const HEADER = {
  eyebrow: 'Card Lab',
  title: 'What your cards give you',
};

export function CardLabScreen() {
  const theme = useTheme();
  const router = useRouter();
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

  const { cards } = lab.data;

  if (cards.length === 0) {
    return (
      <AppScreen>
        <BackButton />
        <ScreenHeader {...HEADER} description="Add a card first. Then you can see what it costs and what it gives you." />
        <PrimaryButton label="Add a card" trailingIcon={ArrowRightIcon} onPress={() => router.replace('/add-card')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <BackButton />
      <ScreenHeader {...HEADER} description="See what each card costs, and what it gives you for free. Tap a card to see it all." />

      {lab.error ? <FormBanner message={lab.error.message} /> : null}

      <Reveal>
        <Surface padded={false}>
          {cards.map((card, index) => (
            <View key={card.userCardId}>
              {index > 0 ? <Rule inset={theme.spacing.lg + LAB_ROW_THUMB + theme.spacing.md} /> : null}
              <LabCardRow card={card} onPress={() => router.push({ pathname: '/card-lab-card', params: { userCardId: card.userCardId } })} />
            </View>
          ))}
        </Surface>
      </Reveal>

      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{SOURCE_NOTE}</Text>
    </AppScreen>
  );
}
