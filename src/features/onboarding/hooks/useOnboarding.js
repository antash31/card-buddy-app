// #genai: Persisted onboarding queries and step mutations.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';

import * as profileApi from '../api/profileApi';
import { useOnboardingFlowStore } from '../store/onboardingFlowStore';

export const onboardingKeys = {
  status: ['onboarding', 'status'],
};

export const onboardingStepPaths = {
  identity: '/onboarding/profile',
  financial: '/onboarding/financial',
  cards: '/onboarding/cards',
  goal: '/onboarding/goal',
  complete: '/',
};

export function useOnboardingStatus({ enabled = true } = {}) {
  return useQuery({
    queryKey: onboardingKeys.status,
    queryFn: profileApi.fetchOnboardingStatus,
    select: (data) => data.onboarding,
    enabled,
  });
}

export function useSaveIdentity() {
  const setProfile = useAuthStore((state) => state.setProfile);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.saveIdentity,
    onSuccess: async ({ profile }) => {
      setProfile(profile);
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}

export function useSaveFinancialSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.saveFinancialSnapshot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}

export function useCompleteOnboarding() {
  const setProfile = useAuthStore((state) => state.setProfile);
  const resetFlow = useOnboardingFlowStore((state) => state.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.saveOptimizationGoal,
    onSuccess: async ({ profile }) => {
      resetFlow();
      setProfile(profile);
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.status });
      haptics.success();
    },
    onError: () => haptics.error(),
  });
}
