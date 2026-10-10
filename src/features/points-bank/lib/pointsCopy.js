// #genai: Turns Points Bank's numbers into plain sentences, and the balance field into a request.
//
// The API returns figures, never prose; the wording lives here. Every rupee figure in a sentence came
// from the API. The one thing parsed on this side is what a person typed into the balance field.
import { daysSince, formatInstantShort } from '@/lib/dates';
import { formatRupeesWhole } from '@/lib/money';

export const BALANCE_MAX = 1_000_000_000;
const STALE_AFTER_DAYS = 60;

/** `travel_smartbuy` → "Travel Smartbuy". Catalog codes are lower_snake, not display text. */
export function humanizeCode(code) {
  return String(code ?? '')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const DESTINATIONS = {
  card_statement: 'Statement credit',
  partner_wallet: 'Partner wallet',
  voucher: 'Vouchers',
  travel_booking: 'Travel booking',
  airmiles: 'Air miles',
  amazon_pay_balance: 'Amazon Pay balance',
};

export function destinationLabel(destination) {
  return DESTINATIONS[destination] ?? (destination ? humanizeCode(destination) : null);
}

/** Rupees one point yields: up to four decimals (the API's precision), so Rs.0.0875 stays Rs.0.0875. */
export function perPoint(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `Rs.${Number(value.toFixed(4))}`;
}

/** A balance, whole when it is whole (12,400) and to the paisa when it is not (1,284.50). */
export function formatBalance(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  const whole = Number.isInteger(amount);
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** The limits a route carries, as short phrases — empty when it has none. */
export function routeLimits(route) {
  const limits = [];
  if (route.maxCoveragePct !== null && route.maxCoveragePct < 100) limits.push(`Covers up to ${Number(route.maxCoveragePct)}% of the amount`);
  if (route.monthlyCapPoints !== null) limits.push(`Up to ${formatBalance(route.monthlyCapPoints)} points a month`);
  if (route.minPoints !== null) limits.push(`At least ${formatBalance(route.minPoints)} points`);
  if (route.fee !== null && route.fee > 0) limits.push(`${formatRupeesWhole(route.fee)} fee`);
  if (route.expiryMonths !== null) limits.push(`Expiry: ${route.expiryMonths} months`);
  return limits;
}

/** One line describing what a route yields per point. */
export function routeYield(route) {
  if (route.effectiveValue === null) return 'Value not published';
  const lossy = route.friction > 0 ? ` after ${Math.round(route.friction * 100)}% conversion loss` : '';
  return `${perPoint(route.effectiveValue)} a point${lossy}`;
}

/** The headline under "what your points are worth". */
export function summaryText(totals) {
  if (totals.cardsWithBalance === 0) return 'Enter a balance for a card to see what it comes to.';

  const unvalued = totals.cardsWithBalance - totals.valuedCards;
  const parts = [];
  if (totals.valuedCards > 0 && totals.defaultCards === totals.valuedCards) {
    parts.push(`${formatRupeesWhole(totals.atDefault)} if you take it all as statement credit.`);
  }
  if (unvalued > 0) {
    parts.push(
      `${unvalued} ${unvalued === 1 ? 'balance has' : 'balances have'} no published value yet and ${unvalued === 1 ? 'is' : 'are'} left out.`,
    );
  }
  return parts.join(' ');
}

/** What a card's balance comes to. Empty when there is nothing to value yet. */
export function valueLines(card) {
  const { valuation, bestRoute, defaultRoute } = card;
  if (!valuation || !bestRoute) return [];

  const lines = [];
  const bestIsDefault = defaultRoute && defaultRoute.code === bestRoute.code;

  lines.push({
    key: 'best',
    label: bestIsDefault ? 'Worth' : 'At most',
    amount: valuation.atBest,
    detail: `${humanizeCode(bestRoute.code)} · ${perPoint(bestRoute.effectiveValue)} a point${
      valuation.bestIsLimited ? ' · may take more than one redemption' : ''
    }`,
  });

  if (!bestIsDefault && valuation.atDefault !== null && defaultRoute) {
    lines.push({
      key: 'default',
      label: 'Taken as cash',
      amount: valuation.atDefault,
      detail: `${destinationLabel(defaultRoute.destination) ?? humanizeCode(defaultRoute.code)} · ${perPoint(defaultRoute.effectiveValue)} a point`,
    });
  }
  return lines;
}

/** A warning when the balance is under the default route's minimum. */
export function minimumNote(card) {
  if (!card.valuation?.belowDefaultMinimum || !card.defaultRoute) return null;
  return `Under the ${formatBalance(card.defaultRoute.minPoints)}-point minimum to redeem as ${(
    destinationLabel(card.defaultRoute.destination) ?? 'cash'
  ).toLowerCase()}.`;
}

/** How fresh the entered balance is. */
export function freshness(card, now = new Date()) {
  if (card.balance === null || !card.balanceUpdatedAt) return null;
  const days = daysSince(card.balanceUpdatedAt, now);
  const entered = `Entered ${formatInstantShort(card.balanceUpdatedAt)}`;
  if (days !== null && days >= STALE_AFTER_DAYS) return { text: `${entered}, ${days} days ago. Update it to keep this accurate.`, stale: true };
  return { text: entered, stale: false };
}

/** Sentence for a card the catalog cannot value. */
export function unvaluedText(card) {
  if (card.status === 'no_routes') return 'There is no redemption data for this card yet.';
  if (card.status === 'unvalued') return 'This card’s redemption routes have no published rupee value yet, so a balance cannot be valued.';
  return null;
}

/** One line for the Card Nest doorway. */
export function entrySummary(bank) {
  if (!bank) return 'See what your points are worth.';
  const { totals } = bank;
  if (bank.cards.length > 0 && bank.cards.every((card) => card.status === 'no_routes')) return 'No redemption data for your cards yet.';
  if (totals.cardsWithBalance === 0) return 'Enter your balances to see what your points are worth.';
  if (totals.valuedCards === 0) return 'Your balances have no published value yet.';
  return `Worth up to ${formatRupeesWhole(totals.atBest)} across ${totals.valuedCards} ${totals.valuedCards === 1 ? 'card' : 'cards'}.`;
}

// ---- the balance field -------------------------------------------------------------------------

/** What the field starts with: the saved balance as the string a text field holds. */
export function initialBalanceText(balance) {
  return balance === null || balance === undefined ? '' : String(balance);
}

/**
 * Parses the balance field. Blank means "clear it" (null); zero is a real balance. Commas, spaces
 * and a rupee sign are forgiven because cashback balances are pasted from banking apps.
 */
export function parseBalance(text) {
  const cleaned = String(text).replace(/rs\.?|₹|,|\s/gi, '');
  if (cleaned === '') return { ok: true, balance: null };
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return { ok: false, error: 'Enter a number, such as 12400.' };

  const balance = Number(cleaned);
  if (Math.abs(balance * 100 - Math.round(balance * 100)) > 1e-6) return { ok: false, error: 'Use at most two decimal places.' };
  if (balance > BALANCE_MAX) return { ok: false, error: 'That balance looks too high. Check the number.' };
  return { ok: true, balance };
}

export function serverBalanceError(error) {
  return error?.details?.fieldErrors?.balance?.[0] ?? null;
}
