/**
 * Checks learner working for definite and improper integrals (Topic 2).
 *
 * Like check.ts, everything is checked numerically and nothing is executed:
 * learner lines are parsed by lib/math/input and evaluated with a fixed set
 * of operations. A line is read by the letters it uses:
 *
 *   - x (the variable of integration), a substitution, or an integral sign:
 *     handed to the indefinite-integral checker (an anti-derivative, a
 *     rewrite of the integrand, u = …, du = …);
 *   - Δx = …, x_i = …, x_{i-1} = …: compared with (b − a)/n, a + iΔx and
 *     a + (i − 1)Δx;
 *   - n only (a closed form of a Riemann sum): compared with Rₙ, Lₙ and the
 *     midpoint sum Mₙ, computed directly for several n;
 *   - i and n (the ith term of a sum): compared with f(xᵢ)Δx and its left and
 *     midpoint versions;
 *   - t only (an improper integral before the limit): compared with ∫ₐᵗ f or
 *     ∫ₜᵇ f by its rate of change and its value;
 *   - numbers only: compared with the value of the integral;
 *   - "lim …": the limit is estimated numerically and compared.
 *
 * Anything the checker cannot judge reliably returns "cannot check" with an
 * explanation, never "incorrect".
 */
import {
  type AnswerStatus,
  type CheckProblem,
  checkStep,
  emptyWorkingState,
  type Feedback,
  type WorkingState,
} from './check';
import { evaluate, type EvalContext } from './input/evaluate';
import { containsIntegral, type ExprNode, ParseError, parseStatement, type Statement, symbolsOf } from './input/parse';

// -----------------------------------------------------------------------------
// Specification (stored with each practice item)
// -----------------------------------------------------------------------------

export type DefiniteAnswer =
  /** The value of the integral (or of an approximation when `approximate`). */
  | { kind: 'value'; value: number; approximate?: boolean }
  /** Several approximations at once, e.g. R₄, R₆ and R₈, separated by commas. */
  | { kind: 'values'; labels: string[]; values: number[] }
  /** The integral diverges. */
  | { kind: 'divergent' }
  /** Converges or diverges, decided by a test (no value needed). */
  | { kind: 'verdict'; converges: boolean }
  /** The ith term f(xᵢ)Δx of a Riemann sum, in terms of i and n. */
  | { kind: 'riemannTerm'; rule: 'right' | 'left' }
  /** A written comment: compared with the guidance, not checked automatically. */
  | { kind: 'explanation' };

export interface IntegrandPiece {
  /** The integrand in learner syntax, e.g. "(x - 1)^2 + 2". */
  integrand: string;
  from: number;
  to: number;
}

export interface DefiniteSpec {
  /** One integrand on the whole interval, or `pieces` for a function defined piecewise. */
  integrand?: string;
  pieces?: IntegrandPiece[];
  variable: string;
  /** Limits as printed: lower may exceed upper (reversed limits); ±Infinity for Type I. */
  lower: number;
  upper: number;
  /** Points of [lower, upper] where the integrand is unbounded (Type II), endpoints included. */
  singular?: number[];
  answer: DefiniteAnswer;
}

// -----------------------------------------------------------------------------
// Compiled problem
// -----------------------------------------------------------------------------

interface CompiledPiece {
  f: (x: number) => number;
  lo: number;
  hi: number;
  /** The indefinite-integral checker's view of this piece. */
  check: CheckProblem;
}

export interface DefiniteProblem {
  spec: DefiniteSpec;
  pieces: CompiledPiece[];
  /** The integrand on the whole interval (piece by piece). */
  f: (x: number) => number;
  a: number;
  b: number;
}

const baseContext = (variable: string): EvalContext => ({ variable, constants: {}, definitions: {}, base: 0 });

function compileExpression(text: string, variable: string): (x: number) => number {
  const statement = parseStatement(text);
  if (statement.k !== 'expr') throw new Error(`Not an expression: ${text}`);
  const ctx = baseContext(variable);
  return (x) => {
    try {
      return evaluate(statement.node, x, ctx).v;
    } catch {
      return Number.NaN;
    }
  };
}

/** Points strictly inside (lo, hi) for checking, away from the ends (which may be infinite or singular). */
function interiorPoints(lo: number, hi: number): number[] {
  if (Number.isFinite(lo) && Number.isFinite(hi)) return [0.17, 0.39, 0.61, 0.83].map((s) => lo + s * (hi - lo));
  if (Number.isFinite(lo)) return [0.6, 1.5, 3.2, 5.5].map((s) => lo + s);
  if (Number.isFinite(hi)) return [0.6, 1.5, 3.2, 5.5].map((s) => hi - s);
  return [-1.7, -0.6, 0.45, 1.3];
}

