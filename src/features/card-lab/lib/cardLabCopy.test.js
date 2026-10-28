/* global test, expect, describe */
// #genai: Card Lab's own words: the price, fallbacks, dates and glossary, held to the reading rules.
import {
  STILL_CHECKING,
  cardView,
  costView,
  dateLines,
  entrySummary,
  fallbackLines,
  listSummary,
  missingNote,
} from './cardLabCopy';

/** The same list the backend's plain words are checked against. */
const HARD_WORDS = [
  'waiver', 'waive', 'waived', 'milestone', 'surcharge', 'eligible', 'eligibility', 'complimentary',
  'cardholder', 'cardmember', 'primary', 'add-on', 'statement', 'gst', 'realisation', 'issuance',
  'accrue', 'redeem', 'redeemable', 'redemption', 'threshold', 'quarter', 'quarterly', 'anniversary',
  'levied', 'discontinued', 'annual', 'annually', 'tier', 'cashback', 'emi', 'via', 'avail', 'availed',
  'applicable', 'utilise', 'credited', 'cumulative', 'domestic', 'international', 'net',
];

const cost = (over = {}) => ({
  known: true,
  yearly: 2500,
  yearlyWithTax: 2950,
  joining: 2500,
  joiningWithTax: 2950,
  skipRule: 'spend',
  skip: { spend: 300000, period: 'anniversary_year' },
  ...over,
});

const item = (over = {}) => ({
  id: 'i',
  kind: 'extra',
  lines: ['You pay no extra money on fuel.'],
  startsOn: null,
  endsOn: null,
  facts: { spend: null, period: null, count: null, rupees: null, points: null },
  ...over,
});

const card = (over = {}) => ({
  userCardId: 'u',
  cardId: 'c',
  bank: 'Axis Bank',
  cardName: 'Test Card',
  network: 'Visa',
  cost: cost(),
  prizes: [],
  gifts: [],
  lounges: [],
  extras: [],
  ...over,
});

function everyComposedLine() {
  const costs = [
    cost(),
    cost({ skip: { spend: 400000, period: 'not_stated' } }),
    cost({ skip: { spend: 400000, period: 'quarter' } }),
    cost({ skipRule: 'never', skip: null }),
    cost({ skipRule: 'unknown', skip: null }),
    cost({ yearly: 0, yearlyWithTax: 0, joining: 0, joiningWithTax: 0 }),
    cost({ known: false, yearly: null, yearlyWithTax: null, joining: null, joiningWithTax: null }),
    cost({ yearly: 499, yearlyWithTax: 588.82, joining: 499, joiningWithTax: 588.82 }),
  ];
  const facts = (over) => ({ spend: null, period: null, count: null, rupees: null, points: null, ...over });
  const fallbacks = [
    item({ kind: 'prize', lines: null, facts: facts({ spend: 100000, period: 'quarter', rupees: 1000 }) }),
    item({ kind: 'prize', lines: null, facts: facts({ spend: 400000, period: 'anniversary_year', points: 10000 }) }),
    item({ kind: 'prize', lines: null }),
    item({ kind: 'gift', lines: null }),
    item({ kind: 'lounge', lines: null, facts: facts({ count: 2, period: 'quarter' }) }),
    item({ kind: 'lounge', lines: null, facts: facts({ count: 1, period: 'year' }) }),
    item({ kind: 'lounge', lines: null }),
    item({ kind: 'extra', lines: null }),
  ];

  const lines = [];
  for (const each of costs) lines.push(...costView(each).lines);
  for (const each of fallbacks) lines.push(...fallbackLines(each));
  lines.push(...dateLines(item({ startsOn: '2027-01-01', endsOn: '2027-12-31' })));
  lines.push(missingNote(card()), missingNote(card({ prizes: [item()] })), missingNote(card({ prizes: [item()], gifts: [item()], lounges: [item()] })));
  const view = cardView(card({ lounges: [item({ kind: 'lounge', lines: null })], prizes: [item({ kind: 'prize', lines: null })] }));
  lines.push(...view.sections.map((section) => section.intro).filter(Boolean));
  lines.push(...[view.cost, ...view.sections.flatMap((section) => section.items)].flatMap((each) => each.terms.map((term) => term.text)));
  lines.push(entrySummary(null), entrySummary({ cards: [] }), entrySummary({ cards: [card()] }), entrySummary({ cards: [card(), card()] }));
  return lines.filter(Boolean);
}

describe('the reading rules', () => {
  test('no composed line uses a hard word', () => {
    for (const line of everyComposedLine()) {
      const words = line.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
      expect([line, words.filter((word) => HARD_WORDS.includes(word))]).toEqual([line, []]);
    }
  });

  test('each sentence is 20 words or fewer', () => {
    for (const line of everyComposedLine()) {
      for (const sentence of line.split(/(?<=[.?])\s+/)) {
        expect([sentence, sentence.split(/\s+/).length <= 20]).toEqual([sentence, true]);
      }
    }
  });
});

