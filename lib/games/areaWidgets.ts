/**
 * Topic 2 game rounds that are played on a graph ("widgets"), as data plus
 * pure evaluation. The game shell scores them like any other round; the
 * components in components/games/area draw them. Every evaluation explains
 * WHY an action is mathematically right or wrong, and nothing is decided by
 * chance: answers are computed from the functions themselves.
 *
 * Design informed by prior research on game-based calculus learning,
 * mathematical visualisation and visual-art integration
 * (docs/topic2-phase-d-evidence.md); these specific activities have not been
 * evaluated.
 */
import { type Fn, type RiemannRule, riemannSum, simpson } from '@/lib/figures/scene';

import type { Evaluation } from './engine';

export type CheckedEvaluation = Evaluation & {
  /** Not a mistake (e.g. a valid but unhelpful step): the shell does not count it as a wrong attempt. */
  cannotCheck?: boolean;
};

/** A function on an interval, with its formula for display. */
export interface GameFunction {
  f: Fn;
  tex: string;
  a: number;
  b: number;
  /** Labels for the ends of the interval (e.g. "π/2"). */
  aLabel?: string;
  bLabel?: string;
}

const close = (x: number, y: number, tolerance: number) => Math.abs(x - y) <= tolerance;
export const exactIntegral = (fn: GameFunction): number => simpson(fn.f, fn.a, fn.b, 4000);
const fmt = (v: number, digits = 4) => (Math.abs(v) < 1e-12 ? '0' : Number(v.toFixed(digits)).toString());

// =============================================================================
// Riemann Builder
// =============================================================================

export type RiemannGoal =
  /** Build any sum below the true area. */
  | { type: 'underestimate' }
  /** Build any sum above the true area. */
  | { type: 'overestimate' }
  /** Get within the tolerance with at most maxN rectangles. */
  | { type: 'tolerance'; tolerance: number; maxN: number }
  /** Build exactly this sum, then enter its value. */
  | { type: 'compute'; rule: Exclude<RiemannRule, 'sample'>; n: number }
  /** Predict how the sum changes when n grows, before seeing it. */
  | { type: 'predict'; rule: Exclude<RiemannRule, 'sample'>; fromN: number; toN: number }
  /** Drag each sample point so the rectangles' total area equals the true area. */
  | { type: 'sampleMatch'; n: number; tolerance: number };

export interface RiemannWidget {
  type: 'riemann';
  fn: GameFunction;
  goal: RiemannGoal;
}

export interface RiemannChoice {
  rule: RiemannRule;
  n: number;
  /** Where each sample point sits in its subinterval (0 = left end, 1 = right end). */
  fractions: number[];
}

/** The sum for a choice: Σ f(xᵢ*)Δx with the chosen points. */
export function riemannValue(fn: GameFunction, choice: RiemannChoice): number {
  const dx = (fn.b - fn.a) / choice.n;
  let sum = 0;
  for (let i = 1; i <= choice.n; i++) {
    const offset =
      choice.rule === 'right'
        ? 1
        : choice.rule === 'left'
          ? 0
          : choice.rule === 'midpoint'
            ? 0.5
            : (choice.fractions[i - 1] ?? 0.5);
    sum += fn.f(fn.a + (i - 1 + offset) * dx) * dx;
  }
  return sum;
}

/** How many rectangles lie above / below their strip of the region (the cause of an over- or underestimate). */
export function rectangleBalance(fn: GameFunction, choice: RiemannChoice): { above: number; below: number } {
  const dx = (fn.b - fn.a) / choice.n;
  let above = 0;
  let below = 0;
  for (let i = 1; i <= choice.n; i++) {
    const left = fn.a + (i - 1) * dx;
    const strip = simpson(fn.f, left, left + dx, 60);
    const single: RiemannChoice = { ...choice, n: 1, fractions: [choice.fractions[i - 1] ?? 0.5] };
    const rect = riemannValue({ ...fn, a: left, b: left + dx }, single);
    if (rect > strip + 1e-12) above++;
    else if (rect < strip - 1e-12) below++;
  }
  return { above, below };
}

const RULE_WORDS: Record<RiemannRule, string> = {
  right: 'right endpoints',
  left: 'left endpoints',
  midpoint: 'midpoints',
  sample: 'your sample points',
};

