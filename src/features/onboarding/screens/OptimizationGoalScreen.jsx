// #genai: Final step sets the optimization objective and completes onboarding.
import { useState } from 'react';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { FormBanner } from '@/components/forms/FormBanner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { OnboardingProgress } from '../components/OnboardingProgress';
import { SingleSelect } from '../components/SingleSelect';
import { useCompleteOnboarding, useOnboardingStatus } from '../hooks/useOnboarding';
import { OPTIMIZATION_GOALS } from '../lib/onboarding';

export function OptimizationGoalScreen() {
  const theme = useTheme();
  const status = useOnboardingStatus();
  const completeOnboarding = useCompleteOnboarding();
  const [optimizationGoal, setOptimizationGoal] = useState(
    status.data?.spendProfile?.optimizationGoal ?? null,
  );
  const [showError, setShowError] = useState(false);

  const submit = () => {
    if (!optimizationGoal) {
      setShowError(true);
      haptics.error();
      return;
    }

    completeOnboarding.mutate(optimizationGoal);
  };

  return (
    <AuthLayout>
      <OnboardingProgress step={4} />

      <ScreenHeader
        eyebrow="Optimization goal"
        title="What should win?"
        description="Choose the outcome Card Buddy should favour when two cards are otherwise close."
      />

      <Reveal delay={stagger(4)}>
        <View style={{ gap: theme.spacing.xxl }}>
          <FormBanner message={completeOnboarding.error?.message} />

          <SingleSelect
            options={OPTIMIZATION_GOALS}
            value={optimizationGoal}
            onChange={(value) => {
              setOptimizationGoal(value);
              setShowError(false);
            }}
            disabled={completeOnboarding.isPending}
            error={showError ? 'Choose an optimization goal.' : null}
          />

          <PrimaryButton
            label="Finish setup"
            onPress={submit}
            loading={completeOnboarding.isPending}
          />
        </View>
      </Reveal>
    </AuthLayout>
  );
}
