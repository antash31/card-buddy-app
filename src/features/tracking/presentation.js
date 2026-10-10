export const sourceLabels = { android_sms: 'Bank SMS', gmail: 'Gmail', microsoft_email: 'Outlook', manual: 'Pasted alert' };
export const reviewLabels = {
  unmatched_card: 'Choose the card used for this transaction.', missing_date: 'Add the transaction date.',
  ambiguous_event_type: 'Choose the transaction type.', uncertain_merchant_or_category: 'Check the merchant and category.',
  link_original_purchase: 'Link the purchase this refund or reversal belongs to.', possible_duplicate: 'A similar transaction already exists. Check before confirming.',
};
export function transactionLabel(event) { return event.merchantRaw || event.merchantCode || event.eventType?.replaceAll('_', ' ') || 'Card transaction'; }
export function transactionAmount(event) {
  const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: event.currency }).format(event.amountMinor / 100);
  return `${event.direction === 'credit' ? '+' : '−'}${amount}`;
}
export function recentTen(events) { return [...events].sort((a, b) => (Date.parse(b.occurredAt) || 0) - (Date.parse(a.occurredAt) || 0)).slice(0, 10); }
export function transactionDate(date) { return date ? new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date needs review'; }
