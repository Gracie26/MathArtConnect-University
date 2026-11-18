import type { FigureItem, FigureScene, Tick } from '@/lib/figures/scene';
import type { GameFunction } from '@/lib/games/areaWidgets';

/** Highest and lowest value of f on [a, b] (sampled). */
export function rangeOf(fn: GameFunction): { low: number; high: number } {
  let low = Infinity;
  let high = -Infinity;
  for (let k = 0; k <= 300; k++) {
    const y = fn.f(fn.a + ((fn.b - fn.a) * k) / 300);
    if (!Number.isFinite(y)) continue;
    low = Math.min(low, y);
    high = Math.max(high, y);
  }
  return { low, high };
}

/** A scene for f on [a, b] with room around it, the given items, and a and b marked on the axis. */
export function functionScene(
  fn: GameFunction,
  items: FigureItem[],
  options: { aspect?: number; ticks?: Tick[]; showCurve?: boolean; yPad?: number } = {},
): FigureScene {
  const { low, high } = rangeOf(fn);
  const top = Math.max(high, 0);
  const bottom = Math.min(low, 0);
  const span = fn.b - fn.a;
  const pad = (top - bottom || 1) * (options.yPad ?? 0.18);
  return {
    view: { xMin: fn.a - 0.12 * span, xMax: fn.b + 0.08 * span, yMin: bottom - pad, yMax: top + pad },
    aspect: options.aspect ?? 0.62,
    axes: {
      x: true,
      y: true,
      xLabel: 'x',
      yLabel: 'y',
      xTicks: options.ticks ?? [
        { at: fn.a, label: fn.aLabel ?? String(Number(fn.a.toFixed(2))) },
        { at: fn.b, label: fn.bLabel ?? String(Number(fn.b.toFixed(2))) },
      ],
    },
    items: [
      ...items.filter((i) => i.k === 'area' || i.k === 'rect'),
      ...(options.showCurve === false
        ? []
        : [{ k: 'curve', f: fn.f, from: fn.a - 0.05 * span, to: fn.b + 0.05 * span } as FigureItem]),
      ...items.filter((i) => i.k !== 'area' && i.k !== 'rect'),
    ],
  };
}

/** Six significant decimals for readouts. */
export const show = (v: number): string =>
  !Number.isFinite(v)
    ? v > 0
      ? '\\infty'
      : '-\\infty'
    : Math.abs(v) >= 1e5
      ? v.toExponential(3)
      : String(Number(v.toFixed(4)));
