/**
 * In-app notifications, derived only from the learner's real record (pure and
 * unit-tested). Nothing is pushed to the phone and nothing is invented: each
 * notification comes from a dated event or a simple rule, and its id is
 * stable, so read and dismissed states persist until the underlying facts
 * change (for example, a new mistake makes a new review notification).
 */
import type { Href } from 'expo-router';

import type { TopicDefinition } from '@/content/types';
import { activityHref, subtopicHref } from '@/features/learning/navigation';
import type { ProgressReport } from '@/features/insights/progressReport';
import type { LearnerRecord } from '@/features/insights/useLearnerRecord';

export type NotificationKind =
  'reminder' | 'inactivity' | 'review' | 'weakArea' | 'achievement' | 'savedWork' | 'newActivity';

/** The three settings learners can turn off. */
export type NotificationCategory = 'learning' | 'review' | 'achievement';

export const CATEGORY_OF: Record<NotificationKind, NotificationCategory> = {
  reminder: 'learning',
  inactivity: 'learning',
  savedWork: 'learning',
  newActivity: 'learning',
  review: 'review',
  weakArea: 'review',
  achievement: 'achievement',
};

export const KIND_LABEL: Record<NotificationKind, string> = {
  reminder: 'Learning reminder',
  inactivity: 'Inactivity reminder',
  review: 'Recommended review',
  weakArea: 'Weak-area suggestion',
  achievement: 'Achievement',
  savedWork: 'Saved work',
  newActivity: 'New activity',
};

export interface LearnerNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** When the underlying event happened (ISO). */
  at: string;
  href: Href;
}

export interface NotificationSettings {
  learning: boolean;
  review: boolean;
  achievement: boolean;
}

export const DEFAULT_SETTINGS: NotificationSettings = { learning: true, review: true, achievement: true };

/** Days without any recorded learning before an inactivity reminder. */
export const INACTIVE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const latest = (dates: (string | null | undefined)[]) =>
  dates
    .filter((d): d is string => typeof d === 'string' && d.length > 0)
    .sort()
    .at(-1) ?? null;

