// #genai: The Card Nest's row for Card Lab, with a one-line summary.
import { useRouter } from 'expo-router';

import { ToolRow } from '@/components/actions/ToolRow';
import { FlaskIcon } from '@/components/icons';

import { useCardLab } from '../hooks/useCardLab';
import { entrySummary } from '../lib/cardLabCopy';

export function CardLabRow() {
  const router = useRouter();
  const { data } = useCardLab();

  return <ToolRow icon={FlaskIcon} title="Card Lab" subtitle={entrySummary(data)} onPress={() => router.push('/card-lab')} />;
}