/** Compiles a specification. Throws if an integrand cannot be read (a content error). */
export function compileDefinite(spec: DefiniteSpec): DefiniteProblem {
  const a = spec.lower;
  const b = spec.upper;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const sources = spec.pieces ?? [{ integrand: spec.integrand ?? '', from: lo, to: hi }];
  const pieces = sources.map((piece): CompiledPiece => {
    const f = compileExpression(piece.integrand, spec.variable);
    const pLo = Math.min(piece.from, piece.to);
    const pHi = Math.max(piece.from, piece.to);
    const inner = (spec.singular ?? []).filter((s) => s > pLo && s < pHi);
    // Avoid an interior singularity: sample on the larger side of it.
    const [cLo, cHi] =
      inner.length > 0 && inner[0] !== undefined
        ? inner[0] - pLo > pHi - inner[0]
          ? [pLo, inner[0]]
          : [inner[0], pHi]
        : [pLo, pHi];
    return {
      f,
      lo: pLo,
      hi: pHi,
      check: { integrand: f, variable: spec.variable, points: interiorPoints(cLo, cHi), constants: {} },
    };
  });
  const f = (x: number): number => {
    const piece = pieces.find((p) => x >= p.lo && x < p.hi) ?? pieces.find((p) => x >= p.lo && x <= p.hi);
    return piece ? piece.f(x) : Number.NaN;
  };
  return { spec, pieces, f, a, b };
}

// -----------------------------------------------------------------------------
// Numbers
// -----------------------------------------------------------------------------

const close = (a: number, b: number, tolerance = 1e-7) => Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(b));
/** Rounded answers: four decimal places (or four significant figures for large values). */
const roughlyClose = (a: number, b: number) => Math.abs(a - b) <= 5.1e-4 * Math.max(1, Math.abs(b));

const N_SAMPLES = [3, 7, 12];
const IN_SAMPLES: [number, number][] = [
  [1, 6],
  [2, 9],
  [5, 13],
  [3, 4],
];

export type Rule = 'right' | 'left' | 'midpoint';
const RULE_WORDS: Record<Rule, string> = { right: 'right endpoints', left: 'left endpoints', midpoint: 'midpoints' };

function finiteInterval(problem: DefiniteProblem): boolean {
  return Number.isFinite(problem.a) && Number.isFinite(problem.b) && !(problem.spec.singular ?? []).length;
}

/** x-value used for the ith rectangle (i = 1 … n). */
function samplePoint(problem: DefiniteProblem, i: number, n: number, rule: Rule): number {
  const dx = (problem.b - problem.a) / n;
  const offset = rule === 'right' ? i : rule === 'left' ? i - 1 : i - 0.5;
  return problem.a + offset * dx;
}

/** Rₙ, Lₙ or Mₙ computed directly. */
export function riemannSumOf(problem: DefiniteProblem, n: number, rule: Rule): number {
  const dx = (problem.b - problem.a) / n;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += problem.f(samplePoint(problem, i, n, rule)) * dx;
  return sum;
}

