/**
 * Mathematical figures as data.
 *
 * A figure from the course notes is recreated as a scene: curves, shaded
 * regions, rectangles, lines, braces and labels in mathematical coordinates.
 * components/figures/MathFigure.tsx draws a scene with SVG at any width, so
 * figures scale with the screen and follow the theme (light, dark, high
 * contrast). Scenes are pure data plus plain functions; nothing here touches
 * React.
 */

export type Fn = (x: number) => number;

export interface FigureView {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Colour roles, mapped to theme colours by the renderer. */
export type StrokeTone = 'curve' | 'curve2' | 'edge' | 'asymptote' | 'guide' | 'text';
export type FillTone = 'fill' | 'fill2' | 'fill3';

export type FigureItem =
  /** y = f(x) on [from, to]. Values that are not finite or far off the view break the curve. */
  | {
      k: 'curve';
      f: Fn;
      from: number;
      to: number;
      tone?: StrokeTone;
      dashed?: boolean;
      arrows?: 'start' | 'end' | 'both';
    }
  /** The region between y = f(x) and y = base(x) (default the x-axis) for from ≤ x ≤ to. */
  | { k: 'area'; f: Fn; base?: Fn; from: number; to: number; tone?: FillTone }
  /** A rectangle standing on the x-axis: [x0, x1] × [0, height] (or [y0, height]). */
  | { k: 'rect'; x0: number; x1: number; height: number; y0?: number; tone?: FillTone; outlineOnly?: boolean }
  | {
      k: 'segment';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      tone?: StrokeTone;
      dashed?: boolean;
      arrow?: 'start' | 'end' | 'both';
      width?: number;
    }
  /**
   * Text placed at (x, y). `_{…}` and `^{…}` give subscripts and superscripts,
   * e.g. "x_{i−1}" or "x_{1}^{*}".
   */
  | {
      k: 'label';
      x: number;
      y: number;
      text: string;
      anchor?: 'start' | 'middle' | 'end';
      size?: 'small' | 'normal' | 'large';
      tone?: StrokeTone;
      italic?: boolean;
    }
  /** A curly brace from (x1, y1) to (x2, y2), bulging to the left of the direction of travel. */
  | { k: 'brace'; x1: number; y1: number; x2: number; y2: number }
  | { k: 'point'; x: number; y: number; tone?: StrokeTone }
  /** A circle (radius in figure units on the x scale) with a centred label: a node of a tree diagram. */
  | { k: 'node'; x: number; y: number; r: number; text: string }
  /**
   * A stacked fraction label centred at (x, y), e.g. ∂w over ∂x on an edge of a
   * chain-rule tree. `num` and `den` use the same `_{…}` / `^{…}` runs as labels.
   */
  | { k: 'fraction'; x: number; y: number; num: string; den: string }
  /** Straight segments through the points (e.g. a projected surface grid line); breaks at non-finite points. */
  | { k: 'polyline'; points: [number, number][]; tone?: StrokeTone; width?: number; dashed?: boolean; opacity?: number }
  /** A filled polygon (e.g. one face of a projected surface), optionally outlined. */
  | { k: 'polygon'; points: [number, number][]; tone?: FillTone; opacity?: number; outline?: StrokeTone }
  /**
   * Many filled polygons with one colour, drawn as a single path (e.g. every cell of a domain
   * band). Far cheaper on phones than one polygon item per cell.
   */
  | { k: 'polygons'; polys: [number, number][][]; tone?: FillTone; opacity?: number };

export interface Tick {
  at: number;
  label: string;
}

export interface FigureAxes {
  /** Draw the x-axis (y = 0) and the y-axis (x = 0) when they are in view. */
  x?: boolean;
  y?: boolean;
  xLabel?: string;
  yLabel?: string;
  /** Label the origin "0". */
  origin?: boolean;
  xTicks?: Tick[];
  yTicks?: Tick[];
  /**
   * Light grid lines at every tick (Math view). When an axis is outside the view, its tick
   * labels are drawn along the nearest edge instead, so the numbers never disappear.
   */
  grid?: boolean;
}

export interface FigureScene {
  view: FigureView;
  /** Height as a fraction of the width. */
  aspect: number;
  axes: FigureAxes;
  items: FigureItem[];
  /** Words under this panel, e.g. "Inscribed rectangle (less than actual area)". */
  caption?: string;
}

/**
 * One figure: a numbered figure from the notes, an unnumbered drawing from
 * the notes, or an illustration made for the app (always labelled as such).
 */
export interface FigureSpec {
  id: string;
  /** Number as printed, e.g. "2.3". Absent for an unnumbered drawing. */
  number?: string;
  origin: 'unamFigure' | 'appIllustration';
  /** Caption printed with the figure (if any). */
  caption?: string;
  /** What the figure shows, for screen readers and as a short description. */
  description: string;
  /** Panels drawn side by side when there is room, stacked on narrow screens. */
  panels: FigureScene[];
}

export type RiemannRule = 'right' | 'left' | 'midpoint' | 'sample';

/**
 * Where the height of the ith rectangle is taken: the right endpoint xᵢ, the
 * left endpoint xᵢ₋₁, the midpoint x̄ᵢ, or a sample point xᵢ* at a given
 * fraction of the way across the subinterval.
 */
export function samplePoint(a: number, dx: number, i: number, rule: RiemannRule, fraction = 0.5): number {
  const left = a + (i - 1) * dx;
  switch (rule) {
    case 'right':
      return left + dx;
    case 'left':
      return left;
    case 'midpoint':
      return left + dx / 2;
    case 'sample':
      return left + fraction * dx;
  }
}

/** Sample-point fractions used when no fraction is given: varied, as in Figure 2.4. */
export const VARIED_FRACTIONS = [0.15, 0.62, 0.38, 0.85, 0.5, 0.25, 0.7, 0.45, 0.9, 0.3];

/** The n approximating rectangles for f on [a, b] with the given rule. */
export function riemannRects(
  f: Fn,
  a: number,
  b: number,
  n: number,
  rule: RiemannRule,
  options: { tone?: FillTone; fractions?: readonly number[] } = {},
): { rects: FigureItem[]; points: number[] } {
  const dx = (b - a) / n;
  const fractions = options.fractions ?? VARIED_FRACTIONS;
  const rects: FigureItem[] = [];
  const points: number[] = [];
  for (let i = 1; i <= n; i++) {
    const x = samplePoint(a, dx, i, rule, fractions[(i - 1) % fractions.length]);
    points.push(x);
    rects.push({ k: 'rect', x0: a + (i - 1) * dx, x1: a + i * dx, height: f(x), tone: options.tone ?? 'fill' });
  }
  return { rects, points };
}

/** The Riemann sum Σ f(xᵢ*)Δx for the given rule. */
export function riemannSum(f: Fn, a: number, b: number, n: number, rule: RiemannRule, fraction = 0.5): number {
  const dx = (b - a) / n;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += f(samplePoint(a, dx, i, rule, fraction)) * dx;
  return sum;
}

/** Composite Simpson's rule on [a, b] with an even number of intervals (a numerical check, not a method from the notes). */
export function simpson(f: Fn, a: number, b: number, intervals = 2000): number {
  const n = intervals % 2 === 0 ? intervals : intervals + 1;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return (sum * h) / 3;
}

/** Splits a label such as "x_{i−1}" or "x_{1}^{*}" into plain, subscript and superscript runs. */
export function labelRuns(text: string): { text: string; script: 'none' | 'sub' | 'sup' }[] {
  const runs: { text: string; script: 'none' | 'sub' | 'sup' }[] = [];
  const pattern = /([_^])\{([^}]*)\}/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > last) runs.push({ text: text.slice(last, match.index), script: 'none' });
    runs.push({ text: match[2] ?? '', script: match[1] === '_' ? 'sub' : 'sup' });
    last = match.index + match[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), script: 'none' });
  return runs;
}

/** The label as plain readable text (for tests and screen readers): "x_{i−1}" → "x i−1". */
export const labelPlain = (text: string): string =>
  labelRuns(text)
    .map((r) => (r.script === 'none' ? r.text : ` ${r.text}`))
    .join('')
    .trim();
