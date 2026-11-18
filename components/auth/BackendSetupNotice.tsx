import { useEffect, useState } from 'react';

import { FormError } from '@/components/forms/FormError';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/AuthProvider';
import { AUTH_MESSAGES, isDevAuthBackend } from '@/services/auth';
import { checkSupabaseConnection, type SupabaseConnectionStatus } from '@/services/supabase/health';

const DEV_MESSAGES: Record<Exclude<SupabaseConnectionStatus, 'connected'>, string> = {
  not_configured:
    'Development note: Supabase is not connected. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY) to .env.local, then restart Expo with -c (see docs/EXTERNAL_SETUP.md).',
  secret_key:
    'Development note: the configured Supabase key is a secret (server-only) key, so it was ignored. Use the publishable key (sb_publishable_…) instead, then restart Expo.',
  invalid_key:
    'Development note: Supabase rejected the publishable key ("Invalid API key"). Copy it from the same project as EXPO_PUBLIC_SUPABASE_URL, then restart Expo with -c.',
  unreachable: `Development note: could not reach Supabase at ${env.supabaseUrl ?? 'the configured URL'}. Check the URL and your internet connection.`,
  error: 'Development note: Supabase answered unexpectedly. Check the project status in the Supabase dashboard.',
};

/**
 * Development builds: stays visible until a real request to the configured
 * Supabase project succeeds, and says exactly what is wrong otherwise.
 * Release builds: a neutral message only when accounts are unavailable.
 */
export function BackendSetupNotice() {
  const { accountsAvailable } = useAuth();
  const [status, setStatus] = useState<SupabaseConnectionStatus | 'checking'>('checking');
  const diagnose = __DEV__ && !isDevAuthBackend;

  useEffect(() => {
    if (!diagnose) return;
    let active = true;
    void checkSupabaseConnection().then((result) => {
      if (active) setStatus(result);
    });
    return () => {
      active = false;
    };
  }, [diagnose]);

  if (isDevAuthBackend) return null;
  if (!__DEV__) return accountsAvailable ? null : <FormError tone="info" message={AUTH_MESSAGES.notAvailable} />;
  if (status === 'connected') return null;
  if (status === 'checking') {
    return <FormError tone="info" message="Development note: checking the connection to Supabase…" />;
  }
  return <FormError tone="info" message={DEV_MESSAGES[status]} />;
}