/** The smallest n (up to 200) for which a rule is within the tolerance. */
export function smallestN(fn: GameFunction, rule: Exclude<RiemannRule, 'sample'>, tolerance: number): number | null {
  const exact = exactIntegral(fn);
  for (let n = 1; n <= 200; n++) {
    if (Math.abs(riemannSum(fn.f, fn.a, fn.b, n, rule) - exact) <= tolerance) return n;
  }
  return null;
}

export function evaluateRiemannBuild(widget: RiemannWidget, choice: RiemannChoice): CheckedEvaluation {
  const { fn, goal } = widget;
  const exact = exactIntegral(fn);
  const value = riemannValue(fn, choice);
  const { above, below } = rectangleBalance(fn, choice);
  const why =
    `With ${RULE_WORDS[choice.rule]} and n = ${choice.n}, ${below} rectangle${below === 1 ? '' : 's'} sit${below === 1 ? 's' : ''} below the curve` +
    ` and ${above} reach${above === 1 ? 'es' : ''} above it, so the sum is ${fmt(value)} against the area ${fmt(exact)}.`;
  switch (goal.type) {
    case 'underestimate':
      return value < exact - 1e-9
        ? { correct: true, feedback: `An underestimate. ${why}` }
        : {
            correct: false,
            feedback: `Not an underestimate yet. ${why} Choose the end of each subinterval where the curve is lower.`,
          };
    case 'overestimate':
      return value > exact + 1e-9
        ? { correct: true, feedback: `An overestimate. ${why}` }
        : {
            correct: false,
            feedback: `Not an overestimate yet. ${why} Choose the end of each subinterval where the curve is higher.`,
          };
    case 'tolerance': {
      const error = Math.abs(value - exact);
      const within = error <= goal.tolerance;
      if (within && choice.n <= goal.maxN) {
        return {
          correct: true,
          feedback: `Within ${goal.tolerance} using ${choice.n} rectangles (error ${fmt(error, 5)}). ${
            choice.rule === 'midpoint'
              ? 'Midpoints balance the part of each rectangle above the curve against the part below it.'
              : ''
          }`.trim(),
        };
      }
      if (within) {
        const best = smallestN(fn, 'midpoint', goal.tolerance);
        return {
          correct: false,
          feedback: `Within the tolerance, but with ${choice.n} rectangles; it can be done with at most ${goal.maxN}.${
            best ? ` Midpoints manage it with n = ${best}.` : ''
          }`,
        };
      }
      return {
        correct: false,
        feedback: `The error is ${fmt(error, 5)}, more than ${goal.tolerance}. ${why} Increase n, or choose a rule whose rectangles balance above and below the curve.`,
      };
    }
    case 'compute':
      if (choice.rule !== goal.rule || choice.n !== goal.n) {
        return {
          correct: false,
          feedback: `This round asks for ${RULE_WORDS[goal.rule]} with n = ${goal.n}; you have ${RULE_WORDS[choice.rule]} with n = ${choice.n}.`,
        };
      }
      return { correct: true, feedback: `That is the requested sum. Now find its value.` };
    case 'predict':
    case 'sampleMatch':
      return { correct: false, feedback: 'This round is checked in its own way.' };
  }
}

/** The learner's typed value for a "compute" round. */
export function evaluateRiemannValue(widget: RiemannWidget, typed: number): CheckedEvaluation {
  if (widget.goal.type !== 'compute') return { correct: false, feedback: 'No value is asked for here.' };
  const { rule, n } = widget.goal;
  const value = riemannSum(widget.fn.f, widget.fn.a, widget.fn.b, n, rule);
  if (!Number.isFinite(typed)) return { correct: false, feedback: 'Enter a number.', cannotCheck: true };
  return close(typed, value, 0.005 * Math.max(1, Math.abs(value)))
    ? {
        correct: true,
        feedback: `Correct: Δx = ${fmt((widget.fn.b - widget.fn.a) / n)} times the sum of the ${n} heights gives ${fmt(value)}.`,
      }
    : {
        correct: false,
        feedback: `Not quite. Multiply Δx = ${fmt((widget.fn.b - widget.fn.a) / n)} by the sum of the heights at the ${RULE_WORDS[rule]} (they are marked on the graph).`,
      };
}

