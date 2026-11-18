/**
 * Checking for Topic 5 (Multiple Integration, Chapter 5): iterated double and
 * triple integrals, reversing the order of integration, and change of
 * variables with Jacobians.
 *
 * Everything is checked numerically from the question itself, never from a
 * typed key, and nothing a learner types is executed: lines go through the
 * same safe parser as the rest of the app (./input/parse via compileFn).
 *
 *   - A question is a list of equivalent iterated integrals ("forms": the
 *     printed order, the reversed order, the polar or u, v form). Their
 *     values and every intermediate stage (the result after integrating the
 *     innermost variable, then the next) are computed by nested
 *     Gauss–Legendre quadrature at points inside the region.
 *   - A line of working is accepted when it equals a stage of any form, an
 *     anti-derivative with respect to that stage's variable, the value, or a
 *     named quantity of the change of variables (∂x/∂u, J, |J|, f(x(u, v),
 *     y(u, v)), ∂(u, v)/∂(x, y) …). Equivalent forms are accepted because
 *     only values are compared.
 *   - Limits ("0 <= y <= sqrt(x), 0 <= x <= 4") are accepted when they are a
 *     valid iterated description (outer limits constant, each inner limit
 *     depending only on the variables outside it, §5.1) of the same region:
 *     the area (or volume) and first and second moments must agree.
 *
 * Anything that cannot be judged reliably returns "cannot check", never
 * "incorrect".
 */
import { compileFn, type MultiFn } from '@/lib/explore/rn';

import { parseStatement, symbolsOf } from './input/parse';
import { statementToTex } from './input/toTex';

type Point = Record<string, number>;
type Status = 'correct' | 'incorrect' | 'info' | 'cannotCheck';
export interface MultipleFeedback {
  status: Status;
  message: string;
}
export type MultipleAnswerResult = { status: 'correct' | 'incorrect' | 'cannotCheck'; message: string };

// -----------------------------------------------------------------------------
// Specification (stored with each practice item)
// -----------------------------------------------------------------------------

/** One iterated integral, innermost variable first. */
export interface IteratedForm {
  /** Integrand in learner syntax (for a change of variables, already including |J|). */
  f: string;
  /** Variables of integration from innermost to outermost, e.g. ['y', 'x'] for dy dx. */
  vars: string[];
  /** [lower, upper] for each variable (same order), in learner syntax; "inf" for ∞. */
  limits: [string, string][];
  /** How the form is named in feedback, e.g. "the order dy dx" or "the polar form". */
  label?: string;
}

/** x and y as functions of new variables (polar r, θ or u, v). */
export interface Transformation {
  vars: [string, string];
  x: string;
  y: string;
  /** The original integrand f(x, y), for "f in terms of u and v". */
  f?: string;
  /** The new variables as functions of x and y (Example 5.4.3), for ∂(u, v)/∂(x, y). */
  inverse?: { u: string; v: string };
}

export type MultipleAnswer =
  /** A number, or a function of the free variables (Tutorial 6 Q1). */
  | { kind: 'value' }
  /** Constants in a printed form, e.g. "1/a e^p + b/2"; graded by the value they give. */
  | { kind: 'constants'; names: string[]; form: string }
  /**
   * Limits of forms[form] (the reversed order). `named` lets the answer use the question's own names,
   * e.g. a, b, g(y), h(y) for ∫ₐᵇ∫_{g(y)}^{h(y)} … dx dy (outer lower, outer upper, inner lower, inner upper).
   */
  | { kind: 'limits'; form: number; named?: [string, string, string, string] }
  /** The Jacobian ∂(x, y)/∂(u, v) of `transform`. */
  | { kind: 'jacobian' }
  /** Several numbers in order (e.g. a value and a deduced value). */
  | { kind: 'values'; values: string[]; labels: string[] };

export interface MultipleSpec {
  /** Equivalent iterated integrals with the same value; the printed one first (may be empty for Jacobians). */
  forms: IteratedForm[];
  /** Variables that are not integrated (Q1's outer variable, a parameter a), with aligned sample values. */
  free?: Record<string, number[]>;
  /** The exact value in learner syntax (may use the free variables); the reference when given. */
  exact?: string;
  transform?: Transformation;
  /** Sample points for the transformation's variables when there is no form in them. */
  samples?: Point[];
  answer: MultipleAnswer;
  /** Gauss–Legendre nodes per dimension (default 40 for double, 20 for triple integrals). */
  nodes?: number;
  /**
   * Letters a learner types that the parser reserves, mapped to the letter used in this spec. Tutorial 6
   * Q20(ii) uses the constant d (x = au + bv, y = cu + dv), but "dv" reads as a differential, so the
   * learner's d is read as q. No function name contains the renamed letters.
   */
  rename?: Record<string, string>;
}

// -----------------------------------------------------------------------------
// Quadrature
// -----------------------------------------------------------------------------

const GL = new Map<number, { x: number[]; w: number[] }>();

