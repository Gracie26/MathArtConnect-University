/**
 * Mathematics for the Topic 3 Explore tools (Differential Calculus in ℝⁿ):
 * functions of several variables from formulas (through the app's safe
 * expression parser, never eval), exact first partial derivatives, central
 * differences for second derivatives, and an orthographic 3D projection that
 * turns a surface z = f(x, y) into figure items (faces sorted far to near,
 * slices and points) for the shared SVG figure renderer.
 *
 * Pure functions only; nothing here touches React.
 */
import type { FigureItem, FigureScene, FillTone, StrokeTone } from '@/lib/figures/scene';
import { type EvalContext, evaluate } from '@/lib/math/input/evaluate';
import { type ExprNode, parseStatement } from '@/lib/math/input/parse';

export type Point = Record<string, number>;

/** A function of several variables with exact first partial derivatives. */
export interface MultiFn {
  variables: string[];
  value: (p: Point) => number;
  /** ∂/∂v at p (exact, by dual numbers). */
  d: (p: Point, v: string) => number;
  /** ∂²/∂b∂a: differentiate with respect to a first, then b (central difference of the exact first). */
  d2: (p: Point, a: string, b: string) => number;
}

function parse(text: string): ExprNode {
  const statement = parseStatement(text);
  if (statement.k !== 'expr') throw new Error(`Not an expression: ${text}`);
  return statement.node;
}

/**
 * Compiles a formula in learner syntax, e.g. "3x - x^2 y^2 + 2x^3 y", with optional intermediate
 * variables ({ x: 'sin(t)', y: 'e^t' }) for the chain rule.
 */
export function compileFn(text: string, variables: string[], definitions: Record<string, string> = {}): MultiFn {
  const node = parse(text);
  const defs = Object.fromEntries(Object.entries(definitions).map(([k, v]) => [k, parse(v)]));
  const dual = (p: Point, v: string) => {
    const constants = { ...p };
    delete constants[v];
    const ctx: EvalContext = { variable: v, constants, definitions: defs, base: 0 };
    return evaluate(node, p[v] ?? 0, ctx);
  };
  const first = variables[0] ?? 'x';
  const d = (p: Point, v: string) => dual(p, v).d;
  return {
    variables,
    value: (p) => dual(p, first).v,
    d,
    d2: (p, a, b) => {
      const h = 1e-4 * Math.max(1, Math.abs(p[b] ?? 0));
      return (d({ ...p, [b]: (p[b] ?? 0) + h }, a) - d({ ...p, [b]: (p[b] ?? 0) - h }, a)) / (2 * h);
    },
  };
}

// -----------------------------------------------------------------------------
// Orthographic 3D projection
// -----------------------------------------------------------------------------

