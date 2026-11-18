/**
 * Every figure of the Chapter 2 notes, recreated as scalable scenes:
 * Figures 2.1–2.16 and the unnumbered pair of drawings in §2.1 (17 figures).
 * The notes draw a general function f in Figures 2.1–2.4, 2.5, 2.8, 2.11–2.13
 * and 2.15; those are redrawn with fixed curves of the same shape. Figures
 * 2.6, 2.7, 2.9, 2.10, 2.14 and 2.16 use the exact functions of the notes.
 *
 * Illustrations made for the app (origin "appIllustration") are always
 * labelled as such; they show, for example, left endpoints and midpoints,
 * for which the notes print no figure.
 */
import {
  type FigureItem,
  type FigureScene,
  type FigureSpec,
  riemannRects,
  simpson,
  type Tick,
} from '@/lib/figures/scene';

// -----------------------------------------------------------------------------
// The general curve y = f(x) of Figures 2.1–2.4 (high at a, a dip, a hump, a drop at b)
// -----------------------------------------------------------------------------

const A = 1;
const B = 8;
const N = 9;
const DX = (B - A) / N;
const xAt = (k: number) => A + k * DX;

/** The general curve of Figures 2.1–2.4 (redrawn; the notes give no formula). */
export const generalCurve = (x: number): number =>
  2.75 + 1.7 * Math.exp(-1.25 * (x - 1)) + 1.15 * Math.exp(-(((x - 6.1) / 1.35) ** 2)) - 0.09 * (x - 1);

const generalView = { xMin: -0.7, xMax: 9.1, yMin: -0.85, yMax: 5.1 };
const curve = (f: (x: number) => number, from: number, to: number, extra: Partial<FigureItem> = {}): FigureItem =>
  ({ k: 'curve', f, from, to, ...extra }) as FigureItem;
const label = (
  x: number,
  y: number,
  text: string,
  extra: Partial<Extract<FigureItem, { k: 'label' }>> = {},
): FigureItem => ({
  k: 'label',
  x,
  y,
  text,
  ...extra,
});
const seg = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  extra: Partial<Extract<FigureItem, { k: 'segment' }>> = {},
): FigureItem => ({ k: 'segment', x1, y1, x2, y2, ...extra });

/** Tick labels a, x₁, x₂, x₃, …, xᵢ₋₁, xᵢ, …, xₙ₋₁, b (as in Figures 2.2–2.4). */
const partitionTicks = (withDots: boolean): Tick[] => [
  { at: xAt(0), label: 'a' },
  { at: xAt(1), label: 'x_{1}' },
  { at: xAt(2), label: 'x_{2}' },
  { at: xAt(3), label: 'x_{3}' },
  ...(withDots ? [{ at: xAt(4), label: '…' }] : []),
  { at: xAt(5), label: 'x_{i−1}' },
  { at: xAt(6), label: 'x_{i}' },
  ...(withDots ? [{ at: xAt(7), label: '…' }] : []),
  { at: xAt(8), label: 'x_{n−1}' },
  { at: xAt(9), label: 'b' },
];

const generalAxes = (ticks: Tick[]) => ({ x: true, y: true, xLabel: 'x', yLabel: 'y', origin: true, xTicks: ticks });

/** The ith rectangle's Δx brace (above it) and its height brace (on its right), as in Figures 2.3 and 2.4. */
function rectangleBraces(i: number, height: number, heightLabel: string): FigureItem[] {
  const left = xAt(i - 1);
  const right = xAt(i);
  return [
    { k: 'brace', x1: left, y1: height + 0.14, x2: right, y2: height + 0.14 },
    label((left + right) / 2, height + 0.72, 'Δx'),
    { k: 'brace', x1: right + 0.05, y1: height, x2: right + 0.05, y2: 0.02 },
    label(right + 0.42, height / 2, heightLabel, { anchor: 'start' }),
  ];
}

// -----------------------------------------------------------------------------
// §2.1: the unnumbered pair of drawings
// -----------------------------------------------------------------------------

const sCurve = (x: number) => 1.1 + 1.55 * Math.tanh(0.9 * (x - 3.2)) + 1.4;
const hump = (x: number) => (x - 1.2) * (6.8 - x) * (0.42 + 0.06 * Math.sin(1.4 * x)) * 0.62;

