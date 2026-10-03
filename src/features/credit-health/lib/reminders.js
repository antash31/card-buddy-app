// #genai: Which reminders to schedule, and what they say. Pure: no clock, no native module.
//
// A reminder is one local notification at 9am, a couple of days before a statement date or a payment
// due date. The dates come from the API (it owns the month-end maths), several cycles ahead, so the
// reminders keep coming even if the app is not opened for a while.
//
// The text never states a rupee amount. A notification is scheduled now and read later, and a
// figure that was right when it was scheduled can be wrong by the time it appears; "over 30% when you
// last checked" stays true. Amounts live on the screen, which is always current.
import { formatShortDate } from '@/lib/dates';

export const ID_PREFIX = 'cb-credit:';
export const STATEMENT_LEAD_DAYS = 2;
export const DUE_LEAD_DAYS = 3;
export const REMIND_HOUR = 9;
/** iOS keeps at most 64 pending local notifications; stay well inside it. */
export const MAX_REMINDERS = 56;

const toLocal = (isoDate, hour = REMIND_HOUR) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day, hour, 0, 0, 0);
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** The next 9am that is still in the future. */
function nextMorning(now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), REMIND_HOUR);
  if (today > now) return today;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, REMIND_HOUR);
}

/**
 * When to remind for an event on `isoDate`: `leadDays` before at 9am, or — if that moment has already
 * passed but the event has not — the next 9am, so dates entered late still get a reminder. Null when
 * there is nothing useful left to say.
 */
export function remindAt(isoDate, leadDays, now) {
  const eventDay = toLocal(isoDate, 0);
  const planned = toLocal(isoDate, REMIND_HOUR);
  planned.setDate(planned.getDate() - leadDays);
  if (planned > now) return planned;

  const catchUp = nextMorning(now);
  // Only worth reminding before the day itself is over.
  return startOfDay(catchUp) <= eventDay ? catchUp : null;
}

export function statementReminder(card, isoDate, { first }, now) {
  const at = remindAt(isoDate, STATEMENT_LEAD_DAYS, now);
  if (!at) return null;

  const over = first && card.status === 'above' ? ' It was over 30% of its limit when you last checked.' : '';
  return {
    id: `${ID_PREFIX}${card.userCardId}:statement:${isoDate}`,
    date: at,
    title: `Statement on ${formatShortDate(isoDate)}`,
    body: `Your ${card.bank} ${card.cardName} statement is on ${formatShortDate(isoDate)}.${over} Open Card Buddy to see how much of your limit is in use.`,
    data: { screen: 'credit-health', userCardId: card.userCardId },
  };
}

export function dueReminder(card, isoDate, now) {
  const at = remindAt(isoDate, DUE_LEAD_DAYS, now);
  if (!at) return null;

  return {
    id: `${ID_PREFIX}${card.userCardId}:due:${isoDate}`,
    date: at,
    title: `Payment due ${formatShortDate(isoDate)}`,
    body: `${card.bank} ${card.cardName}: pay the full statement amount by ${formatShortDate(isoDate)} to avoid interest and late fees.`,
    data: { screen: 'credit-health', userCardId: card.userCardId },
  };
}

/** Every reminder to schedule for these cards, soonest first, within the platform's limit. */
export function buildReminders(cards, now = new Date()) {
  const reminders = [];

  for (const card of cards) {
    if (!card.upcoming) continue;

    card.upcoming.statements.forEach((isoDate, index) => {
      const reminder = statementReminder(card, isoDate, { first: index === 0 }, now);
      if (reminder) reminders.push(reminder);
    });

    for (const isoDate of card.upcoming.dues) {
      const reminder = dueReminder(card, isoDate, now);
      if (reminder) reminders.push(reminder);
    }
  }

  return reminders.sort((a, b) => a.date - b.date).slice(0, MAX_REMINDERS);
}
