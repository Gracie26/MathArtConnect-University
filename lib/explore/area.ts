/**
 * Pure mathematics for the Topic 2 Explore tools: the functions they use,
 * Riemann sums for each rule, exact areas, the mean value point, and the
 * partial integrals of improper integrals. No React here; tested in
 * __tests__/area-explore.test.ts.
 */
import { type Fn, type RiemannRule, riemannSum, simpson } from '@/lib/figures/scene';

export interface RiemannFunction {
  id: string;
  label: string;
  /** TeX of f(x) and the interval, e.g. "f(x) = 2x,\\; 0 \\le x \\le 1". */
  tex: string;
  f: Fn;
  a: number;
  b: number;
  /** Where it comes from (shown under the graph). */
  source: string;
}

/** The general curve of Figures 2.1–2.4 (same shape as content/topics/area/figures.ts). */
export const notesCurve: Fn = (x) =>
  2.75 + 1.7 * Math.exp(-1.25 * (x - 1)) + 1.15 * Math.exp(-(((x - 6.1) / 1.35) ** 2)) - 0.09 * (x - 1);

export const RIEMANN_FUNCTIONS: readonly RiemannFunction[] = [
  {
    id: 'notes',
    label: 'Curve of Figures 2.1–2.4',
    tex: 'y = f(x),\\; a \\le x \\le b',
    f: notesCurve,
    a: 1,
    b: 8,
    source: 'The general curve drawn in Figures 2.1 to 2.4.',
  },
  {
    id: 'ex221',
    label: '2x on [0, 1]',
    tex: 'f(x) = 2x,\\; 0 \\le x \\le 1',
    f: (x) => 2 * x,
    a: 0,
    b: 1,
    source: 'Example 2.2.1.',
  },
  {
    id: 'ex222',
    label: '(x − 1)² + 2 on [−1, 2]',
    tex: 'f(x) = (x-1)^{2} + 2,\\; -1 \\le x \\le 2',
    f: (x) => (x - 1) ** 2 + 2,
    a: -1,
    b: 2,
    source: 'Example 2.2.2.',
  },
  {
    id: 'ex223',
    label: 'eˣ on [0, 2]',
    tex: 'f(x) = e^{x},\\; 0 \\le x \\le 2',
    f: Math.exp,
    a: 0,
    b: 2,
    source: 'Example 2.2.3.',
  },
  {
    id: 'q9',
    label: 'e^(−2x+3) on [0, 4]',
    tex: 'f(x) = e^{-2x+3},\\; 0 \\le x \\le 4',
    f: (x) => Math.exp(-2 * x + 3),
    a: 0,
    b: 4,
    source: 'Tutorial 2, questions on A_R, A_L and the Mid-point Rule.',
  },
  {
    id: 'q11',
    label: 'cos x on [0, π/2]',
    tex: 'f(x) = \\cos x,\\; 0 \\le x \\le \\frac{\\pi}{2}',
    f: Math.cos,
    a: 0,
    b: Math.PI / 2,
    source: 'Tutorial 2, questions on Rₙ, Lₙ and the Mid-point Rule.',
  },
];

export const RULE_LABELS: Record<RiemannRule, string> = {
  right: 'Right endpoints',
  left: 'Left endpoints',
  sample: 'Sample points',
  midpoint: 'Midpoints',
};

/** Where the ith height is read, in words and in TeX. */
export const RULE_HEIGHT: Record<RiemannRule, { words: string; tex: string; sum: string }> = {
  right: { words: 'at the right endpoint xᵢ', tex: 'f(x_{i})', sum: 'R_{n}' },
  left: { words: 'at the left endpoint xᵢ₋₁', tex: 'f(x_{i-1})', sum: 'L_{n}' },
  sample: { words: 'at a sample point xᵢ* inside the subinterval', tex: 'f(x_{i}^{\\ast})', sum: 'C_{n}' },
  midpoint: { words: 'at the midpoint x̄ᵢ', tex: 'f(\\bar{x}_{i})', sum: 'M_{n}' },
};

export function approximation(fn: RiemannFunction, n: number, rule: RiemannRule, fraction = 0.5): number {
  return riemannSum(fn.f, fn.a, fn.b, n, rule, fraction);
}