export const FIGURE_2_1_PAIR: FigureSpec = {
  id: 'figure-2-1-pair',
  origin: 'unamFigure',
  description:
    'Two drawings of the area A under a non-negative function y = f(x). Left: A lies between the graph, the x-axis and the vertical lines x = a and x = b (dashed). Right: A lies between the graph and the x-axis, from one x-intercept a to the next x-intercept b.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 6.4, yMin: -0.7, yMax: 5.0 },
      aspect: 0.82,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [
          { at: 2.2, label: 'a' },
          { at: 4.4, label: 'b' },
        ],
      },
      items: [
        { k: 'area', f: sCurve, from: 2.2, to: 4.4 },
        curve(sCurve, 0.6, 5.6, { arrows: 'both' }),
        seg(2.2, 0, 2.2, sCurve(2.2), { tone: 'edge', dashed: true }),
        seg(4.4, 0, 4.4, sCurve(4.4), { tone: 'edge', dashed: true }),
        label(3.2, 1.2, 'A', { italic: true, size: 'large' }),
        label(3.6, 4.6, 'y = f(x)', { italic: true }),
      ],
      caption: '(i) bounded by the vertical lines x = a and x = b',
    },
    {
      view: { xMin: -0.6, xMax: 7.6, yMin: -0.9, yMax: 4.4 },
      aspect: 0.82,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [
          { at: 1.2, label: 'a' },
          { at: 6.8, label: 'b' },
        ],
      },
      items: [
        { k: 'area', f: hump, from: 1.2, to: 6.8 },
        curve(hump, 0.85, 7.1, { arrows: 'both' }),
        label(4.0, 1.2, 'A', { italic: true, size: 'large' }),
        label(4.6, 3.7, 'y = f(x)', { italic: true }),
      ],
      caption: '(ii) bounded by the x-intercepts of the graph',
    },
  ],
};

// -----------------------------------------------------------------------------
// §2.2 Riemann Sums: Figures 2.1–2.4 (and the app's left-endpoint and midpoint drawings)
// -----------------------------------------------------------------------------

export const FIGURE_2_1: FigureSpec = {
  id: 'figure-2-1',
  number: '2.1',
  origin: 'unamFigure',
  description: 'The region S under the curve y = f(x), above the x-axis, between the vertical lines x = a and x = b.',
  panels: [
    {
      view: generalView,
      aspect: 0.62,
      axes: generalAxes([
        { at: A, label: 'a' },
        { at: B, label: 'b' },
      ]),
      items: [
        { k: 'area', f: generalCurve, from: A, to: B },
        curve(generalCurve, A, B),
        seg(A, 0, A, generalCurve(A)),
        seg(B, 0, B, generalCurve(B)),
        label(A - 0.15, 3.0, 'x = a', { anchor: 'end', italic: true }),
        label(B + 0.15, 1.2, 'x = b', { anchor: 'start', italic: true }),
        label(4.6, 1.4, 'S', { italic: true, size: 'large' }),
        label(6.4, 4.2, 'y = f(x)', { italic: true }),
      ],
    },
  ],
};

const strips: FigureItem[] = Array.from({ length: N - 1 }, (_, k) =>
  seg(xAt(k + 1), 0, xAt(k + 1), generalCurve(xAt(k + 1)), { width: 1 }),
);

export const FIGURE_2_2: FigureSpec = {
  id: 'figure-2-2',
  number: '2.2',
  origin: 'unamFigure',
  description:
    'The interval [a, b] divided into n subintervals by the points a = x₀ < x₁ < … < xₙ = b, cutting the region S into strips S₁, S₂, S₃, …, Sᵢ, …, Sₙ.',
  panels: [
    {
      view: generalView,
      aspect: 0.62,
      axes: generalAxes(partitionTicks(true)),
      items: [
        { k: 'area', f: generalCurve, from: A, to: B },
        curve(generalCurve, A, B),
        seg(A, 0, A, generalCurve(A)),
        seg(B, 0, B, generalCurve(B)),
        ...strips,
        label(xAt(0.5), 1.4, 'S_{1}', { italic: true }),
        label(xAt(1.5), 1.4, 'S_{2}', { italic: true }),
        label(xAt(2.5), 1.4, 'S_{3}', { italic: true }),
        label(xAt(5.5), 1.4, 'S_{i}', { italic: true }),
        label(xAt(8.5), 1.4, 'S_{n}', { italic: true }),
        label(6.4, 4.4, 'y = f(x)', { italic: true }),
      ],
    },
  ],
};

const right = riemannRects(generalCurve, A, B, N, 'right');
export const FIGURE_2_3: FigureSpec = {
  id: 'figure-2-3',
  number: '2.3',
  origin: 'unamFigure',
  description:
    'Case I, right endpoints: each strip is replaced by a rectangle of width Δx whose height f(xᵢ) is the value of f at the right endpoint xᵢ of its subinterval, so the top right corner of each rectangle lies on the curve.',
  panels: [
    {
      view: generalView,
      aspect: 0.62,
      axes: generalAxes(partitionTicks(false).filter((t) => t.label !== 'x_{n−1}')),
      items: [
        ...right.rects,
        curve(generalCurve, A, B),
        ...right.points.map((x): FigureItem => ({ k: 'point', x, y: generalCurve(x) })),
        ...rectangleBraces(6, generalCurve(xAt(6)), 'f(x_{i})'),
      ],
    },
  ],
};