export interface Box3 {
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

export interface Camera {
  /** Rotation about the vertical axis, in radians. */
  azimuth: number;
  /** Tilt of the view above the xy-plane, in radians. */
  elevation: number;
}

export const DEFAULT_CAMERA: Camera = { azimuth: -0.65, elevation: 0.5 };

/**
 * Maps a point in the box to the plane of the figure. The box is first scaled to a cube [−1, 1]³
 * (so every function's surface fills the same space), then rotated and tilted.
 * Returns [screen x, screen y, depth] (larger depth = farther from the viewer).
 */
export function projector(box: Box3, camera: Camera) {
  const norm = (v: number, [a, b]: [number, number]) => (2 * (v - a)) / (b - a) - 1;
  const ca = Math.cos(camera.azimuth);
  const sa = Math.sin(camera.azimuth);
  const ce = Math.cos(camera.elevation);
  const se = Math.sin(camera.elevation);
  return (x: number, y: number, z: number): [number, number, number] => {
    const X = norm(x, box.x);
    const Y = norm(y, box.y);
    const Z = norm(z, box.z) * 0.8;
    const u = X * ca - Y * sa;
    const w = X * sa + Y * ca;
    return [u, Z * ce + w * se, w * ce - Z * se];
  };
}

/** The figure view that holds the projected cube with room for axis labels. */
export const CUBE_VIEW = { xMin: -1.75, xMax: 1.75, yMin: -1.45, yMax: 1.55 };

const clampZ = (z: number, [lo, hi]: [number, number]) => (Number.isFinite(z) && z >= lo && z <= hi ? z : Number.NaN);

export interface SurfaceOptions {
  /** Grid cells along each side. */
  n?: number;
  tone?: FillTone;
  opacity?: number;
}

/**
 * The surface z = f(x, y) over the box as faces sorted far to near (painter's order), each
 * outlined, so the wireframe reads as a surface. Points outside the domain, or above or below the
 * box, leave holes: a formula's domain is shown by where the surface exists.
 */
export function surfaceFaces(
  f: (x: number, y: number) => number,
  box: Box3,
  camera: Camera,
  options: SurfaceOptions = {},
): FigureItem[] {
  const n = options.n ?? 22;
  const P = projector(box, camera);
  const xs = Array.from({ length: n + 1 }, (_, i) => box.x[0] + ((box.x[1] - box.x[0]) * i) / n);
  const ys = Array.from({ length: n + 1 }, (_, j) => box.y[0] + ((box.y[1] - box.y[0]) * j) / n);
  const z = xs.map((x) => ys.map((y) => clampZ(f(x, y), box.z)));
  const faces: { depth: number; item: FigureItem }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const corners: [number, number, number][] = [
        [xs[i]!, ys[j]!, z[i]![j]!],
        [xs[i + 1]!, ys[j]!, z[i + 1]![j]!],
        [xs[i + 1]!, ys[j + 1]!, z[i + 1]![j + 1]!],
        [xs[i]!, ys[j + 1]!, z[i]![j + 1]!],
      ];
      if (corners.some(([, , c]) => !Number.isFinite(c))) continue;
      const projected = corners.map(([x, y, c]) => P(x, y, c));
      const depth = projected.reduce((s, [, , w]) => s + w, 0) / 4;
      faces.push({
        depth,
        item: {
          k: 'polygon',
          points: projected.map(([u, v]) => [u, v]),
          tone: options.tone ?? 'fill',
          opacity: options.opacity ?? 0.85,
          outline: 'guide',
        },
      });
    }
  }
  return faces.sort((a, b) => b.depth - a.depth).map((f) => f.item);
}

/** A curve on or above the base plane, e.g. a slice of the surface: (x(s), y(s), z(s)) for s in [0, 1]. */
export function spaceCurve(
  path: (s: number) => [number, number, number],
  box: Box3,
  camera: Camera,
  options: { tone?: StrokeTone; width?: number; dashed?: boolean; steps?: number } = {},
): FigureItem {
  const P = projector(box, camera);
  const steps = options.steps ?? 80;
  const points: [number, number][] = [];
  for (let k = 0; k <= steps; k++) {
    const [x, y, z] = path(k / steps);
    const zc = clampZ(z, box.z);
    if (!Number.isFinite(zc)) {
      points.push([Number.NaN, Number.NaN]);
      continue;
    }
    const [u, v] = P(x, y, zc);
    points.push([u, v]);
  }
  return {
    k: 'polyline',
    points,
    tone: options.tone ?? 'curve2',
    width: options.width ?? 2.8,
    ...(options.dashed ? { dashed: true } : {}),
  };
}

/** A projected point (drawn only inside the box). */
export function spacePoint(
  [x, y, z]: [number, number, number],
  box: Box3,
  camera: Camera,
  tone: StrokeTone = 'asymptote',
): FigureItem[] {
  if (!Number.isFinite(clampZ(z, box.z))) return [];
  const [u, v] = projector(box, camera)(x, y, z);
  return [{ k: 'point', x: u, y: v, tone }];
}

/** A straight segment in space (both ends clamped to the box's z-range). */
export function spaceSegment(
  a: [number, number, number],
  b: [number, number, number],
  box: Box3,
  camera: Camera,
  options: { tone?: StrokeTone; dashed?: boolean; width?: number } = {},
): FigureItem {
  const P = projector(box, camera);
  const clamp = (z: number) => Math.min(box.z[1], Math.max(box.z[0], z));
  const [u1, v1] = P(a[0], a[1], clamp(a[2]));
  const [u2, v2] = P(b[0], b[1], clamp(b[2]));
  return {
    k: 'segment',
    x1: u1,
    y1: v1,
    x2: u2,
    y2: v2,
    tone: options.tone ?? 'edge',
    ...(options.dashed ? { dashed: true } : {}),
    width: options.width ?? 1.6,
  };
}

