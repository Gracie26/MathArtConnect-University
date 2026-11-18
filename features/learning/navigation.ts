import type { TopicDefinition } from '@/content/types';
import type { ContinueLearning } from '@/types/dashboard';

import type { TopicProgress } from './progress';

export const topicHref = (topicId: string) => ({ pathname: '/topic/[topicId]', params: { topicId } }) as const;

/** A section of the course notes, e.g. 1.6.1, inside its subtopic. */
export const sectionHref = (topicId: string, sectionId: string) =>
  ({ pathname: '/topic/[topicId]/section/[sectionId]', params: { topicId, sectionId } }) as const;

/** An Explore tool, game or Create activity; `project` reopens a saved Create project. */
export const activityHref = (topicId: string, activityId: string, project?: string) =>
  ({
    pathname: '/topic/[topicId]/activity/[activityId]',
    params: project ? { topicId, activityId, project } : { topicId, activityId },
  }) as const;

/**
 * Practice for a mode, optionally narrowed to one subtopic (unit slug) and to
 * one source: the chapter's own exercises or the tutorial.
 */
export const practiceHref = (topicId: string, mode: string, unit?: string, source?: string) =>
  ({
    pathname: '/topic/[topicId]/practice',
    params: { topicId, mode, ...(unit ? { unit } : {}), ...(source ? { source } : {}) },
  }) as const;

export const subtopicHref = (topicId: string, slug: string, stepKey?: string) =>
  ({
    pathname: '/topic/[topicId]/[subtopicId]',
    params: stepKey ? { topicId, subtopicId: slug, step: stepKey } : { topicId, subtopicId: slug },
  }) as const;

/**
 * "Continue learning" target from real progress: the first subtopic that is
 * not completed, opened at its next unfinished step.
 */
export function buildContinueLearning(topic: TopicDefinition, progress: TopicProgress): ContinueLearning | null {
  const unit = topic.units.find((u) => u.id === progress.currentUnitId) ?? topic.units[0];
  if (!unit) return null;
  const subtopic = progress.subtopics[unit.id];
  const nextStep = subtopic?.nextStepKey ?? undefined;
  return {
    subject: topic.title,
    topicTitle: unit.title,
    summary: unit.summary,
    progress: progress.fraction,
    isStarted: progress.started,
    ...(subtopic ? { minutesLeft: subtopic.minutesRemaining } : {}),
    href: subtopicHref(topic.id, unit.slug, nextStep),
  };
}
