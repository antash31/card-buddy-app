// #genai: Calendar-date helpers that never go through a time zone.
//
// `new Date('2026-10-12')` is midnight UTC and can render as the 11th west of Greenwich, so dates
// that are *dates* (a statement day, a due date) are split by hand instead.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-10-12` → "12 Oct". */
export function formatShortDate(isoDate) {
  const [, month, day] = String(isoDate ?? '').split('-').map(Number);
  if (!month || !day || month < 1 || month > 12) return '—';
  return `${day} ${MONTHS[month - 1]}`;
}

/** Whole days from an instant to `now` (never negative). For "entered 90 days ago". */
export function daysSince(instant, now = new Date()) {
  const then = new Date(instant).getTime();
  if (!Number.isFinite(then)) return null;
  return Math.max(0, Math.floor((now.getTime() - then) / 86_400_000));
}

/** An instant as the short date it falls on in the device's own time zone, which is the user's day. */
export function formatInstantShort(instant) {
  const date = new Date(instant);
  if (!Number.isFinite(date.getTime())) return '—';
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}
