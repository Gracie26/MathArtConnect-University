/**
 * Checking for Topic 4 (Applications of the Partial Derivative, Chapter 4):
 * tangent planes and normal lines to a surface F(x, y, z) = 0 (§4.2.1), and
 * critical points of f(x, y) with their classification by the Second
 * Partials Test (§4.3.1). Gradients and total differentials (§4.1, and the
 * §3.3 review) use the Topic 3 checker in ./partial.
 *
 * Learner input goes through the same safe parser as the rest of the app
 * (./input/parse): an expression tree, an allow-list of functions and only
 * the variables of the question; nothing is executed as code.
 *
 * References come from the question itself:
 *   - a tangent plane is accepted when (left side − right side) is a nonzero
 *     constant multiple of ∇F(P)·(X − P), the plane of Theorem 4.2.2, so any
 *     equivalent form is accepted (x − y − 2z + 6 = 0, or 2z = x − y + 6 …);
 *   - a normal line is accepted when all sides of the learner's symmetric
 *     equations agree at P and along the direction ∇F(P), and disagree off
 *     the line (two independent directions perpendicular to it);
 *   - critical points are compared as a set with the app-authored complete
 *     list (verified independently in the tests), with a small tolerance, so
 *     exact forms such as (2/5)^(1/3) or (−8 + 2√61)/9 are accepted.
 * The authored lists are never shown as official UNAM solutions.
 */
import { compileFn, type MultiFn } from '@/lib/explore/rn';

import { evaluate, UnknownSymbolError } from './input/evaluate';
import { type ExprNode, parseStatement, symbolsOf } from './input/parse';
import { checkPartialLine, compilePartial, type CompiledPartial, type PartialSpec, splitAnswer } from './partial';

type Status = 'correct' | 'incorrect' | 'info' | 'cannotCheck';
export interface Feedback {
  status: Status;
  message: string;
}
type AnswerResult = { status: 'correct' | 'incorrect' | 'cannotCheck'; message: string };
type P3 = { x: number; y: number; z: number };

// -----------------------------------------------------------------------------
// Shared parsing
// -----------------------------------------------------------------------------

function parseSides(text: string): ExprNode[] {
  const statement = parseStatement(text);
  return statement.k === 'expr' ? [statement.node] : statement.sides;
}

/** Value of a parsed expression at p (variables x, y, z; e and π known). */
function valueOf(node: ExprNode, p: Record<string, number>): number {
  const constants = { ...p };
  delete constants.x;
  return evaluate(node, p.x ?? 0, { variable: 'x', constants, definitions: {}, base: 0 }).v;
}

const close = (a: number, b: number, scale = 1) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(scale));
/** Rounded decimals: four decimal places, or four significant figures for large values (as in Topic 2). */
const roughlyClose = (a: number, b: number) => Math.abs(a - b) <= 5.1e-4 * Math.max(1, Math.abs(b));

/** A number written by the learner (no variables), e.g. 23/6, sqrt(12) or (2/5)^(1/3). */
function numberOf(text: string): number {
  const sides = parseSides(text.trim());
  if (sides.length !== 1) throw new Error(`"${text}" should be a number.`);
  const node = sides[0]!;
  const unknown = [...symbolsOf(node)].filter((s) => s !== 'e' && s !== 'π');
  if (unknown.length > 0) throw new Error(`"${text}" should be a number (no ${unknown.join(', ')}).`);
  return valueOf(node, {});
}

// -----------------------------------------------------------------------------
// Tangent planes and normal lines (§4.2.1)
// -----------------------------------------------------------------------------

export interface SurfaceSpec {
  /** F(x, y, z) in learner syntax; the surface is F(x, y, z) = 0. */
  F: string;
  /** The point P on the surface. */
  point: P3;
  /** What the final answer gives, in order (separated by a semicolon when both). */
  ask: ('plane' | 'normal')[];
}

export interface CompiledSurface {
  spec: SurfaceSpec;
  F: MultiFn;
  /** ∇F(P). */
  n: [number, number, number];
  /** Points near P (inside the domain) for comparing expressions. */
  samples: P3[];
  /** Partial-derivative references for lines of working. */
  partial: CompiledPartial;
}

