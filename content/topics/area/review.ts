/**
 * Reflect and Review for every Topic 2 subtopic.
 *
 * Reflect: one mathematical reflection question per subtopic (saved to the
 * learner's history; never graded). Review: a recap of the key concepts,
 * formulas, theorem conditions and common errors from the notes, one or two
 * App practice retrieval questions, and the learner's real history with a
 * next action (features/review). App practice is written for the app,
 * labelled so, and kept out of the course practice lists and counts.
 */
import type { ContentBlock, PracticeItem } from '../../types';

import { AREA_UNITS as U, type AreaUnitId } from './ids';
import { type AreaPracticeSpec, buildAreaItem } from './practice';
import { ch2, sectionId } from './sources';

// -----------------------------------------------------------------------------
// App practice retrieval questions
// -----------------------------------------------------------------------------

function appItem(id: string, unitId: AreaUnitId, section: string, page: number, spec: AreaPracticeSpec): PracticeItem {
  return buildAreaItem(
    {
      id: `app2-${id}`,
      sourceType: 'app-practice',
      source: ch2(section, page),
      sourceSection: sectionId(section),
      unitId,
    },
    spec,
  );
}

export const AREA_RETRIEVAL: readonly PracticeItem[] = [
  appItem('riemann-1', U.riemann, '2.2', 25, {
    instruction: 'Find L₄ and R₄, the left- and right-endpoint approximations with four rectangles, for',
    problem: 'f(x) = x^{2}, \\quad 0 \\le x \\le 2',
    technique: 'riemann-approximation',
    difficulty: 1,
    method: 'Δx = (2 − 0)/4 = 0.5; left endpoints 0, 0.5, 1, 1.5 and right endpoints 0.5, 1, 1.5, 2.',
    steps: [
      ['Width:', '\\Delta x = \\frac{2 - 0}{4} = 0.5'],
      ['Left endpoints:', 'L_{4} = 0.5\\,[0 + 0.25 + 1 + 2.25] = 1.75'],
      ['Right endpoints:', 'R_{4} = 0.5\\,[0.25 + 1 + 2.25 + 4] = 3.75'],
    ],
    answer: 'L_{4} = 1.75,\\quad R_{4} = 3.75',
    definite: {
      integrand: 'x^2',
      variable: 'x',
      lower: 0,
      upper: 2,
      answer: { kind: 'values', labels: ['L₄', 'R₄'], values: [1.75, 3.75] },
    },
  }),
  appItem('definite-1', U.definite, '2.2.1', 28, {
    instruction: 'Evaluate as the limit of Riemann sums (right endpoints)',
    problem: '\\int_{0}^{2} 3x\\,dx',
    technique: 'riemann-limit',
    difficulty: 1,
    method: 'Theorem 2.2.1 with Δx = 2/n and xᵢ = 2i/n, then formula (1) for Σi.',
    steps: [
      ['Width and right endpoints:', '\\Delta x = \\frac{2}{n},\\quad x_{i} = \\frac{2i}{n}'],
      [
        'Sum:',
        'R_{n} = \\sum_{i=1}^{n} 3\\cdot\\frac{2i}{n}\\cdot\\frac{2}{n} = \\frac{12}{n^{2}}\\cdot\\frac{n(n+1)}{2} = \\frac{6(n+1)}{n}',
      ],
      ['Limit:', '\\lim_{n \\to \\infty} \\frac{6(n+1)}{n} = 6'],
    ],
    answer: '6',
    definite: { integrand: '3x', variable: 'x', lower: 0, upper: 2, answer: { kind: 'value', value: 6 } },
  }),
  appItem('definite-2', U.definite, '2.2.1', 29, {
    instruction: 'Estimate with the Mid-point Rule using two subintervals',
    problem: '\\int_{0}^{2} x^{3}\\,dx',
    technique: 'midpoint-rule',
    difficulty: 1,
    method: 'Δx = 1; midpoints 0.5 and 1.5.',
    steps: [
      ['Width and midpoints:', '\\Delta x = 1,\\quad \\bar{x}_{1} = 0.5,\\quad \\bar{x}_{2} = 1.5'],
      ['Sum:', 'M_{2} = 1\\,[0.125 + 3.375] = 3.5'],
    ],
    answer: 'M_{2} = 3.5',
    definite: {
      integrand: 'x^3',
      variable: 'x',
      lower: 0,
      upper: 2,
      answer: { kind: 'value', value: 3.5, approximate: true },
    },
  }),
  appItem('properties-1', U.properties, '2.2.2', 30, {
    instruction: 'Use properties of definite integrals to evaluate',
    problem: '\\int_{3}^{0} (4x^{2} - 2x)\\,dx',
    condition: 'Given $\\int_{0}^{3} x^{2}\\,dx = 9$ and $\\int_{0}^{3} x\\,dx = \\frac{9}{2}$.',
    technique: 'properties',
    difficulty: 1,
    method: 'Reverse the limits (Theorem 2.2.3), then constant multiples and differences (Theorem 2.2.4 (i), (ii)).',
    steps: [
      ['Reverse the limits:', '\\int_{3}^{0} (4x^{2} - 2x)\\,dx = -\\int_{0}^{3} (4x^{2} - 2x)\\,dx'],
      [
        'Split and take out constants:',
        '-\\left(4\\int_{0}^{3} x^{2}\\,dx - 2\\int_{0}^{3} x\\,dx\\right) = -(36 - 9) = -27',
      ],
    ],
    answer: '-27',
    definite: { integrand: '4x^2 - 2x', variable: 'x', lower: 3, upper: 0, answer: { kind: 'value', value: -27 } },
  }),
  appItem('ftc-1', U.ftc, '2.3', 32, {
    instruction: 'Evaluate',
    problem: '\\int_{1}^{2} \\left(3x^{2} - \\frac{2}{x^{2}}\\right)dx',
    technique: 'ftc-evaluate',
    difficulty: 1,
    method: 'An anti-derivative is F(x) = x³ + 2/x; then F(2) − F(1) (Theorem 2.3.1).',
    steps: [
      ['Anti-derivative:', 'F(x) = x^{3} + \\frac{2}{x}'],
      ['Evaluate:', 'F(2) - F(1) = (8 + 1) - (1 + 2) = 6'],
    ],
    answer: '6',
    definite: { integrand: '3x^2 - 2/x^2', variable: 'x', lower: 1, upper: 2, answer: { kind: 'value', value: 6 } },
  }),
  appItem('mvt-1', U.mvt, '2.4', 33, {
    instruction: 'The mean value rectangle has the same area as the region under the curve. Find that area',
    problem: '\\int_{0}^{3} (x^{2} + 1)\\,dx',
    condition:
      'for $f(x) = x^{2} + 1$ on $[0, 3]$. (Then $f(c) = \\frac{1}{3}\\int_{0}^{3} f(x)\\,dx$ gives the height.)',
    technique: 'ftc-evaluate',
    difficulty: 1,
    method: 'Evaluate the integral with the FTC; the rectangle of width 3 then has height f(c) = area / 3.',
    steps: [
      ['Anti-derivative:', '\\left[\\frac{x^{3}}{3} + x\\right]_{0}^{3} = 9 + 3 = 12'],
      [
        'Height of the rectangle (Theorem 2.4.1):',
        'f(c) = \\frac{12}{3} = 4,\\quad c^{2} + 1 = 4,\\quad c = \\sqrt{3}',
      ],
    ],
    answer: '12',
    definite: { integrand: 'x^2 + 1', variable: 'x', lower: 0, upper: 3, answer: { kind: 'value', value: 12 } },
  }),
  appItem('type-one-1', U.typeOne, '2.5.1', 35, {
    instruction: 'Determine whether the integral converges, and evaluate it if it does',
    problem: '\\int_{2}^{\\infty} \\frac{1}{x^{3}}\\,dx',
    technique: 'improper-type1',
    difficulty: 1,
    method: 'Integrate from 2 to t, then let t → ∞ (Definition 2.5.1).',
    steps: [
      [
        'Up to t:',
        '\\int_{2}^{t} x^{-3}\\,dx = \\left[-\\frac{1}{2x^{2}}\\right]_{2}^{t} = \\frac{1}{8} - \\frac{1}{2t^{2}}',
      ],
      ['Limit:', '\\lim_{t \\to \\infty} \\left(\\frac{1}{8} - \\frac{1}{2t^{2}}\\right) = \\frac{1}{8}'],
    ],
    answer: '\\frac{1}{8}',
    definite: {
      integrand: 'x^(-3)',
      variable: 'x',
      lower: 2,
      upper: Infinity,
      answer: { kind: 'value', value: 0.125 },
    },
  }),
  appItem('type-one-2', U.typeOne, '2.5.1', 36, {
    instruction: 'Determine whether the integral converges, and evaluate it if it does',
    problem: '\\int_{1}^{\\infty} \\frac{1}{\\sqrt[3]{x}}\\,dx',
    technique: 'improper-type1',
    difficulty: 2,
    method: 'Integrate from 1 to t, then let t → ∞.',
    steps: [
      ['Up to t:', '\\int_{1}^{t} x^{-\\frac{1}{3}}\\,dx = \\frac{3}{2}\\left(t^{\\frac{2}{3}} - 1\\right)'],
      [
        'Limit:',
        '\\lim_{t \\to \\infty} \\frac{3}{2}\\left(t^{\\frac{2}{3}} - 1\\right) = \\infty, \\text{ so the integral diverges}',
      ],
    ],
    answer: '\\text{diverges}',
    definite: { integrand: 'x^(-1/3)', variable: 'x', lower: 1, upper: Infinity, answer: { kind: 'divergent' } },
  }),
  appItem('type-two-1', U.typeTwo, '2.5.2', 38, {
    instruction: 'Determine whether the integral converges, and evaluate it if it does',
    problem: '\\int_{0}^{4} \\frac{1}{\\sqrt{x}}\\,dx',
    technique: 'improper-type2',
    difficulty: 1,
    method: 'The integrand is unbounded at 0: integrate from t to 4, then let t → 0⁺ (Definition 2.5.3).',
    steps: [
      ['From t:', '\\int_{t}^{4} x^{-\\frac{1}{2}}\\,dx = \\left[2\\sqrt{x}\\right]_{t}^{4} = 4 - 2\\sqrt{t}'],
      ['Limit:', '\\lim_{t \\to 0^{+}} (4 - 2\\sqrt{t}) = 4'],
    ],
    answer: '4',
    definite: {
      integrand: '1/sqrt(x)',
      variable: 'x',
      lower: 0,
      upper: 4,
      singular: [0],
      answer: { kind: 'value', value: 4 },
    },
  }),
  appItem('type-two-2', U.typeTwo, '2.5.2', 39, {
    instruction: 'Determine whether the integral converges, and evaluate it if it does',
    problem: '\\int_{0}^{1} \\frac{1}{x^{2}}\\,dx',
    technique: 'improper-type2',
    difficulty: 2,
    method: 'Unbounded at 0: integrate from t to 1, then let t → 0⁺.',
    steps: [
      ['From t:', '\\int_{t}^{1} x^{-2}\\,dx = \\left[-\\frac{1}{x}\\right]_{t}^{1} = -1 + \\frac{1}{t}'],
      ['Limit:', '\\lim_{t \\to 0^{+}} \\left(\\frac{1}{t} - 1\\right) = \\infty, \\text{ so the integral diverges}'],
    ],
    answer: '\\text{diverges}',
    definite: { integrand: 'x^(-2)', variable: 'x', lower: 0, upper: 1, singular: [0], answer: { kind: 'divergent' } },
  }),
  appItem('comparison-1', U.comparison, '2.5.3', 41, {
    instruction: 'Use the Comparison Theorem to decide whether the integral converges or diverges',
    problem: '\\int_{1}^{\\infty} \\frac{1}{x^{2} + x}\\,dx',
    technique: 'comparison-test',
    difficulty: 1,
    method: 'For x ≥ 1, x² + x > x², so the integrand is below 1/x², whose integral converges.',
    steps: [
      ['Compare:', '0 \\le \\frac{1}{x^{2} + x} \\le \\frac{1}{x^{2}} \\text{ for } x \\ge 1'],
      [
        'Theorem 2.5.1 (a):',
        '\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx = 1 \\text{ converges, so the integral converges}',
      ],
    ],
    answer: '\\text{converges}',
    definite: {
      integrand: '1/(x^2 + x)',
      variable: 'x',
      lower: 1,
      upper: Infinity,
      answer: { kind: 'verdict', converges: true },
    },
  }),
  appItem('comparison-2', U.comparison, '2.5.3', 41, {
    instruction: 'Use the Comparison Theorem to decide whether the integral converges or diverges',
    problem: '\\int_{1}^{\\infty} \\frac{2 + \\cos x}{x}\\,dx',
    technique: 'comparison-test',
    difficulty: 2,
    method: 'cos x ≥ −1, so 2 + cos x ≥ 1 and the integrand is above 1/x, whose integral diverges.',
    steps: [
      ['Compare:', '\\frac{2 + \\cos x}{x} \\ge \\frac{1}{x} \\ge 0 \\text{ for } x \\ge 1'],
      ['Theorem 2.5.1 (b):', '\\int_{1}^{\\infty} \\frac{1}{x}\\,dx \\text{ diverges, so the integral diverges}'],
    ],
    answer: '\\text{diverges}',
    definite: {
      integrand: '(2 + cos(x))/x',
      variable: 'x',
      lower: 1,
      upper: Infinity,
      answer: { kind: 'verdict', converges: false },
    },
  }),
];

