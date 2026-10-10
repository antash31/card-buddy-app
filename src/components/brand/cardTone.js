// #genai: Pure helpers behind the generated card art — kept out of `CardArt.jsx` so they can be
// unit-tested without pulling in native modules (blur, gradients, reanimated).

const ASPECT = 0.63;

// Decorative, not branded: nine known issuers spread across the six tones so neighbours differ.
const BANK_TONES = {
  'Axis Bank': 'violet',
  HDFC: 'blue',
  ICICI: 'coral',
  AMEX: 'graphite',
  HSBC: 'sun',
  IDFC: 'mint',
  SBI: 'blue',
  'Federal Bank': 'sun',
  'Yes Bank': 'violet',
};

export const TONE_ORDER = ['blue', 'graphite', 'sun', 'violet', 'coral', 'mint'];

/** Stable tone for a bank; unknown banks hash onto the palette rather than all being blue. */
export function toneForBank(bank = '') {
  if (BANK_TONES[bank]) return BANK_TONES[bank];

  let hash = 0;
  for (let i = 0; i < bank.length; i += 1) hash = (hash * 31 + bank.charCodeAt(i)) >>> 0;
  return TONE_ORDER[hash % TONE_ORDER.length];
}

/** The giant ghost letters: the first two letters of the issuer, or "CB" when there is none. */
export function monogramFor(bank = '') {
  const letters = bank.replace(/[^A-Za-z]/g, '');
  return (letters.slice(0, 2) || 'CB').toUpperCase();
}

/** Card art is always the same shape; height follows from width. */
export function cardHeight(width) {
  return Math.round(width * ASPECT);
}
