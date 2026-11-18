/**
 * Client-side form validation. Rules are deliberately simple: one clear
 * password rule instead of complex composition requirements.
 */

export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt (used by Supabase Auth) ignores input beyond 72 bytes. */
export const PASSWORD_MAX_LENGTH = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Enter a password.';
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > PASSWORD_MAX_LENGTH) return `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  return null;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (!confirmation) return 'Confirm your password.';
  if (password !== confirmation) return 'Passwords do not match.';
  return null;
}

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Enter the name you would like to be called.';
  if (trimmed.length > 80) return 'Use 80 characters or fewer.';
  return null;
}

export function validateOptionalText(value: string, label: string, max = 120): string | null {
  return value.trim().length > max ? `${label} must be ${max} characters or fewer.` : null;
}