export type ChangePrediction = 'increase' | 'decrease';

/** The prediction round: does the sum go up or down when n grows? */
export function evaluateRiemannPrediction(widget: RiemannWidget, prediction: ChangePrediction): CheckedEvaluation {
  if (widget.goal.type !== 'predict') return { correct: false, feedback: 'No prediction is asked for here.' };
  const { rule, fromN, toN } = widget.goal;
  const before = riemannSum(widget.fn.f, widget.fn.a, widget.fn.b, fromN, rule);
  const after = riemannSum(widget.fn.f, widget.fn.a, widget.fn.b, toN, rule);
  const exact = exactIntegral(widget.fn);
  const actual: ChangePrediction = after > before ? 'increase' : 'decrease';
  const side = before < exact ? 'below' : 'above';
  const explanation = `With ${RULE_WORDS[rule]}, n = ${fromN} gives ${fmt(before)} and n = ${toN} gives ${fmt(after)}. The first sum was ${side} the area ${fmt(exact)}; thinner rectangles waste less, so the sum moves towards the area.`;
  return actual === prediction
    ? { correct: true, feedback: `Your prediction was right. ${explanation}` }
    : { correct: false, feedback: `The sum will ${actual} instead. ${explanation}` };
}

export function evaluateSampleMatch(widget: RiemannWidget, fractions: number[]): CheckedEvaluation {
  if (widget.goal.type !== 'sampleMatch') return { correct: false, feedback: 'No sample points to place here.' };
  const choice: RiemannChoice = { rule: 'sample', n: widget.goal.n, fractions };
  const value = riemannValue(widget.fn, choice);
  const exact = exactIntegral(widget.fn);
  const error = value - exact;
  return Math.abs(error) <= widget.goal.tolerance
    ? {
        correct: true,
        feedback: `The rectangles now have total area ${fmt(value)}, the area under the curve to within ${widget.goal.tolerance}. In each subinterval you found a height between the lowest and highest value of f.`,
      }
    : {
        correct: false,
        feedback: `The total is ${fmt(value)}, which is ${error > 0 ? 'more' : 'less'} than the area ${fmt(exact)}. Move sample points to where the curve is ${error > 0 ? 'lower' : 'higher'}.`,
      };
}

// =============================================================================
// Sum to Integral: build the chain rectangles → Σ → limit → ∫
// =============================================================================

export interface ChainCard {
  id: string;
  tex: string;
  correct: boolean;
  /** Why it is right or wrong (shown when placed). */
  why: string;
}

export interface ChainSlot {
  id: 'dx' | 'xi' | 'term' | 'sum' | 'limit';
  label: string;
  cards: ChainCard[];
}

export interface ChainWidget {
  type: 'chain';
  fn: GameFunction;
  /** The definite integral being built, e.g. "\\int_{1}^{2} (x^{2}+1)\\,dx". */
  integralTex: string;
  slots: ChainSlot[];
  value: number;
}

export function evaluateChainCard(widget: ChainWidget, slotIndex: number, cardId: string): CheckedEvaluation {
  const card = widget.slots[slotIndex]?.cards.find((c) => c.id === cardId);
  if (!card) return { correct: false, feedback: 'Choose a card first.', cannotCheck: true };
  return { correct: card.correct, feedback: card.why };
}

// =============================================================================
// Property Builder
// =============================================================================

export interface KnownIntegral {
  id: string;
  /** e.g. "\\int_{2}^{4} x^{3}\\,dx = 60". */
  tex: string;
  /** Symbol shown on the tile, e.g. "\\int_{2}^{4} x^{3}\\,dx". */
  short: string;
  value: number;
}

export type PropertyWidget =
  | {
      type: 'property';
      mode: 'combination';
      known: KnownIntegral[];
      /** The integral to evaluate, e.g. "\\int_{4}^{2} (4x^{3} - 3x)\\,dx". */
      targetTex: string;
      reversed: boolean;
      /** Coefficient of each known integral in the target (after any reversal). */
      coefficients: Record<string, number>;
    }
  | {
      type: 'property';
      mode: 'intervals';
      /** The function whose areas are combined (for the picture). */
      fn: GameFunction;
      /** Known pieces ∫ from → to. */
      pieces: { id: string; from: number; to: number; value: number }[];
      target: { from: number; to: number };
      targetTex: string;
    };

