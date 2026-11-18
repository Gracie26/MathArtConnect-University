/**
 * Turns equation layers into drawable curve segments.
 *
 * Expressions are read with the safe learner parser (lib/math/input/parse):
 * nothing is executed, only allow-listed functions and symbols are accepted,
 * and anything else becomes a learner-friendly error on that layer.
 *
 *   cartesian   y = f(x), optionally for start < x < end, clipped to a y range
 *   polar       r = f(θ), for start < θ < end (default 0 to 2π)
 *
 * A curve is split wherever it is undefined, leaves the range restriction, or
 * jumps (e.g. tan x at its asymptotes), so no false vertical lines are drawn.
 */
import { evaluate, UnknownSymbolError } from '@/lib/math/input/evaluate';
import { type ExprNode, type FunctionName, ParseError, parseStatement, symbolsOf } from '@/lib/math/input/parse';

export type LayerKind = 'cartesian' | 'polar';

export interface GraphLayer {
  id: string;
  name: string;
  kind: LayerKind;
  /** As typed, e.g. "a sin(x) + c" or "y = x^2 + C" or "r = cos(a θ)". */
  expression: string;
  visible: boolean;
  /** Index into the theme's curve colours. */
  color: number;
  width: number;
  /** Domain restriction: x for cartesian, θ for polar (null = unrestricted). */
  domain: { start: number | null; end: number | null };
  /** Range restriction for cartesian layers (null = none). */
  range: { min: number | null; max: number | null };
  /** Polar: draw this many copies rotated evenly about the origin (1 = just the curve). */
  repeat: number;
  /** Cartesian: also draw the reflection in the y-axis. */
  mirror: boolean;
  /** Draw with a dashed line (e.g. the "before" curve in a transformation). */
  dashed?: boolean;
  /**
   * Polar only: where the curve is drawn. Each point (r cos θ, r sin θ) is
   * rotated by `rotation` degrees, scaled by `scale`, then moved by (h, k):
   * x = h + s·r(θ)cos(θ + φ), y = k + s·r(θ)sin(θ + φ). The equation r(θ) itself is unchanged.
   */
  placement?: Placement;
}

export interface Placement {
  h: number;
  k: number;
  scale: number;
  /** Degrees, anticlockwise. */
  rotation: number;
}

export const DEFAULT_PLACEMENT: Placement = { h: 0, k: 0, scale: 1, rotation: 0 };

export const isPlaced = (p: Placement | undefined): p is Placement =>
  p !== undefined && (p.h !== 0 || p.k !== 0 || p.scale !== 1 || p.rotation !== 0);

export interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export interface GraphView {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  axes: boolean;
  grid: boolean;
}

export interface Point {
  x: number;
  y: number;
}

/** Functions allowed in a studio; a topic can narrow this list. */
export const ALL_FUNCTIONS: readonly FunctionName[] = [
  'sin',
  'cos',
  'tan',
  'sec',
  'csc',
  'cot',
  'arcsin',
  'arccos',
  'arctan',
  'sinh',
  'cosh',
  'tanh',
  'ln',
  'exp',
];

/** Single-letter names that may be used as parameters (never x, y, r, θ, e). */
export const PARAMETER_NAMES = ['a', 'b', 'c', 'k', 'm', 'n', 'p', 'q', 'h', 'C'] as const;

export type CompiledLayer = { ok: true; node: ExprNode; variable: 'x' | 'θ' } | { ok: false; error: string };

function functionsOf(node: ExprNode, into: Set<string> = new Set()): Set<string> {
  switch (node.k) {
    case 'fn':
      into.add(node.name);
      functionsOf(node.arg, into);
      if (node.power) functionsOf(node.power, into);
      break;
    case 'num':
    case 'sym':
    case 'diff':
      break;
    case 'neg':
    case 'abs':
    case 'sqrt':
      functionsOf(node.a, into);
      break;
    case 'int':
      into.add('∫');
      break;
    default:
      functionsOf(node.a, into);
      functionsOf(node.b, into);
  }
  return into;
}

/**
 * Parses and validates a layer's expression. Accepts "y = …" / "r = …" or a
 * bare expression; only the layer's variable, parameters, e and π may appear.
 */
