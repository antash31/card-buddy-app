// #genai: Step one persists the identity fields used across the recommendation experience.
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { validateFullName } from '@/features/auth/lib/validation';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { stagger } from '@/theme/motion';

import { OnboardingProgress } from '../components/OnboardingProgress';
import { useSaveIdentity } from '../hooks/useOnboarding';
import {
  formatDateOfBirth,
  formatDateInput,
  parseDateOfBirth,
  validateCity,
  validateMobileNumber,
} from '../lib/onboarding';

export function ProfileSetupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signedOut);

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [mobileNumber, setMobileNumber] = useState(profile?.mobileNumber ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(formatDateOfBirth(profile?.dateOfBirth));
  const [city, setCity] = useState(profile?.city ?? '');
  const [errors, setErrors] = useState({});

  const mobileRef = useRef(null);
  const dateRef = useRef(null);
  const cityRef = useRef(null);
  const saveIdentity = useSaveIdentity();
  const needsName = !profile?.fullName;

  useEffect(() => {
    if (!fullName && profile?.fullName) setFullName(profile.fullName);
    if (!mobileNumber && profile?.mobileNumber) setMobileNumber(profile.mobileNumber);
    if (!dateOfBirth && profile?.dateOfBirth) {
      setDateOfBirth(formatDateOfBirth(profile.dateOfBirth));
    }
    if (!city && profile?.city) setCity(profile.city);
  }, [city, dateOfBirth, fullName, mobileNumber, profile]);

  const clearError = (field) => {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: null }));
  };

  const submit = () => {
    const parsedBirthDate = parseDateOfBirth(dateOfBirth);
    const nextErrors = {
      fullName: validateFullName(fullName),
      mobileNumber: validateMobileNumber(mobileNumber),
      dateOfBirth: parsedBirthDate.error,
      city: validateCity(city),
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      haptics.error();
      return;
    }

    saveIdentity.mutate(
      {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        dateOfBirth: parsedBirthDate.isoDate,
        city: city.trim(),
      },
      { onSuccess: () => router.replace('/onboarding/financial') },
    );
  };

  return (
    <AuthLayout>
      <OnboardingProgress step={1} />

      <ScreenHeader
        eyebrow="Identity"
        title="The essentials"
        description="A few facts to keep recommendations relevant to you and the Indian card market."
      />

      <Reveal delay={stagger(4)}>
        <View style={{ gap: theme.spacing.xl }}>
          <FormBanner message={saveIdentity.error?.message} />

          <View style={{ gap: theme.spacing.lg }}>
            {needsName ? (
              <TextField
                label="Full name"
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  clearError('fullName');
                }}
                error={errors.fullName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => mobileRef.current?.focus()}
                editable={!saveIdentity.isPending}
              />
            ) : null}

            <TextField
              ref={mobileRef}
              label="Mobile number"
              value={mobileNumber}
              onChangeText={(value) => {
                setMobileNumber(value.replace(/\D/g, '').slice(0, 10));
                clearError('mobileNumber');
              }}
              error={errors.mobileNumber}
              helperText="10 digits, without +91"
              keyboardType="number-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="next"
              onSubmitEditing={() => dateRef.current?.focus()}
              editable={!saveIdentity.isPending}
            />

            <TextField
              ref={dateRef}
              label="Date of birth"
              value={dateOfBirth}
              onChangeText={(value) => {
                setDateOfBirth(formatDateInput(value));
                clearError('dateOfBirth');
              }}
              error={errors.dateOfBirth}
              helperText="DD/MM/YYYY"
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => cityRef.current?.focus()}
              editable={!saveIdentity.isPending}
            />

            <TextField
              ref={cityRef}
              label="City"
              value={city}
              onChangeText={(value) => {
                setCity(value);
                clearError('city');
              }}
              error={errors.city}
              autoCapitalize="words"
              autoComplete="address-level2"
              returnKeyType="go"
              onSubmitEditing={submit}
              editable={!saveIdentity.isPending}
            />
          </View>

          <PrimaryButton
            label="Save & continue"
            onPress={submit}
            loading={saveIdentity.isPending}
          />
        </View>
      </Reveal>

      <Reveal delay={stagger(5)}>
        <TextLink label="Sign out" tone="muted" onPress={signOut} />
      </Reveal>
    </AuthLayout>
  );
}
