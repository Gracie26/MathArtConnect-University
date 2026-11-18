import {
  ESTIMATE_RATES,
  estimateSubtopicMinutes,
  estimateTopicMinutes,
  formatStudyTime,
  practiseSetItems,
  remainingSubtopicMinutes,
  roundStudyMinutes,
  spokenStudyTime,
  stepMinutes,
} from '@/content/estimate';
import { listLearnerTopics } from '@/content/registry';
import { integrationTopic, INTEGRATION_UNITS } from '@/content/topics/integration';
import type { LearningUnitDefinition } from '@/content/types';
import { computeTopicProgress } from '@/features/learning/progress';

const unit = (id: string) => integrationTopic.units.find((u) => u.id === id)!;

describe('display rounding (no false precision)', () => {
  test.each([
    [0, '0 min'],
    [3.2, '3 min'],
    [9.4, '9 min'],
    [12, '10 min'],
    [47, '45 min'],
    [58, '1 hr'],
    [80, '1 hr 20 min'],
    [359, '6 hr'],
    [137, '2 hr 15 min'],
  ])('%d minutes → %s', (minutes, text) => {
    expect(formatStudyTime(minutes)).toBe(text);
  });

  test('larger totals are multiples of 5 minutes', () => {
    for (let m = 10; m < 400; m += 7) expect(roundStudyMinutes(m) % 5).toBe(0);
  });

  test('spoken form for screen readers', () => {
    expect(spokenStudyTime(1)).toBe('about 1 minute');
    expect(spokenStudyTime(80)).toBe('about 1 hour 20 minutes');
    expect(spokenStudyTime(120)).toBe('about 2 hours');
  });
});

describe('estimates come from the content', () => {
  test('a topic is the sum of its subtopics', () => {
    for (const topic of listLearnerTopics()) {
      expect(estimateTopicMinutes(topic)).toBe(topic.units.reduce((s, u) => s + estimateSubtopicMinutes(u), 0));
    }
  });

  test('every learner subtopic has a realistic estimate (between 10 minutes and 2 hours)', () => {
    for (const topic of listLearnerTopics()) {
      for (const u of topic.units) {
        const minutes = estimateSubtopicMinutes(u);
        expect(minutes).toBeGreaterThanOrEqual(10);
        expect(minutes).toBeLessThanOrEqual(120);
      }
    }
  });

  test('a step planned for a later update counts nothing', () => {
    const base = unit(INTEGRATION_UNITS.understanding);
    const planned: LearningUnitDefinition = {
      ...base,
      steps: base.steps.map((s) =>
        s.key === 'concept' ? { ...s, availability: { status: 'planned', phase: 9, preview: '' } } : s,
      ),
    };
    const concept = base.steps.find((s) => s.key === 'concept')!;
    expect(stepMinutes(concept)).toBeGreaterThan(0);
    expect(estimateSubtopicMinutes(planned)).toBeLessThan(estimateSubtopicMinutes(base));
  });

  test('Practise counts one practice set (a couple of questions per method), not the whole bank', () => {
    for (const u of integrationTopic.units) {
      const practise = u.steps.find((s) => s.kind === 'practise');
      if (!practise) continue;
      expect(practiseSetItems(practise).length).toBeLessThanOrEqual(ESTIMATE_RATES.practiseSetMax);
    }
  });

  test('Topic 1 Try it steps now count their App practice', () => {
    for (const id of [INTEGRATION_UNITS.understanding, INTEGRATION_UNITS.basicRules]) {
      const tryIt = unit(id).steps.find((s) => s.key === 'try-it')!;
      expect(tryIt.availability.status).toBe('available');
      expect(stepMinutes(tryIt)).toBeGreaterThan(5);
    }
  });

  test('time left shrinks as steps are completed, and progress agrees with the estimate', () => {
    const u = unit(INTEGRATION_UNITS.understanding);
    const all = estimateSubtopicMinutes(u);
    expect(remainingSubtopicMinutes(u, new Set())).toBe(all);
    expect(remainingSubtopicMinutes(u, new Set(['concept', 'see-it']))).toBeLessThan(all);
    expect(remainingSubtopicMinutes(u, new Set(u.steps.map((s) => s.key)))).toBe(0);
    expect(computeTopicProgress(integrationTopic, []).minutesRemaining).toBe(estimateTopicMinutes(integrationTopic));
  });
});
