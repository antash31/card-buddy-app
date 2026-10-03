// #genai: The Card Nest's doorway to CIBIL Protector, with a one-line live summary.
import { useRouter } from 'expo-router';

import { ToolRow } from '@/components/actions/ToolRow';
import { ShieldIcon } from '@/components/icons';
import { Surface } from '@/components/surfaces/Surface';

import { useCreditHealth } from '../hooks/useCreditHealth';
import { entrySummary } from '../lib/creditCopy';

export function CreditHealthEntry() {
  const router = useRouter();
  const { data } = useCreditHealth();

  return (
    <Surface padded={false}>
      <ToolRow
        icon={ShieldIcon}
        title="CIBIL Protector"
        subtitle={entrySummary(data)}
        onPress={() => router.push('/credit-health')}
      />
    </Surface>
  );
}
