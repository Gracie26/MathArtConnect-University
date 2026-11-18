/**
 * Figures for Topic 5.
 *
 * Figures 5.1–5.3 are the notes' own figures, redrawn with their labels and
 * captions exactly as printed (including "y²" on the y-axis of Figure 5.2 and
 * the captions "Fig 1" and "Fig 2"; MR5-02, MR5-03). Next to each, a drawing
 * made for the app (origin "appIllustration", always labelled so) shows the
 * same region in Math View: numbered axes, a light grid, every boundary
 * labelled with its equation and the intersection points with coordinates.
 * Sections 5.2–5.4 print no figures; their drawings are made for the app.
 */
import type { FigureItem, FigureScene, FigureSpec } from '@/lib/figures/scene';
import { withMathAxes } from '@/lib/figures/ticks';

const label = (
  x: number,
  y: number,
  text: string,
  options: { anchor?: 'start' | 'middle' | 'end'; italic?: boolean; size?: 'small' | 'normal' | 'large' } = {},
): FigureItem => ({ k: 'label', x, y, text, ...options });
const seg = (x1: number, y1: number, x2: number, y2: number, dashed = false, width?: number): FigureItem => ({
  k: 'segment',
  x1,
  y1,
  x2,
  y2,
  ...(dashed ? { dashed: true, tone: 'guide' as const } : { tone: 'edge' as const }),
  ...(width ? { width } : {}),
});
const point = (x: number, y: number): FigureItem => ({ k: 'point', x, y, tone: 'text' });

// -----------------------------------------------------------------------------
// Figure 5.1 (Example 5.1.2): 1 ≤ x ≤ 2, 1 ≤ y ≤ x
// -----------------------------------------------------------------------------

const triangleGrid: FigureItem[] = [
  ...[1.2, 1.4, 1.6, 1.8].map((x) => seg(x, 1, x, x, false, 0.8)),
  ...[1.2, 1.4, 1.6, 1.8].map((y) => seg(y, y, 2, y, false, 0.8)),
];

export const FIGURE_5_1: FigureSpec = {
  id: 'figure-5-1',
  number: '5.1',
  origin: 'unamFigure',
  caption: 'The region of integration',
  description:
    'The triangular region between the line y = x, the line y = 1 and the line x = 2, labelled 1 ≤ x ≤ 2 and 1 ≤ y ≤ x, drawn with a grid of small rectangles.',
  panels: [
    {
      view: { xMin: -0.3, xMax: 2.7, yMin: -0.3, yMax: 2.7 },
      aspect: 1,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [
          { at: 1, label: '1' },
          { at: 2, label: '2' },
        ],
        yTicks: [
          { at: 1, label: '1' },
          { at: 2, label: '2' },
        ],
      },
      items: [
        {
          k: 'polygon',
          points: [
            [1, 1],
            [2, 1],
            [2, 2],
          ],
          tone: 'fill',
          opacity: 0.6,
        },
        ...triangleGrid,
        seg(0, 0, 2.55, 2.55),
        seg(0, 2, 2, 2, true),
        seg(0, 1, 1, 1, true),
        seg(1, 0, 1, 1, true),
        seg(2, 0, 2, 1, true),
        label(2.45, 2.25, 'y = x', { anchor: 'end', italic: true }),
        label(1.35, 2.5, '1 ≤ x ≤ 2', { anchor: 'middle', italic: true, size: 'small' }),
        label(1.35, 2.3, '1 ≤ y ≤ x', { anchor: 'middle', italic: true, size: 'small' }),
      ],
    },
  ],
};