const OFFSETS: [number, number, number][] = [
  [0.13, -0.07, 0.05],
  [-0.06, 0.11, -0.09],
  [0.08, 0.04, 0.12],
  [-0.1, -0.05, 0.07],
  [0.04, 0.09, -0.11],
];

export function compileSurface(spec: SurfaceSpec): CompiledSurface {
  const F = compileFn(spec.F, ['x', 'y', 'z']);
  const P = spec.point;
  const n: [number, number, number] = [F.d(P, 'x'), F.d(P, 'y'), F.d(P, 'z')];
  if (!n.every(Number.isFinite) || n.every((c) => Math.abs(c) < 1e-12)) {
    throw new Error('∇F(P) must exist and be nonzero (Theorem 4.2.1).');
  }
  if (!close(F.value(P), 0, 1)) throw new Error('The point is not on the surface F = 0.');
  const samples = OFFSETS.map(([a, b, c]) => ({ x: P.x + a, y: P.y + b, z: P.z + c }));
  const partial: PartialSpec = {
    variables: ['x', 'y', 'z'],
    samples,
    targets: [
      { kind: 'derivative', label: 'F', f: spec.F, wrt: [] },
      { kind: 'derivative', label: 'F_x', f: spec.F, wrt: ['x'] },
      { kind: 'derivative', label: 'F_y', f: spec.F, wrt: ['y'] },
      { kind: 'derivative', label: 'F_z', f: spec.F, wrt: ['z'] },
      { kind: 'value', label: 'F_x at P', f: spec.F, wrt: ['x'], at: P },
      { kind: 'value', label: 'F_y at P', f: spec.F, wrt: ['y'], at: P },
      { kind: 'value', label: 'F_z at P', f: spec.F, wrt: ['z'], at: P },
    ],
  };
  return { spec, F, n, samples, partial: compilePartial(partial) };
}

/** ∇F(P)·(X − P): the left side of the tangent plane of Theorem 4.2.2. */
const planeAt = (c: CompiledSurface, q: P3) =>
  c.n[0] * (q.x - c.spec.point.x) + c.n[1] * (q.y - c.spec.point.y) + c.n[2] * (q.z - c.spec.point.z);

const unknownIn = (nodes: ExprNode[]) =>
  [...new Set(nodes.flatMap((n) => [...symbolsOf(n)]))].filter((s) => !['x', 'y', 'z', 'e', 'π'].includes(s));

/** True if g = (left − right) is a nonzero constant multiple of the tangent plane's left side. */
function isPlane(sides: ExprNode[], c: CompiledSurface): boolean {
  if (sides.length !== 2) return false;
  const g = (q: P3) => valueOf(sides[0]!, q) - valueOf(sides[1]!, q);
  if (!close(g(c.spec.point), 0, 1)) return false;
  // Far enough from P that a non-planar g cannot agree by accident.
  const probes: P3[] = [
    [1.3, -0.4, 0.7],
    [-0.8, 0.9, 0.5],
    [0.6, 1.1, -1.2],
    [-1.1, -0.7, 0.3],
    [0.45, -1.25, -0.6],
  ].map(([a, b, d]) => ({ x: c.spec.point.x + a!, y: c.spec.point.y + b!, z: c.spec.point.z + d! }));
  let ratio: number | null = null;
  for (const q of probes) {
    const want = planeAt(c, q);
    const got = g(q);
    if (!Number.isFinite(got)) return false;
    if (Math.abs(want) < 1e-9) {
      if (!close(got, 0, 1)) return false;
      continue;
    }
    const r = got / want;
    if (ratio === null) {
      if (Math.abs(r) < 1e-9) return false;
      ratio = r;
    } else if (!close(r, ratio, ratio)) return false;
  }
  return ratio !== null;
}

