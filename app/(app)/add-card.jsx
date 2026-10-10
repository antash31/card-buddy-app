// #genai: Add a catalog card to the nest. The footer points someone who does not know which card to
// get at Card Finder (not shown in onboarding, which renders AddCardScreen from its own route).
import { CardFinderPrompt } from '@/features/card-finder/components/CardFinderPrompt';
import { AddCardScreen } from '@/features/card-nest/screens/AddCardScreen';

export default function AddCardRoute() {
  return <AddCardScreen footer={<CardFinderPrompt />} />;
}