/** The exact area (numerically, to high accuracy). */
export const exactArea = (fn: RiemannFunction): number => simpson(fn.f, fn.a, fn.b, 4000);

// -----------------------------------------------------------------------------
// Limits of Riemann sums (the closed forms printed in Examples 2.2.1 and 2.2.2)
// -----------------------------------------------------------------------------

export interface LimitExample {
  id: string;
  label: string;
  fn: RiemannFunction;
  /** Rₙ as printed in the solution. */
  closedFormTex: string;
  closedForm: (n: number) => number;
  limit: number;
}

export const LIMIT_EXAMPLES: readonly LimitExample[] = [
  {
    id: 'ex221',
    label: 'Example 2.2.1',
    fn: RIEMANN_FUNCTIONS[1] as RiemannFunction,
    closedFormTex: 'R_{n} = 1 + \\frac{1}{n}',
    closedForm: (n) => 1 + 1 / n,
    limit: 1,
  },
  {
    id: 'ex222',
    label: 'Example 2.2.2',
    fn: RIEMANN_FUNCTIONS[2] as RiemannFunction,
    closedFormTex: 'R_{n} = \\frac{9(n+1)(2n+1)}{2n^{2}} - \\frac{18(n+1)}{n} + 18',
    closedForm: (n) => (9 * (n + 1) * (2 * n + 1)) / (2 * n * n) - (18 * (n + 1)) / n + 18,
    limit: 9,
  },
];

// -----------------------------------------------------------------------------
// The Mean Value Theorem (the curve of Figure 2.5)
// -----------------------------------------------------------------------------

export const MVT = {
  a: 0.6,
  b: 3.4,
  f: (x: number) => 1.1 + 0.6 * Math.tanh(1.8 * (x - 2.2)),
};

export const mvtArea = (): number => simpson(MVT.f, MVT.a, MVT.b, 4000);
export const mvtAverage = (): number => mvtArea() / (MVT.b - MVT.a);

