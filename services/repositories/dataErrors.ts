import { fail, type ServiceErrorCode, type ServiceResult } from '../types';

/**
 * Learner-facing messages for reading and saving learning data. The cause is
 * classified first, so a database problem is never reported as a lost
 * internet connection.
 */
export const DATA_MESSAGES = {
  network: 'Unable to reach the server. Check your internet connection and try again.',
  sessionExpired: 'Your session has expired. Please sign in again.',
  save: 'We couldn’t save your progress right now. Please try again.',
  load: 'We couldn’t load your progress right now. Please try again.',
} as const;

interface ErrorLike {
  name?: string;
  code?: string;
  status?: number;
  message?: string;
  details?: string;
  hint?: string;
}

const asErrorLike = (error: unknown): ErrorLike =>
  typeof error === 'object' && error !== null ? (error as ErrorLike) : {};

export type DataErrorKind = 'network' | 'sessionExpired' | 'database';

/**
 * What went wrong:
 *   network         the request never reached the server (fetch failed)
 *   sessionExpired  the server rejected the access token (PostgREST PGRST301/302, HTTP 401, JWT errors)
 *   database        the server answered with an error: a constraint, a permission or a missing row
 */
export function classifyDataError(error: unknown): DataErrorKind {
  const e = asErrorLike(error);
  const code = e.code ?? '';
  const message = (e.message ?? '').toLowerCase();
  if (
    e.name === 'AuthRetryableFetchError' ||
    (e.name === 'TypeError' && (message.includes('fetch') || message.includes('network'))) ||
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('load failed')
  ) {
    return 'network';
  }
  if (
    code === 'PGRST301' ||
    code === 'PGRST302' ||
    e.status === 401 ||
    message.includes('jwt expired') ||
    message.includes('invalid jwt') ||
    message.includes('session_not_found') ||
    message.includes('refresh token')
  ) {
    return 'sessionExpired';
  }
  return 'database';
}

const CODE_FOR: Record<DataErrorKind, ServiceErrorCode> = {
  network: 'offline',
  sessionExpired: 'unauthenticated',
  database: 'unknown',
};

/**
 * A failed read or write as a ServiceResult with the right learner message.
 * In development the real Supabase error (code, message, details, hint) is
 * logged so the root cause is visible; learners never see it.
 */
export function dataFailure<T>(error: unknown, operation: 'save' | 'load', context: string): ServiceResult<T> {
  const kind = classifyDataError(error);
  if (__DEV__) {
    const e = asErrorLike(error);
    console.warn(`[data] ${operation} failed (${context}): ${kind}`, {
      code: e.code,
      message: e.message,
      details: e.details,
      hint: e.hint,
    });
  }
  const message =
    kind === 'network'
      ? DATA_MESSAGES.network
      : kind === 'sessionExpired'
        ? DATA_MESSAGES.sessionExpired
        : DATA_MESSAGES[operation];
  return fail<T>(CODE_FOR[kind], message, error);
}