const left = riemannRects(generalCurve, A, B, N, 'left');
export const APP_LEFT_ENDPOINTS: FigureSpec = {
  id: 'app-left-endpoints',
  origin: 'appIllustration',
  description:
    'Case II, left endpoints (the notes print no figure for this case): each rectangle has height f(xᵢ₋₁), the value of f at the left endpoint of its subinterval, so the top left corner of each rectangle lies on the curve. Compare with Figure 2.3.',
  panels: [
    {
      view: generalView,
      aspect: 0.62,
      axes: generalAxes(partitionTicks(false).filter((t) => t.label !== 'x_{n−1}')),
      items: [
        ...left.rects,
        curve(generalCurve, A, B),
        ...left.points.map((x): FigureItem => ({ k: 'point', x, y: generalCurve(x) })),
        { k: 'brace', x1: xAt(5), y1: generalCurve(xAt(5)) + 0.14, x2: xAt(6), y2: generalCurve(xAt(5)) + 0.14 },
        label(xAt(5.5), generalCurve(xAt(5)) + 0.72, 'Δx'),
        { k: 'brace', x1: xAt(5) - 0.05, y1: 0.02, x2: xAt(5) - 0.05, y2: generalCurve(xAt(5)) },
        label(xAt(5) - 0.4, generalCurve(xAt(5)) / 2, 'f(x_{i−1})', { anchor: 'end' }),
      ],
    },
  ],
};

const sample = riemannRects(generalCurve, A, B, N, 'sample');
const sampleArrows = (indices: number[], names: string[]): FigureItem[] =>
  indices.flatMap((i, k) => {
    const x = sample.points[i - 1] as number;
    return [
      seg(x, -1.05, x, -0.5, { tone: 'asymptote', arrow: 'end', width: 1.2 }),
      label(x, -1.35, names[k] as string, { tone: 'asymptote' }),
    ];
  });

export const FIGURE_2_4: FigureSpec = {
  id: 'figure-2-4',
  number: '2.4',
  origin: 'unamFigure',
  description:
    'Case III, sample points: in each subinterval [xᵢ₋₁, xᵢ] a sample point xᵢ* is chosen anywhere (dashed lines, arrows below the axis), and the rectangle has height f(xᵢ*), so the curve crosses each rectangle top at its sample point.',
  panels: [
    {
      view: { ...generalView, yMin: -1.55 },
      aspect: 0.7,
      axes: generalAxes(partitionTicks(false)),
      items: [
        ...sample.rects,
        curve(generalCurve, A, B),
        ...sample.points.map((x) => seg(x, 0, x, generalCurve(x), { tone: 'asymptote', dashed: true, width: 1.2 })),
        ...sampleArrows([1, 2, 3, 6, 9], ['x_{1}^{*}', 'x_{2}^{*}', 'x_{3}^{*}', 'x_{i}^{*}', 'x_{n}^{*}']),
        ...rectangleBraces(6, generalCurve(sample.points[5] as number), 'f(x_{i}^{*})'),
      ],
    },
  ],
};

