/**
 * Key features of one art layer, computed from its equation (never typed in), for "How to read this
 * graph" in Math behind my art. Features are reported only where they exist and are useful:
 *
 *   cartesian y = f(x): the y-intercept f(0) (or that f(0) is undefined), the x-intercepts inside the
 *   view, symmetry (even: about the y-axis; odd: about the origin) and the lowest and highest y in view;
 *   polar r = r(θ): the greatest distance from the origin and symmetry about the x-axis.
 *
 * Everything is numerical: values are sampled across the visible window, roots are found by sign
 * changes and refined by bisection, and a sign change across a vertical asymptote (e.g. tan x at π/2)
 * is not counted as a root. Pure functions.
 */
import { compileLayer, type GraphLayer, type GraphView, type Parameter, parameterValues, valueAt } from './sample';

export interface CartesianFeatures {
  kind: 'cartesian';
  /** f(0) when 0 is in the drawn domain: a number, 'undefined' (e.g. 1/x), or null when 0 is not drawn. */
  yIntercept: number | 'undefined' | null;
  /** x-intercepts inside the view, at most MAX_ROOTS of them. */
  xIntercepts: number[];
  /** True when there are more x-intercepts in view than listed. */
  moreXIntercepts: boolean;
  symmetry: 'even' | 'odd' | null;
  /** Lowest and highest y-values inside the view (null if nothing is drawn). */
  range: { min: number; max: number } | null;
}

export interface PolarFeatures {
  kind: 'polar';
  /** Greatest |r(θ)| over the drawn angles. */
  maxDistance: number | null;
  /** r(−θ) = r(θ): the curve is symmetric about the x-axis (before any placement). */
  symmetricAboutXAxis: boolean;
}

export type LayerFeatures = CartesianFeatures | PolarFeatures;

const SAMPLES = 801;
const MAX_ROOTS = 6;

const clampDomain = (start: number | null, end: number | null, lo: number, hi: number): [number, number] => [
  Math.max(lo, start ?? -Infinity),
  Math.min(hi, end ?? Infinity),
];

export function layerFeatures(
  layer: GraphLayer,
  parameters: readonly Parameter[],
  view: GraphView,
): LayerFeatures | null {
  const compiled = compileLayer(
    layer,
    parameters.map((p) => p.name),
  );
  if (!compiled.ok) return null;
  const values = parameterValues(parameters);
  const f = (t: number) => valueAt(compiled, t, values);

  if (layer.kind === 'polar') {
    const [a, b] = clampDomain(layer.domain.start, layer.domain.end, 0, 2 * Math.PI);
    if (!(b > a)) return null;
    let maxDistance: number | null = null;
    for (let i = 0; i < SAMPLES; i++) {
      const r = f(a + ((b - a) * i) / (SAMPLES - 1));
      if (Number.isFinite(r)) maxDistance = Math.max(maxDistance ?? 0, Math.abs(r));
    }
    const angles = [0.3, 0.7, 1.1, 1.9, 2.6];
    const symmetricAboutXAxis = angles.every((t) => {
      const [p, q] = [f(t), f(-t)];
      return Number.isFinite(p) && Number.isFinite(q) && Math.abs(p - q) <= 1e-9 * Math.max(1, Math.abs(p));
    });
    return { kind: 'polar', maxDistance, symmetricAboutXAxis };
  }

  const [a, b] = clampDomain(layer.domain.start, layer.domain.end, view.xMin, view.xMax);
  if (!(b > a)) return null;
  const inRange = (y: number) =>
    Number.isFinite(y) &&
    (layer.range.min === null || y >= layer.range.min) &&
    (layer.range.max === null || y <= layer.range.max);

  // y-intercept: only when x = 0 is inside the drawn domain.
  let yIntercept: CartesianFeatures['yIntercept'] = null;
  if (a <= 0 && b >= 0) {
    const y0 = f(0);
    yIntercept = Number.isFinite(y0) ? (inRange(y0) ? y0 : null) : 'undefined';
  }

  // Samples, range in view and x-intercepts.
  const xs = Array.from({ length: SAMPLES }, (_, i) => a + ((b - a) * i) / (SAMPLES - 1));
  const ys = xs.map(f);
  let min = Infinity;
  let max = -Infinity;
  for (const y of ys) {
    if (inRange(y) && y >= view.yMin && y <= view.yMax) {
      min = Math.min(min, y);
      max = Math.max(max, y);
    }
  }
  const scale = Math.max(1, view.yMax - view.yMin);
  const roots: number[] = [];
  const addRoot = (x: number) => {
    if (!roots.some((r) => Math.abs(r - x) < (b - a) / SAMPLES)) roots.push(Math.abs(x) < 1e-9 ? 0 : x);
  };
  for (let i = 0; i < SAMPLES; i++) {
    const y = ys[i] as number;
    if (!Number.isFinite(y)) continue;
    if (y === 0 && inRange(0)) addRoot(xs[i] as number);
    const yNext = ys[i + 1];
    if (i + 1 < SAMPLES && Number.isFinite(yNext) && y * (yNext as number) < 0) {
      let lo = xs[i] as number;
      let hi = xs[i + 1] as number;
      let flo = y;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (!Number.isFinite(fm)) break;
        if (flo * fm <= 0) hi = mid;
        else {
          lo = mid;
          flo = fm;
        }
      }
      const x = (lo + hi) / 2;
      // A true root has a small value there; a jump across an asymptote does not.
      if (Math.abs(f(x)) <= 1e-6 * scale && inRange(0)) addRoot(x);
    }
  }
  roots.sort((p, q) => p - q);

  // Symmetry, tested where both x and −x are drawn.
  const half = Math.min(-a, b);
  let symmetry: CartesianFeatures['symmetry'] = null;
  if (half > 0) {
    const pairs = [0.13, 0.29, 0.41, 0.58, 0.77, 0.93]
      .map((s) => s * half)
      .map((x) => [f(x), f(-x)] as const)
      .filter(([p, q]) => Number.isFinite(p) && Number.isFinite(q));
    const tol = (p: number) => 1e-9 * Math.max(1, Math.abs(p));
    if (pairs.length >= 4) {
      if (pairs.every(([p, q]) => Math.abs(p - q) <= tol(p))) symmetry = 'even';
      else if (pairs.every(([p, q]) => Math.abs(p + q) <= tol(p))) symmetry = 'odd';
    }
  }

  return {
    kind: 'cartesian',
    yIntercept,
    xIntercepts: roots.slice(0, MAX_ROOTS),
    moreXIntercepts: roots.length > MAX_ROOTS,
    symmetry,
    range: Number.isFinite(min) ? { min, max } : null,
  };
}
