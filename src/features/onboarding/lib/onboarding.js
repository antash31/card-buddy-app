// #genai: Client validation and database-exact onboarding option values.
export const EMPLOYMENT_CLASSES = ['Salaried', 'Self-Employed', 'Student', 'Retired'];
export const INCOME_BANDS = ['Below 3L', '3L-6L', '6L-12L', '12L-25L', '25L-50L', '50L+'];
export const MONTHLY_SPEND_BANDS = [
  'Sub-10K',
  '10K-25K',
  '25K-50K',
  '50K-1L',
  '1L-2L',
  '2L-3L',
  '3L+',
];
export const OPTIMIZATION_GOALS = [
  'Cashback / Statement Credit',
  'Reward Points / Air Miles',
  'Brand Vouchers',
];

export function validateMobileNumber(value) {
  if (!value.trim()) return 'Enter your mobile number.';
  if (!/^[6-9][0-9]{9}$/.test(value.trim())) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  return null;
}

export function parseDateOfBirth(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return { error: 'Use DD/MM/YYYY, for example 14/08/1994.' };

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(`${isoDate}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== isoDate) {
    return { error: 'Enter a valid calendar date.' };
  }

  const today = new Date();
  const adultCutoff = new Date(
    Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()),
  );

  if (date > adultCutoff) {
    return { error: 'You must be at least 18 years old to use Card Buddy.' };
  }

  return { isoDate, error: null };
}

export function formatDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function formatDateOfBirth(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate ?? '');
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

export function validateCity(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your city.';
  if (trimmed.length > 100) return 'City cannot exceed 100 characters.';
  return null;
}