const mid = riemannRects(generalCurve, A, B, N, 'midpoint');
export const APP_MIDPOINTS: FigureSpec = {
  id: 'app-midpoints',
  origin: 'appIllustration',
  description:
    'The Mid-point Rule (the notes print no figure for it): each sample point is the midpoint x̄ᵢ = ½(xᵢ₋₁ + xᵢ) of its subinterval, so the curve crosses the middle of each rectangle top. Part of each rectangle lies above the curve and part below, which is why midpoints usually approximate well.',
  panels: [
    {
      view: generalView,
      aspect: 0.62,
      axes: generalAxes(partitionTicks(false).filter((t) => t.label !== 'x_{n−1}')),
      items: [
        ...mid.rects,
        curve(generalCurve, A, B),
        ...mid.points.map((x) => seg(x, 0, x, generalCurve(x), { tone: 'asymptote', dashed: true, width: 1.2 })),
        ...mid.points.map((x): FigureItem => ({ k: 'point', x, y: generalCurve(x), tone: 'asymptote' })),
        label(mid.points[5] as number, -0.75, 'x̄_{i}', { tone: 'asymptote' }),
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
// §2.2.1 app drawings for the worked examples
// -----------------------------------------------------------------------------

const twoX = (x: number) => 2 * x;
const ex221 = riemannRects(twoX, 0, 1, 5, 'right');
export const APP_EXAMPLE_2_2_1: FigureSpec = {
  id: 'app-example-2-2-1',
  origin: 'appIllustration',
  description:
    'y = 2x on [0, 1] with the right-endpoint rectangles for n = 5 (Δx = 1/5, heights f(i/5) = 2i/5). Their total area is the Riemann sum 1 + 1/n = 1.2; as n grows it approaches the triangle’s area, 1.',
  panels: [
    {
      view: { xMin: -0.18, xMax: 1.25, yMin: -0.32, yMax: 2.3 },
      aspect: 0.75,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [0.2, 0.4, 0.6, 0.8, 1].map((at) => ({ at, label: at === 1 ? '1' : String(at) })),
        yTicks: [
          { at: 1, label: '1' },
          { at: 2, label: '2' },
        ],
      },
      items: [...ex221.rects, curve(twoX, 0, 1.1), label(0.68, 1.85, 'y = 2x', { italic: true })],
    },
  ],
};

const ex222f = (x: number) => (x - 1) ** 2 + 2;
const ex222 = riemannRects(ex222f, -1, 2, 6, 'right');
export const APP_EXAMPLE_2_2_2: FigureSpec = {
  id: 'app-example-2-2-2',
  origin: 'appIllustration',
  description:
    'y = (x − 1)² + 2 on [−1, 2] with the right-endpoint rectangles for n = 6 (Δx = 3/6 = 1/2, xᵢ = −1 + 3i/n). As n → ∞ the sum of their areas tends to the area under the curve, 9.',
  panels: [
    {
      view: { xMin: -1.6, xMax: 2.6, yMin: -0.8, yMax: 6.6 },
      aspect: 0.8,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [
          { at: -1, label: '−1' },
          { at: 1, label: '1' },
          { at: 2, label: '2' },
        ],
        yTicks: [
          { at: 2, label: '2' },
          { at: 6, label: '6' },
        ],
      },
      items: [
        ...ex222.rects,
        curve(ex222f, -1.15, 2.2),
        label(-0.45, 6.25, 'y = (x − 1)^{2} + 2', { italic: true, anchor: 'start' }),
      ],
    },
  ],
};

const ex223 = riemannRects(Math.exp, 0, 2, 4, 'midpoint');
export const APP_EXAMPLE_2_2_3: FigureSpec = {
  id: 'app-example-2-2-3',
  origin: 'appIllustration',
  description:
    'y = eˣ on [0, 2] with the four Mid-point Rule rectangles: subintervals of width Δx = 0.5 and heights e^0.25, e^0.75, e^1.25 and e^1.75 taken at the midpoints 0.25, 0.75, 1.25 and 1.75.',
  panels: [
    {
      view: { xMin: -0.28, xMax: 2.35, yMin: -1.1, yMax: 7.9 },
      aspect: 0.82,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [0.5, 1, 1.5, 2].map((at) => ({ at, label: String(at) })),
        yTicks: [
          { at: 1, label: '1' },
          { at: 4, label: '4' },
          { at: 7, label: '7' },
        ],
      },
      items: [
        ...ex223.rects,
        curve(Math.exp, -0.15, 2.05),
        ...ex223.points.map((x) => seg(x, 0, x, Math.exp(x), { tone: 'asymptote', dashed: true, width: 1.2 })),
        ...ex223.points.map((x): FigureItem => ({ k: 'point', x, y: Math.exp(x), tone: 'asymptote' })),
        ...ex223.points.map((x) => label(x, -0.8, String(x), { size: 'small', tone: 'asymptote' })),
        label(1.55, 7.2, 'y = e^{x}', { italic: true, anchor: 'end' }),
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
// §2.2.2 and §2.3 app drawings
// -----------------------------------------------------------------------------

const C_SPLIT = 4.6;
export const APP_ADDITIVITY: FigureSpec = {
  id: 'app-additivity',
  origin: 'appIllustration',
  description:
    'Theorem 2.2.4 (iii) as areas: for c in [a, b], the area from a to b is the area from a to c plus the area from c to b.',
  panels: [
    {
      view: generalView,
      aspect: 0.62,
      axes: generalAxes([
        { at: A, label: 'a' },
        { at: C_SPLIT, label: 'c' },
        { at: B, label: 'b' },
      ]),
      items: [
        { k: 'area', f: generalCurve, from: A, to: C_SPLIT, tone: 'fill' },
        { k: 'area', f: generalCurve, from: C_SPLIT, to: B, tone: 'fill2' },
        curve(generalCurve, A, B),
        seg(C_SPLIT, 0, C_SPLIT, generalCurve(C_SPLIT), { dashed: true }),
        label(2.8, 1.3, '∫_{a}^{c} f', { italic: true }),
        label(6.3, 1.3, '∫_{c}^{b} f', { italic: true }),
      ],
    },
  ],
};

const lower = (x: number) => 0.9 + 0.5 * Math.sin(0.9 * x) + 0.08 * x;
const upper = (x: number) => lower(x) + 1.1 + 0.25 * Math.cos(1.3 * x);
export const APP_COMPARE_INTEGRALS: FigureSpec = {
  id: 'app-compare-integrals',
  origin: 'appIllustration',
  description:
    'Theorems 2.2.6 and 2.2.7 as areas: when 0 ≤ f(x) ≤ g(x) on [a, b], the region under f (darker) lies inside the region under g, so ∫ f ≤ ∫ g, and both are at least 0.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 8.6, yMin: -0.7, yMax: 4.4 },
      aspect: 0.6,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [
          { at: 1, label: 'a' },
          { at: 7.4, label: 'b' },
        ],
      },
      items: [
        { k: 'area', f: upper, from: 1, to: 7.4, tone: 'fill2' },
        { k: 'area', f: lower, from: 1, to: 7.4, tone: 'fill' },
        curve(upper, 1, 7.4, { tone: 'curve2' }),
        curve(lower, 1, 7.4),
        label(7.6, upper(7.4), 'g', { anchor: 'start', italic: true, tone: 'curve2' }),
        label(7.6, lower(7.4), 'f', { anchor: 'start', italic: true, tone: 'curve' }),
      ],
    },
  ],
};

const identity = (x: number) => x;
export const APP_EXAMPLE_2_3_1: FigureSpec = {
  id: 'app-example-2-3-1',
  origin: 'appIllustration',
  description:
    'The area under y = x from x = 1 to x = 3 is a trapezium of area ½(1 + 3)(2) = 4, the same value the Fundamental Theorem gives.',
  panels: [
    {
      view: { xMin: -0.4, xMax: 3.8, yMin: -0.5, yMax: 3.7 },
      aspect: 0.75,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [1, 2, 3].map((at) => ({ at, label: String(at) })),
        yTicks: [1, 2, 3].map((at) => ({ at, label: String(at) })),
      },
      items: [
        { k: 'area', f: identity, from: 1, to: 3 },
        curve(identity, 0, 3.5),
        seg(1, 0, 1, 1),
        seg(3, 0, 3, 3),
        label(2.2, 0.8, 'area = 4'),
        label(3.45, 3.15, 'y = x', { italic: true, anchor: 'end' }),
      ],
    },
  ],
};

const X_UPPER = 5.2;
export const APP_ACCUMULATION: FigureSpec = {
  id: 'app-accumulation',
  origin: 'appIllustration',
  description:
    'The Second Fundamental Theorem: g(x) = ∫ₐˣ f(t) dt is the area from a up to a moving point x. Moving x a little to the right adds a thin strip of height about f(x), so g changes at the rate f(x): g′(x) = f(x).',
  panels: [
    {
      view: generalView,
      aspect: 0.62,
      axes: {
        x: true,
        y: true,
        xLabel: 't',
        yLabel: 'y',
        origin: true,
        xTicks: [
          { at: A, label: 'a' },
          { at: X_UPPER, label: 'x' },
        ],
      },
      items: [
        { k: 'area', f: generalCurve, from: A, to: X_UPPER, tone: 'fill' },
        { k: 'area', f: generalCurve, from: X_UPPER, to: X_UPPER + 0.35, tone: 'fill2' },
        curve(generalCurve, A, B),
        seg(X_UPPER, 0, X_UPPER, generalCurve(X_UPPER)),
        label(3.0, 1.3, 'g(x)', { italic: true }),
        label(X_UPPER + 0.5, generalCurve(X_UPPER) + 0.55, 'f(x)', { italic: true, anchor: 'start' }),
        label(7.4, 4.3, 'y = f(t)', { italic: true }),
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
// §2.4 Figure 2.5
// -----------------------------------------------------------------------------

const MA = 0.6;
const MB = 3.4;
const sShape = (x: number) => 1.1 + 0.6 * Math.tanh(1.8 * (x - 2.2));
/** f(c): the average value of the curve of Figure 2.5 on [a, b]. */
export const FIGURE_2_5_AVERAGE = simpson(sShape, MA, MB) / (MB - MA);

function mvtPanel(height: number, caption: string, brace: 'min' | 'max' | null): FigureScene {
  const above = (x: number) => Math.max(sShape(x), height);
  const belowCurve = (x: number) => Math.min(sShape(x), height);
  return {
    view: { xMin: -0.55, xMax: 4.6, yMin: -0.38, yMax: 2.05 },
    aspect: 0.62,
    axes: {
      x: true,
      y: false,
      xTicks: [
        { at: MA, label: 'a' },
        { at: MB, label: 'b' },
      ],
    },
    items: [
      { k: 'area', f: belowCurve, from: MA, to: MB, tone: 'fill3' },
      { k: 'area', f: above, base: () => height, from: MA, to: MB, tone: 'fill' },
      { k: 'area', f: () => height, base: belowCurve, from: MA, to: MB, tone: 'fill2' },
      { k: 'rect', x0: MA, x1: MB, height, outlineOnly: true },
      curve(sShape, MA - 0.35, MB),
      label(MA - 0.32, sShape(MA - 0.35) + 0.22, 'f', { italic: true }),
      ...(brace === 'min'
        ? [
            { k: 'brace', x1: MA - 0.06, y1: 0.02, x2: MA - 0.06, y2: height } as FigureItem,
            label(MA - 0.32, height / 2, 'f(m)', { anchor: 'end' }),
          ]
        : brace === 'max'
          ? [
              { k: 'brace', x1: MB + 0.06, y1: height, x2: MB + 0.06, y2: 0.02 } as FigureItem,
              label(MB + 0.3, height / 2, 'f(M)', { anchor: 'start' }),
            ]
          : []),
    ],
    caption,
  };
}

export const FIGURE_2_5: FigureSpec = {
  id: 'figure-2-5',
  number: '2.5',
  origin: 'unamFigure',
  caption: 'Figure 2.5: $f(m)$ and $f(M)$ represent the minimum and maximum values of $f$ on $[a, b]$.',
  description:
    'Three rectangles on [a, b] under an increasing curve f. The inscribed rectangle of height f(m) lies inside the region (less than the actual area); the circumscribed rectangle of height f(M) contains it (greater than the actual area); the mean value rectangle in between has exactly the area under the curve: the part of the region above it (shaded) balances the part of the rectangle above the curve.',
  panels: [
    mvtPanel(sShape(MA), 'Inscribed rectangle (less than actual area)', 'min'),
    mvtPanel(FIGURE_2_5_AVERAGE, 'Mean value rectangle (equal to actual area)', null),
    mvtPanel(sShape(MB), 'Circumscribed rectangle (greater than actual area)', 'max'),
  ],
};

// -----------------------------------------------------------------------------
// §2.5.1 TYPE I: Figures 2.6–2.10
// -----------------------------------------------------------------------------

const inverseSquare = (x: number) => 1 / (x * x);
const reciprocal = (x: number) => 1 / x;

export const FIGURE_2_6: FigureSpec = {
  id: 'figure-2-6',
  number: '2.6',
  origin: 'unamFigure',
  description:
    'The part of the region under y = 1/x² between x = 1 and a vertical line x = t is shaded; its area is 1 − 1/t.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 7.2, yMin: -0.32, yMax: 2.35 },
      aspect: 0.62,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [
          { at: 1, label: '1' },
          { at: 5, label: 't' },
        ],
      },
      items: [
        { k: 'area', f: inverseSquare, from: 1, to: 5 },
        curve(inverseSquare, 0.66, 7.1),
        seg(1, 0, 1, 1),
        seg(5, 0, 5, inverseSquare(5)),
        label(0.88, 0.62, 'x = 1', { anchor: 'end', italic: true }),
        label(1.15, 2.05, 'y = 1/x^{2}', { anchor: 'start', italic: true }),
        label(3.1, 1.05, 'area = 1 − 1/t', { anchor: 'start' }),
        seg(3.05, 0.9, 1.9, 0.14, { tone: 'text', arrow: 'end', width: 1.1 }),
      ],
    },
  ],
};

const typeOnePanel = (t: number | null, area: string): FigureScene => ({
  view: { xMin: -0.5, xMax: 6.2, yMin: -0.28, yMax: 1.7 },
  aspect: 0.66,
  axes: {
    x: true,
    y: true,
    xLabel: 'x',
    yLabel: 'y',
    origin: true,
    xTicks: [{ at: 1, label: '1' }, ...(t ? [{ at: t, label: String(t) }] : [])],
  },
  items: [
    { k: 'area', f: inverseSquare, from: 1, to: t ?? 6.2 },
    curve(inverseSquare, 0.78, 6.15),
    seg(1, 0, 1, 1),
    ...(t ? [seg(t, 0, t, inverseSquare(t))] : []),
    label(3.0, 1.0, area, { anchor: 'start' }),
    seg(2.95, 0.9, 1.85, 0.12, { tone: 'text', arrow: 'end', width: 1 }),
  ],
});

export const FIGURE_2_7: FigureSpec = {
  id: 'figure-2-7',
  number: '2.7',
  origin: 'unamFigure',
  description:
    'Four drawings of the area under y = 1/x² from x = 1: up to t = 2 the area is ½, up to t = 3 it is ⅔, up to t = 5 it is ⅘, and over the whole infinite region it is 1.',
  panels: [
    typeOnePanel(2, 'area = ½'),
    typeOnePanel(3, 'area = ⅔'),
    typeOnePanel(5, 'area = ⅘'),
    typeOnePanel(null, 'area = 1'),
  ],
};

const decaying = (x: number) => 0.3 + 2.0 * Math.exp(-0.32 * (x - 1)) * (1 + 0.22 * Math.sin(1.7 * (x - 1) + 0.4));
export const FIGURE_2_8: FigureSpec = {
  id: 'figure-2-8',
  number: '2.8',
  origin: 'unamFigure',
  description:
    'The infinite region S = {(x, y) | x ≥ a, 0 ≤ y ≤ f(x)} under a positive function y = f(x), from x = a and continuing without end to the right.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 11, yMin: -0.35, yMax: 2.9 },
      aspect: 0.5,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y', origin: true, xTicks: [{ at: 1, label: 'a' }] },
      items: [
        { k: 'area', f: decaying, from: 1, to: 11 },
        curve(decaying, 1, 11),
        seg(1, 0, 1, decaying(1)),
        label(3.6, 0.6, 'S', { italic: true, size: 'large' }),
        label(5.2, 1.5, 'y = f(x)', { italic: true, anchor: 'start' }),
      ],
    },
  ],
};

