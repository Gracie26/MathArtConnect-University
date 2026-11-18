import AsyncStorage from '@react-native-async-storage/async-storage';

import { plotFunction, tangentSegment, toCanvas } from '@/lib/art/curves';
import { formatCompactNumber, initialsOf, toPercent } from '@/lib/utils/format';
import { formatRelativeDay, getGreeting } from '@/lib/utils/time';
import { dashboardRepository } from '@/services/repositories/dashboardRepository';
import { devLessonProgress } from '@/services/repositories/lessonProgress/devLessonProgress';
import { DEFAULT_TOPIC_ID, getTopic } from '@/content/registry';
import { computeTopicProgress } from '@/features/learning/progress';
import { createEmptyDashboardData, createMockDashboardData } from '@/services/mock/mockDashboardData';
import { nextAction } from '@/services/repositories/dashboardRepository';

const at = (hour: number) => new Date(2026, 9, 9, hour, 0, 0);

describe('time helpers', () => {
  test('greeting follows local time of day', () => {
    expect(getGreeting(at(7))).toBe('Good morning');
    expect(getGreeting(at(13))).toBe('Good afternoon');
    expect(getGreeting(at(20))).toBe('Good evening');
  });

  test('relative day labels', () => {
    const now = at(10);
    expect(formatRelativeDay(at(8).toISOString(), now)).toBe('Today');
    expect(formatRelativeDay(new Date(2026, 9, 8, 23).toISOString(), now)).toBe('Yesterday');
    expect(formatRelativeDay(new Date(2026, 9, 6, 12).toISOString(), now)).toBe('3 days ago');
    expect(formatRelativeDay(new Date(2026, 8, 20, 12).toISOString(), now)).toBe('20 Sep');
  });
});

describe('format helpers', () => {
  test('compact numbers', () => {
    expect(formatCompactNumber(240)).toBe('240');
    expect(formatCompactNumber(1000)).toBe('1k');
    expect(formatCompactNumber(1250)).toBe('1.3k');
    expect(formatCompactNumber(12400)).toBe('12k');
  });

  test('percent and initials', () => {
    expect(toPercent(0.724)).toBe(72);
    expect(toPercent(1.4)).toBe(100);
    expect(initialsOf('Grace')).toBe('G');
    expect(initialsOf('  ada  lovelace byron ')).toBe('AL');
  });
});

describe('curve art', () => {
  const frame = { xMin: -1, xMax: 1, yMin: -1, yMax: 1, left: 0, top: 0, width: 100, height: 100 };

  test('maps maths coordinates to SVG (y up → y down)', () => {
    expect(toCanvas(frame, -1, 1)).toEqual([0, 0]);
    expect(toCanvas(frame, 1, -1)).toEqual([100, 100]);
  });

  test('plots a function as a single path', () => {
    const d = plotFunction((x) => x, frame, 4);
    expect(d).toBe('M0 100 L25 75 L50 50 L75 25 L100 0');
  });

  test('tangent passes through the point with the derivative slope', () => {
    const { path, point } = tangentSegment((x) => x * x, 0.5, 0.25, frame);
    expect(point).toEqual(toCanvas(frame, 0.5, 0.25));
    // y = x² has slope 1 at x = 0.5 → endpoints (0.25, 0) and (0.75, 0.5).
    expect(path).toBe(`M${toCanvas(frame, 0.25, 0).join(' ')} L${toCanvas(frame, 0.75, 0.5).join(' ')}`);
  });
});

describe('dashboard data', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('a new learner sees real Integration data, not placeholder progress', async () => {
    const result = await dashboardRepository.getDashboard('learner-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { continueLearning, stats, nextAction, recentActivities, review } = result.data;
    expect(continueLearning?.subject).toBe('Integration');
    expect(continueLearning?.topicTitle).toBe('Understanding Integration');
    expect(continueLearning?.isStarted).toBe(false);
    expect(continueLearning?.progress).toBe(0);
    expect(stats).toEqual({ streakDays: 0, xp: 0, practice: { checked: 0, correct: 0 } });
    // Nothing started yet: Continue learning is the only suggestion.
    expect(nextAction).toBeNull();
    expect(recentActivities).toHaveLength(0);
    expect(review.conceptsNeedingAttention).toBe(0);
  });

  test('completed lesson steps show up as real progress and recent activity', async () => {
    await devLessonProgress.completeSection('learner-1', 'integration-understanding', 'concept');
    const result = await dashboardRepository.getDashboard('learner-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.continueLearning?.isStarted).toBe(true);
    expect(result.data.continueLearning?.progress).toBeGreaterThan(0);
    expect(result.data.recentActivities[0]?.title).toBe('Understanding Integration');
    // This subtopic has no practice questions of its own, so nothing is suggested beyond Continue.
    expect(result.data.nextAction).toBeNull();
  });

  test('Home continues the topic worked on most recently, and recent activity spans every topic', async () => {
    await devLessonProgress.completeSection('learner-1', 'integration-understanding', 'concept');
    await new Promise((r) => setTimeout(r, 5));
    await devLessonProgress.completeSection('learner-1', 'rn-partial-derivatives', 'concept');
    const result = await dashboardRepository.getDashboard('learner-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.continueLearning?.subject).toBe('Differential Calculus in ℝⁿ');
    // A started subtopic with practice and no answers checked yet: suggest that practice.
    expect(result.data.nextAction).toMatchObject({ id: 'try-practice', title: 'Practise Partial Derivatives' });
    expect(result.data.recentActivities.map((a) => a.title)).toEqual([
      'Partial Derivatives',
      'Understanding Integration',
    ]);
    expect(result.data.recentActivities[0]?.kindLabel).toBe('Differential Calculus in ℝⁿ lesson');
  });

  test('preview mock values are within valid ranges and ids are unique', () => {
    const data = createMockDashboardData(at(10));
    expect(data.continueLearning?.progress).toBeGreaterThanOrEqual(0);
    expect(data.continueLearning?.progress).toBeLessThanOrEqual(1);
    expect(data.stats.practice.correct).toBeLessThanOrEqual(data.stats.practice.checked);
    const ids = data.recentActivities.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('empty learner has no current lesson and nothing to review', () => {
    const data = createEmptyDashboardData();
    expect(data.continueLearning).toBeNull();
    expect(data.recentActivities).toHaveLength(0);
    expect(data.review.conceptsNeedingAttention).toBe(0);
  });
});

describe('next best step (rule-based)', () => {
  const topic = getTopic(DEFAULT_TOPIC_ID)!;
  const started = computeTopicProgress(topic, [
    {
      unitId: 'integration-understanding',
      sectionKey: 'concept',
      status: 'completed',
      completedAt: '2026-10-01T10:00:00Z',
    },
  ]);

  test('open mistakes come first', () => {
    const action = nextAction(topic, started, { openMistakes: 2, practice: { checked: 10 } });
    expect(action).toMatchObject({ id: 'review-mistakes', title: 'Review 2 mistakes', href: '/mistakes' });
  });

  test('enough practice already checked and no mistakes: nothing beyond Continue learning', () => {
    expect(nextAction(topic, started, { openMistakes: 0, practice: { checked: 5 } })).toBeNull();
  });

  test('never suggests practice for a subtopic the learner has not started', () => {
    expect(
      nextAction(topic, computeTopicProgress(topic, []), { openMistakes: 0, practice: { checked: 0 } }),
    ).toBeNull();
  });
});
