// #genai: Card Finder's sentences. The API returns codes and rupee figures, never prose; the copy lives
// here, where it can change without a deploy. Nothing in this file computes a value — every number it
// prints came from the API (the one subtraction below only splits a figure the API already reports).
import { formatRupeesWhole } from '@/lib/money';

/** How a card pays out, in the terms of the sign-up goal question. */
export const STYLE_LABELS = {
  cashback: 'Cashback',
  points: 'Points and miles',
  vouchers: 'Vouchers and brand credit',
};

/** The goal, as it reads inside a sentence ("suits your cashback goal"). */
export const GOAL_PHRASES = {
  cashback: 'cashback',
  points: 'points and miles',
  vouchers: 'vouchers',
};

/** "groceries", "groceries and dining", "groceries, dining and travel". */
export function joinWords(words) {
  const list = words.filter(Boolean);
  if (list.length <= 1) return list[0] ?? '';
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

export function gainText(amount) {
  if (!Number.isFinite(amount) || amount <= 0.5) return 'Adds nothing';
  return `+${formatRupeesWhole(amount)} a year`;
}

/** What the card costs to hold, as the gain already counted it. */
export function feeText(pick) {
  if (pick.feeWaived) return `Annual fee waived at your spend (${formatRupeesWhole(pick.grossFee)} otherwise)`;
  if (!pick.grossFee) return 'No annual fee';
  return `After its ${formatRupeesWhole(pick.annualFee)} annual fee`;
}

export function joiningText(pick) {
  return pick.joiningFee ? `Joining fee ${formatRupeesWhole(pick.joiningFee)}, not counted above.` : null;
}

/** The spend categories the card would carry. */
export function earnsOnText(pick) {
  if (!pick.topBuckets?.length) return null;
  return `Earns on your ${joinWords(pick.topBuckets.map((bucket) => bucket.label.toLowerCase()))}.`;
}

/** Where its spend would come from. */
export function takesFromText(pick) {
  if (!pick.takesFrom?.length) return null;
  const total = pick.takesFrom.reduce((sum, move) => sum + move.annualSpend, 0);
  return `Moves ${formatRupeesWhole(total)} a year of spend from your ${joinWords(pick.takesFrom.map((move) => move.cardName))}.`;
}

/**
 * Fees the gain counts on cards already held — a waiver lost when spend moves away. The API reports
 * the wallet's reward change, this card's fee and the net gain; the difference is those other fees.
 */
export function otherFeesText(pick) {
  const other = pick.rewardsGain - pick.annualFee - pick.annualGain;
  if (!(other >= 1)) return null;
  return `Counts ${formatRupeesWhole(other)} a year more in fees on cards you hold, from a waiver they would no longer reach.`;
}

export function goalText(pick, goal) {
  if (!goal || pick.goalMatch !== true) return null;
  return `Suits your ${GOAL_PHRASES[goal.style]} goal`;
}

/** How the card's points are valued — said only when the goal line has not already said it. */
export function styleText(pick, goal) {
  if (!pick.style) return null;
  if (goal && pick.goalMatch === true && pick.style === goal.style) return null;
  return `Valued as ${STYLE_LABELS[pick.style].toLowerCase()}`;
}

export function unrankedText(card) {
  switch (card.reason) {
    case 'needs_point_value':
      return 'Its points have no published rupee value yet, so it cannot be scored.';
    case 'needs_info':
      return card.question ? `Depends on an answer we do not have: ${card.question}` : 'Depends on an answer we do not have yet.';
    default:
      return 'Its terms cannot be modelled from a spend total yet.';
  }
}

export function feeUnknownText(card) {
  return `${gainText(card.gainBeforeOwnFee)} before its annual fee, which is not in our data yet.`;
}

export function noPlanText(threshold) {
  return `No card we can price adds ${formatRupeesWhole(threshold)} a year to your wallet on this spend. The cards you hold already cover it, or the ones that would help are listed below without a fee.`;
}

export function planCaption(step) {
  return step === 1 ? 'Best first card' : 'With the cards above';
}

/** The Card Nest row's one line. Never locked: without an audit, Card Finder asks its own questions. */
export function entrySubtitle(auditDone) {
  return auditDone ? 'Which card to get next, on your spend.' : 'Answer a few questions to find your next card.';
}

/** The onboarding goal values (DB-exact), shortened for chips. `null` is "no preference". */
export const GOAL_OPTIONS = [
  { value: 'Cashback / Statement Credit', label: 'Cashback' },
  { value: 'Reward Points / Air Miles', label: 'Points & miles' },
  { value: 'Brand Vouchers', label: 'Vouchers' },
  { value: null, label: 'Not sure' },
];

export const PAY_MIX_OPTIONS = [
  { value: 'instore', label: 'In store' },
  { value: 'balanced', label: 'Both' },
  { value: 'online', label: 'Online' },
];

export const BUCKET_GROUP_LABELS = {
  everyday: 'Everyday spending',
  recurring: 'Bills and payments',
  other: 'Everything else',
};

export function monthlyTotal(monthly) {
  return Object.values(monthly ?? {}).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
}

export function totalText(monthly) {
  const total = monthlyTotal(monthly);
  return total > 0 ? `${formatRupeesWhole(total)} a month in all.` : 'Move at least one slider to see your cards.';
}

export function nestChoiceLabel(count) {
  return `Count the ${count === 1 ? 'card' : `${count} cards`} I hold`;
}

/** Where the spend behind a result came from. */
export function basisText(report) {
  const where = report.source === 'answers' ? 'your answers' : 'your wallet audit';
  return `On ${formatRupeesWhole(report.basis.monthlyTotal)} a month of spend from ${where}.`;
}

/** The draft the form starts from: the audit's spend and the sign-up goal when there are some. */
export function initialDraft(form) {
  return {
    monthly: { ...(form?.saved?.monthly ?? {}) },
    payMix: form?.saved?.payMix ?? 'balanced',
    goal: form?.goal ?? null,
    includeNest: true,
  };
}

export const HOW_IT_WORKS = [
  'Each card is scored by what your whole wallet gains a year with it added: the spend it would win from your cards at its better rate, minus its annual fee with GST. The fee counts as waived when the spend it would carry reaches its waiver.',
  'The second and third cards are scored with the cards before them already in your wallet, so the plan never stacks two cards that win the same spend.',
  'When a new card would pull a card you hold below its fee waiver, Card Finder keeps enough spend on that card if that is worth more.',
  'Your sign-up goal never changes the order. It marks the cards that pay out the way you prefer.',
  'A card is never recommended without a known annual fee. Joining fees and welcome bonuses are not counted.',
];
