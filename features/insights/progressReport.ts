/**
 * The learner's progress report, built only from their real record (pure and
 * unit-tested). Each kind of evidence is kept separate rather than mixed into
 * one "mastery" number:
 *
 *   Completion          required lesson steps the learner worked through and continued past
 *   Practice            checked answers (accuracy, hints, retries) by subtopic and method
 *   Games               completed game sessions
 *   Explore / Create    Explore tools used, Create projects saved
 *   Confidence          the learner's own Reflect ratings, shown on their own, never used above
 *
 * Opening a screen never counts. With no record, every list is empty.
 */
import type { Href } from 'expo-router';

import { answerableItems } from '@/content/registry';
import type { LearningUnitDefinition, PracticeItem, TopicActivity, TopicDefinition } from '@/content/types';
import { activityHref, subtopicHref } from '@/features/learning/navigation';
import { computeTopicProgress, type SubtopicProgress } from '@/features/learning/progress';
import type { QuestionAttemptRecord } from '@/services/repositories/types';

import type { LearnerRecord } from './useLearnerRecord';

/** Fewer checked answers than this and no accuracy-based judgement is made. */
export const MIN_ATTEMPTS_FOR_JUDGEMENT = 3;
/** Per group, at least this many answers before an improvement trend is shown. */
export const MIN_ATTEMPTS_FOR_TREND = 4;
export const STRONG_ACCURACY = 0.8;
export const WEAK_ACCURACY = 0.5;

export type Standing = 'notStarted' | 'needsAttention' | 'onTrack' | 'strong';

export interface PracticeStats {
  /** Checked answers (each attempt counts). */
  attempts: number;
  /** Different questions answered. */
  questions: number;
  correct: number;
  incorrect: number;
  /** Share of checked answers that were correct; null with no answers. */
  accuracy: number | null;
  hints: number;
}

export interface SubtopicReport {
  unit: LearningUnitDefinition;
  lesson: SubtopicProgress;
  practice: PracticeStats;
  gameSessions: number;
  bestGameScore: number | null;
  openMistakes: number;
  lastStudied: string | null;
  standing: Standing;
  /** Why the standing was given, in words. */
  standingReason: string;
}

export interface TechniqueReport extends PracticeStats {
  technique: string;
  label: string;
}

export interface GameReport {
  activity: TopicActivity;
  sessions: number;
  completed: number;
  bestScore: number | null;
  latestScore: number | null;
  levelReached: number | null;
  xp: number;
  lastPlayed: string | null;
}

export interface Improvement {
  id: string;
  label: string;
  from: number;
  to: number;
  attempts: number;
  text: string;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  actionLabel: string;
  href: Href;
}

export interface ActivityDay {
  /** Local date, YYYY-MM-DD. */
  date: string;
  count: number;
}

export interface ProgressReport {
  isEmpty: boolean;
  completion: {
    fraction: number;
    completedSubtopics: number;
    totalSubtopics: number;
    requiredStepsDone: number;
    requiredStepsTotal: number;
    stepsCompleted: number;
  };
  counts: {
    lessonsCompleted: number;
    practiceQuestions: number;
    practiceAttempts: number;
    gamesCompleted: number;
    exploreDone: number;
    exploreTotal: number;
    createSaved: number;
    createCompleted: number;
  };
  subtopics: SubtopicReport[];
  practice: PracticeStats & {
    /** Questions answered wrongly at first and correctly later. */
    retry: { wrongFirst: number; laterCorrect: number };
    byTechnique: TechniqueReport[];
  };
  games: GameReport[];
  explore: { activity: TopicActivity; done: boolean; lastAt: string | null }[];
  create: { activity: TopicActivity; projects: number; completed: number; lastAt: string | null }[];
  improvements: Improvement[];
  /** The last 14 days, oldest first. */
  activityDays: ActivityDay[];
  activeDaysLast7: number;
  lastActiveAt: string | null;
  /** The learner's own Reflect confidence ratings (1–5); shown separately, never used for progress. */
  confidence: { ratings: number; average: number | null };
  recommendations: Recommendation[];
}

