// #genai: Client-side mirror of the backend's auth validation rules.
//
// These duplicate `card-buddy-backend/src/schemas/auth.schema.ts` on purpose: the server stays
// the authority, but validating inline lets the user fix a typo before submitting instead of
// waiting for a round trip to tell them. Keep the two files in sync.
export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const passwordRules = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  { id: 'letter', label: 'One letter', test: (value) => /[A-Za-z]/.test(value) },
  { id: 'number', label: 'One number', test: (value) => /[0-9]/.test(value) },
];

export function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.';
  return null;
}

/** Full strength check — used on sign-up, where the policy applies. */
export function validateNewPassword(value) {
  if (!value) return 'Choose a password.';

  const failed = passwordRules.filter((rule) => !rule.test(value));
  if (failed.length === 0) return null;

  return `Password needs: ${failed.map((rule) => rule.label.toLowerCase()).join(', ')}.`;
}

/**
 * Sign-in only checks presence. An existing password may predate the current policy, and
 * restating the rules on a login screen tells an attacker what shape to guess.
 */
export function validateExistingPassword(value) {
  return value ? null : 'Enter your password.';
}

export function validateFullName(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your name.';
  if (trimmed.length > 80) return 'Names cannot exceed 80 characters.';
  return null;
}

export function getPasswordStrength(value) {
  const results = passwordRules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(value),
  }));

  const met = results.filter((rule) => rule.met).length;
  // A long password that already satisfies every rule earns the top tier.
  const score = met === passwordRules.length && value.length >= 12 ? 4 : met;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return { score, label: labels[score] ?? '', rules: results };
}

/** Collapses a form's field errors into the first message, for screen-reader announcement. */
export function firstError(errors) {
  return Object.values(errors).find(Boolean) ?? null;
}
