// #genai: Every word Card Lab shows that the API does not send.
//
// The reading level is a third grader's: short sentences, no money words (no "waiver", "milestone",
// "annual", "statement"…). When a word cannot be avoided (points, voucher, card year) it is
// explained the first time it appears on a page, right under the thing that uses it, and never
// again on that page. The API sends plain lines for each catalog rule; this file composes the
// price from numbers, a short honest fallback when no lines are written yet, and the page around them.
import { formatLongDate } from '@/lib/dates';
import { formatRupeesWhole } from '@/lib/money';

/** Words that need explaining, in the order a page is read. `test` runs on the shown lines. */
export const TERMS = {
  tax: {
    word: 'Tax',
    test: /\btax\b/i,
    text: 'Tax is extra money you pay that goes to the government.',
  },
  points: {
    word: 'Points',
    test: /\b(points?|edge miles|neucoins|cashpoints)\b/i,
    text: 'Points are like tickets from the bank. You can swap them for money, gifts, or trips. Banks give them names like CashPoints, Edge Miles, or NeuCoins.',
  },
  voucher: {
    word: 'Voucher',
    test: /\bvouchers?\b/i,
    text: 'A voucher is a gift code. You use it like money, but only at that shop.',
  },
  membership: {
    word: 'Membership',
    test: /\bmemberships?\b/i,
    text: 'A membership is a paid plan, like Amazon Prime. Here, the bank pays for it.',
  },
  cardYear: {
    word: 'Card year',
    test: /\bcard years?\b/i,
    text: 'A card year is 12 months, starting from the day you got the card.',
  },
  block: {
    word: '3-month block',
    test: /\bblocks?\b/i,
    text: 'A 3-month block is Jan to Mar, Apr to Jun, Jul to Sep, or Oct to Dec.',
  },
  billMonth: {
    word: 'Bill month',
    test: /\bbill months?\b/i,
    text: 'A bill month is the time between two card bills.',
  },
  priorityPass: {
    word: 'Priority Pass',
    test: /\bpriority pass\b/i,
    text: 'Priority Pass is a card that lets you into lounges around the world.',
  },
  lounge: {
    word: 'Lounge',
    test: /\blounges?\b/i,
    text: 'A lounge is a quiet room at an airport or train station. You can sit, eat, and rest there before you leave.',
  },
};

const TERM_ORDER = Object.keys(TERMS);

export const STILL_CHECKING = 'We are still checking the rules for this.';
export const SOURCE_NOTE = 'This comes from the bank’s own papers. Banks can change these rules.';

const SECTIONS = [
  { key: 'prizes', title: 'Prizes for spending', name: 'prizes' },
  { key: 'gifts', title: 'Gifts for joining and staying', name: 'gifts' },
  { key: 'lounges', title: 'Lounges', name: 'lounges' },
  { key: 'extras', title: 'Other free things', name: 'other free things' },
];

/** "in a card year" / "in one 3-month block" — how long you have to spend something. */
function spendWindow(period) {
  switch (period) {
    case 'quarter':
    case 'calendar_quarter':
      return ' in one 3-month block';
    case 'month':
    case 'calendar_month':
      return ' in one month';
    case 'statement_cycle':
    case 'statement_month':
      return ' in a bill month';
    case 'anniversary_year':
    case 'membership_year':
    case 'card_year':
      return ' in a card year';
    case 'year':
    case 'calendar_year':
      return ' in a year';
    default:
      return '';
  }
}

/** "in each 3-month block" / "each year" — how often something comes back. */
function repeatWindow(period) {
  switch (period) {
    case 'quarter':
    case 'calendar_quarter':
      return ' in each 3-month block';
    case 'month':
    case 'calendar_month':
      return ' each month';
    case 'statement_cycle':
    case 'statement_month':
      return ' each bill month';
    case 'anniversary_year':
    case 'membership_year':
    case 'card_year':
      return ' each card year';
    case 'year':
    case 'calendar_year':
      return ' each year';
    default:
      return '';
  }
}

const hasWindow = (period) => spendWindow(period) !== '';

/** The big figure and the lines under "What it costs". */
export function costView(cost) {
  const lines = [];
  let figure;
  let unit = null;

  if (!cost?.known) {
    figure = 'Not known yet';
    lines.push('We do not know the price of this card yet.');
  } else if (cost.yearly === 0) {
    figure = 'Free';
    unit = 'to keep';
    lines.push('This card has no yearly price. It is free to keep.');
  } else {
    const total = Math.round(cost.yearlyWithTax ?? cost.yearly);
    const base = Math.round(cost.yearly);
    figure = formatRupeesWhole(total);
    unit = 'a year';
    lines.push(`You pay ${formatRupeesWhole(total)} each year to keep this card.`);
    if (total > base) lines.push(`That is ${formatRupeesWhole(base)} and ${formatRupeesWhole(total - base)} of tax.`);

    if (cost.skipRule === 'spend' && cost.skip) {
      lines.push(`Spend ${formatRupeesWhole(cost.skip.spend)}${spendWindow(cost.skip.period)}, and you do not pay the next year’s price.`);
      if (!hasWindow(cost.skip.period)) lines.push('The bank did not say how long you have to spend it.');
    } else if (cost.skipRule === 'never') {
      lines.push('You pay this every year. Spending more does not change it.');
    } else {
      lines.push('We do not know if the bank ever lets you skip this price.');
    }
  }

  if (cost?.joining !== null && cost?.joining !== undefined) {
    const joining = Math.round(cost.joiningWithTax ?? cost.joining);
    if (joining === 0) lines.push('Getting the card cost nothing.');
    else {
      const taxed = joining > Math.round(cost.joining);
      lines.push(`When you first got the card, you paid ${formatRupeesWhole(joining)}${taxed ? ', with tax' : ''}.`);
    }
  }

  return { figure, unit, lines };
}