/** Example 5.1.2's region in Math View (made for the app). */
export const REGION_5_1_2_MATH: FigureSpec = {
  id: 'region-5-1-2-math',
  origin: 'appIllustration',
  description:
    'Math View of the region 1 ≤ x ≤ 2, 1 ≤ y ≤ x: numbered axes, the line y = x, the corners (1, 1), (2, 1) and (2, 2), and a vertical strip at x = 1.6 running from y = 1 to y = 1.6.',
  panels: [
    withMathAxes({
      view: { xMin: -0.25, xMax: 2.6, yMin: -0.25, yMax: 2.6 },
      aspect: 1,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
      items: [
        {
          k: 'polygon',
          points: [
            [1, 1],
            [2, 1],
            [2, 2],
          ],
          tone: 'fill',
          opacity: 0.55,
          outline: 'edge',
        },
        { k: 'curve', f: (x) => x, from: 0, to: 2.5, tone: 'curve' },
        { k: 'rect', x0: 1.55, x1: 1.65, y0: 1, height: 1.6, tone: 'fill2' },
        point(1, 1),
        point(2, 1),
        point(2, 2),
        label(0.95, 1.12, '(1, 1)', { anchor: 'end', size: 'small' }),
        label(2.05, 0.85, '(2, 1)', { anchor: 'start', size: 'small' }),
        label(2.05, 2.08, '(2, 2)', { anchor: 'start', size: 'small' }),
        label(2.45, 2.25, 'y = x', { anchor: 'end', italic: true, size: 'small' }),
        label(1.6, 0.62, 'inner: 1 ≤ y ≤ x', { anchor: 'middle', italic: true, size: 'small' }),
        label(1.6, 0.4, 'outer: 1 ≤ x ≤ 2', { anchor: 'middle', italic: true, size: 'small' }),
      ],
    }),
  ],
};

// -----------------------------------------------------------------------------
// Figures 5.2 and 5.3 (Example 5.1.3): x = y² (y = √x), x = 4, y = 0
// -----------------------------------------------------------------------------

const sqrt = (x: number) => Math.sqrt(Math.max(0, x));

export const FIGURE_5_2: FigureSpec = {
  id: 'figure-5-2',
  number: '5.2',
  origin: 'unamFigure',
  caption: 'Fig 1',
  description:
    'The curve x = y² rising from the origin, the line x = 4 (dashed, marked 4 on the x-axis) and a dashed line at the top of the region, marked y² on the y-axis as printed. A horizontal strip of height Δy runs from the curve to x = 4.',
  panels: [
    {
      view: { xMin: -0.4, xMax: 5.6, yMin: -0.35, yMax: 2.9 },
      aspect: 0.62,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [{ at: 4, label: '4' }],
        yTicks: [{ at: 2, label: 'y^{2}' }],
      },
      items: [
        { k: 'curve', f: sqrt, from: 0, to: 4, tone: 'edge' },
        { k: 'curve', f: sqrt, from: 4, to: 5.5, tone: 'guide', dashed: true },
        seg(0, 2, 4, 2, true),
        seg(4, 0, 4, 2, true),
        { k: 'rect', x0: 1.15 * 1.15, x1: 4, y0: 1.05, height: 1.25, tone: 'fill3' },
        label(4.4, 1.08, 'Δy', { anchor: 'start', italic: true }),
      ],
    },
  ],
};

export const FIGURE_5_3: FigureSpec = {
  id: 'figure-5-3',
  number: '5.3',
  origin: 'unamFigure',
  caption: 'Fig 2',
  description:
    'The curve y = √x rising from the origin, with a vertical strip of width Δx standing on the x-axis and reaching up to the curve.',
  panels: [
    {
      view: { xMin: -0.4, xMax: 6.2, yMin: -0.35, yMax: 2.9 },
      aspect: 0.62,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
      items: [
        { k: 'curve', f: sqrt, from: 0, to: 5.8, tone: 'edge' },
        { k: 'rect', x0: 2.0, x1: 2.3, height: sqrt(2.0), tone: 'fill3' },
        label(2.15, -0.28, 'Δx', { anchor: 'middle', italic: true }),
        label(5.9, 2.55, 'y = √x', { anchor: 'end', italic: true }),
      ],
    },
  ],
};

