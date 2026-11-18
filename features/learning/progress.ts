/**
 * Progress rules (pure, unit-tested).
 *
 * Opening a screen never counts as progress. A lesson step counts once the
 * learner has worked through it and continued. A subtopic is completed only
 * when every *required* step is completed; required steps that are not yet
 * available (built in a later phase) therefore keep it "In progress" rather
 * than letting it look finished early.
 */
import { remainingSubtopicMinutes } from '@/content/estimate';
import type { LearningUnitDefinition, TopicDefinition } from '@/content/types';
import type { LessonProgressEntry } from '@/services/repositories/types';

export type SubtopicStatus = 'notStarted' | 'inProgress' | 'completed';

export interface SubtopicProgress {
  unitId: string;
  status: SubtopicStatus;
  completedStepKeys: ReadonlySet<string>;
  requiredTotal: number;
  requiredDone: number;
  /** 0–1, share of required steps completed. */
  fraction: number;
  /** First available step not yet completed (where "Continue" goes). */
  nextStepKey: string | null;
  /** Estimated minutes for the steps not yet completed (content/estimate.ts). */
  minutesRemaining: number;
}

export interface TopicProgress {
  /** 0–1 across all required steps of the topic. */
  fraction: number;
  completedSubtopics: number;
  subtopics: Record<string, SubtopicProgress>;
  /** The subtopic to continue: first one not completed, in order. */
  currentUnitId: string | null;
  started: boolean;
  /** Estimated minutes left: the steps not yet completed, in every subtopic (content/estimate.ts). */
  minutesRemaining: number;
}

export function computeSubtopicProgress(
  unit: LearningUnitDefinition,
  entries: readonly LessonProgressEntry[],
): SubtopicProgress {
  const stepKeys = new Set(unit.steps.map((s) => s.key));
  const completed = new Set(
    entries
      .filter((e) => e.unitId === unit.id && e.status === 'completed' && stepKeys.has(e.sectionKey))
      .map((e) => e.sectionKey),
  );
  const required = unit.steps.filter((s) => s.required);
  const requiredDone = required.filter((s) => completed.has(s.key)).length;
  const requiredTotal = required.length;
  const nextStep = unit.steps.find((s) => s.availability.status === 'available' && !completed.has(s.key));

  let status: SubtopicStatus = 'notStarted';
  if (requiredTotal > 0 && requiredDone === requiredTotal) status = 'completed';
  else if (completed.size > 0) status = 'inProgress';

  return {
    unitId: unit.id,
    status,
    completedStepKeys: completed,
    requiredTotal,
    requiredDone,
    fraction: requiredTotal === 0 ? 0 : requiredDone / requiredTotal,
    nextStepKey: nextStep?.key ?? null,
    minutesRemaining: remainingSubtopicMinutes(unit, completed),
  };
}

export function computeTopicProgress(topic: TopicDefinition, entries: readonly LessonProgressEntry[]): TopicProgress {
  const subtopics: Record<string, SubtopicProgress> = {};
  let requiredTotal = 0;
  let requiredDone = 0;
  let minutesRemaining = 0;
  for (const unit of topic.units) {
    const progress = computeSubtopicProgress(unit, entries);
    subtopics[unit.id] = progress;
    requiredTotal += progress.requiredTotal;
    requiredDone += progress.requiredDone;
    minutesRemaining += progress.minutesRemaining;
  }
  const values = Object.values(subtopics);
  const current = topic.units.find((u) => subtopics[u.id]?.status !== 'completed');
  return {
    fraction: requiredTotal === 0 ? 0 : requiredDone / requiredTotal,
    completedSubtopics: values.filter((p) => p.status === 'completed').length,
    subtopics,
    currentUnitId: current?.id ?? null,
    started: values.some((p) => p.status !== 'notStarted'),
    minutesRemaining,
  };
}

// -----------------------------------------------------------------------------
// Current mastery estimate
// -----------------------------------------------------------------------------

/** Evidence from graded work (practice, quiz). Collected from Phase 5 onwards. */
export interface MasteryEvidence {
  attempts: { correct: boolean; hintsUsed: number; independent: boolean; isRetry: boolean }[];
  quizScores: number[];
}

export type MasteryEstimate =
  | { kind: 'insufficientEvidence'; attemptsNeeded: number }
  | { kind: 'estimate'; percent: number; basedOnAttempts: number };

/** Minimum graded attempts before any estimate is shown. */
export const MIN_ATTEMPTS_FOR_ESTIMATE = 10;

/**
 * A rough "current mastery estimate": accuracy weighted towards independent,
 * low-hint attempts, blended with quiz scores. It is a learning-progress
 * indicator, not a measurement of mathematical ability.
 */
export function estimateMastery(evidence: MasteryEvidence): MasteryEstimate {
  const graded = evidence.attempts;
  if (graded.length < MIN_ATTEMPTS_FOR_ESTIMATE) {
    return { kind: 'insufficientEvidence', attemptsNeeded: MIN_ATTEMPTS_FOR_ESTIMATE - graded.length };
  }
  let weighted = 0;
  let weights = 0;
  for (const attempt of graded) {
    const weight = (attempt.independent ? 1 : 0.6) * (attempt.isRetry ? 0.8 : 1);
    const credit = attempt.correct ? Math.max(0.4, 1 - 0.2 * attempt.hintsUsed) : 0;
    weighted += weight * credit;
    weights += weight;
  }
  const practice = weights === 0 ? 0 : weighted / weights;
  const quiz = evidence.quizScores.length
    ? evidence.quizScores.reduce((a, b) => a + b, 0) / evidence.quizScores.length
    : null;
  const blended = quiz === null ? practice : 0.6 * practice + 0.4 * quiz;
  return {
    kind: 'estimate',
    percent: Math.round(Math.min(1, Math.max(0, blended)) * 100),
    basedOnAttempts: graded.length,
  };
}
