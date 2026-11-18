/**
 * Review My Work: the learner's real history in one place (pure, unit-tested).
 * Nothing is invented: a mistake group exists only if the learner has an open
 * mistake of that kind, and with no record every list is empty.
 */
import type { Href } from 'expo-router';

import { answerableItems } from '@/content/registry';
import type { LearningUnitDefinition, PracticeItem, TopicActivity, TopicDefinition } from '@/content/types';
import { activityHref, subtopicHref } from '@/features/learning/navigation';
import { computeTopicProgress } from '@/features/learning/progress';
import type { ArtProjectRecord, GameSessionRecord, QuestionAttemptRecord } from '@/services/repositories/types';

import type { LearnerRecord } from './useLearnerRecord';

export type WorkKind = 'practice' | 'game' | 'explore' | 'create' | 'lesson' | 'reflection' | 'review';
export type WorkStatus = 'correct' | 'incorrect' | 'completed' | 'saved' | 'inProgress' | 'done';

export interface WorkEntry {
  id: string;
  kind: WorkKind;
  /** e.g. "Practised Substitution". */
  title: string;
  detail: string;
  unitId: string | null;
  at: string;
  status: WorkStatus;
  statusLabel: string;
  /** A wrong answer to a question that is still open (not answered correctly since). */
  needsReview?: boolean;
  href?: Href;
}

/** What the learner wrote, as saved by MY WORKING. */
export interface SavedWorking {
  answer: string;
  steps: string[];
  /** The checker's verdict when the answer was checked (newer attempts only). */
  outcome: string | null;
}

export interface QuestionHistory {
  item: PracticeItem;
  unitId: string;
  attempts: QuestionAttemptRecord[];
  last: QuestionAttemptRecord;
  everCorrect: boolean;
  /** Latest answer not correct and not resolved by a later correct one. */
  open: boolean;
  hints: number;
  working: SavedWorking | null;
  /** Where the question lives in its lesson. */
  lessonHref: Href;
}

export interface MistakeGroup {
  id: string;
  title: string;
  description: string;
  questions: QuestionHistory[];
}

export interface LessonHistory {
  unit: LearningUnitDefinition;
  completedSteps: { key: string; title: string; at: string | null }[];
  lastAt: string | null;
  status: 'notStarted' | 'inProgress' | 'completed';
  nextStepKey: string | null;
  nextStepTitle: string | null;
  continueHref: Href;
}

export interface WorkHistory {
  entries: WorkEntry[];
  questions: QuestionHistory[];
  needsReview: MistakeGroup[];
  games: { session: GameSessionRecord; activity: TopicActivity | undefined }[];
  creations: { project: ArtProjectRecord; activity: TopicActivity | undefined }[];
  lessons: LessonHistory[];
  isEmpty: boolean;
}

/** Reads the saved working from an attempt's JSON, tolerating older or partial records. */
export function savedWorking(answer: unknown): SavedWorking | null {
  if (!answer || typeof answer !== 'object') return null;
  const a = answer as { answer?: unknown; steps?: unknown; outcome?: unknown };
  const steps = Array.isArray(a.steps) ? a.steps.filter((s): s is string => typeof s === 'string') : [];
  const text = typeof a.answer === 'string' ? a.answer : '';
  if (!text && steps.length === 0) return null;
  return { answer: text, steps, outcome: typeof a.outcome === 'string' ? a.outcome : null };
}