/** True if the points where every side is equal form the normal line through P with direction ∇F(P). */
function isNormalLine(sides: ExprNode[], c: CompiledSurface): boolean {
  if (sides.length < 2) return false;
  const allEqual = (q: P3) => {
    const values = sides.map((s) => valueOf(s, q));
    if (!values.every(Number.isFinite)) return false;
    return values.every((v) => close(v, values[0]!, values[0]!));
  };
  const P = c.spec.point;
  const along = (t: number): P3 => ({ x: P.x + t * c.n[0], y: P.y + t * c.n[1], z: P.z + t * c.n[2] });
  if (![0, 0.7, -1.3, 2.1].every((t) => allEqual(along(t)))) return false;
  // Two directions perpendicular to ∇F(P): moving off the line must break the equations.
  const [a, b, d] = c.n;
  const u: [number, number, number] = Math.abs(a) > 0.1 * Math.max(Math.abs(b), Math.abs(d)) ? [-b, a, 0] : [0, -d, b];
  const v: [number, number, number] = [b * u[2] - d * u[1], d * u[0] - a * u[2], a * u[1] - b * u[0]];
  for (const w of [u, v]) {
    const len = Math.hypot(...w) || 1;
    const q = { x: P.x + (0.8 * w[0]) / len, y: P.y + (0.8 * w[1]) / len, z: P.z + (0.8 * w[2]) / len };
    if (allEqual(q)) return false;
  }
  return true;
}

/** True if (left − right) is a nonzero multiple of F near P (the surface equation itself). */
function isSurface(sides: ExprNode[], c: CompiledSurface): boolean {
  if (sides.length !== 2) return false;
  let ratio: number | null = null;
  for (const q of c.samples) {
    const want = c.F.value(q);
    const got = valueOf(sides[0]!, q) - valueOf(sides[1]!, q);
    if (!Number.isFinite(got) || Math.abs(want) < 1e-9) continue;
    const r = got / want;
    if (ratio === null) ratio = r;
    else if (!close(r, ratio, ratio)) return false;
  }
  return ratio !== null && Math.abs(ratio) > 1e-9;
}

export function surfaceAnswerLabel(spec: SurfaceSpec): string {
  if (spec.ask.length === 2) return 'Final answer: the tangent plane; the normal line (separated by a semicolon)';
  return spec.ask[0] === 'plane' ? 'Final answer: the tangent plane' : 'Final answer: the normal line';
}

export const surfacePlaceholder = (spec: SurfaceSpec): string =>
  spec.ask.length === 2
    ? 'e.g. 2x + 4y + z = 14; (x - 1)/2 = (y - 2)/4 = (z - 4)/1'
    : spec.ask[0] === 'plane'
      ? 'e.g. x - y - 2z + 6 = 0'
      : 'e.g. (x - 2)/3 = (y - 3)/2 = (z - 1)/6';

export function checkSurfaceAnswer(input: string, c: CompiledSurface): AnswerResult {
  const parts = input
    .split(';')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length !== c.spec.ask.length) {
    return {
      status: 'cannotCheck',
      message:
        c.spec.ask.length === 2
          ? 'Give the tangent plane and the symmetric equations of the normal line, separated by a semicolon (;).'
          : 'Give one answer.',
    };
  }
  const wrong: string[] = [];
  for (const [i, want] of c.spec.ask.entries()) {
    let sides: ExprNode[];
    try {
      sides = parseSides(parts[i]!);
    } catch (error) {
      return { status: 'cannotCheck', message: (error as Error).message };
    }
    const unknown = unknownIn(sides);
    if (unknown.length > 0) {
      return { status: 'cannotCheck', message: `"${unknown.join('", "')}" is not a variable here. Use x, y and z.` };
    }
    try {
      if (want === 'plane') {
        if (sides.length !== 2) {
          return { status: 'cannotCheck', message: 'Write the tangent plane as an equation, e.g. 2x + 4y + z = 14.' };
        }
        if (!isPlane(sides, c)) wrong.push('the tangent plane');
      } else {
        if (sides.length < 2) {
          return {
            status: 'cannotCheck',
            message: 'Write the normal line as symmetric equations, e.g. (x - 2)/3 = (y - 3)/2 = (z - 1)/6.',
          };
        }
        if (!isNormalLine(sides, c)) wrong.push('the normal line');
      }
    } catch (error) {
      if (error instanceof UnknownSymbolError) {
        return { status: 'cannotCheck', message: `"${error.symbol}" cannot be evaluated here.` };
      }
      throw error;
    }
  }
  if (wrong.length === 0) {
    return { status: 'correct', message: c.spec.ask.length === 2 ? 'Correct: both are right.' : 'Correct.' };
  }
  return {
    status: 'incorrect',
    message: `Not yet: ${wrong.join(' and ')} ${wrong.length === 1 ? 'is' : 'are'} not right.${
      wrong.length < c.spec.ask.length ? ' The other part is correct.' : ''
    } Check ∇F at the point.`,
  };
}

