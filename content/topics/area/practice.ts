/**
 * Practice items for Topic 2: shared builder, methods and generated
 * walkthroughs for the numerical approximations.
 *
 * The notes print no answer for Exercise 2.2.1 and Tutorial 2 has no answer
 * key, so every solution and hint here is app-authored,
 * `pendingLecturerReview` (MR2-SOL), and shown only as clearly labelled app
 * guidance. Each stored value is checked numerically in
 * __tests__/area-solutions.test.ts; that never changes the review status.
 */
import type { PracticeItem, PracticeModeId, WorkedStep } from '../../types';
import type { DefiniteSpec } from '@/lib/math/definite';
import { riemannSum, type RiemannRule } from '@/lib/figures/scene';

import { AREA_TOPIC_ID, type AreaUnitId } from './ids';
import { AREA_MANUAL_REVIEW, blocksLearnerUse } from './manualReview';

export const AREA_TECHNIQUES = {
  'riemann-approximation': 'Rectangles with left and right endpoints',
  'riemann-expression': 'Writing the limit of a Riemann sum',
  'riemann-limit': 'Integrals as limits of Riemann sums',
  'midpoint-rule': 'The Mid-point Rule',
  properties: 'Properties of the definite integral',
  'ftc-evaluate': 'Evaluating with the Fundamental Theorem',
  'improper-type1': 'Improper integrals over infinite intervals',
  'improper-type2': 'Improper integrals with discontinuous integrands',
  'comparison-test': 'The Comparison Test',
} as const;

export type AreaTechnique = keyof typeof AREA_TECHNIQUES;

const CONCEPTUAL_HINTS: Record<AreaTechnique, string> = {
  'riemann-approximation':
    'Each rectangle has width $\\Delta x$ and a height read from the curve at one end of its subinterval: the right end for $R_{n}$, the left end for $L_{n}$.',
  'riemann-expression':
    'An area is the limit of a sum of rectangle areas. Each term of the sum is a height $f(x_{i})$ times the width $\\Delta x$.',
  'riemann-limit':
    'Theorem 2.2.1: the definite integral is the limit, as $n \\to \\infty$, of $\\sum_{i=1}^{n} f(x_{i})\\Delta x$ with $\\Delta x = \\frac{b-a}{n}$ and $x_{i} = a + i\\Delta x$.',
  'midpoint-rule':
    'The Mid-point Rule uses the height of the curve at the middle $\\bar{x}_{i}$ of each subinterval: $\\Delta x\\,[f(\\bar{x}_{1}) + \\cdots + f(\\bar{x}_{n})]$.',
  properties:
    'Use the properties in §2.2.2 (reversing the limits, constant multiples, sums and differences, $\\int_{a}^{b} k\\,dx = k(b-a)$) so that only integrals you already know appear.',
  'ftc-evaluate':
    'Theorem 2.3.1: find any anti-derivative $F$ of the integrand, then the integral is $F(b) - F(a)$. No $+C$ is needed.',
  'improper-type1':
    'A limit of integration is infinite, so integrate up to a number $t$ first and then let $t \\to \\infty$ (or $t \\to -\\infty$), as in Definition 2.5.1.',
  'improper-type2':
    'The integrand is unbounded at a point of the interval. Integrate up to $t$ next to that point, then take the one-sided limit (Definitions 2.5.2 to 2.5.4).',
  'comparison-test':
    'Theorem 2.5.1: compare the integrand with a simpler function. Below a function with a convergent integral means convergent; above one with a divergent integral means divergent.',
};

const NEXT_ACTIONS: Record<AreaTechnique, string> = {
  'riemann-approximation': 'Find $\\Delta x = \\frac{b-a}{n}$ and list the endpoints $x_{0}, x_{1}, \\ldots, x_{n}$.',
  'riemann-expression': 'Find $\\Delta x = \\frac{b-a}{n}$ and $x_{i} = a + i\\Delta x$.',
  'riemann-limit': 'Find $\\Delta x = \\frac{b-a}{n}$ and $x_{i} = a + i\\Delta x$, then write $f(x_{i})\\Delta x$.',
  'midpoint-rule': 'Find $\\Delta x$, then the midpoints $\\bar{x}_{i} = \\frac{1}{2}(x_{i-1} + x_{i})$.',
  properties: 'Rewrite the integral as a combination of the given integrals.',
  'ftc-evaluate': 'Find an anti-derivative of the integrand.',
  'improper-type1': 'Replace the infinite limit by $t$ and integrate.',
  'improper-type2': 'Find where the integrand is unbounded, and replace that limit by $t$.',
  'comparison-test':
    'Find a simpler function that is larger (or smaller) than the integrand for every $x$ in the interval.',
};

const MODE_FOR_DIFFICULTY: Record<1 | 2 | 3, PracticeModeId> = { 1: 'guided', 2: 'independent', 3: 'challenge' };

