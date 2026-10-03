/* global test, expect */
import {
  adviceText,
  daysPhrase,
  dueLine,
  entrySummary,
  formatShortDate,
  initialFormValues,
  overallText,
  parseCreditForm,
  serverFieldErrors,
  statementLine,
  STATUS_LABELS,
} from './creditCopy';

const cycle = { start: '2026-09-13', end: '2026-10-12', lastStatementDate: '2026-09-12', daysToStatement: 9 };

const card = (over = {}) => ({
  status: 'within',
  ceiling: 60000,
  headroom: 18000,
  payDown: 0,
  cycle,
  ...over,
});

test('dates are read as calendar dates, never shifted by a time zone', () => {
  expect(formatShortDate('2026-10-12')).toBe('12 Oct');
  expect(formatShortDate('2027-01-01')).toBe('1 Jan');
  expect(formatShortDate(null)).toBe('—');
  expect(formatShortDate('nonsense')).toBe('—');
});

test('days are phrased the way a person says them', () => {
  expect(daysPhrase(0)).toBe('today');
  expect(daysPhrase(1)).toBe('tomorrow');
  expect(daysPhrase(9)).toBe('in 9 days');
  expect(statementLine(cycle)).toBe('Statement in 9 days · 12 Oct');
  expect(dueLine({ date: '2026-10-30', daysToDue: 27 })).toBe('Payment due in 27 days · 30 Oct');
});

test('every status has a pill word', () => {
  for (const status of ['setup_needed', 'limit_only', 'within', 'above']) {
    expect(STATUS_LABELS[status]).toBeTruthy();
  }
});

test('advice says what to do for each state, using only the API’s figures', () => {
  expect(adviceText(card({ status: 'setup_needed', ceiling: null }))).toContain('credit limit');
  expect(adviceText(card({ status: 'limit_only' }))).toContain('Rs.60,000');
  expect(adviceText(card())).toBe('Rs.18,000 left before this card passes Rs.60,000.');
  expect(adviceText(card({ headroom: 0 }))).toContain('right at the Rs.60,000 ceiling');
});

test('an over-the-ceiling card says how far over, how much to pay, and by when', () => {
  const text = adviceText(card({ status: 'above', headroom: -25250.5, payDown: 25251 }));
  expect(text).toContain('Rs.25,251 over'); // headroom is rounded for display
  expect(text).toContain('Rs.60,000 ceiling');
  expect(text).toContain('about Rs.25,251 before 12 Oct');
});

test('the wallet line is honest about cards it left out', () => {
  expect(overallText(null, 3)).toContain('Add a limit and a statement date');
  const overall = { status: 'within', ceiling: 120000, measuredCards: 2 };
  expect(overallText(overall, 2)).toBe('Under the Rs.1,20,000 that 30% of your limits allows.');
  expect(overallText(overall, 4)).toContain('Counts 2 of your 4 cards');
  expect(overallText({ ...overall, status: 'above' }, 2)).toMatch(/^Over the/);
});

test('the Card Nest doorway summarises the wallet in one line', () => {
  expect(entrySummary(null)).toBe('Keep every card under 30% of its limit.');
  expect(entrySummary({ overall: null, cards: [{ status: 'setup_needed' }, { status: 'setup_needed' }] })).toContain('Add your limits');
  expect(entrySummary({ overall: null, cards: [{ status: 'limit_only' }] })).toContain('statement dates');
  expect(
    entrySummary({ overall: { utilisationPct: 20 }, cards: [{ status: 'above' }, { status: 'above' }, { status: 'within' }] }),
  ).toBe('2 cards are over 30% this cycle.');
  expect(entrySummary({ overall: { utilisationPct: 20 }, cards: [{ status: 'above' }] })).toBe('1 card is over 30% this cycle.');
  expect(
    entrySummary({
      overall: { utilisationPct: 18.46 },
      cards: [
        { status: 'within', cycle: { daysToStatement: 9 } },
        { status: 'within', cycle: { daysToStatement: 4 } },
        { status: 'setup_needed' },
      ],
    }),
  ).toBe('18.5% of your limits in use · next statement in 4 days.');
});

test('the form starts from the saved values', () => {
  expect(initialFormValues({ creditLimit: 150000, statementDay: 12, paymentDueDay: null })).toEqual({
    limit: '150000',
    statementDay: '12',
    dueDay: '',
  });
});

test('a form parses into whole rupees and days, forgiving how people type money', () => {
  expect(parseCreditForm({ limit: '1,50,000', statementDay: '12', dueDay: '30' })).toEqual({
    ok: true,
    body: { creditLimit: 150000, statementDay: 12, paymentDueDay: 30 },
  });
  expect(parseCreditForm({ limit: 'Rs. 2,00,000', statementDay: ' 5 ', dueDay: '' }).body).toEqual({
    creditLimit: 200000,
    statementDay: 5,
    paymentDueDay: null,
  });
  expect(parseCreditForm({ limit: '₹75000', statementDay: '', dueDay: '' }).body.creditLimit).toBe(75000);
});

test('blank fields clear the saved value rather than being skipped', () => {
  expect(parseCreditForm({ limit: '', statementDay: '', dueDay: '' })).toEqual({
    ok: true,
    body: { creditLimit: null, statementDay: null, paymentDueDay: null },
  });
});

test('a bad form says which field is wrong and why', () => {
  const bad = parseCreditForm({ limit: '500', statementDay: '32', dueDay: 'abc' });
  expect(bad.ok).toBe(false);
  expect(bad.errors.limit).toContain('at least Rs.1,000');
  expect(bad.errors.statementDay).toContain('1 to 31');
  expect(bad.errors.dueDay).toContain('1 to 31');

  expect(parseCreditForm({ limit: '12.5', statementDay: '', dueDay: '' }).errors.limit).toContain('whole number');
  expect(parseCreditForm({ limit: '999999999999', statementDay: '', dueDay: '' }).errors.limit).toContain('too high');
  expect(parseCreditForm({ limit: '', statementDay: '0', dueDay: '' }).errors.statementDay).toBeTruthy();
  expect(parseCreditForm({ limit: '', statementDay: '', dueDay: '1.5' }).errors.dueDay).toBeTruthy();
});

test('the API’s field errors land on the form’s fields', () => {
  const error = { details: { fieldErrors: { creditLimit: ['Too low.'], paymentDueDay: ['Bad day.'] } } };
  expect(serverFieldErrors(error)).toEqual({ limit: 'Too low.', dueDay: 'Bad day.' });
  expect(serverFieldErrors(new Error('network'))).toEqual({});
  expect(serverFieldErrors(null)).toEqual({});
});