export function checkSurfaceLine(line: string, c: CompiledSurface): Feedback {
  const text = line.trim();
  if (!text) return { status: 'cannotCheck', message: 'Write a step first.' };
  let sides: ExprNode[];
  try {
    sides = parseSides(text);
  } catch {
    return {
      status: 'cannotCheck',
      message: 'Written reasoning is not checked automatically. Write a calculation or an equation to check it.',
    };
  }
  // A labelled step such as "F_x = 2x": check the expression sides with the derivative references.
  if (sides.length === 1 || unknownIn(sides).length > 0) return checkPartialLine(text, c.partial);
  try {
    if (isPlane(sides, c)) return { status: 'correct', message: 'This is the tangent plane at P.' };
    if (isNormalLine(sides, c))
      return { status: 'correct', message: 'These are the symmetric equations of the normal line.' };
    if (isSurface(sides, c)) return { status: 'info', message: 'This is the surface written as F(x, y, z) = 0.' };
  } catch (error) {
    if (error instanceof UnknownSymbolError) {
      return { status: 'cannotCheck', message: `"${error.symbol}" cannot be evaluated here.` };
    }
    return { status: 'cannotCheck', message: 'This step could not be checked.' };
  }
  return checkPartialLine(text, c.partial);
}

// -----------------------------------------------------------------------------
// Critical points and the Second Partials Test (§4.3.1)
// -----------------------------------------------------------------------------

export type PointType = 'min' | 'max' | 'saddle' | 'inconclusive';

export interface ExtremaPoint {
  /** Exact coordinates in learner syntax, e.g. "23/6" or "(-8 + 2sqrt(61))/9". */
  x: string;
  y: string;
  /** Classification by Theorem 4.3.3 (absent when only the critical points are asked for). */
  type?: PointType;
}

export interface ExtremaSpec {
  /** f(x, y) in learner syntax. */
  f: string;
  /** The complete set of critical points (verified independently in the tests). */
  points: ExtremaPoint[];
  /** True: classify each point (Second Partials Test). False: find the critical points only. */
  classify: boolean;
}

export interface CompiledExtrema {
  spec: ExtremaSpec;
  f: MultiFn;
  points: { x: number; y: number; type?: PointType; label: string }[];
  partial: CompiledPartial;
}

const SAMPLES: Record<string, number>[] = [
  { x: 0.7, y: 1.3 },
  { x: 1.6, y: 0.45 },
  { x: 0.35, y: 2.2 },
  { x: 2.1, y: 1.7 },
  { x: 1.15, y: 0.8 },
];

const TYPE_WORDS: [RegExp, PointType][] = [
  [/inconclusive|neither|no conclusion|test fails/i, 'inconclusive'],
  [/saddle/i, 'saddle'],
  [/min/i, 'min'],
  [/max/i, 'max'],
];
const TYPE_NAMES: Record<PointType, string> = {
  min: 'a relative minimum',
  max: 'a relative maximum',
  saddle: 'a saddle point',
  inconclusive: 'a point where the test is inconclusive',
};

