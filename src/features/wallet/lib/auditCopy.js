// #genai: Turns the audit's structured verdicts into plain sentences.
//
// The API returns *codes and numbers*, never prose — the copy lives here, where it can change
// without a deploy and where the same figure is formatted the way the rest of the app formats it.
// Every rupee amount in these sentences came from the API; nothing is computed or invented here.
import { formatRupeesWhole } from '@/lib/money';

/** `travel_smartbuy` → "Travel Smartbuy". Catalog codes are lower_snake, not display text. */
export function humanizeCode(code) {
  return String(code ?? '')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Percent back, trimmed: 10 → "10%", 1.5 → "1.5%", 0.9 → "0.9%". */
export function formatPct(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${Number(value.toFixed(1))}%`;
}

/** Tone is a theme colour family; the screen maps it to its tokens. */
export const VERDICTS = {
  keep: { label: 'Keep', tone: 'success' },
  close: { label: 'Close', tone: 'danger' },
  upgrade: { label: 'Upgrade', tone: 'primary' },
  downgrade: { label: 'Downgrade', tone: 'warning' },
  review: { label: 'Review', tone: 'warning' },
  unknown: { label: 'Needs info', tone: 'muted' },
  // A card with nothing for the person to answer: "Needs info" would promise a question that is not there.
  unscored: { label: 'Not scored', tone: 'muted' },
};

/** The verdict key to show: an unknown card only "needs info" when there is something to ask. */
export function pillVerdict(card) {
  if (card.verdict !== 'unknown') return card.verdict;
  return card.status === 'needs_info' ? 'unknown' : 'unscored';
}

const rupees = formatRupeesWhole;

/** One sentence saying why this card got its verdict. */
export function reasonText(card) {
  const { reasonCode: code } = card;

  switch (code) {
    case 'adds_value':
      return card.feeWaived
        ? `Its fee is waived at your spend, and your wallet earns about ${rupees(card.marginalValue)} a year more with it.`
        : `Your wallet earns about ${rupees(card.marginalValue)} a year more with it, after its ${rupees(card.annualFee)} fee.`;

    case 'free_adds_value':
      return `No fee, and your wallet earns about ${rupees(card.marginalValue)} a year more with it.`;

    case 'free_idle':
      return 'No fee, but it does not win any of your categories. Worth keeping as a backup or for brand offers.';

    case 'idle_small_fee':
      return `It does not win any of your spend, and its fee is small. Closing would save about ${rupees(-card.marginalValue)} a year — keep it only if you want the credit history or its brand offers.`;

    case 'fee_unknown':
      return `We do not have this card’s fee yet, so we cannot say what it costs. It earns about ${rupees(card.annualRewards)} a year on your spend.`;

    case 'costs_more_than_adds': {
      const base = `Its ${rupees(card.grossFee)} fee outweighs what it adds. Closing it would save about ${rupees(-card.marginalValue)} a year.`;
      const better = card.betterRedemption;
      // The audit checked the card's best redemption route before saying "close"; say so, because a
      // reader who knows the card's travel value would otherwise assume we never looked.
      if (!better || !(better.marginalValue < 0)) return base;
      return `${base} Even at Rs.${better.pointValue} a point through ${humanizeCode(better.path)}, it would still cost about ${rupees(-better.marginalValue)} a year more than it earns.`;
    }

    case 'swap_better': {
      const { alternative } = card;
      const move = alternative.kind === 'upgrade' ? 'Upgrading' : 'Switching';
      return `${move} to ${alternative.cardName} would add about ${rupees(alternative.annualGain)} a year to your wallet.`;
    }

    case 'depends_on_redemption': {
      const better = card.betterRedemption;
      // A point is worth fractions of a rupee, so it is not a whole-rupee figure.
      return `It looks poor at Rs.${card.valuation.pointValue} a point, but at Rs.${better.pointValue} a point through ${humanizeCode(better.path)} it would earn its fee back. It depends on how you redeem.`;
    }

    case 'has_unvalued_benefits':
      return 'Its fee may be justified by recurring benefits we do not value yet, such as monthly vouchers. Check them before closing.';

    case 'needs_info':
      return card.needs?.[0]?.question ?? 'Answer one question and we can include this card.';

    case 'needs_point_value':
      return 'We do not have a published value for this card’s points yet, so we cannot score it.';

    default:
      return 'Its rewards depend on terms we cannot model from a spend total yet, so it is left out of these numbers rather than counted as zero.';
  }
}

/** The audit's own summary of why a number might surprise — shown under the headline figure. */
export function bandNote(bandCheck) {
  if (!bandCheck || bandCheck.status === 'unknown' || bandCheck.status === 'within') return null;
  const where = bandCheck.status === 'above' ? 'above' : 'below';
  return `That is ${where} the ${bandCheck.band} monthly spend you told us at sign-up.`;
}

export const PAY_MIX_OPTIONS = [
  { value: 'instore', label: 'In store' },
  { value: 'balanced', label: 'Both' },
  { value: 'online', label: 'Online' },
];

export const GROUP_LABELS = {
  everyday: 'Everyday spending',
  recurring: 'Recurring payments',
  other: 'Everything else',
};

export const ROLE_LABELS = {
  primary: 'Main card',
  secondary: 'Then',
  available: '',
};

const BANDS = {
  'Sub-10K': [0, 10000],
  '10K-25K': [10000, 25000],
  '25K-50K': [25000, 50000],
  '50K-1L': [50000, 100000],
  '1L-2L': [100000, 200000],
  '2L-3L': [200000, 300000],
  '3L+': [300000, null],
};

/** Live feedback while moving sliders: how the running total compares with the sign-up band. */
export function bandHint(band, total) {
  const range = BANDS[band];
  if (!range || total <= 0) return null;
  const [low, high] = range;
  if (total < low) return `Below the ${band} you chose at sign-up.`;
  if (high !== null && total > high) return `Above the ${band} you chose at sign-up.`;
  return `In line with the ${band} you chose at sign-up.`;
}