const typeOneCompare = (f: (x: number) => number, formula: string, words: string): FigureScene => ({
  view: { xMin: -0.6, xMax: 7.2, yMin: -0.3, yMax: 2.4 },
  aspect: 0.72,
  axes: { x: true, y: true, xLabel: 'x', yLabel: 'y', origin: true, xTicks: [{ at: 1, label: '1' }] },
  items: [
    { k: 'area', f, from: 1, to: 7.2 },
    curve(f, 0.42, 7.2),
    seg(1, 0, 1, 1),
    label(1.15, 2.1, formula, { anchor: 'start', italic: true }),
    label(3.4, 0.62, words, { anchor: 'start' }),
  ],
});

export const FIGURE_2_9: FigureSpec = {
  id: 'figure-2-9',
  number: '2.9',
  origin: 'unamFigure',
  description: 'The region under y = 1/x² to the right of x = 1 is shaded: it has finite area.',
  panels: [typeOneCompare(inverseSquare, 'y = 1/x^{2}', 'finite area')],
};

export const FIGURE_2_10: FigureSpec = {
  id: 'figure-2-10',
  number: '2.10',
  origin: 'unamFigure',
  description: 'The region under y = 1/x to the right of x = 1 is shaded: it has infinite area.',
  panels: [typeOneCompare(reciprocal, 'y = 1/x', 'infinite area')],
};