export interface CombinationChoice {
  reversed: boolean;
  coefficients: Record<string, number>;
}

export function combinationValue(
  widget: Extract<PropertyWidget, { mode: 'combination' }>,
  choice: CombinationChoice,
): number {
  const sum = widget.known.reduce((s, k) => s + (choice.coefficients[k.id] ?? 0) * k.value, 0);
  return choice.reversed ? -sum : sum;
}

export function evaluateCombination(
  widget: Extract<PropertyWidget, { mode: 'combination' }>,
  choice: CombinationChoice,
): CheckedEvaluation {
  if (choice.reversed !== widget.reversed) {
    return {
      correct: false,
      feedback: widget.reversed
        ? 'Look at the limits: the target runs from the larger number to the smaller. Theorem 2.2.3 (reversing the limits) puts a minus sign in front.'
        : 'The limits of the target are in the same order as the known integrals, so no reversal (and no minus sign from Theorem 2.2.3) is needed.',
    };
  }
  for (const k of widget.known) {
    const want = widget.coefficients[k.id] ?? 0;
    const have = choice.coefficients[k.id] ?? 0;
    if (want !== have) {
      return {
        correct: false,
        feedback: `Check the multiple of ${k.short.replace(/\\,/g, ' ')}: Theorem 2.2.4 (i) moves a constant factor out of the integral, and (ii) splits a sum or difference term by term. Read the coefficient from the integrand.`,
      };
    }
  }
  const value = combinationValue(widget, choice);
  return {
    correct: true,
    feedback: `Correct: ${widget.reversed ? 'Theorem 2.2.3 (reverse the limits, change the sign), then ' : ''}Theorem 2.2.4 (i) and (ii) (constant multiples, sums and differences). The value is ${fmt(value)}.`,
  };
}

export interface PathStep {
  pieceId: string;
  /** Use the piece backwards (Theorem 2.2.3). */
  reversed: boolean;
}

/** Combining interval pieces end to end (Theorem 2.2.4 (iii)), reversing some (Theorem 2.2.3). */
export function evaluateIntervalPath(
  widget: Extract<PropertyWidget, { mode: 'intervals' }>,
  path: PathStep[],
): CheckedEvaluation & { value: number } {
  let at = widget.target.from;
  let value = 0;
  for (const step of path) {
    const piece = widget.pieces.find((p) => p.id === step.pieceId);
    if (!piece) return { correct: false, feedback: 'Unknown piece.', value };
    const [from, to] = step.reversed ? [piece.to, piece.from] : [piece.from, piece.to];
    if (from !== at) {
      return {
        correct: false,
        feedback: `Pieces must join end to end: this one starts at ${fmt(from)}, but your path is at ${fmt(at)}. ${
          to === at ? 'Reverse it (Theorem 2.2.3) so it starts where you are.' : ''
        }`.trim(),
        value,
      };
    }
    value += step.reversed ? -piece.value : piece.value;
    at = to;
  }
  if (at !== widget.target.to) {
    return {
      correct: false,
      feedback: `Your path ends at ${fmt(at)}; it must end at ${fmt(widget.target.to)}.`,
      value,
    };
  }
  const reversals = path.filter((s) => s.reversed).length;
  return {
    correct: true,
    feedback: `Correct: joining intervals end to end adds their integrals (Theorem 2.2.4 (iii))${
      reversals ? ', and running a piece backwards changes its sign (Theorem 2.2.3)' : ''
    }. The value is ${fmt(value)}.`,
    value,
  };
}

// =============================================================================
// Area–Derivative Link (A(x) = ∫ₐˣ f(t) dt)
// =============================================================================

export type AccumulationTask =
  /** Where is A largest on [a, b]? */
  | { type: 'maximum' }
  /** Where is A smallest on [a, b]? */
  | { type: 'minimum' }
  /** Where does A increase fastest? */
  | { type: 'steepest' }
  /** Find a place where A has a horizontal tangent (inside the interval). */
  | { type: 'flat' };

export interface AccumulationWidget {
  type: 'accumulation';
  fn: GameFunction;
  task: AccumulationTask;
  tolerance: number;
}

