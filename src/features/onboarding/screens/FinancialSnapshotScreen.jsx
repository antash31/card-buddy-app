// #genai: Step two captures three constraint-safe financial bands.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useOnboardingStatus, useSaveFinancialSnapshot } from '../hooks/useOnboarding';
import { EMPLOYMENT_CLASSES, INCOME_BANDS, MONTHLY_SPEND_BANDS } from '../lib/onboarding';

export function FinancialSnapshotScreen() {
  const theme = useTheme();
  const router = useRouter();
  const status = useOnboardingStatus();
  const saveSnapshot = useSaveFinancialSnapshot();

  const [employmentClass, setEmploymentClass] = useState(null);
  const [incomeBand, setIncomeBand] = useState(null);
  const [monthlySpendBand, setMonthlySpendBand] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const saved = status.data?.spendProfile;
    if (!employmentClass && saved?.employmentClass) setEmploymentClass(saved.employmentClass);
    if (!incomeBand && saved?.incomeBand) setIncomeBand(saved.incomeBand);
    if (!monthlySpendBand && saved?.monthlySpendBand) {
      setMonthlySpendBand(saved.monthlySpendBand);
    }
  }, [employmentClass, incomeBand, monthlySpendBand, status.data?.spendProfile]);

  const submit = () => {
    if (!employmentClass || !incomeBand || !monthlySpendBand) {
      setShowErrors(true);
      haptics.error();
      return;
    }

    saveSnapshot.mutate(
      { employmentClass, incomeBand, monthlySpendBand },
      { onSuccess: () => router.replace('/onboarding/cards') },
    );
  };

  return (
    <AuthLayout>
      <OnboardingProgress step={2} />

      <ScreenHeader
        eyebrow="Financial snapshot"
        title="Your spending range"
        description="Ranges are enough. Card Buddy never needs an exact salary or monthly total."
      />

      <Reveal delay={stagger(4)}>
        <View style={{ gap: theme.spacing.xxl }}>
          <FormBanner message={saveSnapshot.error?.message} />

          <SingleSelect
            label="Employment"
            options={EMPLOYMENT_CLASSES}
            value={employmentClass}
            onChange={(value) => {
              setEmploymentClass(value);
              setShowErrors(false);
            }}
            disabled={saveSnapshot.isPending}
            error={showErrors && !employmentClass ? 'Choose your employment class.' : null}
          />

          <SingleSelect
            label="Annual income"
            options={INCOME_BANDS}
            value={incomeBand}
            onChange={(value) => {
              setIncomeBand(value);
              setShowErrors(false);
            }}
            disabled={saveSnapshot.isPending}
            error={showErrors && !incomeBand ? 'Choose an income band.' : null}
          />

          <SingleSelect
            label="Monthly card spend"
            options={MONTHLY_SPEND_BANDS}
            value={monthlySpendBand}
            onChange={(value) => {
              setMonthlySpendBand(value);
              setShowErrors(false);
            }}
            disabled={saveSnapshot.isPending}
            error={showErrors && !monthlySpendBand ? 'Choose a monthly spend band.' : null}
          />

          <PrimaryButton
            label="Save & continue"
            onPress={submit}
            loading={saveSnapshot.isPending}
          />
        </View>
      </Reveal>
    </AuthLayout>
  );
}
