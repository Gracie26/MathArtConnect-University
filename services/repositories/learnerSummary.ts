import { listLearnerTopics } from '@/content/registry';
import { effectiveStreak, longestStreakFromDays, streakFromDays, studyDay } from '@/features/learning/studyDay';

import { isDevAuthBackend } from '../auth';
import { describeAuthError } from '../auth/errors';
import { getSupabase } from '../supabase/client';
import { fail, notConfigured, ok, type ServiceResult } from '../types';

import { devActivityLog, devQuestionAttempts, devXpTotal } from './learning/devLearning';

/** Small per-learner totals shown on Home. */
export interface LearnerSummary {
  xp: number;
  /** Consecutive study days as the streak stands today (0 once a day has been missed). */
  streakDays: number;
  /** The longest run of consecutive study days ever (a personal best). */
  longestStreak: number;
  /** Open items in Review Mistakes. */
  openMistakes: number;
  /** Practice answers checked in My Working, across every topic, and how many were correct. */
  practice: { checked: number; correct: number };
}

const ERROR = 'Your learning summary could not be loaded. Please try again.';

async function fromSupabase(userId: string): Promise<ServiceResult<LearnerSummary>> {
  const supabase = getSupabase();
  if (!supabase) return notConfigured('Your learning summary');
  const [profile, mistakes, checked, correct] = await Promise.all([
    supabase
      .from('profiles')
      .select('xp, current_streak, longest_streak, last_active_date')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('v_mistakes_to_review').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('question_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('question_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_correct', true),
  ]);
  const error = profile.error ?? mistakes.error ?? checked.error ?? correct.error;
  if (error) {
    const { code, message } = describeAuthError(error, ERROR);
    return fail(code, code === 'offline' ? message : ERROR, error);
  }
  return ok({
    xp: profile.data?.xp ?? 0,
    // The stored streak only changes when the next activity arrives; show it as it stands today.
    streakDays: effectiveStreak(profile.data?.current_streak ?? 0, profile.data?.last_active_date ?? null),
    longestStreak: profile.data?.longest_streak ?? 0,
    openMistakes: mistakes.count ?? 0,
    practice: { checked: checked.count ?? 0, correct: correct.count ?? 0 },
  });
}

/** Device-only backend: the same totals from this device's records, across every topic. */
async function fromDevice(userId: string): Promise<ServiceResult<LearnerSummary>> {
  const topics = listLearnerTopics();
  const [attempts, activity] = await Promise.all([
    Promise.all(topics.map((t) => devQuestionAttempts.list(userId, t.id))),
    Promise.all(topics.map((t) => devActivityLog.list(userId, t.id))),
  ]);
  const allAttempts = attempts.flatMap((r) => (r.ok ? r.data : []));
  const days = activity.flatMap((r) => (r.ok ? r.data : [])).map((a) => studyDay(new Date(a.occurredAt)));
  return ok({
    xp: await devXpTotal(userId),
    streakDays: streakFromDays(days),
    longestStreak: longestStreakFromDays(days),
    openMistakes: allAttempts.filter((a) => !a.isCorrect && !a.reviewResolvedAt).length,
    practice: { checked: allAttempts.length, correct: allAttempts.filter((a) => a.isCorrect).length },
  });
}

/** XP, streak, open mistakes and practice totals, from the learner's real activity. */
export const learnerSummaryRepository = {
  getSummary(userId: string): Promise<ServiceResult<LearnerSummary>> {
    return isDevAuthBackend ? fromDevice(userId) : fromSupabase(userId);
  },
};
