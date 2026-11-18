import { areaTopic } from '@/content/topics/area';
import { integrationTopic } from '@/content/topics/integration';
import { buildProgressOverview } from '@/features/insights/overviewModel';
import { buildProgressReport } from '@/features/insights/progressReport';
import type { LearnerRecord } from '@/features/insights/useLearnerRecord';
import { groupNotificationsByDay, type LearnerNotification } from '@/features/notifications/notifications';
import type { QuestionAttemptRecord } from '@/services/repositories/types';

const NOW = new Date('2026-10-12T12:00:00Z');
const EMPTY: LearnerRecord = { lessons: [], attempts: [], games: [], art: [], activity: [] };

const topic = integrationTopic;
const unit = topic.units[1]!;
const item = (topic.practiceItems ?? []).find((i) => i.unitId === unit.id && !i.withheldFromLearners)!;

let n = 0;
const attempt = (isCorrect: boolean): QuestionAttemptRecord => ({
  id: `a${n++}`,
  topicId: topic.id,
  unitId: unit.id,
  questionId: item.id,
  retryOfId: null,
  learnerAnswer: null,
  isCorrect,
  hintsUsed: 0,
  hintLevelsViewed: [],
  viewedSteps: false,
  viewedAnswer: false,
  answeredAt: '2026-10-11T09:00:00Z',
  reviewResolvedAt: null,
});

describe('Progress overview', () => {
  test('a new learner: nothing started, nothing to review, no insights, Start on every card', () => {
    const o = buildProgressOverview([
      { topic, report: buildProgressReport(topic, EMPTY, NOW) },
      { topic: areaTopic, report: buildProgressReport(areaTopic, EMPTY, NOW) },
    ]);
    expect(o.totals).toMatchObject({
      topicsStarted: 0,
      topicsTotal: 2,
      stepsDone: 0,
      practiceChecked: 0,
      openMistakes: 0,
    });
    expect(o.totals.stepsTotal).toBeGreaterThan(0);
    expect(o.insights).toEqual([]);
    expect(o.topics.map((t) => t.continueLabel)).toEqual(['Start', 'Start']);
  });

  test('real practice and mistakes are counted per topic and in total', () => {
    const record: LearnerRecord = {
      ...EMPTY,
      lessons: [{ unitId: unit.id, sectionKey: 'concept', status: 'completed', completedAt: '2026-10-11T08:00:00Z' }],
      attempts: [attempt(true), attempt(true), attempt(false)],
    };
    const o = buildProgressOverview([
      { topic, report: buildProgressReport(topic, record, NOW) },
      { topic: areaTopic, report: buildProgressReport(areaTopic, EMPTY, NOW) },
    ]);
    expect(o.totals.topicsStarted).toBe(1);
    expect(o.totals.practiceChecked).toBe(3);
    expect(o.totals.practiceCorrect).toBe(2);
    const card = o.topics[0]!;
    expect(card.started).toBe(true);
    expect(card.continueLabel).toBe('Continue');
    expect(card.practice).toEqual({ checked: 3, correct: 2 });
    expect(card.openMistakes).toBe(o.totals.openMistakes);
    // Insights never repeat the plain "continue" suggestion and never exceed three.
    expect(o.insights.length).toBeLessThanOrEqual(3);
    expect(o.insights.every((i) => !i.id.includes(':continue-'))).toBe(true);
  });
});

describe('notification day groups', () => {
  const note = (id: string, at: string): LearnerNotification => ({
    id,
    kind: 'reminder',
    title: id,
    body: '',
    at,
    href: '/learn',
  });
  const now = new Date(2026, 9, 12, 15, 0, 0);

  test('Today, Yesterday and Earlier by local date, empty groups left out', () => {
    const groups = groupNotificationsByDay(
      [
        note('a', new Date(2026, 9, 12, 9).toISOString()),
        note('b', new Date(2026, 9, 11, 23, 30).toISOString()),
        note('c', new Date(2026, 9, 11, 0, 5).toISOString()),
        note('d', new Date(2026, 9, 3, 12).toISOString()),
      ],
      now,
    );
    expect(groups.map((g) => [g.id, g.items.map((i) => i.id)])).toEqual([
      ['today', ['a']],
      ['yesterday', ['b', 'c']],
      ['earlier', ['d']],
    ]);
    expect(groupNotificationsByDay([note('x', new Date(2026, 8, 1).toISOString())], now).map((g) => g.id)).toEqual([
      'earlier',
    ]);
    expect(groupNotificationsByDay([], now)).toEqual([]);
  });
});
