import { useState } from 'react';

import { features } from '@/config/features';
import type { OAuthProvider } from '@/services/auth';

import { useAuth } from './AuthProvider';

const NAMES: Record<OAuthProvider, string> = { google: 'Google', apple: 'Apple' };

/**
 * Which social buttons to show and what happens on press.
 *
 * Release builds show a provider only when it is enabled (configured in
 * Supabase + env switch on). Development builds always show both so the UI
 * can be reviewed, but pressing an unconfigured one explains what is missing
 * instead of pretending to sign in.
 */
export function useProviderSignIn() {
  const auth = useAuth();
  const [busy, setBusy] = useState<OAuthProvider | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'info' } | null>(null);

  const enabled: Record<OAuthProvider, boolean> = { google: features.googleSignIn, apple: features.appleSignIn };
  const providers = (['google', 'apple'] as const).filter((p) => enabled[p] || __DEV__);

  const signIn = async (provider: OAuthProvider) => {
    setMessage(null);
    if (!enabled[provider]) {
      setMessage({
        tone: 'info',
        text: `Development note: ${NAMES[provider]} sign-in is not configured yet. Connect Supabase, enable the provider and set EXPO_PUBLIC_AUTH_${provider.toUpperCase()}_ENABLED=true (docs/EXTERNAL_SETUP.md).`,
      });
      return;
    }
    setBusy(provider);
    const result = await auth.signInWithProvider(provider);
    setBusy(null);
    if (!result.ok && result.error.code !== 'cancelled') setMessage({ tone: 'error', text: result.error.message });
  };

  return { providers, busy, message, signIn, clearMessage: () => setMessage(null) };
}
