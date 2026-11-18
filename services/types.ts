/**
 * Every service call resolves to a ServiceResult instead of throwing, so
 * screens can always render a meaningful state (offline, not configured,
 * failed) rather than crashing.
 */
export type ServiceErrorCode =
  | 'not_configured' // backend or provider credentials not set up yet
  | 'offline'
  | 'unauthenticated'
  | 'not_found'
  | 'validation'
  | 'provider_unavailable' // e.g. Apple Sign In on Android native
  | 'cancelled' // user dismissed a sign-in sheet
  | 'unknown';

export interface ServiceError {
  code: ServiceErrorCode;
  /** Learner-friendly message, safe to display. */
  message: string;
  /** Original error for logging only; never display raw. */
  cause?: unknown;
}

export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export const ok = <T>(data: T): ServiceResult<T> => ({ ok: true, data });

export const fail = <T = never>(code: ServiceErrorCode, message: string, cause?: unknown): ServiceResult<T> => ({
  ok: false,
  error: { code, message, cause },
});

export const notConfigured = <T = never>(what = 'The learning backend'): ServiceResult<T> =>
  fail('not_configured', `${what} is not connected yet. You can keep exploring; progress will sync once it is set up.`);
