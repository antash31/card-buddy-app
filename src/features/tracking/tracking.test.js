/* global jest, test, expect, beforeEach */
import { recentTen, transactionAmount, transactionLabel } from './presentation';

test('recent list never exceeds ten and sorts newest first', () => {
  const events = Array.from({ length: 15 }, (_, i) => ({ eventId: String(i), occurredAt: new Date(2026, 8, i + 1).toISOString() }));
  const result = recentTen(events);
  expect(result).toHaveLength(10);
  expect(result[0].eventId).toBe('14');
  expect(events[0].eventId).toBe('0');
});
test('credit and debit amounts have explicit signs', () => {
  expect(transactionAmount({ amountMinor: 24859, currency: 'INR', direction: 'credit' })).toBe('+₹248.59');
  expect(transactionAmount({ amountMinor: 24859, currency: 'INR', direction: 'debit' })).toBe('−₹248.59');
});
test('missing merchant gets a useful fallback', () => { expect(transactionLabel({ eventType: 'bill_payment' })).toBe('bill payment'); });