export function compileLayer(
  layer: Pick<GraphLayer, 'kind' | 'expression'>,
  parameterNames: readonly string[],
  allowedFunctions: readonly FunctionName[] = ALL_FUNCTIONS,
): CompiledLayer {
  const variable = layer.kind === 'polar' ? 'θ' : 'x';
  const output = layer.kind === 'polar' ? 'r' : 'y';
  let node: ExprNode;
  try {
    const statement = parseStatement(layer.expression);
    if (statement.k === 'eq') {
      const [left, right] = statement.sides;
      if (statement.sides.length !== 2 || left?.k !== 'sym' || left.name !== output || !right) {
        return { ok: false, error: `Write the equation as ${output} = …, or just the right-hand side.` };
      }
      node = right;
    } else {
      node = statement.node;
    }
  } catch (error) {
    return { ok: false, error: error instanceof ParseError ? error.message : 'This equation cannot be read.' };
  }
  const functions = functionsOf(node);
  if (functions.has('∫')) return { ok: false, error: 'An equation to graph cannot contain an integral sign.' };
  const notAllowed = [...functions].filter((f) => !allowedFunctions.includes(f as FunctionName));
  if (notAllowed.length > 0) return { ok: false, error: `${notAllowed[0]} is not available in this studio.` };
  const unknown = [...symbolsOf(node)].filter(
    (s) => s !== variable && s !== 'e' && s !== 'π' && !parameterNames.includes(s),
  );
  if (unknown.length > 0) {
    const symbol = unknown[0] as string;
    const hint =
      symbol === 'x' || symbol === 'θ'
        ? ` This is a ${layer.kind} layer, so use ${variable}.`
        : ' Add it as a parameter to use it.';
    return { ok: false, error: `${symbol} is not defined.${hint}` };
  }
  return { ok: true, node, variable };
}

const SAMPLES = { cartesian: 400, polar: 720 } as const;

/** Value of a compiled expression at t, or NaN where undefined. */
export function valueAt(
  compiled: Extract<CompiledLayer, { ok: true }>,
  t: number,
  parameters: Record<string, number>,
): number {
  try {
    return evaluate(compiled.node, t, { variable: compiled.variable, constants: parameters, definitions: {}, base: 0 })
      .v;
  } catch (error) {
    if (error instanceof UnknownSymbolError) return Number.NaN;
    throw error;
  }
}

export const parameterValues = (parameters: readonly Parameter[]): Record<string, number> =>
  Object.fromEntries(parameters.map((p) => [p.name, p.value]));

/**
 * Samples a layer inside the view: a list of continuous segments. `density`
 * below 1 draws fewer points (used while a parameter is animating).
 */
export function sampleLayer(
  layer: GraphLayer,
  compiled: Extract<CompiledLayer, { ok: true }>,
  parameters: Record<string, number>,
  view: GraphView,
  density = 1,
): Point[][] {
  const detail = Math.min(1, Math.max(0.25, density));
  const height = view.yMax - view.yMin;
  const segments: Point[][] = [];
  let current: Point[] = [];
  const flush = () => {
    if (current.length > 1) segments.push(current);
    current = [];
  };

  if (layer.kind === 'cartesian') {
    const from = Math.max(view.xMin, layer.domain.start ?? -Infinity);
    const to = Math.min(view.xMax, layer.domain.end ?? Infinity);
    if (!(to > from)) return [];
    const n = Math.round(SAMPLES.cartesian * detail);
    let previous: number | null = null;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      const y = valueAt(compiled, x, parameters);
      const outsideRange =
        (layer.range.min !== null && y < layer.range.min) || (layer.range.max !== null && y > layer.range.max);
      // A jump larger than several view heights between neighbours is a discontinuity.
      const jump = previous !== null && Math.abs(y - previous) > 4 * height;
      if (!Number.isFinite(y) || outsideRange || Math.abs(y) > 1e6 || jump) {
        flush();
        previous = Number.isFinite(y) && !outsideRange ? y : null;
        if (jump && !outsideRange && Number.isFinite(y)) current.push({ x, y });
        continue;
      }
      current.push({ x, y });
      previous = y;
    }
    flush();
    if (layer.mirror) {
      const mirrored = segments.map((segment) => segment.map((p) => ({ x: -p.x, y: p.y })));
      segments.push(...mirrored);
    }
    return segments;
  }

  const from = layer.domain.start ?? 0;
  const to = layer.domain.end ?? 2 * Math.PI;
  if (!(to > from)) return [];
  const n = Math.round(SAMPLES.polar * detail);
  for (let i = 0; i <= n; i++) {
    const theta = from + ((to - from) * i) / n;
    const r = valueAt(compiled, theta, parameters);
    if (!Number.isFinite(r) || Math.abs(r) > 1e6) {
      flush();
      continue;
    }
    current.push({ x: r * Math.cos(theta), y: r * Math.sin(theta) });
  }
  flush();
  const copies = Math.max(1, Math.min(24, Math.round(layer.repeat)));
  const rotated: Point[][] = [];
  if (copies === 1) rotated.push(...segments);
  else {
    for (let k = 0; k < copies; k++) {
      const angle = (2 * Math.PI * k) / copies;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (const segment of segments)
        rotated.push(segment.map((p) => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos })));
    }
  }
  const placement = layer.placement;
  return isPlaced(placement) ? rotated.map((s) => s.map(placePoint(placement))) : rotated;
}

