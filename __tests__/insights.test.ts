import { integrationTopic } from '@/content/topics/integration';
import { buildProgressReport, localDay } from '@/features/insights/progressReport';
import type { LearnerRecord } from '@/features/insights/useLearnerRecord';
import { buildWorkHistory, filterEntries, filterQuestions, savedWorking } from '@/features/insights/workHistory';
import { areaTopic } from '@/content/topics/area';
import {
  deriveAllNotifications,
  deriveNotifications,
  visibleNotifications,
} from '@/features/notifications/notifications';
import type {
  ActivityRecord,
  ArtProjectRecord,
  GameSessionRecord,
  LessonProgressEntry,
  QuestionAttemptRecord,
} from '@/services/repositories/types';

const topic = integrationTopic;
const [understanding, basic, substitution, partial] = topic.units;
const items = (topic.practiceItems ?? []).filter((i) => !i.withheldFromLearners);
const itemFor = (unitId: string, technique?: string, skip = 0) =>
  items.filter((i) => i.unitId === unitId && (!technique || i.technique === technique))[skip]!;

const NOW = new Date('2026-10-12T12:00:00Z');
const at = (daysAgo: number, minutes = 0) =>
  new Date(NOW.getTime() - daysAgo * 86_400_000 + minutes * 60_000).toISOString();

let n = 0;
const attempt = (
  questionId: string,
  unitId: string,
  isCorrect: boolean,
  when: string,
  extra: Partial<QuestionAttemptRecord> = {},
): QuestionAttemptRecord => ({
  id: `a${n++}`,
  topicId: topic.id,
  unitId,
  questionId,
  retryOfId: null,
  learnerAnswer: null,
  isCorrect,
  hintsUsed: 0,
  hintLevelsViewed: [],
  viewedSteps: false,
  viewedAnswer: false,
  answeredAt: when,
  reviewResolvedAt: null,
  ...extra,
});
const done = (unitId: string, sectionKey: string, when: string): LessonProgressEntry => ({
  unitId,
  sectionKey,
  status: 'completed',
  completedAt: when,
});
const requiredKeys = (unitId: string) =>
  topic.units
    .find((u) => u.id === unitId)!
    .steps.filter((s) => s.required)
    .map((s) => s.key);
const game = (gameId: string, score: number, when: string, completed = true): GameSessionRecord => ({
  id: `g${n++}`,
  topicId: topic.id,
  gameId,
  levelReached: 2,
  score,
  xpEarned: Math.round(score / 5),
  hintsUsed: 0,
  completed,
  events: {},
  startedAt: when,
  endedAt: when,
});
const art = (activityId: string, isCompleted: boolean, when: string): ArtProjectRecord => ({
  id: `p${n++}`,
  topicId: topic.id,
  activityId,
  title: 'My art',
  composition: {},
  isCompleted,
  createdAt: when,
  updatedAt: when,
});
const event = (type: ActivityRecord['type'], refId: string, when: string, metadata = {}): ActivityRecord => ({
  id: `e${n++}`,
  type,
  refId,
  topicId: topic.id,
  summary: null,
  xp: 5,
  metadata,
  occurredAt: when,
});

const EMPTY: LearnerRecord = { lessons: [], attempts: [], games: [], art: [], activity: [] };

/** A learner part-way through: unit 1 complete and strong, substitution weak with many hints, a partial-fractions +C slip. */
function sampleRecord(): LearnerRecord {
  const sub = itemFor(substitution!.id, 'u-substitution');
  const sub2 = itemFor(substitution!.id, 'u-substitution', 1);
  const basicItem = itemFor(basic!.id);
  const pf = itemFor(partial!.id);
  return {
    lessons: [
      ...requiredKeys(understanding!.id).map((k, i) => done(understanding!.id, k, at(5, i))),
      done(substitution!.id, 'concept', at(2)),
    ],
    attempts: [
      // Basic rules: right first time, three times → strong once the lesson is done (it is not), so on track.
      attempt(basicItem.id, basic!.id, true, at(4)),
      // Substitution: 1 of 4 correct, 2 hints each → needs attention, many hints.
      attempt(sub.id, substitution!.id, false, at(2, 1), { hintsUsed: 2 }),
      attempt(sub.id, substitution!.id, false, at(2, 2), { hintsUsed: 2 }),
      attempt(sub2.id, substitution!.id, false, at(2, 3), { hintsUsed: 2 }),
      attempt(sub2.id, substitution!.id, true, at(2, 4), { hintsUsed: 2 }),
      // Partial fractions: forgot + C.
      attempt(pf.id, partial!.id, false, at(1), {
        learnerAnswer: { answer: '2 ln|x-3| - ln|x+2|', steps: ['2/(x-3) - 1/(x+2)'], outcome: 'missingConstant' },
      }),
    ],
    games: [game('reverse-the-derivative', 40, at(5)), game('reverse-the-derivative', 55, at(4))],
    art: [art('equation-art-studio', false, at(3)), art('dynamic-pattern-studio', true, at(3, 5))],
    activity: [
      event('explore', 'family-of-curves', at(5)),
      event('reflection', understanding!.id, at(5), { confidence: 4 }),
      event('reflection', substitution!.id, at(2), { confidence: 2 }),
    ],
  };
}

