/**
 * Explore tools for Topic 3 (Differential Calculus in ℝⁿ), one per subtopic.
 *
 * Every lab is built on a worked example of the notes and opens on the
 * example's own numbers, so what the learner sees matches the lesson. 3D
 * views are orthographic projections of real surfaces (lib/explore/rn.ts),
 * drawn as shaded wireframes; slices and the slopes of slices are computed
 * from the same formulas. Tangent planes belong to Topic 4 and are not used. Functions that are not in the notes are
 * labelled "Illustration made for the app".
 */
import { useRef, useState } from 'react';
import { View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  type Box3,
  type Camera,
  compileFn,
  curve2,
  DEFAULT_CAMERA,
  domainCells,
  fmt,
  path2,
  rangeOf,
  spaceCurve,
  spacePoint,
  spaceSegment,
  surfaceScene,
} from '@/lib/explore/rn';
import type { FigureItem, FigureScene } from '@/lib/figures/scene';
import { withMathAxes } from '@/lib/figures/ticks';

import { Insight, LabCard, LiveScene, Readout } from '../area/AreaParts';
import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from '../ExploreScaffold';

/** Records the visit as explored once the learner has made `needed` distinct changes. */
function useChanges(complete: (detail: Record<string, string | number | boolean>) => Promise<void>, needed = 3) {
  const seen = useRef(new Set<string>());
  return (key: string) => {
    seen.current.add(key);
    if (seen.current.size >= needed) void complete({ changes: seen.current.size });
  };
}

/** A note under a function that is not in the course notes. */
function AppMade() {
  return (
    <AppText variant="small" color="textSecondary">
      Illustration made for the app (not from the course notes).
    </AppText>
  );
}

/** Turn the 3D view. */
function TurnSlider({ camera, onChange }: { camera: Camera; onChange: (c: Camera) => void }) {
  const degrees = Math.round((camera.azimuth * 180) / Math.PI);
  return (
    <Slider
      label="Turn the view"
      value={degrees}
      min={-170}
      max={170}
      step={5}
      onChange={(v) => onChange({ ...camera, azimuth: (v * Math.PI) / 180 })}
      valueText={`${degrees}°`}
    />
  );
}