/** Gauss–Legendre nodes and weights on [−1, 1] (Newton's method on Pₙ). */
export function gaussLegendre(n: number): { x: number[]; w: number[] } {
  const cached = GL.get(n);
  if (cached) return cached;
  const x: number[] = [];
  const w: number[] = [];
  for (let i = 1; i <= n; i++) {
    let t = Math.cos((Math.PI * (i - 0.25)) / (n + 0.5));
    let dp = 1;
    for (let iter = 0; iter < 100; iter++) {
      let p0 = 1;
      let p1 = t;
      for (let k = 2; k <= n; k++) {
        const p2 = ((2 * k - 1) * t * p1 - (k - 1) * p0) / k;
        p0 = p1;
        p1 = p2;
      }
      dp = (n * (t * p1 - p0)) / (t * t - 1);
      const dt = p1 / dp;
      t -= dt;
      if (Math.abs(dt) < 1e-15) break;
    }
    x.push(t);
    w.push(2 / ((1 - t * t) * dp * dp));
  }
  const rule = { x, w };
  GL.set(n, rule);
  return rule;
}

/** ∫ₐᵇ g with n Gauss–Legendre nodes; b may be +∞ (x = a + t/(1 − t)). Reversed limits give the negative. */
export function integrate1(g: (t: number) => number, a: number, b: number, n: number): number {
  if (a === b) return 0;
  if (a === Infinity) return -integrate1(g, b, a, n);
  if (b === Infinity) {
    return integrate1(
      (t) => {
        const s = 1 - t;
        return g(a + t / s) / (s * s);
      },
      0,
      1,
      n,
    );
  }
  const { x, w } = gaussLegendre(n);
  const h = (b - a) / 2;
  const c = (a + b) / 2;
  let sum = 0;
  for (let i = 0; i < x.length; i++) sum += w[i]! * g(c + h * x[i]!);
  return sum * h;
}

// -----------------------------------------------------------------------------
// Compiling forms
// -----------------------------------------------------------------------------

type Bound = MultiFn | 'inf';

export interface CompiledForm {
  form: IteratedForm;
  f: MultiFn;
  vars: string[];
  lo: Bound[];
  hi: Bound[];
  n: number;
}

const INF = /^\s*(inf|infinity|∞)\s*$/i;
const bound = (text: string, vars: string[]): Bound => (INF.test(text) ? 'inf' : compileFn(text, vars));
const at = (b: Bound, p: Point): number => (b === 'inf' ? Infinity : b.value(p));

export function compileForm(form: IteratedForm, extraVars: string[] = [], nodes?: number): CompiledForm {
  if (form.vars.length !== form.limits.length) throw new Error('Each variable needs its limits.');
  const all = [...form.vars, ...extraVars];
  return {
    form,
    f: compileFn(form.f, all),
    vars: form.vars,
    lo: form.limits.map(([l]) => bound(l, all)),
    hi: form.limits.map(([, h]) => bound(h, all)),
    n: nodes ?? (form.vars.length >= 3 ? 20 : 40),
  };
}

/**
 * The stage-k function of a form: the integrand g after integrating the innermost k variables, as a
 * function of the remaining variables (and the free ones). Stage 0 is g itself.
 */
export function stageValue(c: CompiledForm, k: number, p: Point, g: (p: Point) => number = c.f.value): number {
  if (k === 0) return g(p);
  const v = c.vars[k - 1]!;
  return integrate1((t) => stageValue(c, k - 1, { ...p, [v]: t }, g), at(c.lo[k - 1]!, p), at(c.hi[k - 1]!, p), c.n);
}

/** The value of the whole iterated integral (at the free variables' values in p). */
export const formValue = (c: CompiledForm, p: Point = {}): number => stageValue(c, c.vars.length, p);

/** Fractions of the way across each variable's interval, for sample points inside the region. */
const FRACTIONS = [
  [0.31, 0.58, 0.42],
  [0.67, 0.29, 0.73],
  [0.46, 0.83, 0.21],
  [0.82, 0.37, 0.64],
];

/** Points inside the region at which stage k is compared: values for vars[k…] (outer first), plus p. */
export function stagePoints(c: CompiledForm, k: number, p: Point = {}): Point[] {
  return FRACTIONS.map((fr) => {
    const q: Point = { ...p };
    for (let j = c.vars.length - 1; j >= k; j--) {
      const a = at(c.lo[j]!, q);
      const b = at(c.hi[j]!, q);
      const top = b === Infinity ? a + 3 : b;
      q[c.vars[j]!] = a + fr[j % 3]! * (top - a);
    }
    return q;
  });
}

// -----------------------------------------------------------------------------
// Compiled question
// -----------------------------------------------------------------------------

interface Extra {
  label: string;
  fn: (p: Point) => number;
  vars: string[];
  points: Point[];
}