const grid = (fn: GameFunction, n = 600) => Array.from({ length: n + 1 }, (_, k) => fn.a + ((fn.b - fn.a) * k) / n);

/** A(x) = ∫ₐˣ f(t) dt, numerically. */
export const accumulated = (fn: GameFunction, x: number): number => (x === fn.a ? 0 : simpson(fn.f, fn.a, x, 400));

/** The correct places for a task (several for "flat"). */
export function accumulationTargets(widget: AccumulationWidget): number[] {
  const { fn, task } = widget;
  const xs = grid(fn);
  if (task.type === 'steepest') {
    return [xs.reduce((best, x) => (fn.f(x) > fn.f(best) ? x : best), fn.a)];
  }
  if (task.type === 'flat') {
    const zeros: number[] = [];
    for (let k = 0; k + 1 < xs.length; k++) {
      const [x0, x1] = [xs[k] as number, xs[k + 1] as number];
      if (Math.sign(fn.f(x0)) !== Math.sign(fn.f(x1)) && x0 > fn.a && x1 < fn.b) {
        // Bisection for the zero of f.
        let lo = x0;
        let hi = x1;
        for (let i = 0; i < 50; i++) {
          const mid = (lo + hi) / 2;
          if (Math.sign(fn.f(mid)) === Math.sign(fn.f(lo))) lo = mid;
          else hi = mid;
        }
        zeros.push((lo + hi) / 2);
      }
    }
    return zeros;
  }
  // A on a coarse grid with a running Simpson-free trapezoid sum is enough to locate extremes.
  let running = 0;
  let best = fn.a;
  let bestValue = 0;
  for (let k = 1; k < xs.length; k++) {
    const [x0, x1] = [xs[k - 1] as number, xs[k] as number];
    running += ((fn.f(x0) + fn.f(x1)) / 2) * (x1 - x0);
    const better = task.type === 'maximum' ? running > bestValue : running < bestValue;
    if (better) {
      bestValue = running;
      best = x1;
    }
  }
  return [best];
}

export function evaluateAccumulationPlacement(widget: AccumulationWidget, x: number): CheckedEvaluation {
  const { fn, task } = widget;
  const targets = accumulationTargets(widget);
  const hit = targets.some((t) => Math.abs(t - x) <= widget.tolerance);
  const fx = fn.f(x);
  const reason: Record<AccumulationTask['type'], string> = {
    maximum:
      'A grows while f is positive and shrinks once f is negative, so A is largest where f changes from positive to negative (or at the end of the interval if f never turns negative after that).',
    minimum: 'A shrinks while f is negative, so A is smallest where f changes from negative to positive.',
    steepest: "A'(x) = f(x), so A rises fastest where f is largest.",
    flat: "A'(x) = f(x), so A has a horizontal tangent exactly where f(x) = 0.",
  };
  return hit
    ? {
        correct: true,
        feedback: `Correct. ${reason[task.type]} At your point f(x) = ${fmt(fx, 3)}.`,
      }
    : {
        correct: false,
        feedback: `Not here: at your point f(x) = ${fmt(fx, 3)}, so A is ${fx > 0 ? 'still increasing' : fx < 0 ? 'decreasing' : 'flat'}. ${reason[task.type]}`,
      };
}

// =============================================================================
// Equal-Area Height (Mean Value Theorem for Integrals)
// =============================================================================

export interface EqualAreaWidget {
  type: 'equalArea';
  fn: GameFunction;
  /** Relative tolerance on the areas (e.g. 0.01). */
  tolerance: number;
}

export const averageValue = (fn: GameFunction): number => exactIntegral(fn) / (fn.b - fn.a);

/** The part of the region above the rectangle and the part of the rectangle above the curve. */
export function excessAndDeficit(fn: GameFunction, height: number): { excess: number; deficit: number } {
  const excess = simpson((x) => Math.max(fn.f(x) - height, 0), fn.a, fn.b, 2000);
  const deficit = simpson((x) => Math.max(height - fn.f(x), 0), fn.a, fn.b, 2000);
  return { excess, deficit };
}