/** Mistake families by method. Labels describe the method, not a guessed error. */
const FAMILY: Record<string, { id: string; title: string }> = {
  'standard-forms': { id: 'power', title: 'Power rule and standard forms' },
  'u-substitution': { id: 'substitution', title: 'Substitution: choosing u and du' },
  'partial-fractions-linear': { id: 'partial-fractions', title: 'Partial-fraction structure' },
  'partial-fractions-repeated': { id: 'partial-fractions', title: 'Partial-fraction structure' },
  'partial-fractions-quadratic': { id: 'partial-fractions', title: 'Partial-fraction structure' },
  'improper-rational': { id: 'partial-fractions', title: 'Partial-fraction structure' },
  'completing-square': { id: 'algebraic-trig', title: 'Choosing an algebraic or trigonometric substitution' },
  'algebraic-substitution': { id: 'algebraic-trig', title: 'Choosing an algebraic or trigonometric substitution' },
  'fractional-powers': { id: 'algebraic-trig', title: 'Choosing an algebraic or trigonometric substitution' },
  'trig-substitution': { id: 'algebraic-trig', title: 'Choosing an algebraic or trigonometric substitution' },
  'secant-integral': { id: 'algebraic-trig', title: 'Choosing an algebraic or trigonometric substitution' },
  'tan-half-angle': { id: 'algebraic-trig', title: 'Choosing an algebraic or trigonometric substitution' },
  'integration-by-parts': { id: 'parts', title: 'Integration by parts: u, dv and signs' },
  'repeated-parts': { id: 'parts', title: 'Integration by parts: u, dv and signs' },
  'odd-trig-powers': { id: 'trig-strategy', title: 'Trigonometric strategy' },
  'even-trig-powers': { id: 'trig-strategy', title: 'Trigonometric strategy' },
  'product-to-sum': { id: 'trig-strategy', title: 'Trigonometric strategy' },
  'tan-sec-powers': { id: 'trig-strategy', title: 'Trigonometric strategy' },
  'trig-quotient': { id: 'trig-strategy', title: 'Trigonometric strategy' },
};

export const MISSING_CONSTANT = { id: 'missing-constant', title: 'Forgotten + C' } as const;

/** Which review group an open mistake belongs to. */
export function mistakeGroupOf(q: QuestionHistory): { id: string; title: string } {
  if (q.working?.outcome === 'missingConstant') return MISSING_CONSTANT;
  return FAMILY[q.item.technique] ?? { id: `technique-${q.item.technique}`, title: q.item.techniqueLabel };
}

/** The lesson step that shows a practice item (Try it or Practise), for "Retry in the lesson". */
function lessonHrefFor(topic: TopicDefinition, item: PracticeItem): Href {
  const unit = topic.units.find((u) => u.id === item.unitId);
  if (!unit) return { pathname: '/topic/[topicId]', params: { topicId: topic.id } };
  const step = unit.steps.find((s) =>
    s.blocks.some((b) => b.type === 'practiceGroup' && b.items.some((i) => i.id === item.id)),
  );
  return subtopicHref(topic.id, unit.slug, step?.key ?? 'worked-example');
}

const STATUS_LABEL: Record<WorkStatus, string> = {
  correct: 'Correct',
  incorrect: 'Not yet correct',
  completed: 'Completed',
  saved: 'Saved',
  inProgress: 'In progress',
  done: 'Done',
};

