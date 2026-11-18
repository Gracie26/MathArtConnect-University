import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env } from '@/config/env';

import type { Database } from './database.types';
import { sessionStorage } from './sessionStorage';

export type AppSupabaseClient = SupabaseClient<Database>;

let client: AppSupabaseClient | null = null;
let appStateListenerAttached = false;

/** `publishableKey`: sb_publishable_… (or a legacy anon JWT); both work as the client key. */
function createAppClient(url: string, publishableKey: string): AppSupabaseClient {
  return createClient<Database>(url, publishableKey, {
    auth: {
      // Native: encrypted storage (sessionStorage.ts). Web: supabase-js default.
      storage: sessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Auth links on every platform land on app/auth/callback.tsx, which
      // performs the PKCE code exchange explicitly (one code path, no races).
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
}

/**
 * Returns the shared Supabase client, or `null` when the backend has not been
 * configured (EXPO_PUBLIC_SUPABASE_URL or the publishable key unset).
 *
 * Callers must handle `null` by showing a "backend not connected" state rather
 * than crashing. Use the repositories in services/repositories instead of
 * calling this directly from screens.
 */
export function getSupabase(): AppSupabaseClient | null {
  if (!env.isSupabaseConfigured || !env.supabaseUrl || !env.supabasePublishableKey) {
    return null;
  }

  if (!client) {
    client = createAppClient(env.supabaseUrl, env.supabasePublishableKey);

    // Pause token refresh while the app is backgrounded (native only).
    if (Platform.OS !== 'web' && !appStateListenerAttached) {
      appStateListenerAttached = true;
      const supabase = client;
      AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      });
    }
  }

  return client;
}

export function isBackendConfigured(): boolean {
  return env.isSupabaseConfigured;
}
