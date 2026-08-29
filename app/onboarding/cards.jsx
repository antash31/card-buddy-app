// #genai: Onboarding composes the real Card Nest Add-a-Card screen without forking its flow.
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { AddCardScreen } from '@/features/card-nest/screens/AddCardScreen';
import { OnboardingProgress } from '@/features/onboarding/components/OnboardingProgress';
import { useOnboardingFlowStore } from '@/features/onboarding/store/onboardingFlowStore';
import { useTheme } from '@/providers/ThemeProvider';

export default function OnboardingCards() {
  const theme = useTheme();
  const router = useRouter();
  const passCardsStep = useOnboardingFlowStore((state) => state.passCardsStep);
  const continueToGoal = () => {
    passCardsStep();
    router.replace('/onboarding/goal');
  };

  return (
    <AddCardScreen
      mode="onboarding"
      beforeHeader={<OnboardingProgress step={3} />}
      header={{
        eyebrow: 'Card Nest',
        title: 'Add your cards',
        description: 'So SwipeMax can start comparing the cards you actually carry.',
      }}
      footer={({ hasCards }) => (
        <View style={{ gap: theme.spacing.md }}>
          {hasCards ? (
            <PrimaryButton label="Continue" onPress={continueToGoal} />
          ) : (
            <TextLink label="Skip for now" tone="muted" onPress={continueToGoal} />
          )}
        </View>
      )}
    />
  );
}
