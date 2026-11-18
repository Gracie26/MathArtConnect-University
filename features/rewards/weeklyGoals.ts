/**
 * Optional weekly goals, derived from the learner's real record (pure and
 * unit-tested). A week runs Monday to Sunday in study days (the server's
 * Africa/Windhoek day, see features/learning/studyDay.ts), so goals reset by
 * themselves every Monday; nothing is stored, nothing is lost, and a missed
 * goal is never shown as a failure: last week is only shown for comparison.
 *
 * What counts:
 *   practice sessions   study days this week with at least one checked practice answer
 *                       (separate days, in line with spaced practice; several answers on one
 *                       day are one session)
 *   mistakes put right  practice answers, wrong at first, answered correctly again this week
 *   Explore tools       Explore tools completed this week (each tool counts once a day)
 *   reflections         reflections saved this week
 */
import type { LearnerRecord } from '@/features/insights/useLearnerRecord';
import { previousStudyDay, studyDay } from '@/features/learning/studyDay';

export type WeeklyGoalId = 'practice' | 'mistakes' | 'explore' | 'reflection';

export interface WeeklyGoal {
  id: WeeklyGoalId;
  title: string;
  target: number;
  done: number;
  /** The same count last week (for a personal comparison, never a penalty). */
  lastWeek: number;
  /** e.g. "practice sessions". */
  unit: [string, string];
}

export const WEEKLY_TARGETS: Record<WeeklyGoalId, number> = { practice: 3, mistakes: 2, explore: 2, reflection: 1 };

const TITLES: Record<WeeklyGoalId, { title: string; unit: [string, string] }> = {
  practice: { title: 'Practice sessions', unit: ['practice session', 'practice sessions'] },
  mistakes: { title: 'Mistakes put right', unit: ['mistake put right', 'mistakes put right'] },
  explore: { title: 'Explore tools', unit: ['Explore tool', 'Explore tools'] },
  reflection: { title: 'Reflections', unit: ['reflection', 'reflections'] },
};

/** The Monday (YYYY-MM-DD) of the study week containing `day`. */
export function weekStart(day: string): string {
  let d = day;
  // 2026-10-19 is a Monday; getUTCDay at noon gives the weekday safely.
  for (let i = 0; i < 7; i++) {
    if (new Date(`${d}T12:00:00Z`).getUTCDay() === 1) return d;
    d = previousStudyDay(d);
  }
  return d;
}

const weekOf = (iso: string) => weekStart(studyDay(new Date(iso)));

/** The weekly goals for the week containing `now`, with last week's counts beside them. */
export function weeklyGoals(records: readonly LearnerRecord[], now: Date = new Date()): WeeklyGoal[] {
  const thisWeek = weekStart(studyDay(now));
  const lastWeek = weekStart(previousStudyDay(thisWeek));
  const attempts = records.flatMap((r) => r.attempts);
  const activity = records.flatMap((r) => r.activity);

  const count = (week: string): Record<WeeklyGoalId, number> => ({
    practice: new Set(
      attempts.filter((a) => weekOf(a.answeredAt) === week).map((a) => studyDay(new Date(a.answeredAt))),
    ).size,
    mistakes: attempts.filter((a) => a.reviewResolvedAt && weekOf(a.reviewResolvedAt) === week).length,
    explore: activity.filter((a) => a.type === 'explore' && weekOf(a.occurredAt) === week).length,
    reflection: activity.filter((a) => a.type === 'reflection' && weekOf(a.occurredAt) === week).length,
  });
  const now_ = count(thisWeek);
  const before = count(lastWeek);
  return (Object.keys(WEEKLY_TARGETS) as WeeklyGoalId[]).map((id) => ({
    id,
    title: TITLES[id].title,
    unit: TITLES[id].unit,
    target: WEEKLY_TARGETS[id],
    done: now_[id],
    lastWeek: before[id],
  }));
}

export const goalMet = (g: WeeklyGoal): boolean => g.done >= g.target;

/** A short, encouraging line for the goal closest to completion (never guilt-based). */
export function weeklyNudge(goals: readonly WeeklyGoal[]): string {
  const open = goals.filter((g) => !goalMet(g));
  if (open.length === 0) return 'Every weekly goal is complete this week.';
  const closest = [...open].sort((a, b) => a.target - a.done - (b.target - b.done))[0]!;
  const left = closest.target - closest.done;
  return `${left} more ${left === 1 ? closest.unit[0] : closest.unit[1]} to complete this week’s ${closest.title.toLowerCase()} goal.`;
}
