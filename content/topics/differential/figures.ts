/**
 * Chapter 3 figures as data (drawn by components/figures/MathFigure.tsx).
 *
 * The notes print exactly two figures, both tree diagrams in §3.4:
 *   Figure 3.1 "Chain rule: one independent variable" (page 49)
 *   Figure 3.2 "Chain Rule: Two independent variables" (page 51)
 * They are redrawn as printed: circled nodes, the same layout (including the
 * repeated t and s leaves) and every edge label as a stacked fraction.
 *
 * Chapter 3 has no printed graphs or domain sketches. Any other drawing here
 * is an app illustration (origin "appIllustration"), which the app labels
 * "Illustration made for the app".
 */
import type { FigureItem, FigureScene, FigureSpec } from '@/lib/figures/scene';

const NODE_R = 0.55;

/** A straight edge between two node circles, trimmed so it starts and ends on the circles. */
function edge(a: [number, number], b: [number, number]): FigureItem {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy);
  const [ux, uy] = [dx / len, dy / len];
  return {
    k: 'segment',
    x1: a[0] + ux * NODE_R,
    y1: a[1] + uy * NODE_R,
    x2: b[0] - ux * NODE_R,
    y2: b[1] - uy * NODE_R,
    tone: 'edge',
    width: 1.2,
  };
}

const node = (p: [number, number], text: string): FigureItem => ({ k: 'node', x: p[0], y: p[1], r: NODE_R, text });
const frac = (x: number, y: number, num: string, den: string): FigureItem => ({ k: 'fraction', x, y, num, den });

/** Equal units on both axes (aspect = height / width of the view) so circles stay round on the edges. */
const treeScene = (items: FigureItem[], width: number, height: number): FigureScene => ({
  view: { xMin: 0, xMax: width, yMin: 0, yMax: height },
  aspect: height / width,
  axes: { x: false, y: false },
  items,
});

// Figure 3.1 (page 49): w → x, y; x → t; y → t.
const F1 = { w: [4.6, 7.4], x: [2.2, 4.4], y: [7.4, 4.8], tx: [2.2, 1.2], ty: [7.4, 1.6] } as const satisfies Record<
  string,
  [number, number]
>;

export const FIGURE_3_1: FigureSpec = {
  id: 'ch3-fig-3.1',
  number: '3.1',
  origin: 'unamFigure',
  caption: 'Chain rule: one independent variable',
  description:
    'A tree diagram. At the top is w. Two branches lead down from w: one to x, labelled ∂w/∂x, and one to y, labelled ∂w/∂y. From x a branch labelled dx/dt leads down to t, and from y a branch labelled dy/dt leads down to t.',
  panels: [
    treeScene(
      [
        edge(F1.w, F1.x),
        edge(F1.w, F1.y),
        edge(F1.x, F1.tx),
        edge(F1.y, F1.ty),
        node(F1.w, 'w'),
        node(F1.x, 'x'),
        node(F1.y, 'y'),
        node(F1.tx, 't'),
        node(F1.ty, 't'),
        frac(1.9, 6.9, '∂w', '∂x'),
        frac(6.6, 7.6, '∂w', '∂y'),
        frac(1.1, 2.8, 'dx', 'dt'),
        frac(8.6, 3.2, 'dy', 'dt'),
      ],
      10,
      8.4,
    ),
  ],
};

// Figure 3.2 (page 51): w → x, y; x → t, s; y → t, s.
const F2 = {
  w: [5.2, 8.6],
  x: [2.8, 5.8],
  y: [7.8, 6.2],
  xt: [1.4, 2.4],
  xs: [4.2, 2.4],
  yt: [6.8, 2.4],
  ys: [9.4, 2.0],
} as const satisfies Record<string, [number, number]>;

