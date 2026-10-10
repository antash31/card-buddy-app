/* global test, expect */
// #genai: Card Finder's sentences: every figure comes from the API pick, and nothing reads "NaN".
import {
  basisText,
  earnsOnText,
  entrySubtitle,
  feeText,
  feeUnknownText,
  gainText,
  goalText,
  initialDraft,
  joinWords,
  joiningText,
  monthlyTotal,
  nestChoiceLabel,
  noPlanText,
  otherFeesText,
  styleText,
  takesFromText,
  totalText,
  unrankedText,
} from './finderCopy';

const pick = (over = {}) => ({
  cardId: 'c',
  bank: 'HSBC',
  cardName: 'Live+',
  style: 'cashback',
  styles: ['cashback'],
  goalMatch: true,
  annualGain: 4301,
  rewardsGain: 17280,
  annualFee: 1179,
  grossFee: 1179,
  feeWaived: false,
  joiningFee: null,
  topBuckets: [
    { bucketId: 'shopping', label: 'Shopping', share: 0.5 },
    { bucketId: 'groceries', label: 'Groceries', share: 0.3 },
  ],
  takesFrom: [{ cardId: 'i', cardName: 'Infinia', annualSpend: 840000 }],
  ...over,
});

test('joins words the way a sentence does', () => {
  expect(joinWords([])).toBe('');
  expect(joinWords(['a'])).toBe('a');
  expect(joinWords(['a', 'b'])).toBe('a and b');
  expect(joinWords(['a', 'b', 'c'])).toBe('a, b and c');
});

test('a gain is a signed whole-rupee figure; nothing at all reads as adding nothing', () => {
  expect(gainText(4301)).toBe('+Rs.4,301 a year');
  expect(gainText(0)).toBe('Adds nothing');
  expect(gainText(-1770)).toBe('Adds nothing');
  expect(gainText(Number.NaN)).toBe('Adds nothing');
});

test('the fee line says whether the fee was counted, waived or absent', () => {
  expect(feeText(pick())).toBe('After its Rs.1,179 annual fee');
  expect(feeText(pick({ feeWaived: true, annualFee: 0, grossFee: 11800 }))).toBe('Annual fee waived at your spend (Rs.11,800 otherwise)');
  expect(feeText(pick({ annualFee: 0, grossFee: 0 }))).toBe('No annual fee');
});

test('where the card would earn and where its spend would come from', () => {
  expect(earnsOnText(pick())).toBe('Earns on your shopping and groceries.');
  expect(earnsOnText(pick({ topBuckets: [] }))).toBeNull();
  expect(takesFromText(pick())).toBe('Moves Rs.8,40,000 a year of spend from your Infinia.');
  expect(takesFromText(pick({ takesFrom: [] }))).toBeNull();
});

test('names fees lost on held cards only when the figures show them', () => {
  // 17,280 rewards − 1,179 own fee − 4,301 net = 11,800 counted on another card.
  expect(otherFeesText(pick())).toContain('Rs.11,800');
  expect(otherFeesText(pick({ rewardsGain: 5480, annualGain: 4301 }))).toBeNull();
});

test('joining fee is mentioned as not counted, only when the catalog has one', () => {
  expect(joiningText(pick({ joiningFee: 199 }))).toBe('Joining fee Rs.199, not counted above.');
  expect(joiningText(pick())).toBeNull();
});

test('goal and style tags never claim a match that was not reported', () => {
  const goal = { value: 'Cashback / Statement Credit', style: 'cashback' };
  expect(goalText(pick(), goal)).toBe('Suits your cashback goal');
  expect(goalText(pick({ goalMatch: false }), goal)).toBeNull();
  expect(goalText(pick({ goalMatch: null }), null)).toBeNull();
  // The style is not repeated when the goal line already says it…
  expect(styleText(pick(), goal)).toBeNull();
  // …and is said when it differs, or when there is no goal to compare with.
  expect(styleText(pick({ styles: ['cashback', 'points'] }), { value: 'Reward Points / Air Miles', style: 'points' })).toBe('Valued as cashback');
  expect(styleText(pick(), null)).toBe('Valued as cashback');
  expect(styleText(pick({ style: null }), goal)).toBeNull();
});

test('cards that cannot be ranked say why', () => {
  expect(unrankedText({ reason: 'needs_point_value' })).toContain('no published rupee value');
  expect(unrankedText({ reason: 'needs_info', question: 'Do you have an Amazon Prime membership?' })).toContain('Amazon Prime');
  expect(unrankedText({ reason: 'needs_info', question: null })).toContain('answer');
  expect(unrankedText({ reason: 'unmodelled' })).toContain('cannot be modelled');
  expect(feeUnknownText({ gainBeforeOwnFee: 32300 })).toBe('+Rs.32,300 a year before its annual fee, which is not in our data yet.');
});

test('the empty plan and the Card Nest row read correctly', () => {
  expect(noPlanText(1500)).toContain('Rs.1,500 a year');
  expect(entrySubtitle(true)).toBe('Which card to get next, on your spend.');
  expect(entrySubtitle(false)).toBe('Answer a few questions to find your next card.');
});

test('the form starts from the audit and the sign-up goal, or from nothing', () => {
  expect(initialDraft({ saved: { monthly: { dining: 5000 }, payMix: 'online' }, goal: 'Brand Vouchers' })).toEqual({
    monthly: { dining: 5000 },
    payMix: 'online',
    goal: 'Brand Vouchers',
    includeNest: true,
  });
  expect(initialDraft({ saved: null, goal: null })).toEqual({ monthly: {}, payMix: 'balanced', goal: null, includeNest: true });
});

test('the running total and the nest choice read correctly', () => {
  expect(monthlyTotal({ dining: 5000, groceries: 12000, fuel: undefined })).toBe(17000);
  expect(totalText({ dining: 5000, groceries: 12000 })).toBe('Rs.17,000 a month in all.');
  expect(totalText({})).toContain('Move at least one slider');
  expect(nestChoiceLabel(1)).toBe('Count the card I hold');
  expect(nestChoiceLabel(3)).toBe('Count the 3 cards I hold');
});

test('says where the spend behind a result came from', () => {
  expect(basisText({ source: 'audit', basis: { monthlyTotal: 86000 } })).toBe('On Rs.86,000 a month of spend from your wallet audit.');
  expect(basisText({ source: 'answers', basis: { monthlyTotal: 30000 } })).toBe('On Rs.30,000 a month of spend from your answers.');
});