describe('progress report', () => {
  test('with no record, nothing is invented', () => {
    const r = buildProgressReport(topic, EMPTY, NOW);
    expect(r.isEmpty).toBe(true);
    expect(r.completion.fraction).toBe(0);
    expect(r.practice.accuracy).toBeNull();
    expect(r.subtopics).toHaveLength(7);
    expect(r.subtopics.every((s) => s.standing === 'notStarted')).toBe(true);
    expect(r.games.every((g) => g.sessions === 0 && g.bestScore === null)).toBe(true);
    expect(r.improvements).toEqual([]);
    expect(r.confidence.average).toBeNull();
    expect(r.recommendations.map((x) => x.id)).toEqual([`continue-${understanding!.id}`]);
  });

  test('completion counts required lesson steps only; opening is never counted', () => {
    const r = buildProgressReport(topic, sampleRecord(), NOW);
    expect(r.completion.completedSubtopics).toBe(1);
    expect(r.counts.lessonsCompleted).toBe(1);
    expect(r.completion.requiredStepsDone).toBe(requiredKeys(understanding!.id).length + 1);
    expect(r.subtopics.find((s) => s.unit.id === understanding!.id)?.lesson.status).toBe('completed');
  });

  test('subtopic aggregation, practice accuracy and honest standing', () => {
    const r = buildProgressReport(topic, sampleRecord(), NOW);
    const sub = r.subtopics.find((s) => s.unit.id === substitution!.id)!;
    expect(sub.practice).toMatchObject({
      attempts: 4,
      questions: 2,
      correct: 1,
      incorrect: 3,
      accuracy: 0.25,
      hints: 8,
    });
    expect(sub.standing).toBe('needsAttention');
    expect(sub.standingReason).toBe('25% of 4 checked answers were correct.');
    expect(sub.openMistakes).toBe(1);
    const basicR = r.subtopics.find((s) => s.unit.id === basic!.id)!;
    expect(basicR.standing).toBe('onTrack');
    expect(basicR.standingReason).toMatch(/not enough to judge accuracy/);
    const u1 = r.subtopics.find((s) => s.unit.id === understanding!.id)!;
    expect(u1.gameSessions).toBe(2);
    expect(u1.bestGameScore).toBe(55);
    expect(u1.lastStudied).not.toBeNull();
    // A saved Dynamic Pattern Studio project counts as activity in Advanced Integration Patterns.
    expect(r.subtopics.find((s) => s.unit.id === topic.units[6]!.id)?.standing).toBe('onTrack');
    expect(r.subtopics.find((s) => s.unit.id === topic.units[5]!.id)?.standing).toBe('notStarted');
  });

  test('practice by method, retry improvement and hints', () => {
    const r = buildProgressReport(topic, sampleRecord(), NOW);
    expect(r.practice).toMatchObject({ attempts: 6, correct: 2, hints: 8 });
    expect(r.practice.retry).toEqual({ wrongFirst: 3, laterCorrect: 1 });
    const subMethod = r.practice.byTechnique.find((t) => t.technique === 'u-substitution');
    expect(subMethod).toMatchObject({ label: 'Substitution', attempts: 4, accuracy: 0.25 });
  });

  test('games, explore, create, confidence and recent activity come from real records', () => {
    const r = buildProgressReport(topic, sampleRecord(), NOW);
    const reverse = r.games.find((g) => g.activity.id === 'reverse-the-derivative')!;
    expect(reverse).toMatchObject({ sessions: 2, completed: 2, bestScore: 55, latestScore: 55, xp: 19 });
    expect(r.games.find((g) => g.activity.id === 'choose-u')).toMatchObject({ sessions: 0, bestScore: null });
    expect(r.counts).toMatchObject({ exploreDone: 1, createSaved: 2, createCompleted: 1, gamesCompleted: 2 });
    expect(r.confidence).toEqual({ ratings: 2, average: 3 });
    expect(r.activityDays).toHaveLength(14);
    expect(r.activityDays.at(-1)?.date).toBe(localDay(NOW.toISOString()));
    expect(r.activityDays.reduce((s, d) => s + d.count, 0)).toBeGreaterThan(10);
    expect(r.activeDaysLast7).toBe(5);
  });

  test('improvement is shown only with enough answers and a real rise', () => {
    const sub = itemFor(substitution!.id, 'u-substitution');
    const rising: LearnerRecord = {
      ...EMPTY,
      attempts: [false, false, true, true].map((ok, i) => attempt(sub.id, substitution!.id, ok, at(3 - i))),
    };
    const r = buildProgressReport(topic, rising, NOW);
    expect(r.improvements.map((i) => i.text)).toContain(
      'Substitution accuracy improved from 0% to 100% over your last 4 answers.',
    );
    const few: LearnerRecord = { ...EMPTY, attempts: rising.attempts.slice(1) };
    expect(buildProgressReport(topic, few, NOW).improvements).toEqual([]);
  });

  test('recommendations follow simple rules, most useful first', () => {
    const r = buildProgressReport(topic, sampleRecord(), NOW);
    const ids = r.recommendations.map((x) => x.id);
    expect(ids[0]).toBe('weak-u-substitution');
    expect(r.recommendations[0]!.title).toBe('Review Substitution');
    expect(ids).toContain(`hints-${substitution!.id}`);
    expect(r.recommendations.find((x) => x.id === `hints-${substitution!.id}`)?.title).toBe(
      'Try Substitution Highlighter',
    );
    expect(r.recommendations.length).toBeLessThanOrEqual(3);
  });
});