export interface CompiledMultiple {
  spec: MultipleSpec;
  forms: CompiledForm[];
  /** Aligned tuples of the free variables (one empty point when there are none). */
  freePoints: Point[];
  /** Reference value at each free point. */
  values: number[];
  extras: Extra[];
  /** Every letter a line may use. */
  allowed: Set<string>;
  /** The Jacobian ∂(x, y)/∂(u, v) of the transformation, when there is one. */
  jacobian?: (p: Point) => number;
  transformPoints: Point[];
}

const DEFAULT_UV: [number, number][] = [
  [0.7, 1.3],
  [1.6, 0.45],
  [0.35, 2.2],
  [2.1, 1.7],
];

function freePointsOf(spec: MultipleSpec): Point[] {
  const entries = Object.entries(spec.free ?? {});
  if (entries.length === 0) return [{}];
  const count = Math.min(...entries.map(([, v]) => v.length));
  return Array.from({ length: count }, (_, i) => Object.fromEntries(entries.map(([k, v]) => [k, v[i]!])));
}

export function compileMultiple(spec: MultipleSpec): CompiledMultiple {
  const freeNames = Object.keys(spec.free ?? {});
  const freePoints = freePointsOf(spec);
  const forms = spec.forms.map((f) => compileForm(f, freeNames, spec.nodes));
  const exact = spec.exact ? compileFn(spec.exact, freeNames.length ? freeNames : ['x']) : null;
  const values = freePoints.map((p) => (exact ? exact.value(p) : forms[0] ? formValue(forms[0], p) : Number.NaN));

  const extras: Extra[] = [];
  let jacobian: ((p: Point) => number) | undefined;
  let transformPoints: Point[] = [];
  const t = spec.transform;
  if (t) {
    const [u, v] = t.vars;
    const vars = [u, v, ...freeNames];
    const X = compileFn(t.x, vars);
    const Y = compileFn(t.y, vars);
    jacobian = (p) => X.d(p, u) * Y.d(p, v) - X.d(p, v) * Y.d(p, u);
    const inNew = forms.find((c) => c.vars.includes(u) && c.vars.includes(v));
    transformPoints = inNew
      ? freePoints.flatMap((fp) => stagePoints(inNew, 0, fp))
      : (spec.samples ?? DEFAULT_UV.map(([a, b]) => ({ [u]: a, [v]: b }))).flatMap((s) =>
          freePoints.map((fp) => ({ ...fp, ...s })),
        );
    const J = jacobian;
    const pts = transformPoints;
    extras.push(
      { label: `the Jacobian ∂(x, y)/∂(${u}, ${v})`, fn: J, vars: [u, v], points: pts },
      { label: `|∂(x, y)/∂(${u}, ${v})|`, fn: (p) => Math.abs(J(p)), vars: [u, v], points: pts },
      { label: `∂x/∂${u}`, fn: (p) => X.d(p, u), vars: [u, v], points: pts },
      { label: `∂x/∂${v}`, fn: (p) => X.d(p, v), vars: [u, v], points: pts },
      { label: `∂y/∂${u}`, fn: (p) => Y.d(p, u), vars: [u, v], points: pts },
      { label: `∂y/∂${v}`, fn: (p) => Y.d(p, v), vars: [u, v], points: pts },
      { label: `x in terms of ${u} and ${v}`, fn: (p) => X.value(p), vars: [u, v], points: pts },
      { label: `y in terms of ${u} and ${v}`, fn: (p) => Y.value(p), vars: [u, v], points: pts },
    );
    if (t.f) {
      const F = compileFn(t.f, vars, { x: t.x, y: t.y });
      extras.push({
        label: `the integrand f(x, y) written in terms of ${u} and ${v}`,
        fn: (p) => F.value(p),
        vars: [u, v],
        points: pts,
      });
      const Fxy = compileFn(t.f, ['x', 'y', ...freeNames]);
      const xyPoints = pts.map((p) => ({ ...p, x: X.value(p), y: Y.value(p) }));
      extras.push({ label: 'the integrand f(x, y)', fn: (p) => Fxy.value(p), vars: ['x', 'y'], points: xyPoints });
    }
    if (t.inverse) {
      const xyVars = ['x', 'y', ...freeNames];
      const U = compileFn(t.inverse.u, xyVars);
      const V = compileFn(t.inverse.v, xyVars);
      const xyPoints = pts.map((p) => ({ ...p, x: X.value(p), y: Y.value(p) }));
      const inv = (p: Point) => U.d(p, 'x') * V.d(p, 'y') - U.d(p, 'y') * V.d(p, 'x');
      extras.push(
        { label: `∂${u}/∂x`, fn: (p) => U.d(p, 'x'), vars: ['x', 'y'], points: xyPoints },
        { label: `∂${u}/∂y`, fn: (p) => U.d(p, 'y'), vars: ['x', 'y'], points: xyPoints },
        { label: `∂${v}/∂x`, fn: (p) => V.d(p, 'x'), vars: ['x', 'y'], points: xyPoints },
        { label: `∂${v}/∂y`, fn: (p) => V.d(p, 'y'), vars: ['x', 'y'], points: xyPoints },
        { label: `∂(${u}, ${v})/∂(x, y)`, fn: inv, vars: ['x', 'y'], points: xyPoints },
        { label: `${u} in terms of x and y`, fn: (p) => U.value(p), vars: ['x', 'y'], points: xyPoints },
        { label: `${v} in terms of x and y`, fn: (p) => V.value(p), vars: ['x', 'y'], points: xyPoints },
      );
    }
  }

  const allowed = new Set<string>(['e', 'π', ...freeNames]);
  for (const f of spec.forms) for (const v of f.vars) allowed.add(v);
  if (t) for (const v of [...t.vars, 'x', 'y']) allowed.add(v);
  return { spec, forms, freePoints, values, extras, allowed, jacobian, transformPoints };
}