export const FIGURE_3_2: FigureSpec = {
  id: 'ch3-fig-3.2',
  number: '3.2',
  origin: 'unamFigure',
  caption: 'Chain Rule: Two independent variables',
  description:
    'A tree diagram. At the top is w, with branches to x (labelled ∂w/∂x) and to y (labelled ∂w/∂y). From x, branches lead to t (labelled ∂x/∂t) and to s (labelled ∂x/∂s). From y, branches lead to t (labelled ∂y/∂t) and to s (labelled ∂y/∂s).',
  panels: [
    treeScene(
      [
        edge(F2.w, F2.x),
        edge(F2.w, F2.y),
        edge(F2.x, F2.xt),
        edge(F2.x, F2.xs),
        edge(F2.y, F2.yt),
        edge(F2.y, F2.ys),
        node(F2.w, 'w'),
        node(F2.x, 'x'),
        node(F2.y, 'y'),
        node(F2.xt, 't'),
        node(F2.xs, 's'),
        node(F2.yt, 't'),
        node(F2.ys, 's'),
        frac(3.3, 7.9, '∂w', '∂x'),
        frac(7.2, 8.6, '∂w', '∂y'),
        frac(1.1, 4.3, '∂x', '∂t'),
        frac(4.3, 4.3, '∂x', '∂s'),
        frac(6.4, 4.4, '∂y', '∂t'),
        frac(9.9, 4.4, '∂y', '∂s'),
      ],
      10.6,
      9.6,
    ),
  ],
};

/** Every printed Chapter 3 figure, by inventory id. */
export const CHAPTER3_FIGURES: Readonly<Record<string, FigureSpec>> = {
  'ch3-fig-3.1': FIGURE_3_1,
  'ch3-fig-3.2': FIGURE_3_2,
};

// -----------------------------------------------------------------------------
// App illustrations (not printed in the notes)
// -----------------------------------------------------------------------------

const R = 3;
const circleTop = (x: number) => Math.sqrt(Math.max(0, R * R - x * x));
const BOX = 4.6;

/** Example 3.1.1(i): the domain x ≠ 0 and x² + y² ≥ 9, on or outside the circle, without the y-axis. */
export const APP_DOMAIN_3_1_1: FigureSpec = {
  id: 'app-domain-3.1.1',
  origin: 'appIllustration',
  caption: 'The domain of f in Example 3.1.1(i)',
  description:
    'The xy-plane with the circle x² + y² = 9 drawn solid. Every point on or outside the circle is shaded, except the points on the y-axis (x = 0), which is drawn dashed because those points are not in the domain.',
  panels: [
    {
      view: { xMin: -BOX, xMax: BOX, yMin: -BOX, yMax: BOX },
      aspect: 1,
      axes: {
        x: true,
        y: false,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [
          { at: R, label: '3' },
          { at: -R, label: '−3' },
        ],
      },
      items: [
        { k: 'area', f: () => BOX, base: circleTop, from: -R, to: R, tone: 'fill2' },
        { k: 'area', f: (x) => -circleTop(x), base: () => -BOX, from: -R, to: R, tone: 'fill2' },
        { k: 'rect', x0: -BOX, x1: -R, y0: -BOX, height: BOX, tone: 'fill2' },
        { k: 'rect', x0: R, x1: BOX, y0: -BOX, height: BOX, tone: 'fill2' },
        { k: 'curve', f: circleTop, from: -R, to: R },
        { k: 'curve', f: (x) => -circleTop(x), from: -R, to: R },
        { k: 'segment', x1: 0, y1: -BOX, x2: 0, y2: BOX, tone: 'asymptote', dashed: true },
        { k: 'label', x: 0.25, y: BOX - 0.45, text: 'x = 0 excluded', size: 'small', anchor: 'start' },
        { k: 'label', x: 2.2, y: 2.75, text: 'x^{2} + y^{2} = 9', size: 'small', anchor: 'start' },
        { k: 'label', x: 0, y: 0.6, text: 'not in the domain', size: 'small', anchor: 'middle' },
      ],
    },
  ],
};
