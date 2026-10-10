import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { Chip } from '@/components/actions/Chip';
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
import { useMyCards } from '@/features/card-nest/hooks/useNest';

import { trackingApi, useTrackingMutation, useTrackingQuery } from './api';
import { reviewLabels, transactionAmount, transactionDate, transactionLabel } from './presentation';

function Choices({ label, options, value, onChange }) {
  return <View style={{ gap: 8 }}><Text variant="caption">{label}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{options.map((o) => <Chip key={o.value} label={o.label} selected={value === o.value} showCheck onPress={() => onChange(o.value)} />)}</View></View>;
}
function ReviewItem({ event, cards, catalog, events }) {
  const [open, setOpen] = useState(false);
  const [card, setCard] = useState(event.userCardId);
  const [merchant, setMerchant] = useState(event.merchantRaw ?? '');
  const [merchantCode, setMerchantCode] = useState(event.merchantCode ?? '');
  const [category, setCategory] = useState(event.categoryCode ?? '');
  const [date, setDate] = useState(event.occurredAt ?? '');
  const [type, setType] = useState(event.eventType);
  const [related, setRelated] = useState(event.relatedEventId);
  const [duplicate, setDuplicate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const save = useTrackingMutation((state) => trackingApi.patch(event.eventId, { userCardId: card, merchantRaw: merchant || null, merchantCode: merchantCode || null, categoryCode: category || null,
    ...(date ? { occurredAt: new Date(date).toISOString() } : {}), eventType: type, relatedEventId: related, duplicateReviewed: duplicate, processingState: state }));
  const remove = useTrackingMutation(() => trackingApi.remove(event.eventId));
  const originals = (events ?? []).filter((e) => e.userCardId === card && e.eventType === 'purchase' && e.eventId !== event.eventId);
  return <Surface contentStyle={{ gap: 12 }}>
    <Text variant="subtitle">{transactionLabel(event)} · {transactionAmount(event)}</Text>
    <Text variant="caption">{transactionDate(event.occurredAt)}</Text>
    {(event.reviewReasons ?? []).map((reason) => <Text key={reason}>{reviewLabels[reason] ?? reason.replaceAll('_', ' ')}</Text>)}
    <SecondaryButton label={open ? 'Close editor' : 'Review transaction'} onPress={() => setOpen(!open)} />
    {open ? <>
      <Choices label="Card used" value={card} onChange={setCard} options={cards.map((c) => ({ value: c.userCardId, label: `${c.bank} · ${c.cardName}` }))} />
      {!cards.length ? <Text>Add a card to your Card Nest before confirming this alert.</Text> : null}
      <TextField label="Merchant display name" value={merchant} onChangeText={setMerchant} maxLength={120} />
      <TextField label="Merchant code (optional)" value={merchantCode} onChangeText={setMerchantCode} autoCapitalize="none" />
      <Text variant="caption">Known matches: {(catalog?.merchants ?? []).filter((m) => merchantCode.length > 1 && m.merchant_code.includes(merchantCode)).slice(0, 8).map((m) => m.merchant_code).join(', ') || 'Enter part of a merchant code, such as zomato or amazon.'}</Text>
      <TextField label="Category code (optional)" value={category} onChangeText={setCategory} autoCapitalize="none" />
      <Choices label="Suggested categories" value={category} onChange={setCategory} options={(catalog?.categories ?? []).filter((c) => !category || c.category_code.includes(category)).slice(0, 8).map((c) => ({ value: c.category_code, label: c.category_label }))} />
      <TextField label="Date and time (ISO, with timezone)" value={date} onChangeText={setDate} autoCapitalize="none" helperText="Example: 2026-09-16T12:30:00+05:30. Use the date shown by your bank." />
      <Choices label="Transaction type" value={type} onChange={setType} options={['purchase', 'refund', 'reversal', 'transfer', 'cashback', 'bill_payment', 'cash_withdrawal'].map((t) => ({ value: t, label: t.replaceAll('_', ' ') }))} />
      {['refund', 'reversal'].includes(type) ? <><Choices label="Original purchase" value={related} onChange={setRelated} options={originals.map((e) => ({ value: e.eventId, label: `${transactionLabel(e)} · ${transactionAmount(e)}` }))} />{!originals.length ? <Text>No recent purchase matches this card. Import the original alert before linking the refund.</Text> : null}</> : null}
      {event.reviewReasons?.includes('possible_duplicate') ? <SecondaryButton label={duplicate ? '✓ Checked — this is a separate transaction' : 'I checked — this is a separate transaction'} onPress={() => setDuplicate(!duplicate)} /> : null}
      <Text variant="caption">Only confirmed posted purchases with known reward eligibility affect caps. Unknown fields can remain blank.</Text>
      <PrimaryButton label="Confirm transaction" loading={save.isPending} disabled={!card || !date || !Number.isFinite(Date.parse(date)) || type === 'unknown'} onPress={() => save.mutate('confirmed')} />
      <SecondaryButton label="Ignore transaction" disabled={save.isPending} onPress={() => save.mutate('ignored')} />
      <SecondaryButton label={deleteConfirm ? 'Confirm delete this transaction' : 'Delete transaction'} tone="danger" loading={remove.isPending} onPress={() => deleteConfirm ? remove.mutate() : setDeleteConfirm(true)} />
      {save.error || remove.error ? <FormBanner message={(save.error ?? remove.error).message} /> : null}
    </> : null}
  </Surface>;
}
export default function ReviewScreen() {
  const router = useRouter();
  const query = useTrackingQuery(['review'], trackingApi.review);
  const nest = useMyCards();
  const catalog = useTrackingQuery(['catalog'], trackingApi.catalog);
  const events = useTrackingQuery(['events'], trackingApi.events);
  return <AppScreen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} />}>
    <IconButton accessibilityLabel="Back to tracking" icon={ArrowLeftIcon} onPress={() => router.push('/tracking')} style={{ alignSelf: 'flex-start' }} />
    <ScreenHeader eyebrow="Check before counting" title="Review inbox" description="These alerts need your help. They do not change reward-cap usage until confirmed." />
    {query.isPending ? <Text>Loading review inbox…</Text> : null}
    {query.error ? <><FormBanner message={query.error.message} /><SecondaryButton label="Retry review inbox" onPress={query.refetch} /></> : null}
    {query.isSuccess && !query.data?.events.length ? <Text>All caught up. Uncertain or unmatched alerts will appear here.</Text> : null}
    {query.data?.events.map((event) => <ReviewItem key={event.eventId} event={event} cards={nest.data?.cards ?? []} catalog={catalog.data} events={events.data?.events} />)}
    {query.data?.nextBefore ? <Text>Showing the newest 100 alerts. Resolve these to see earlier alerts.</Text> : null}
  </AppScreen>;
}