// -----------------------------------------------------------------------------
// Comparing
// -----------------------------------------------------------------------------

const close = (a: number, b: number, tol: number) =>
  Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
/** Values computed by quadrature agree to about 1e-6; exact references to far better. */
const TOL = 2e-5;
/** Rounded decimals (four decimal places or four significant figures), as in Topic 2. */
const ROUGH = 5.1e-4;

interface Side {
  text: string;
  fn: MultiFn;
  symbols: Set<string>;
}

function readSide(text: string, allowed: Set<string>): Side | { error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { error: 'Type an expression first.' };
  if (/∫|\bint\b/.test(trimmed)) {
    return {
      error:
        'Write the integrand or the result of an integration rather than the integral sign, e.g. 4 - y^2, or 16/3.',
    };
  }
  try {
    const statement = parseStatement(trimmed);
    if (statement.k !== 'expr') return { error: 'Write one expression on each side of "=".' };
    const symbols = new Set([...symbolsOf(statement.node)].filter((s) => s !== 'e' && s !== 'π'));
    const unknown = [...symbols].filter((s) => !allowed.has(s));
    if (unknown.length > 0) {
      return { error: `This question does not use ${unknown.join(', ')}. Check the letters in your line.` };
    }
    return { text: trimmed, fn: compileFn(trimmed, [...symbols, 'x']), symbols };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'This line could not be read.' };
  }
}

const valueAt = (side: Side, p: Point): number => {
  try {
    return side.fn.value(p);
  } catch {
    return Number.NaN;
  }
};

/** True when the side equals target at every point (at least two finite comparisons). */
function agrees(side: Side, target: (p: Point) => number, points: Point[], tol = TOL): boolean {
  let compared = 0;
  for (const p of points) {
    const want = target(p);
    if (!Number.isFinite(want)) continue;
    if (!close(valueAt(side, p), want, tol)) return false;
    compared++;
  }
  return compared >= Math.min(2, points.length);
}

const subset = (a: Set<string>, b: Iterable<string>) => {
  const set = new Set(b);
  return [...a].every((s) => set.has(s));
};
const list = (names: string[]) =>
  names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

/** The first thing the side equals: the value, a stage of a form, an anti-derivative, or a named quantity. */
function identify(side: Side, c: CompiledMultiple): string | null {
  const freeNames = Object.keys(c.spec.free ?? {});
  // The value (a number, or a function of the free variables).
  if (subset(side.symbols, freeNames) && c.forms.length + (c.spec.exact ? 1 : 0) > 0) {
    if (c.freePoints.every((p, i) => close(valueAt(side, p), c.values[i]!, TOL))) {
      return 'this is the value of the integral.';
    }
  }
  for (const form of c.forms) {
    const label = form.form.label ? ` (${form.form.label})` : '';
    const n = form.vars.length;
    for (let k = n - 1; k >= 0; k--) {
      const remaining = form.vars.slice(k);
      if (!subset(side.symbols, [...remaining, ...freeNames])) continue;
      const points = c.freePoints.flatMap((fp) => stagePoints(form, k, fp));
      if (agrees(side, (p) => stageValue(form, k, p), points)) {
        if (k === 0) return `this is the integrand${label}.`;
        const done = form.vars.slice(0, k);
        return `this is the result of integrating with respect to ${list(done)}${label}; ${list(remaining)} ${remaining.length === 1 ? 'remains' : 'remain'}.`;
      }
    }
    // An anti-derivative with respect to the variable of stage k, the others held constant.
    for (let k = 0; k < n; k++) {
      const v = form.vars[k]!;
      if (!side.symbols.has(v) || !subset(side.symbols, [...form.vars.slice(k), ...freeNames])) continue;
      const points = c.freePoints.flatMap((fp) => stagePoints(form, k, fp));
      let compared = 0;
      let ok = true;
      for (const p of points) {
        const want = stageValue(form, k, p);
        let got = Number.NaN;
        try {
          got = side.fn.d(p, v);
        } catch {
          got = Number.NaN;
        }
        if (!Number.isFinite(want)) continue;
        if (!close(got, want, 1e-5)) {
          ok = false;
          break;
        }
        compared++;
      }
      if (ok && compared >= 2) {
        const held = form.vars.slice(k + 1).concat(freeNames);
        return `this is an anti-derivative with respect to ${v}${held.length ? ` (holding ${list(held)} constant)` : ''}${label}. Now substitute the limits of ${v}.`;
      }
    }
  }
  for (const extra of c.extras) {
    if (!subset(side.symbols, [...extra.vars, ...freeNames])) continue;
    if (agrees(side, extra.fn, extra.points, 1e-7)) return `this is ${extra.label}.`;
  }
  return null;
}