export function evaluateEqualHeight(widget: EqualAreaWidget, height: number): CheckedEvaluation {
  const { fn } = widget;
  const area = exactIntegral(fn);
  const rect = height * (fn.b - fn.a);
  const { excess, deficit } = excessAndDeficit(fn, height);
  if (Math.abs(rect - area) <= widget.tolerance * Math.abs(area)) {
    return {
      correct: true,
      feedback: `Equal areas: the rectangle has area ${fmt(rect, 3)} and the region ${fmt(area, 3)}. The region sticking out above the rectangle (${fmt(excess, 3)}) balances the part of the rectangle above the curve (${fmt(deficit, 3)}).`,
    };
  }
  return rect < area
    ? {
        correct: false,
        feedback: `Too low: the rectangle's area ${fmt(rect, 3)} is less than ${fmt(area, 3)}. More of the region (${fmt(excess, 3)}) sticks out above the rectangle than the rectangle has above the curve (${fmt(deficit, 3)}). Raise it.`,
      }
    : {
        correct: false,
        feedback: `Too high: the rectangle's area ${fmt(rect, 3)} is more than ${fmt(area, 3)}. The rectangle has more area above the curve (${fmt(deficit, 3)}) than the region has above the rectangle (${fmt(excess, 3)}). Lower it.`,
      };
}

export function evaluateMeanPoint(widget: EqualAreaWidget, c: number): CheckedEvaluation {
  const avg = averageValue(widget.fn);
  const fc = widget.fn.f(c);
  return Math.abs(fc - avg) <= 0.02 * Math.max(1, Math.abs(avg))
    ? {
        correct: true,
        feedback: `Correct: f(${fmt(c, 3)}) = ${fmt(fc, 3)}, the average value. This c is the number Theorem 2.4.1 promises.`,
      }
    : {
        correct: false,
        feedback: `f(${fmt(c, 3)}) = ${fmt(fc, 3)}, but the average value is ${fmt(avg, 3)}. Move c to where the curve reaches the rectangle's top edge.`,
      };
}

// =============================================================================
// Converge or Diverge / Approach the Asymptote (one engine)
// =============================================================================

export interface Reason {
  id: string;
  text: string;
  correct: boolean;
  why: string;
}

export interface ImproperWidget {
  type: 'improper';
  mode: 'infinite' | 'asymptote';
  f: Fn;
  /** The integral, e.g. "\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx". */
  integralTex: string;
  /** Fixed end and the improper end that t approaches. */
  fixed: number;
  approaches: number;
  /** A(t), exactly (the integral from the fixed end to t, or from t to the fixed end). */
  partial: (t: number) => number;
  partialTex: string;
  converges: boolean;
  limit?: number;
  limitTex?: string;
  reasons: Reason[];
  /** An interior discontinuity: the learner must split here before predicting. */
  split?: {
    at: number;
    options: number[];
    /** What a careless F(b) − F(a) would give, and why it is invalid. */
    naiveTex: string;
  };
  view: { xMin: number; xMax: number; yMin: number; yMax: number };
}

export type ConvergencePrediction = 'converges' | 'diverges';

export function evaluateImproperPrediction(
  widget: ImproperWidget,
  prediction: ConvergencePrediction,
): CheckedEvaluation {
  const truth: ConvergencePrediction = widget.converges ? 'converges' : 'diverges';
  const what = widget.converges
    ? `A(t) settles down to ${widget.limitTex ?? 'a finite number'}`
    : 'A(t) grows without bound';
  return prediction === truth
    ? { correct: true, feedback: `Your prediction was right: as t approaches the end, ${what}.` }
    : {
        correct: false,
        feedback: `Not this time: as t approaches the end, ${what}. Watch A(t) as you move t, then choose the reason.`,
      };
}

export function evaluateImproperReason(widget: ImproperWidget, reasonId: string): CheckedEvaluation {
  const reason = widget.reasons.find((r) => r.id === reasonId);
  if (!reason) return { correct: false, feedback: 'Choose a reason first.', cannotCheck: true };
  return { correct: reason.correct, feedback: reason.why };
}

export function evaluateSplit(widget: ImproperWidget, at: number): CheckedEvaluation {
  if (!widget.split) return { correct: true, feedback: 'No split is needed.' };
  return at === widget.split.at
    ? {
        correct: true,
        feedback: `Correct: f is unbounded at x = ${fmt(at)}, inside the interval, so Definition 2.5.4 needs both pieces, each with its own limit.`,
      }
    : {
        correct: false,
        feedback: `f is defined and bounded near x = ${fmt(at)}. Split where f is unbounded (where the graph has its vertical asymptote).`,
      };
}