export function compileExtrema(spec: ExtremaSpec): CompiledExtrema {
  const f = compileFn(spec.f, ['x', 'y']);
  const points = spec.points.map((p) => ({
    x: numberOf(p.x),
    y: numberOf(p.y),
    ...(p.type ? { type: p.type } : {}),
    label: `(${p.x}, ${p.y})`,
  }));
  const partial: PartialSpec = {
    variables: ['x', 'y'],
    samples: SAMPLES,
    targets: [
      { kind: 'derivative', label: 'f_x', f: spec.f, wrt: ['x'] },
      { kind: 'derivative', label: 'f_y', f: spec.f, wrt: ['y'] },
      ...(spec.classify
        ? [
            { kind: 'derivative' as const, label: 'f_xx', f: spec.f, wrt: ['x', 'x'] },
            { kind: 'derivative' as const, label: 'f_yy', f: spec.f, wrt: ['y', 'y'] },
            { kind: 'derivative' as const, label: 'f_xy', f: spec.f, wrt: ['x', 'y'] },
          ]
        : []),
      ...points.flatMap((p) =>
        spec.classify && Number.isFinite(f.d2({ x: p.x, y: p.y }, 'x', 'x'))
          ? [
              {
                kind: 'number' as const,
                label: `d at ${p.label}`,
                value:
                  f.d2({ x: p.x, y: p.y }, 'x', 'x') * f.d2({ x: p.x, y: p.y }, 'y', 'y') -
                  f.d2({ x: p.x, y: p.y }, 'x', 'y') ** 2,
              },
            ]
          : [],
      ),
    ],
  };
  return { spec, f, points, partial: compilePartial(partial) };
}

export const extremaAnswerLabel = (spec: ExtremaSpec): string =>
  spec.classify
    ? 'Final answer: every critical point and its type, separated by semicolons'
    : 'Final answer: every critical point, separated by semicolons';

export const extremaPlaceholder = (spec: ExtremaSpec): string =>
  spec.classify ? 'e.g. (0, 0) saddle; (4/3, 4/3) max' : 'e.g. (-2, 3)';