describe('Review My Work history', () => {
  test('empty record → empty history', () => {
    const h = buildWorkHistory(topic, EMPTY);
    expect(h.isEmpty).toBe(true);
    expect(h.needsReview).toEqual([]);
    expect(h.lessons).toHaveLength(7);
  });

  test('a single timeline, newest first, covering every kind of work', () => {
    const h = buildWorkHistory(topic, sampleRecord());
    const kinds = new Set(h.entries.map((e) => e.kind));
    for (const k of ['practice', 'game', 'explore', 'create', 'lesson', 'reflection']) expect(kinds).toContain(k);
    const times = h.entries.map((e) => e.at);
    expect([...times].sort().reverse()).toEqual(times);
    expect(h.entries.find((e) => e.kind === 'game')?.title).toBe('Played Reverse the Derivative');
    expect(h.entries.filter((e) => e.kind === 'create').map((e) => e.title)).toEqual([
      'Saved Dynamic Pattern Studio project',
      'Saved Equation Art Studio project',
    ]);
  });

  test('mistakes are grouped from real errors only; resolved ones are left out', () => {
    const h = buildWorkHistory(topic, sampleRecord());
    const titles = h.needsReview.map((g) => g.title);
    expect([...titles].sort()).toEqual(['Forgotten + C', 'Substitution: choosing u and du']);
    expect(h.needsReview.find((g) => g.id === 'missing-constant')?.questions[0]?.working).toEqual({
      answer: '2 ln|x-3| - ln|x+2|',
      steps: ['2/(x-3) - 1/(x+2)'],
      outcome: 'missingConstant',
    });
    // The question answered correctly on retry is not open.
    expect(h.needsReview.flatMap((g) => g.questions).map((q) => q.item.id)).not.toContain(
      itemFor(substitution!.id, 'u-substitution', 1).id,
    );
  });

  test('filters by type, subtopic, needs review, completed and recent', () => {
    const h = buildWorkHistory(topic, sampleRecord());
    const base = { kind: 'all', unitId: null, status: 'any' } as const;
    expect(filterEntries(h.entries, { ...base, kind: 'game' }, NOW).every((e) => e.kind === 'game')).toBe(true);
    expect(
      filterEntries(h.entries, { ...base, unitId: substitution!.id }, NOW).every((e) => e.unitId === substitution!.id),
    ).toBe(true);
    const review = filterEntries(h.entries, { ...base, status: 'review' }, NOW);
    expect(review.length).toBe(3);
    expect(review.every((e) => e.status === 'incorrect')).toBe(true);
    expect(
      filterEntries(h.entries, { ...base, status: 'completed' }, NOW).every((e) =>
        ['completed', 'correct', 'done'].includes(e.status),
      ),
    ).toBe(true);
    expect(filterEntries(h.entries, { ...base, status: 'recent' }, new Date(at(-30))).length).toBe(0);
    expect(filterQuestions(h.questions, { ...base, status: 'review' }, NOW).every((q) => q.open)).toBe(true);
  });

  test('lesson history gives the completed steps and where to continue', () => {
    const h = buildWorkHistory(topic, sampleRecord());
    const sub = h.lessons.find((l) => l.unit.id === substitution!.id)!;
    expect(sub.completedSteps.map((s) => s.key)).toEqual(['concept']);
    expect(sub.status).toBe('inProgress');
    expect(sub.nextStepKey).toBe('see-it');
    expect(sub.continueHref).toEqual({
      pathname: '/topic/[topicId]/[subtopicId]',
      params: { topicId: topic.id, subtopicId: substitution!.slug, step: 'see-it' },
    });
  });

  test('saved working is read safely from older or partial records', () => {
    expect(savedWorking(null)).toBeNull();
    expect(savedWorking({ answer: 'x^2 + C' })).toEqual({ answer: 'x^2 + C', steps: [], outcome: null });
    expect(savedWorking({ steps: ['u = x', 42] })).toEqual({ answer: '', steps: ['u = x'], outcome: null });
  });
});