function simpson(f: (x: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return (sum * h) / 3;
}

// -----------------------------------------------------------------------------
// Evaluating learner expressions in n, i and t
// -----------------------------------------------------------------------------

const RESERVED = new Set(['e', 'π', 'C', 'K']);

function freeSymbols(node: ExprNode): Set<string> {
  const symbols = symbolsOf(node);
  for (const r of RESERVED) symbols.delete(r);
  return symbols;
}

/** Values for the Riemann-sum symbols at given n (and i). */
function riemannValues(problem: DefiniteProblem, n: number, i: number): Record<string, number> {
  const dx = (problem.b - problem.a) / n;
  return {
    n,
    i,
    Δx: dx,
    x_i: problem.a + i * dx,
    'x_i-1': problem.a + (i - 1) * dx,
  };
}

/** Evaluates a node with the given symbol values; NaN when it cannot be evaluated. */
function valueAt(node: ExprNode, values: Record<string, number>, variable = '__none'): number {
  try {
    return evaluate(node, values[variable] ?? 0, { variable, constants: values, definitions: {}, base: 0 }).v;
  } catch {
    return Number.NaN;
  }
}

/** Value and rate of change with respect to `variable` at `x`. */
function dualAt(node: ExprNode, variable: string, x: number): { v: number; d: number } {
  try {
    return evaluate(node, x, baseContext(variable));
  } catch {
    return { v: Number.NaN, d: Number.NaN };
  }
}

// -----------------------------------------------------------------------------
// Improper integrals: the partial integrals A(t)
// -----------------------------------------------------------------------------

interface PartialIntegral {
  /** "upper": A(t) = ∫ₚᵗ f, t → q. "lower": A(t) = ∫ₜ^q f, t → p. */
  side: 'upper' | 'lower';
  p: number;
  q: number;
  /** Values of t at which to compare, moving towards the improper end. */
  ts: number[];
}

function partialIntegrals(problem: DefiniteProblem): PartialIntegral[] {
  const lo = Math.min(problem.a, problem.b);
  const hi = Math.max(problem.a, problem.b);
  const singular = problem.spec.singular ?? [];
  const cuts = [lo, ...singular.filter((s) => s > lo && s < hi).sort((x, y) => x - y), hi];
  const isImproper = (x: number) => !Number.isFinite(x) || singular.includes(x);
  const result: PartialIntegral[] = [];
  for (let k = 0; k + 1 < cuts.length; k++) {
    const p = cuts[k] as number;
    const q = cuts[k + 1] as number;
    const towards = (end: number, other: number): number[] =>
      Number.isFinite(end)
        ? Number.isFinite(other)
          ? [0.6, 0.85, 0.97].map((s) => other + s * (end - other))
          : [
              end - Math.sign(end - other) * 1.5,
              end - Math.sign(end - other) * 0.6,
              end - Math.sign(end - other) * 0.15,
            ]
        : Number.isFinite(other)
          ? [1.5, 3.5, 8].map((s) => other + Math.sign(end) * s)
          : [1.5, 3.5, 8].map((s) => Math.sign(end) * s);
    if (isImproper(q)) result.push({ side: 'upper', p, q, ts: towards(q, p) });
    if (isImproper(p)) result.push({ side: 'lower', p, q, ts: towards(p, q) });
  }
  return result;
}

type PartialMatch = 'match' | 'rateOnly' | 'none';

/** Does the expression in t equal the partial integral (same rate of change, and the same value where checkable)? */
function matchesPartial(node: ExprNode, problem: DefiniteProblem, partial: PartialIntegral): PartialMatch {
  const sign = partial.side === 'upper' ? 1 : -1;
  let valid = 0;
  for (const t of partial.ts) {
    const { d } = dualAt(node, 't', t);
    const rate = problem.f(t);
    if (!Number.isFinite(d) || !Number.isFinite(rate)) continue;
    valid++;
    if (!close(d, sign * rate, 1e-6)) return 'none';
  }
  if (valid < 2) return 'none';
  // The value pins down the constant: compare at the t farthest from the improper end.
  const fixed = partial.side === 'upper' ? partial.p : partial.q;
  const t = partial.ts[0] as number;
  if (!Number.isFinite(fixed)) return 'rateOnly';
  const exact = partial.side === 'upper' ? simpson(problem.f, fixed, t) : simpson(problem.f, t, fixed);
  const value = dualAt(node, 't', t).v;
  if (!Number.isFinite(exact) || !Number.isFinite(value)) return 'rateOnly';
  return close(value, exact, 1e-5) ? 'match' : 'rateOnly';
}

// -----------------------------------------------------------------------------
// Limits typed by the learner: "lim (1 + 1/n)", "lim t→∞ (1 − 1/t)"
// -----------------------------------------------------------------------------

const LIMIT_PREFIX =
  /^\s*lim\s*(?:_?\s*\(?\s*([nt])\s*(?:→|->)\s*(?:∞|inf(?:inity)?|[-+]?\d+(?:\.\d+)?\s*[-+⁺⁻]?)\s*\)?)?\s*/i;

type SideValue =
  | { kind: 'number'; v: number }
  | { kind: 'infinite'; sign: 1 | -1 }
  | { kind: 'expr'; node: ExprNode }
  | { kind: 'error'; message: string };

const INFINITY_WORDS = /^\s*([-+−]?)\s*(∞|inf|infinity)\s*$/i;

/** Estimates lim of an expression in n (n → ∞) or t (t → the improper end). */
function limitOf(node: ExprNode, problem: DefiniteProblem): SideValue {
  const symbols = freeSymbols(node);
  const variable = symbols.has('t') ? 't' : 'n';
  let sequence: number[];
  if (variable === 'n') {
    sequence = [1e4, 1e5, 1e6].map((n) => valueAt(node, riemannValues(problem, n, 0)));
  } else {
    const partial = partialIntegrals(problem)[0];
    if (!partial) return { kind: 'error', message: 'This integral has no limit in t to take.' };
    const end = partial.side === 'upper' ? partial.q : partial.p;
    const other = partial.side === 'upper' ? partial.p : partial.q;
    const ts = Number.isFinite(end)
      ? [1e-4, 1e-6, 1e-8].map((h) => end - Math.sign(end - (Number.isFinite(other) ? other : end - 1)) * h)
      : [1e3, 1e5, 1e7].map((s) => Math.sign(end) * s);
    sequence = ts.map((t) => valueAt(node, { t }));
  }
  const [, second, last] = sequence as [number, number, number];
  if (!Number.isFinite(last)) {
    return last === Infinity || last === -Infinity
      ? { kind: 'infinite', sign: last > 0 ? 1 : -1 }
      : { kind: 'error', message: 'This limit could not be estimated.' };
  }
  if (Math.abs(last) > 1e6 && Math.abs(last) > 5 * Math.abs(second))
    return { kind: 'infinite', sign: last > 0 ? 1 : -1 };
  if (Math.abs(last - second) <= 2e-3 * Math.max(1, Math.abs(last))) return { kind: 'number', v: last };
  return { kind: 'error', message: 'This limit could not be estimated reliably.' };
}

function readSide(text: string, problem: DefiniteProblem): SideValue {
  const infinity = INFINITY_WORDS.exec(text);
  if (infinity) return { kind: 'infinite', sign: infinity[1] === '-' || infinity[1] === '−' ? -1 : 1 };
  const limit = LIMIT_PREFIX.exec(text);
  const body = limit && /^\s*lim/i.test(text) ? text.slice(limit[0].length) : text;
  let statement: Statement;
  try {
    statement = parseStatement(body);
  } catch (error) {
    return { kind: 'error', message: error instanceof ParseError ? error.message : 'This could not be read.' };
  }
  if (statement.k !== 'expr') return { kind: 'error', message: 'This could not be read.' };
  if (limit && /^\s*lim/i.test(text)) return limitOf(statement.node, problem);
  return { kind: 'expr', node: statement.node };
}

// -----------------------------------------------------------------------------
// Working: one line at a time
// -----------------------------------------------------------------------------

export interface DefiniteWorkingState {
  /** The indefinite-integral checker's state for each piece (substitutions defined so far). */
  pieces: WorkingState[];
}

export const emptyDefiniteState = (problem: DefiniteProblem): DefiniteWorkingState => ({
  pieces: problem.pieces.map(() => emptyWorkingState()),
});

const correct = (message: string): Feedback => ({ status: 'correct', message });
const incorrect = (message: string): Feedback => ({ status: 'incorrect', message });
const cannot = (message: string): Feedback => ({ status: 'cannotCheck', message });

const RIEMANN_SYMBOLS = new Set(['n', 'Δx']);
const TERM_SYMBOLS = new Set(['n', 'i', 'Δx', 'x_i', 'x_i-1']);

const subset = (symbols: Set<string>, allowed: Set<string>) => [...symbols].every((s) => allowed.has(s));

/** Compares a function of n with Rₙ, Lₙ and Mₙ. */
function checkSequence(node: ExprNode, problem: DefiniteProblem): Feedback {
  if (!finiteInterval(problem)) {
    return cannot('Riemann sums in n are used for integrals over a finite interval with a bounded integrand.');
  }
  for (const rule of ['right', 'left', 'midpoint'] as Rule[]) {
    const matches = N_SAMPLES.every((n) =>
      close(valueAt(node, riemannValues(problem, n, 0)), riemannSumOf(problem, n, rule)),
    );
    if (matches) {
      return correct(
        rule === 'right'
          ? 'Correct: this is the Riemann sum Rₙ with right endpoints. Now let n → ∞.'
          : `Correct: this is the Riemann sum with ${RULE_WORDS[rule]}.`,
      );
    }
  }
  return incorrect("This doesn't match the Riemann sum Σ f(xᵢ)Δx. Check this step, or ask for a hint.");
}

/** Compares a function of i and n with the ith term of a Riemann sum (or the height of the ith rectangle). */
function checkTerm(
  node: ExprNode,
  problem: DefiniteProblem,
): { feedback: Feedback; rule: Rule | null; height: boolean } {
  if (!finiteInterval(problem)) {
    return {
      feedback: cannot('Riemann sums are used for a finite interval with a bounded integrand.'),
      rule: null,
      height: false,
    };
  }
  for (const rule of ['right', 'left', 'midpoint'] as Rule[]) {
    const term = (i: number, n: number) => problem.f(samplePoint(problem, i, n, rule)) * ((problem.b - problem.a) / n);
    if (IN_SAMPLES.every(([i, n]) => close(valueAt(node, riemannValues(problem, n, i)), term(i, n)))) {
      return {
        feedback: correct(
          rule === 'right'
            ? 'Correct: this is the ith term f(xᵢ)Δx with right endpoints.'
            : `Correct: this is the ith term with ${RULE_WORDS[rule]}.`,
        ),
        rule,
        height: false,
      };
    }
    const height = (i: number, n: number) => problem.f(samplePoint(problem, i, n, rule));
    if (IN_SAMPLES.every(([i, n]) => close(valueAt(node, riemannValues(problem, n, i)), height(i, n)))) {
      return {
        feedback: correct(
          `Correct: this is the height of the ith rectangle (${RULE_WORDS[rule]}). Multiply by Δx for its area.`,
        ),
        rule,
        height: true,
      };
    }
  }
  return {
    feedback: incorrect("This doesn't match the ith term f(xᵢ)Δx. Check xᵢ = a + iΔx and Δx = (b − a)/n."),
    rule: null,
    height: false,
  };
}

function checkPartial(node: ExprNode, problem: DefiniteProblem): Feedback {
  const partials = partialIntegrals(problem);
  if (partials.length === 0) return cannot('The letter t is used for improper integrals, before taking the limit.');
  let rateOnly = false;
  for (const partial of partials) {
    const result = matchesPartial(node, problem, partial);
    if (result === 'match') {
      return correct(
        partial.side === 'upper'
          ? `Correct: this is the integral up to t. Now let t → ${Number.isFinite(partial.q) ? `${fmt(partial.q)}⁻` : '∞'}.`
          : `Correct: this is the integral from t. Now let t → ${Number.isFinite(partial.p) ? `${fmt(partial.p)}⁺` : '−∞'}.`,
      );
    }
    if (result === 'rateOnly') rateOnly = true;
  }
  return rateOnly
    ? partials.every((p) => !Number.isFinite(p.side === 'upper' ? p.p : p.q))
      ? correct('Correct: this changes with t exactly as the integral does.')
      : incorrect('The part with t is right, but the constant part is not: check the value at the fixed limit.')
    : incorrect("This doesn't match the integral up to t. Check the anti-derivative, or ask for a hint.");
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/0+$/, ''));

