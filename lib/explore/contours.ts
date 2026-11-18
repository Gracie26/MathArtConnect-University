/**
 * Level curves f(x, y) = c by marching squares, for the Topic 4 Explore tools
 * (app-created visualisations). Each level becomes ONE polyline whose
 * separate pieces are joined by non-finite points (the renderer breaks the
 * line there), so a whole contour map is a handful of SVG paths: light enough
 * to redraw while a slider moves on a phone.
 *
 * Pure functions only; nothing here touches React.
 */
import type { FigureItem, StrokeTone } from '@/lib/figures/scene';

const GAP: [number, number] = [Number.NaN, Number.NaN];

/** Where f crosses `level` on the edge from (x1, y1, v1) to (x2, y2, v2). */
function cross(
  x1: number,
  y1: number,
  v1: number,
  x2: number,
  y2: number,
  v2: number,
  level: number,
): [number, number] {
  const t = v1 === v2 ? 0.5 : (level - v1) / (v2 - v1);
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

/**
 * Segments of the curve f = level over the rectangle, from an n × n grid. Cells with a
 * non-finite corner are skipped (the curve stops at the edge of the domain).
 */
export function levelSegments(
  f: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  level: number,
  n = 36,
): [number, number][][] {
  const xs = Array.from({ length: n + 1 }, (_, i) => xRange[0] + ((xRange[1] - xRange[0]) * i) / n);
  const ys = Array.from({ length: n + 1 }, (_, j) => yRange[0] + ((yRange[1] - yRange[0]) * j) / n);
  const v = xs.map((x) => ys.map((y) => f(x, y)));
  const segments: [number, number][][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x0 = xs[i]!;
      const x1 = xs[i + 1]!;
      const y0 = ys[j]!;
      const y1 = ys[j + 1]!;
      const a = v[i]![j]!;
      const b = v[i + 1]![j]!;
      const c = v[i + 1]![j + 1]!;
      const d = v[i]![j + 1]!;
      if (![a, b, c, d].every(Number.isFinite)) continue;
      const points: [number, number][] = [];
      // Edges: bottom (a→b), right (b→c), top (c→d), left (d→a).
      if (a < level !== b < level) points.push(cross(x0, y0, a, x1, y0, b, level));
      if (b < level !== c < level) points.push(cross(x1, y0, b, x1, y1, c, level));
      if (c < level !== d < level) points.push(cross(x1, y1, c, x0, y1, d, level));
      if (d < level !== a < level) points.push(cross(x0, y1, d, x0, y0, a, level));
      if (points.length === 2) segments.push([points[0]!, points[1]!]);
      else if (points.length === 4) {
        // Saddle cell: pair the crossings by the value at the centre.
        const centre = (a + b + c + d) / 4;
        if (centre < level === a < level) {
          segments.push([points[0]!, points[1]!], [points[2]!, points[3]!]);
        } else {
          segments.push([points[0]!, points[3]!], [points[1]!, points[2]!]);
        }
      }
    }
  }
  return segments;
}

/** One polyline item for the level curve f = level (pieces separated by gaps). */
export function levelCurve(
  f: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  level: number,
  options: { n?: number; tone?: StrokeTone; width?: number; dashed?: boolean; opacity?: number } = {},
): FigureItem {
  const points: [number, number][] = [];
  for (const segment of levelSegments(f, xRange, yRange, level, options.n)) points.push(...segment, GAP);
  return {
    k: 'polyline',
    points,
    tone: options.tone ?? 'guide',
    width: options.width ?? 1.2,
    ...(options.dashed ? { dashed: true } : {}),
    ...(options.opacity !== undefined ? { opacity: options.opacity } : {}),
  };
}

/** `count` evenly spaced levels strictly inside the range of f over the rectangle. */
export function contourLevels(
  f: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  count: number,
): number[] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= 30; i++) {
    for (let j = 0; j <= 30; j++) {
      const v = f(xRange[0] + ((xRange[1] - xRange[0]) * i) / 30, yRange[0] + ((yRange[1] - yRange[0]) * j) / 30);
      if (!Number.isFinite(v)) continue;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  if (!Number.isFinite(lo) || hi - lo < 1e-9) return [];
  return Array.from({ length: count }, (_, k) => lo + ((hi - lo) * (k + 1)) / (count + 1));
}
