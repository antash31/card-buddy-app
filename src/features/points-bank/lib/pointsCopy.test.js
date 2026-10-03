/* global test, expect */
import {
  destinationLabel,
  entrySummary,
  formatBalance,
  freshness,
  humanizeCode,
  initialBalanceText,
  minimumNote,
  parseBalance,
  perPoint,
  routeLimits,
  routeYield,
  serverBalanceError,
  summaryText,
  unvaluedText,
  valueLines,
} from './pointsCopy';

const route = (over = {}) => ({
  code: 'cashback_statement',
  destination: 'card_statement',
  pointValue: 0.3,
  friction: 0,
  effectiveValue: 0.3,
  isDefault: true,
  minPoints: null,
  fee: null,
  maxCoveragePct: null,
  monthlyCapPoints: null,
  expiryMonths: null,
  limited: false,
  ...over,
});

const card = (over = {}) => ({
  status: 'ok',
  balance: 10000,
  balanceUpdatedAt: '2026-10-01T10:00:00',
  defaultRoute: route(),
  bestRoute: route({ code: 'travel_smartbuy', destination: 'travel_booking', pointValue: 1, effectiveValue: 1, isDefault: false, limited: true }),
  valuation: { atDefault: 3000, atBest: 10000, bestRouteCode: 'travel_smartbuy', bestIsLimited: true, belowDefaultMinimum: false },
  ...over,
});

test('catalog codes become readable names', () => {
  expect(humanizeCode('apple_tanishq_smartbuy')).toBe('Apple Tanishq Smartbuy');
  expect(destinationLabel('card_statement')).toBe('Statement credit');
  expect(destinationLabel('some_new_place')).toBe('Some New Place');
  expect(destinationLabel(null)).toBeNull();
});

test('a per-point value keeps enough decimals to be honest', () => {
  expect(perPoint(0.3)).toBe('Rs.0.3');
  expect(perPoint(1)).toBe('Rs.1');
  expect(perPoint(0.0875)).toBe('Rs.0.0875');
  expect(perPoint(null)).toBe('—');
});

test('balances are whole when whole and to the paisa when not', () => {
  expect(formatBalance(12400)).toBe('12,400');
  expect(formatBalance(1284.5)).toBe('1,284.50');
  expect(formatBalance(0)).toBe('0');
  expect(formatBalance('x')).toBe('—');
});

test('a route says what it yields, and says so when it cannot', () => {
  expect(routeYield(route())).toBe('Rs.0.3 a point');
  expect(routeYield(route({ friction: 0.05, effectiveValue: 0.95, pointValue: 1 }))).toBe('Rs.0.95 a point after 5% conversion loss');
  expect(routeYield(route({ effectiveValue: null, pointValue: null }))).toBe('Value not published');
});

test('a route lists only the limits it has', () => {
  expect(routeLimits(route())).toEqual([]);
  expect(routeLimits(route({ maxCoveragePct: 70, monthlyCapPoints: 150000, minPoints: 1000, fee: 99, expiryMonths: 36 }))).toEqual([
    'Covers up to 70% of the amount',
    'Up to 1,50,000 points a month',
    'At least 1,000 points',
    'Rs.99 fee',
    'Expiry: 36 months',
  ]);
  expect(routeLimits(route({ maxCoveragePct: 100, fee: 0 }))).toEqual([]);
});

test('a balance is valued at the best route and, separately, as cash', () => {
  const lines = valueLines(card());
  expect(lines).toHaveLength(2);
  expect(lines[0]).toMatchObject({ label: 'At most', amount: 10000 });
  expect(lines[0].detail).toContain('Travel Smartbuy');
  expect(lines[0].detail).toContain('may take more than one redemption');
  expect(lines[1]).toMatchObject({ label: 'Taken as cash', amount: 3000 });
  expect(lines[1].detail).toContain('Statement credit');
});

test('when the best route is the default there is one line, not two', () => {
  const only = route();
  const lines = valueLines(
    card({ bestRoute: only, defaultRoute: only, valuation: { atDefault: 3000, atBest: 3000, bestRouteCode: only.code, bestIsLimited: false, belowDefaultMinimum: false } }),
  );
  expect(lines).toHaveLength(1);
  expect(lines[0].label).toBe('Worth');
});

test('with no default value there is only the best-route line', () => {
  const lines = valueLines(card({ valuation: { atDefault: null, atBest: 2000, bestRouteCode: 'x', bestIsLimited: false, belowDefaultMinimum: false } }));
  expect(lines).toHaveLength(1);
});

test('nothing is valued without a balance or a valued route', () => {
  expect(valueLines(card({ valuation: null }))).toEqual([]);
  expect(valueLines(card({ bestRoute: null }))).toEqual([]);
});