// -----------------------------------------------------------------------------
// §2.5.2 TYPE II: Figures 2.11–2.14
// -----------------------------------------------------------------------------

const towardsB = (x: number) => 1.9 + 0.7 * Math.sin(1.05 * (x - 1) + 0.9) + 0.35 / (7 - x);
export const FIGURE_2_11: FigureSpec = {
  id: 'figure-2-11',
  number: '2.11',
  origin: 'unamFigure',
  description:
    'A positive function y = f(x) on [a, b) with a vertical asymptote x = b (blue). The region under it extends without end vertically; the part between a and t, just before b, is shaded.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 8.2, yMin: -0.55, yMax: 5.4 },
      aspect: 0.66,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [
          { at: 1, label: 'a' },
          { at: 6.65, label: 't' },
          { at: 7.12, label: 'b' },
        ],
      },
      items: [
        { k: 'area', f: towardsB, from: 1, to: 6.65 },
        curve(towardsB, 1, 6.985),
        seg(1, 0, 1, towardsB(1)),
        seg(6.65, 0, 6.65, towardsB(6.65)),
        seg(7, 0, 7, 5.4, { tone: 'asymptote', width: 2 }),
        label(7.25, 3.6, 'x = b', { anchor: 'start', italic: true, tone: 'asymptote' }),
        label(3.6, 3.4, 'y = f(x)', { italic: true }),
      ],
    },
  ],
};

