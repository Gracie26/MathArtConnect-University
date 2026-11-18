/**
 * Every anti-derivative the app stores is checked by differentiation: the
 * numerical derivative of the displayed answer must equal the displayed
 * integrand at sample points. This covers the UNAM worked-example results and
 * every app-authored practice solution (which stay `pendingLecturerReview`
 * whatever this test says).
 */
import { INTEGRATION_APP_PRACTICE } from '@/content/topics/integration/appPractice';
import { CHAPTER1_PRACTICE } from '@/content/topics/integration/chapterPractice';
import { TUTORIAL1_ITEMS } from '@/content/topics/integration/tutorial1';
import { TUTORIAL2_CHAPTER1_ITEMS } from '@/content/topics/integration/tutorial2';
import { checkFinalAnswer } from '@/lib/math/check';
import { integrationTopic } from '@/content/topics/integration';
import type { ContentBlock } from '@/content/types';
import { checkProblemFor } from '@/features/practice/checkProblem';
import { checkAntiderivative, evaluateTex, type Vars } from '@/lib/math/tex/evaluate';

const DEFAULT_POINTS = [0.35, 0.8, 1.4, 2.2];

interface Domain {
  points?: number[];
  variable?: string;
  constants?: Vars;
}

/** Domains for the chapter worked examples (practice items carry their own `check` data). */
const EXAMPLE_DOMAINS: Record<string, Domain> = {
  'ch1-1.8-ex-1': { constants: { a: 2 } },
};

/** Items whose stored answer is not a single anti-derivative expression, checked separately below. */
const CHECKED_SEPARATELY = new Set(['tut1-q10']);

function verify(problemTex: string, answerTex: string, domain: Domain) {
  const { checks, failures } = checkAntiderivative({
    problemTex,
    answerTex,
    variable: domain.variable,
    constants: domain.constants,
    points: domain.points ?? DEFAULT_POINTS,
  });
  expect(checks.length).toBeGreaterThanOrEqual(3);
  expect(failures).toEqual([]);
}

describe('the checker itself', () => {
  test.each([
    ['\\int x^{2}\\,dx', '\\frac{x^{3}}{2} + C'],
    ['\\int \\sin 10x\\,dx', '\\frac{1}{10}\\cos 10x + C'],
    ['\\int \\frac{dx}{x^{2}-4x+5}', '\\tan^{-1}(x+2) + C'],
    ['\\int x\\ln x\\,dx', '\\frac{x^{2}}{2}\\ln x + C'],
  ])('rejects a wrong answer to %s', (problemTex, answerTex) => {
    const { checks, failures } = checkAntiderivative({ problemTex, answerTex, points: DEFAULT_POINTS });
    expect(checks.length).toBeGreaterThanOrEqual(3);
    expect(failures.length).toBeGreaterThan(0);
  });

  test('refuses notation it does not understand instead of guessing', () => {
    expect(() => evaluateTex('\\text{In}|x|', { x: 1 })).toThrow();
  });
});

describe('practice solutions differentiate back to the integrand', () => {
  const items = [...TUTORIAL1_ITEMS, ...CHAPTER1_PRACTICE, ...INTEGRATION_APP_PRACTICE];

  test('every practice item has a solution, and every solution is pending lecturer review', () => {
    for (const item of items) {
      expect(item.solution).toBeDefined();
      expect(item.solution?.status).toBe('pendingLecturerReview');
    }
  });

  test.each(items.filter((i) => !CHECKED_SEPARATELY.has(i.id)).map((i) => [i.id, i] as const))('%s', (_id, item) => {
    verify(item.problemTex, item.solution?.answerTex ?? '', item.check);
  });

  test.each(items.map((i) => [i.id, i] as const))('%s: the in-app checker can evaluate its integrand', (_id, item) => {
    const problem = checkProblemFor(item);
    expect(problem).not.toBeNull();
    const finite = item.check.points.filter((x) => Number.isFinite(problem!.integrand(x)));
    expect(finite.length).toBeGreaterThanOrEqual(3);
  });

  test('tut1-q10: ln|sec x + tan x| differentiates to sec x and equals ln|tan(π/4 + x/2)|', () => {
    for (const x of [0.2, 0.6, 1.1, -0.4]) {
      const h = 1e-5;
      const F = (v: number) => evaluateTex('\\ln|\\sec x + \\tan x|', { x: v });
      expect((F(x + h) - F(x - h)) / (2 * h)).toBeCloseTo(1 / Math.cos(x), 6);
      expect(F(x)).toBeCloseTo(
        evaluateTex('\\ln\\left|\\tan\\left(\\frac{1}{4}\\pi + \\frac{1}{2}x\\right)\\right|', { x }),
        9,
      );
    }
  });
});