// =============================================================================
// Compare & Decide (the Comparison Theorem)
// =============================================================================

export interface Candidate {
  id: string;
  tex: string;
  /** Plain text for buttons and screen readers, e.g. "1/x²". */
  label: string;
  f: Fn;
  /** Whether ∫ₐ^∞ of this candidate converges (known from the notes). */
  converges: boolean;
  known: string;
}

export interface ComparisonWidget {
  type: 'comparison';
  /** The integrand being judged. */
  integrand: { tex: string; f: Fn };
  a: number;
  candidates: Candidate[];
  /** The true behaviour of the integrand's integral. */
  converges: boolean;
}

export type Conclusion = 'converges' | 'diverges' | 'nothing';
export type Relation = 'above' | 'below' | 'crosses';

/** Whether the candidate stays above or below the integrand for x ≥ a (checked over a long range). */
export function relationOf(widget: ComparisonWidget, candidate: Candidate): Relation {
  let above = true;
  let below = true;
  for (let k = 0; k <= 400; k++) {
    const x = widget.a + 0.02 * k + (k > 200 ? (k - 200) * 0.5 : 0);
    const g = widget.integrand.f(x);
    const c = candidate.f(x);
    if (!Number.isFinite(g) || !Number.isFinite(c)) continue;
    if (c < g - 1e-12) above = false;
    if (c > g + 1e-12) below = false;
  }
  return above ? 'above' : below ? 'below' : 'crosses';
}

/** What the Comparison Theorem lets you conclude from this candidate. */
export function allowedConclusion(widget: ComparisonWidget, candidate: Candidate): Conclusion {
  const relation = relationOf(widget, candidate);
  if (relation === 'above' && candidate.converges) return 'converges';
  if (relation === 'below' && !candidate.converges) return 'diverges';
  return 'nothing';
}

export function evaluateComparison(
  widget: ComparisonWidget,
  candidateId: string,
  conclusion: Conclusion,
): CheckedEvaluation {
  const candidate = widget.candidates.find((c) => c.id === candidateId);
  if (!candidate) return { correct: false, feedback: 'Choose a comparison function first.', cannotCheck: true };
  const relation = relationOf(widget, candidate);
  const allowed = allowedConclusion(widget, candidate);
  const side =
    relation === 'above'
      ? 'stays above the integrand'
      : relation === 'below'
        ? 'stays below the integrand'
        : 'crosses the integrand';
  if (conclusion !== allowed) {
    if (allowed === 'nothing') {
      return {
        correct: false,
        feedback: `This function ${side} for x ≥ ${widget.a}, and its integral ${candidate.converges ? 'converges' : 'diverges'}. ${
          relation === 'crosses'
            ? 'The theorem needs one function to stay above the other for every x ≥ a.'
            : relation === 'above'
              ? 'Being below a function whose integral diverges proves nothing (Remark 2.5.4).'
              : 'Being above a function whose integral converges proves nothing (Remark 2.5.4).'
        }`,
      };
    }
    return {
      correct: false,
      feedback: `This function ${side} for x ≥ ${widget.a} and its integral ${candidate.converges ? 'converges' : 'diverges'}, so Theorem 2.5.1 ${allowed === 'converges' ? '(a)' : '(b)'} gives a conclusion: the integral ${allowed}.`,
    };
  }
  if (allowed === 'nothing') {
    return {
      correct: false,
      cannotCheck: true,
      feedback: `Right: nothing follows from this comparison (Remark 2.5.4). Find a comparison function that is ${
        widget.converges ? 'larger and has a convergent integral' : 'smaller and has a divergent integral'
      }.`,
    };
  }
  return {
    correct: true,
    feedback: `Correct: $${candidate.tex}$ ${side} for $x \\ge ${widget.a}$, and ${candidate.known} So by Theorem 2.5.1 ${allowed === 'converges' ? '(a)' : '(b)'} the integral ${allowed}.`,
  };
}

export type AreaWidget =
  | RiemannWidget
  | ChainWidget
  | PropertyWidget
  | AccumulationWidget
  | EqualAreaWidget
  | ImproperWidget
  | ComparisonWidget;
