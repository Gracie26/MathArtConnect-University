/**
 * Rewards (pure): badges derived from the real record, weekly goals by study
 * week, personal bests, and badge notifications. Badges must unlock only from
 * genuine learning behaviour, exactly once, and never by opening a page; weekly
 * goals reset every Monday; nothing here awards XP.
 */
import { listLearnerTopics } from '@/content/registry';
import { applicationsTopic } from '@/content/topics/applications';
import type { TopicDefinition } from '@/content/types';
import type { LearnerRecord } from '@/features/insights/useLearnerRecord';
import { deriveAllNotifications } from '@/features/notifications/notifications';
import { buildProgressReport } from '@/features/insights/progressReport';
import { longestStreakFromDays } from '@/features/learning/studyDay';
import { badgeNotifications, BADGES, evaluateBadges, nextBadge, remainingText } from '@/features/rewards/achievements';
import { backdropUnlocked, BACKDROPS } from '@/features/rewards/rewardsStore';
import { goalMet, weeklyGoals, weeklyNudge, weekStart } from '@/features/rewards/weeklyGoals';
import type { ActivityRecord, QuestionAttemptRecord } from '@/services/repositories/types';

const EMPTY: LearnerRecord = { lessons: [], attempts: [], games: [], art: [], activity: [] };
let n = 0;
const attempt = (questionId: string, isCorrect: boolean, at: string, extra: Partial<QuestionAttemptRecord> = {}) =>
  ({
    id: `a${n++}`,
    topicId: applicationsTopic.id,
    unitId: 'pda-gradient',
    questionId,
    retryOfId: null,
    learnerAnswer: null,
    isCorrect,
    hintsUsed: 0,
    hintLevelsViewed: [],
    viewedSteps: false,
    viewedAnswer: false,
    answeredAt: at,
    reviewResolvedAt: null,
    ...extra,
  }) satisfies QuestionAttemptRecord;
const event = (type: ActivityRecord['type'], refId: string, at: string): ActivityRecord => ({
  id: `e${n++}`,
  type,
  refId,
  topicId: applicationsTopic.id,
  summary: null,
  xp: 5,
  metadata: {},
  occurredAt: at,
});
const input = (record: Partial<LearnerRecord>, extra: { xp?: number; longestStreak?: number } = {}) => ({
  topics: [{ topic: applicationsTopic as TopicDefinition, record: { ...EMPTY, ...record } }],
  xp: extra.xp ?? 0,
  longestStreak: extra.longestStreak ?? 0,
});
const byId = (statuses: ReturnType<typeof evaluateBadges>) => new Map(statuses.map((s) => [s.id, s]));