/** The learner's points: "(a, b) type", separated by semicolons (or commas between brackets). */
function parsePoints(input: string): { x: number; y: number; type: PointType | null; text: string }[] {
  const items = splitAnswer(input.replace(/;/g, ','));
  return items.map((raw) => {
    const item = raw.trim();
    const bad = () => new Error(`Write each point in brackets, e.g. (1, 2) min. Could not read "${item}".`);
    if (!item.startsWith('(')) throw bad();
    // The closing bracket that matches the first one (coordinates may contain brackets themselves).
    let depth = 0;
    let end = -1;
    for (let i = 0; i < item.length; i++) {
      if (item[i] === '(') depth++;
      if (item[i] === ')') depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
    if (end < 0) throw bad();
    const inside = item.slice(1, end);
    const coordinates = splitAnswer(inside);
    if (coordinates.length !== 2) throw new Error(`A critical point has two coordinates: "${item}".`);
    const words = item.slice(end + 1).trim();
    const type = TYPE_WORDS.find(([re]) => re.test(words))?.[1] ?? null;
    return { x: numberOf(coordinates[0]!), y: numberOf(coordinates[1]!), type, text: `(${inside.trim()})` };
  });
}

export function checkExtremaAnswer(input: string, c: CompiledExtrema): AnswerResult {
  let given: ReturnType<typeof parsePoints>;
  try {
    given = parsePoints(input);
  } catch (error) {
    return { status: 'cannotCheck', message: (error as Error).message };
  }
  if (given.length === 0) return { status: 'cannotCheck', message: 'Give at least one critical point.' };
  const remaining = [...c.points];
  const problems: string[] = [];
  let rounded = false;
  for (const g of given) {
    // Exact forms are compared closely; a point typed with decimals (e.g. (0.7368, 0)) is accepted when
    // each coordinate is right to four decimal places, as numeric answers are elsewhere in the app.
    const decimals = /\d\.\d/.test(g.text);
    const exact = (p: { x: number; y: number }) => close(p.x, g.x, p.x) && close(p.y, g.y, p.y);
    const same = (p: { x: number; y: number }) =>
      decimals ? roughlyClose(g.x, p.x) && roughlyClose(g.y, p.y) : exact(p);
    const index = remaining.findIndex(same);
    if (index >= 0 && !exact(remaining[index]!)) rounded = true;
    if (index < 0) {
      const repeated = c.points.some(same);
      problems.push(repeated ? `${g.text} is listed twice.` : `${g.text} is not a critical point.`);
      continue;
    }
    const want = remaining[index]!;
    remaining.splice(index, 1);
    if (!c.spec.classify) continue;
    if (!g.type) problems.push(`Say what kind of point ${g.text} is (min, max, saddle or inconclusive).`);
    else if (want.type && g.type !== want.type)
      problems.push(`${g.text} is a critical point, but it is not ${TYPE_NAMES[g.type]}.`);
  }
  if (remaining.length > 0) {
    const found = c.points.length - remaining.length;
    problems.push(
      `You have ${found} of the ${c.points.length} critical points. Solve f_x = 0 and f_y = 0 together again${
        c.spec.classify ? '' : ', and check where a partial derivative does not exist'
      }.`,
    );
  }
  if (problems.length === 0) {
    const note = rounded ? ' Exact forms are better where you can give them.' : '';
    return {
      status: 'correct',
      message: c.spec.classify
        ? `Correct: all ${c.points.length} critical points, each classified correctly.${note}`
        : `Correct: ${c.points.length === 1 ? 'the critical point is right' : `all ${c.points.length} critical points are right`}.${note}`,
    };
  }
  return { status: 'incorrect', message: `Not yet. ${problems.join(' ')}` };
}

export function checkExtremaLine(line: string, c: CompiledExtrema): Feedback {
  const text = line.trim();
  if (!text) return { status: 'cannotCheck', message: 'Write a step first.' };
  let sides: ExprNode[];
  try {
    sides = parseSides(text);
  } catch {
    return {
      status: 'cannotCheck',
      message: 'Written reasoning is not checked automatically. Write a calculation or an equation to check it.',
    };
  }
  const unknown = [...new Set(sides.flatMap((n) => [...symbolsOf(n)]))].filter(
    (s) => !['x', 'y', 'e', 'π'].includes(s),
  );
  // Labelled steps ("f_x = 4x + 8") and single expressions: compare with the derivatives and values of d.
  if (sides.length !== 2 || unknown.length > 0) return checkPartialLine(text, c.partial);
  try {
    const g = (p: Record<string, number>) => valueOf(sides[0]!, p) - valueOf(sides[1]!, p);
    // An identity (both sides equal everywhere) is a correct rearrangement.
    if (SAMPLES.every((p) => close(g(p), 0, valueOf(sides[0]!, p)))) return checkPartialLine(text, c.partial);
    const proportional = (h: (p: Record<string, number>) => number) => {
      let ratio: number | null = null;
      for (const p of SAMPLES) {
        const want = h(p);
        const got = g(p);
        if (!Number.isFinite(got) || !Number.isFinite(want) || Math.abs(want) < 1e-9) continue;
        if (ratio === null) ratio = got / want;
        else if (!close(got / want, ratio, ratio)) return false;
      }
      return ratio !== null && Math.abs(ratio) > 1e-9;
    };
    if (proportional((p) => c.f.d(p, 'x'))) return { status: 'correct', message: 'This is the equation f_x = 0.' };
    if (proportional((p) => c.f.d(p, 'y'))) return { status: 'correct', message: 'This is the equation f_y = 0.' };
    const holds = c.points.filter((p) => {
      const v = g({ x: p.x, y: p.y });
      return Number.isFinite(v) && close(v, 0, 1);
    }).length;
    if (holds === c.points.length) {
      return { status: 'correct', message: 'This equation holds at every critical point. Keep going.' };
    }
    if (holds > 0) {
      return {
        status: 'info',
        message: 'This holds at some of the critical points (one case of your solution). Check the other cases too.',
      };
    }
    return {
      status: 'incorrect',
      message: 'This equation does not hold at any critical point. Check your algebra.',
    };
  } catch (error) {
    if (error instanceof UnknownSymbolError) {
      return { status: 'cannotCheck', message: `"${error.symbol}" cannot be evaluated here.` };
    }
    return { status: 'cannotCheck', message: 'This step could not be checked.' };
  }
}
