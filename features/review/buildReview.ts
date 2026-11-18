/**
 * Review for one subtopic, built only from the learner's real history:
 * practice attempts, game sessions, saved Create work, explore use and
 * reflections. Nothing is invented: with no history, every list is empty.
 */
import type { PracticeItem, TopicActivity } from '@/content/types';
import type { LearningHistory } from '@/features/learning/useLearningHistory';
import type { ArtProjectRecord, GameSessionRecord, QuestionAttemptRecord } from '@/services/repositories/types';

export interface QuestionReview {
  item: PracticeItem;
  attempts: QuestionAttemptRecord[];
  last: QuestionAttemptRecord;
  /** Earlier wrong attempts not yet resolved by a later correct one. */
  open: boolean;
  everCorrect: boolean;
  hintsUsed: number;
}

export interface TechniqueReview {
  technique: string;
  label: string;
  attempts: number;
  wrong: number;
}

export interface GameReview {
  activity: TopicActivity;
  sessions: GameSessionRecord[];
  bestScore: number;
  lastPlayed: string;
  hintsUsed: number;
  retries: number;
}

export interface UnitReview {
  questions: QuestionReview[];
  mistakes: QuestionReview[];
  completed: QuestionReview[];
  retried: QuestionReview[];
  withHints: QuestionReview[];
  totalHints: number;
  lastAttempts: { item: PracticeItem; attempt: QuestionAttemptRecord }[];
  weakTechniques: TechniqueReview[];
  games: GameReview[];
  art: { activity: TopicActivity; project: ArtProjectRecord }[];
  explored: TopicActivity[];
  reflections: number;
  isEmpty: boolean;
}

const retriesIn = (session: GameSessionRecord): number => {
  const events = session.events as { retries?: unknown } | null;
  return events && typeof events === 'object' && typeof events.retries === 'number' ? events.retries : 0;
};

export function buildUnitReview(
  unitId: string,
  history: LearningHistory,
  items: readonly PracticeItem[],
  activities: readonly TopicActivity[],
): UnitReview {
  const unitItems = new Map(items.filter((i) => i.unitId === unitId).map((i) => [i.id, i]));
  const byQuestion = new Map<string, QuestionAttemptRecord[]>();
  for (const attempt of history.attempts) {
    if (!unitItems.has(attempt.questionId)) continue;
    byQuestion.set(attempt.questionId, [...(byQuestion.get(attempt.questionId) ?? []), attempt]);
  }

  const questions: QuestionReview[] = [...byQuestion.entries()].map(([id, attempts]) => {
    const sorted = [...attempts].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    const last = sorted[sorted.length - 1] as QuestionAttemptRecord;
    return {
      item: unitItems.get(id) as PracticeItem,
      attempts: sorted,
      last,
      open: sorted.some((a) => !a.isCorrect && !a.reviewResolvedAt) && !last.isCorrect,
      everCorrect: sorted.some((a) => a.isCorrect),
      hintsUsed: sorted.reduce((n, a) => n + a.hintsUsed, 0),
    };
  });

  const techniques = new Map<string, TechniqueReview>();
  for (const q of questions) {
    const entry = techniques.get(q.item.technique) ?? {
      technique: q.item.technique,
      label: q.item.techniqueLabel,
      attempts: 0,
      wrong: 0,
    };
    entry.attempts += q.attempts.length;
    entry.wrong += q.attempts.filter((a) => !a.isCorrect).length;
    techniques.set(q.item.technique, entry);
  }

  const unitActivities = activities.filter((a) => a.unitId === unitId);
  const games: GameReview[] = unitActivities
    .filter((a) => a.kind === 'game')
    .map((activity) => {
      const sessions = history.games.filter((g) => g.gameId === activity.id);
      return {
        activity,
        sessions,
        bestScore: Math.max(0, ...sessions.map((s) => s.score)),
        lastPlayed:
          sessions
            .map((s) => s.endedAt ?? s.startedAt)
            .sort()
            .reverse()[0] ?? '',
        hintsUsed: sessions.reduce((n, s) => n + s.hintsUsed, 0),
        retries: sessions.reduce((n, s) => n + retriesIn(s), 0),
      };
    })
    .filter((g) => g.sessions.length > 0);

  const art = unitActivities
    .filter((a) => a.kind === 'studio')
    .flatMap((activity) =>
      history.art.filter((p) => p.activityId === activity.id).map((project) => ({ activity, project })),
    );

  const exploredIds = new Set(history.activity.filter((a) => a.type === 'explore').map((a) => a.refId));
  const explored = unitActivities.filter((a) => a.kind === 'lab' && exploredIds.has(a.id));
  const reflections = history.activity.filter((a) => a.type === 'reflection' && a.refId === unitId).length;

  const lastAttempts = questions
    .flatMap((q) => q.attempts.map((attempt) => ({ item: q.item, attempt })))
    .sort((a, b) => b.attempt.answeredAt.localeCompare(a.attempt.answeredAt))
    .slice(0, 5);

  return {
    questions,
    mistakes: questions.filter((q) => q.open),
    completed: questions.filter((q) => q.everCorrect),
    retried: questions.filter((q) => q.attempts.length > 1),
    withHints: questions.filter((q) => q.hintsUsed > 0),
    totalHints: questions.reduce((n, q) => n + q.hintsUsed, 0),
    lastAttempts,
    weakTechniques: [...techniques.values()]
      .filter((t) => t.wrong > 0)
      .sort((a, b) => b.wrong / b.attempts - a.wrong / a.attempts),
    games,
    art,
    explored,
    reflections,
    isEmpty:
      questions.length === 0 && games.length === 0 && art.length === 0 && explored.length === 0 && reflections === 0,
  };
}

export interface NextAction {
  text: string;
  /** An activity to open, when the action is one. */
  activity?: TopicActivity;
}

/**
 * The single most useful next step, from the learner's real history only: open
 * mistakes first, then untried practice, the game, Create and Reflect. It never
 * claims mastery; when everything has been done it says so factually.
 */
export function nextAction(unitId: string, review: UnitReview, activities: readonly TopicActivity[]): NextAction {
  const open = review.mistakes[0];
  if (open) {
    return {
      text: `Retry the question you have not yet got right (${open.item.techniqueLabel}) using its hints, then try a similar one.`,
    };
  }
  if (review.questions.length === 0) {
    return {
      text: 'Answer the App practice questions above without looking back at the notes, then work through the Practise step.',
    };
  }
  const unitActivities = activities.filter((a) => a.unitId === unitId);
  const game = unitActivities.find((a) => a.kind === 'game' && !review.games.some((g) => g.activity.id === a.id));
  if (game) return { text: `Play ${game.title} to use the same mathematics in a new way.`, activity: game };
  const studio = unitActivities.find((a) => a.kind === 'studio' && !review.art.some((p) => p.activity.id === a.id));
  if (studio)
    return {
      text: `Make and save a piece in ${studio.title}, and explain the mathematics behind it.`,
      activity: studio,
    };
  if (review.reflections === 0) return { text: 'Write your reflection in the Reflect step.' };
  return {
    text: 'You have practised, played, created and reflected in this subtopic. Come back to the App practice later to check you still remember the method, or move on to the next subtopic.',
  };
}

/** Another question with the same technique that the learner has not yet answered correctly. */
export function similarQuestion(
  item: PracticeItem,
  items: readonly PracticeItem[],
  review: UnitReview,
): PracticeItem | undefined {
  const done = new Set(review.completed.map((q) => q.item.id));
  return items.find(
    (other) =>
      other.id !== item.id && other.technique === item.technique && !other.withheldFromLearners && !done.has(other.id),
  );
}