function region513(strip: 'horizontal' | 'vertical'): FigureScene {
  const items: FigureItem[] = [
    { k: 'area', f: sqrt, from: 0, to: 4, tone: 'fill' },
    { k: 'curve', f: sqrt, from: 0, to: 4.6, tone: 'curve' },
    seg(4, 0, 4, 2),
    point(0, 0),
    point(4, 0),
    point(4, 2),
    label(-0.1, 0.18, '(0, 0)', { anchor: 'end', size: 'small' }),
    label(4.1, -0.32, '(4, 0)', { anchor: 'start', size: 'small' }),
    label(4.1, 2.12, '(4, 2)', { anchor: 'start', size: 'small' }),
    label(2.3, 1.85, 'x = y^{2} (y = √x)', { anchor: 'end', italic: true, size: 'small' }),
    label(4.12, 1.0, 'x = 4', { anchor: 'start', italic: true, size: 'small' }),
  ];
  if (strip === 'horizontal') {
    items.push(
      { k: 'rect', x0: 1.1 * 1.1, x1: 4, y0: 1.0, height: 1.2, tone: 'fill2' },
      label(2.6, 1.32, 'y^{2} ≤ x ≤ 4', { anchor: 'middle', italic: true, size: 'small' }),
    );
  } else {
    items.push(
      { k: 'rect', x0: 2.2, x1: 2.45, height: sqrt(2.3), tone: 'fill2' },
      label(2.32, 1.72, '0 ≤ y ≤ √x', { anchor: 'middle', italic: true, size: 'small' }),
    );
  }
  return withMathAxes({
    view: { xMin: -0.6, xMax: 5.4, yMin: -0.5, yMax: 2.6 },
    aspect: 0.62,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
    items,
    caption:
      strip === 'horizontal'
        ? 'Horizontal strip: order dx dy, outer 0 ≤ y ≤ 2'
        : 'Vertical strip: order dy dx, outer 0 ≤ x ≤ 4',
  });
}

/** Example 5.1.3's region in Math View, with a strip in each direction (made for the app). */
export const REGION_5_1_3_MATH: FigureSpec = {
  id: 'region-5-1-3-math',
  origin: 'appIllustration',
  description:
    'Math View of the region of Example 5.1.3, bounded by x = y² (that is, y = √x), x = 4 and the x-axis, with corners (0, 0), (4, 0) and (4, 2). Left: a horizontal strip from x = y² to x = 4 (order dx dy, 0 ≤ y ≤ 2). Right: a vertical strip from y = 0 to y = √x (order dy dx, 0 ≤ x ≤ 4).',
  panels: [region513('horizontal'), region513('vertical')],
};

// -----------------------------------------------------------------------------
// §5.2.1 (no figure in the notes): the base region of Example 5.2.1
// -----------------------------------------------------------------------------

export const BASE_5_2_1_MATH: FigureSpec = {
  id: 'base-5-2-1-math',
  origin: 'appIllustration',
  description:
    'Math View of the base R of the solid in Example 5.2.1: the triangle in the xy-plane bounded by y = 0, y = x and x = 1, with corners (0, 0), (1, 0) and (1, 1). Above each point (x, y) of R the solid reaches the height z = e^(−x²).',
  panels: [
    withMathAxes({
      view: { xMin: -0.2, xMax: 1.35, yMin: -0.2, yMax: 1.25 },
      aspect: 0.92,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
      items: [
        {
          k: 'polygon',
          points: [
            [0, 0],
            [1, 0],
            [1, 1],
          ],
          tone: 'fill',
          opacity: 0.55,
          outline: 'edge',
        },
        { k: 'rect', x0: 0.6, x1: 0.66, y0: 0, height: 0.63, tone: 'fill2' },
        point(0, 0),
        point(1, 0),
        point(1, 1),
        label(1.05, 1.06, '(1, 1)', { anchor: 'start', size: 'small' }),
        label(1.05, -0.12, '(1, 0)', { anchor: 'start', size: 'small' }),
        label(0.45, 0.6, 'y = x', { anchor: 'end', italic: true, size: 'small' }),
        label(1.05, 0.5, 'x = 1', { anchor: 'start', italic: true, size: 'small' }),
        label(0.63, 0.8, 'height z = e^{−x²}', { anchor: 'middle', italic: true, size: 'small' }),
      ],
      caption: 'Order dy dx: 0 ≤ y ≤ x, 0 ≤ x ≤ 1',
    }),
  ],
};