// -----------------------------------------------------------------------------
// Limits ("a <= y <= b, c <= x <= d")
// -----------------------------------------------------------------------------

interface Piece {
  v: string;
  lo: string;
  hi: string;
}

const RELATION = /(<=|>=|<|>)/;

function normaliseRelations(text: string): string {
  return text.replace(/≤|=</g, '<=').replace(/≥|=>/g, '>=').replace(/θ/g, 'θ');
}

/** Reads "lo <= v <= hi" pieces separated by commas, semicolons or "and". */
export function parseLimits(text: string): Piece[] | { error: string } {
  const pieces = normaliseRelations(text)
    .split(/[,;]|\band\b/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: Piece[] = [];
  for (const piece of pieces) {
    const parts = piece.split(RELATION).map((p) => p.trim());
    if (parts.length !== 5) return { error: `Write each limit as a chain such as 0 <= y <= sqrt(x) ("${piece}").` };
    const [a, op1, middle, op2, b] = parts as [string, string, string, string, string];
    const up = op1.startsWith('<');
    if (up !== op2.startsWith('<')) return { error: `Both signs in "${piece}" should point the same way.` };
    let v = middle;
    try {
      const node = parseStatement(middle);
      if (node.k !== 'expr' || node.node.k !== 'sym') throw new Error('');
      v = node.node.name;
    } catch {
      return { error: `The middle of "${piece}" should be a single variable.` };
    }
    out.push(up ? { v, lo: a, hi: b } : { v, lo: b, hi: a });
  }
  if (out.length === 0) return { error: 'Write the limits, e.g. 0 <= y <= sqrt(x), 0 <= x <= 4.' };
  return out;
}

/** Orders pieces outermost first by dependency; null if they are not a valid iterated description. */
function orderPieces(pieces: Piece[], freeNames: string[]): Piece[] | null {
  const chosen: string[] = [];
  const left = [...pieces];
  const ordered: Piece[] = [];
  while (left.length > 0) {
    // When several pieces could come next (e.g. a rectangle), the one written last is the outer one:
    // limits are written inner first, as in "0 <= y <= sqrt(x), 0 <= x <= 4".
    const index = left.findLastIndex((p) => {
      try {
        const symbols = new Set(
          [p.lo, p.hi]
            .filter((t) => !INF.test(t))
            .flatMap((t) => {
              const s = parseStatement(t);
              return s.k === 'expr' ? [...symbolsOf(s.node)] : ['?'];
            })
            .filter((s) => s !== 'e' && s !== 'π'),
        );
        return subset(symbols, [...chosen, ...freeNames]);
      } catch {
        return false;
      }
    });
    if (index < 0) return null;
    const [piece] = left.splice(index, 1);
    ordered.push(piece!);
    chosen.push(piece!.v);
  }
  return ordered;
}

/** ∬ m over the region of a form for the monomials 1, each variable, and their products (area and moments). */
function moments(c: CompiledForm, p: Point): number[] {
  const vars = [...c.vars].sort();
  const monomials: ((q: Point) => number)[] = [() => 1, ...vars.map((v) => (q: Point) => q[v]!)];
  for (let i = 0; i < vars.length; i++)
    for (let j = i; j < vars.length; j++) monomials.push((q) => q[vars[i]!]! * q[vars[j]!]!);
  return monomials.map((m) => stageValue(c, c.vars.length, p, m));
}

function sameRegion(a: CompiledForm, b: CompiledForm, freePoints: Point[]): boolean {
  return freePoints.every((p) => {
    const ma = moments(a, p);
    const mb = moments(b, p);
    const scale = Math.max(1, ...mb.map(Math.abs));
    return ma.every((m, i) => Number.isFinite(m) && Math.abs(m - mb[i]!) <= 3e-4 * scale);
  });
}

type LimitsResult =
  { kind: 'error'; message: string } | { kind: 'invalid'; message: string } | { kind: 'form'; form: CompiledForm };

function limitsForm(pieces: Piece[], c: CompiledMultiple): LimitsResult {
  const freeNames = Object.keys(c.spec.free ?? {});
  const vars = pieces.map((p) => p.v);
  if (new Set(vars).size !== vars.length) {
    return { kind: 'error', message: 'Give each variable once, with its lower and upper limit.' };
  }
  const ordered = orderPieces(pieces, freeNames);
  if (!ordered) {
    return {
      kind: 'invalid',
      message:
        'These limits are not an iterated integral: the outer limits must be constants, and each inner limit may depend only on the variables outside it (§5.1).',
    };
  }
  const innerFirst = [...ordered].reverse();
  try {
    const form = compileForm(
      { f: '1', vars: innerFirst.map((p) => p.v), limits: innerFirst.map((p) => [p.lo, p.hi]) },
      freeNames,
      c.spec.nodes,
    );
    return { kind: 'form', form };
  } catch (e) {
    return { kind: 'error', message: e instanceof Error ? e.message : 'These limits could not be read.' };
  }
}

const orderName = (vars: string[]) => vars.map((v) => `d${v}`).join(' ');

function checkLimitsLine(text: string, c: CompiledMultiple): MultipleFeedback {
  const pieces = parseLimits(text);
  if ('error' in pieces) return { status: 'cannotCheck', message: pieces.error };
  const result = limitsForm(pieces, c);
  if (result.kind === 'error') return { status: 'cannotCheck', message: result.message };
  if (result.kind === 'invalid') return { status: 'incorrect', message: result.message };
  const learner = result.form;
  const candidates = c.forms.filter(
    (f) => f.vars.length === learner.vars.length && subset(new Set(f.vars), learner.vars),
  );
  if (candidates.length === 0) {
    return { status: 'cannotCheck', message: `This question's region is not described in ${list(learner.vars)}.` };
  }
  if (candidates.some((f) => sameRegion(learner, f, c.freePoints))) {
    return {
      status: 'correct',
      message: `Correct: these limits describe the region of the question, in the order ${orderName(learner.vars)}.`,
    };
  }
  return {
    status: 'incorrect',
    message: 'These limits describe a different region. Sketch the region and check which curve each limit comes from.',
  };
}

// -----------------------------------------------------------------------------
// Lines of working
// -----------------------------------------------------------------------------

const hasRelation = (line: string) => /<|>|≤|≥/.test(line);

/** The learner's text with the question's renamed letters replaced (see MultipleSpec.rename). */
function renamed(text: string, c: CompiledMultiple): string {
  let out = text;
  for (const [from, to] of Object.entries(c.spec.rename ?? {})) out = out.split(from).join(to);
  return out;
}

export function checkMultipleLine(line: string, c: CompiledMultiple): MultipleFeedback {
  const text = renamed(line.trim(), c);
  if (!text) return { status: 'info', message: '' };
  if (hasRelation(text)) return checkLimitsLine(text, c);
  const parts = text.split('=');
  const sides: Side[] = [];
  for (const part of parts) {
    const side = readSide(part, c.allowed);
    // A name on the left, such as "J" or "x_u", is allowed when it cannot be read as mathematics.
    if ('error' in side) {
      if (parts.length > 1 && part === parts[0]) continue;
      return { status: 'cannotCheck', message: side.error };
    }
    sides.push(side);
  }
  if (sides.length === 0) return { status: 'cannotCheck', message: 'This line could not be read.' };
  const found = sides.map((s) => identify(s, c));
  if (found.every(Boolean)) {
    return { status: 'correct', message: `Correct: ${found[found.length - 1]}` };
  }
  const firstWrong = found.findIndex((f) => !f);
  return {
    status: 'incorrect',
    message:
      firstWrong === 0 && sides.length > 1
        ? 'The left side does not match a step of this question. Check it, or ask for a hint.'
        : 'This does not match a step of this question. Check the anti-derivative and the limits, or ask for a hint.',
  };
}

export const checkMultipleWorking = (lines: string[], c: CompiledMultiple): MultipleFeedback[] =>
  lines.map((line) => checkMultipleLine(line, c));

// -----------------------------------------------------------------------------
// Final answers
// -----------------------------------------------------------------------------

function numberList(text: string): string[] {
  return text
    .split(/[,;]/)
    .map((p) => p.replace(/^\s*[^=]{1,24}=\s*/, '').trim())
    .filter(Boolean);
}

function checkValue(text: string, c: CompiledMultiple): MultipleAnswerResult {
  const freeNames = Object.keys(c.spec.free ?? {});
  const side = readSide(text.replace(/^\s*[A-Za-z]{1,3}\s*=\s*/, ''), c.allowed);
  if ('error' in side) return { status: 'cannotCheck', message: side.error };
  const extra = [...side.symbols].filter((s) => !freeNames.includes(s));
  if (extra.length > 0) {
    const found = identify(side, c);
    return {
      status: 'incorrect',
      message: found
        ? `Not finished yet: ${found} Integrate with respect to ${list(extra)} too.`
        : `Your answer should not contain ${list(extra)}.`,
    };
  }
  const got = c.freePoints.map((p) => valueAt(side, p));
  if (got.some((g) => !Number.isFinite(g)))
    return { status: 'cannotCheck', message: 'This answer could not be evaluated.' };
  if (got.every((g, i) => close(g, c.values[i]!, 1e-7))) return { status: 'correct', message: 'Correct!' };
  if (got.every((g, i) => close(g, c.values[i]!, ROUGH))) {
    return { status: 'correct', message: 'Correct as a decimal. An exact form is better where you can give one.' };
  }
  return { status: 'incorrect', message: 'Not quite. Check your working, or ask for a hint.' };
}

function checkConstants(
  text: string,
  c: CompiledMultiple,
  answer: Extract<MultipleAnswer, { kind: 'constants' }>,
): MultipleAnswerResult {
  const given: Record<string, string> = {};
  for (const part of text.split(/[,;]/)) {
    const m = /^\s*([A-Za-z])\s*=\s*(.+)$/.exec(part);
    if (m) given[m[1]!] = m[2]!.trim();
  }
  const missing = answer.names.filter((n) => given[n] === undefined);
  if (missing.length > 0) {
    return {
      status: 'cannotCheck',
      message: `Give every constant as "name = value", separated by commas: ${answer.names.join(', ')}.`,
    };
  }
  const values: Point = {};
  for (const name of answer.names) {
    const side = readSide(given[name]!, new Set());
    if ('error' in side || side.symbols.size > 0) {
      return { status: 'cannotCheck', message: `${name} should be a number.` };
    }
    values[name] = valueAt(side, {});
  }
  let got = Number.NaN;
  try {
    got = compileFn(answer.form, answer.names).value(values);
  } catch {
    got = Number.NaN;
  }
  if (!Number.isFinite(got)) return { status: 'incorrect', message: 'These values do not give a number in the form.' };
  if (close(got, c.values[0]!, 1e-7)) {
    return { status: 'correct', message: 'Correct: with these values the form equals the integral.' };
  }
  return {
    status: 'incorrect',
    message: 'With these values the form does not equal the integral. Evaluate the integral first, then compare.',
  };
}

function checkLimitsAnswer(
  text: string,
  c: CompiledMultiple,
  answer: Extract<MultipleAnswer, { kind: 'limits' }>,
): MultipleAnswerResult {
  const target = c.forms[answer.form];
  if (!target) return { status: 'cannotCheck', message: 'This question has no reversed form to compare with.' };
  let pieces: Piece[] | { error: string };
  if (answer.named && !hasRelation(text)) {
    const [aName, bName, gName, hName] = answer.named;
    const given: Record<string, string> = {};
    for (const part of text.split(/[,;]/)) {
      const m = /^\s*([A-Za-z])\s*(?:\(\s*[A-Za-zθ]\s*\))?\s*=\s*(.+)$/.exec(part);
      if (m) given[m[1]!] = m[2]!.trim();
    }
    const names = [aName, bName, gName, hName];
    if (names.some((n) => given[n] === undefined)) {
      return {
        status: 'cannotCheck',
        message: `Give ${names.slice(0, 2).join(', ')}, ${gName}(${target.vars[1]}) and ${hName}(${target.vars[1]}), separated by commas.`,
      };
    }
    pieces = [
      { v: target.vars[1]!, lo: given[aName]!, hi: given[bName]! },
      { v: target.vars[0]!, lo: given[gName]!, hi: given[hName]! },
    ];
  } else {
    pieces = parseLimits(text);
  }
  if ('error' in pieces) return { status: 'cannotCheck', message: pieces.error };
  const result = limitsForm(pieces, c);
  if (result.kind === 'error') return { status: 'cannotCheck', message: result.message };
  if (result.kind === 'invalid') return { status: 'incorrect', message: result.message };
  const learner = result.form;
  if (learner.vars.length !== target.vars.length || !subset(new Set(learner.vars), target.vars)) {
    return { status: 'incorrect', message: `Describe the region in ${list(target.vars)}.` };
  }
  const same = sameRegion(learner, target, c.freePoints);
  if (!same) {
    return {
      status: 'incorrect',
      message:
        'These limits describe a different region. Sketch the region, then read the new limits from a strip in the other direction.',
    };
  }
  if (learner.vars.join() !== target.vars.join()) {
    return {
      status: 'incorrect',
      message: `This is the same region, but in the order ${orderName(learner.vars)}. The question asks for ${orderName(target.vars)}.`,
    };
  }
  return { status: 'correct', message: `Correct: the same region, now in the order ${orderName(target.vars)}.` };
}

function checkJacobian(text: string, c: CompiledMultiple): MultipleAnswerResult {
  const J = c.jacobian;
  if (!J) return { status: 'cannotCheck', message: 'This question has no change of variables.' };
  const side = readSide(text.replace(/^\s*[^=]{1,24}=\s*/, ''), c.allowed);
  if ('error' in side) return { status: 'cannotCheck', message: side.error };
  const points = c.transformPoints;
  if (agrees(side, J, points, 1e-7)) return { status: 'correct', message: 'Correct!' };
  if (agrees(side, (p) => -J(p), points, 1e-7)) {
    return {
      status: 'incorrect',
      message: 'The sign is reversed. The Jacobian is (∂x/∂u)(∂y/∂v) − (∂y/∂u)(∂x/∂v), in that order.',
    };
  }
  if (agrees(side, (p) => Math.abs(J(p)), points, 1e-7)) {
    return {
      status: 'incorrect',
      message: 'That is |∂(x, y)/∂(u, v)|. The question asks for the Jacobian itself, which can be negative.',
    };
  }
  return {
    status: 'incorrect',
    message: 'Not quite. Find ∂x/∂u, ∂x/∂v, ∂y/∂u and ∂y/∂v, then evaluate the determinant.',
  };
}

function checkValues(
  text: string,
  c: CompiledMultiple,
  answer: Extract<MultipleAnswer, { kind: 'values' }>,
): MultipleAnswerResult {
  const parts = numberList(text);
  if (parts.length !== answer.values.length) {
    return {
      status: 'cannotCheck',
      message: `Give ${answer.values.length} values, separated by commas: ${answer.labels.join(', ')}.`,
    };
  }
  const wrong: string[] = [];
  parts.forEach((part, i) => {
    const side = readSide(part, new Set());
    const want = compileFn(answer.values[i]!, ['x']).value({});
    if ('error' in side || !close(valueAt(side, {}), want, ROUGH)) wrong.push(answer.labels[i]!);
  });
  return wrong.length === 0
    ? { status: 'correct', message: 'Correct!' }
    : { status: 'incorrect', message: `Not yet right: ${wrong.join(', ')}. Check your working, or ask for a hint.` };
}

export function checkMultipleAnswer(input: string, c: CompiledMultiple): MultipleAnswerResult {
  const text = renamed(input.trim(), c);
  if (!text) return { status: 'cannotCheck', message: 'Type your answer first.' };
  const answer = c.spec.answer;
  switch (answer.kind) {
    case 'value':
      return checkValue(text, c);
    case 'constants':
      return checkConstants(text, c, answer);
    case 'limits':
      return checkLimitsAnswer(text, c, answer);
    case 'jacobian':
      return checkJacobian(text, c);
    case 'values':
      return checkValues(text, c, answer);
  }
}

/** What the final-answer box asks for, and an example of the format. */
export function multipleAnswerPrompt(spec: MultipleSpec): { label: string; placeholder: string } {
  const answer = spec.answer;
  switch (answer.kind) {
    case 'value': {
      const free = Object.keys(spec.free ?? {});
      return free.length
        ? { label: `Final answer (in terms of ${list(free)})`, placeholder: `e.g. 3${free[0]}^2/2` }
        : { label: 'Final answer (a number)', placeholder: 'e.g. 16/3, e^4 - 1 or pi/4' };
    }
    case 'constants':
      return {
        label: `Final answer: ${answer.names.join(', ')}`,
        placeholder: `e.g. ${answer.names.map((n, i) => `${n} = ${i + 2}`).join(', ')}`,
      };
    case 'limits': {
      const target = spec.forms[answer.form];
      if (answer.named) {
        const [a, b, g, h] = answer.named;
        const v = target?.vars[1] ?? 'y';
        return {
          label: `Final answer: ${a}, ${b}, ${g}(${v}) and ${h}(${v})`,
          placeholder: `e.g. ${a} = 0, ${b} = 1, ${g}(${v}) = ${v}, ${h}(${v}) = 2${v}`,
        };
      }
      const [inner, outer] = [target?.vars[0] ?? 'y', target?.vars[1] ?? 'x'];
      return {
        label: `Final answer: the limits in the order d${inner} d${outer}`,
        placeholder: `e.g. 0 <= ${inner} <= sqrt(${outer}), 0 <= ${outer} <= 4`,
      };
    }
    case 'jacobian':
      return { label: 'Final answer: ∂(x, y)/∂(u, v)', placeholder: 'e.g. -1/2' };
    case 'values':
      return { label: `Final answer: ${answer.labels.join(', ')}`, placeholder: 'values separated by commas' };
  }
}

// -----------------------------------------------------------------------------
// TeX for solutions and labs
// -----------------------------------------------------------------------------

/** TeX of a learner-syntax expression ("inf" becomes ∞). */
export const exprTex = (text: string): string => (INF.test(text) ? '\\infty' : statementToTex(parseStatement(text)));

/** TeX of a limits line, e.g. "0 <= y <= sqrt(x), 0 <= x <= 4". */
export function limitsTex(text: string): string {
  const pieces = parseLimits(text);
  if ('error' in pieces) return text;
  return pieces
    .map((p) => `${exprTex(p.lo)} \\le ${p.v === 'θ' ? '\\theta' : p.v} \\le ${exprTex(p.hi)}`)
    .join(', \\quad ');
}

/** TeX of an iterated integral, outermost sign first, e.g. ∫₀⁴∫₀^{√x} f dy dx. */
export function formTex(form: IteratedForm, integrandTex?: string): string {
  const signs = [...form.limits]
    .reverse()
    .map(([lo, hi]) => `\\int_{${exprTex(lo)}}^{${exprTex(hi)}}`)
    .join(' ');
  const body = integrandTex ?? exprTex(form.f);
  const ds = form.vars.map((v) => `d${v === 'θ' ? '\\theta' : v}`).join('\\,');
  return `${signs} ${body} \\, ${ds}`;
}
