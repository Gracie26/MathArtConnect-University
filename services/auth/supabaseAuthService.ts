import type { AuthChangeEvent, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env } from '@/config/env';

import { getConnectionStatus } from '../connectivity/network';
import { getSupabase } from '../supabase/client';
import { fail, notConfigured, ok, type ServiceResult } from '../types';

import { AUTH_MESSAGES, authFailure } from './errors';
import { authRedirects } from './redirects';
import type { AuthEvent, AuthProvider, AuthService, AuthUser, OAuthOutcome, OAuthProvider } from './types';

function toAuthUser(user: User): AuthUser {
  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [];
  const meta = user.user_metadata ?? {};
  const fullName = (meta.full_name ?? meta.name ?? null) as string | null;
  return {
    id: user.id,
    email: user.email ?? null,
    emailVerified: Boolean(user.email_confirmed_at),
    providers: providers.filter((p): p is AuthProvider => p === 'email' || p === 'google' || p === 'apple'),
    fullName: fullName?.trim() || null,
  };
}

const EVENT_MAP: Partial<Record<AuthChangeEvent, AuthEvent>> = {
  INITIAL_SESSION: 'initial',
  SIGNED_IN: 'signed_in',
  SIGNED_OUT: 'signed_out',
  PASSWORD_RECOVERY: 'password_recovery',
  USER_UPDATED: 'user_updated',
};

/** Fails fast with the offline message instead of waiting for a timeout. */
async function offlineGuard(): Promise<ServiceResult<never> | null> {
  return (await getConnectionStatus()) === 'offline' ? fail('offline', AUTH_MESSAGES.offline) : null;
}

/** Reads ?code= / ?error= from a redirect URL (query or hash fragment). */
function paramsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parts = url.split(/[?#]/).slice(1).join('&');
  for (const pair of parts.split('&')) {
    if (!pair) continue;
    const [key, value = ''] = pair.split('=');
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
  }
  return params;
}

function isProviderEnabled(provider: OAuthProvider): boolean {
  return provider === 'google' ? env.googleAuthEnabled : env.appleAuthEnabled;
}

/**
 * Supabase-backed AuthService (PKCE flow).
 *
 * Email/password works once Supabase is configured. Google and Apple run
 * through Supabase Auth and are only attempted when their env switch is on
 * (EXPO_PUBLIC_AUTH_GOOGLE_ENABLED / EXPO_PUBLIC_AUTH_APPLE_ENABLED) — see
 * docs/EXTERNAL_SETUP.md. No client secret is ever held by the app.
 */
export const supabaseAuthService: AuthService = {
  kind: 'supabase',

  isAvailable: () => getSupabase() !== null,

  async getCurrentUser() {
    const supabase = getSupabase();
    if (!supabase) return ok(null);
    // getSession() restores the persisted session without a network round trip,
    // so a returning learner opens straight into the app (also offline).
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return ok(null);
    return ok(toAuthUser(data.session.user));
  },

  onAuthStateChange(listener) {
    const supabase = getSupabase();
    if (!supabase) return () => undefined;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const mapped = EVENT_MAP[event];
      if (!mapped) return; // TOKEN_REFRESHED etc. do not change who is signed in
      // Defer: calling Supabase inside this callback can deadlock the auth lock.
      setTimeout(() => listener(session?.user ? toAuthUser(session.user) : null, mapped), 0);
    });
    return () => data.subscription.unsubscribe();
  },

  async signUpWithEmail({ fullName, email, password }) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Account sign-up');
    const offline = await offlineGuard();
    if (offline) return offline;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authRedirects.callback(),
        // Read by the handle_new_user trigger to seed profiles.display_name.
        data: { full_name: fullName.trim() },
      },
    });
    if (error) return authFailure(error);
    // With email confirmation on, Supabase returns a user with no identities
    // for an address that is already registered (to avoid account probing).
    if (data.user && data.user.identities?.length === 0) {
      return fail('validation', AUTH_MESSAGES.accountExists);
    }
    if (data.session) return ok({ status: 'signed_in' as const });
    return ok({ status: 'verification_required' as const, email });
  },

  async signInWithEmail({ email, password }) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Sign-in');
    const offline = await offlineGuard();
    if (offline) return offline;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return authFailure(error ?? new Error('no user'), AUTH_MESSAGES.invalidCredentials);
    return ok(toAuthUser(data.user));
  },

  async resendVerificationEmail(email) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Email verification');
    const offline = await offlineGuard();
    if (offline) return offline;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: authRedirects.callback() },
    });
    return error ? authFailure(error) : ok(undefined);
  },

  async requestPasswordReset(email) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Password reset');
    const offline = await offlineGuard();
    if (offline) return offline;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirects.passwordReset() });
    // Only surface rate limits and connectivity; never reveal whether an account exists.
    if (error) {
      const result = authFailure<void>(error);
      if (!result.ok && (result.error.code === 'offline' || error.status === 429)) return result;
    }
    return ok(undefined);
  },

  async updatePassword(newPassword) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Password update');
    const offline = await offlineGuard();
    if (offline) return offline;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error ? authFailure(error) : ok(undefined);
  },

  async signInWithProvider(provider): Promise<ServiceResult<OAuthOutcome>> {
    const supabase = getSupabase();
    if (!supabase || !isProviderEnabled(provider)) {
      return fail('not_configured', AUTH_MESSAGES.providerUnavailable);
    }
    const offline = await offlineGuard();
    if (offline) return offline;

    // iOS: native Sign in with Apple sheet → ID token → Supabase.
    if (provider === 'apple' && Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync())) {
      try {
        const rawNonce = Crypto.randomUUID();
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
          nonce: hashedNonce,
        });
        if (!credential.identityToken) return fail('unknown', AUTH_MESSAGES.generic);
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
          nonce: rawNonce,
        });
        if (error) return authFailure(error);
        // Apple shares the name only on the first sign-in; keep it for profile setup.
        const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
        if (name) await supabase.auth.updateUser({ data: { full_name: name } });
        return ok({ status: 'signed_in' });
      } catch (error) {
        if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
          return fail('cancelled', 'Sign-in was cancelled.');
        }
        return authFailure(error);
      }
    }

    // Google (all platforms) and Apple on Android / web: Supabase OAuth with PKCE.
    const redirectTo = authRedirects.callback();
    const isWeb = Platform.OS === 'web';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: !isWeb },
    });
    if (error) return authFailure(error);
    if (isWeb) return ok({ status: 'redirecting' }); // the page navigates to the provider

    if (!data.url) return fail('unknown', AUTH_MESSAGES.generic);
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return fail('cancelled', 'Sign-in was cancelled.');

    const params = paramsFromUrl(result.url);
    const completed = await this.completeAuthRedirect({
      code: params.code,
      error: params.error,
      errorCode: params.error_code,
      errorDescription: params.error_description,
    });
    return completed.ok ? ok({ status: 'signed_in' }) : completed;
  },

  async completeAuthRedirect({ code, error, errorCode }) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Sign-in');
    if (error || errorCode) {
      return authFailure({ code: errorCode ?? error }, AUTH_MESSAGES.linkExpired);
    }
    if (!code) {
      const { data } = await supabase.auth.getSession();
      return ok(data.session ? toAuthUser(data.session.user) : null);
    }
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return authFailure(exchangeError, AUTH_MESSAGES.linkExpired);
    return ok(data.user ? toAuthUser(data.user) : null);
  },

  async signOut() {
    const supabase = getSupabase();
    if (!supabase) return ok(undefined);
    // 'local' clears this device even when offline; the server session expires on its own.
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return error ? authFailure(error) : ok(undefined);
  },
};
