// #genai: The Card Nest's row for the Points Bank, with a one-line live summary.
import { useRouter } from 'expo-router';

import { ToolRow } from '@/components/actions/ToolRow';
import { CoinsIcon } from '@/components/icons';

import { usePointsBank } from '../hooks/usePointsBank';
import { entrySummary } from '../lib/pointsCopy';

export function PointsBankRow() {
  const router = useRouter();
  const { data } = usePointsBank();

  return (
    <ToolRow
      icon={CoinsIcon}
      title="Points bank"
      subtitle={entrySummary(data)}
      onPress={() => router.push('/points-bank')}
    />
  );
}