describe('UNAM worked-example results differentiate back to the integrand', () => {
  type Example = Extract<ContentBlock, { type: 'workedExample' }>;
  const examples = integrationTopic.units.flatMap((u) =>
    u.steps.flatMap((s) => s.blocks.filter((b): b is Example => b.type === 'workedExample')),
  );
  /** Results that are not anti-derivatives of the problem (definitions, derivations, a reduced integral, a definite value). */
  const NOT_ANTIDERIVATIVES = new Set([
    'ch1-1.1-ex-2x',
    'ch1-1.1-ex-a',
    'ch1-1.1-ex-b',
    'ch1-1.8-ex-rationalise',
    'ch1-1.12-ex-xnex',
    'ch1-1.12-ex-n12',
    'ch1-1.12-ex-sinn',
    'ch1-1.13-ex-definite',
  ]);
  const checkable = examples.filter((e) => !NOT_ANTIDERIVATIVES.has(e.source.inventoryId ?? ''));

  test('28 printed results are checked', () => {
    expect(checkable).toHaveLength(28);
  });

  test.each(checkable.map((e) => [e.source.inventoryId ?? e.title, e] as const))('%s', (id, example) => {
    verify(example.problemTex, example.resultTex, EXAMPLE_DOMAINS[id] ?? {});
  });

  test('ch1-1.12-ex-n12: the reduction formula results for n = 2', () => {
    verify('\\int x^{2}e^{x}\\,dx', 'x^{2}e^{x} - 2xe^{x} + 2e^{x} + C', {});
  });

  test('ch1-1.13-ex-definite: the definite integral is 0 (Simpson’s rule)', () => {
    const n = 2000;
    const h = (2 * Math.PI) / n;
    let sum = 0;
    for (let i = 0; i <= n; i++) {
      const weight = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
      sum += weight * Math.sin(8 * i * h) * Math.cos(6 * i * h);
    }
    expect((sum * h) / 3).toBeCloseTo(0, 8);
  });

  test('ch1-1.1 examples: G′(x) matches f(x)', () => {
    for (const x of DEFAULT_POINTS) {
      const h = 1e-5;
      const G = (v: number) => evaluateTex('x^{2} + 5x + C', { x: v });
      expect((G(x + h) - G(x - h)) / (2 * h)).toBeCloseTo(2 * x + 5, 6);
    }
  });
});

describe('Tutorial 2 Question 1(a)–(g) (Chapter 1 methods, in Topic 1)', () => {
  /** A correct final answer for each part, typed as a learner would. */
  const ANSWERS: Record<string, string> = {
    'tut2-q1-a': 'x^(m+1)(ln x/(m+1) - 1/(m+1)^2) + C',
    'tut2-q1-b': '-sin^(n-1) x cos x/n + (n-1)/n ∫ sin^(n-2) x dx',
    'tut2-q1-c': 'x^n e^(ax)/a - n/a ∫ x^(n-1) e^(ax) dx',
    'tut2-q1-d': 'sin^7 x/7 - 2 sin^9 x/9 + sin^11 x/11 + C',
    'tut2-q1-e': 'sec^(n-2) x tan x/(n-1) + (n-2)/(n-1) ∫ sec^(n-2) x dx',
    'tut2-q1-f': 'x (ln x)^n - n ∫ (ln x)^(n-1) dx',
    'tut2-q1-g': 'e^x (x^3 - 3x^2 + 6x - 6) + C',
  };

  test.each(TUTORIAL2_CHAPTER1_ITEMS.map((i) => [i.id, i] as const))('%s: a correct answer is accepted', (id, item) => {
    const problem = checkProblemFor(item);
    expect(problem).not.toBeNull();
    const result = checkFinalAnswer(ANSWERS[id]!, problem!, { allowIntegral: item.check.answerMayContainIntegral });
    expect(result.status).toBe('correct');
    expect(item.solution?.status).toBe('pendingLecturerReview');
  });

  test('a wrong reduction formula is rejected', () => {
    const item = TUTORIAL2_CHAPTER1_ITEMS.find((i) => i.id === 'tut2-q1-b')!;
    const result = checkFinalAnswer('-sin^(n-1) x cos x/n + 1/n ∫ sin^(n-2) x dx', checkProblemFor(item)!, {
      allowIntegral: true,
    });
    expect(result.status).toBe('incorrect');
  });

  test('the stored anti-derivatives for (a), (d) and (g) differentiate back to the integrand', () => {
    for (const id of ['tut2-q1-a', 'tut2-q1-d', 'tut2-q1-g']) {
      const item = TUTORIAL2_CHAPTER1_ITEMS.find((i) => i.id === id)!;
      verify(item.check.integrandTex!, item.solution!.answerTex, item.check);
    }
  });
});