/** The three edges of the box through its lowest corner, labelled x, y and z. */
export function boxAxes(box: Box3, camera: Camera, labels: [string, string, string] = ['x', 'y', 'z']): FigureItem[] {
  const P = projector(box, camera);
  const o = P(box.x[0], box.y[0], box.z[0]);
  const ends: [number, number, number][] = [
    P(box.x[1], box.y[0], box.z[0]),
    P(box.x[0], box.y[1], box.z[0]),
    P(box.x[0], box.y[0], box.z[1]),
  ];
  return ends.flatMap(([u, v], i): FigureItem[] => [
    { k: 'segment', x1: o[0], y1: o[1], x2: u, y2: v, tone: 'guide', arrow: 'end', width: 1.2 },
    {
      k: 'label',
      x: u + (u - o[0]) * 0.08,
      y: v + (v - o[1]) * 0.08 + (i === 2 ? 0.04 : -0.1),
      text: labels[i]!,
      size: 'small',
      italic: true,
      anchor: 'middle',
    },
  ]);
}

/**
 * Math-view numbers for a 3D box: the lowest and highest value of each axis, written at the two
 * ends of that axis edge, so a reader can tell where on the surface a point is. (A 2D grid would
 * be wrong on a 3D view; these are the 3D reference cues.)
 */
export function boxTicks(box: Box3, camera: Camera): FigureItem[] {
  const P = projector(box, camera);
  const label = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1)).replace('-', '−');
  const ends: [string, [number, number, number], [number, number, number], number][] = [
    ['x', [box.x[0], box.y[0], box.z[0]], [box.x[1], box.y[0], box.z[0]], 0],
    ['y', [box.x[0], box.y[0], box.z[0]], [box.x[0], box.y[1], box.z[0]], 1],
    ['z', [box.x[0], box.y[0], box.z[0]], [box.x[0], box.y[0], box.z[1]], 2],
  ];
  const items: FigureItem[] = [];
  for (const [axis, a, b, k] of ends) {
    const [u1, v1] = P(...a);
    const [u2, v2] = P(...b);
    const range = axis === 'x' ? box.x : axis === 'y' ? box.y : box.z;
    // Low value a little along the edge from the shared corner (so the three low labels do not overlap).
    const t = 0.12;
    items.push(
      {
        k: 'label',
        x: u1 + (u2 - u1) * t + (k === 2 ? -0.12 : 0),
        y: v1 + (v2 - v1) * t - (k === 2 ? 0 : 0.09),
        text: label(range[0]),
        size: 'small',
        anchor: 'middle',
      },
      {
        k: 'label',
        x: u2 + (k === 2 ? -0.12 : 0),
        y: v2 - (k === 2 ? 0 : 0.09),
        text: label(range[1]),
        size: 'small',
        anchor: 'middle',
      },
    );
  }
  return items;
}

/** A complete 3D panel: axes, surface and any extra items drawn on top. */
export function surfaceScene(
  f: (x: number, y: number) => number,
  box: Box3,
  camera: Camera,
  extras: FigureItem[] = [],
  options: SurfaceOptions = {},
): FigureScene {
  return {
    view: CUBE_VIEW,
    aspect: 0.82,
    axes: { x: false, y: false },
    // The axes carry their range at each end, so heights and positions can be read.
    items: [...boxAxes(box, camera), ...boxTicks(box, camera), ...surfaceFaces(f, box, camera, options), ...extras],
  };
}

// -----------------------------------------------------------------------------
// Two-dimensional helpers
// -----------------------------------------------------------------------------

/** One cell of an n × n grid where the formula is defined: its square and the value at its centre. */
export interface DomainCell {
  square: [number, number][];
  centre: [number, number];
  value: number;
}

/** Sampled grids, by key: evaluating the formula at every cell is the slow part on a phone. */
const GRID_CACHE = new Map<string, DomainCell[]>();
const GRID_CACHE_SIZE = 24;

