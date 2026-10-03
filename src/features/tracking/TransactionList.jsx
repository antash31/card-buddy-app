import { View } from 'react-native';

import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { Text } from '@/components/primitives/Text';
import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';

import { recentTen, sourceLabels, transactionAmount, transactionDate, transactionLabel } from './presentation';

export function TransactionList({ loading, error, events = [], onRetry, disconnected = false }) {
  const theme = useTheme();
  if (loading) return <View accessibilityLabel="Loading transactions" accessibilityState={{ busy: true }} style={{ gap: 16 }}>
    {[0, 1, 2].map((id) => <View key={id} style={{ height: 60, borderRadius: 16, backgroundColor: theme.colors.border, opacity: 0.6 }} />)}
  </View>;
  if (error) return <View style={{ gap: 12 }}><Text>Could not load transactions.</Text><SecondaryButton label="Retry transactions" onPress={onRetry} /></View>;
  if (!events.length) return <View style={{ gap: 8 }}><Text variant="heading">No transactions yet</Text><Text color={theme.colors.textMuted}>{disconnected ? 'Connect email, enable bank SMS on Android, or paste a bank alert to get started.' : 'Matched transactions will appear here. Unmatched alerts wait in your review inbox.'}</Text></View>;
  return <View>{recentTen(events).map((event, index, rows) => <View key={event.eventId} style={{ gap: 6, paddingTop: index === 0 ? 4 : 14, paddingBottom: 14 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text variant="subtitle" style={{ flex: 1 }}>{transactionLabel(event)}</Text>
      <Text variant="subtitle" color={event.direction === 'credit' ? theme.colors.success : theme.colors.text}>{transactionAmount(event)}</Text>
    </View>
    <Text variant="caption" color={theme.colors.textMuted}>{transactionDate(event.occurredAt)}</Text>
    <Text variant="micro" color={theme.colors.textMuted}>{[event.categoryCode?.replaceAll('_', ' '), sourceLabels[event.source], event.processingState === 'needs_review' ? 'Needs review' : event.processingState === 'ignored' ? 'Ignored' : null, event.transactionStatus !== 'posted' ? event.transactionStatus : null].filter(Boolean).join(' · ')}</Text>
    {index < rows.length - 1 ? <Rule /> : null}
  </View>)}</View>;
}
