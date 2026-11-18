/**
 * Saving and loading learning data: the learner sees the real cause. A
 * database error (e.g. a missing topic row) is never reported as a lost
 * internet connection.
 */
import { classifyDataError, DATA_MESSAGES, dataFailure } from '@/services/repositories/dataErrors';

describe('classifyDataError', () => {
  test.each([
    ['fetch failed (web)', { name: 'TypeError', message: 'Failed to fetch' }],
    ['network request failed (native)', { name: 'TypeError', message: 'Network request failed' }],
    ['Safari load failed', { name: 'TypeError', message: 'Load failed' }],
    ['auth retryable fetch', { name: 'AuthRetryableFetchError', message: 'fetch failed', status: 0 }],
  ])('%s → network', (_label, error) => expect(classifyDataError(error)).toBe('network'));

  test.each([
    ['PostgREST JWT expired', { code: 'PGRST301', message: 'JWT expired' }],
    ['PostgREST bad JWT', { code: 'PGRST302', message: 'Anonymous access is disabled' }],
    ['HTTP 401', { status: 401, message: 'Unauthorized' }],
    ['refresh token', { message: 'Invalid Refresh Token: Refresh Token Not Found' }],
  ])('%s → session expired', (_label, error) => expect(classifyDataError(error)).toBe('sessionExpired'));

  test.each([
    [
      'foreign key (topic or unit row missing)',
      {
        code: '23503',
        message:
          'insert or update on table "lesson_progress" violates foreign key constraint "lesson_progress_unit_id_fkey"',
      },
    ],
    ['row-level security', { code: '42501', message: 'new row violates row-level security policy' }],
    ['permission denied', { code: '42501', message: 'permission denied for table lesson_progress' }],
    ['check constraint', { code: '23514', message: 'violates check constraint' }],
  ])('%s → database', (_label, error) => expect(classifyDataError(error)).toBe('database'));
});

describe('dataFailure messages', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  afterAll(() => warn.mockRestore());

  test('a database error on save says it could not be saved, not that the connection is lost', () => {
    const result = dataFailure(
      { code: '23503', message: 'violates foreign key constraint' },
      'save',
      'lesson progress',
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBe('We couldn’t save your progress right now. Please try again.');
    expect(result.error.message).not.toMatch(/internet|connection/i);
    expect(result.error.code).toBe('unknown');
  });

  test('a network failure says the server could not be reached', () => {
    const result = dataFailure({ name: 'TypeError', message: 'Failed to fetch' }, 'save', 'lesson progress');
    expect(!result.ok && result.error.message).toBe(DATA_MESSAGES.network);
    expect(!result.ok && result.error.code).toBe('offline');
  });

  test('an expired session asks the learner to sign in again', () => {
    const result = dataFailure({ code: 'PGRST301', message: 'JWT expired' }, 'load', 'learning history');
    expect(!result.ok && result.error.message).toBe('Your session has expired. Please sign in again.');
    expect(!result.ok && result.error.code).toBe('unauthenticated');
  });

  test('in development the real Supabase error is logged', () => {
    warn.mockClear();
    dataFailure(
      { code: '23503', message: 'fk', details: 'Key (unit_id)=(x) is not present', hint: null },
      'save',
      'lesson progress',
    );
    expect(warn).toHaveBeenCalledWith(
      '[data] save failed (lesson progress): database',
      expect.objectContaining({ code: '23503', details: 'Key (unit_id)=(x) is not present' }),
    );
  });
});
