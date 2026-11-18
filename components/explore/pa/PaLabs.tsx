/**
 * Explore tools for Topic 4 (Applications of the Partial Derivative), one per
 * subtopic: Gradient Probe, Tangent Plane Lab, Critical Point Finder and
 * Saddle or Not.
 *
 * Every lab opens on a worked example of the notes where there is one. Chapter
 * 4 has no figures, so every contour map, surface, plane and vector here is an
 * app-created visualisation, and functions that are not in the notes are
 * labelled as made for the app. The gradient is described only by its
 * definition (MR4-12: no steepest-ascent or level-curve claim).
 */
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { contourLevels, levelCurve } from '@/lib/explore/contours';
import { classify, findCriticalPoints, TYPE_LABEL } from '@/lib/explore/extrema';
import {
  type Box3,
  type Camera,
  compileFn,
  DEFAULT_CAMERA,
  fmt,
  projector,
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

/** The note under every drawing: Chapter 4 has no figures. */
function Visualisation({ fromNotes }: { fromNotes: string | null }) {
  return (
    <AppText variant="small" color="textSecondary">
      {fromNotes
        ? `App-created visualisation of ${fromNotes} (Chapter 4 has no printed figures).`
        : 'A function made for the app (not from the course notes). App-created visualisation.'}
    </AppText>
  );
}

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

/** Lowest and highest finite values of f over the rectangle, padded. */
function zRange(f: (x: number, y: number) => number, x: [number, number], y: [number, number]): [number, number] {
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
  const pad = Math.max(0.1, 0.08 * (hi - lo));
  return [lo - pad, hi + pad];
}

/** A flat 2D panel over a rectangle, with numbered axes and a light grid so points can be read off. */
const flat = (x: [number, number], y: [number, number], items: FigureItem[]): FigureScene =>
  withMathAxes({
    view: { xMin: x[0], xMax: x[1], yMin: y[0], yMax: y[1] },
    aspect: Math.min(1.1, Math.max(0.6, (y[1] - y[0]) / (x[1] - x[0]))),
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
    items,
  });

const signed = (v: number) => (v < 0 ? `- ${fmt(-v)}` : `+ ${fmt(v)}`);
const minusPoint = (name: string, c: number) => (Math.abs(c) < 1e-9 ? name : `(${name} ${signed(-c)})`);

// -----------------------------------------------------------------------------
// 1. Gradient Probe (§4.1)
// -----------------------------------------------------------------------------

interface ProbeFunction {
  id: string;
  label: string;
  tex: string;
  text: string;
  x: [number, number];
  y: [number, number];
  start: [number, number];
  fromNotes: string | null;
}

const PROBE_FUNCTIONS: ProbeFunction[] = [
  {
    id: 'ex411',
    label: 'Example 4.1.1',
    tex: 'f(x, y) = y\\ln x + xy^{2}',
    text: 'y ln(x) + x y^2',
    x: [0.3, 3],
    y: [-1, 2.6],
    start: [1, 2],
    fromNotes: 'the function of Example 4.1.1',
  },
  {
    id: 'saddle',
    label: 'x² − y²',
    tex: 'f(x, y) = x^{2} - y^{2}',
    text: 'x^2 - y^2',
    x: [-2, 2],
    y: [-2, 2],
    start: [1, 0.5],
    fromNotes: null,
  },
  {
    id: 'bowl',
    label: 'x² + 2y²',
    tex: 'f(x, y) = x^{2} + 2y^{2}',
    text: 'x^2 + 2y^2',
    x: [-2, 2],
    y: [-2, 2],
    start: [1, 1],
    fromNotes: null,
  },
];

export function GradientProbe({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [fnId, setFnId] = useState('ex411');
  const fn = PROBE_FUNCTIONS.find((f) => f.id === fnId) ?? PROBE_FUNCTIONS[0]!;
  const [[a, b], setPoint] = useState<[number, number]>(fn.start);
  const F = useMemo(() => compileFn(fn.text, ['x', 'y']), [fn.text]);
  const f = (x: number, y: number) => F.value({ x, y });
  const contours = useMemo(
    () =>
      contourLevels((x, y) => F.value({ x, y }), fn.x, fn.y, 8).map((level) =>
        levelCurve((x, y) => F.value({ x, y }), fn.x, fn.y, level, { tone: 'guide', width: 1 }),
      ),
    [F, fn.x, fn.y],
  );
  const fx = F.d({ x: a, y: b }, 'x');
  const fy = F.d({ x: a, y: b }, 'y');
  const len = Math.hypot(fx, fy);
  // Arrows are scaled to fit the view; their direction and relative size are exact.
  const unit = (0.22 * Math.min(fn.x[1] - fn.x[0], fn.y[1] - fn.y[0])) / Math.max(len, 1);
  const scene = flat(fn.x, fn.y, [
    ...contours,
    { k: 'segment', x1: a, y1: b, x2: a + fx * unit, y2: b, tone: 'curve', width: 2, dashed: true },
    { k: 'segment', x1: a, y1: b, x2: a, y2: b + fy * unit, tone: 'curve2', width: 2, dashed: true },
    ...(len > 1e-9
      ? [
          {
            k: 'segment',
            x1: a,
            y1: b,
            x2: a + fx * unit,
            y2: b + fy * unit,
            tone: 'asymptote',
            width: 2.8,
            arrow: 'end',
          } as FigureItem,
        ]
      : []),
    { k: 'point', x: a, y: b, tone: 'text' },
  ]);

  return (
    <ExploreScaffold
      activity={activity}
      intro="The gradient of $f(x, y)$ is the vector $\nabla f(x, y) = f_{x}(x, y)\mathbf{i} + f_{y}(x, y)\mathbf{j}$ (§4.1). Move the point and watch its two components."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {PROBE_FUNCTIONS.map((p) => (
          <ChipButton
            key={p.id}
            label={p.label}
            selected={p.id === fnId}
            onPress={() => {
              setFnId(p.id);
              setPoint(p.start);
              changed(`fn-${p.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        <Visualisation fromNotes={fn.fromNotes} />
        <LiveScene
          scene={scene}
          description={`Contour map of ${fn.label} with the point (${fmt(a)}, ${fmt(b)}). The dashed horizontal arrow is f_x = ${fmt(fx)}, the dashed vertical arrow is f_y = ${fmt(fy)}, and the solid arrow is the gradient vector.`}
        />
        <AppText variant="small" color="textSecondary">
          Thin lines: contour lines of f. Dashed horizontal arrow: the i-component f_x. Dashed vertical arrow: the
          j-component f_y. Solid arrow: ∇f, drawn to scale relative to its components.
        </AppText>
        <Slider
          label="x"
          value={a}
          min={fn.x[0]}
          max={fn.x[1]}
          step={0.05}
          onChange={(v) => {
            setPoint([v, b]);
            changed('move-x');
          }}
          valueText={`x = ${fmt(a)}`}
        />
        <Slider
          label="y"
          value={b}
          min={fn.y[0]}
          max={fn.y[1]}
          step={0.05}
          onChange={(v) => {
            setPoint([a, v]);
            changed('move-y');
          }}
          valueText={`y = ${fmt(b)}`}
        />
        <Readout
          rows={[
            ['f at the point', `f(${fmt(a)}, ${fmt(b)}) = ${fmt(f(a, b))}`],
            ['i-component', `f_{x}(${fmt(a)}, ${fmt(b)}) = ${fmt(fx)}`],
            ['j-component', `f_{y}(${fmt(a)}, ${fmt(b)}) = ${fmt(fy)}`],
            ['Gradient', `\\nabla f = ${fmt(fx)}\\mathbf{i} ${signed(fy)}\\mathbf{j}`],
          ]}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text={
          fnId === 'ex411'
            ? 'At $(1, 2)$ the components are $f_{x} = 6$ and $f_{y} = 4$, so $\\nabla f(1, 2) = 6\\mathbf{i} + 4\\mathbf{j}$, as in Example 4.1.1. Each component is a partial derivative: the slope of a slice of the surface (Topic 3).'
            : 'The gradient changes from point to point: it is a vector-valued function. Each component is a partial derivative, the slope of a slice of the surface (Topic 3).'
        }
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 2. Tangent Plane Lab (§4.2.1)
// -----------------------------------------------------------------------------

interface LabSurface {
  id: string;
  label: string;
  tex: string;
  /** F(x, y, z) with the surface F = 0. */
  F: string;
  Ftex: string;
  /** The surface as z = g(x, y) (the sheet shown). */
  z: string;
  box: Box3;
  start: [number, number];
  fromNotes: string;
}

const LAB_SURFACES: LabSurface[] = [
  {
    id: 'ex421',
    label: 'Example 4.2.1',
    tex: 'z^{2} - 2x^{2} - 2y^{2} = 12',
    F: 'z^2 - 2x^2 - 2y^2 - 12',
    Ftex: 'F(x, y, z) = z^{2} - 2x^{2} - 2y^{2} - 12',
    z: 'sqrt(12 + 2x^2 + 2y^2)',
    box: { x: [-2.5, 2.5], y: [-2.5, 2.5], z: [3, 6.2] },
    start: [1, -1],
    fromNotes: 'the upper sheet of the hyperboloid of Example 4.2.1',
  },
  {
    id: 'ex422',
    label: 'Example 4.2.2',
    tex: 'z = 1 - \\frac{1}{10}(x^{2} + 4y^{2})',
    F: '1 - (x^2 + 4y^2)/10 - z',
    Ftex: 'F(x, y, z) = 1 - \\frac{1}{10}(x^{2} + 4y^{2}) - z',
    z: '1 - (x^2 + 4y^2)/10',
    box: { x: [-2.5, 2.5], y: [-2, 2], z: [-1.4, 1.2] },
    start: [1, 1],
    fromNotes: 'the paraboloid of Example 4.2.2',
  },
  {
    id: 'ex423',
    label: 'Example 4.2.3',
    tex: 'xyz = 6',
    F: 'x y z - 6',
    Ftex: 'F(x, y, z) = xyz - 6',
    z: '6/(x y)',
    box: { x: [0.9, 3.6], y: [0.9, 3.6], z: [0.3, 5] },
    start: [2, 3],
    fromNotes: 'the surface of Example 4.2.3 (x, y > 0)',
  },
];

export function TangentPlaneLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const theme = useAppTheme();
  const [surfaceId, setSurfaceId] = useState('ex421');
  const s = LAB_SURFACES.find((x) => x.id === surfaceId) ?? LAB_SURFACES[0]!;
  const [[a, b], setPoint] = useState<[number, number]>(s.start);
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [showF, setShowF] = useState(false);
  const G = useMemo(() => compileFn(s.z, ['x', 'y']), [s.z]);
  const F = useMemo(() => compileFn(s.F, ['x', 'y', 'z']), [s.F]);
  const c = G.value({ x: a, y: b });
  const P = { x: a, y: b, z: c };
  const n: [number, number, number] = [F.d(P, 'x'), F.d(P, 'y'), F.d(P, 'z')];
  const proj = projector(s.box, camera);
  const span = 0.18 * Math.min(s.box.x[1] - s.box.x[0], s.box.y[1] - s.box.y[0]);
  // The tangent plane z = c − (Fx(x − a) + Fy(y − b))/Fz over a square around P (Fz ≠ 0 here).
  const planeZ = (x: number, y: number) => c - (n[0] * (x - a) + n[1] * (y - b)) / n[2];
  const corners: [number, number][] = [
    [a - span, b - span],
    [a + span, b - span],
    [a + span, b + span],
    [a - span, b + span],
  ];
  const plane: FigureItem = {
    k: 'polygon',
    points: corners.map(([x, y]) => {
      const [u, v] = proj(x, y, planeZ(x, y));
      return [u, v];
    }),
    tone: 'fill2',
    opacity: 0.7,
    outline: 'curve2',
  };
  const length = Math.hypot(...n) || 1;
  const t = (0.35 * (s.box.z[1] - s.box.z[0])) / Math.max(Math.abs(n[2] / length), 0.35);
  const along = (k: number): [number, number, number] => [
    a + (k * t * n[0]) / length,
    b + (k * t * n[1]) / length,
    c + (k * t * n[2]) / length,
  ];
  const scene = surfaceScene(
    (x, y) => G.value({ x, y }),
    s.box,
    camera,
    [
      plane,
      spaceSegment(along(-0.6), along(0.6), s.box, camera, { tone: 'asymptote', width: 2.4 }),
      ...spacePoint([a, b, c], s.box, camera, 'text'),
    ],
    { n: 18, opacity: 0.75 },
  );
  const isStart = Math.abs(a - s.start[0]) < 1e-9 && Math.abs(b - s.start[1]) < 1e-9;

  return (
    <ExploreScaffold
      activity={activity}
      intro="At a point $P$ of the surface $F(x, y, z) = 0$, the tangent plane is normal to $\nabla F(P)$ and the normal line points along it (Theorem 4.2.1). Move $P$ and watch both."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {LAB_SURFACES.map((x) => (
          <ChipButton
            key={x.id}
            label={x.label}
            selected={x.id === surfaceId}
            onPress={() => {
              setSurfaceId(x.id);
              setPoint(x.start);
              changed(`surface-${x.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={s.tex} display />
        <Visualisation fromNotes={s.fromNotes} />
        <LiveScene
          scene={scene}
          description={`The surface ${s.label} with the point P = (${fmt(a)}, ${fmt(b)}, ${fmt(c)}), its tangent plane (a shaded square) and its normal line.`}
        />
        <AppText variant="small" color="textSecondary">
          Shaded square: part of the tangent plane at P. Solid line through P: the normal line.
        </AppText>
        <Slider
          label="x of P"
          value={a}
          min={s.box.x[0] + 0.3}
          max={s.box.x[1] - 0.3}
          step={0.05}
          onChange={(v) => {
            setPoint([v, b]);
            changed('move-x');
          }}
          valueText={`x = ${fmt(a)}`}
        />
        <Slider
          label="y of P"
          value={b}
          min={s.box.y[0] + 0.3}
          max={s.box.y[1] - 0.3}
          step={0.05}
          onChange={(v) => {
            setPoint([a, v]);
            changed('move-y');
          }}
          valueText={`y = ${fmt(b)}`}
        />
        <TurnSlider
          camera={camera}
          onChange={(cam) => {
            setCamera(cam);
            changed('turn');
          }}
        />
        <ChipRow>
          <ChipButton
            label={showF ? 'Hide F(x, y, z)' : 'Show F(x, y, z)'}
            selected={showF}
            onPress={() => {
              setShowF((v) => !v);
              changed('show-F');
            }}
          />
          <ChipButton
            label="Back to the example point"
            onPress={() => {
              setPoint(s.start);
              changed('reset');
            }}
          />
        </ChipRow>
        {showF ? (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="small" color="textSecondary">
              The surface written as F(x, y, z) = 0 (§4.2.1):
            </AppText>
            <MathExpression tex={s.Ftex} display />
          </View>
        ) : null}
        <Readout
          rows={[
            ['P', `(${fmt(a)}, ${fmt(b)}, ${fmt(c)})`],
            ['∇F(P)', `${fmt(n[0])}\\mathbf{i} ${signed(n[1])}\\mathbf{j} ${signed(n[2])}\\mathbf{k}`],
            [
              'Tangent plane',
              `${fmt(n[0])}${minusPoint('x', a)} ${signed(n[1])}${minusPoint('y', b)} ${signed(n[2])}${minusPoint('z', c)} = 0`,
            ],
            ['Normal line direction', `${fmt(n[0])}, \\; ${fmt(n[1])}, \\; ${fmt(n[2])}`],
          ]}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text={
          isStart && surfaceId === 'ex421'
            ? 'At $(1, -1, 4)$, $\\nabla F = -4\\mathbf{i} + 4\\mathbf{j} + 8\\mathbf{k}$, and the plane simplifies to $x - y - 2z + 6 = 0$, as in Example 4.2.1.'
            : isStart && surfaceId === 'ex423'
              ? 'At $(2, 3, 1)$, $\\nabla F = 3\\mathbf{i} + 2\\mathbf{j} + 6\\mathbf{k}$: the direction numbers of the normal line in Example 4.2.3.'
              : 'One vector, $\\nabla F(P)$, gives both: the plane is normal to it and the line points along it. Values shown are rounded.'
        }
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 3. Critical Point Finder (§4.3.1, opening)
// -----------------------------------------------------------------------------

interface FinderFunction {
  id: string;
  label: string;
  tex: string;
  text: string;
  x: [number, number];
  y: [number, number];
  start: [number, number];
  /** Critical points where the partial derivatives do not exist (not found numerically). */
  undefinedAt: [number, number][];
  fromNotes: string | null;
}

const FINDER_FUNCTIONS: FinderFunction[] = [
  {
    id: 'ex431',
    label: 'Example 4.3.1',
    tex: 'f(x, y) = 2x^{2} + y^{2} + 8x - 6y + 20',
    text: '2x^2 + y^2 + 8x - 6y + 20',
    x: [-4.5, 0.5],
    y: [0.5, 5.5],
    start: [-1, 2],
    undefinedAt: [],
    fromNotes: 'the function of Example 4.3.1',
  },
  {
    id: 'ex432',
    label: 'Example 4.3.2',
    tex: 'f(x, y) = 1 - (x^{2} + y^{2})^{\\frac{1}{3}}',
    text: '1 - (x^2 + y^2)^(1/3)',
    x: [-2, 2],
    y: [-2, 2],
    start: [0.8, 0.6],
    undefinedAt: [[0, 0]],
    fromNotes: 'the function of Example 4.3.2',
  },
  {
    id: 'cubic',
    label: 'x³ − 3x + y²',
    tex: 'f(x, y) = x^{3} - 3x + y^{2}',
    text: 'x^3 - 3x + y^2',
    x: [-2, 2],
    y: [-2, 2],
    start: [0.5, 0.5],
    undefinedAt: [],
    fromNotes: null,
  },
];

export function CriticalPointFinder({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [fnId, setFnId] = useState('ex431');
  const fn = FINDER_FUNCTIONS.find((f) => f.id === fnId) ?? FINDER_FUNCTIONS[0]!;
  const [[a, b], setPoint] = useState<[number, number]>(fn.start);
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const F = useMemo(() => compileFn(fn.text, ['x', 'y']), [fn.text]);
  const { curves, found } = useMemo(() => {
    const fx = (x: number, y: number) => F.d({ x, y }, 'x');
    const fy = (x: number, y: number) => F.d({ x, y }, 'y');
    return {
      curves: [
        levelCurve(fx, fn.x, fn.y, 0, { tone: 'curve', width: 2.2, n: 48 }),
        levelCurve(fy, fn.x, fn.y, 0, { tone: 'curve2', width: 2.2, dashed: true, n: 48 }),
      ],
      found: findCriticalPoints((x, y) => F.value({ x, y }), fn.x, fn.y),
    };
  }, [F, fn.x, fn.y]);
  const marks: FigureItem[] = [
    ...found.flatMap((p): FigureItem[] => [
      { k: 'point', x: p.x, y: p.y, tone: 'asymptote' },
      { k: 'label', x: p.x, y: p.y + 0.06 * (fn.y[1] - fn.y[0]), text: 'critical', size: 'small', anchor: 'middle' },
    ]),
    ...fn.undefinedAt.flatMap(([x, y]): FigureItem[] => [
      { k: 'point', x, y, tone: 'asymptote' },
      {
        k: 'label',
        x,
        y: y + 0.06 * (fn.y[1] - fn.y[0]),
        text: 'critical (undefined)',
        size: 'small',
        anchor: 'middle',
      },
    ]),
  ];
  const scene = flat(fn.x, fn.y, [...curves, ...marks, { k: 'point', x: a, y: b, tone: 'text' }]);
  const box: Box3 = { x: fn.x, y: fn.y, z: zRange((x, y) => F.value({ x, y }), fn.x, fn.y) };
  const surface = surfaceScene((x, y) => F.value({ x, y }), box, camera, [
    ...found.flatMap((p) => spacePoint([p.x, p.y, F.value({ x: p.x, y: p.y })], box, camera)),
    ...fn.undefinedAt.flatMap(([x, y]) => spacePoint([x, y, F.value({ x, y })], box, camera)),
  ]);
  const fxv = F.d({ x: a, y: b }, 'x');
  const fyv = F.d({ x: a, y: b }, 'y');
  const exists = Number.isFinite(fxv) && Number.isFinite(fyv);
  const isCritical = exists && Math.abs(fxv) < 0.05 && Math.abs(fyv) < 0.05;
  const verdict = !exists
    ? 'The partial derivatives do not exist here: a critical point of the second type.'
    : isCritical
      ? 'Both partial derivatives are (about) 0 here: a critical point.'
      : 'Not a critical point: at least one partial derivative is not 0.';

  return (
    <ExploreScaffold
      activity={activity}
      intro="A critical point is where $f_{x} = 0$ and $f_{y} = 0$, or where the partial derivatives do not exist (§4.3.1). The two curves show where each partial derivative is 0: they meet at critical points."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {FINDER_FUNCTIONS.map((p) => (
          <ChipButton
            key={p.id}
            label={p.label}
            selected={p.id === fnId}
            onPress={() => {
              setFnId(p.id);
              setPoint(p.start);
              changed(`fn-${p.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        <Visualisation fromNotes={fn.fromNotes} />
        <LiveScene
          scene={scene}
          description={`In the xy-plane: the curve f_x = 0 (solid), the curve f_y = 0 (dashed) and ${found.length + fn.undefinedAt.length} critical point(s), labelled. The probe point is at (${fmt(a)}, ${fmt(b)}).`}
        />
        <AppText variant="small" color="textSecondary">
          Solid curve: f_x = 0. Dashed curve: f_y = 0. Labelled points: critical points.
        </AppText>
        <Slider
          label="Probe x"
          value={a}
          min={fn.x[0]}
          max={fn.x[1]}
          step={0.05}
          onChange={(v) => {
            setPoint([v, b]);
            changed('move-x');
          }}
          valueText={`x = ${fmt(a)}`}
        />
        <Slider
          label="Probe y"
          value={b}
          min={fn.y[0]}
          max={fn.y[1]}
          step={0.05}
          onChange={(v) => {
            setPoint([a, v]);
            changed('move-y');
          }}
          valueText={`y = ${fmt(b)}`}
        />
        <Readout
          rows={[
            ['f_x at the probe', exists ? `f_{x} = ${fmt(fxv)}` : 'f_{x} \\text{ does not exist}'],
            ['f_y at the probe', exists ? `f_{y} = ${fmt(fyv)}` : 'f_{y} \\text{ does not exist}'],
            [
              'Critical points',
              [
                ...found.map((p) => `(${fmt(p.x)}, ${fmt(p.y)})`),
                ...fn.undefinedAt.map(([x, y]) => `(${x}, ${y})`),
              ].join(', \\; ') || '\\text{none}',
            ],
          ]}
        />
        <AppText variant="small">{verdict}</AppText>
      </LabCard>
      <LabCard>
        <AppText variant="caption" color="textSecondary">
          The surface z = f(x, y), with the critical points marked
        </AppText>
        <LiveScene scene={surface} description={`The surface of ${fn.label}, with its critical points marked.`} />
        <TurnSlider
          camera={camera}
          onChange={(cam) => {
            setCamera(cam);
            changed('turn');
          }}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text={
          fnId === 'ex432'
            ? 'Example 4.3.2: the partial derivatives exist everywhere except $(0, 0)$ and are never both 0, so $(0, 0)$ is the only critical point, and $f$ has a relative maximum there.'
            : fnId === 'ex431'
              ? 'Example 4.3.1: the lines $4x + 8 = 0$ and $2y - 6 = 0$ meet at the only critical point $(-2, 3)$, where $f$ has a relative minimum of 3.'
              : 'A critical point is where to look for a relative extremum (Theorem 4.3.2). Whether it is one is decided in the next subtopic.'
        }
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// 4. Saddle or Not (§4.3.1, The Second Partials Test)
// -----------------------------------------------------------------------------

export function SaddleOrNot({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [mode, setMode] = useState<'sliders' | 'ex433'>('sliders');
  const [A, setA] = useState(2);
  const [B, setB] = useState(1);
  const [C, setC] = useState(0.5);
  const [which, setWhich] = useState<'origin' | 'max'>('origin');
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);

  const sliderMode = mode === 'sliders';
  // Sliders: the quadratic with these second partial derivatives at (0, 0) (made for the app).
  const q = (x: number, y: number) => 0.5 * (A * x * x + 2 * C * x * y + B * y * y);
  // Example 4.3.3: f = −x³ + 4xy − 2y² + 1, with fxx = −6x, fyy = −4, fxy = 4.
  const ex = (x: number, y: number) => -x * x * x + 4 * x * y - 2 * y * y + 1;
  const point: [number, number] = which === 'origin' ? [0, 0] : [4 / 3, 4 / 3];
  const second = sliderMode ? { fxx: A, fyy: B, fxy: C } : { fxx: -6 * point[0], fyy: -4, fxy: 4 };
  const d = second.fxx * second.fyy - second.fxy * second.fxy;
  const type = classify(second.fxx, d);
  const f = sliderMode ? q : ex;
  const xr: [number, number] = sliderMode ? [-1.5, 1.5] : [-1, 2.5];
  const box: Box3 = { x: xr, y: xr, z: zRange(f, xr, xr) };
  const marks = sliderMode
    ? spacePoint([0, 0, 0], box, camera)
    : [
        ...spacePoint([0, 0, ex(0, 0)], box, camera, which === 'origin' ? 'text' : 'asymptote'),
        ...spacePoint([4 / 3, 4 / 3, ex(4 / 3, 4 / 3)], box, camera, which === 'max' ? 'text' : 'asymptote'),
      ];
  const surface = surfaceScene(f, box, camera, marks, { n: 20 });
  const reason =
    type === 'saddle'
      ? 'd < 0, so it is a saddle point (the sign of f_xx does not matter).'
      : type === 'inconclusive'
        ? 'd = 0, so the Second Partials Test is inconclusive.'
        : `d > 0 and f_xx ${type === 'min' ? '> 0' : '< 0'}, so it is a ${TYPE_LABEL[type]}.`;

  return (
    <ExploreScaffold
      activity={activity}
      intro="Theorem 4.3.3 classifies a critical point with $d = f_{xx}f_{yy} - [f_{xy}]^{2}$. Change the second partial derivatives and watch $d$, the classification and the surface change together."
      explored={explored}
      error={error}
    >
      <ChipRow>
        <ChipButton
          label="Set the second partials"
          selected={sliderMode}
          onPress={() => {
            setMode('sliders');
            changed('mode-sliders');
          }}
        />
        <ChipButton
          label="Example 4.3.3"
          selected={!sliderMode}
          onPress={() => {
            setMode('ex433');
            changed('mode-example');
          }}
        />
      </ChipRow>
      <LabCard>
        {sliderMode ? (
          <>
            <MathExpression
              tex={`f(x, y) = \\frac{1}{2}(${fmt(A)}x^{2} ${signed(2 * C)}xy ${signed(B)}y^{2})`}
              display
            />
            <AppText variant="small" color="textSecondary">
              A function made for the app: at its critical point (0, 0) it has exactly the second partial derivatives
              you set. App-created visualisation.
            </AppText>
          </>
        ) : (
          <>
            <MathExpression tex="f(x, y) = -x^{3} + 4xy - 2y^{2} + 1" display />
            <Visualisation fromNotes="the function of Example 4.3.3" />
            <ChipRow>
              <ChipButton
                label="(0, 0)"
                selected={which === 'origin'}
                onPress={() => {
                  setWhich('origin');
                  changed('point-origin');
                }}
              />
              <ChipButton
                label="(4/3, 4/3)"
                selected={which === 'max'}
                onPress={() => {
                  setWhich('max');
                  changed('point-max');
                }}
              />
            </ChipRow>
          </>
        )}
        <LiveScene
          scene={surface}
          description={`The surface near the critical point. d = ${fmt(d)}: ${TYPE_LABEL[type]}.`}
        />
        <TurnSlider
          camera={camera}
          onChange={(cam) => {
            setCamera(cam);
            changed('turn');
          }}
        />
        {sliderMode ? (
          <>
            <Slider
              label="f_xx"
              value={A}
              min={-3}
              max={3}
              step={0.5}
              onChange={(v) => {
                setA(v);
                changed('fxx');
              }}
              valueText={`f_xx = ${fmt(A)}`}
            />
            <Slider
              label="f_yy"
              value={B}
              min={-3}
              max={3}
              step={0.5}
              onChange={(v) => {
                setB(v);
                changed('fyy');
              }}
              valueText={`f_yy = ${fmt(B)}`}
            />
            <Slider
              label="f_xy"
              value={C}
              min={-3}
              max={3}
              step={0.5}
              onChange={(v) => {
                setC(v);
                changed('fxy');
              }}
              valueText={`f_xy = ${fmt(C)}`}
            />
          </>
        ) : null}
        <Readout
          rows={[
            [
              'Second partials',
              `f_{xx} = ${fmt(second.fxx)}, \\; f_{yy} = ${fmt(second.fyy)}, \\; f_{xy} = ${fmt(second.fxy)}`,
            ],
            ['d', `d = ${fmt(second.fxx)}(${fmt(second.fyy)}) - (${fmt(second.fxy)})^{2} = ${fmt(d)}`],
            ['Type', `\\text{${TYPE_LABEL[type]}}`],
          ]}
        />
        <AppText variant="small">{reason}</AppText>
      </LabCard>
      <Insight
        title="What to notice"
        text={
          sliderMode
            ? 'Make $f_{xy}$ large compared with $f_{xx}$ and $f_{yy}$: $d$ turns negative and the bowl becomes a saddle, even when $f_{xx}$ and $f_{yy}$ are both positive. At $d = 0$ the test gives no answer.'
            : 'As in Example 4.3.3: at $(0, 0)$, $d = 0 - 16 < 0$, a saddle point; at $\\left(\\frac{4}{3}, \\frac{4}{3}\\right)$, $d = -8(-4) - 16 = 16 > 0$ with $f_{xx} = -8 < 0$, a relative maximum.'
        }
      />
    </ExploreScaffold>
  );
}
