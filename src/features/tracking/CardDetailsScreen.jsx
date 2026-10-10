import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { CardArt } from '@/components/brand/CardArt';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { ArrowLeftIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text } from '@/components/primitives/Text';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { trackingApi, useTrackingMutation, useTrackingQuery } from './api';
import { TransactionList } from './TransactionList';

export default function CardDetailsScreen() {
  const theme = useTheme();
  const { userCardId } = useLocalSearchParams();
  const router = useRouter();
  const query = useTrackingQuery(['card', userCardId], () => trackingApi.recent(userCardId), typeof userCardId === 'string');
  const connections = useTrackingQuery(['connections'], trackingApi.connections);
  const [suffix, setSuffix] = useState('');
  const [saved, setSaved] = useState(false);
  const save = useTrackingMutation(() => trackingApi.suffix(userCardId, suffix));
  return <AppScreen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} />}>
    <IconButton accessibilityLabel="Back to Card Nest" icon={ArrowLeftIcon} onPress={() => router.push('/')} style={{ alignSelf: 'flex-start' }} />
    <ScreenHeader eyebrow={query.data?.bank ?? 'Card Nest'} title={query.data?.cardName ?? 'Your card'} titleLines={3} />
    {query.data?.bank ? <View style={{ alignItems: 'flex-start' }}>
      <CardArt width={260} bank={query.data.bank} network={query.data.network} title={query.data.cardName} subtitle={query.data.cardLast4 ? `•••• ${query.data.cardLast4}` : query.data.bank} />
    </View> : null}
    <Surface>
      <Text variant="heading">Match this card</Text>
      <Text color={theme.colors.textMuted}>Only the last four digits are needed. They are encrypted and matched together with your bank.</Text>
      {query.data?.cardLast4 ? <Text variant="label">Saved card ending •••• {query.data.cardLast4}</Text> : null}
      <TextField label="Last four digits" value={suffix} onChangeText={(v) => { setSuffix(v.replace(/\D/g, '').slice(0, 4)); setSaved(false); }} keyboardType="number-pad" maxLength={4} autoComplete="off" />
      <PrimaryButton label="Save card digits" disabled={!/^\d{4}$/.test(suffix)} loading={save.isPending} onPress={() => save.mutate(undefined, { onSuccess: () => { setSaved(true); setSuffix(''); } })} />
      {saved ? <FormBanner tone="success" message="Card digits saved. You can assign earlier unmatched alerts in the review inbox." /> : null}
      {save.error ? <FormBanner message={save.error.message} /> : null}
    </Surface>
    <Surface>
      <Text variant="heading">Recent transactions</Text>
      <Text variant="caption" color={theme.colors.textMuted}>Your 10 most recent transactions on this card.</Text>
      <TransactionList loading={query.isPending} error={query.error} events={query.data?.events} onRetry={query.refetch} disconnected={!connections.data?.connections?.length} />
    </Surface>
    <SecondaryButton label="Review transactions" onPress={() => router.push('/transaction-review')} />
    <SecondaryButton label="Transaction tracking" onPress={() => router.push('/tracking')} />
  </AppScreen>;
}