test('a balance under the default minimum says so', () => {
  const low = card({ defaultRoute: route({ minPoints: 1000 }), valuation: { atDefault: 150, atBest: 150, bestRouteCode: 'c', bestIsLimited: false, belowDefaultMinimum: true } });
  expect(minimumNote(low)).toBe('Under the 1,000-point minimum to redeem as statement credit.');
  expect(minimumNote(card())).toBeNull();
});

test('an old balance is flagged as stale, a recent one is not', () => {
  const now = new Date('2026-10-03T12:00:00');
  expect(freshness(card({ balanceUpdatedAt: '2026-10-01T10:00:00' }), now)).toEqual({ text: 'Entered 1 Oct', stale: false });
  const old = freshness(card({ balanceUpdatedAt: '2026-06-01T10:00:00' }), now);
  expect(old.stale).toBe(true);
  expect(old.text).toContain('days ago');
  expect(freshness(card({ balance: null }), now)).toBeNull();
});

test('a card the catalog cannot value says why', () => {
  expect(unvaluedText({ status: 'no_routes' })).toContain('no redemption data');
  expect(unvaluedText({ status: 'unvalued' })).toContain('no published rupee value');
  expect(unvaluedText({ status: 'ok' })).toBeNull();
});

test('the headline totals are honest about what was left out', () => {
  expect(summaryText({ cardsWithBalance: 0 })).toContain('Enter a balance');
  expect(summaryText({ cardsWithBalance: 3, valuedCards: 3, defaultCards: 3, atDefault: 5500 })).toBe('Rs.5,500 if you take it all as statement credit.');
  // Not every valued card has a cash value, so a cash total would understate it: say nothing about it.
  expect(summaryText({ cardsWithBalance: 3, valuedCards: 3, defaultCards: 2, atDefault: 5500 })).toBe('');
  expect(summaryText({ cardsWithBalance: 3, valuedCards: 2, defaultCards: 2, atDefault: 5500 })).toContain('1 balance has no published value yet and is left out.');
  expect(summaryText({ cardsWithBalance: 4, valuedCards: 2, defaultCards: 2, atDefault: 100 })).toContain('2 balances have no published value yet and are left out.');
});

test('the Card Nest doorway summarises the bank in one line', () => {
  expect(entrySummary(null)).toBe('See what your points are worth.');
  expect(entrySummary({ cards: [{ status: 'no_routes' }], totals: { cardsWithBalance: 0 } })).toContain('No redemption data');
  expect(entrySummary({ cards: [{ status: 'ok' }], totals: { cardsWithBalance: 0 } })).toContain('Enter your balances');
  expect(entrySummary({ cards: [{ status: 'unvalued' }], totals: { cardsWithBalance: 1, valuedCards: 0 } })).toContain('no published value');
  expect(entrySummary({ cards: [{ status: 'ok' }], totals: { cardsWithBalance: 2, valuedCards: 1, atBest: 14500 } })).toBe('Worth up to Rs.14,500 across 1 card.');
  expect(entrySummary({ cards: [{ status: 'ok' }], totals: { cardsWithBalance: 2, valuedCards: 2, atBest: 14500 } })).toBe('Worth up to Rs.14,500 across 2 cards.');
});

test('the balance field starts from the saved value', () => {
  expect(initialBalanceText(12400)).toBe('12400');
  expect(initialBalanceText(0)).toBe('0');
  expect(initialBalanceText(null)).toBe('');
});

test('a balance parses forgivingly, and zero is a real balance', () => {
  expect(parseBalance('12,400')).toEqual({ ok: true, balance: 12400 });
  expect(parseBalance('Rs. 1,284.50')).toEqual({ ok: true, balance: 1284.5 });
  expect(parseBalance('₹500')).toEqual({ ok: true, balance: 500 });
  expect(parseBalance('0')).toEqual({ ok: true, balance: 0 });
  expect(parseBalance('')).toEqual({ ok: true, balance: null });
  expect(parseBalance('   ')).toEqual({ ok: true, balance: null });
});

test('a bad balance says what is wrong', () => {
  expect(parseBalance('abc').error).toContain('Enter a number');
  expect(parseBalance('-5').error).toContain('Enter a number');
  expect(parseBalance('1.234').error).toContain('two decimal places');
  expect(parseBalance('9999999999').error).toContain('too high');
  expect(parseBalance('1.2.3').ok).toBe(false);
});

test('the API’s balance error is surfaced', () => {
  expect(serverBalanceError({ details: { fieldErrors: { balance: ['Too high.'] } } })).toBe('Too high.');
  expect(serverBalanceError(new Error('network'))).toBeNull();
  expect(serverBalanceError(null)).toBeNull();
});