export function buildWorkHistory(topic: TopicDefinition, record: LearnerRecord): WorkHistory {
  const items = new Map(answerableItems(topic).map((i) => [i.id, i]));
  const activities = new Map(topic.activities.map((a) => [a.id, a]));
  const unitTitle = (id: string | null | undefined) => topic.units.find((u) => u.id === id)?.title ?? topic.title;
  const entries: WorkEntry[] = [];
  const entry = (e: Omit<WorkEntry, 'statusLabel'>) => entries.push({ ...e, statusLabel: STATUS_LABEL[e.status] });

  // Practice: one entry per checked answer, and a history per question.
  const byQuestion = new Map<string, QuestionAttemptRecord[]>();
  for (const a of record.attempts) {
    const item = items.get(a.questionId);
    const unitId = a.unitId ?? item?.unitId ?? null;
    entry({
      id: `attempt-${a.id}`,
      kind: 'practice',
      title: `Practised ${unitTitle(unitId)}`,
      detail: item
        ? `${item.techniqueLabel}${a.hintsUsed ? ` · ${a.hintsUsed} ${a.hintsUsed === 1 ? 'hint' : 'hints'}` : ''}`
        : 'Practice question',
      unitId,
      at: a.answeredAt,
      status: a.isCorrect ? 'correct' : 'incorrect',
      ...(item ? { href: lessonHrefFor(topic, item) } : {}),
    });
    byQuestion.set(a.questionId, [...(byQuestion.get(a.questionId) ?? []), a]);
  }
  const questions: QuestionHistory[] = [];
  for (const [id, list] of byQuestion) {
    const item = items.get(id);
    if (!item) continue;
    const attempts = [...list].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    const last = attempts[attempts.length - 1] as QuestionAttemptRecord;
    questions.push({
      item,
      unitId: item.unitId,
      attempts,
      last,
      everCorrect: attempts.some((a) => a.isCorrect),
      open: !last.isCorrect && !last.reviewResolvedAt,
      hints: attempts.reduce((n, a) => n + a.hintsUsed, 0),
      working: savedWorking(last.learnerAnswer),
      lessonHref: lessonHrefFor(topic, item),
    });
  }
  questions.sort((a, b) => b.last.answeredAt.localeCompare(a.last.answeredAt));
  const openIds = new Set(questions.filter((q) => q.open).map((q) => q.item.id));
  for (const e of entries) {
    const attempt = record.attempts.find((a) => `attempt-${a.id}` === e.id);
    if (attempt && !attempt.isCorrect && openIds.has(attempt.questionId)) e.needsReview = true;
  }

  // Needs review: open mistakes, grouped; groups only appear when they have questions.
  const groups = new Map<string, MistakeGroup>();
  for (const q of questions.filter((x) => x.open)) {
    const g = mistakeGroupOf(q);
    const group = groups.get(g.id) ?? {
      id: g.id,
      title: g.title,
      description:
        g.id === MISSING_CONSTANT.id
          ? 'The anti-derivative was right, but the constant of integration was missing.'
          : 'Questions on this method that you have not yet answered correctly.',
      questions: [],
    };
    group.questions.push(q);
    groups.set(g.id, group);
  }
  const needsReview = [...groups.values()].sort((a, b) => b.questions.length - a.questions.length);

  // Games
  const games = [...record.games]
    .sort((a, b) => (b.endedAt ?? b.startedAt).localeCompare(a.endedAt ?? a.startedAt))
    .map((session) => ({ session, activity: activities.get(session.gameId) }));
  for (const { session, activity } of games) {
    entry({
      id: `game-${session.id}`,
      kind: 'game',
      title: `Played ${activity?.title ?? 'a game'}`,
      detail: `Score ${session.score} · ${session.xpEarned} XP`,
      unitId: activity?.unitId ?? null,
      at: session.endedAt ?? session.startedAt,
      status: session.completed ? 'completed' : 'inProgress',
      ...(activity ? { href: activityHref(topic.id, activity.id) } : {}),
    });
  }

  // Create
  const creations = record.art.map((project) => ({ project, activity: activities.get(project.activityId) }));
  for (const { project, activity } of creations) {
    entry({
      id: `art-${project.id}`,
      kind: 'create',
      title: `Saved ${activity?.title ?? 'a'} project`,
      detail: `“${project.title}”`,
      unitId: activity?.unitId ?? null,
      at: project.updatedAt,
      status: project.isCompleted ? 'completed' : 'saved',
      ...(activity ? { href: activityHref(topic.id, activity.id, project.id) } : {}),
    });
  }

  // Explore, reflections and reviews from the activity log (games are already listed from their sessions).
  for (const a of record.activity) {
    if (a.type === 'explore') {
      const activity = a.refId ? activities.get(a.refId) : undefined;
      entry({
        id: `explore-${a.id}`,
        kind: 'explore',
        title: `Explored ${activity?.title ?? 'a tool'}`,
        detail: unitTitle(activity?.unitId),
        unitId: activity?.unitId ?? null,
        at: a.occurredAt,
        status: 'done',
        ...(activity ? { href: activityHref(topic.id, activity.id) } : {}),
      });
    } else if (a.type === 'reflection' || a.type === 'review') {
      const unit = topic.units.find((u) => u.id === a.refId);
      entry({
        id: `${a.type}-${a.id}`,
        kind: a.type,
        title: `${a.type === 'reflection' ? 'Reflected on' : 'Reviewed'} ${unit?.title ?? topic.title}`,
        detail: a.summary ?? '',
        unitId: unit?.id ?? null,
        at: a.occurredAt,
        status: 'done',
        ...(unit ? { href: subtopicHref(topic.id, unit.slug, a.type === 'reflection' ? 'reflect' : 'review') } : {}),
      });
    }
  }

  // Lessons
  const progress = computeTopicProgress(topic, record.lessons);
  const lessons: LessonHistory[] = topic.units.map((unit) => {
    const p = progress.subtopics[unit.id];
    const done = record.lessons.filter((l) => l.unitId === unit.id && l.status === 'completed');
    const completedSteps = unit.steps
      .filter((s) => done.some((d) => d.sectionKey === s.key))
      .map((s) => ({ key: s.key, title: s.title, at: done.find((d) => d.sectionKey === s.key)?.completedAt ?? null }));
    for (const s of completedSteps) {
      entry({
        id: `lesson-${unit.id}-${s.key}`,
        kind: 'lesson',
        title: `Completed “${s.title}”`,
        detail: unit.title,
        unitId: unit.id,
        at: s.at ?? '',
        status: 'completed',
        href: subtopicHref(topic.id, unit.slug, s.key),
      });
    }
    const next = unit.steps.find((s) => s.key === p?.nextStepKey);
    return {
      unit,
      completedSteps,
      lastAt:
        completedSteps
          .map((s) => s.at)
          .filter((d): d is string => !!d)
          .sort()
          .at(-1) ?? null,
      status: p?.status ?? 'notStarted',
      nextStepKey: p?.nextStepKey ?? null,
      nextStepTitle: next?.title ?? null,
      continueHref: subtopicHref(topic.id, unit.slug, p?.nextStepKey ?? undefined),
    };
  });

  const dated = entries.filter((e) => e.at !== '').sort((a, b) => b.at.localeCompare(a.at));
  return {
    entries: dated,
    questions,
    needsReview,
    games,
    creations,
    lessons,
    isEmpty: dated.length === 0,
  };
}