/** The point c in [a, b] with f(c) = the average value (bisection; f is increasing). */
export function mvtPoint(): number {
  const target = mvtAverage();
  let lo = MVT.a;
  let hi = MVT.b;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (MVT.f(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// -----------------------------------------------------------------------------
// Accumulation (the Second Fundamental Theorem)
// -----------------------------------------------------------------------------

/** f(t) = 1.2 sin t + 0.6 on [0, 6]: positive and negative parts, so the accumulated area rises and falls. */
export const ACCUMULATION = {
  a: 0,
  b: 6,
  f: (t: number) => 1.2 * Math.sin(t) + 0.6,
  /** g(x) = ∫₀ˣ f(t) dt, exactly. */
  g: (x: number) => 1.2 * (1 - Math.cos(x)) + 0.6 * x,
  fTex: 'f(t) = 1.2\\sin t + 0.6',
};

// -----------------------------------------------------------------------------
// Improper integrals
// -----------------------------------------------------------------------------

export interface ImproperCase {
  id: string;
  label: string;
  tex: string;
  f: Fn;
  /** A(t), exactly. */
  partial: (t: number) => number;
  partialTex: string;
  /** The limit, or null when it is infinite. */
  limit: number | null;
  source: string;
}

/** Type I: from x = 1 to t, t → ∞ (equations (2.1)–(2.2) and Example 2.5.1). */
export const TYPE_ONE_CASES: readonly ImproperCase[] = [
  {
    id: 'inverse-square',
    label: 'y = 1/x²',
    tex: '\\int_{1}^{t} \\frac{1}{x^{2}}\\,dx',
    f: (x) => 1 / (x * x),
    partial: (t) => 1 - 1 / t,
    partialTex: 'A(t) = 1 - \\frac{1}{t}',
    limit: 1,
    source: 'Equations (2.1) and (2.2), Figures 2.6, 2.7 and 2.9.',
  },
  {
    id: 'reciprocal',
    label: 'y = 1/x',
    tex: '\\int_{1}^{t} \\frac{1}{x}\\,dx',
    f: (x) => 1 / x,
    partial: (t) => Math.log(t),
    partialTex: 'A(t) = \\ln t',
    limit: null,
    source: 'Example 2.5.1 and Figure 2.10.',
  },
];

/** Type II: from t to 5 near the asymptote x = 2, t → 2⁺. */
export const TYPE_TWO_CASES: readonly ImproperCase[] = [
  {
    id: 'root',
    label: 'y = 1/√(x − 2)',
    tex: '\\int_{t}^{5} \\frac{1}{\\sqrt{x-2}}\\,dx',
    f: (x) => 1 / Math.sqrt(x - 2),
    partial: (t) => 2 * Math.sqrt(3) - 2 * Math.sqrt(t - 2),
    partialTex: 'A(t) = 2\\sqrt{3} - 2\\sqrt{t-2}',
    limit: 2 * Math.sqrt(3),
    source: 'Example 2.5.2 and Figure 2.14.',
  },
  {
    id: 'square',
    label: 'y = 1/(x − 2)²',
    tex: '\\int_{t}^{5} \\frac{1}{(x-2)^{2}}\\,dx',
    f: (x) => 1 / (x - 2) ** 2,
    partial: (t) => 1 / (t - 2) - 1 / 3,
    partialTex: 'A(t) = \\frac{1}{t-2} - \\frac{1}{3}',
    limit: null,
    source:
      'A comparison chosen for this tool (not from the notes): the same asymptote, but the area grows without bound.',
  },
];

export interface ComparisonCase {
  id: string;
  label: string;
  /** The larger function f and the smaller g (f ≥ g ≥ 0 for x ≥ a). */
  f: Fn;
  g: Fn;
  fTex: string;
  gTex: string;
  a: number;
  /** Which integral is known, and what the theorem concludes. */
  known: 'f' | 'g';
  converges: boolean;
  conclusion: string;
  source: string;
}

export const COMPARISON_CASES: readonly ComparisonCase[] = [
  {
    id: 'ex253',
    label: 'e^(−x²) and e^(−x)',
    f: (x) => Math.exp(-x),
    g: (x) => Math.exp(-x * x),
    fTex: 'e^{-x}',
    gTex: 'e^{-x^{2}}',
    a: 1,
    known: 'f',
    converges: true,
    conclusion: 'The larger integral converges (to 1/e), so by Theorem 2.5.1 (a) the smaller one converges.',
    source: 'Example 2.5.3 and Figure 2.16.',
  },
  {
    id: 'q14b',
    label: '1/(x⁵ + 1) and 1/x⁵',
    f: (x) => 1 / x ** 5,
    g: (x) => 1 / (x ** 5 + 1),
    fTex: '\\frac{1}{x^{5}}',
    gTex: '\\frac{1}{x^{5}+1}',
    a: 1,
    known: 'f',
    converges: true,
    conclusion: 'The larger integral converges, so the smaller one converges (Theorem 2.5.1 (a)).',
    source: 'Tutorial 2, Comparison Theorem questions.',
  },
  {
    id: 'q14d',
    label: '(2 + e^(−x))/x and 1/x',
    f: (x) => (2 + Math.exp(-x)) / x,
    g: (x) => 1 / x,
    fTex: '\\frac{2 + e^{-x}}{x}',
    gTex: '\\frac{1}{x}',
    a: 1,
    known: 'g',
    converges: false,
    conclusion: 'The smaller integral diverges (Example 2.5.1), so the larger one diverges (Theorem 2.5.1 (b)).',
    source: 'Tutorial 2, Comparison Theorem questions.',
  },
];

/** ∫ₐᵗ h, numerically (Simpson on a log-spaced grid, so large t stays accurate). */
export function areaUpTo(h: Fn, a: number, t: number): number {
  if (t <= a) return 0;
  // Split [a, t] at powers of 2 beyond a, so each piece is integrated at a suitable scale.
  let total = 0;
  let left = a;
  let width = 1;
  while (left < t) {
    const right = Math.min(t, left + width);
    total += simpson(h, left, right, 200);
    left = right;
    width *= 2;
  }
  return total;
}

/** A slider position s in [0, 1] mapped to t on a logarithmic scale between `from` and `to`. */
export const logScale = (s: number, from: number, to: number): number => from * (to / from) ** s;