export function deriveNotifications(
  topic: TopicDefinition,
  record: LearnerRecord,
  report: ProgressReport,
  now: Date = new Date(),
): LearnerNotification[] {
  const out: LearnerNotification[] = [];
  if (report.isEmpty) return out;

  for (const s of report.subtopics) {
    const unitLessons = record.lessons.filter((l) => l.unitId === s.unit.id && l.status === 'completed');
    const lessonAt = latest(unitLessons.map((l) => l.completedAt));

    // Learning reminder: a lesson started but not finished.
    if (s.lesson.status === 'inProgress' && lessonAt) {
      const next = s.unit.steps.find((st) => st.key === s.lesson.nextStepKey);
      out.push({
        id: `unfinished-${s.unit.id}-${s.lesson.requiredDone}`,
        kind: 'reminder',
        title: `Unfinished lesson: ${s.unit.title}`,
        body: `${s.lesson.requiredDone} of ${s.lesson.requiredTotal} required steps done.${next ? ` Continue with “${next.title}”.` : ''}`,
        at: lessonAt,
        href: subtopicHref(topic.id, s.unit.slug, s.lesson.nextStepKey ?? undefined),
      });
    }

    // Achievement: a subtopic completed.
    if (s.lesson.status === 'completed' && lessonAt) {
      out.push({
        id: `completed-${s.unit.id}`,
        kind: 'achievement',
        title: `You completed ${s.unit.title}`,
        body: 'Every required lesson step is done.',
        at: lessonAt,
        href: subtopicHref(topic.id, s.unit.slug),
      });
    }

    // Review: open mistakes in this subtopic.
    if (s.openMistakes > 0) {
      const openAt = latest(
        record.attempts
          .filter((a) => !a.isCorrect && !a.reviewResolvedAt && a.unitId === s.unit.id)
          .map((a) => a.answeredAt),
      );
      if (openAt) {
        out.push({
          id: `review-${s.unit.id}-${s.openMistakes}`,
          kind: 'review',
          title: `Practice to review in ${s.unit.title}`,
          body: `You have ${s.openMistakes} ${s.openMistakes === 1 ? 'question' : 'questions'} in ${s.unit.title} that you have not answered correctly yet.`,
          at: openAt,
          href: { pathname: '/my-work', params: { filter: 'review', unit: s.unit.id, topic: topic.id } },
        });
      }
    }

    // Weak area: many hints in a subtopic → its Explore tool.
    const tool = topic.activities.find((a) => a.unitId === s.unit.id && a.kind === 'lab');
    if (tool && s.practice.attempts >= 3 && s.practice.hints / s.practice.attempts >= 1.5) {
      const lastAttempt = latest(record.attempts.filter((a) => a.unitId === s.unit.id).map((a) => a.answeredAt));
      if (lastAttempt) {
        out.push({
          id: `hints-${s.unit.id}-${s.practice.attempts}`,
          kind: 'weakArea',
          title: `Lots of hints in ${s.unit.title}`,
          body: `You used ${s.practice.hints} hints in ${s.practice.attempts} answers. Try ${tool.title} to see the idea step by step.`,
          at: lastAttempt,
          href: activityHref(topic.id, tool.id),
        });
      }
    }

    // New activity: the subtopic is under way, but its game or Explore tool is untried.
    if (s.lesson.status !== 'notStarted' && lessonAt) {
      const untried = topic.activities.filter(
        (a) =>
          a.unitId === s.unit.id &&
          a.availability.status === 'available' &&
          ((a.kind === 'game' && !record.games.some((g) => g.gameId === a.id)) ||
            (a.kind === 'lab' && !record.activity.some((e) => e.type === 'explore' && e.refId === a.id))),
      );
      const first = untried[0];
      if (first) {
        out.push({
          id: `new-${s.unit.id}-${first.id}`,
          kind: 'newActivity',
          title: `Try ${first.title}`,
          body: `${first.kind === 'game' ? 'A game' : 'An Explore tool'} for ${s.unit.title} that you have not tried yet.`,
          at: lessonAt,
          href: activityHref(topic.id, first.id),
        });
      }
    }
  }

  // Achievement: the whole topic.
  if (
    report.completion.completedSubtopics === report.completion.totalSubtopics &&
    report.completion.totalSubtopics > 0
  ) {
    const at = latest(record.lessons.map((l) => l.completedAt));
    if (at) {
      out.push({
        id: `completed-topic-${topic.id}`,
        kind: 'achievement',
        title: `You completed all ${report.completion.totalSubtopics} ${topic.title} subtopics`,
        body: 'Every required lesson step in the topic is done.',
        at,
        href: { pathname: '/topic/[topicId]', params: { topicId: topic.id } },
      });
    }
  }

  // Achievement: a game finished for the first time.
  for (const g of report.games) {
    const first = record.games
      .filter((s) => s.gameId === g.activity.id && s.completed)
      .sort((a, b) => (a.endedAt ?? a.startedAt).localeCompare(b.endedAt ?? b.startedAt))[0];
    if (first) {
      out.push({
        id: `game-finished-${g.activity.id}`,
        kind: 'achievement',
        title: `You finished ${g.activity.title}`,
        body: `First completed with ${first.score} points.`,
        at: first.endedAt ?? first.startedAt,
        href: activityHref(topic.id, g.activity.id),
      });
    }
  }

  // Saved work: projects saved but not yet completed; completed projects as achievements.
  const activities = new Map(topic.activities.map((a) => [a.id, a]));
  for (const p of record.art) {
    const activity = activities.get(p.activityId);
    if (!activity) continue;
    out.push(
      p.isCompleted
        ? {
            id: `art-completed-${p.id}`,
            kind: 'achievement',
            title: `Completed: ${activity.title}`,
            body: `“${p.title}” is saved and its mathematics explained.`,
            at: p.updatedAt,
            href: activityHref(topic.id, activity.id, p.id),
          }
        : {
            id: `art-saved-${p.id}`,
            kind: 'savedWork',
            title: `Your ${activity.title} project was saved`,
            body: `“${p.title}” is not finished yet. Explain the mathematics in Math behind my art to complete it.`,
            at: p.updatedAt,
            href: activityHref(topic.id, activity.id, p.id),
          },
    );
  }

  // Inactivity: nothing recorded for a few days.
  if (report.lastActiveAt) {
    const idle = now.getTime() - new Date(report.lastActiveAt).getTime();
    if (idle >= INACTIVE_DAYS * DAY_MS) {
      const days = Math.floor(idle / DAY_MS);
      const next = report.recommendations[0];
      out.push({
        id: `inactive-${report.lastActiveAt.slice(0, 10)}`,
        kind: 'inactivity',
        title: `It has been ${days} days since you last studied`,
        body: next ? `Pick up where you left off: ${next.title}.` : 'Pick up where you left off.',
        at: new Date(new Date(report.lastActiveAt).getTime() + INACTIVE_DAYS * DAY_MS).toISOString(),
        href: next?.href ?? { pathname: '/topic/[topicId]', params: { topicId: topic.id } },
      });
    }
  }

  return out.sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Notifications for every topic the learner has studied, newest first, with
 * duplicate ids removed. Inactivity is judged across all topics: a reminder
 * appears only when nothing at all has been recorded for a few days, and it
 * points to the topic studied most recently.
 */
export function deriveAllNotifications(
  entries: readonly { topic: TopicDefinition; record: LearnerRecord; report: ProgressReport }[],
  now: Date = new Date(),
): LearnerNotification[] {
  const lastActive = (e: (typeof entries)[number]) => e.report.lastActiveAt ?? '';
  const mostRecent = [...entries].sort((a, b) => lastActive(b).localeCompare(lastActive(a)))[0];
  const seen = new Set<string>();
  const out: LearnerNotification[] = [];
  for (const entry of entries) {
    for (const n of deriveNotifications(entry.topic, entry.record, entry.report, now)) {
      if (n.kind === 'inactivity' && entry !== mostRecent) continue;
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      out.push(n);
    }
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

/** The notifications to show, after the learner's settings and dismissals. */
export function visibleNotifications(
  all: readonly LearnerNotification[],
  settings: NotificationSettings,
  dismissed: ReadonlySet<string>,
): LearnerNotification[] {
  return all.filter((n) => settings[CATEGORY_OF[n.kind]] && !dismissed.has(n.id));
}

export type NotificationGroupId = 'today' | 'yesterday' | 'earlier';

export const GROUP_TITLE: Record<NotificationGroupId, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
};

/** Groups notifications (already newest first) into Today, Yesterday and Earlier by local date; empty groups are left out. */
export function groupNotificationsByDay(
  items: readonly LearnerNotification[],
  now: Date = new Date(),
): { id: NotificationGroupId; items: LearnerNotification[] }[] {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOfDay(now);
  const yesterday = startOfDay(new Date(today - 12 * 60 * 60 * 1000));
  const groups: Record<NotificationGroupId, LearnerNotification[]> = { today: [], yesterday: [], earlier: [] };
  for (const item of items) {
    const at = new Date(item.at).getTime();
    groups[at >= today ? 'today' : at >= yesterday ? 'yesterday' : 'earlier'].push(item);
  }
  return (['today', 'yesterday', 'earlier'] as const)
    .filter((id) => groups[id].length > 0)
    .map((id) => ({ id, items: groups[id] }));
}
