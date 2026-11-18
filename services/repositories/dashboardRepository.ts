import { DEFAULT_TOPIC_ID, getTopic, listLearnerTopics } from '@/content/registry';
import type { TopicDefinition } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { buildContinueLearning, practiceHref, subtopicHref } from '@/features/learning/navigation';
import { computeTopicProgress, type TopicProgress } from '@/features/learning/progress';
import { MIN_ANSWERS_FOR_ACCURACY } from '@/features/learning/studyDay';
import type { NextAction, RecentActivity } from '@/types/dashboard';

import { fail, ok } from '../types';

import { learnerSummaryRepository } from './learnerSummary';
import { lessonProgressRepository } from './lessonProgress';
import type { DashboardRepository, LessonProgressEntry } from './types';

/**
 * One rule-based suggestion, in priority order. It only uses facts the app
 * records, and returns null when "Continue learning" is already the best step:
 *   1. Open items in Review Mistakes: review them.
 *   2. Fewer than MIN_ANSWERS_FOR_ACCURACY practice answers checked, and the
 *      current topic has practice for a subtopic the learner has worked on:
 *      try that practice.
 */
export function nextAction(
  topic: TopicDefinition,
  progress: TopicProgress,
  summary: { openMistakes: number; practice: { checked: number } },
): NextAction | null {
  if (summary.openMistakes > 0) {
    const n = summary.openMistakes;
    return {
      id: 'review-mistakes',
      title: n === 1 ? 'Review 1 mistake' : `Review ${n} mistakes`,
      reason: 'Going back over a checked answer that was not right yet helps it stick.',
      actionLabel: 'Review now',
      tone: 'coral',
      href: '/mistakes',
    };
  }
  if (summary.practice.checked >= MIN_ANSWERS_FOR_ACCURACY) return null;
  const items = (topic.practiceItems ?? []).filter((item) => isPracticeItemVisible(item));
  const worked = topic.units.filter(
    (u) => progress.subtopics[u.id]?.status !== 'notStarted' && items.some((i) => i.unitId === u.id),
  );
  const unit = worked.find((u) => u.id === progress.currentUnitId) ?? worked[worked.length - 1];
  if (!unit) return null;
  return {
    id: 'try-practice',
    title: `Practise ${unit.title}`,
    reason:
      summary.practice.checked === 0
        ? 'You have started this lesson. Checking a few answers in My Working shows what is clear so far.'
        : 'A few more checked answers and your practice accuracy will appear.',
    actionLabel: 'Start practice',
    tone: 'amber',
    href: practiceHref(topic.id, 'independent', unit.slug),
  };
}

/** Subtopics the learner has actually worked on, most recent first. */
function recentActivities(
  topic: TopicDefinition,
  progress: TopicProgress,
  entries: readonly LessonProgressEntry[],
): RecentActivity[] {
  const latest = new Map<string, string>();
  for (const entry of entries) {
    if (entry.status !== 'completed' || !entry.completedAt) continue;
    const previous = latest.get(entry.unitId);
    if (!previous || entry.completedAt > previous) latest.set(entry.unitId, entry.completedAt);
  }
  return [...latest.entries()]
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .slice(0, 4)
    .flatMap(([unitId, occurredAt]) => {
      const unit = topic.units.find((u) => u.id === unitId);
      const unitProgress = progress.subtopics[unitId];
      if (!unit || !unitProgress) return [];
      return [
        {
          id: unit.id,
          title: unit.title,
          kindLabel: `${topic.title} lesson`,
          glyph: unit.glyph,
          tone: unit.tone,
          result:
            unitProgress.status === 'completed'
              ? ({ type: 'completed' } as const)
              : ({ type: 'score', percent: Math.round(unitProgress.fraction * 100) } as const),
          occurredAt,
          href: subtopicHref(topic.id, unit.slug),
        },
      ];
    });
}

/** The latest completion time among a topic's progress entries (empty string if none). */
const latestCompletion = (entries: readonly LessonProgressEntry[]): string =>
  entries.reduce(
    (latest, e) => (e.status === 'completed' && e.completedAt && e.completedAt > latest ? e.completedAt : latest),
    '',
  );

/**
 * Home dashboard data from real sources: every learner topic's content, the
 * learner's saved lesson progress, and profile totals. "Continue learning"
 * and the next action follow the topic the learner worked on most
 * recently (the default topic for a new learner); recent activity is merged
 * across all topics. Failures are returned (the screen offers a retry)
 * rather than replaced with placeholder numbers.
 */
export const dashboardRepository: DashboardRepository = {
  async getDashboard(userId) {
    const topics = listLearnerTopics();
    const fallback = getTopic(DEFAULT_TOPIC_ID);
    if (!fallback || topics.length === 0)
      return fail('unknown', 'Learning content is missing from this version of the app.');

    const [progressResult, summaryResult] = await Promise.all([
      lessonProgressRepository.listForUnits(
        userId,
        topics.flatMap((t) => t.units.map((u) => u.id)),
      ),
      learnerSummaryRepository.getSummary(userId),
    ]);
    if (!progressResult.ok) return progressResult;
    if (!summaryResult.ok) return summaryResult;

    const perTopic = topics.map((topic) => {
      const unitIds = new Set(topic.units.map((u) => u.id));
      const entries = progressResult.data.filter((e) => unitIds.has(e.unitId));
      return { topic, entries, progress: computeTopicProgress(topic, entries), latest: latestCompletion(entries) };
    });
    const current =
      perTopic.reduce<(typeof perTopic)[number] | null>(
        (best, t) => (t.latest && (!best || t.latest > best.latest) ? t : best),
        null,
      ) ??
      perTopic.find((t) => t.topic.id === fallback.id) ??
      perTopic[0]!;

    return ok({
      continueLearning: buildContinueLearning(current.topic, current.progress),
      stats: {
        streakDays: summaryResult.data.streakDays,
        xp: summaryResult.data.xp,
        practice: summaryResult.data.practice,
      },
      nextAction: nextAction(current.topic, current.progress, summaryResult.data),
      review: { conceptsNeedingAttention: summaryResult.data.openMistakes, href: '/mistakes' },
      recentActivities: perTopic
        .flatMap((t) => recentActivities(t.topic, t.progress, t.entries))
        .sort((x, y) => (x.occurredAt < y.occurredAt ? 1 : -1))
        .slice(0, 4),
      unreadNotifications: 0,
    });
  },
};