describe('the price', () => {
  test('says the yearly price with tax, splits out the tax, and how to skip it', () => {
    expect(costView(cost())).toEqual({
      figure: 'Rs.2,950',
      unit: 'a year',
      lines: [
        'You pay Rs.2,950 each year to keep this card.',
        'That is Rs.2,500 and Rs.450 of tax.',
        'Spend Rs.3,00,000 in a card year, and you do not pay the next year’s price.',
        'When you first got the card, you paid Rs.2,950, with tax.',
      ],
    });
  });

  test('says when the bank gives no time limit for the spend', () => {
    expect(costView(cost({ skip: { spend: 400000, period: 'not_stated' } })).lines).toContain('The bank did not say how long you have to spend it.');
  });

  test('keeps the price and its tax adding up when the fee has paise', () => {
    expect(costView(cost({ yearly: 499, yearlyWithTax: 588.82 })).lines[1]).toBe('That is Rs.499 and Rs.90 of tax.');
  });

  test('tells "never skipped" apart from "we do not know"', () => {
    expect(costView(cost({ skipRule: 'never', skip: null })).lines).toContain('You pay this every year. Spending more does not change it.');
    expect(costView(cost({ skipRule: 'unknown', skip: null })).lines).toContain('We do not know if the bank ever lets you skip this price.');
  });

  test('calls a free card free, and never calls an unknown price free', () => {
    expect(costView(cost({ yearly: 0, yearlyWithTax: 0, joining: 0, joiningWithTax: 0 }))).toMatchObject({ figure: 'Free', unit: 'to keep' });
    const unknown = costView(cost({ known: false, yearly: null, yearlyWithTax: null, joining: null, joiningWithTax: null }));
    expect(unknown).toEqual({ figure: 'Not known yet', unit: null, lines: ['We do not know the price of this card yet.'] });
  });
});

describe('fallbacks and dates', () => {
  test('say what the numbers say, and that we are still checking', () => {
    const prize = item({ kind: 'prize', lines: null, facts: { spend: 100000, period: 'quarter', rupees: 1000, points: null, count: null } });
    expect(fallbackLines(prize)).toEqual(['Spend Rs.1,00,000 in one 3-month block.', 'The bank then gives you a gift worth Rs.1,000.', STILL_CHECKING]);
    const lounge = item({ kind: 'lounge', lines: null, facts: { count: 1, period: 'year', spend: null, rupees: null, points: null } });
    expect(fallbackLines(lounge)[0]).toBe('You get 1 free visit to lounges each year.');
  });

  test('spell out when a rule starts or ends', () => {
    expect(dateLines(item({ startsOn: '2027-01-01', endsOn: '2027-12-31' }))).toEqual(['This starts on 1 January 2027.', 'This ends on 31 December 2027.']);
    expect(dateLines(item())).toEqual([]);
  });
});

describe('the card page', () => {
  test('leaves out empty sections and says what it could not find in one line', () => {
    const view = cardView(card({ extras: [item()] }));
    expect(view.sections.map((section) => section.key)).toEqual(['extras']);
    expect(view.missing).toBe('We could not find prizes, gifts or lounges for this card yet.');
    expect(missingNote(card({ prizes: [item()], gifts: [item()], lounges: [item()], extras: [item()] }))).toBeNull();
  });

  test('explains a word once, under the first thing that uses it', () => {
    const view = cardView(
      card({
        prizes: [
          item({ id: 'p1', kind: 'prize', lines: ['Spend Rs.1,00,000 in one 3-month block.', 'The bank then gives you a voucher worth Rs.1,000.'] }),
          item({ id: 'p2', kind: 'prize', lines: ['Spend Rs.1,50,000 in one 3-month block.', 'The bank then gives you a voucher worth Rs.1,500.'] }),
        ],
      }),
    );
    expect(view.cost.terms.map((term) => term.key)).toEqual(['tax', 'cardYear']);
    const [first, second] = view.sections[0].items;
    expect(first.terms.map((term) => term.key)).toEqual(['voucher', 'block']);
    expect(second.terms).toEqual([]);
  });

  test('opens the lounges with what a lounge is, unless the page already said', () => {
    const lounge = item({ kind: 'lounge', lines: ['You get 2 free visits to lounges in India in each 3-month block.'] });
    expect(cardView(card({ lounges: [lounge] })).sections[0]).toMatchObject({ intro: expect.stringMatching(/^A lounge is a quiet room/) });
    expect(cardView(card({ lounges: [lounge] })).sections[0].items[0].terms.map((term) => term.key)).toEqual(['block']);

    const earlier = item({ kind: 'gift', lines: ['You get 2 free lounge visits for joining.'] });
    const view = cardView(card({ gifts: [earlier], lounges: [lounge] }));
    expect(view.sections[0].items[0].terms.map((term) => term.key)).toContain('lounge');
    expect(view.sections[1].intro).toBeNull();
  });

  test('uses the plain lines when there are some, the fallback when there are none', () => {
    const view = cardView(card({ extras: [item(), item({ id: 'f', lines: null })] }));
    expect(view.sections[0].items[0].lines).toEqual(['You pay no extra money on fuel.']);
    expect(view.sections[0].items[1].lines.at(-1)).toBe(STILL_CHECKING);
  });
});

describe('summaries', () => {
  test('a list row says the price and how many prizes and free things', () => {
    expect(listSummary(card({ prizes: [item(), item()], lounges: [item()], extras: [item()] }))).toBe('Rs.2,950 a year · 2 prizes · 2 free things');
    expect(listSummary(card({ cost: cost({ yearly: 0, yearlyWithTax: 0 }), extras: [item()] }))).toBe('Free to keep · 1 free thing');
    expect(listSummary(card({ cost: cost({ known: false, yearly: null, yearlyWithTax: null }) }))).toBe('Price not known');
  });

  test('the Card Nest row counts the cards', () => {
    expect(entrySummary({ cards: [card(), card(), card()] })).toBe('See what your 3 cards cost and give you.');
    expect(entrySummary({ cards: [] })).toBe('Add a card to see what it gives you.');
  });
});
