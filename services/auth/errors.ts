import { fail, type ServiceErrorCode, type ServiceResult } from '../types';

/**
 * Learner-facing auth messages. Backend error strings are never shown
 * directly; every failure is mapped to one of these.
 */
export const AUTH_MESSAGES = {
  invalidCredentials: 'Incorrect email or password.',
  invalidEmail: 'Please enter a valid email address.',
  emailNotVerified: 'Please verify your email before signing in.',
  accountExists: 'An account with this email already exists. Try signing in instead.',
  weakPassword: 'Please choose a stronger password with at least 8 characters.',
  samePassword: 'Your new password must be different from your current password.',
  rateLimited: 'Too many attempts. Please wait a minute and try again.',
  linkExpired: 'This link has expired or was already used. Please request a new one.',
  offline: 'You appear to be offline. Check your connection and try again.',
  network: 'We could not connect. Please check your internet connection.',
  providerUnavailable: 'This sign-in option is not available yet.',
  reauthenticate: 'For your security, please sign in again before changing your password.',
  notAvailable: 'Accounts are not available in this version of the app yet.',
  serviceUnavailable: 'Sign-in is temporarily unavailable. Please try again later.',
  generic: 'Something went wrong. Please try again.',
} as const;

interface ErrorLike {
  name?: string;
  code?: string;
  status?: number;
  message?: string;
}

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === 'object' && error !== null ? (error as ErrorLike) : {};
}

/** Classifies a Supabase / network error into a code and a friendly message. */
export function describeAuthError(
  error: unknown,
  fallback: string = AUTH_MESSAGES.generic,
): { code: ServiceErrorCode; message: string } {
  const e = asErrorLike(error);
  const code = e.code ?? '';
  const message = (e.message ?? '').toLowerCase();

  // The project rejected the configured key (wrong project, mistyped or revoked).
  // A configuration fault, not the learner's: never blame their input.
  if (message.includes('invalid api key') || code === 'invalid_api_key') {
    return {
      code: 'not_configured',
      message: __DEV__
        ? 'Development note: Supabase rejected the publishable key ("Invalid API key"). Copy it from the same project as EXPO_PUBLIC_SUPABASE_URL, then restart Expo with -c.'
        : AUTH_MESSAGES.serviceUnavailable,
    };
  }

  // Network failures: supabase-js wraps them as AuthRetryableFetchError (status 0).
  if (
    e.name === 'AuthRetryableFetchError' ||
    (e.name === 'TypeError' && message.includes('fetch')) ||
    message.includes('network request failed')
  ) {
    return { code: 'offline', message: AUTH_MESSAGES.network };
  }
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return { code: 'unauthenticated', message: AUTH_MESSAGES.invalidCredentials };
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return { code: 'unauthenticated', message: AUTH_MESSAGES.emailNotVerified };
  }
  if (code === 'user_already_exists' || code === 'email_exists' || message.includes('already registered')) {
    return { code: 'validation', message: AUTH_MESSAGES.accountExists };
  }
  if (code === 'weak_password' || message.includes('password should be')) {
    return { code: 'validation', message: AUTH_MESSAGES.weakPassword };
  }
  if (code === 'same_password') return { code: 'validation', message: AUTH_MESSAGES.samePassword };
  if (code === 'email_address_invalid' || code === 'validation_failed' || message.includes('invalid email')) {
    return { code: 'validation', message: AUTH_MESSAGES.invalidEmail };
  }
  if (code.startsWith('over_') || e.status === 429) return { code: 'unknown', message: AUTH_MESSAGES.rateLimited };
  if (code === 'otp_expired' || code === 'flow_state_expired' || code === 'flow_state_not_found') {
    return { code: 'validation', message: AUTH_MESSAGES.linkExpired };
  }
  if (
    code === 'provider_disabled' ||
    message.includes('provider is not enabled') ||
    message.includes('unsupported provider')
  ) {
    return { code: 'provider_unavailable', message: AUTH_MESSAGES.providerUnavailable };
  }
  if (code === 'reauthentication_needed') return { code: 'unauthenticated', message: AUTH_MESSAGES.reauthenticate };

  return { code: 'unknown', message: fallback };
}

export function authFailure<T = never>(error: unknown, fallback?: string): ServiceResult<T> {
  const { code, message } = describeAuthError(error, fallback);
  return fail<T>(code, message, error);
}
