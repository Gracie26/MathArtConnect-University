import { estimateTopicMinutes } from '@/content/estimate';
import { integrationTopic } from '@/content/topics/integration';
import { buildContinueLearning } from '@/features/learning/navigation';
import {
  computeSubtopicProgress,
  computeTopicProgress,
  estimateMastery,
  MIN_ATTEMPTS_FOR_ESTIMATE,
} from '@/features/learning/progress';
import type { LessonProgressEntry } from '@/services/repositories/types';

const unit = integrationTopic.units[0]!;
const done = (unitId: string, sectionKey: string): LessonProgressEntry => ({
  unitId,
  sectionKey,
  status: 'completed',
  completedAt: '2026-10-12T10:00:00Z',
});

describe('subtopic progress', () => {
  test('nothing saved → not started, starting at the first step', () => {
    const progress = computeSubtopicProgress(unit, []);
    expect(progress.status).toBe('notStarted');
    expect(progress.fraction).toBe(0);
    expect(progress.nextStepKey).toBe('concept');
  });

  test('completed steps move it to in progress and point at the next available step', () => {
    const progress = computeSubtopicProgress(unit, [done(unit.id, 'concept'), done(unit.id, 'see-it')]);
    expect(progress.status).toBe('inProgress');
    expect(progress.requiredDone).toBe(2);
    // Explore is now built, so it is the next available step (optional, but in lesson order).
    expect(progress.nextStepKey).toBe('explore');
  });

  test('cannot look finished while a required step is not built yet', () => {
    // A subtopic whose required Try it step is still planned for a later phase.
    const withPlannedStep = {
      ...unit,
      steps: unit.steps.map((s) =>
        s.kind === 'try-it'
          ? { ...s, required: true, availability: { status: 'planned' as const, phase: 9, preview: '' } }
          : s,
      ),
    };
    const available = withPlannedStep.steps.filter((s) => s.availability.status === 'available').map((s) => s.key);
    const progress = computeSubtopicProgress(
      withPlannedStep,
      available.map((key) => done(unit.id, key)),
    );
    expect(progress.status).toBe('inProgress');
    expect(progress.fraction).toBeLessThan(1);
    expect(progress.nextStepKey).toBeNull();
  });

  test('completes once every required step with content is done', () => {
    const required = unit.steps.filter((s) => s.required).map((s) => s.key);
    const progress = computeSubtopicProgress(
      unit,
      required.map((key) => done(unit.id, key)),
    );
    expect(progress.status).toBe('completed');
    expect(progress.fraction).toBe(1);
  });

  test('only completed rows for real steps of this subtopic count', () => {
    const progress = computeSubtopicProgress(unit, [
      { ...done(unit.id, 'concept'), status: 'in_progress' },
      done(unit.id, 'no-such-step'),
      done('another-unit', 'concept'),
    ]);
    expect(progress.status).toBe('notStarted');
  });
});

describe('topic progress', () => {
  test('a new learner: 0%, current subtopic is the first, full time remaining', () => {
    const progress = computeTopicProgress(integrationTopic, []);
    expect(progress.fraction).toBe(0);
    expect(progress.started).toBe(false);
    expect(progress.currentUnitId).toBe(unit.id);
    expect(progress.minutesRemaining).toBe(estimateTopicMinutes(integrationTopic));
  });

  test('continue learning opens the current subtopic at its next step', () => {
    const progress = computeTopicProgress(integrationTopic, [done(unit.id, 'concept')]);
    const item = buildContinueLearning(integrationTopic, progress);
    expect(item?.subject).toBe('Integration');
    expect(item?.topicTitle).toBe('Understanding Integration');
    expect(item?.isStarted).toBe(true);
    expect(item?.href).toEqual({
      pathname: '/topic/[topicId]/[subtopicId]',
      params: { topicId: 'integration', subtopicId: 'understanding-integration', step: 'see-it' },
    });
  });
});

describe('current mastery estimate', () => {
  test('no estimate until there is enough graded practice', () => {
    expect(estimateMastery({ attempts: [], quizScores: [] })).toEqual({
      kind: 'insufficientEvidence',
      attemptsNeeded: MIN_ATTEMPTS_FOR_ESTIMATE,
    });
  });

  const attempts = (
    n: number,
    overrides: Partial<{ correct: boolean; hintsUsed: number; independent: boolean; isRetry: boolean }>,
  ) =>
    Array.from({ length: n }, () => ({ correct: true, hintsUsed: 0, independent: true, isRetry: false, ...overrides }));

  test('independent, unaided correct work scores highest; hint dependence lowers the estimate', () => {
    const unaided = estimateMastery({ attempts: attempts(10, {}), quizScores: [] });
    const withHints = estimateMastery({ attempts: attempts(10, { hintsUsed: 2 }), quizScores: [] });
    expect(unaided).toEqual({ kind: 'estimate', percent: 100, basedOnAttempts: 10 });
    expect(withHints.kind === 'estimate' && withHints.percent).toBe(60);
  });

  test('quiz results are blended in and the estimate stays within 0–100', () => {
    const result = estimateMastery({ attempts: attempts(10, { correct: false }), quizScores: [0.5] });
    expect(result).toEqual({ kind: 'estimate', percent: 20, basedOnAttempts: 10 });
  });
});