// -----------------------------------------------------------------------------
// §5.4.1 (no figure in the notes): S and R of Example 5.4.2
// -----------------------------------------------------------------------------

const xOf = (u: number, v: number) => (2 * u + v) / 3;
const yOf = (u: number, v: number) => (u - v) / 3;

export const REGIONS_5_4_2_MATH: FigureSpec = {
  id: 'regions-5-4-2-math',
  origin: 'appIllustration',
  description:
    'Example 5.4.2 drawn for the app. Left: the rectangle S in the uv-plane, 1 ≤ u ≤ 4 and −4 ≤ v ≤ 0. Right: its image R in the xy-plane, the parallelogram bounded by x + y = 1, x + y = 4, x − 2y = 0 and x − 2y = −4, under x = (2u + v)/3, y = (u − v)/3. Matching cells are shaded in both.',
  panels: [
    withMathAxes({
      view: { xMin: -0.6, xMax: 5, yMin: -5, yMax: 0.8 },
      aspect: 1.1,
      axes: { x: true, y: true, xLabel: 'u', yLabel: 'v' },
      items: [
        {
          k: 'polygon',
          points: [
            [1, -4],
            [4, -4],
            [4, 0],
            [1, 0],
          ],
          tone: 'fill',
          opacity: 0.5,
          outline: 'edge',
        },
        {
          k: 'polygon',
          points: [
            [2, -2],
            [3, -2],
            [3, -1],
            [2, -1],
          ],
          tone: 'fill2',
          opacity: 0.9,
          outline: 'edge',
        },
        label(2.5, -4.55, 'S: 1 ≤ u ≤ 4, −4 ≤ v ≤ 0', { anchor: 'middle', italic: true, size: 'small' }),
      ],
      caption: 'S in the uv-plane',
    }),
    withMathAxes({
      view: { xMin: -1.2, xMax: 3.6, yMin: -0.4, yMax: 3.4 },
      aspect: 1.1,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
      items: [
        {
          k: 'polygon',
          points: [
            [xOf(1, -4), yOf(1, -4)],
            [xOf(4, -4), yOf(4, -4)],
            [xOf(4, 0), yOf(4, 0)],
            [xOf(1, 0), yOf(1, 0)],
          ],
          tone: 'fill',
          opacity: 0.5,
          outline: 'edge',
        },
        {
          k: 'polygon',
          points: [
            [xOf(2, -2), yOf(2, -2)],
            [xOf(3, -2), yOf(3, -2)],
            [xOf(3, -1), yOf(3, -1)],
            [xOf(2, -1), yOf(2, -1)],
          ],
          tone: 'fill2',
          opacity: 0.9,
          outline: 'edge',
        },
        label(1.3, 3.05, 'x − 2y = −4', { anchor: 'end', italic: true, size: 'small' }),
        label(2.95, 0.6, 'x − 2y = 0', { anchor: 'start', italic: true, size: 'small' }),
        label(-0.6, 1.0, 'x + y = 1', { anchor: 'middle', italic: true, size: 'small' }),
        label(3.15, 1.75, 'x + y = 4', { anchor: 'start', italic: true, size: 'small' }),
      ],
      caption: 'R in the xy-plane',
    }),
  ],
};