// -----------------------------------------------------------------------------
// Reflect and Review content per subtopic
// -----------------------------------------------------------------------------

export interface AreaReviewContent {
  /** One mathematical reflection question. */
  reflect: string;
  /** Things learners can name as difficult (chips in the reflection card). */
  difficulties: string[];
  /** Key concepts in one line each, with $…$ maths. */
  concepts: string[];
  formulas: { tex: string; note?: string }[];
  /** When the theorems of the subtopic apply. */
  conditions: string[];
  /** Common errors, each with the correction. */
  errors: string[];
}

export const AREA_REVIEW: Record<AreaUnitId, AreaReviewContent> = {
  [U.riemann]: {
    reflect:
      'For a decreasing function, which endpoint rule gives an underestimate of the area, and why? Explain using one rectangle.',
    difficulties: ['Choosing the endpoints', 'Finding Δx', 'Over- or underestimate', 'Adding the heights'],
    concepts: [
      'The area under $y = f(x)$ is approximated by rectangles of width $\\Delta x$ whose heights are read from the curve.',
      'Right endpoints give $R_{n}$, left endpoints $L_{n}$; any sample point $x_{i}^{*}$ gives a Riemann sum.',
      'More, thinner rectangles waste less area, so the sums approach the area as $n$ grows.',
    ],
    formulas: [
      { tex: '\\Delta x = \\frac{b - a}{n},\\quad x_{i} = a + i\\Delta x' },
      { tex: 'R_{n} = \\sum_{i=1}^{n} f(x_{i})\\,\\Delta x,\\quad L_{n} = \\sum_{i=1}^{n} f(x_{i-1})\\,\\Delta x' },
    ],
    conditions: [
      'The area interpretation needs $f(x) \\ge 0$ on $[a, b]$; below the axis the sum counts area as negative.',
    ],
    errors: [
      'Using $x_{i} = i\\Delta x$ when $a \\ne 0$: the points start at $a$, so $x_{i} = a + i\\Delta x$.',
      'Forgetting to multiply the heights by $\\Delta x$.',
      'Assuming right endpoints always overestimate: that holds for increasing functions only.',
    ],
  },
  [U.definite]: {
    reflect:
      'Why is the definite integral defined as a limit of Riemann sums, and not as one Riemann sum with a large n?',
    difficulties: ['Writing xᵢ', 'Summation formulas', 'Taking the limit', 'The Mid-point Rule'],
    concepts: [
      'The definite integral is the limit of Riemann sums as $n \\to \\infty$ (Definition 2.2.4, Theorem 2.2.1).',
      'Formulas (1)–(3) turn $\\sum i$, $\\sum i^{2}$ and $\\sum i^{3}$ into expressions in $n$ before the limit is taken.',
      'The Mid-point Rule uses the midpoints $\\bar{x}_{i}$ and is usually more accurate than endpoints for the same $n$.',
    ],
    formulas: [
      { tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_{i})\\,\\Delta x' },
      {
        tex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2},\\quad \\sum_{i=1}^{n} i^{2} = \\frac{n(n+1)(2n+1)}{6},\\quad \\sum_{i=1}^{n} i^{3} = \\left[\\frac{n(n+1)}{2}\\right]^{2}',
      },
      { tex: 'M_{n} = \\Delta x\\,[f(\\bar{x}_{1}) + \\cdots + f(\\bar{x}_{n})]' },
    ],
    conditions: ['Theorem 2.2.1 applies when $f$ is integrable on $[a, b]$ (for example, continuous there).'],
    errors: [
      'Summing a constant term $c$ to $c$ instead of $nc$.',
      'Taking the limit before simplifying the sums with formulas (1)–(3).',
      'Reading the Mid-point Rule heights at the endpoints.',
    ],
  },
  [U.properties]: {
    reflect: 'Explain, using areas, why reversing the limits of an integral changes its sign.',
    difficulties: ['Reversing limits', 'Splitting the interval', 'Constant multiples', 'Choosing the property'],
    concepts: [
      'Equal limits give zero, and reversing the limits changes the sign (Theorems 2.2.2, 2.2.3).',
      'Constants come out, and integrals of sums and differences split term by term (Theorem 2.2.4 (i), (ii)).',
      'Integrals over adjacent intervals add: $\\int_{a}^{c} + \\int_{c}^{b} = \\int_{a}^{b}$ (Theorem 2.2.4 (iii)).',
    ],
    formulas: [
      { tex: '\\int_{b}^{a} f(x)\\,dx = -\\int_{a}^{b} f(x)\\,dx' },
      { tex: '\\int_{a}^{b} [cf(x) \\pm g(x)]\\,dx = c\\int_{a}^{b} f(x)\\,dx \\pm \\int_{a}^{b} g(x)\\,dx' },
      { tex: '\\int_{a}^{b} k\\,dx = k(b - a)' },
    ],
    conditions: [
      'The splitting property holds for any order of $a$, $b$ and $c$, as long as $f$ is integrable on the intervals involved.',
    ],
    errors: [
      'Forgetting the minus sign when the target runs from the larger limit to the smaller.',
      'Treating $\\int f g\\,dx$ as $\\int f\\,dx \\cdot \\int g\\,dx$: there is no product rule for integrals.',
    ],
  },
  [U.ftc]: {
    reflect:
      "If $A(x) = \\int_{a}^{x} f(t)\\,dt$, why is $A$ increasing wherever $f$ is positive? Use the meaning of $A'(x)$.",
    difficulties: ['Finding an anti-derivative', 'F(b) − F(a)', 'A′(x) = f(x)', 'Signs below the axis'],
    concepts: [
      "If $F' = f$ on $[a, b]$, then $\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$ (Theorem 2.3.1).",
      "The accumulated area $A(x) = \\int_{a}^{x} f(t)\\,dt$ has derivative $A'(x) = f(x)$.",
    ],
    formulas: [
      { tex: '\\int_{a}^{b} f(x)\\,dx = \\left[F(x)\\right]_{a}^{b} = F(b) - F(a)' },
      { tex: '\\frac{d}{dx} \\int_{a}^{x} f(t)\\,dt = f(x)' },
    ],
    conditions: [
      '$f$ must be continuous on $[a, b]$; if it is unbounded somewhere in the interval, the integral is improper (§2.5).',
    ],
    errors: [
      'Adding $+C$ to a definite integral: it cancels in $F(b) - F(a)$.',
      'Computing $F(a) - F(b)$ instead of $F(b) - F(a)$.',
      'Using the FTC across a vertical asymptote.',
    ],
  },
  [U.mvt]: {
    reflect:
      'What does the number $f(c)$ in the Mean Value Theorem for Integrals tell you about the graph of $f$ on $[a, b]$?',
    difficulties: ['The average value', 'Finding c', 'Why c exists', 'The rectangle picture'],
    concepts: [
      'For continuous $f$ there is a $c$ in $[a, b]$ with $\\int_{a}^{b} f(x)\\,dx = f(c)(b - a)$ (Theorem 2.4.1).',
      'The rectangle of height $f(c)$ on $[a, b]$ has the same area as the region under the curve.',
    ],
    formulas: [{ tex: 'f(c) = \\frac{1}{b - a}\\int_{a}^{b} f(x)\\,dx' }],
    conditions: ['$f$ must be continuous on the closed interval $[a, b]$; otherwise such a $c$ need not exist.'],
    errors: ['Forgetting to divide by $b - a$.', 'Giving $f(c)$ when the question asks for $c$ itself.'],
  },
  [U.typeOne]: {
    reflect:
      'Both $\\frac{1}{x}$ and $\\frac{1}{x^{2}}$ approach 0 as $x \\to \\infty$. Why does only one of them have a finite area on $[1, \\infty)$?',
    difficulties: ['Writing the limit', 'Evaluating at t', 'Deciding convergence', 'Two infinite limits'],
    concepts: [
      'An integral over an infinite interval is defined as a limit: $\\int_{a}^{\\infty} f = \\lim_{t \\to \\infty} \\int_{a}^{t} f$ (Definition 2.5.1).',
      'It converges when the limit is a finite number and diverges otherwise.',
      'With both limits infinite, split at any $a$; both parts must converge.',
    ],
    formulas: [
      { tex: '\\int_{a}^{\\infty} f(x)\\,dx = \\lim_{t \\to \\infty} \\int_{a}^{t} f(x)\\,dx' },
      {
        tex: '\\int_{1}^{\\infty} \\frac{1}{x^{p}}\\,dx \\text{ converges for } p > 1 \\text{ and diverges for } p \\le 1',
      },
    ],
    conditions: [
      '$\\int_{-\\infty}^{\\infty}$ converges only if both $\\int_{-\\infty}^{a}$ and $\\int_{a}^{\\infty}$ converge.',
    ],
    errors: [
      'Substituting $\\infty$ directly instead of taking a limit.',
      'Concluding convergence because $f(x) \\to 0$: $\\frac{1}{x} \\to 0$ but its integral diverges.',
    ],
  },
  [U.typeTwo]: {
    reflect:
      'How can you tell, before integrating, that $\\int_{-1}^{2} \\frac{dx}{x^{3}}$ cannot be evaluated directly with $F(2) - F(-1)$?',
    difficulties: ['Spotting the asymptote', 'One-sided limits', 'Splitting at the asymptote', 'Deciding convergence'],
    concepts: [
      'If $f$ is unbounded at an endpoint, integrate up to $t$ next to it and take a one-sided limit (Definitions 2.5.2, 2.5.3).',
      'If $f$ is unbounded at an interior point $c$, split at $c$; both parts must converge (Definition 2.5.4).',
    ],
    formulas: [
      {
        tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{t \\to b^{-}} \\int_{a}^{t} f(x)\\,dx \\quad (f \\text{ unbounded at } b)',
      },
      {
        tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{t \\to a^{+}} \\int_{t}^{b} f(x)\\,dx \\quad (f \\text{ unbounded at } a)',
      },
    ],
    conditions: [
      'The FTC applies only on intervals where $f$ is continuous, so check the integrand for vertical asymptotes first.',
    ],
    errors: [
      'Applying $F(b) - F(a)$ across an interior asymptote and getting a finite but wrong value.',
      'Taking the limit from the wrong side of the asymptote.',
    ],
  },
  [U.comparison]: {
    reflect: 'Why does being smaller than a function with a divergent integral tell you nothing about convergence?',
    difficulties: ['Choosing g(x)', 'Proving the inequality', 'Which direction', 'Known integrals'],
    concepts: [
      'If $0 \\le f \\le g$ for $x \\ge a$ and $\\int_{a}^{\\infty} g$ converges, then $\\int_{a}^{\\infty} f$ converges (Theorem 2.5.1 (a)).',
      'If $f \\ge g \\ge 0$ and $\\int_{a}^{\\infty} g$ diverges, then $\\int_{a}^{\\infty} f$ diverges (Theorem 2.5.1 (b)).',
    ],
    formulas: [{ tex: '0 \\le f(x) \\le g(x) \\text{ for } x \\ge a' }],
    conditions: [
      'The inequality must hold for every $x \\ge a$, and both functions must be continuous and non-negative there.',
    ],
    errors: [
      'Concluding convergence from $f \\ge g$ with $\\int g$ convergent (Remark 2.5.4: nothing follows).',
      'Comparing with a function that crosses the integrand.',
    ],
  },
};

/** The Review recap blocks for a subtopic (before the learner's history). */
export function reviewRecap(unitId: AreaUnitId): ContentBlock[] {
  const content = AREA_REVIEW[unitId];
  const items = AREA_RETRIEVAL.filter((i) => i.unitId === unitId);
  return [
    { type: 'summary', title: 'Key concepts', points: content.concepts },
    { type: 'formulaList', title: 'Formulas', items: content.formulas },
    { type: 'summary', title: 'When the theorems apply', points: content.conditions },
    { type: 'callout', tone: 'caution', title: 'Common errors', text: content.errors.map((e) => `• ${e}`).join('\n') },
    {
      type: 'practiceGroup',
      title: 'App practice: quick retrieval',
      text: 'Written for the app (not from the course notes or tutorial). Recall the method without looking back, then check your answer.',
      items,
    },
  ];
}