/** Compares a number with the answer the question asks for. */
function checkNumber(v: number, problem: DefiniteProblem): Feedback {
  const answer = problem.spec.answer;
  if (answer.kind === 'value') {
    if (answer.approximate ? roughlyClose(v, answer.value) : close(v, answer.value)) {
      return correct(
        answer.approximate ? 'Correct: this is the approximation.' : 'Correct: this equals the value of the integral.',
      );
    }
    return incorrect("This isn't equal to the value of the integral. Check this step, or ask for a hint.");
  }
  if (answer.kind === 'values') {
    const index = answer.values.findIndex((target) => roughlyClose(v, target));
    return index >= 0
      ? correct(`Correct: this matches ${answer.labels[index]}.`)
      : cannot('This number does not match any of the approximations asked for. Check your arithmetic.');
  }
  return cannot('A number on its own cannot be checked here; compare it with the hints.');
}

function sideFeedback(side: SideValue, problem: DefiniteProblem): Feedback | null {
  if (side.kind === 'error') return cannot(side.message);
  if (side.kind === 'infinite') {
    const answer = problem.spec.answer;
    if (answer.kind === 'divergent') return correct('Correct: the limit is infinite, so the integral diverges.');
    if (answer.kind === 'verdict') {
      return answer.converges
        ? incorrect('Check this limit again: does it really grow without bound?')
        : correct('Correct: the limit is infinite, so the integral diverges.');
    }
    return incorrect('Check this limit again: does it really grow without bound?');
  }
  if (side.kind === 'number') return checkNumber(side.v, problem);
  return null;
}