/** Lowest and highest finite values of f over the rectangle, padded, within [floor, ceiling]. */
function zRange(
  f: (x: number, y: number) => number,
  x: [number, number],
  y: [number, number],
  limits: [number, number] = [-1e3, 1e3],
): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= 24; i++) {
    for (let j = 0; j <= 24; j++) {
      const v = f(x[0] + ((x[1] - x[0]) * i) / 24, y[0] + ((y[1] - y[0]) * j) / 24);
      if (!Number.isFinite(v)) continue;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  if (!Number.isFinite(lo)) return [-1, 1];
  lo = Math.max(lo, limits[0]);
  hi = Math.min(hi, limits[1]);
  const pad = Math.max(0.1, 0.08 * (hi - lo));
  return [lo - pad, hi + pad];
}

/** A 2D panel for a graph of one variable, with the given items. */
function plane(x: [number, number], y: [number, number], items: FigureItem[], labels: [string, string]): FigureScene {
  const sx = x[1] - x[0];
  const sy = y[1] - y[0];
  return withMathAxes({
    view: { xMin: x[0] - 0.06 * sx, xMax: x[1] + 0.06 * sx, yMin: y[0] - 0.06 * sy, yMax: y[1] + 0.06 * sy },
    aspect: 0.62,
    axes: { x: true, y: true, xLabel: labels[0], yLabel: labels[1] },
    items,
  });
}

/** The tangent line to g at t0 with slope m, across [from, to]. */
const tangent = (g0: number, t0: number, m: number, from: number, to: number): FigureItem => ({
  k: 'segment',
  x1: from,
  y1: g0 + m * (from - t0),
  x2: to,
  y2: g0 + m * (to - t0),
  tone: 'asymptote',
  width: 2,
});

// -----------------------------------------------------------------------------
// 1. Domain and Surface Explorer (§3.1, Example 3.1.1)
// -----------------------------------------------------------------------------

interface DomainFunction {
  id: string;
  label: string;
  tex: string;
  text: string;
  x: [number, number];
  y: [number, number];
  z: [number, number];
  domainTex: string;
  fromNotes: boolean;
}

const DOMAIN_FUNCTIONS: DomainFunction[] = [
  {
    id: 'ex311',
    label: 'Example 3.1.1(i)',
    tex: 'f(x, y) = \\frac{\\sqrt{x^{2} + y^{2} - 9}}{x}',
    text: 'sqrt(x^2 + y^2 - 9)/x',
    x: [-5, 5],
    y: [-5, 5],
    z: [-3, 3],
    domainTex: 'x^{2} + y^{2} \\geq 9, \\quad x \\neq 0',
    fromNotes: true,
  },
  {
    id: 'cap',
    label: 'A cap',
    tex: 'f(x, y) = \\sqrt{4 - x^{2} - y^{2}}',
    text: 'sqrt(4 - x^2 - y^2)',
    x: [-2.6, 2.6],
    y: [-2.6, 2.6],
    z: [-0.2, 2.4],
    domainTex: 'x^{2} + y^{2} \\leq 4',
    fromNotes: false,
  },
  {
    id: 'log',
    label: 'A logarithm',
    tex: 'f(x, y) = \\ln(y - x^{2})',
    text: 'ln(y - x^2)',
    x: [-2, 2],
    y: [-1, 3],
    z: [-3, 1.5],
    domainTex: 'y > x^{2}',
    fromNotes: false,
  },
];

export function DomainExplorer({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [fnId, setFnId] = useState('ex311');
  const fn = DOMAIN_FUNCTIONS.find((f) => f.id === fnId) ?? DOMAIN_FUNCTIONS[0]!;
  const [a, setA] = useState(4);
  const [b, setB] = useState(2);
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const F = compileFn(fn.text, ['x', 'y']);
  const f = (x: number, y: number) => F.value({ x, y });
  const value = f(a, b);
  const defined = Number.isFinite(value);
  const box: Box3 = { x: fn.x, y: fn.y, z: fn.z };

  const domain = withMathAxes({
    view: { xMin: fn.x[0], xMax: fn.x[1], yMin: fn.y[0], yMax: fn.y[1] },
    aspect: (fn.y[1] - fn.y[0]) / (fn.x[1] - fn.x[0]),
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
    items: [...domainCells(f, fn.x, fn.y), { k: 'point', x: a, y: b, tone: defined ? 'curve' : 'asymptote' }],
  });
  const surface = surfaceScene(f, box, camera, defined ? spacePoint([a, b, value], box, camera) : []);

  return (
    <ExploreScaffold
      activity={activity}
      intro="The domain of $f(x, y)$ is the set of points where the formula is defined (§3.1). The shaded region is the domain; the surface $z = f(x, y)$ exists only above it."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {DOMAIN_FUNCTIONS.map((d) => (
          <ChipButton
            key={d.id}
            label={d.label}
            selected={d.id === fnId}
            onPress={() => {
              setFnId(d.id);
              setA((d.x[0] + d.x[1]) / 2 + 0.3 * (d.x[1] - d.x[0]));
              setB((d.y[0] + d.y[1]) / 2 + 0.1 * (d.y[1] - d.y[0]));
              changed(`fn-${d.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        {fn.fromNotes ? null : <AppMade />}
        <AppText variant="caption" color="textSecondary">
          The domain in the xy-plane
        </AppText>
        <LiveScene
          scene={domain}
          description={`The domain of ${fn.label} is shaded; the point (${fmt(a)}, ${fmt(b)}) is marked.`}
        />
        <Slider
          label="x"
          value={a}
          min={fn.x[0]}
          max={fn.x[1]}
          step={0.1}
          onChange={(v) => {
            setA(v);
            changed('move-x');
          }}
          valueText={`x = ${fmt(a)}`}
        />
        <Slider
          label="y"
          value={b}
          min={fn.y[0]}
          max={fn.y[1]}
          step={0.1}
          onChange={(v) => {
            setB(v);
            changed('move-y');
          }}
          valueText={`y = ${fmt(b)}`}
        />
        <Readout
          rows={[
            ['Domain', fn.domainTex],
            [
              'At the point',
              defined ? `f(${fmt(a)}, ${fmt(b)}) = ${fmt(value)}` : `f(${fmt(a)}, ${fmt(b)}) \\text{ is not defined}`,
            ],
          ]}
        />
      </LabCard>
      <LabCard>
        <AppText variant="caption" color="textSecondary">
          The surface z = f(x, y) above the domain
        </AppText>
        <LiveScene scene={surface} description={`The surface of ${fn.label} over its domain, seen from the side.`} />
        <TurnSlider
          camera={camera}
          onChange={(c) => {
            setCamera(c);
            changed('turn');
          }}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text="Move the point off the shaded region: the formula gives no real value there, and there is no surface above it. The domain is a region of the plane, not an interval."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 2. Slices and Partial Derivatives (§3.2.1, Examples 3.2.1 and 3.2.2)
// -----------------------------------------------------------------------------

interface SliceFunction {
  id: string;
  label: string;
  tex: string;
  text: string;
  x: [number, number];
  y: [number, number];
  start: [number, number];
  derivativesTex: string;
}

const SLICE_FUNCTIONS: SliceFunction[] = [
  {
    id: 'ex322',
    label: 'Example 3.2.2',
    tex: 'f(x, y) = xe^{x^{2}y}',
    text: 'x e^(x^2 y)',
    x: [0, 1.5],
    y: [-0.5, 1],
    start: [1, Math.LN2],
    derivativesTex: 'f_{x}(1, \\ln 2) = 4\\ln 2 + 2, \\quad f_{y}(1, \\ln 2) = 2',
  },
  {
    id: 'ex321',
    label: 'Example 3.2.1',
    tex: 'f(x, y) = 3x - x^{2}y^{2} + 2x^{3}y',
    text: '3x - x^2 y^2 + 2x^3 y',
    x: [-1.5, 1.5],
    y: [-1.5, 1.5],
    start: [1, 0.5],
    derivativesTex: 'f_{x} = 3 - 2xy^{2} + 6x^{2}y, \\quad f_{y} = -2x^{2}y + 2x^{3}',
  },
];

export function SliceLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [fnId, setFnId] = useState('ex322');
  const fn = SLICE_FUNCTIONS.find((f) => f.id === fnId) ?? SLICE_FUNCTIONS[0]!;
  const [[a, b], setPoint] = useState<[number, number]>(fn.start);
  const [direction, setDirection] = useState<'x' | 'y'>('x');
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const F = compileFn(fn.text, ['x', 'y']);
  const f = (x: number, y: number) => F.value({ x, y });
  const box: Box3 = { x: fn.x, y: fn.y, z: zRange(f, fn.x, fn.y) };
  const p = { x: a, y: b };
  const z0 = f(a, b);
  const fx = F.d(p, 'x');
  const fy = F.d(p, 'y');
  const slope = direction === 'x' ? fx : fy;
  const [t0, t1] = direction === 'x' ? fn.x : fn.y;
  const g = (t: number) => (direction === 'x' ? f(t, b) : f(a, t));
  const at = direction === 'x' ? a : b;

  const slice = spaceCurve(
    (s) => {
      const t = t0 + (t1 - t0) * s;
      return direction === 'x' ? [t, b, f(t, b)] : [a, t, f(a, t)];
    },
    box,
    camera,
  );
  const half = 0.25 * (t1 - t0);
  const tangent3: FigureItem =
    direction === 'x'
      ? spaceSegment([a - half, b, z0 - slope * half], [a + half, b, z0 + slope * half], box, camera, {
          tone: 'asymptote',
          width: 2.2,
        })
      : spaceSegment([a, b - half, z0 - slope * half], [a, b + half, z0 + slope * half], box, camera, {
          tone: 'asymptote',
          width: 2.2,
        });
  const surface = surfaceScene(f, box, camera, [slice, tangent3, ...spacePoint([a, b, z0], box, camera)], {
    opacity: 0.6,
  });
  const yr = rangeOf(g, t0, t1);
  const graph = plane(
    [t0, t1],
    yr,
    [curve2(g, t0, t1, yr), tangent(z0, at, slope, t0, t1), { k: 'point', x: at, y: z0, tone: 'asymptote' }],
    [direction, 'z'],
  );
  const held = direction === 'x' ? `y = ${fmt(b)}` : `x = ${fmt(a)}`;

  return (
    <ExploreScaffold
      activity={activity}
      intro="To find $f_{x}$, hold $y$ constant (§3.2.1). Geometrically, the plane $y = b$ slices the surface in a curve, and $f_{x}(a, b)$ is the slope of that curve at $x = a$."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {SLICE_FUNCTIONS.map((s) => (
          <ChipButton
            key={s.id}
            label={s.label}
            selected={s.id === fnId}
            onPress={() => {
              setFnId(s.id);
              setPoint(s.start);
              changed(`fn-${s.id}`);
            }}
          />
        ))}
      </ChipRow>
      <ChipRow>
        <ChipButton
          label="Hold y constant: f_x"
          accessibilityLabel="Hold y constant and find f x"
          selected={direction === 'x'}
          onPress={() => {
            setDirection('x');
            changed('dir-x');
          }}
        />
        <ChipButton
          label="Hold x constant: f_y"
          accessibilityLabel="Hold x constant and find f y"
          selected={direction === 'y'}
          onPress={() => {
            setDirection('y');
            changed('dir-y');
          }}
        />
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        <LiveScene
          scene={surface}
          description={`The surface with the slice ${held} and its tangent line at the point (${fmt(a)}, ${fmt(b)}).`}
        />
        <TurnSlider
          camera={camera}
          onChange={(c) => {
            setCamera(c);
            changed('turn');
          }}
        />
      </LabCard>
      <LabCard>
        <AppText variant="caption" color="textSecondary">
          {`The slice ${held}: a curve of one variable`}
        </AppText>
        <LiveScene
          scene={graph}
          description={`The curve of the slice ${held}, with its tangent line of slope ${fmt(slope)}.`}
        />
        <Slider
          label="a (x-coordinate)"
          value={a}
          min={fn.x[0]}
          max={fn.x[1]}
          step={0.05}
          onChange={(v) => {
            setPoint([v, b]);
            changed('move-a');
          }}
          valueText={`a = ${fmt(a)}`}
        />
        <Slider
          label="b (y-coordinate)"
          value={b}
          min={fn.y[0]}
          max={fn.y[1]}
          step={0.05}
          onChange={(v) => {
            setPoint([a, v]);
            changed('move-b');
          }}
          valueText={`b = ${fmt(b)}`}
        />
        <Readout
          rows={[
            ['f(a, b)', fmt(z0)],
            ['Slope of the slice in x', `f_{x}(a, b) = ${fmt(fx)}`],
            ['Slope of the slice in y', `f_{y}(a, b) = ${fmt(fy)}`],
            [`From ${fn.label}`, fn.derivativesTex],
          ]}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text="Each slice is an ordinary curve of one variable, so its slope is an ordinary derivative. Switching between $f_{x}$ and $f_{y}$ changes which slice you look at, not the surface."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 3. One Variable at a Time (§3.2.2, Example 3.2.3)
// -----------------------------------------------------------------------------

const THREE_FUNCTIONS = [
  {
    id: 'i',
    label: 'Example 3.2.3(i)',
    tex: 'f(x, y, z) = xy + yz^{2} + xz',
    text: 'xy + y z^2 + xz',
  },
  {
    id: 'ii',
    label: 'Example 3.2.3(ii)',
    tex: 'f(x, y, z) = z\\sin(xy^{2} + 2z)',
    text: 'z sin(x y^2 + 2z)',
  },
] as const;

export function OneVariableLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [fnId, setFnId] = useState<'i' | 'ii'>('i');
  const fn = THREE_FUNCTIONS.find((f) => f.id === fnId) ?? THREE_FUNCTIONS[0];
  const [moving, setMoving] = useState<'x' | 'y' | 'z'>('z');
  const [p, setP] = useState({ x: 1, y: 1, z: 1 });
  const F = compileFn(fn.text, ['x', 'y', 'z']);
  const g = (t: number) => F.value({ ...p, [moving]: t });
  const at = p[moving];
  const slope = F.d(p, moving);
  const yr = rangeOf(g, -2, 2);
  const graph = plane(
    [-2, 2],
    yr,
    [curve2(g, -2, 2, yr), tangent(g(at), at, slope, -2, 2), { k: 'point', x: at, y: g(at), tone: 'asymptote' }],
    [moving, 'f'],
  );
  const fixed = (['x', 'y', 'z'] as const).filter((v) => v !== moving);

  return (
    <ExploreScaffold
      activity={activity}
      intro="For a function of three variables, $\frac{\partial f}{\partial z}$ is found by holding $x$ and $y$ constant (§3.2.2). Choose which variable moves; the other two stay at the values you set."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {THREE_FUNCTIONS.map((t) => (
          <ChipButton
            key={t.id}
            label={t.label}
            selected={t.id === fnId}
            onPress={() => {
              setFnId(t.id);
              changed(`fn-${t.id}`);
            }}
          />
        ))}
      </ChipRow>
      <ChipRow>
        {(['x', 'y', 'z'] as const).map((v) => (
          <ChipButton
            key={v}
            label={`${v} moves`}
            selected={moving === v}
            onPress={() => {
              setMoving(v);
              changed(`moving-${v}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        <AppText variant="caption" color="textSecondary">
          {`f as a function of ${moving} alone, with ${fixed.map((v) => `${v} = ${fmt(p[v])}`).join(' and ')}`}
        </AppText>
        <LiveScene scene={graph} description={`The graph of f against ${moving}, with tangent slope ${fmt(slope)}.`} />
        {(['x', 'y', 'z'] as const).map((v) => (
          <Slider
            key={v}
            label={v}
            value={p[v]}
            min={-2}
            max={2}
            step={0.05}
            onChange={(value) => {
              setP((old) => ({ ...old, [v]: value }));
              changed(`set-${v}`);
            }}
            valueText={`${v} = ${fmt(p[v])}`}
          />
        ))}
        <Readout
          rows={[
            ['∂f/∂x at the point', fmt(F.d(p, 'x'))],
            ['∂f/∂y at the point', fmt(F.d(p, 'y'))],
            ['∂f/∂z at the point', fmt(F.d(p, 'z'))],
          ]}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text="The graph changes when you move a fixed variable, but it is always a curve of one variable: the partial derivative is the slope of that curve. Example 3.2.3 finds $\frac{\partial f}{\partial z}$ in exactly this way."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 4. Mixed Partials and Clairaut's Theorem (§3.2.3, Example 3.2.4)
// -----------------------------------------------------------------------------

const EX324 = '3x y^2 - 2y + 5x^2 y^2';
/** An app-made function whose mixed partial derivatives at (0, 0) differ (Clairaut's hypotheses fail there). */
const ORIGIN_F = (x: number, y: number) => (x === 0 && y === 0 ? 0 : (x ** 3 * y) / (x * x + y * y));
const ORIGIN_FX = (x: number, y: number) =>
  x === 0 && y === 0 ? 0 : (x * x * y * (x * x + 3 * y * y)) / (x * x + y * y) ** 2;
const ORIGIN_FY = (x: number, y: number) =>
  x === 0 && y === 0 ? 0 : (x ** 3 * (x * x - y * y)) / (x * x + y * y) ** 2;

export function MixedPartialsLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [mode, setMode] = useState<'example' | 'origin'>('example');
  const [logH, setLogH] = useState(-1);
  const h = 10 ** logH;
  const F = compileFn(EX324, ['x', 'y']);
  const [a, b] = [-1, 2];
  const f = (x: number, y: number) => F.value({ x, y });
  const rectangle = (fn: (x: number, y: number) => number, x: number, y: number) =>
    (fn(x + h, y + h) - fn(x + h, y) - fn(x, y + h) + fn(x, y)) / (h * h);

  const corners = (x: number, y: number): FigureItem[] => [
    {
      k: 'polygon',
      points: [
        [x, y],
        [x + h, y],
        [x + h, y + h],
        [x, y + h],
      ],
      tone: 'fill',
      outline: 'edge',
    },
    ...(
      [
        [x, y, '+'],
        [x + h, y, '−'],
        [x, y + h, '−'],
        [x + h, y + h, '+'],
      ] as const
    ).flatMap(([px, py, sign]): FigureItem[] => [
      { k: 'point', x: px, y: py, tone: 'asymptote' },
      { k: 'label', x: px + 0.08 * h, y: py + 0.12 * h, text: sign, size: 'large' },
    ]),
  ];

  const exampleScene: FigureScene = {
    view: { xMin: a - 0.4 * h, xMax: a + 1.4 * h, yMin: b - 0.4 * h, yMax: b + 1.4 * h },
    aspect: 1,
    axes: { x: false, y: false },
    items: [...corners(a, b), { k: 'label', x: a, y: b - 0.25 * h, text: '(−1, 2)', size: 'small', anchor: 'middle' }],
  };
  const originSlices: FigureScene = plane(
    [-1, 1],
    [-1.1, 1.1],
    [
      curve2((y) => ORIGIN_FX(0, y), -1, 1, [-1.1, 1.1], { tone: 'curve' }),
      curve2((x) => ORIGIN_FY(x, 0), -1, 1, [-1.1, 1.1], { tone: 'curve2' }),
      { k: 'label', x: 0.95, y: 0.15, text: 'f_{x}(0, t)', anchor: 'end', size: 'small', tone: 'curve' },
      { k: 'label', x: 0.95, y: 0.82, text: 'f_{y}(t, 0)', anchor: 'end', size: 'small', tone: 'curve2' },
    ],
    ['t', ''],
  );

  return (
    <ExploreScaffold
      activity={activity}
      intro="Both mixed partial derivatives can be built from the same four points: $f(x + h, y + h) - f(x + h, y) - f(x, y + h) + f(x, y)$, divided by $h^{2}$. Clairaut’s Theorem (Theorem 3.2.1) says when the two orders agree."
      explored={explored}
      error={error}
    >
      <ChipRow>
        <ChipButton
          label="Example 3.2.4"
          selected={mode === 'example'}
          onPress={() => {
            setMode('example');
            changed('mode-example');
          }}
        />
        <ChipButton
          label="When the order matters"
          selected={mode === 'origin'}
          onPress={() => {
            setMode('origin');
            changed('mode-origin');
          }}
        />
      </ChipRow>
      {mode === 'example' ? (
        <LabCard>
          <MathExpression tex="f(x, y) = 3xy^{2} - 2y + 5x^{2}y^{2}" display />
          <AppText variant="caption" color="textSecondary">
            The four points around (−1, 2), with the signs they take
          </AppText>
          <LiveScene scene={exampleScene} description={`A square of side h = ${fmt(h)} with corners at (−1, 2).`} />
          <Slider
            label="Size of the square h (powers of ten)"
            value={logH}
            min={-4}
            max={0}
            step={0.25}
            onChange={(v) => {
              setLogH(v);
              changed(`h-${v}`);
            }}
            valueText={`h = ${fmt(h)}`}
          />
          <Readout
            rows={[
              ['Four-point quotient', fmt(rectangle(f, a, b))],
              ['x first, then y', `f_{xy}(-1, 2) = ${fmt(F.d2({ x: a, y: b }, 'x', 'y'))}`],
              ['y first, then x', `f_{yx}(-1, 2) = ${fmt(F.d2({ x: a, y: b }, 'y', 'x'))}`],
              ['Example 3.2.4', 'f_{xy}(-1, 2) = -28'],
            ]}
          />
        </LabCard>
      ) : (
        <LabCard>
          <MathExpression tex="f(x, y) = \frac{x^{3}y}{x^{2} + y^{2}}, \quad f(0, 0) = 0" display />
          <AppMade />
          <AppText variant="caption" color="textSecondary">
            Slopes at t = 0: f_x(0, t) is flat, f_y(t, 0) rises with slope 1
          </AppText>
          <LiveScene
            scene={originSlices}
            description="The graph of f x along the y-axis is flat; the graph of f y along the x-axis is the line of slope 1."
          />
          <Slider
            label="Step h (powers of ten)"
            value={logH}
            min={-4}
            max={0}
            step={0.25}
            onChange={(v) => {
              setLogH(v);
              changed(`h-${v}`);
            }}
            valueText={`h = ${fmt(h)}`}
          />
          <Readout
            rows={[
              ['x first, then y', `\\frac{f_{x}(0, h) - f_{x}(0, 0)}{h} = ${fmt(ORIGIN_FX(0, h) / h)}`],
              ['y first, then x', `\\frac{f_{y}(h, 0) - f_{y}(0, 0)}{h} = ${fmt(ORIGIN_FY(h, 0) / h)}`],
              ['At the origin', `f(0, 0) = ${fmt(ORIGIN_F(0, 0))}`],
            ]}
          />
        </LabCard>
      )}
      <Insight
        title="What to notice"
        text={
          mode === 'example'
            ? 'For a polynomial every partial derivative is continuous, so Clairaut’s Theorem applies: as $h$ shrinks, the four-point quotient approaches the single value $f_{xy} = f_{yx}$, here $-28$ as in Example 3.2.4.'
            : 'Here the two orders give different values at the origin: about 0 one way and 1 the other. The mixed partial derivatives of this function are not continuous at $(0, 0)$, so the hypotheses of Clairaut’s Theorem do not hold there.'
        }
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 5. Building the Total Differential (§3.3, Example 3.3.1)
// -----------------------------------------------------------------------------

const EX331 = '2x sin(y) - 3x^2 y^2';

/** Vertical bars for the terms of a total differential and their sum (an app illustration). */
function termBars(terms: { label: string; value: number }[]): FigureScene {
  const total = terms.reduce((s, t) => s + t.value, 0);
  const values = [...terms.map((t) => t.value), total];
  // The running sum, so the last bar shows each term stacked on the previous ones.
  const partial = terms.map((_, i) => terms.slice(0, i).reduce((s, t) => s + t.value, 0));
  const lo = Math.min(0, ...values, ...partial);
  const hi = Math.max(0, ...values, ...partial.map((p, i) => p + terms[i]!.value));
  const pad = Math.max(0.05, 0.15 * (hi - lo));
  const n = terms.length;
  const tones = ['fill', 'fill2', 'fill3'] as const;
  const items: FigureItem[] = [];
  terms.forEach((t, i) => {
    items.push({ k: 'rect', x0: i + 0.2, x1: i + 0.8, y0: 0, height: t.value, tone: tones[i % 3] });
    items.push({ k: 'label', x: i + 0.5, y: lo - 0.55 * pad, text: t.label, anchor: 'middle', size: 'small' });
    items.push({
      k: 'rect',
      x0: n + 0.2,
      x1: n + 0.8,
      y0: partial[i]!,
      height: partial[i]! + t.value,
      tone: tones[i % 3],
    });
  });
  items.push({ k: 'segment', x1: n + 0.1, y1: total, x2: n + 0.9, y2: total, tone: 'asymptote', width: 2.4 });
  items.push({ k: 'label', x: n + 0.5, y: lo - 0.55 * pad, text: 'sum', anchor: 'middle', size: 'small' });
  return {
    view: { xMin: -0.1, xMax: n + 1.1, yMin: lo - pad, yMax: hi + pad },
    aspect: 0.55,
    axes: { x: true, y: false },
    items,
  };
}

export function TotalDifferentialLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [mode, setMode] = useState<'z' | 'w'>('z');
  const [[a, b], setPoint] = useState<[number, number]>([0.5, 1]);
  const [dx, setDx] = useState(0.4);
  const [dy, setDy] = useState(0.3);
  const [dzw, setDzw] = useState(0.2);
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const F = compileFn(EX331, ['x', 'y']);
  const f = (x: number, y: number) => F.value({ x, y });
  const p = { x: a, y: b };
  const z0 = f(a, b);
  const fx = F.d(p, 'x');
  const fy = F.d(p, 'y');
  const box: Box3 = { x: [-0.5, 1.5], y: [0, 2], z: zRange(f, [-0.5, 1.5], [0, 2]) };
  // Example 3.3.1(ii) at the point (a, b, 1): dw = 2x dx + 2y dy + 2z dz.
  const w = { x: a, y: b, z: 1 };

  const slices: FigureItem[] = [
    spaceCurve(
      (s) => [box.x[0] + (box.x[1] - box.x[0]) * s, b, f(box.x[0] + (box.x[1] - box.x[0]) * s, b)],
      box,
      camera,
      {
        tone: 'curve',
        width: 2.4,
      },
    ),
    spaceCurve(
      (s) => [a, box.y[0] + (box.y[1] - box.y[0]) * s, f(a, box.y[0] + (box.y[1] - box.y[0]) * s)],
      box,
      camera,
      {
        tone: 'curve2',
        width: 2.4,
      },
    ),
    // Along each slice, its slope times the step: the two terms of dz.
    spaceSegment([a, b, z0], [a + dx, b, z0 + fx * dx], box, camera, { tone: 'curve', width: 3.4 }),
    spaceSegment([a, b, z0], [a, b + dy, z0 + fy * dy], box, camera, { tone: 'curve2', width: 3.4 }),
    ...spacePoint([a, b, z0], box, camera),
  ];
  const surface = surfaceScene(f, box, camera, slices, { opacity: 0.5 });
  const bars =
    mode === 'z'
      ? termBars([
          { label: 'f_{x}dx', value: fx * dx },
          { label: 'f_{y}dy', value: fy * dy },
        ])
      : termBars([
          { label: 'w_{x}dx', value: 2 * w.x * dx },
          { label: 'w_{y}dy', value: 2 * w.y * dy },
          { label: 'w_{z}dz', value: 2 * w.z * dzw },
        ]);

  return (
    <ExploreScaffold
      activity={activity}
      intro="The total differential (§3.3) has one term for each variable: the partial derivative times the differential of that variable, $dz = f_{x}dx + f_{y}dy$. Change the point and the differentials and watch each term."
      explored={explored}
      error={error}
    >
      <ChipRow>
        <ChipButton
          label="Example 3.3.1(i): dz"
          selected={mode === 'z'}
          onPress={() => {
            setMode('z');
            changed('mode-z');
          }}
        />
        <ChipButton
          label="Example 3.3.1(ii): dw"
          selected={mode === 'w'}
          onPress={() => {
            setMode('w');
            changed('mode-w');
          }}
        />
      </ChipRow>
      <LabCard>
        <MathExpression
          tex={mode === 'z' ? 'z = 2x\\sin y - 3x^{2}y^{2}' : 'w = x^{2} + y^{2} + z^{2} \\quad \\text{at } z = 1'}
          display
        />
        {mode === 'z' ? (
          <>
            <LiveScene
              scene={surface}
              description={`The surface of Example 3.3.1(i) with its two slices through (${fmt(a)}, ${fmt(b)}). Along the x-slice the rise is f_x dx = ${fmt(fx * dx)}; along the y-slice it is f_y dy = ${fmt(fy * dy)}.`}
            />
            <TurnSlider
              camera={camera}
              onChange={(c) => {
                setCamera(c);
                changed('turn');
              }}
            />
          </>
        ) : null}
        <AppText variant="caption" color="textSecondary">
          {mode === 'z' ? 'The two terms and their sum dz' : 'The three terms and their sum dw'}
        </AppText>
        <LiveScene scene={bars} description="Bars for each term of the total differential, and the stacked sum." />
        <AppMade />
        <Slider
          label="x"
          value={a}
          min={-0.5}
          max={1.5}
          step={0.05}
          onChange={(v) => {
            setPoint([v, b]);
            changed('x');
          }}
          valueText={`x = ${fmt(a)}`}
        />
        <Slider
          label="y"
          value={b}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => {
            setPoint([a, v]);
            changed('y');
          }}
          valueText={`y = ${fmt(b)}`}
        />
        <Slider
          label="dx"
          value={dx}
          min={-0.5}
          max={0.5}
          step={0.01}
          onChange={(v) => {
            setDx(v);
            changed('dx');
          }}
          valueText={`dx = ${fmt(dx)}`}
        />
        <Slider
          label="dy"
          value={dy}
          min={-0.5}
          max={0.5}
          step={0.01}
          onChange={(v) => {
            setDy(v);
            changed('dy');
          }}
          valueText={`dy = ${fmt(dy)}`}
        />
        {mode === 'w' ? (
          <Slider
            label="dz"
            value={dzw}
            min={-0.5}
            max={0.5}
            step={0.01}
            onChange={(v) => {
              setDzw(v);
              changed('dz');
            }}
            valueText={`dz = ${fmt(dzw)}`}
          />
        ) : null}
        <Readout
          rows={
            mode === 'z'
              ? [
                  ['From Example 3.3.1(i)', 'dz = (2\\sin y - 6xy^{2})dx + (2x\\cos y - 6x^{2}y)dy'],
                  ['Partial derivatives here', `f_{x} = ${fmt(fx)}, \\quad f_{y} = ${fmt(fy)}`],
                  ['The terms', `(${fmt(fx)})(${fmt(dx)}) + (${fmt(fy)})(${fmt(dy)})`],
                  ['Total differential', `dz = ${fmt(fx * dx + fy * dy)}`],
                ]
              : [
                  ['From Example 3.3.1(ii)', 'dw = 2x\\,dx + 2y\\,dy + 2z\\,dz'],
                  [
                    'The terms',
                    `2(${fmt(w.x)})(${fmt(dx)}) + 2(${fmt(w.y)})(${fmt(dy)}) + 2(${fmt(w.z)})(${fmt(dzw)})`,
                  ],
                  ['Total differential', `dw = ${fmt(2 * w.x * dx + 2 * w.y * dy + 2 * w.z * dzw)}`],
                ]
          }
        />
      </LabCard>
      <Insight
        title="What to notice"
        text="Each term pairs one partial derivative with its own differential. With $dy = 0$ only the $x$-term is left, and $dz$ is the slope of the $x$-slice times $dx$. A function of three variables has three terms, one for each variable, as §3.3 says for $w = f(x, y, z, u)$."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// Tree diagrams (interactive Figures 3.1 and 3.2)
// -----------------------------------------------------------------------------

interface TreeNode {
  id: string;
  x: number;
  y: number;
  text: string;
}
interface TreeEdge {
  from: string;
  to: string;
  num: string;
  den: string;
}

function treeScene(nodes: TreeNode[], edges: TreeEdge[], lit: Set<string>, width: number, height: number): FigureScene {
  const at = new Map(nodes.map((n) => [n.id, n]));
  const r = 0.55;
  const items: FigureItem[] = [];
  for (const e of edges) {
    const a = at.get(e.from)!;
    const b = at.get(e.to)!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
    const on = lit.has(`${e.from}-${e.to}`);
    items.push({
      k: 'segment',
      x1: a.x + ux * r,
      y1: a.y + uy * r,
      x2: b.x - ux * r,
      y2: b.y - uy * r,
      tone: on ? 'asymptote' : 'guide',
      width: on ? 3.2 : 1.4,
    });
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    items.push({ k: 'fraction', x: mx + (ux > 0 ? 0.9 : ux < 0 ? -0.9 : 0.9), y: my, num: e.num, den: e.den });
  }
  for (const n of nodes) items.push({ k: 'node', x: n.x, y: n.y, r, text: n.text });
  return {
    view: { xMin: -width / 2, xMax: width / 2, yMin: -0.9, yMax: height },
    aspect: (height + 0.9) / width,
    axes: { x: false, y: false },
    items,
  };
}

// -----------------------------------------------------------------------------
// 6. Interactive Figure 3.1 (§3.4, Theorem 3.4.1, Example 3.4.1)
// -----------------------------------------------------------------------------

const FIG31_NODES: TreeNode[] = [
  { id: 'w', x: 0, y: 5, text: 'w' },
  { id: 'x', x: -2.2, y: 2.6, text: 'x' },
  { id: 'y', x: 2.2, y: 2.6, text: 'y' },
  { id: 'tx', x: -2.2, y: 0.2, text: 't' },
  { id: 'ty', x: 2.2, y: 0.2, text: 't' },
];
const FIG31_EDGES: TreeEdge[] = [
  { from: 'w', to: 'x', num: '∂w', den: '∂x' },
  { from: 'w', to: 'y', num: '∂w', den: '∂y' },
  { from: 'x', to: 'tx', num: 'dx', den: 'dt' },
  { from: 'y', to: 'ty', num: 'dy', den: 'dt' },
];

export function ChainTreeOne({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [t, setT] = useState(0);
  const [path, setPath] = useState<'x' | 'y' | 'both'>('both');
  const W = compileFn('x^2 y - y^2', ['t'], { x: 'sin(t)', y: 'e^t' });
  const x = Math.sin(t);
  const y = Math.exp(t);
  const viaX = 2 * x * y * Math.cos(t);
  const viaY = (x * x - 2 * y) * Math.exp(t);
  const dwdt = W.d({ t }, 't');
  const lit = new Set<string>([...(path !== 'y' ? ['w-x', 'x-tx'] : []), ...(path !== 'x' ? ['w-y', 'y-ty'] : [])]);
  const tree = treeScene(FIG31_NODES, FIG31_EDGES, lit, 8, 5.8);
  const w = (s: number) => W.value({ t: s });
  const yr = rangeOf(w, -1.5, 1.2);
  const graph = plane(
    [-1.5, 1.2],
    yr,
    [curve2(w, -1.5, 1.2, yr), tangent(w(t), t, dwdt, -1.5, 1.2), { k: 'point', x: t, y: w(t), tone: 'asymptote' }],
    ['t', 'w'],
  );
  const curve = withMathAxes({
    view: { xMin: -1.2, xMax: 1.2, yMin: -0.2, yMax: 3.6 },
    aspect: 1.2,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
    items: [path2((s) => [Math.sin(s), Math.exp(s)], -1.5, 1.2), { k: 'point', x, y, tone: 'asymptote' }],
  });

  return (
    <ExploreScaffold
      activity={activity}
      intro="Theorem 3.4.1: $\frac{dw}{dt} = \frac{\partial w}{\partial x}\frac{dx}{dt} + \frac{\partial w}{\partial y}\frac{dy}{dt}$. Each path from $w$ down to $t$ in Figure 3.1 gives one product. Example 3.4.1: $w = x^{2}y - y^{2}$, $x = \sin t$, $y = e^{t}$."
      explored={explored}
      error={error}
    >
      <LabCard>
        <AppText variant="caption" color="textSecondary">
          Figure 3.1, interactive: highlight a path
        </AppText>
        <LiveScene scene={tree} description="Tree diagram: w depends on x and y, and each of x and y depends on t." />
        <ChipRow>
          {(
            [
              ['x', 'Path through x'],
              ['y', 'Path through y'],
              ['both', 'Both paths'],
            ] as const
          ).map(([id, label]) => (
            <ChipButton
              key={id}
              label={label}
              selected={path === id}
              onPress={() => {
                setPath(id);
                changed(`path-${id}`);
              }}
            />
          ))}
        </ChipRow>
        <Slider
          label="t"
          value={t}
          min={-1.5}
          max={1.2}
          step={0.05}
          onChange={(v) => {
            setT(v);
            changed('move-t');
          }}
          valueText={`t = ${fmt(t)}`}
        />
        <Readout
          rows={[
            ['Path through x', `\\frac{\\partial w}{\\partial x}\\frac{dx}{dt} = (2xy)(\\cos t) = ${fmt(viaX)}`],
            ['Path through y', `\\frac{\\partial w}{\\partial y}\\frac{dy}{dt} = (x^{2} - 2y)(e^{t}) = ${fmt(viaY)}`],
            ['Sum of the paths', `\\frac{dw}{dt} = ${fmt(path === 'x' ? viaX : path === 'y' ? viaY : viaX + viaY)}`],
            ['Slope of w(t)', fmt(dwdt)],
          ]}
        />
      </LabCard>
      <LabCard>
        <AppText variant="caption" color="textSecondary">
          The point (x(t), y(t)) moves along a curve; w(t) changes along it
        </AppText>
        <LiveScene scene={curve} description={`The curve x = sin t, y = e^t, with the point at t = ${fmt(t)}.`} />
        <LiveScene scene={graph} description={`The graph of w against t with tangent slope ${fmt(dwdt)}.`} />
      </LabCard>
      <Insight
        title="What to notice"
        text="Only when both paths are included does the sum equal the slope of $w(t)$. At $t = 0$ the sum is $-2$, as in Example 3.4.1."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 7. Interactive Figure 3.2 (§3.4, Theorem 3.4.2, Example 3.4.3)
// -----------------------------------------------------------------------------

const FIG32_NODES: TreeNode[] = [
  { id: 'w', x: 0, y: 5, text: 'w' },
  { id: 'x', x: -2.6, y: 2.6, text: 'x' },
  { id: 'y', x: 2.6, y: 2.6, text: 'y' },
  { id: 'xs', x: -3.8, y: 0.2, text: 's' },
  { id: 'xt', x: -1.4, y: 0.2, text: 't' },
  { id: 'ys', x: 1.4, y: 0.2, text: 's' },
  { id: 'yt', x: 3.8, y: 0.2, text: 't' },
];
const FIG32_EDGES: TreeEdge[] = [
  { from: 'w', to: 'x', num: '∂w', den: '∂x' },
  { from: 'w', to: 'y', num: '∂w', den: '∂y' },
  { from: 'x', to: 'xs', num: '∂x', den: '∂s' },
  { from: 'x', to: 'xt', num: '∂x', den: '∂t' },
  { from: 'y', to: 'ys', num: '∂y', den: '∂s' },
  { from: 'y', to: 'yt', num: '∂y', den: '∂t' },
];

export function ChainTreeTwo({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [s, setS] = useState(1);
  const [t, setT] = useState(1);
  const [wrt, setWrt] = useState<'s' | 't'>('s');
  const W = compileFn('2xy', ['s', 't'], { x: 's^2 + t^2', y: 's/t' });
  const x = s * s + t * t;
  const y = s / t;
  const [wx, wy] = [2 * y, 2 * x];
  const [xd, yd] = wrt === 's' ? [2 * s, 1 / t] : [2 * t, -s / (t * t)];
  const exact = W.d({ s, t }, wrt);
  const printed = wrt === 's' ? (6 * s * s + 2 * t * t) / t : (2 * s * t * t - 2 * s ** 3) / (t * t);
  const lit = new Set(wrt === 's' ? ['w-x', 'x-xs', 'w-y', 'y-ys'] : ['w-x', 'x-xt', 'w-y', 'y-yt']);
  const tree = treeScene(FIG32_NODES, FIG32_EDGES, lit, 9.6, 5.8);

  return (
    <ExploreScaffold
      activity={activity}
      intro="Theorem 3.4.2: for $\frac{\partial w}{\partial s}$, follow every path from $w$ down to $s$ in Figure 3.2 and add the products. Example 3.4.3: $w = 2xy$, $x = s^{2} + t^{2}$, $y = \frac{s}{t}$."
      explored={explored}
      error={error}
    >
      <ChipRow>
        <ChipButton
          label="∂w/∂s"
          accessibilityLabel="Paths to s"
          selected={wrt === 's'}
          onPress={() => {
            setWrt('s');
            changed('wrt-s');
          }}
        />
        <ChipButton
          label="∂w/∂t"
          accessibilityLabel="Paths to t"
          selected={wrt === 't'}
          onPress={() => {
            setWrt('t');
            changed('wrt-t');
          }}
        />
      </ChipRow>
      <LabCard>
        <AppText variant="caption" color="textSecondary">
          {`Figure 3.2, interactive: the two paths from w to ${wrt}`}
        </AppText>
        <LiveScene
          scene={tree}
          description={`Tree diagram: w depends on x and y, each of which depends on s and t. The paths to ${wrt} are highlighted.`}
        />
        <Slider
          label="s"
          value={s}
          min={-2}
          max={2}
          step={0.05}
          onChange={(v) => {
            setS(v);
            changed('move-s');
          }}
          valueText={`s = ${fmt(s)}`}
        />
        <Slider
          label="t"
          value={t}
          min={0.25}
          max={2}
          step={0.05}
          onChange={(v) => {
            setT(v);
            changed('move-t');
          }}
          valueText={`t = ${fmt(t)}`}
        />
        <Readout
          rows={[
            [
              'Path through x',
              `\\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial ${wrt}} = (${fmt(wx)})(${fmt(xd)}) = ${fmt(wx * xd)}`,
            ],
            [
              'Path through y',
              `\\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial ${wrt}} = (${fmt(wy)})(${fmt(yd)}) = ${fmt(wy * yd)}`,
            ],
            ['Sum of the paths', `\\frac{\\partial w}{\\partial ${wrt}} = ${fmt(wx * xd + wy * yd)}`],
            [
              'Example 3.4.2 formula',
              wrt === 's'
                ? `\\frac{6s^{2} + 2t^{2}}{t} = ${fmt(printed)}`
                : `\\frac{2st^{2} - 2s^{3}}{t^{2}} = ${fmt(printed)}`,
            ],
            ['Direct derivative', fmt(exact)],
          ]}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text="There are two paths to each of $s$ and $t$, so each partial derivative is a sum of two products. The tree tells you which derivatives to multiply."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 8. New Coordinates and Differentials (§3.4, Examples 3.4.5 and 3.4.6)
// -----------------------------------------------------------------------------

export function CoordinateGridLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [mode, setMode] = useState<'parabolic' | 'sum'>('parabolic');
  const [u, setU] = useState(1.2);
  const [v, setV] = useState(0.8);
  const [x0, setX0] = useState(2);
  const [y0, setY0] = useState(0.5);
  const du = 0.15;
  const dv = 0.15;

  let scene: FigureScene;
  let rows: [string, string][];
  if (mode === 'parabolic') {
    const map = (a: number, b: number): [number, number] => [(a * a - b * b) / 2, a * b];
    const lines: FigureItem[] = [];
    for (let k = 1; k <= 8; k++) {
      const c = k * 0.3;
      lines.push(path2((b) => map(c, b), -2.4, 2.4, { tone: 'guide', width: 1 }));
      lines.push(path2((a) => map(a, c), 0, 2.4, { tone: 'guide', width: 1, dashed: true }));
    }
    const [x, y] = map(u, v);
    // dx = u du − v dv, dy = v du + u dv: the small cell spanned by du and dv.
    const cell: [number, number][] = [
      [x, y],
      [x + u * du, y + v * du],
      [x + u * du - v * dv, y + v * du + u * dv],
      [x - v * dv, y + u * dv],
    ];
    const q = u * u + v * v;
    scene = {
      view: { xMin: -3, xMax: 3, yMin: -0.4, yMax: 4 },
      aspect: 0.75,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
      items: [
        ...lines,
        { k: 'polygon', points: cell, tone: 'fill3', outline: 'asymptote' },
        path2((b) => map(u, b), -2.4, 2.4, { tone: 'curve', width: 2.4 }),
        path2((a) => map(a, v), 0, 2.4, { tone: 'curve2', width: 2.4 }),
        { k: 'point', x, y, tone: 'asymptote' },
      ],
    };
    rows = [
      ['Differentials', `dx = u\\,du - v\\,dv, \\quad dy = v\\,du + u\\,dv`],
      [
        'Solved',
        `\\frac{\\partial u}{\\partial x} = \\frac{u}{u^{2} + v^{2}} = ${fmt(u / q)}, \\quad \\frac{\\partial u}{\\partial y} = \\frac{v}{u^{2} + v^{2}} = ${fmt(v / q)}`,
      ],
      [
        '',
        `\\frac{\\partial v}{\\partial x} = \\frac{-v}{u^{2} + v^{2}} = ${fmt(-v / q)}, \\quad \\frac{\\partial v}{\\partial y} = \\frac{u}{u^{2} + v^{2}} = ${fmt(u / q)}`,
      ],
      [
        'Orthogonality check',
        `\\frac{\\partial u}{\\partial x}\\frac{\\partial v}{\\partial x} + \\frac{\\partial u}{\\partial y}\\frac{\\partial v}{\\partial y} = ${fmt((u / q) * (-v / q) + (v / q) * (u / q))}`,
      ],
    ];
  } else {
    const lines: FigureItem[] = [];
    for (let k = -4; k <= 4; k++) {
      const c = k * 0.75;
      lines.push(path2((x) => [x, c - x], -3, 3, { tone: 'guide', width: 1 }));
    }
    for (const c of [-2, -1, -0.5, 0.5, 1, 2]) {
      lines.push(curve2((x) => c / x, -3, -0.05, [-3, 3], { tone: 'guide', width: 1, dashed: true }));
      lines.push(curve2((x) => c / x, 0.05, 3, [-3, 3], { tone: 'guide', width: 1, dashed: true }));
    }
    const uu = x0 + y0;
    const vv = x0 * y0;
    const det = x0 - y0;
    scene = {
      view: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
      aspect: 1,
      axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
      items: [
        ...lines,
        path2((x) => [x, uu - x], -3, 3, { tone: 'curve', width: 2.4 }),
        curve2((x) => vv / x, -3, -0.05, [-3, 3], { tone: 'curve2', width: 2.4 }),
        curve2((x) => vv / x, 0.05, 3, [-3, 3], { tone: 'curve2', width: 2.4 }),
        { k: 'point', x: x0, y: y0, tone: 'asymptote' },
      ],
    };
    rows = [
      ['At the point', `u = x + y = ${fmt(uu)}, \\quad v = xy = ${fmt(vv)}`],
      [
        'Example 3.4.5',
        `\\frac{\\partial x}{\\partial u} = \\frac{x}{x - y} = ${fmt(x0 / det)}, \\quad \\frac{\\partial x}{\\partial v} = \\frac{-1}{x - y} = ${fmt(-1 / det)}`,
      ],
      [
        '',
        `\\frac{\\partial y}{\\partial u} = \\frac{-y}{x - y} = ${fmt(-y0 / det)}, \\quad \\frac{\\partial y}{\\partial v} = \\frac{1}{x - y} = ${fmt(1 / det)}`,
      ],
    ];
  }

  return (
    <ExploreScaffold
      activity={activity}
      intro="New coordinates draw a new grid over the plane. Writing the differentials of the defining equations and solving them (Examples 3.4.5 and 3.4.6) gives the partial derivatives of the inverse change."
      explored={explored}
      error={error}
    >
      <ChipRow>
        <ChipButton
          label="Example 3.4.6: parabolic"
          selected={mode === 'parabolic'}
          onPress={() => {
            setMode('parabolic');
            changed('mode-parabolic');
          }}
        />
        <ChipButton
          label="Example 3.4.5: u = x + y, v = xy"
          selected={mode === 'sum'}
          onPress={() => {
            setMode('sum');
            changed('mode-sum');
          }}
        />
      </ChipRow>
      <LabCard>
        <MathExpression
          tex={mode === 'parabolic' ? 'x = \\frac{u^{2} - v^{2}}{2}, \\quad y = uv' : 'u = x + y, \\quad v = xy'}
          display
        />
        <LiveScene
          scene={withMathAxes(scene, { grid: false })}
          description={
            mode === 'parabolic'
              ? 'Curves of constant u and constant v (parabolas) and the small cell spanned by du and dv at the chosen point.'
              : 'Lines of constant u = x + y and hyperbolas of constant v = xy through the chosen point.'
          }
        />
        {mode === 'parabolic' ? (
          <>
            <Slider
              label="u"
              value={u}
              min={0.3}
              max={2.2}
              step={0.05}
              onChange={(n) => {
                setU(n);
                changed('u');
              }}
              valueText={`u = ${fmt(u)}`}
            />
            <Slider
              label="v"
              value={v}
              min={0.3}
              max={2.2}
              step={0.05}
              onChange={(n) => {
                setV(n);
                changed('v');
              }}
              valueText={`v = ${fmt(v)}`}
            />
          </>
        ) : (
          <>
            <Slider
              label="x"
              value={x0}
              min={-2.5}
              max={2.5}
              step={0.05}
              onChange={(n) => {
                setX0(n);
                changed('x');
              }}
              valueText={`x = ${fmt(x0)}`}
            />
            <Slider
              label="y"
              value={y0}
              min={-2.5}
              max={2.5}
              step={0.05}
              onChange={(n) => {
                setY0(n);
                changed('y');
              }}
              valueText={`y = ${fmt(y0)}`}
            />
          </>
        )}
        <Readout rows={rows} />
      </LabCard>
      <Insight
        title="What to notice"
        text={
          mode === 'parabolic'
            ? 'The curves of constant $u$ and constant $v$ always cross at right angles, which is what the check $\\frac{\\partial u}{\\partial x}\\frac{\\partial v}{\\partial x} + \\frac{\\partial u}{\\partial y}\\frac{\\partial v}{\\partial y} = 0$ in Example 3.4.6 expresses.'
            : 'Move the point onto the line $y = x$: there $x - y = 0$, the line and the hyperbola touch instead of crossing, and the partial derivatives of Example 3.4.5 are not defined.'
        }
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 9. Polar Coordinates, Second Order (§3.4, Example 3.4.7)
// -----------------------------------------------------------------------------

const POLAR_FUNCTIONS = [
  { id: 'saddle', label: 'w = x² − y²', tex: 'w = x^{2} - y^{2}', text: 'x^2 - y^2' },
  { id: 'bowl', label: 'w = x² + y²', tex: 'w = x^{2} + y^{2}', text: 'x^2 + y^2' },
  { id: 'wave', label: 'w = eˣ cos y', tex: 'w = e^{x}\\cos y', text: 'e^x cos(y)' },
  { id: 'cubic', label: 'w = x³y', tex: 'w = x^{3}y', text: 'x^3 y' },
] as const;

export function PolarSecondOrderLab({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [fnId, setFnId] = useState<(typeof POLAR_FUNCTIONS)[number]['id']>('cubic');
  const fn = POLAR_FUNCTIONS.find((f) => f.id === fnId) ?? POLAR_FUNCTIONS[0];
  const [r, setR] = useState(1.2);
  const [theta, setTheta] = useState(0.6);
  const W = compileFn(fn.text, ['x', 'y']);
  const P = compileFn(fn.text, ['r', 'θ'], { x: 'r cos(theta)', y: 'r sin(theta)' });
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  const cart = W.d2({ x, y }, 'x', 'x') + W.d2({ x, y }, 'y', 'y');
  const pp = { r, θ: theta };
  const wr = P.d(pp, 'r');
  const polar = P.d2(pp, 'r', 'r') + wr / r + P.d2(pp, 'θ', 'θ') / (r * r);

  const grid: FigureItem[] = [];
  for (let k = 1; k <= 4; k++)
    grid.push(
      path2((s) => [k * 0.5 * Math.cos(s), k * 0.5 * Math.sin(s)], 0, 2 * Math.PI, { tone: 'guide', width: 1 }),
    );
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    grid.push({
      k: 'segment',
      x1: 0,
      y1: 0,
      x2: 2.1 * Math.cos(a),
      y2: 2.1 * Math.sin(a),
      tone: 'guide',
      width: 0.8,
      dashed: true,
    });
  }
  const scene: FigureScene = {
    view: { xMin: -2.3, xMax: 2.3, yMin: -2.3, yMax: 2.3 },
    aspect: 1,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
    items: [
      ...grid,
      { k: 'segment', x1: 0, y1: 0, x2: x, y2: y, tone: 'curve', width: 2 },
      {
        k: 'segment',
        x1: x,
        y1: y,
        x2: x + 0.6 * Math.cos(theta),
        y2: y + 0.6 * Math.sin(theta),
        tone: 'asymptote',
        arrow: 'end',
        width: 2.2,
      },
      {
        k: 'segment',
        x1: x,
        y1: y,
        x2: x - 0.6 * Math.sin(theta),
        y2: y + 0.6 * Math.cos(theta),
        tone: 'curve2',
        arrow: 'end',
        width: 2.2,
      },
      {
        k: 'label',
        x: x + 0.75 * Math.cos(theta),
        y: y + 0.75 * Math.sin(theta),
        text: 'r',
        italic: true,
        anchor: 'middle',
      },
      {
        k: 'label',
        x: x - 0.78 * Math.sin(theta),
        y: y + 0.78 * Math.cos(theta),
        text: 'θ',
        italic: true,
        anchor: 'middle',
      },
      { k: 'point', x, y, tone: 'asymptote' },
    ],
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Example 3.4.7 uses the Chain Rule twice to rewrite $\frac{\partial^{2} w}{\partial x^{2}} + \frac{\partial^{2} w}{\partial y^{2}}$ in polar coordinates. Choose a function and a point: both sides are computed independently."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {POLAR_FUNCTIONS.map((p) => (
          <ChipButton
            key={p.id}
            label={p.label}
            selected={p.id === fnId}
            onPress={() => {
              setFnId(p.id);
              changed(`fn-${p.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        <AppMade />
        <LiveScene
          scene={withMathAxes(scene, { grid: false })}
          description={`The polar grid with the point r = ${fmt(r)}, θ = ${fmt(theta)} and the directions in which r and θ increase.`}
        />
        <Slider
          label="r"
          value={r}
          min={0.3}
          max={2}
          step={0.05}
          onChange={(n) => {
            setR(n);
            changed('r');
          }}
          valueText={`r = ${fmt(r)}`}
        />
        <Slider
          label="θ"
          value={theta}
          min={0}
          max={6.25}
          step={0.05}
          onChange={(n) => {
            setTheta(n);
            changed('theta');
          }}
          valueText={`θ = ${fmt(theta)}`}
        />
        <Readout
          rows={[
            [
              'In x and y',
              `\\frac{\\partial^{2} w}{\\partial x^{2}} + \\frac{\\partial^{2} w}{\\partial y^{2}} = ${fmt(cart)}`,
            ],
            [
              'In r and θ',
              `\\frac{\\partial^{2} w}{\\partial r^{2}} + \\frac{1}{r}\\frac{\\partial w}{\\partial r} + \\frac{1}{r^{2}}\\frac{\\partial^{2} w}{\\partial \\theta^{2}} = ${fmt(polar)}`,
            ],
          ]}
        />
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="small" color="textSecondary">
            Both values are computed numerically from the formula, one in each coordinate system.
          </AppText>
        </View>
      </LabCard>
      <Insight
        title="What to notice"
        text="The two expressions agree at every point, for every function: the polar form is the same quantity written in new variables. The term $\frac{1}{r}\frac{\partial w}{\partial r}$ is needed because the circles of the grid curve."
      />
    </ExploreScaffold>
  );
}