describe('notifications', () => {
  const derive = (record: LearnerRecord, now = NOW) =>
    deriveNotifications(topic, record, buildProgressReport(topic, record, now), now);

  test('none without a record', () => {
    expect(derive(EMPTY)).toEqual([]);
  });

  test('rule-based notifications from real events, newest first', () => {
    const list = derive(sampleRecord());
    const ids = list.map((x) => x.id);
    expect(ids).toContain(`completed-${understanding!.id}`);
    expect(ids).toContain(`unfinished-${substitution!.id}-1`);
    expect(ids).toContain(`review-${substitution!.id}-1`);
    expect(ids).toContain(`hints-${substitution!.id}-4`);
    expect(ids).toContain('game-finished-reverse-the-derivative');
    expect(list.find((x) => x.kind === 'savedWork')?.title).toBe('Your Equation Art Studio project was saved');
    expect(list.find((x) => x.id.startsWith('art-completed'))?.kind).toBe('achievement');
    expect(list.find((x) => x.kind === 'weakArea')?.body).toMatch(/Try Substitution Highlighter/);
    expect(ids.some((id) => id.startsWith('inactive'))).toBe(false);
    expect([...list.map((x) => x.at)].sort().reverse()).toEqual(list.map((x) => x.at));
  });

  test('an inactivity reminder only after three quiet days', () => {
    const record = sampleRecord();
    const later = new Date(NOW.getTime() + 4 * 86_400_000);
    expect(derive(record, later).some((x) => x.kind === 'inactivity')).toBe(true);
  });

  test('across topics: Topic 2 events appear, and recent Topic 2 work suppresses a Topic 1 inactivity reminder', () => {
    const later = new Date(NOW.getTime() + 4 * 86_400_000);
    const areaRecord: LearnerRecord = {
      ...EMPTY,
      games: [
        { ...game('riemann-builder', 60, new Date(later.getTime() - 3_600_000).toISOString()), topicId: areaTopic.id },
      ],
    };
    const entries = [
      { topic, record: sampleRecord(), report: buildProgressReport(topic, sampleRecord(), later) },
      { topic: areaTopic, record: areaRecord, report: buildProgressReport(areaTopic, areaRecord, later) },
    ];
    const all = deriveAllNotifications(entries, later);
    expect(all.map((x) => x.id)).toContain('game-finished-riemann-builder');
    expect(all.map((x) => x.id)).toContain('game-finished-reverse-the-derivative');
    expect(all.some((x) => x.kind === 'inactivity')).toBe(false);
    expect(new Set(all.map((x) => x.id)).size).toBe(all.length);

    const muchLater = new Date(later.getTime() + 5 * 86_400_000);
    const quiet = deriveAllNotifications(
      entries.map((e) => ({ ...e, report: buildProgressReport(e.topic, e.record, muchLater) })),
      muchLater,
    );
    expect(quiet.filter((x) => x.kind === 'inactivity')).toHaveLength(1);
  });

  test('settings and dismissals hide notifications', () => {
    const list = derive(sampleRecord());
    const noReview = visibleNotifications(list, { learning: true, review: false, achievement: true }, new Set());
    expect(noReview.some((x) => x.kind === 'review' || x.kind === 'weakArea')).toBe(false);
    const first = list[0]!;
    expect(
      visibleNotifications(list, { learning: true, review: true, achievement: true }, new Set([first.id])),
    ).not.toContainEqual(first);
  });
});