/** Rotate by φ degrees, scale by s, then translate by (h, k). */
export function placePoint({ h, k, scale, rotation }: Placement): (p: Point) => Point {
  const angle = (rotation * Math.PI) / 180;
  const cos = Math.cos(angle) * scale;
  const sin = Math.sin(angle) * scale;
  return (p) => ({ x: h + p.x * cos - p.y * sin, y: k + p.x * sin + p.y * cos });
}

/** A "nice" grid spacing (1, 2 or 5 × 10ⁿ) giving about `target` lines across `span`. */
export function niceStep(span: number, target = 8): number {
  const raw = span / target;
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit = raw / power;
  return (unit < 1.5 ? 1 : unit < 3.5 ? 2 : unit < 7.5 ? 5 : 10) * power;
}

/** One-line description of a layer for screen readers and "Math behind my art". */
export function describeRestriction(layer: GraphLayer): string {
  const variable = layer.kind === 'polar' ? 'θ' : 'x';
  const parts: string[] = [];
  const { start, end } = layer.domain;
  if (start !== null && end !== null) parts.push(`${fmt(start)} ≤ ${variable} ≤ ${fmt(end)}`);
  else if (start !== null) parts.push(`${variable} ≥ ${fmt(start)}`);
  else if (end !== null) parts.push(`${variable} ≤ ${fmt(end)}`);
  if (layer.kind === 'cartesian') {
    const { min, max } = layer.range;
    if (min !== null && max !== null) parts.push(`${fmt(min)} ≤ y ≤ ${fmt(max)}`);
    else if (min !== null) parts.push(`y ≥ ${fmt(min)}`);
    else if (max !== null) parts.push(`y ≤ ${fmt(max)}`);
    if (layer.mirror) parts.push('mirrored in the y-axis');
  } else {
    if (layer.repeat > 1) parts.push(`${layer.repeat} rotated copies`);
    const p = layer.placement;
    if (isPlaced(p)) {
      if (p.rotation !== 0) parts.push(`rotated ${fmt(p.rotation)}°`);
      if (p.scale !== 1) parts.push(`scaled by ${fmt(p.scale)}`);
      if (p.h !== 0 || p.k !== 0) parts.push(`centred at (${fmt(p.h)}, ${fmt(p.k)})`);
    }
  }
  return parts.join(', ');
}

/** Short number formatting: integers stay whole, others to 3 significant figures; π multiples are named. */
export function fmt(value: number): string {
  const piMultiple = value / Math.PI;
  if (Math.abs(value) > 1e-9 && Math.abs(piMultiple - Math.round(piMultiple * 4) / 4) < 1e-9) {
    const q = Math.round(piMultiple * 4) / 4;
    if (q === 1) return 'π';
    if (q === -1) return '−π';
    return `${Number.isInteger(q) ? q : q.toString()}π`.replace('-', '−');
  }
  if (Number.isInteger(value)) return String(value).replace('-', '−');
  return Number(value.toPrecision(3)).toString().replace('-', '−');
}
