/**
 * Typed access to public environment variables.
 *
 * Only EXPO_PUBLIC_* variables are inlined into the app bundle, so anything
 * read here is visible to end users. Never put service-role keys, OAuth
 * client secrets or other secrets in these variables.
 *
 * Expo inlines EXPO_PUBLIC_* only when accessed as literal
 * `process.env.EXPO_PUBLIC_NAME` expressions â€” do not destructure process.env.
 */

export interface AppEnv {
  /** Base project URL, e.g. https://<ref>.supabase.co (normalised). */
  supabaseUrl: string | null;
  /**
   * Client-safe project key: a publishable key (sb_publishable_…) or a legacy
   * anon JWT. Read from EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, falling back to
   * EXPO_PUBLIC_SUPABASE_ANON_KEY for existing setups.
   */
  supabasePublishableKey: string | null;
  activeTopicOverride: string | null;
  /** True when both Supabase values are present and look valid. */
  isSupabaseConfigured: boolean;
  /**
   * Social sign-in switches. Turn each on only after the provider is fully
   * configured in Supabase (docs/EXTERNAL_SETUP.md); the app never pretends a
   * provider works.
   */
  googleAuthEnabled: boolean;
  appleAuthEnabled: boolean;
  /**
   * EXPO_PUBLIC_AUTH_BACKEND=device-dev opts a development build into the
   * local, device-only test backend. Off by default; ignored in release builds.
   */
  devAuthBackendRequested: boolean;
  /** Set when a secret/service-role key was supplied by mistake (it is never used). */
  supabaseKeyProblem: 'secret_key' | null;
  /**
   * EXPO_PUBLIC_REVIEWER_MODE=true lets a development build show content that
   * is pending lecturer review, for checking it. Ignored in release builds.
   */
  reviewerModeRequested: boolean;
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isValidHttpUrl(value: string): boolean {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value);
}

const isTrue = (value: string | undefined) => clean(value)?.toLowerCase() === 'true';

/**
 * Guards against pasting a server-only key into the app. Supabase secret keys
 * start with "sb_secret_"; legacy service-role keys are JWTs whose payload has
 * "role": "service_role". Such a key would bypass row-level security.
 */
export function isServerOnlyKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const payload = key.split('.')[1];
  if (!payload) return false;
  try {
    const json = globalThis.atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return /"role"\s*:\s*"service_role"/.test(json);
  } catch {
    return false;
  }
}

/**
 * supabase-js expects the base project URL. Tolerates a trailing slash or a
 * pasted API path such as ".../rest/v1/".
 */
export function normaliseSupabaseUrl(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/\/+$/, '').replace(/\/(rest|auth|storage)\/v1$/i, '');
}

export function readEnv(source: Record<string, string | undefined>): AppEnv {
  const supabaseUrl = normaliseSupabaseUrl(clean(source.EXPO_PUBLIC_SUPABASE_URL));
  // Publishable keys (sb_publishable_…) and legacy anon JWTs are both accepted.
  const rawKey = clean(source.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ?? clean(source.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  const supabaseKeyProblem = rawKey && isServerOnlyKey(rawKey) ? 'secret_key' : null;
  const supabasePublishableKey = supabaseKeyProblem ? null : rawKey;
  const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey && isValidHttpUrl(supabaseUrl));

  return {
    supabaseUrl,
    supabasePublishableKey,
    activeTopicOverride: clean(source.EXPO_PUBLIC_ACTIVE_TOPIC_ID),
    isSupabaseConfigured,
    // A provider cannot work without the backend, whatever the flag says.
    googleAuthEnabled: isSupabaseConfigured && isTrue(source.EXPO_PUBLIC_AUTH_GOOGLE_ENABLED),
    appleAuthEnabled: isSupabaseConfigured && isTrue(source.EXPO_PUBLIC_AUTH_APPLE_ENABLED),
    devAuthBackendRequested: clean(source.EXPO_PUBLIC_AUTH_BACKEND) === 'device-dev',
    supabaseKeyProblem,
    reviewerModeRequested: isTrue(source.EXPO_PUBLIC_REVIEWER_MODE),
  };
}

export const env: AppEnv = readEnv({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_ACTIVE_TOPIC_ID: process.env.EXPO_PUBLIC_ACTIVE_TOPIC_ID,
  EXPO_PUBLIC_AUTH_GOOGLE_ENABLED: process.env.EXPO_PUBLIC_AUTH_GOOGLE_ENABLED,
  EXPO_PUBLIC_AUTH_APPLE_ENABLED: process.env.EXPO_PUBLIC_AUTH_APPLE_ENABLED,
  EXPO_PUBLIC_AUTH_BACKEND: process.env.EXPO_PUBLIC_AUTH_BACKEND,
  EXPO_PUBLIC_REVIEWER_MODE: process.env.EXPO_PUBLIC_REVIEWER_MODE,
});
