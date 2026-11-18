import { env } from './env';

/**
 * Feature flags.
 *
 * researchConsentFlow stays OFF until the research instrument, consent
 * wording and ethics requirements are confirmed. While off, no learner is
 * treated as a research participant and no consent form is shown.
 *
 * googleSignIn / appleSignIn follow EXPO_PUBLIC_AUTH_GOOGLE_ENABLED /
 * EXPO_PUBLIC_AUTH_APPLE_ENABLED and require a configured Supabase backend.
 */
export const features = {
  researchConsentFlow: false,
  googleSignIn: env.googleAuthEnabled,
  appleSignIn: env.appleAuthEnabled,
} as const;