/** Splits a line on "=" at the top level (outside brackets). */
function splitSides(input: string): string[] {
  const sides: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of input) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === '=' && depth === 0) {
      sides.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  sides.push(current);
  return sides;
}

/** Δx = …, x_i = …, x_{i-1} = …: a definition from the Riemann-sum method. */
function checkRiemannDefinition(name: string, rhs: ExprNode, problem: DefiniteProblem): Feedback {
  if (!finiteInterval(problem)) return cannot('Riemann sums are used for a finite interval with a bounded integrand.');
  const expected = (i: number, n: number) => riemannValues(problem, n, i)[name] as number;
  const ok = IN_SAMPLES.every(([i, n]) => close(valueAt(rhs, riemannValues(problem, n, i)), expected(i, n)));
  if (name === 'Δx') {
    return ok
      ? correct('Correct: Δx = (b − a)/n.')
      : incorrect('Δx is the length of the interval, b − a, divided by n.');
  }
  return ok
    ? correct(name === 'x_i' ? 'Correct: xᵢ = a + iΔx.' : 'Correct: xᵢ₋₁ = a + (i − 1)Δx.')
    : incorrect(name === 'x_i' ? 'xᵢ is a + iΔx: start at a and take i steps of Δx.' : 'xᵢ₋₁ is a + (i − 1)Δx.');
}

const INEQUALITY = /≤|≥|<=|>=|<|>/;

/** Values of x at which an inequality is tested: across the interval, out to large x when it is infinite. */
function inequalityPoints(problem: DefiniteProblem): number[] {
  const lo = Math.min(problem.a, problem.b);
  const hi = Math.max(problem.a, problem.b);
  const offsets = [0.01, 0.25, 0.5, 1, 1.5, 2, 3, 5, 10, 25, 60];
  if (Number.isFinite(lo) && !Number.isFinite(hi)) return offsets.map((s) => lo + s);
  if (!Number.isFinite(lo) && Number.isFinite(hi)) return offsets.map((s) => hi - s);
  if (!Number.isFinite(lo)) return [-25, -5, -1, -0.3, 0, 0.3, 1, 5, 25];
  return [0.01, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.99].map((s) => lo + s * (hi - lo));
}