export type KindFilter = 'all' | 'practice' | 'game' | 'explore' | 'create' | 'lesson';
export type StatusFilter = 'any' | 'review' | 'completed' | 'recent';

export interface WorkFilter {
  kind: KindFilter;
  unitId: string | null;
  status: StatusFilter;
}

export const DEFAULT_FILTER: WorkFilter = { kind: 'all', unitId: null, status: 'any' };

/** Practice questions matching the subtopic and status filters. */
export function filterQuestions(
  questions: readonly QuestionHistory[],
  filter: WorkFilter,
  now: Date = new Date(),
): QuestionHistory[] {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return questions.filter(
    (q) =>
      (!filter.unitId || q.unitId === filter.unitId) &&
      (filter.status !== 'review' || q.open) &&
      (filter.status !== 'completed' || q.everCorrect) &&
      (filter.status !== 'recent' || q.last.answeredAt >= weekAgo),
  );
}

/** Entries matching the chosen type, subtopic and status ("recent" = the last 7 days). */
export function filterEntries(entries: readonly WorkEntry[], filter: WorkFilter, now: Date = new Date()): WorkEntry[] {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return entries.filter((e) => {
    if (filter.kind !== 'all' && e.kind !== filter.kind) return false;
    if (filter.unitId && e.unitId !== filter.unitId) return false;
    if (filter.status === 'review' && !e.needsReview) return false;
    if (filter.status === 'completed' && !['completed', 'correct', 'done'].includes(e.status)) return false;
    if (filter.status === 'recent' && e.at < weekAgo) return false;
    return true;
  });
}
