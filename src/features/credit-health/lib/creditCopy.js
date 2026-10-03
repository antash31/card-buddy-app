// #genai: Turns CIBIL Protector's numbers into plain sentences, and the form into a request.
//
// The API returns figures and dates, never prose; the wording lives here. Every rupee amount in a
// sentence came from the API. The one thing computed on this side is the *form*: parsing what a
// person typed into whole rupees and a day of the month, and saying what is wrong with it.
import { formatRupeesWhole } from '@/lib/money';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const LIMIT_MIN = 1_000;
export const LIMIT_MAX = 100_000_000;

/** `2026-10-12` → "12 Oct". Parsed by hand: `new Date('2026-10-12')` is UTC and can land a day early. */
export function formatShortDate(isoDate) {
  const [, month, day] = String(isoDate ?? '').split('-').map(Number);
  if (!month || !day || month < 1 || month > 12) return '—';
  return `${day} ${MONTHS[month - 1]}`;
}

export function daysPhrase(days) {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function formatPct(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${Number(value.toFixed(1))}%`;
}

export function statementLine(cycle) {
  return `Statement ${daysPhrase(cycle.daysToStatement)} · ${formatShortDate(cycle.end)}`;
}

export function dueLine(due) {
  return `Payment due ${daysPhrase(due.daysToDue)} · ${formatShortDate(due.date)}`;
}

/** The pill: always a word, so the state survives without colour. */
export const STATUS_LABELS = {
  setup_needed: 'Set up',
  limit_only: 'Limit set',
  within: 'Under 30%',
  above: 'Over 30%',
};

/** One or two sentences of guidance for a card. */
export function adviceText(card) {
  switch (card.status) {
    case 'setup_needed':
      return 'Add this card’s credit limit to see how much of it is safe to use.';

    case 'limit_only':
      return `Aim to keep each statement under ${formatRupeesWhole(card.ceiling)}. Add the statement date to see this cycle’s spend.`;

    case 'within':
      return card.headroom === 0
        ? `You are right at the ${formatRupeesWhole(card.ceiling)} ceiling. Anything more tips it over.`
        : `${formatRupeesWhole(card.headroom)} left before this card passes ${formatRupeesWhole(card.ceiling)}.`;

    case 'above':
      return `${formatRupeesWhole(-card.headroom)} over the ${formatRupeesWhole(card.ceiling)} ceiling. Paying about ${formatRupeesWhole(card.payDown)} before ${formatShortDate(card.cycle.end)} brings this statement back under 30%.`;

    default:
      return '';
  }
}

/** The whole-wallet line under the headline figure. */
export function overallText(overall, cardsTotal) {
  if (!overall) return 'Add a limit and a statement date to at least one card to see your utilisation.';

  const where =
    overall.status === 'within'
      ? `Under the ${formatRupeesWhole(overall.ceiling)} that 30% of your limits allows.`
      : `Over the ${formatRupeesWhole(overall.ceiling)} that 30% of your limits allows.`;

  return overall.measuredCards < cardsTotal
    ? `${where} Counts ${overall.measuredCards} of your ${cardsTotal} cards; set up the rest to include them.`
    : where;
}

/** One line for the Card Nest doorway. */
export function entrySummary(health) {
  const idle = 'Keep every card under 30% of its limit.';
  if (!health) return idle;

  const { overall, cards } = health;
  if (cards.length > 0 && cards.every((card) => card.status === 'setup_needed')) {
    return 'Add your limits to see how much of each card is safe to use.';
  }
  if (!overall) return 'Add statement dates to track each cycle.';

  const over = cards.filter((card) => card.status === 'above').length;
  if (over > 0) return `${over} ${over === 1 ? 'card is' : 'cards are'} over 30% this cycle.`;

  const soonest = cards
    .filter((card) => card.cycle)
    .reduce((best, card) => (best === null || card.cycle.daysToStatement < best ? card.cycle.daysToStatement : best), null);
  const next = soonest === null ? '' : ` · next statement ${daysPhrase(soonest)}`;
  return `${formatPct(overall.utilisationPct)} of your limits in use${next}.`;
}

// ---- the form ---------------------------------------------------------------------------------

/** What the form starts with: the saved values, as the strings a text field holds. */
export function initialFormValues(profile) {
  return {
    limit: profile.creditLimit === null ? '' : String(profile.creditLimit),
    statementDay: profile.statementDay === null ? '' : String(profile.statementDay),
    dueDay: profile.paymentDueDay === null ? '' : String(profile.paymentDueDay),
  };
}

function parseDay(text, label) {
  const trimmed = text.trim();
  if (trimmed === '') return { value: null };
  if (!/^\d{1,2}$/.test(trimmed)) return { error: `${label} is a day of the month, from 1 to 31.` };
  const day = Number(trimmed);
  return day >= 1 && day <= 31 ? { value: day } : { error: `${label} is a day of the month, from 1 to 31.` };
}

function parseLimit(text) {
  // People paste "Rs. 1,50,000" or "₹1,50,000"; strip the decoration, keep the digits.
  const trimmed = text.replace(/rs\.?|₹|,|\s/gi, '');
  if (trimmed === '') return { value: null };
  if (!/^\d+$/.test(trimmed)) return { error: 'Enter the limit as a whole number of rupees.' };
  const limit = Number(trimmed);
  if (limit < LIMIT_MIN) return { error: `A credit limit is at least ${formatRupeesWhole(LIMIT_MIN)}.` };
  if (limit > LIMIT_MAX) return { error: 'That limit looks too high. Check the amount.' };
  return { value: limit };
}

/**
 * Parses the form. A blank field means "clear it" (null), so the request always carries all three
 * and the saved state always matches what is on screen.
 */
export function parseCreditForm(values) {
  const limit = parseLimit(values.limit);
  const statement = parseDay(values.statementDay, 'The statement day');
  const due = parseDay(values.dueDay, 'The due day');

  const errors = {
    ...(limit.error ? { limit: limit.error } : {}),
    ...(statement.error ? { statementDay: statement.error } : {}),
    ...(due.error ? { dueDay: due.error } : {}),
  };

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, body: { creditLimit: limit.value, statementDay: statement.value, paymentDueDay: due.value } };
}

/** Maps the API's field names onto the form's. */
export function serverFieldErrors(error) {
  const fieldErrors = error?.details?.fieldErrors;
  if (!fieldErrors) return {};
  const first = (field) => fieldErrors[field]?.[0];
  return {
    ...(first('creditLimit') ? { limit: first('creditLimit') } : {}),
    ...(first('statementDay') ? { statementDay: first('statementDay') } : {}),
    ...(first('paymentDueDay') ? { dueDay: first('paymentDueDay') } : {}),
  };
}