/** "e^(-x^2) <= e^(-x)": tested at many points of the interval (a comparison needs it for every x ≥ a). */
function checkInequality(input: string, problem: DefiniteProblem): Feedback {
  const parts = input.split(INEQUALITY);
  const operators = input.match(new RegExp(INEQUALITY.source, 'g')) ?? [];
  if (parts.length !== 2 || operators.length !== 1)
    return cannot('Write one inequality per step, for example e^(-x^2) <= e^(-x).');
  const variable = problem.spec.variable;
  const nodes: ExprNode[] = [];
  for (const part of parts) {
    try {
      const statement = parseStatement(part);
      if (statement.k !== 'expr') return cannot('Write one inequality per step, for example e^(-x^2) <= e^(-x).');
      nodes.push(statement.node);
    } catch (error) {
      return cannot(error instanceof ParseError ? error.message : 'This could not be read.');
    }
  }
  const unknown = nodes.flatMap((n) => [...freeSymbols(n)]).filter((s) => s !== variable);
  if (unknown.length > 0) return cannot(`Write the inequality in terms of ${variable} only.`);
  const op = operators[0] as string;
  const holds = (left: number, right: number) =>
    op === '≤' || op === '<='
      ? left <= right + 1e-12
      : op === '≥' || op === '>='
        ? left >= right - 1e-12
        : op === '<'
          ? left < right
          : left > right;
  const failures: number[] = [];
  let valid = 0;
  for (const x of inequalityPoints(problem)) {
    const [left, right] = nodes.map((n) => dualAt(n, variable, x).v) as [number, number];
    if (!Number.isFinite(left) || !Number.isFinite(right)) continue;
    valid++;
    if (!holds(left, right)) failures.push(x);
  }
  if (valid < 3) return cannot('This inequality could not be evaluated at enough points to check it.');
  if (failures.length === 0) return correct('Correct: this inequality holds at every value checked on the interval.');
  const largest = Math.max(...failures);
  const points = inequalityPoints(problem);
  const tailHolds =
    !Number.isFinite(Math.max(problem.a, problem.b)) && largest < (points[points.length - 4] ?? Infinity);
  return tailHolds
    ? {
        status: 'info',
        message: `This holds for larger ${variable}, but not everywhere on the interval (it fails at ${variable} = ${fmt(largest)}). Split the integral where it starts to hold.`,
      }
    : incorrect(
        `This inequality is not true for every ${variable} in the interval (try ${variable} = ${fmt(largest)}).`,
      );
}

/** Checks one line of working. Returns the feedback and the state for the next line. */
export function checkDefiniteStep(
  line: string,
  problem: DefiniteProblem,
  state: DefiniteWorkingState,
): { feedback: Feedback; state: DefiniteWorkingState } {
  const keep = (feedback: Feedback) => ({ feedback, state });
  // "n -> ∞" is an arrow, not "greater than".
  const input = line.replace(/->/g, '→');
  if (INEQUALITY.test(input)) return keep(checkInequality(input, problem));
  if (/(∫|\bint)\s*_/.test(input)) {
    return keep(
      cannot(
        'Limits on ∫ cannot be typed here. Write the anti-derivative, then its values at the limits, e.g. 9/2 − 1/2.',
      ),
    );
  }
  const texts = splitSides(input);
  let sides = texts.map((t) => readSide(t, problem));
  const error = sides.find((s): s is Extract<SideValue, { kind: 'error' }> => s.kind === 'error');
  if (error) return keep(cannot(error.message));

  const variable = problem.spec.variable;
  const definedSubstitutions = new Set(state.pieces.flatMap((p) => Object.keys(p.definitions)));
  const exprNodes = (list: SideValue[]) => list.flatMap((s) => (s.kind === 'expr' ? [s.node] : []));

  // Δx = …, x_i = …
  const first = sides[0]?.kind === 'expr' ? sides[0].node : undefined;
  if (
    sides.length === 2 &&
    first?.k === 'sym' &&
    ['Δx', 'x_i', 'x_i-1'].includes(first.name) &&
    sides[1]?.kind === 'expr'
  ) {
    return keep(checkRiemannDefinition(first.name, sides[1].node, problem));
  }

  // "R_n = 1 + 1/n", "A(t) = …": a name for what follows, not a substitution (the rest has no x).
  const usesX = (list: SideValue[]) => exprNodes(list).some((n) => freeSymbols(n).has(variable) || containsIntegral(n));
  if (
    sides.length >= 2 &&
    first?.k === 'sym' &&
    first.name !== variable &&
    !TERM_SYMBOLS.has(first.name) &&
    first.name !== 't' &&
    !definedSubstitutions.has(first.name) &&
    !usesX(sides.slice(1))
  ) {
    sides = sides.slice(1);
  }

  const nodes = exprNodes(sides);
  const symbols = new Set(nodes.flatMap((n) => [...freeSymbols(n)]));

  // The variable of integration, a substitution or an integral: the indefinite checker, piece by piece.
  const aboutX =
    symbols.has(variable) || [...symbols].some((s) => definedSubstitutions.has(s)) || nodes.some(containsIntegral);
  if (aboutX && sides.every((s) => s.kind === 'expr')) {
    const results = problem.pieces.map((piece, index) =>
      checkStep(input, piece.check, state.pieces[index] ?? emptyWorkingState()),
    );
    const best =
      results.find((r) => r.feedback.status === 'correct') ?? results.find((r) => r.feedback.status === 'info');
    const chosen = best ?? results[0];
    if (!chosen) return keep(cannot('This step could not be checked.'));
    return {
      feedback: chosen.feedback,
      state: { pieces: results.map((r) => r.state) },
    };
  }

  // Numbers, limits and infinities, side by side.
  if (sides.length > 1) {
    for (let k = 0; k + 1 < sides.length; k++) {
      const equal = sidesEqual(sides[k] as SideValue, sides[k + 1] as SideValue, problem);
      if (equal === false) {
        return keep(
          incorrect(
            sides.length > 2
              ? `Parts ${k + 1} and ${k + 2} of this line are not equal.`
              : 'The two sides are not equal.',
          ),
        );
      }
      if (equal === null) return keep(cannot('These two sides could not be compared automatically.'));
    }
  }
  const last = sides[sides.length - 1] as SideValue;
  const direct = sideFeedback(last, problem);
  if (direct) return keep(direct);

  const node = (last as Extract<SideValue, { kind: 'expr' }>).node;
  const free = freeSymbols(node);
  if (free.size === 0) return keep(checkNumber(valueAt(node, {}), problem));
  if (free.has('t') && free.size === 1) return keep(checkPartial(node, problem));
  if (subset(free, RIEMANN_SYMBOLS)) return keep(checkSequence(node, problem));
  if (subset(free, TERM_SYMBOLS)) return keep(checkTerm(node, problem).feedback);
  const unknown = [...free].filter((s) => !TERM_SYMBOLS.has(s) && s !== 't');
  return keep(
    cannot(
      unknown.length > 0
        ? `I don't know what ${unknown.join(', ')} stands for here. Use ${variable} for the variable, n and i for Riemann sums, or t before a limit.`
        : 'Mixing n, i and t in one line cannot be checked automatically.',
    ),
  );
}

