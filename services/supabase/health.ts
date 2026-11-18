import { env } from '@/config/env';

export type SupabaseConnectionStatus =
  | 'not_configured' // URL or publishable key missing
  | 'secret_key' // a server-only key was supplied (ignored)
  | 'connected' // project answered and accepted the key
  | 'invalid_key' // project answered but rejected the key (wrong project / revoked)
  | 'unreachable' // no answer (offline, wrong URL, DNS)
  | 'error'; // unexpected response

const TIMEOUT_MS = 8000;
let pending: Promise<SupabaseConnectionStatus> | null = null;

async function probe(): Promise<SupabaseConnectionStatus> {
  if (env.supabaseKeyProblem === 'secret_key') return 'secret_key';
  if (!env.isSupabaseConfigured || !env.supabaseUrl || !env.supabasePublishableKey) return 'not_configured';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Harmless public endpoint: verifies the URL and that the key belongs to the project.
    const response = await fetch(`${env.supabaseUrl}/auth/v1/health`, {
      headers: { apikey: env.supabasePublishableKey },
      signal: controller.signal,
    });
    if (response.ok) return 'connected';
    if (response.status === 401 || response.status === 403) return 'invalid_key';
    return 'error';
  } catch {
    return 'unreachable';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One real round trip to the configured Supabase project, cached for the app
 * session (call `{ refresh: true }` to re-check). Used by development
 * diagnostics; learners never see this detail.
 */
export function checkSupabaseConnection(options: { refresh?: boolean } = {}): Promise<SupabaseConnectionStatus> {
  if (!pending || options.refresh) pending = probe();
  return pending;
}
