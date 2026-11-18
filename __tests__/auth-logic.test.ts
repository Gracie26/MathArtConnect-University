import { normaliseSupabaseUrl, readEnv } from '@/config/env';
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/lib/validation/auth';
import { AUTH_MESSAGES, describeAuthError } from '@/services/auth/errors';
import { base64ToBytes } from '@/lib/utils/base64';

describe('form validation', () => {
  test('email', () => {
    expect(validateEmail('')).toBe('Enter your email address.');
    expect(validateEmail('ada@')).toBe('Please enter a valid email address.');
    expect(validateEmail(' ada@example.com ')).toBeNull();
  });

  test('password: one simple rule (at least 8 characters)', () => {
    expect(validatePassword('')).toBe('Enter a password.');
    expect(validatePassword('1234567')).toBe('Use at least 8 characters.');
    expect(validatePassword('abcdefgh')).toBeNull();
    expect(validatePasswordConfirmation('abcdefgh', 'abcdefgx')).toBe('Passwords do not match.');
  });

  test('display name', () => {
    expect(validateDisplayName('   ')).not.toBeNull();
    expect(validateDisplayName('Ada')).toBeNull();
  });
});

describe('friendly auth errors (raw backend text is never shown)', () => {
  test.each([
    [{ code: 'invalid_credentials', message: 'Invalid login credentials' }, AUTH_MESSAGES.invalidCredentials],
    [{ code: 'email_not_confirmed' }, AUTH_MESSAGES.emailNotVerified],
    [{ code: 'email_address_invalid' }, AUTH_MESSAGES.invalidEmail],
    [{ code: 'user_already_exists' }, AUTH_MESSAGES.accountExists],
    [{ code: 'weak_password' }, AUTH_MESSAGES.weakPassword],
    [{ code: 'over_email_send_rate_limit', status: 429 }, AUTH_MESSAGES.rateLimited],
    [{ code: 'otp_expired' }, AUTH_MESSAGES.linkExpired],
    [{ name: 'AuthRetryableFetchError', message: 'Failed to fetch' }, AUTH_MESSAGES.network],
    [{ message: 'pq: something internal exploded' }, AUTH_MESSAGES.generic],
  ])('%o → friendly message', (error, expected) => {
    expect(describeAuthError(error).message).toBe(expected);
  });
});

test('a rejected project key is reported as configuration, not as the learner’s mistake', () => {
  const result = describeAuthError({ status: 401, message: 'Invalid API key' });
  expect(result.code).toBe('not_configured');
  expect(result.message).toMatch(/rejected the publishable key/); // development wording (__DEV__ in tests)
});

describe('social sign-in switches', () => {
  const base = { EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon' };

  test('off by default', () => {
    const env = readEnv(base);
    expect(env.googleAuthEnabled).toBe(false);
    expect(env.appleAuthEnabled).toBe(false);
  });

  test('cannot be enabled without a configured backend', () => {
    const env = readEnv({ EXPO_PUBLIC_AUTH_GOOGLE_ENABLED: 'true', EXPO_PUBLIC_AUTH_APPLE_ENABLED: 'true' });
    expect(env.googleAuthEnabled).toBe(false);
    expect(env.appleAuthEnabled).toBe(false);
  });

  test('enabled explicitly with a backend', () => {
    expect(readEnv({ ...base, EXPO_PUBLIC_AUTH_GOOGLE_ENABLED: 'true' }).googleAuthEnabled).toBe(true);
  });
});

describe('avatar upload encoding', () => {
  test('base64 decodes to the original bytes', () => {
    expect(Array.from(base64ToBytes('TWF0aEFydA=='))).toEqual([77, 97, 116, 104, 65, 114, 116]); // 'MathArt'
    expect(Array.from(base64ToBytes('data:image/png;base64,AAEC'))).toEqual([0, 1, 2]);
  });
});

describe('Supabase configuration safety', () => {
  const url = 'https://example.supabase.co';
  const jwt = (payload: object) => `xx.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.yy`;

  test('a publishable / anon key is accepted', () => {
    expect(
      readEnv({ EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_abc' })
        .isSupabaseConfigured,
    ).toBe(true);
    expect(
      readEnv({ EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_ANON_KEY: jwt({ role: 'anon' }) })
        .isSupabaseConfigured,
    ).toBe(true);
  });

  test.each([['sb_secret_abc'], [jwt({ role: 'service_role' })]])('a server-only key (%s) is refused', (key) => {
    const env = readEnv({ EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_ANON_KEY: key });
    expect(env.isSupabaseConfigured).toBe(false);
    expect(env.supabasePublishableKey).toBeNull();
    expect(env.supabaseKeyProblem).toBe('secret_key');
  });

  test('the new sb_publishable_ key format is accepted under the new variable name', () => {
    const key = 'sb_publishable_' + 'a'.repeat(32);
    const env = readEnv({ EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key });
    expect(env.isSupabaseConfigured).toBe(true);
    expect(env.supabasePublishableKey).toBe(key);
    expect(env.supabaseKeyProblem).toBeNull();
  });

  test('the publishable variable wins; the legacy ANON variable still works on its own', () => {
    const both = readEnv({
      EXPO_PUBLIC_SUPABASE_URL: url,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_new',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_old',
    });
    expect(both.supabasePublishableKey).toBe('sb_publishable_new');
    expect(
      readEnv({ EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_old' })
        .supabasePublishableKey,
    ).toBe('sb_publishable_old');
  });

  test.each([
    ['https://ref.supabase.co', 'https://ref.supabase.co'],
    ['https://ref.supabase.co/', 'https://ref.supabase.co'],
    ['https://ref.supabase.co/rest/v1/', 'https://ref.supabase.co'],
    ['https://ref.supabase.co/auth/v1', 'https://ref.supabase.co'],
  ])('project URL %s is normalised to the base URL', (input, expected) => {
    expect(normaliseSupabaseUrl(input)).toBe(expected);
  });

  test('the device-only test backend is opt-in', () => {
    expect(readEnv({}).devAuthBackendRequested).toBe(false);
    expect(readEnv({ EXPO_PUBLIC_AUTH_BACKEND: 'device-dev' }).devAuthBackendRequested).toBe(true);
  });
});