const pct = (x: number) => Math.round(x * 100);

export function practiceStats(attempts: readonly QuestionAttemptRecord[]): PracticeStats {
  const correct = attempts.filter((a) => a.isCorrect).length;
  return {
    attempts: attempts.length,
    questions: new Set(attempts.map((a) => a.questionId)).size,
    correct,
    incorrect: attempts.length - correct,
    accuracy: attempts.length === 0 ? null : correct / attempts.length,
    hints: attempts.reduce((n, a) => n + a.hintsUsed, 0),
  };
}

const latest = (dates: (string | null | undefined)[]): string | null =>
  dates
    .filter((d): d is string => typeof d === 'string' && d.length > 0)
    .sort()
    .at(-1) ?? null;

/** Local calendar date of an ISO timestamp, as YYYY-MM-DD. */
export function localDay(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Every dated thing the learner did, for "recent learning activity". */
export function activityTimestamps(record: LearnerRecord): string[] {
  return [
    ...record.lessons.map((l) => l.completedAt),
    ...record.attempts.map((a) => a.answeredAt),
    ...record.games.map((g) => g.endedAt ?? g.startedAt),
    ...record.art.map((p) => p.updatedAt),
    ...record.activity.map((a) => a.occurredAt),
  ].filter((d): d is string => typeof d === 'string' && d.length > 0);
}

function standingFor(
  lesson: SubtopicProgress,
  practice: PracticeStats,
  openMistakes: number,
  started: boolean,
): { standing: Standing; reason: string } {
  if (!started) return { standing: 'notStarted', reason: 'Not started yet.' };
  const judged = practice.attempts >= MIN_ATTEMPTS_FOR_JUDGEMENT && practice.accuracy !== null;
  if (judged && (practice.accuracy as number) < WEAK_ACCURACY) {
    return {
      standing: 'needsAttention',
      reason: `${pct(practice.accuracy as number)}% of ${practice.attempts} checked answers were correct.`,
    };
  }
  if (openMistakes >= 2) {
    return { standing: 'needsAttention', reason: `${openMistakes} mistakes are waiting to be reviewed.` };
  }
  if (lesson.status === 'completed' && judged && (practice.accuracy as number) >= STRONG_ACCURACY) {
    return {
      standing: 'strong',
      reason: `Lesson complete and ${pct(practice.accuracy as number)}% of ${practice.attempts} checked answers correct.`,
    };
  }
  if (!judged) {
    return {
      standing: 'onTrack',
      reason:
        practice.attempts === 0
          ? 'No practice answers checked yet.'
          : `Only ${practice.attempts} checked ${practice.attempts === 1 ? 'answer' : 'answers'} so far: not enough to judge accuracy.`,
    };
  }
  return {
    standing: 'onTrack',
    reason: `${pct(practice.accuracy as number)}% of ${practice.attempts} checked answers correct.`,
  };
}

/** Accuracy in the earlier half of a group's answers versus the later half. */
function trend(id: string, label: string, attempts: readonly QuestionAttemptRecord[]): Improvement | null {
  if (attempts.length < MIN_ATTEMPTS_FOR_TREND) return null;
  const sorted = [...attempts].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
  const half = Math.floor(sorted.length / 2);
  const early = practiceStats(sorted.slice(0, half)).accuracy ?? 0;
  const late = practiceStats(sorted.slice(half)).accuracy ?? 0;
  if (late - early < 0.1) return null;
  return {
    id,
    label,
    from: pct(early),
    to: pct(late),
    attempts: sorted.length,
    text: `${label} accuracy improved from ${pct(early)}% to ${pct(late)}% over your last ${sorted.length} answers.`,
  };
}

export function buildProgressReport(
  topic: TopicDefinition,
  record: LearnerRecord,
  now: Date = new Date(),
): ProgressReport {
  const items = new Map(answerableItems(topic).map((i) => [i.id, i]));
  const itemOf = (a: QuestionAttemptRecord): PracticeItem | undefined => items.get(a.questionId);
  const unitOfAttempt = (a: QuestionAttemptRecord) => a.unitId ?? itemOf(a)?.unitId ?? null;
  const activityById = new Map(topic.activities.map((a) => [a.id, a]));
  const topicProgress = computeTopicProgress(topic, record.lessons);
  const exploredIds = new Set(record.activity.filter((a) => a.type === 'explore').map((a) => a.refId));

  // Subtopics
  const subtopics: SubtopicReport[] = topic.units.map((unit) => {
    const lesson = topicProgress.subtopics[unit.id] as SubtopicProgress;
    const attempts = record.attempts.filter((a) => unitOfAttempt(a) === unit.id);
    const practice = practiceStats(attempts);
    const unitGames = record.games.filter((g) => activityById.get(g.gameId)?.unitId === unit.id);
    const unitActivities = topic.activities.filter((a) => a.unitId === unit.id);
    const unitActivityIds = new Set(unitActivities.map((a) => a.id));
    const openMistakes = new Set(
      attempts
        .filter((a) => !a.isCorrect && !a.reviewResolvedAt)
        .filter(
          (a) => !attempts.some((b) => b.questionId === a.questionId && b.isCorrect && b.answeredAt > a.answeredAt),
        )
        .map((a) => a.questionId),
    ).size;
    const lastStudied = latest([
      ...record.lessons.filter((l) => l.unitId === unit.id).map((l) => l.completedAt),
      ...attempts.map((a) => a.answeredAt),
      ...unitGames.map((g) => g.endedAt ?? g.startedAt),
      ...record.art.filter((p) => unitActivityIds.has(p.activityId)).map((p) => p.updatedAt),
      ...record.activity
        .filter((a) => (a.refId !== null && unitActivityIds.has(a.refId)) || a.refId === unit.id)
        .map((a) => a.occurredAt),
    ]);
    const started =
      lesson.status !== 'notStarted' || practice.attempts > 0 || unitGames.length > 0 || lastStudied !== null;
    const { standing, reason } = standingFor(lesson, practice, openMistakes, started);
    return {
      unit,
      lesson,
      practice,
      gameSessions: unitGames.length,
      bestGameScore: unitGames.length ? Math.max(...unitGames.map((g) => g.score)) : null,
      openMistakes,
      lastStudied,
      standing,
      standingReason: reason,
    };
  });

  // Practice
  const byTechniqueMap = new Map<string, { label: string; attempts: QuestionAttemptRecord[] }>();
  for (const a of record.attempts) {
    const item = itemOf(a);
    if (!item) continue;
    const group = byTechniqueMap.get(item.technique) ?? { label: item.techniqueLabel, attempts: [] };
    group.attempts.push(a);
    byTechniqueMap.set(item.technique, group);
  }
  const byTechnique: TechniqueReport[] = [...byTechniqueMap.entries()].map(([technique, g]) => ({
    technique,
    label: g.label,
    ...practiceStats(g.attempts),
  }));
  const byQuestion = new Map<string, QuestionAttemptRecord[]>();
  for (const a of record.attempts) byQuestion.set(a.questionId, [...(byQuestion.get(a.questionId) ?? []), a]);
  let wrongFirst = 0;
  let laterCorrect = 0;
  for (const list of byQuestion.values()) {
    const sorted = [...list].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    if (sorted[0] && !sorted[0].isCorrect) {
      wrongFirst++;
      if (sorted.some((a) => a.isCorrect)) laterCorrect++;
    }
  }

  // Games, Explore, Create
  const games: GameReport[] = topic.activities
    .filter((a) => a.kind === 'game')
    .map((activity) => {
      const sessions = record.games
        .filter((g) => g.gameId === activity.id)
        .sort((a, b) => (a.endedAt ?? a.startedAt).localeCompare(b.endedAt ?? b.startedAt));
      const last = sessions.at(-1);
      return {
        activity,
        sessions: sessions.length,
        completed: sessions.filter((s) => s.completed).length,
        bestScore: sessions.length ? Math.max(...sessions.map((s) => s.score)) : null,
        latestScore: last ? last.score : null,
        levelReached: sessions.length ? Math.max(...sessions.map((s) => s.levelReached)) : null,
        xp: sessions.reduce((n, s) => n + s.xpEarned, 0),
        lastPlayed: last ? (last.endedAt ?? last.startedAt) : null,
      };
    });
  const explore = topic.activities
    .filter((a) => a.kind === 'lab')
    .map((activity) => ({
      activity,
      done: exploredIds.has(activity.id),
      lastAt: latest(
        record.activity.filter((e) => e.type === 'explore' && e.refId === activity.id).map((e) => e.occurredAt),
      ),
    }));
  const create = topic.activities
    .filter((a) => a.kind === 'studio')
    .map((activity) => {
      const projects = record.art.filter((p) => p.activityId === activity.id);
      return {
        activity,
        projects: projects.length,
        completed: projects.filter((p) => p.isCompleted).length,
        lastAt: latest(projects.map((p) => p.updatedAt)),
      };
    });

  // Improvement (by subtopic and by method; only with enough answers)
  const improvements = [
    ...topic.units.map((u) =>
      trend(
        `unit-${u.id}`,
        u.title,
        record.attempts.filter((a) => unitOfAttempt(a) === u.id),
      ),
    ),
    ...[...byTechniqueMap.entries()].map(([t, g]) => trend(`technique-${t}`, g.label, g.attempts)),
  ].filter((i): i is Improvement => i !== null);

  // Recent activity (no streak claims: days with real, dated activity)
  const stamps = activityTimestamps(record);
  const perDay = new Map<string, number>();
  for (const s of stamps) perDay.set(localDay(s), (perDay.get(localDay(s)) ?? 0) + 1);
  const activityDays: ActivityDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = localDay(d.toISOString());
    activityDays.push({ date: key, count: perDay.get(key) ?? 0 });
  }

  // Confidence: the learner's own ratings, separate from everything else
  const ratings = record.activity
    .filter((a) => a.type === 'reflection')
    .map((a) => (a.metadata as { confidence?: unknown } | null)?.confidence)
    .filter((c): c is number => typeof c === 'number');

  const practice = { ...practiceStats(record.attempts), retry: { wrongFirst, laterCorrect }, byTechnique };
  const counts = {
    lessonsCompleted: topicProgress.completedSubtopics,
    practiceQuestions: practice.questions,
    practiceAttempts: practice.attempts,
    gamesCompleted: record.games.filter((g) => g.completed).length,
    exploreDone: explore.filter((e) => e.done).length,
    exploreTotal: explore.length,
    createSaved: record.art.length,
    createCompleted: record.art.filter((p) => p.isCompleted).length,
  };
  const requiredStepsTotal = Object.values(topicProgress.subtopics).reduce((n, s) => n + s.requiredTotal, 0);
  const requiredStepsDone = Object.values(topicProgress.subtopics).reduce((n, s) => n + s.requiredDone, 0);

  const report: ProgressReport = {
    isEmpty: stamps.length === 0,
    completion: {
      fraction: topicProgress.fraction,
      completedSubtopics: topicProgress.completedSubtopics,
      totalSubtopics: topic.units.length,
      requiredStepsDone,
      requiredStepsTotal,
      stepsCompleted: record.lessons.filter((l) => l.status === 'completed').length,
    },
    counts,
    subtopics,
    practice,
    games,
    explore,
    create,
    improvements,
    activityDays,
    activeDaysLast7: activityDays.slice(-7).filter((d) => d.count > 0).length,
    lastActiveAt: latest(stamps),
    confidence: {
      ratings: ratings.length,
      average: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
    },
    recommendations: [],
  };
  report.recommendations = recommend(topic, report);
  return report;
}