/**
 * The cells of the xy-rectangle where the formula is defined (finite value at the centre).
 * With a `cacheKey` the sampling is done once and reused, so zooming, panning, restyling and
 * animating never re-evaluate the formula.
 */
export function definedCells(
  f: (x: number, y: number) => number,
  x: [number, number],
  y: [number, number],
  n = 40,
  cacheKey?: string,
): DomainCell[] {
  const key = cacheKey ? `${cacheKey}|${x.join(',')}|${y.join(',')}|${n}` : null;
  const cached = key ? GRID_CACHE.get(key) : undefined;
  if (cached) return cached;
  const dx = (x[1] - x[0]) / n;
  const dy = (y[1] - y[0]) / n;
  const cells: DomainCell[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = x[0] + (i + 0.5) * dx;
      const cy = y[0] + (j + 0.5) * dy;
      const value = f(cx, cy);
      if (!Number.isFinite(value)) continue;
      const [x0, y0, x1, y1] = [x[0] + i * dx, y[0] + j * dy, x[0] + (i + 1) * dx, y[0] + (j + 1) * dy];
      cells.push({
        square: [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ],
        centre: [cx, cy],
        value,
      });
    }
  }
  if (key) {
    if (GRID_CACHE.size >= GRID_CACHE_SIZE) GRID_CACHE.delete(GRID_CACHE.keys().next().value!);
    GRID_CACHE.set(key, cells);
  }
  return cells;
}

/** The domain of the formula over the xy-rectangle, as one filled shape (a single path to draw). */
export function domainCells(
  f: (x: number, y: number) => number,
  x: [number, number],
  y: [number, number],
  n = 40,
  cacheKey?: string,
): FigureItem[] {
  const cells = definedCells(f, x, y, n, cacheKey);
  return cells.length === 0 ? [] : [{ k: 'polygons', polys: cells.map((c) => c.square), tone: 'fill2' }];
}

/** A sampled 2D curve as a polyline (gaps where the function is not finite or leaves the y-range). */
export function curve2(
  f: (t: number) => number,
  from: number,
  to: number,
  yRange: [number, number],
  options: { tone?: StrokeTone; width?: number; dashed?: boolean; steps?: number } = {},
): FigureItem {
  const steps = options.steps ?? 160;
  const points: [number, number][] = [];
  for (let k = 0; k <= steps; k++) {
    const t = from + ((to - from) * k) / steps;
    const v = f(t);
    points.push(Number.isFinite(v) && v >= yRange[0] && v <= yRange[1] ? [t, v] : [Number.NaN, Number.NaN]);
  }
  return {
    k: 'polyline',
    points,
    tone: options.tone ?? 'curve',
    width: options.width ?? 2.4,
    ...(options.dashed ? { dashed: true } : {}),
  };
}

/** A parametric 2D curve (x(s), y(s)) for s in [from, to]. */
export function path2(
  p: (s: number) => [number, number],
  from: number,
  to: number,
  options: { tone?: StrokeTone; width?: number; dashed?: boolean; steps?: number } = {},
): FigureItem {
  const steps = options.steps ?? 120;
  const points: [number, number][] = [];
  for (let k = 0; k <= steps; k++) points.push(p(from + ((to - from) * k) / steps));
  return {
    k: 'polyline',
    points,
    tone: options.tone ?? 'curve',
    width: options.width ?? 2,
    ...(options.dashed ? { dashed: true } : {}),
  };
}

/** The smallest and largest finite values of f on [from, to], padded, for a 2D view. */
export function rangeOf(f: (t: number) => number, from: number, to: number, pad = 0.12): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let k = 0; k <= 200; k++) {
    const v = f(from + ((to - from) * k) / 200);
    if (!Number.isFinite(v)) continue;
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  if (!Number.isFinite(lo)) return [-1, 1];
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  return [lo - pad * span, hi + pad * span];
}

/** Rounds for display: up to four decimals, without trailing zeros. */
export const fmt = (v: number): string => {
  if (!Number.isFinite(v)) return '\\text{undefined}';
  const r = Math.round(v * 1e4) / 1e4;
  return Object.is(r, -0) ? '0' : String(r);
};
