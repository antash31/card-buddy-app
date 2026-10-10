import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Linking, Platform, RefreshControl, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { ArrowLeftIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text } from '@/components/primitives/Text';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';

import { trackingApi, useTrackingMutation, useTrackingQuery } from './api';
import { disableSms, enableSms, smsAvailable, smsStatus } from './native';
import { transactionDate } from './presentation';

export default function TrackingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const query = useTrackingQuery(['connections'], trackingApi.connections);
  const [sms, setSms] = useState({ enabled: false });
  const [historyDays, setHistoryDays] = useState(0);
  const [body, setBody] = useState('');
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [purgeConfirmed, setPurgeConfirmed] = useState(false);
  const [disconnectId, setDisconnectId] = useState(null);
  const refresh = async () => { await query.refetch(); setSms(await smsStatus()); };
  useEffect(() => { smsStatus().then(setSms).catch(() => {}); }, []);
  const action = async (fn) => {
    setBusy(true); setMessage(null);
    try { const result = await fn(); await refresh(); return result; }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  const paste = useTrackingMutation(() => trackingApi.manual(body));
  const purge = useTrackingMutation(trackingApi.purge);
  const connect = (provider) => action(async () => {
    const result = await trackingApi.start(provider);
    if (Platform.OS === 'web') await Linking.openURL(result.authorizationUrl);
    else await WebBrowser.openAuthSessionAsync(result.authorizationUrl, 'cardbuddy://tracking');
  });
  const muted = theme.colors.textMuted;
  return <AppScreen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={refresh} />}>
    <IconButton accessibilityLabel="Back to profile" icon={ArrowLeftIcon} onPress={() => router.push('/profile')} style={{ alignSelf: 'flex-start' }} />
    <ScreenHeader eyebrow="Your transaction ledger" title="Transaction tracking" titleLines={2} description="Bring bank alerts into your Card Nest. You decide which sources to connect." />
    {message ? <FormBanner message={message} /> : null}
    {query.error ? <View style={{ gap: 8 }}><FormBanner message="Could not load connected accounts." /><SecondaryButton label="Retry accounts" onPress={refresh} /></View> : null}
    <SecondaryButton label="Open review inbox" onPress={() => router.push('/transaction-review')} />
    {Platform.OS === 'android' ? <Surface>
      <Text variant="heading">Track bank SMS</Text>
      <Text color={muted}>With your permission, Card Buddy reads bank SMS in the background, even when this screen is closed. It filters messages and extracts transactions on your phone. Only transaction details are sent to your account. OTPs, personal messages and complete SMS bodies are never uploaded.</Text>
      <Text variant="label">Permission: {sms.permissionGranted ? 'Granted' : 'Not granted'} · Tracking {sms.enabled ? 'on' : 'off'}</Text>
      {sms.lastSyncAt ? <Text variant="caption" color={muted}>Last sync {transactionDate(sms.lastSyncAt)} · {sms.queued} queued</Text> : null}
      {sms.error ? <FormBanner message={`SMS sync needs attention: ${sms.error.replaceAll('_', ' ')}. Reopen tracking after signing in or retry.`} /> : null}
      {!smsAvailable ? <Text color={muted}>SMS tracking needs a custom Android build. Email and paste are available here.</Text> : sms.enabled ? <SecondaryButton label="Disable SMS tracking" disabled={busy} onPress={() => action(disableSms)} /> : <>
        <SecondaryButton label={`${historyDays === 0 ? '✓ ' : ''}Future messages only`} onPress={() => setHistoryDays(0)} />
        <SecondaryButton label={`${historyDays === 30 ? '✓ ' : ''}Also scan the last 30 days`} onPress={() => setHistoryDays(30)} />
        <PrimaryButton label="I agree — enable bank SMS" loading={busy} onPress={() => action(() => enableSms(userId, historyDays))} />
      </>}
    </Surface> : null}
    <Surface>
      <Text variant="heading">Connect email</Text>
      <Text color={muted}>We read supported bank transaction alerts from the last 90 days, then sync new alerts. Sign in with your email provider; Card Buddy never asks for an email password.</Text>
      <SecondaryButton label="Connect Gmail" disabled={busy || !query.data?.providers?.find((p) => p.provider === 'gmail')?.enabled} onPress={() => connect('gmail')} />
      <SecondaryButton label="Connect Outlook" disabled={busy || !query.data?.providers?.find((p) => p.provider === 'microsoft_email')?.enabled} onPress={() => connect('microsoft_email')} />
      {query.data?.providers?.some((p) => !p.enabled) ? <Text variant="caption" color={muted}>Some email connections are not available yet. Use paste below in the meantime.</Text> : null}
      {query.data?.connections?.map((c) => <Surface key={c.connectionId} tone="inset" contentStyle={{ gap: 10 }}>
        <Text variant="subtitle">{c.maskedEmail}</Text><Text variant="caption" color={muted}>{c.provider === 'gmail' ? 'Gmail' : 'Outlook'} · {c.status.replaceAll('_', ' ')} · {c.lastSyncAt ? transactionDate(c.lastSyncAt) : 'Not synchronized yet'}</Text>
        {c.lastSyncError ? <Text color={theme.colors.danger}>{c.lastSyncError}</Text> : null}
        <SecondaryButton label="Sync now" disabled={busy} onPress={() => action(async () => { const r = await trackingApi.sync(c.connectionId); setMessage(r.more ? 'Page imported. Sync again to continue importing older alerts.' : 'Sync complete.'); })} />
        <SecondaryButton label={disconnectId === c.connectionId ? 'Confirm disconnect' : 'Disconnect'} disabled={busy} onPress={() => disconnectId === c.connectionId ? action(async () => {
          const r = await trackingApi.disconnect(c.connectionId); setDisconnectId(null);
          setMessage(r.providerRevoked ? 'Disconnected. Imported transactions remain in your ledger.' : 'Disconnected locally. Remove Card Buddy in your provider’s connected-app settings to revoke consent. Imported transactions remain.');
        }) : setDisconnectId(c.connectionId)} />
        {disconnectId === c.connectionId ? <SecondaryButton label="Keep connection" onPress={() => setDisconnectId(null)} /> : null}
        <SecondaryButton label="Manage provider consent" onPress={() => Linking.openURL(c.provider === 'gmail' ? 'https://myaccount.google.com/connections' : 'https://account.live.com/consent/Manage')} />
      </Surface>)}
    </Surface>
    <Surface>
      <Text variant="heading">Paste a bank alert</Text>
      <Text color={muted}>For other providers, copy the transaction alert and paste it here. Only extracted transaction details are saved. Check the review inbox after importing.</Text>
      <TextField label="Bank transaction alert" value={body} onChangeText={setBody} multiline maxLength={12000} />
      <PrimaryButton label="Import alert" loading={paste.isPending} disabled={!body.trim()} onPress={() => paste.mutate(undefined, { onSuccess: (r) => { setBody(''); setMessage(`${r.accepted} imported, ${r.duplicates} already imported, ${r.needsReview} need review.`); } })} />
      {paste.error ? <FormBanner message={paste.error.message} /> : null}
    </Surface>
    <Surface>
      <Text variant="heading">Your data</Text>
      <Text color={muted}>We store amounts, dates, source, merchant, category and your card link. Card digits and email credentials are encrypted. Disabling SMS clears its local queue. Disconnecting email stops future imports; it does not delete transactions already imported.</Text>
      <SecondaryButton label={purgeConfirmed ? 'Confirm delete all imported transactions' : 'Delete imported transactions'} tone="danger" loading={purge.isPending} onPress={() => purgeConfirmed ? purge.mutate(undefined, { onSuccess: () => { setPurgeConfirmed(false); setMessage('Imported transactions deleted. Disconnect sources to prevent reimporting old alerts.'); } }) : setPurgeConfirmed(true)} />
      {purgeConfirmed ? <><Text color={muted}>This removes your imported history and automatic cap contributions. Your manual cap baseline remains.</Text><SecondaryButton label="Keep transactions" onPress={() => setPurgeConfirmed(false)} /></> : null}
      {purge.error ? <FormBanner message={purge.error.message} /> : null}
    </Surface>
  </AppScreen>;
}