/** Short, honest words for a rule nobody has written plain lines for yet. */
export function fallbackLines(item) {
  const { facts = {} } = item;
  const lines = [];

  switch (item.kind) {
    case 'prize':
      lines.push(facts.spend ? `Spend ${formatRupeesWhole(facts.spend)}${spendWindow(facts.period)}.` : 'Spend a set amount on this card.');
      if (facts.rupees) lines.push(`The bank then gives you a gift worth ${formatRupeesWhole(facts.rupees)}.`);
      else if (facts.points) lines.push(`The bank then gives you ${Math.round(facts.points).toLocaleString('en-IN')} points.`);
      else lines.push('The bank then gives you a gift.');
      break;
    case 'gift':
      lines.push('You get a gift for getting or keeping this card.');
      break;
    case 'lounge':
      lines.push(
        facts.count
          ? `You get ${facts.count} free ${facts.count === 1 ? 'visit' : 'visits'} to lounges${repeatWindow(facts.period)}.`
          : 'This card can get you into some lounges for free.',
      );
      break;
    default:
      lines.push('This card gives you something extra for free.');
  }

  lines.push(STILL_CHECKING);
  return lines;
}

export function itemLines(item) {
  return item.lines?.length ? item.lines : fallbackLines(item);
}

/** "This starts on 1 January 2027." / "This ends on 31 December 2026." */
export function dateLines(item) {
  const lines = [];
  if (item.startsOn) lines.push(`This starts on ${formatLongDate(item.startsOn)}.`);
  if (item.endsOn) lines.push(`This ends on ${formatLongDate(item.endsOn)}.`);
  return lines;
}

function joinWords(words) {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} or ${words[words.length - 1]}`;
}

/** The muted line for sections the catalog has nothing in, so the page never shows an empty box. */
export function missingNote(card) {
  const empty = SECTIONS.filter((section) => (card[section.key] ?? []).length === 0).map((section) => section.name);
  if (empty.length === 0) return null;
  if (empty.length === SECTIONS.length) return 'We could not find any prizes, gifts or free things for this card yet.';
  return `We could not find ${joinWords(empty)} for this card yet.`;
}

/**
 * The whole card page, ready to draw: the price, each non-empty section with its lines, and which
 * words to explain where. A word is explained once, under the first thing on the page that uses it.
 */
export function cardView(card) {
  const explained = new Set();
  const termsIn = (lines) => {
    const text = lines.join(' ');
    const found = [];
    for (const key of TERM_ORDER) {
      if (explained.has(key) || !TERMS[key].test.test(text)) continue;
      explained.add(key);
      found.push({ key, word: TERMS[key].word, text: TERMS[key].text });
    }
    return found;
  };

  const cost = costView(card.cost);
  const view = {
    cost: { ...cost, terms: termsIn(cost.lines) },
    sections: [],
    missing: missingNote(card),
  };

  for (const section of SECTIONS) {
    const items = card[section.key] ?? [];
    if (items.length === 0) continue;

    let intro = null;
    if (section.key === 'lounges' && !explained.has('lounge')) {
      intro = TERMS.lounge.text;
      explained.add('lounge');
    }

    view.sections.push({
      key: section.key,
      title: section.title,
      intro,
      items: items.map((item) => {
        const lines = itemLines(item);
        const dates = dateLines(item);
        return { id: item.id, lines, dates, terms: termsIn(lines) };
      }),
    });
  }

  return view;
}

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

/** One line under a card in the list: "Rs.2,950 a year · 2 prizes · 5 free things". */
export function listSummary(card) {
  const { cost } = card;
  const price = !cost?.known ? 'Price not known' : cost.yearly === 0 ? 'Free to keep' : `${formatRupeesWhole(cost.yearlyWithTax ?? cost.yearly)} a year`;
  const prizes = card.prizes?.length ?? 0;
  const free = (card.gifts?.length ?? 0) + (card.lounges?.length ?? 0) + (card.extras?.length ?? 0);

  const parts = [price];
  if (prizes > 0) parts.push(plural(prizes, 'prize', 'prizes'));
  if (free > 0) parts.push(plural(free, 'free thing', 'free things'));
  return parts.join(' · ');
}

/** The Card Nest row's status line. */
export function entrySummary(lab) {
  if (!lab) return 'What each card costs, and what it gives you.';
  const count = lab.cards.length;
  if (count === 0) return 'Add a card to see what it gives you.';
  return count === 1 ? 'See what your card costs and gives you.' : `See what your ${count} cards cost and give you.`;
}