const fromA = (x: number) => 1.15 + 0.3 / (x - 1) + 0.75 * Math.exp(-(((x - 5) / 1.1) ** 2));
const aroundC = (x: number) => 0.75 + 0.5 / Math.abs(x - 4) ** 0.8 + 0.05 * x;

export const FIGURE_2_12: FigureSpec = {
  id: 'figure-2-12',
  number: '2.12',
  origin: 'unamFigure',
  description:
    'Definition 2.5.3: f(x) ≥ 0 has a vertical asymptote at the left endpoint x = a (blue). The region from t, just after a, to b is shaded.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 8.2, yMin: -0.55, yMax: 4.6 },
      aspect: 0.7,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [
          { at: 0.96, label: 'a' },
          { at: 1.38, label: 't' },
          { at: 7, label: 'b' },
        ],
      },
      items: [
        { k: 'area', f: fromA, from: 1.25, to: 7 },
        curve(fromA, 1.07, 7),
        seg(1.25, 0, 1.25, fromA(1.25)),
        seg(7, 0, 7, fromA(7)),
        seg(1, 0, 1, 4.6, { tone: 'asymptote', width: 2 }),
      ],
    },
  ],
};

export const FIGURE_2_13: FigureSpec = {
  id: 'figure-2-13',
  number: '2.13',
  origin: 'unamFigure',
  description:
    'Definition 2.5.4: f(x) ≥ 0 has a vertical asymptote at an interior point x = c of [a, b] (blue). The whole region from a to b, on both sides of c, is shaded.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 8.2, yMin: -0.55, yMax: 4.6 },
      aspect: 0.7,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [
          { at: 1, label: 'a' },
          { at: 4, label: 'c' },
          { at: 7, label: 'b' },
        ],
      },
      items: [
        { k: 'area', f: aroundC, from: 1, to: 3.995 },
        { k: 'area', f: aroundC, from: 4.005, to: 7 },
        curve(aroundC, 1, 3.995),
        curve(aroundC, 4.005, 7),
        seg(1, 0, 1, aroundC(1)),
        seg(7, 0, 7, aroundC(7)),
        seg(4, 0, 4, 4.6, { tone: 'asymptote', width: 2 }),
      ],
    },
  ],
};

