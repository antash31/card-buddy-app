// #genai: Single source of truth for "which part of the app is this person allowed to see".
//
// Keeping the redirect rules in one hook — rather than guarding each screen — means there is
// exactly one place to reason about, and no screen can be reached by forgetting to add a guard.
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import {
  onboardingStepPaths,
  useOnboardingFlowStore,
  useOnboardingStatus,
} from '@/features/onboarding';
import { selectNeedsOnboarding, useAuthStore } from '@/store/authStore';

export function useAuthGate() {
  const status = useAuthStore((state) => state.status);
  const needsOnboarding = useAuthStore(selectNeedsOnboarding);
  const hydrate = useAuthStore((state) => state.hydrate);
  const setProfile = useAuthStore((state) => state.setProfile);
  const cardsStepPassed = useOnboardingFlowStore((state) => state.cardsStepPassed);
  const resetOnboardingFlow = useOnboardingFlowStore((state) => state.reset);

  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const onboarding = useOnboardingStatus({ enabled: needsOnboarding });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (onboarding.data?.profile) setProfile(onboarding.data.profile);
  }, [onboarding.data?.profile, setProfile]);

  useEffect(() => {
    if (status === 'unauthenticated') resetOnboardingFlow();
  }, [resetOnboardingFlow, status]);

  useEffect(() => {
    // Nothing is known yet — redirecting now would guess wrong half the time.
    if (status === 'loading') return;

    const group = segments[0];
    const inAuthFlow = group === '(auth)';
    const inOnboarding = group === 'onboarding';

    if (status === 'unauthenticated') {
      if (!inAuthFlow) router.replace('/welcome');
      return;
    }

    if (needsOnboarding) {
      // Keep the navigator mounted while resume data loads. Returning a global "loading" state
      // here would unmount the Stack, so the redirect effect would fire into no navigator.
      if (onboarding.isPending) {
        if (!inOnboarding) router.replace(onboardingStepPaths.identity);
        return;
      }

      const nextStep =
        onboarding.data?.nextStep === 'cards' && cardsStepPassed
          ? 'goal'
          : onboarding.data?.nextStep;
      const nextPath = onboardingStepPaths[nextStep] ?? onboardingStepPaths.identity;
      if (pathname !== nextPath) router.replace(nextPath);
      return;
    }

    // Signed in and set up: the auth and onboarding screens are no longer reachable.
    if (inAuthFlow || inOnboarding) {
      router.replace('/');
    }
  }, [
    status,
    needsOnboarding,
    cardsStepPassed,
    onboarding.data?.nextStep,
    onboarding.isPending,
    pathname,
    segments,
    router,
  ]);

  return status;
}
