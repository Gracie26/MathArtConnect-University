/**
 * Numerical critical points and the Second Partials Test (Theorem 4.3.3), for
 * the Topic 4 Explore tools and the Landscape Designer studio. These are
 * app-created visualisations: the points are found numerically (Newton's
 * method from a grid of starting points) and classified with d computed by
 * central differences, then labelled with words, never by colour alone.
 *
 * Pure functions only; nothing here touches React.
 */

export type CriticalType = 'min' | 'max' | 'saddle' | 'inconclusive';

export interface FoundCritical {
  x: number;
  y: number;
  fxx: number;
  fyy: number;
  fxy: number;
  d: number;
  type: CriticalType;
}

type F2 = (x: number, y: number) => number;

const H = 1e-4;

export const partialX = (f: F2, x: number, y: number): number => (f(x + H, y) - f(x - H, y)) / (2 * H);
export const partialY = (f: F2, x: number, y: number): number => (f(x, y + H) - f(x, y - H)) / (2 * H);

/** Second partial derivatives by central differences. */
export function secondPartials(f: F2, x: number, y: number): { fxx: number; fyy: number; fxy: number } {
  const h = 1e-3;
  const c = f(x, y);
  return {
    fxx: (f(x + h, y) - 2 * c + f(x - h, y)) / (h * h),
    fyy: (f(x, y + h) - 2 * c + f(x, y - h)) / (h * h),
    fxy: (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h),
  };
}

/** Theorem 4.3.3, with a small tolerance on d = 0 for numerical values. */
export function classify(fxx: number, d: number, scale = 1): CriticalType {
  const eps = 1e-6 * Math.max(1, scale);
  if (d > eps) return fxx > 0 ? 'min' : 'max';
  if (d < -eps) return 'saddle';
  return 'inconclusive';
}

export const TYPE_LABEL: Record<CriticalType, string> = {
  min: 'relative minimum',
  max: 'relative maximum',
  saddle: 'saddle point',
  inconclusive: 'test inconclusive',
};

/** The critical point (with fx = fy = 0) and its classification, or null if Newton does not settle. */
function newton(f: F2, x0: number, y0: number, box: [number, number, number, number]): FoundCritical | null {
  let x = x0;
  let y = y0;
  for (let k = 0; k < 40; k++) {
    const gx = partialX(f, x, y);
    const gy = partialY(f, x, y);
    if (!Number.isFinite(gx) || !Number.isFinite(gy)) return null;
    const { fxx, fyy, fxy } = secondPartials(f, x, y);
    const det = fxx * fyy - fxy * fxy;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
    const dx = (fyy * gx - fxy * gy) / det;
    const dy = (fxx * gy - fxy * gx) / det;
    x -= dx;
    y -= dy;
    if (x < box[0] || x > box[1] || y < box[2] || y > box[3]) return null;
    if (Math.hypot(dx, dy) < 1e-10) break;
  }
  if (Math.hypot(partialX(f, x, y), partialY(f, x, y)) > 1e-6) return null;
  const { fxx, fyy, fxy } = secondPartials(f, x, y);
  const d = fxx * fyy - fxy * fxy;
  return { x, y, fxx, fyy, fxy, d, type: classify(fxx, d, Math.abs(fxx * fyy) + fxy * fxy) };
}

/**
 * Critical points with fx = fy = 0 inside the rectangle (isolated, non-degenerate ones),
 * found from a grid of starting points and de-duplicated.
 */
export function findCriticalPoints(
  f: F2,
  xRange: [number, number],
  yRange: [number, number],
  seeds = 9,
): FoundCritical[] {
  const box: [number, number, number, number] = [xRange[0], xRange[1], yRange[0], yRange[1]];
  const found: FoundCritical[] = [];
  const tol = 1e-4 * Math.max(1, xRange[1] - xRange[0], yRange[1] - yRange[0]);
  for (let i = 0; i <= seeds; i++) {
    for (let j = 0; j <= seeds; j++) {
      const p = newton(
        f,
        xRange[0] + ((xRange[1] - xRange[0]) * (i + 0.5)) / (seeds + 1),
        yRange[0] + ((yRange[1] - yRange[0]) * (j + 0.5)) / (seeds + 1),
        box,
      );
      if (p && !found.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < tol)) found.push(p);
    }
  }
  return found.sort((a, b) => a.x - b.x || a.y - b.y);
}