export interface AreaPracticeSpec {
  instruction?: string;
  problem: string;
  condition?: string;
  technique: AreaTechnique;
  difficulty: 1 | 2 | 3;
  method: string;
  /** Solution steps as [explanation, tex?]. */
  steps: [string, string?][];
  answer: string;
  /** How the answer is checked; absent only for an item withheld before it can be checked. */
  definite?: DefiniteSpec;
  reviewIds?: string[];
}

const toSteps = (steps: [string, string?][]): WorkedStep[] =>
  steps.map(([explanation, tex]) => (tex ? { explanation, tex } : { explanation }));

function hintsFor(spec: AreaPracticeSpec): [string, string, string] {
  const first = spec.steps[0]?.[0] ?? '';
  return [CONCEPTUAL_HINTS[spec.technique], spec.method, first.length >= 25 ? first : NEXT_ACTIONS[spec.technique]];
}

export function buildAreaItem(
  base: Pick<
    PracticeItem,
    'id' | 'sourceType' | 'source' | 'sourceQuestion' | 'sourceSubquestion' | 'sourceSection'
  > & {
    unitId: AreaUnitId;
  },
  spec: AreaPracticeSpec,
): PracticeItem {
  const reviewIds = [...new Set(spec.reviewIds ?? [])];
  const known = new Set(AREA_MANUAL_REVIEW.map((m) => m.id));
  for (const id of reviewIds) if (!known.has(id)) throw new Error(`Unknown review item ${id}`);
  return {
    ...base,
    topicId: AREA_TOPIC_ID,
    instruction: spec.instruction ?? 'Evaluate',
    problemTex: spec.problem,
    ...(spec.condition ? { condition: spec.condition } : {}),
    technique: spec.technique,
    techniqueLabel: AREA_TECHNIQUES[spec.technique],
    difficulty: spec.difficulty,
    recommendedPracticeMode: MODE_FOR_DIFFICULTY[spec.difficulty],
    supportsHints: true,
    supportsStepValidation: spec.definite !== undefined,
    needsManualReview: reviewIds.length > 0,
    reviewIds,
    withheldFromLearners: blocksLearnerUse(reviewIds),
    isExtension: false,
    check: { variable: spec.definite?.variable ?? 'x', points: [], constants: {} },
    ...(spec.definite ? { definite: spec.definite } : {}),
    hints: hintsFor(spec),
    solution: {
      status: 'pendingLecturerReview',
      method: spec.method,
      steps: toSteps(spec.steps),
      answerTex: spec.answer,
      verification: 'notVerified',
    },
  };
}

// -----------------------------------------------------------------------------
// Generated walkthroughs for the numerical approximations (Tutorial 2 Q10–Q12)
// -----------------------------------------------------------------------------

/** Six decimal places, trailing zeros kept (as in Example 2.2.3's working). */
export const sixDp = (v: number): string => v.toFixed(6);

const RULE_POINT: Record<Exclude<RiemannRule, 'sample'>, string> = {
  right: 'right endpoints',
  left: 'left endpoints',
  midpoint: 'midpoints',
};

/**
 * Walkthrough of one rectangle approximation: Δx, the points used, the
 * heights and the sum. `pointTex` prints a point exactly (e.g. "\\frac{\\pi}{8}").
 */
export function approximationSteps(options: {
  f: (x: number) => number;
  fTex: (pointTex: string) => string;
  a: number;
  b: number;
  n: number;
  rule: Exclude<RiemannRule, 'sample'>;
  dxTex: string;
  pointTex: (k: number) => string;
  name: string;
}): { steps: [string, string?][]; value: number } {
  const { f, a, b, n, rule } = options;
  const dx = (b - a) / n;
  const indices = Array.from({ length: n }, (_, k) => k + 1);
  const offset = (i: number) => (rule === 'right' ? i : rule === 'left' ? i - 1 : i - 0.5);
  const points = indices.map((i) => a + offset(i) * dx);
  const heights = points.map(f);
  const value = riemannSum(f, a, b, n, rule);
  const pointsTex = indices.map((i) => options.pointTex(offset(i) * 2)).join(',\\; ');
  return {
    steps: [
      [`Width of each subinterval, with $n = ${n}$:`, `\\Delta x = ${options.dxTex}`],
      [`The ${RULE_POINT[rule]} of the ${n} subintervals are`, pointsTex],
      [
        'Evaluate the function at each of them:',
        heights.map((h, k) => `${options.fTex(options.pointTex(offset(k + 1) * 2))} = ${sixDp(h)}`).join(',\\; '),
      ],
      [
        `Add the heights and multiply by $\\Delta x$:`,
        `${options.name} = \\Delta x\\,[${heights.map(sixDp).join(' + ')}] = ${sixDp(value)}`,
      ],
    ],
    value,
  };
}
