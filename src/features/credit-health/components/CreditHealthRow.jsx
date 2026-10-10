// #genai: The Card Nest's row for CIBIL Protector, with a one-line live summary.
import { useRouter } from 'expo-router';

import { ToolRow } from '@/components/actions/ToolRow';
import { ShieldIcon } from '@/components/icons';

import { useCreditHealth } from '../hooks/useCreditHealth';
import { entrySummary } from '../lib/creditCopy';

export function CreditHealthRow() {
  const router = useRouter();
  const { data } = useCreditHealth();

  return (
    <ToolRow
      icon={ShieldIcon}
      title="CIBIL Protector"
      subtitle={entrySummary(data)}
      onPress={() => router.push('/credit-health')}
    />
  );
}
