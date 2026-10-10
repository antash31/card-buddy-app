/* global test, expect */
import { bandHint, bandNote, formatPct, humanizeCode, pillVerdict, reasonText, VERDICTS } from './auditCopy';

const base = {
  reasonCode: 'adds_value',
  marginalValue: 11439,
  annualFee: 1179,
  grossFee: 1179,
  feeWaived: false,
  annualRewards: 14670,
  valuation: { path: 'cashback_statement', pointValue: 0.3 },
  betterRedemption: null,
  alternative: null,
  needs: [],
};

test('every verdict the API can return has a label and a tone', () => {
  for (const verdict of ['keep', 'close', 'upgrade', 'downgrade', 'review', 'unknown', 'unscored']) {
    expect(VERDICTS[verdict].label).toBeTruthy();
    expect(VERDICTS[verdict].tone).toBeTruthy();
  }
});

test('a card that adds value says how much, after its fee', () => {
  expect(reasonText(base)).toContain('Rs.11,439');
  expect(reasonText(base)).toContain('Rs.1,179 fee');
});

test('a waived fee is said to be waived rather than charged', () => {
  const text = reasonText({ ...base, feeWaived: true, annualFee: 0 });
  expect(text).toContain('waived');
  expect(text).not.toContain('after its');
});

test('an idle card with a small fee is not described as adding value', () => {
  const text = reasonText({ ...base, reasonCode: 'idle_small_fee', marginalValue: -117 });
  expect(text).toContain('Rs.117');
  expect(text).not.toContain('adds');
  expect(text).not.toContain('\u2212');
});

test('a card to close says what closing saves, as a positive number', () => {
  const text = reasonText({ ...base, reasonCode: 'costs_more_than_adds', marginalValue: -11800, grossFee: 11800 });
  expect(text).toContain('Rs.11,800');
  expect(text).not.toContain('−');
});

test('a swap names the card and the gain, and distinguishes upgrade from switch', () => {
  const alternative = { cardName: 'Reserve', kind: 'upgrade', annualGain: 16000 };
  expect(reasonText({ ...base, reasonCode: 'swap_better', alternative })).toContain('Upgrading to Reserve');
  expect(reasonText({ ...base, reasonCode: 'swap_better', alternative: { ...alternative, kind: 'downgrade' } })).toContain('Switching to Reserve');
});

test('a redemption-dependent card shows the per-point values as fractions of a rupee', () => {
  const text = reasonText({
    ...base,
    reasonCode: 'depends_on_redemption',
    betterRedemption: { path: 'travel_smartbuy', pointValue: 1, marginalValue: 9000 },
  });
  expect(text).toContain('Rs.0.3 a point');
  expect(text).toContain('Rs.1 a point');
  expect(text).toContain('Travel Smartbuy');
});

test('a card that needs an answer asks the card’s own question', () => {
  expect(reasonText({ ...base, reasonCode: 'needs_info', needs: [{ question: 'Which version do you hold?' }] })).toBe('Which version do you hold?');
  expect(reasonText({ ...base, reasonCode: 'needs_info', needs: [] })).toContain('Answer one question');
});

test('every reason code produces a sentence', () => {
  const codes = [
    'adds_value', 'free_adds_value', 'free_idle', 'idle_small_fee', 'fee_unknown', 'costs_more_than_adds', 'swap_better',
    'depends_on_redemption', 'has_unvalued_benefits', 'needs_info', 'needs_point_value', 'unmodelled',
  ];
  const full = {
    ...base,
    marginalValue: -500,
    alternative: { cardName: 'X', kind: 'upgrade', annualGain: 1000 },
    betterRedemption: { path: 'p', pointValue: 1, marginalValue: 1 },
  };
  for (const reasonCode of codes) {
    const text = reasonText({ ...full, reasonCode });
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(20);
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('NaN');
  }
});

test('formatting helpers', () => {
  expect(formatPct(10)).toBe('10%');
  expect(formatPct(1.5)).toBe('1.5%');
  expect(formatPct(0.94)).toBe('0.9%');
  expect(formatPct(null)).toBe('—');
  expect(humanizeCode('airtel_thanks_app')).toBe('Airtel Thanks App');
});

test('the running total is compared with the sign-up spend band', () => {
  expect(bandHint('25K-50K', 30000)).toContain('In line');
  expect(bandHint('25K-50K', 90000)).toContain('Above');
  expect(bandHint('25K-50K', 5000)).toContain('Below');
  expect(bandHint('3L+', 900000)).toContain('In line');
  expect(bandHint('25K-50K', 0)).toBeNull();
  expect(bandHint('nonsense', 10000)).toBeNull();
});

test('the report’s band note only speaks up when the spend is off the band', () => {
  expect(bandNote({ status: 'within', band: '25K-50K' })).toBeNull();
  expect(bandNote({ status: 'unknown', band: null })).toBeNull();
  expect(bandNote({ status: 'above', band: '25K-50K' })).toContain('above');
});

test('a card with nothing to answer is "not scored", not "needs info"', () => {
  expect(pillVerdict({ verdict: 'unknown', status: 'unmodelled' })).toBe('unscored');
  expect(pillVerdict({ verdict: 'unknown', status: 'needs_point_value' })).toBe('unscored');
  expect(pillVerdict({ verdict: 'unknown', status: 'needs_info' })).toBe('unknown');
  expect(pillVerdict({ verdict: 'keep', status: 'ok' })).toBe('keep');
});

test('a close verdict says when even the card’s best redemption route would not save it', () => {
  const card = {
    ...base,
    reasonCode: 'costs_more_than_adds',
    marginalValue: -11800,
    grossFee: 11800,
    betterRedemption: { path: 'travel_smartbuy', pointValue: 1, marginalValue: -1857 },
  };
  const text = reasonText(card);
  expect(text).toContain('Rs.11,800');
  expect(text).toContain('Travel Smartbuy');
  expect(text).toContain('Rs.1,857');
  expect(reasonText({ ...card, betterRedemption: null })).not.toContain('Even at');
});