const rootRecip = (x: number) => 1 / Math.sqrt(x - 2);
export const FIGURE_2_14: FigureSpec = {
  id: 'figure-2-14',
  number: '2.14',
  origin: 'unamFigure',
  description:
    'The region under y = 1/√(x − 2) from x = 2 to x = 5 is shaded. The line x = 2 (blue) is a vertical asymptote, yet the shaded area is finite: area = 2√3.',
  panels: [
    {
      view: { xMin: -0.35, xMax: 6.4, yMin: -0.55, yMax: 3.7 },
      aspect: 0.66,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        origin: true,
        xTicks: [1, 2, 3, 4, 5].map((at) => ({ at, label: String(at) })),
      },
      items: [
        { k: 'area', f: rootRecip, from: 2.0004, to: 5 },
        curve(rootRecip, 2.075, 6.3),
        seg(5, 0, 5, rootRecip(5)),
        seg(2, 0, 2, 3.7, { tone: 'asymptote', width: 2 }),
        label(2.5, 3.05, 'y = 1/√(x − 2)', { anchor: 'start', italic: true }),
        label(3.5, 0.3, 'area = 2√3'),
      ],
    },
  ],
};

// -----------------------------------------------------------------------------
// §2.5.3 Figures 2.15 and 2.16
// -----------------------------------------------------------------------------

const upperF = (x: number) => 0.45 + 2.4 * Math.exp(-0.42 * (x - 1));
const lowerG = (x: number) => 0.12 + 1.55 * (x - 0.25) * Math.exp(-0.62 * (x - 1));
export const FIGURE_2_15: FigureSpec = {
  id: 'figure-2-15',
  number: '2.15',
  origin: 'unamFigure',
  description:
    'Two continuous functions with f(x) ≥ g(x) ≥ 0 for x ≥ a: the curve f (blue) lies above the curve g. The region under g is inside the region under f, so if the area under f is finite, so is the area under g; if the area under g is infinite, so is the area under f.',
  panels: [
    {
      view: { xMin: -0.6, xMax: 9.6, yMin: -0.35, yMax: 3.3 },
      aspect: 0.6,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y', origin: true, xTicks: [{ at: 1, label: 'a' }] },
      items: [
        { k: 'area', f: upperF, base: lowerG, from: 1, to: 9.5, tone: 'fill2' },
        { k: 'area', f: lowerG, from: 1, to: 9.5, tone: 'fill' },
        curve(upperF, 1, 9.5, { tone: 'curve2' }),
        curve(lowerG, 1, 9.5),
        seg(1, 0, 1, upperF(1)),
        label(3.9, upperF(3.4) + 0.18, 'f', { italic: true, size: 'large', tone: 'curve2' }),
        label(2.0, lowerG(2.0) - 0.42, 'g', { italic: true, size: 'large', tone: 'curve' }),
      ],
    },
  ],
};

const gauss = (x: number) => Math.exp(-x * x);
const expDecay = (x: number) => Math.exp(-x);
export const FIGURE_2_16: FigureSpec = {
  id: 'figure-2-16',
  number: '2.16',
  origin: 'unamFigure',
  description:
    'The curves y = e^(−x²) and y = e^(−x) cross at x = 1. For x ≥ 1 the curve y = e^(−x²) lies below y = e^(−x), which is the comparison used in Example 2.5.3.',
  panels: [
    {
      view: { xMin: -0.25, xMax: 3.3, yMin: -0.16, yMax: 1.22 },
      aspect: 0.66,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y', origin: true, xTicks: [{ at: 1, label: '1' }] },
      items: [
        curve(expDecay, 0, 3.2, { tone: 'curve2' }),
        curve(gauss, 0, 3.2),
        { k: 'point', x: 1, y: Math.exp(-1), tone: 'text' },
        label(1.0, 0.98, 'y = e^{−x^{2}}', { anchor: 'start', italic: true, tone: 'curve' }),
        label(0.12, 0.42, 'y = e^{−x}', { anchor: 'start', italic: true, tone: 'curve2' }),
      ],
    },
  ],
};

/** The 17 figures of the notes, by inventory id. */
export const CHAPTER2_FIGURES: Readonly<Record<string, FigureSpec>> = {
  'ch2-2.1-figure': FIGURE_2_1_PAIR,
  'ch2-fig-2.1': FIGURE_2_1,
  'ch2-fig-2.2': FIGURE_2_2,
  'ch2-fig-2.3': FIGURE_2_3,
  'ch2-fig-2.4': FIGURE_2_4,
  'ch2-fig-2.5': FIGURE_2_5,
  'ch2-fig-2.6': FIGURE_2_6,
  'ch2-fig-2.7': FIGURE_2_7,
  'ch2-fig-2.8': FIGURE_2_8,
  'ch2-fig-2.9': FIGURE_2_9,
  'ch2-fig-2.10': FIGURE_2_10,
  'ch2-fig-2.11': FIGURE_2_11,
  'ch2-fig-2.12': FIGURE_2_12,
  'ch2-fig-2.13': FIGURE_2_13,
  'ch2-fig-2.14': FIGURE_2_14,
  'ch2-fig-2.15': FIGURE_2_15,
  'ch2-fig-2.16': FIGURE_2_16,
};
