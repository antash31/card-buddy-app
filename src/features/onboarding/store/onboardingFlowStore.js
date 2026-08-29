// #genai: Ephemeral step-three navigation; completion itself always comes from the profile row.
import { create } from 'zustand';

export const useOnboardingFlowStore = create((set) => ({
  cardsStepPassed: false,
  passCardsStep: () => set({ cardsStepPassed: true }),
  reset: () => set({ cardsStepPassed: false }),
}));
