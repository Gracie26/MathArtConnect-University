import * as Linking from 'expo-linking';

/**
 * Deep-link targets used in Supabase auth emails and OAuth redirects. All of
 * them land on app/auth/callback.tsx, which finishes the PKCE code exchange.
 *
 * Native:   mathartconnect://auth/callback
 * Expo Go:  exp://<host>:<port>/--/auth/callback
 * Web dev:  http://localhost:8081/auth/callback
 *
 * Every base URL must be listed in Supabase › Authentication › URL
 * Configuration › Redirect URLs (see docs/EXTERNAL_SETUP.md).
 */
export const authRedirects = {
  /** Email verification and OAuth sign-in. */
  callback: () => Linking.createURL('/auth/callback'),
  /** Password reset email: the callback switches the app into recovery mode. */
  passwordReset: () => Linking.createURL('/auth/callback', { queryParams: { flow: 'recovery' } }),
};