/** true / false when two sides can be compared, null when they cannot. */
function sidesEqual(a: SideValue, b: SideValue, problem: DefiniteProblem): boolean | null {
  if (a.kind === 'infinite' || b.kind === 'infinite') {
    return a.kind === 'infinite' && b.kind === 'infinite' ? a.sign === b.sign : false;
  }
  const valuesOf = (side: SideValue, values: Record<string, number>): number =>
    side.kind === 'number' ? side.v : side.kind === 'expr' ? valueAt(side.node, values) : Number.NaN;
  const symbols = new Set([
    ...(a.kind === 'expr' ? freeSymbols(a.node) : []),
    ...(b.kind === 'expr' ? freeSymbols(b.node) : []),
  ]);
  let samples: Record<string, number>[];
  if (symbols.size === 0) samples = [{}];
  else if (symbols.has('t') && symbols.size === 1) samples = [1.3, 2.7, 4.1].map((t) => ({ t }));
  else if (subset(symbols, TERM_SYMBOLS) && Number.isFinite(problem.a) && Number.isFinite(problem.b))
    samples = IN_SAMPLES.map(([i, n]) => riemannValues(problem, n, i));
  else return null;
  let valid = 0;
  for (const values of samples) {
    const x = valuesOf(a, values);
    const y = valuesOf(b, values);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    valid++;
    // Decimals typed by the learner are compared to four decimal places.
    if (!close(x, y) && !roughlyClose(x, y)) return false;
  }
  return valid > 0 ? true : null;
}

/** Runs every line in order, so each line is checked with the substitutions defined above it. */
export function checkDefiniteWorking(lines: string[], problem: DefiniteProblem): Feedback[] {
  let state = emptyDefiniteState(problem);
  return lines.map((line) => {
    const result = checkDefiniteStep(line, problem, state);
    state = result.state;
    return result.feedback;
  });
}

// -----------------------------------------------------------------------------
// Final answers
// -----------------------------------------------------------------------------

const CONVERGES = /^(it |the integral )?(is )?(converges?|convergent)\.?$/i;
const DIVERGES = /^(it |the integral )?(is )?(diverges?|divergent)\.?$/i;

