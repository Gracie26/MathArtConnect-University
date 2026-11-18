/**
 * Topic 2 Reflect and Review: every subtopic has one mathematical reflection,
 * a recap from the notes, and App practice retrieval questions whose answers
 * the checker accepts; the next action uses real history only.
 */
import { areaTopic } from '@/content/topics/area';
import { AREA_RETRIEVAL, AREA_REVIEW } from '@/content/topics/area/review';
import { buildUnitReview, nextAction } from '@/features/review/buildReview';
import { checkDefiniteAnswer, compileDefinite } from '@/lib/math/definite';
import type { QuestionAttemptRecord } from '@/services/repositories/types';

const EMPTY = { attempts: [], games: [], art: [], activity: [] };

describe('Reflect and Review content', () => {
  test.each(areaTopic.units.map((u) => [u.title, u]))(
    '%s has Play, Create, Reflect and Review available',
    (_t, unit) => {
      const byKey = new Map(unit.steps.map((s) => [s.key, s]));
      for (const key of ['play', 'create', 'reflect', 'review']) {
        expect(byKey.get(key)?.availability.status).toBe('available');
        expect(byKey.get(key)?.required).toBe(false);
      }
      const reflect = byKey.get('reflect')!.blocks[0];
      expect(reflect?.type === 'reflect' && reflect.question.length > 30).toBe(true);
      const review = byKey.get('review')!.blocks;
      expect(review.map((b) => b.type)).toEqual([
        'summary',
        'formulaList',
        'summary',
        'callout',
        'practiceGroup',
        'review',
      ]);
      const play = byKey.get('play')!.blocks.find((b) => b.type === 'activities');
      const create = byKey.get('create')!.blocks.find((b) => b.type === 'activities');
      expect(play?.type === 'activities' && play.activities.every((a) => a.kind === 'game')).toBe(true);
      expect(create?.type === 'activities' && create.activities.every((a) => a.kind === 'studio')).toBe(true);
      const explore = byKey.get('explore')!.blocks.find((b) => b.type === 'activities');
      expect(explore?.type === 'activities' && explore.activities.every((a) => a.kind === 'lab')).toBe(true);
    },
  );

  test('every subtopic has one or two App practice questions, labelled and kept out of course practice', () => {
    for (const unit of areaTopic.units) {
      const items = AREA_RETRIEVAL.filter((i) => i.unitId === unit.id);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.length).toBeLessThanOrEqual(2);
      expect(AREA_REVIEW[unit.id as keyof typeof AREA_REVIEW].errors.length).toBeGreaterThan(0);
    }
    expect(AREA_RETRIEVAL.every((i) => i.sourceType === 'app-practice' && i.id.startsWith('app2-'))).toBe(true);
    expect(areaTopic.practiceItems?.some((i) => i.sourceType === 'app-practice')).toBe(false);
    expect(areaTopic.retrievalItems).toHaveLength(AREA_RETRIEVAL.length);
  });

  test.each(AREA_RETRIEVAL.map((i) => [i.id, i]))(
    '%s: the model answer is accepted and a wrong one is not',
    (_id, item) => {
      const problem = compileDefinite(item.definite!);
      const answer = item.definite!.answer;
      const right =
        answer.kind === 'value'
          ? String(answer.value)
          : answer.kind === 'values'
            ? answer.values.join(', ')
            : answer.kind === 'divergent'
              ? 'diverges'
              : answer.kind === 'verdict'
                ? answer.converges
                  ? 'converges'
                  : 'diverges'
                : '';
      expect(checkDefiniteAnswer(right, problem).status).toBe('correct');
      const wrong =
        answer.kind === 'verdict'
          ? answer.converges
            ? 'diverges'
            : 'converges'
          : answer.kind === 'divergent'
            ? '3'
            : answer.kind === 'values'
              ? answer.values.map((v) => v + 1).join(', ')
              : '1000';
      expect(checkDefiniteAnswer(wrong, problem).status).not.toBe('correct');
    },
  );
});

describe('next action', () => {
  const unit = areaTopic.units[0]!;
  const items = [...(areaTopic.practiceItems ?? []), ...(areaTopic.retrievalItems ?? [])];
  const attempt = (questionId: string, isCorrect: boolean): QuestionAttemptRecord =>
    ({
      id: `a-${questionId}-${String(isCorrect)}`,
      topicId: areaTopic.id,
      unitId: unit.id,
      questionId,
      retryOfId: null,
      learnerAnswer: {},
      isCorrect,
      hintsUsed: 0,
      hintLevelsViewed: [],
      viewedSteps: false,
      viewedAnswer: false,
      answeredAt: new Date().toISOString(),
      reviewResolvedAt: null,
    }) as unknown as QuestionAttemptRecord;

  test('with no history it suggests retrieval practice, never mastery', () => {
    const review = buildUnitReview(unit.id, EMPTY, items, areaTopic.activities);
    const next = nextAction(unit.id, review, areaTopic.activities);
    expect(next.text).toMatch(/App practice/);
    expect(next.text).not.toMatch(/master/i);
  });

  test('an open mistake comes first; after practice the unplayed game is next', () => {
    const retrieval = AREA_RETRIEVAL.find((i) => i.unitId === unit.id)!;
    const wrong = buildUnitReview(
      unit.id,
      { ...EMPTY, attempts: [attempt(retrieval.id, false)] },
      items,
      areaTopic.activities,
    );
    expect(nextAction(unit.id, wrong, areaTopic.activities).text).toMatch(/^Retry/);
    const right = buildUnitReview(
      unit.id,
      { ...EMPTY, attempts: [attempt(retrieval.id, true)] },
      items,
      areaTopic.activities,
    );
    const next = nextAction(unit.id, right, areaTopic.activities);
    expect(next.activity?.id).toBe('riemann-builder');
  });
});
