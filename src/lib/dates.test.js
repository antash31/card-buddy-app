/* global test, expect */
import { daysSince, formatInstantShort, formatShortDate } from './dates';

test('calendar dates are read as dates, never shifted by a time zone', () => {
  expect(formatShortDate('2026-10-12')).toBe('12 Oct');
  expect(formatShortDate('2027-01-01')).toBe('1 Jan');
  expect(formatShortDate(null)).toBe('—');
  expect(formatShortDate('nonsense')).toBe('—');
});

test('days since an instant are whole days and never negative', () => {
  const now = new Date('2026-10-03T12:00:00Z');
  expect(daysSince('2026-10-03T08:00:00Z', now)).toBe(0);
  expect(daysSince('2026-10-02T11:00:00Z', now)).toBe(1);
  expect(daysSince('2026-07-05T12:00:00Z', now)).toBe(90);
  expect(daysSince('2026-10-04T12:00:00Z', now)).toBe(0); // clock skew: a future instant is "today"
  expect(daysSince('not a date', now)).toBeNull();
});

test('an instant is shown as a short date', () => {
  expect(formatInstantShort('2026-10-03T12:00:00')).toBe('3 Oct');
  expect(formatInstantShort('nope')).toBe('—');
});