/** Checks a final answer. `explanation` answers are never graded automatically. */
export function checkDefiniteAnswer(
  input: string,
  problem: DefiniteProblem,
): { status: AnswerStatus; message: string } {
  const text = input.trim();
  const answer = problem.spec.answer;
  const saysConverges = CONVERGES.test(text);
  const saysDiverges = DIVERGES.test(text) || INFINITY_WORDS.test(text);

  switch (answer.kind) {
    case 'explanation':
      return {
        status: 'cannotCheck',
        message: 'This question asks for a written comment. Compare your answer with the app guidance.',
      };
    case 'verdict':
      if (!saysConverges && !saysDiverges) {
        return { status: 'cannotCheck', message: 'Answer "converges" or "diverges".' };
      }
      return saysConverges === answer.converges
        ? {
            status: 'correct',
            message: answer.converges ? 'Correct: the integral converges.' : 'Correct: the integral diverges.',
          }
        : {
            status: 'incorrect',
            message: 'Not quite. Which function are you comparing with, and is it larger or smaller?',
          };
    case 'divergent':
      if (saysDiverges)
        return { status: 'correct', message: 'Correct: the limit is not a finite number, so the integral diverges.' };
      if (saysConverges) return { status: 'incorrect', message: 'Check the limit again: is it a finite number?' };
      break;
    default:
      if (saysDiverges || saysConverges) {
        return { status: 'incorrect', message: 'Not quite. Check again whether the limit exists as a finite number.' };
      }
  }

  if (answer.kind === 'values') {
    const parts = text
      .split(/[,;]/)
      .map((p) => p.replace(/^\s*[A-Za-z]\s*_?\d+\s*=\s*/, '').trim())
      .filter(Boolean);
    if (parts.length !== answer.values.length) {
      return {
        status: 'cannotCheck',
        message: `Give ${answer.values.length} values, separated by commas: ${answer.labels.join(', ')}.`,
      };
    }
    const wrong: string[] = [];
    for (let k = 0; k < parts.length; k++) {
      const side = readSide(parts[k] as string, problem);
      if (side.kind === 'error') return { status: 'cannotCheck', message: side.message };
      const v = side.kind === 'number' ? side.v : side.kind === 'expr' ? valueAt(side.node, {}) : Number.NaN;
      if (!roughlyClose(v, answer.values[k] as number)) wrong.push(answer.labels[k] as string);
    }
    return wrong.length === 0
      ? { status: 'correct', message: 'Correct: all the approximations match.' }
      : {
          status: 'incorrect',
          message: `Not yet right: ${wrong.join(', ')}. Check your arithmetic, or ask for a hint.`,
        };
  }

  const side = readSide(text, problem);
  if (side.kind === 'error') return { status: 'cannotCheck', message: side.message };
  if (side.kind === 'infinite') {
    return answer.kind === 'divergent'
      ? { status: 'correct', message: 'Correct: the limit is infinite, so the integral diverges.' }
      : { status: 'incorrect', message: 'Not quite. Check again whether the limit exists as a finite number.' };
  }

  if (answer.kind === 'riemannTerm') {
    if (side.kind !== 'expr' || !subset(freeSymbols(side.node), TERM_SYMBOLS) || !freeSymbols(side.node).has('i')) {
      return { status: 'incorrect', message: 'Give the ith term of the sum, f(xᵢ)Δx, in terms of i and n.' };
    }
    const result = checkTerm(side.node, problem);
    if (result.feedback.status !== 'correct') return { status: 'incorrect', message: result.feedback.message };
    if (result.height) return { status: 'incorrect', message: 'This is the height of the rectangle. Multiply by Δx.' };
    if (result.rule === answer.rule) {
      return {
        status: 'correct',
        message: `Correct: ${answer.rule === 'right' ? 'A_R' : 'A_L'} is the limit as n → ∞ of the sum of these terms, i = 1 to n.`,
      };
    }
    return {
      status: 'incorrect',
      message: `This term uses ${RULE_WORDS[result.rule ?? 'right']}. The question asks for ${RULE_WORDS[answer.rule]}.`,
    };
  }

  const value =
    side.kind === 'number'
      ? side.v
      : (() => {
          const free = freeSymbols(side.node);
          return free.size === 0 ? valueAt(side.node, {}) : Number.NaN;
        })();
  if (side.kind === 'expr' && freeSymbols(side.node).size > 0) {
    return {
      status: 'incorrect',
      message: `Your answer should be a number; it still contains ${[...freeSymbols(side.node)].join(', ')}. Take the limit first.`,
    };
  }
  if (answer.kind === 'divergent') {
    return { status: 'incorrect', message: 'Check the limit again: is it really a finite number?' };
  }
  if (answer.kind !== 'value' || !Number.isFinite(value)) {
    return { status: 'cannotCheck', message: 'This answer could not be evaluated.' };
  }
  if (close(value, answer.value)) return { status: 'correct', message: 'Correct!' };
  if (roughlyClose(value, answer.value)) {
    return {
      status: 'correct',
      message: answer.approximate
        ? 'Correct (to the decimals you gave).'
        : 'Correct as a decimal. An exact form is better where you can give one.',
    };
  }
  if (Math.abs(value - answer.value) <= 0.02 * Math.max(1, Math.abs(answer.value))) {
    return {
      status: 'incorrect',
      message: 'Close, but not quite. Check your arithmetic and keep at least four decimal places.',
    };
  }
  return { status: 'incorrect', message: 'Not quite. Check your working, or ask for a hint.' };
}

/** What the final-answer box asks for, and an example of the format. */
export function answerPrompt(answer: DefiniteAnswer): { label: string; placeholder: string } {
  switch (answer.kind) {
    case 'value':
      return answer.approximate
        ? { label: 'Final answer (at least 4 decimal places)', placeholder: 'e.g. 6.3230' }
        : { label: 'Final answer (a number)', placeholder: 'e.g. 9/2, 2sqrt(3) or pi/4' };
    case 'values':
      return { label: `Final answer: ${answer.labels.join(', ')}`, placeholder: 'values separated by commas' };
    case 'divergent':
      return { label: 'Final answer (a number, or "diverges")', placeholder: 'e.g. 3/2 or diverges' };
    case 'verdict':
      return { label: 'Final answer: converges or diverges', placeholder: 'converges / diverges' };
    case 'riemannTerm':
      return {
        label: 'Final answer: the ith term f(xᵢ)Δx, in terms of i and n',
        placeholder: 'e.g. (3/n) e^(2 + 6i/n)',
      };
    case 'explanation':
      return { label: 'Your comment', placeholder: 'Write what you notice' };
  }
}