describe('badges', () => {
  test('every badge has a criterion; ids are unique; four are Topic 4 badges', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
    for (const b of BADGES) expect(b.criterion.length).toBeGreaterThan(15);
    expect(BADGES.filter((b) => b.category === 'topic').map((b) => b.title)).toEqual([
      'Gradient Explorer',
      'Plane Builder',
      'Critical Point Detective',
      'Classification Expert',
    ]);
  });

  test('a new learner has earned nothing (opening pages never counts)', () => {
    const statuses = evaluateBadges(input({}));
    expect(statuses.every((b) => !b.earned && b.progress === 0)).toBe(true);
  });

  test('correct answers count different questions once; the badge is dated by the 5th', () => {
    const attempts = [
      attempt('q1', true, '2026-10-01T08:00:00Z'),
      attempt('q1', true, '2026-10-01T09:00:00Z'), // same question again: not counted twice
      attempt('q2', false, '2026-10-02T08:00:00Z'), // wrong: not counted
      attempt('q2', true, '2026-10-02T09:00:00Z'),
      attempt('q3', true, '2026-10-03T08:00:00Z'),
      attempt('q4', true, '2026-10-04T08:00:00Z'),
    ];
    let b = byId(evaluateBadges(input({ attempts })));
    expect(b.get('correct-5')).toMatchObject({ earned: false, progress: 4 });
    expect(remainingText(b.get('correct-5')!)).toBe('1 more correct answer');
    attempts.push(attempt('q5', true, '2026-10-05T08:00:00Z'), attempt('q6', true, '2026-10-06T08:00:00Z'));
    b = byId(evaluateBadges(input({ attempts })));
    expect(b.get('correct-5')).toMatchObject({ earned: true, earnedAt: '2026-10-05T08:00:00Z' });
    expect(b.get('first-practice')).toMatchObject({ earned: true, earnedAt: '2026-10-01T08:00:00Z' });
  });

  test('a badge is earned once: more activity never moves or repeats it', () => {
    const attempts = ['q1', 'q2', 'q3', 'q4', 'q5'].map((q, i) => attempt(q, true, `2026-10-0${i + 1}T08:00:00Z`));
    const first = byId(evaluateBadges(input({ attempts }))).get('correct-5')!;
    const more = [...attempts, ...['q6', 'q7'].map((q) => attempt(q, true, '2026-10-09T08:00:00Z'))];
    const again = byId(evaluateBadges(input({ attempts: more }))).get('correct-5')!;
    expect([first.earned, again.earned, again.earnedAt]).toEqual([true, true, first.earnedAt]);
    expect(badgeNotifications(input({ attempts: more }).topics).filter((x) => x.id === 'badge-correct-5')).toHaveLength(
      1,
    );
  });

  test('Gradient Explorer needs both the Gradient Probe and 3 correct gradient answers', () => {
    const probe = event('explore', 'pda-gradient-probe', '2026-10-01T08:00:00Z');
    const correct = ['q1', 'q2', 'q3'].map((q, i) => attempt(q, true, `2026-10-0${i + 2}T08:00:00Z`));
    expect(byId(evaluateBadges(input({ activity: [probe] }))).get('gradient-explorer')!.earned).toBe(false);
    expect(byId(evaluateBadges(input({ attempts: correct }))).get('gradient-explorer')!.earned).toBe(false);
    const other = event('explore', 'pda-tangent-plane-lab', '2026-10-01T08:00:00Z');
    expect(byId(evaluateBadges(input({ attempts: correct, activity: [other] }))).get('gradient-explorer')!.earned).toBe(
      false,
    );
    expect(
      byId(evaluateBadges(input({ attempts: correct, activity: [probe] }))).get('gradient-explorer'),
    ).toMatchObject({
      earned: true,
      earnedAt: '2026-10-04T08:00:00Z',
    });
  });

  test('mistakes put right count resolved attempts; reflections and Explore count their records', () => {
    const resolved = [1, 2, 3].map((i) =>
      attempt(`q${i}`, false, '2026-10-01T08:00:00Z', { reviewResolvedAt: `2026-10-0${i + 1}T08:00:00Z` }),
    );
    const b = byId(
      evaluateBadges(
        input({
          attempts: resolved,
          activity: [event('reflection', 'u', '2026-10-05T08:00:00Z'), event('explore', 'x', '2026-10-06T08:00:00Z')],
        }),
      ),
    );
    expect(b.get('reviewed-3')).toMatchObject({ earned: true, earnedAt: '2026-10-04T08:00:00Z' });
    expect(b.get('first-reflection')!.earned).toBe(true);
    expect(b.get('first-explore')!.earned).toBe(true);
  });

  test('completing every required step of a subtopic earns Subtopic Complete (not just opening it)', () => {
    const unit = applicationsTopic.units[0]!;
    const required = unit.steps.filter((s) => s.required).map((s) => s.key);
    const lessons = required.map((key, i) => ({
      unitId: unit.id,
      sectionKey: key,
      status: 'completed' as const,
      completedAt: `2026-10-0${i + 1}T08:00:00Z`,
    }));
    expect(byId(evaluateBadges(input({ lessons: lessons.slice(0, -1) }))).get('subtopic-complete')!.earned).toBe(false);
    expect(byId(evaluateBadges(input({ lessons }))).get('subtopic-complete')).toMatchObject({
      earned: true,
      earnedAt: `2026-10-0${required.length}T08:00:00Z`,
    });
    expect(byId(evaluateBadges(input({ lessons }))).get('topic-complete')!.earned).toBe(false);
  });

  test('streak and XP badges follow the personal best and the XP total; the next badge says what is left', () => {
    const b = byId(evaluateBadges(input({}, { xp: 85, longestStreak: 7 })));
    expect([b.get('streak-3')!.earned, b.get('streak-7')!.earned, b.get('streak-14')!.earned]).toEqual([
      true,
      true,
      false,
    ]);
    expect(remainingText(b.get('xp-100')!)).toBe('15 XP');
    expect(nextBadge([...b.values()])?.id).toBe('xp-100');
  });

  test('the longest streak is the longest run of consecutive study days', () => {
    expect(longestStreakFromDays(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05', '2026-10-06'])).toBe(3);
    expect(longestStreakFromDays(['2026-12-31', '2027-01-01'])).toBe(2);
    expect(longestStreakFromDays([])).toBe(0);
  });

  test('badge notifications are stable and never duplicated when merged with other notifications', () => {
    const topics = listLearnerTopics().map((topic) => ({
      topic,
      record:
        topic.id === applicationsTopic.id
          ? { ...EMPTY, attempts: [attempt('q1', true, '2026-10-01T08:00:00Z')] }
          : EMPTY,
    }));
    const once = badgeNotifications(topics);
    expect(once.map((x) => x.id)).toEqual(['badge-first-practice']);
    expect(badgeNotifications(topics)).toEqual(once);
    const derived = deriveAllNotifications(
      topics.map((t) => ({ ...t, report: buildProgressReport(t.topic, t.record) })),
    );
    const ids = [...derived, ...once].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('backdrops are cosmetic and unlock by badges earned', () => {
    expect(BACKDROPS.map((b) => [b.id, b.badgesNeeded])).toEqual([
      ['curves', 0],
      ['lissajous', 3],
      ['contours', 6],
      ['field', 10],
    ]);
    expect(backdropUnlocked('curves', 0)).toBe(true);
    expect(backdropUnlocked('contours', 5)).toBe(false);
    expect(backdropUnlocked('contours', 6)).toBe(true);
  });
});

describe('weekly goals', () => {
  // Study days run in UTC+2: 2026-10-18T22:30Z is Monday 19 October 00:30 in Windhoek.
  const NOW = new Date('2026-10-21T10:00:00Z'); // Wednesday
  test('weeks start on Monday (study days, UTC+2)', () => {
    expect(weekStart('2026-10-21')).toBe('2026-10-19');
    expect(weekStart('2026-10-19')).toBe('2026-10-19');
    expect(weekStart('2026-10-18')).toBe('2026-10-12');
  });

  test('progress counts separate practice days, mistakes put right, Explore tools and reflections this week', () => {
    const record: LearnerRecord = {
      ...EMPTY,
      attempts: [
        attempt('q1', true, '2026-10-19T07:00:00Z'),
        attempt('q2', true, '2026-10-19T09:00:00Z'), // same day: one session
        attempt('q3', false, '2026-10-20T07:00:00Z', { reviewResolvedAt: '2026-10-21T08:00:00Z' }),
        attempt('q4', true, '2026-10-18T21:59:00Z'), // Sunday 23:59 in Windhoek: last week
      ],
      activity: [event('explore', 'x', '2026-10-20T08:00:00Z'), event('reflection', 'u', '2026-10-15T08:00:00Z')],
    };
    const goals = Object.fromEntries(weeklyGoals([record], NOW).map((g) => [g.id, [g.done, g.target, g.lastWeek]]));
    expect(goals).toEqual({ practice: [2, 3, 1], mistakes: [1, 2, 0], explore: [1, 2, 0], reflection: [0, 1, 1] });
    expect(weeklyNudge(weeklyGoals([record], NOW))).toBe(
      '1 more practice session to complete this week’s practice sessions goal.',
    );
  });

  test('goals reset every Monday: last week’s work is only shown for comparison', () => {
    const record: LearnerRecord = { ...EMPTY, activity: [event('reflection', 'u', '2026-10-20T08:00:00Z')] };
    const thisWeek = weeklyGoals([record], NOW).find((g) => g.id === 'reflection')!;
    expect(goalMet(thisWeek)).toBe(true);
    const nextWeek = weeklyGoals([record], new Date('2026-10-26T08:00:00Z')).find((g) => g.id === 'reflection')!;
    expect([nextWeek.done, nextWeek.lastWeek, goalMet(nextWeek)]).toEqual([0, 1, false]);
  });
});
