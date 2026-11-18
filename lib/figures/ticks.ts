/**
 * Readable axis ticks for graphs (Math view). Steps are 1, 2 or 5 × 10ⁿ so the
 * numbers are easy to read; about `target` ticks fit the range. Pure functions.
 */
import type { FigureAxes, FigureScene, Tick } from './scene';

/** A 1, 2 or 5 × 10ⁿ step giving about `target` intervals over the span. */
export function niceStep(span: number, target = 5): number {
  if (!(span > 0) || !Number.isFinite(span)) return 1;
  const raw = span / Math.max(1, target);
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit < 1.5 ? 1 : unit < 3.5 ? 2 : unit < 7.5 ? 5 : 10) * power;
}

/** A tick label: trailing zeros removed, a true minus sign, never "−0". */
export function tickLabel(value: number, step: number): string {
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  const fixed = Number(value.toFixed(decimals));
  if (Object.is(fixed, -0) || fixed === 0) return '0';
  return String(fixed).replace('-', '−');
}

/** Ticks strictly inside (min, max) at multiples of a nice step; 0 is left out (the origin is labelled separately). */
export function niceTicks(min: number, max: number, target = 5): Tick[] {
  const step = niceStep(max - min, target);
  const ticks: Tick[] = [];
  const first = Math.ceil((min + step * 1e-6) / step) * step;
  for (let v = first; v < max - step * 1e-6; v += step) {
    const at = Number(v.toFixed(10));
    if (Math.abs(at) < step * 1e-6) continue;
    ticks.push({ at, label: tickLabel(at, step) });
  }
  return ticks;
}

/** The scene with Math-view axes: numeric ticks on both axes, the origin labelled, and (optionally) a light grid. */
export function withMathAxes(scene: FigureScene, options: { grid?: boolean; target?: number } = {}): FigureScene {
  const { xMin, xMax, yMin, yMax } = scene.view;
  // Fewer y ticks on wide, short panels, so labels never crowd.
  const yTarget = Math.max(3, Math.round((options.target ?? 5) * Math.min(1.2, scene.aspect)));
  const axes: FigureAxes = {
    ...scene.axes,
    x: scene.axes.x !== false,
    y: scene.axes.y !== false,
    origin: true,
    xTicks: niceTicks(xMin, xMax, options.target ?? 5),
    yTicks: niceTicks(yMin, yMax, yTarget),
    grid: options.grid ?? true,
  };
  return { ...scene, axes };
}