/**
 * Simple, explainable rules (not AI). At most three, most useful first:
 * weak accuracy → targeted review; heavy hint use → the subtopic's Explore
 * tool; lesson done but practice weak → similar questions; open mistakes →
 * Review My Work; otherwise continue the current lesson.
 */
export function recommend(topic: TopicDefinition, report: ProgressReport): Recommendation[] {
  const out: Recommendation[] = [];
  const add = (r: Recommendation) => {
    if (!out.some((o) => o.id === r.id)) out.push(r);
  };
  const exploreFor = (unitId: string) => topic.activities.find((a) => a.unitId === unitId && a.kind === 'lab');

  // Weak methods first (e.g. repeated factors in partial fractions).
  for (const t of [...report.practice.byTechnique].sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))) {
    if (t.attempts < MIN_ATTEMPTS_FOR_JUDGEMENT || (t.accuracy ?? 1) >= WEAK_ACCURACY) continue;
    const item = (topic.practiceItems ?? []).find((i) => i.technique === t.technique);
    const unit = topic.units.find((u) => u.id === item?.unitId);
    if (!unit) continue;
    add({
      id: `weak-${t.technique}`,
      title: `Review ${t.label}`,
      reason: `${Math.round((t.accuracy ?? 0) * 100)}% of your ${t.attempts} answers on this method were correct.`,
      actionLabel: 'Open the worked examples',
      href: subtopicHref(topic.id, unit.slug, 'worked-example'),
    });
  }
  for (const s of report.subtopics) {
    const tool = exploreFor(s.unit.id);
    if (tool && s.practice.attempts >= MIN_ATTEMPTS_FOR_JUDGEMENT && s.practice.hints / s.practice.attempts >= 1.5) {
      add({
        id: `hints-${s.unit.id}`,
        title: `Try ${tool.title}`,
        reason: `You used ${s.practice.hints} hints in ${s.practice.attempts} answers on ${s.unit.title}. The Explore tool shows the idea step by step.`,
        actionLabel: `Open ${tool.title}`,
        href: activityHref(topic.id, tool.id),
      });
    }
    if (
      s.lesson.status === 'completed' &&
      s.practice.attempts >= MIN_ATTEMPTS_FOR_JUDGEMENT &&
      (s.practice.accuracy ?? 1) < 0.7
    ) {
      add({
        id: `practise-${s.unit.id}`,
        title: `Practise similar questions in ${s.unit.title}`,
        reason: 'You have finished the lesson, but your practice answers show this still needs work.',
        actionLabel: 'Open practice',
        href: subtopicHref(
          topic.id,
          s.unit.slug,
          s.unit.steps.some((st) => st.key === 'practise') ? 'practise' : 'worked-example',
        ),
      });
    }
  }
  const open = report.subtopics.reduce((n, s) => n + s.openMistakes, 0);
  if (open > 0) {
    add({
      id: 'mistakes',
      title: 'Review your mistakes',
      reason: `${open} ${open === 1 ? 'question is' : 'questions are'} waiting for another try.`,
      actionLabel: 'Open Review My Work',
      href: { pathname: '/my-work', params: { filter: 'review', topic: topic.id } },
    });
  }
  const current = topic.units.find(
    (u) => report.subtopics.find((s) => s.unit.id === u.id)?.lesson.status !== 'completed',
  );
  if (current) {
    const s = report.subtopics.find((x) => x.unit.id === current.id);
    const step = s?.lesson.nextStepKey ?? undefined;
    add({
      id: `continue-${current.id}`,
      title: s?.lesson.status === 'notStarted' ? `Start ${current.title}` : `Continue ${current.title}`,
      reason:
        s?.lesson.status === 'notStarted'
          ? 'This is the next subtopic in the lesson order.'
          : `${s?.lesson.requiredDone ?? 0} of ${s?.lesson.requiredTotal ?? 0} required steps done.`,
      actionLabel: s?.lesson.status === 'notStarted' ? 'Start' : 'Continue',
      href: subtopicHref(topic.id, current.slug, step),
    });
  }
  return out.slice(0, 3);
}
