/**
 * Topic 3 Create studios (Differential Calculus in ℝⁿ): Domain Region,
 * Surface Slice, Chain Network and Coordinate Grid.
 *
 * A project is a stack of layers. Each layer has COURSE-ALIGNED settings,
 * which decide the mathematics (the function, the slices, the paths, the
 * grid), and CREATIVE EXTENSION settings, which only arrange and colour what
 * the mathematics produced (rotated copies, colour roles, line weight,
 * opacity, the surface underneath). The project's view (zoom and pan) and an
 * optional animation phase only change how the artwork is framed and moved:
 * the level value, the slice position, a pulse along the chain-rule paths, or
 * one sweeping coordinate curve.
 *
 * `rnArtScene` turns a project into one figure scene for the shared SVG
 * renderer; `rnArtMath` / `rnLayerMath` give the "Math behind my art"
 * readout. Colours are theme roles only. Pure functions; nothing here
 * touches React.
 */
import type { FigureItem, FigureScene, FigureView, FillTone, StrokeTone } from '@/lib/figures/scene';
import {
  boxAxes,
  boxTicks,
  type Box3,
  compileFn,
  CUBE_VIEW,
  definedCells,
  fmt,
  path2,
  spaceCurve,
  surfaceFaces,
} from '@/lib/explore/rn';
import { withMathAxes } from '@/lib/figures/ticks';

export type RnStudioKind = 'domainRegion' | 'surfaceSlice' | 'chainNetwork' | 'coordinateGrid';

export interface RnCreative {
  /** Rotated copies about the centre (1 = just the mathematics). */
  copies: 1 | 2 | 3 | 4 | 6;
  /** Which theme colour roles carry the mathematics. */
  scheme: 'primary' | 'secondary' | 'warm';
  /** Line weight multiplier. */
  weight: number;
  /** Surface Slice: draw the shaded surface under the slices (default true). */
  surface?: boolean;
}

export interface RnCourse {
  /** Function, chain example or coordinate system (studio-specific id). */
  source: string;
  /** Domain Region: level spacing of the bands. Surface Slice: number of slices. Grid: curves per family. */
  count: number;
  /** Surface Slice: which variable is held constant ('x' slices are y = const…). Chain: the independent variable ('x' = s, 'y' = t). */
  direction: 'x' | 'y' | 'both';
  /** Surface Slice: the held value c of a third variable. */
  value: number;
}

export interface RnLayer {
  id: string;
  name: string;
  visible: boolean;
  /** 0.15 to 1 (creative extension). */
  opacity: number;
  course: RnCourse;
  creative: RnCreative;
}

/** Framing only: 1 = fit the whole artwork; pan is a fraction of the half-width / half-height. */
export interface RnView {
  zoom: number;
  panX: number;
  panY: number;
}

/** Math view shows the coordinate structure (numbered axes, 3D axes with their scale); Art view is the clean artwork. */
export type RnDisplay = 'math' | 'art';

export interface RnArtProject {
  version: 2;
  studio: RnStudioKind;
  title: string;
  layers: RnLayer[];
  selectedId: string;
  view: RnView;
  /** Play the studio's animation when the project is open (not while reduced motion is on). */
  animate: boolean;
  display: RnDisplay;
  explanation: string;
}

/** A starter layer: overrides of the activity's starter course and the default creative settings. */
export interface RnStarterLayer {
  name: string;
  course?: Partial<RnCourse>;
  creative?: Partial<RnCreative>;
  opacity?: number;
}

/** Studio settings for an activity (topic data). */
export interface RnStudioConfig {
  studio: RnStudioKind;
  /** The starter's course settings (shared by every starter layer unless overridden). */
  starter: RnCourse;
  /** The starter composition, bottom layer first (one layer when absent). */
  starterLayers?: RnStarterLayer[];
  /** The question learners answer in their own words. */
  question: string;
}

export const MAX_RN_LAYERS = 5;
export const FIT_VIEW: RnView = { zoom: 1, panX: 0, panY: 0 };

// -----------------------------------------------------------------------------
// The mathematics each studio offers
// -----------------------------------------------------------------------------

export interface DomainSource {
  label: string;
  text: string;
  tex: string;
  x: [number, number];
  y: [number, number];
  origin: string;
}

export const DOMAIN_SOURCES: Record<string, DomainSource> = {
  ex311: {
    label: 'Example 3.1.1(i)',
    text: 'sqrt(x^2 + y^2 - 9)/x',
    tex: 'f(x, y) = \\frac{\\sqrt{x^{2} + y^{2} - 9}}{x}',
    x: [-6, 6],
    y: [-6, 6],
    origin: 'Example 3.1.1(i)',
  },
  cap: {
    label: 'Cap',
    text: 'sqrt(16 - x^2 - y^2)',
    tex: 'f(x, y) = \\sqrt{16 - x^{2} - y^{2}}',
    x: [-5, 5],
    y: [-5, 5],
    origin: 'a function made for the app',
  },
  ring: {
    label: 'Ring',
    text: 'sqrt((9 - x^2 - y^2)(x^2 + y^2 - 1))',
    tex: 'f(x, y) = \\sqrt{(9 - x^{2} - y^{2})(x^{2} + y^{2} - 1)}',
    x: [-4, 4],
    y: [-4, 4],
    origin: 'a function made for the app',
  },
  saddle: {
    label: 'Saddle root',
    text: 'sqrt(x^2 - y^2)',
    tex: 'f(x, y) = \\sqrt{x^{2} - y^{2}}',
    x: [-5, 5],
    y: [-5, 5],
    origin: 'a function made for the app',
  },
};

export interface SurfaceSource {
  label: string;
  /** Formula in x and y (and c, the held value of a third variable, when `third` is set). */
  text: string;
  tex: string;
  x: [number, number];
  y: [number, number];
  third?: { name: string; range: [number, number] };
  origin: string;
}

export const SURFACE_SOURCES: Record<string, SurfaceSource> = {
  ex321: {
    label: 'Example 3.2.1',
    text: '3x - x^2 y^2 + 2x^3 y',
    tex: 'f(x, y) = 3x - x^{2}y^{2} + 2x^{3}y',
    x: [-1.5, 1.5],
    y: [-1.5, 1.5],
    origin: 'Example 3.2.1',
  },
  ex322: {
    label: 'Example 3.2.2',
    text: 'x e^(x^2 y)',
    tex: 'f(x, y) = xe^{x^{2}y}',
    x: [-1.2, 1.2],
    y: [-1, 1],
    origin: 'Example 3.2.2',
  },
  ex331: {
    label: 'Example 3.3.1(i)',
    text: '2x sin(y) - 3x^2 y^2',
    tex: 'z = 2x\\sin y - 3x^{2}y^{2}',
    x: [-1, 1],
    y: [-2, 2],
    origin: 'Example 3.3.1(i)',
  },
  ex324: {
    label: 'Example 3.2.4',
    text: '3x y^2 - 2y + 5x^2 y^2',
    tex: 'f(x, y) = 3xy^{2} - 2y + 5x^{2}y^{2}',
    x: [-1, 1],
    y: [-1, 1],
    origin: 'Example 3.2.4',
  },
  ex323: {
    label: 'Example 3.2.3(ii), z held at c',
    text: 'c sin(x y^2 + 2c)',
    tex: 'f(x, y, c) = c\\sin(xy^{2} + 2c)',
    x: [-2, 2],
    y: [-1.5, 1.5],
    third: { name: 'z', range: [0.2, 2] },
    origin: 'Example 3.2.3(ii), with z held constant',
  },
  ripple: {
    label: 'Ripple',
    text: 'sin(x) cos(y)',
    tex: 'f(x, y) = \\sin x\\cos y',
    x: [-3, 3],
    y: [-3, 3],
    origin: 'a function made for the app',
  },
};

export interface ChainSource {
  label: string;
  tex: string;
  /** Intermediate variables and, for each independent variable, the edge derivatives. */
  middle: string[];
  independents: string[];
  origin: string;
}

export const CHAIN_SOURCES: Record<string, ChainSource> = {
  ex341: {
    label: 'Example 3.4.1',
    tex: 'w = x^{2}y - y^{2}, \\quad x = \\sin t, \\quad y = e^{t}',
    middle: ['x', 'y'],
    independents: ['t'],
    origin: 'Example 3.4.1 (Figure 3.1)',
  },
  ex343: {
    label: 'Example 3.4.3',
    tex: 'w = 2xy, \\quad x = s^{2} + t^{2}, \\quad y = \\frac{s}{t}',
    middle: ['x', 'y'],
    independents: ['s', 't'],
    origin: 'Example 3.4.3 (Figure 3.2)',
  },
  ex344: {
    label: 'Example 3.4.4',
    tex: 'w = xy + yz + xz, \\quad x = s\\cos t, \\quad y = s\\sin t, \\quad z = t',
    middle: ['x', 'y', 'z'],
    independents: ['s', 't'],
    origin: 'Example 3.4.4',
  },
};

export interface GridSource {
  label: string;
  tex: string;
  /** The map from the new coordinates (a, b) to the plane. */
  map: (a: number, b: number) => [number, number];
  a: [number, number];
  b: [number, number];
  names: [string, string];
  view: number;
  origin: string;
}

export const GRID_SOURCES: Record<string, GridSource> = {
  polar: {
    label: 'Polar (Example 3.4.7)',
    tex: 'x = r\\cos\\theta, \\quad y = r\\sin\\theta',
    map: (r, t) => [r * Math.cos(t), r * Math.sin(t)],
    a: [0.25, 3],
    b: [0, 2 * Math.PI],
    names: ['r', 'θ'],
    view: 3.2,
    origin: 'Example 3.4.7',
  },
  parabolic: {
    label: 'Parabolic (Example 3.4.6)',
    tex: 'x = \\frac{u^{2} - v^{2}}{2}, \\quad y = uv',
    map: (u, v) => [(u * u - v * v) / 2, u * v],
    a: [0, 2.2],
    b: [-2.2, 2.2],
    names: ['u', 'v'],
    view: 3,
    origin: 'Example 3.4.6',
  },
  exponential: {
    label: 'Exponential polar (Tutorial 4 form)',
    tex: 'x = e^{u}\\cos v, \\quad y = e^{u}\\sin v',
    map: (u, v) => [Math.exp(u) * Math.cos(v), Math.exp(u) * Math.sin(v)],
    a: [-1.2, 1.1],
    b: [0, 2 * Math.PI],
    names: ['u', 'v'],
    view: 3.2,
    origin: 'the coordinates of Tutorial 4 Q33–Q34',
  },
};

/** Function / example / system choices for a studio, in display order. */
export function sourcesFor(studio: RnStudioKind): { id: string; label: string }[] {
  const table =
    studio === 'domainRegion'
      ? DOMAIN_SOURCES
      : studio === 'surfaceSlice'
        ? SURFACE_SOURCES
        : studio === 'chainNetwork'
          ? CHAIN_SOURCES
          : GRID_SOURCES;
  return Object.entries(table).map(([id, s]) => ({ id, label: s.label }));
}

export const COUNT_RANGE: Record<RnStudioKind, [number, number, number]> = {
  domainRegion: [1, 8, 1],
  surfaceSlice: [1, 12, 1],
  chainNetwork: [1, 1, 1],
  coordinateGrid: [3, 16, 1],
};

export const DEFAULT_CREATIVE: RnCreative = { copies: 1, scheme: 'primary', weight: 1, surface: true };

let layerCounter = 0;
/** A fresh layer id (unique within a project). */
export const newLayerId = (): string => `layer-${Date.now().toString(36)}-${(layerCounter++).toString(36)}`;

export function newRnProject(config: RnStudioConfig, title: string): RnArtProject {
  const starters = config.starterLayers ?? [{ name: 'Layer 1' }];
  const layers = starters.map((s): RnLayer => ({
    id: newLayerId(),
    name: s.name,
    visible: true,
    opacity: s.opacity ?? 1,
    course: { ...config.starter, ...s.course },
    creative: { ...DEFAULT_CREATIVE, ...s.creative },
  }));
  return {
    version: 2,
    studio: config.studio,
    title,
    layers,
    selectedId: layers[layers.length - 1]!.id,
    view: { ...FIT_VIEW },
    animate: false,
    display: 'math',
    explanation: '',
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/**
 * A saved project in the current form. Projects saved before layers existed
 * (version 1: one `course` and one `creative`) open as a single layer.
 */
export function normaliseRnProject(saved: unknown): RnArtProject | null {
  if (!isRecord(saved) || typeof saved.studio !== 'string') return null;
  const studio = saved.studio as RnStudioKind;
  const base = {
    studio,
    title: typeof saved.title === 'string' ? saved.title : 'My artwork',
    explanation: typeof saved.explanation === 'string' ? saved.explanation : '',
    // Projects saved before Math view existed open in Math view.
    display: (saved.display === 'art' ? 'art' : 'math') as RnDisplay,
  };
  if (saved.version === 2 && Array.isArray(saved.layers) && saved.layers.length > 0) {
    const project = saved as unknown as RnArtProject;
    const layers = project.layers.map((l) => ({ ...l, creative: { ...DEFAULT_CREATIVE, ...l.creative } }));
    return {
      ...project,
      ...base,
      version: 2,
      layers,
      selectedId: layers.some((l) => l.id === project.selectedId) ? project.selectedId : layers[0]!.id,
      view: { ...FIT_VIEW, ...project.view },
      animate: project.animate === true,
    };
  }
  if (isRecord(saved.course) && isRecord(saved.creative)) {
    const layer: RnLayer = {
      id: newLayerId(),
      name: 'Layer 1',
      visible: true,
      opacity: 1,
      course: saved.course as unknown as RnCourse,
      creative: { ...DEFAULT_CREATIVE, ...(saved.creative as unknown as RnCreative) },
    };
    return { ...base, version: 2, layers: [layer], selectedId: layer.id, view: { ...FIT_VIEW }, animate: false };
  }
  return null;
}

// -----------------------------------------------------------------------------
// Scenes (one layer at a time)
// -----------------------------------------------------------------------------

const TONES: Record<RnCreative['scheme'], { main: StrokeTone; second: StrokeTone; fill: FillTone; fill2: FillTone }> = {
  primary: { main: 'curve', second: 'curve2', fill: 'fill', fill2: 'fill2' },
  secondary: { main: 'curve2', second: 'asymptote', fill: 'fill2', fill2: 'fill3' },
  warm: { main: 'asymptote', second: 'curve', fill: 'fill3', fill2: 'fill' },
};

/** Rotates the drawable items about (cx, cy) by `angle` (labels and nodes are not copied). */
function rotateItems(items: FigureItem[], angle: number, cx: number, cy: number): FigureItem[] {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const r = ([x, y]: [number, number]): [number, number] => [
    cx + (x - cx) * ca - (y - cy) * sa,
    cy + (x - cx) * sa + (y - cy) * ca,
  ];
  return items.flatMap((item): FigureItem[] => {
    switch (item.k) {
      case 'polyline':
      case 'polygon':
        return [{ ...item, points: item.points.map((p) => (Number.isFinite(p[0]) ? r(p) : p)) }];
      case 'polygons':
        return [{ ...item, polys: item.polys.map((poly) => poly.map(r)) }];
      case 'segment': {
        const [x1, y1] = r([item.x1, item.y1]);
        const [x2, y2] = r([item.x2, item.y2]);
        return [{ ...item, x1, y1, x2, y2 }];
      }
      case 'point': {
        const [x, y] = r([item.x, item.y]);
        return [{ ...item, x, y }];
      }
      default:
        return [];
    }
  });
}

function withCopies(items: FigureItem[], creative: RnCreative, cx: number, cy: number): FigureItem[] {
  const copies: FigureItem[] = [];
  for (let k = 1; k < creative.copies; k++)
    copies.push(...rotateItems(items, (2 * Math.PI * k) / creative.copies, cx, cy));
  return [...copies, ...items];
}

/** Applies the layer's opacity to its strokes and fills (creative extension). */
const withOpacity = (items: FigureItem[], opacity: number): FigureItem[] =>
  opacity >= 1
    ? items
    : items.map((i) =>
        i.k === 'polygon' || i.k === 'polygons' || i.k === 'polyline'
          ? { ...i, opacity: (i.opacity ?? 1) * opacity }
          : i,
      );

/** Animation phase in [0, 1), or null for the still artwork. */
type Phase = number | null;

function domainScene(p: RnLayer, phase: Phase): FigureScene {
  const src = DOMAIN_SOURCES[p.course.source] ?? DOMAIN_SOURCES.ex311!;
  const F = compileFn(src.text, ['x', 'y']);
  const f = (x: number, y: number) => F.value({ x, y });
  const tones = TONES[p.creative.scheme];
  // Level bands: cells of the domain coloured by which band of width `count` the value falls in.
  // Animation raises the level value through two bands, so the level curves flow.
  const step = p.course.count;
  const shift = phase === null ? 0 : 2 * phase;
  // The formula is sampled once per function (cached); each change only regroups the cells,
  // and each band is drawn as one shape, so the studio stays responsive on a phone.
  const even: [number, number][][] = [];
  const odd: [number, number][][] = [];
  for (const cell of definedCells(f, src.x, src.y, 44, `rn-domain:${src.text}`)) {
    const band = Math.floor(cell.value / step - shift);
    (Math.abs(band) % 2 === 0 ? even : odd).push(cell.square);
  }
  const bands: FigureItem[] = [
    ...(even.length ? [{ k: 'polygons' as const, polys: even, tone: tones.fill, opacity: 0.95 }] : []),
    ...(odd.length ? [{ k: 'polygons' as const, polys: odd, tone: tones.fill2, opacity: 0.95 }] : []),
  ];
  const items = withCopies(bands, p.creative, 0, 0);
  return {
    view: { xMin: src.x[0], xMax: src.x[1], yMin: src.y[0], yMax: src.y[1] },
    aspect: (src.y[1] - src.y[0]) / (src.x[1] - src.x[0]),
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
    items,
  };
}

function surfaceScene(p: RnLayer, phase: Phase, display: RnDisplay): FigureScene {
  const src = SURFACE_SOURCES[p.course.source] ?? SURFACE_SOURCES.ex321!;
  const vars = src.third ? ['x', 'y', 'c'] : ['x', 'y'];
  const F = compileFn(src.text, vars);
  const c = p.course.value;
  const f = (x: number, y: number) => F.value({ x, y, c });
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= 20; i++)
    for (let j = 0; j <= 20; j++) {
      const v = f(src.x[0] + ((src.x[1] - src.x[0]) * i) / 20, src.y[0] + ((src.y[1] - src.y[0]) * j) / 20);
      if (Number.isFinite(v)) [lo, hi] = [Math.min(lo, v), Math.max(hi, v)];
    }
  const pad = Math.max(0.1, 0.08 * (hi - lo));
  const box: Box3 = { x: src.x, y: src.y, z: [lo - pad, hi + pad] };
  const camera = { azimuth: -0.65, elevation: 0.5 };
  const tones = TONES[p.creative.scheme];
  const n = p.course.count;
  const slices: FigureItem[] = [];
  // Still: slices evenly spread over the domain. Animated: they sweep across it (the held value moves).
  const fraction = (k: number) => (phase === null ? (n === 1 ? 0.5 : k / (n - 1)) : (k + phase) / n);
  const along = (dir: 'x' | 'y', k: number) => {
    const frac = fraction(k);
    if (dir === 'x') {
      const b = src.y[0] + (src.y[1] - src.y[0]) * frac;
      return spaceCurve(
        (s) => {
          const x = src.x[0] + (src.x[1] - src.x[0]) * s;
          return [x, b, f(x, b)];
        },
        box,
        camera,
        { tone: tones.main, width: 2.2 * p.creative.weight },
      );
    }
    const a = src.x[0] + (src.x[1] - src.x[0]) * frac;
    return spaceCurve(
      (s) => {
        const y = src.y[0] + (src.y[1] - src.y[0]) * s;
        return [a, y, f(a, y)];
      },
      box,
      camera,
      { tone: tones.second, width: 2.2 * p.creative.weight },
    );
  };
  for (let k = 0; k < n; k++) {
    if (p.course.direction !== 'y') slices.push(along('x', k));
    if (p.course.direction !== 'x') slices.push(along('y', k));
  }
  const faces =
    p.creative.surface === false ? [] : surfaceFaces(f, box, camera, { n: 18, tone: tones.fill, opacity: 0.35 });
  const items = withCopies([...faces, ...slices], p.creative, 0, 0);
  // Math view: the x, y and z axes with their range (only for a single copy, where they mean something).
  const axes = display === 'math' && p.creative.copies === 1 ? [...boxAxes(box, camera), ...boxTicks(box, camera)] : [];
  // The projection centre is (0, 0); keep the copies inside the view.
  return { view: CUBE_VIEW, aspect: 0.82, axes: { x: false, y: false }, items: [...axes, ...items] };
}

/** Node positions of the chain-rule tree for a source (w on top, independent variables at the bottom). */
export function chainLayout(src: ChainSource): {
  nodes: { id: string; x: number; y: number; text: string }[];
  edges: { from: string; to: string }[];
} {
  const nodes = [{ id: 'w', x: 0, y: 5, text: 'w' }];
  const edges: { from: string; to: string }[] = [];
  const m = src.middle.length;
  const k = src.independents.length;
  const width = Math.max(m * k, m) * 1.7;
  src.middle.forEach((v, i) => {
    const x = m === 1 ? 0 : -width / 2 + ((i + 0.5) * width) / m;
    nodes.push({ id: v, x, y: 2.6, text: v });
    edges.push({ from: 'w', to: v });
    // z = t in Example 3.4.4 depends on t only.
    const leaves = src.label === 'Example 3.4.4' && v === 'z' ? ['t'] : src.independents;
    leaves.forEach((s, j) => {
      const spread = 1.7;
      const lx = x + (leaves.length === 1 ? 0 : (j - (leaves.length - 1) / 2) * spread);
      nodes.push({ id: `${v}-${s}`, x: lx, y: 0.2, text: s });
      edges.push({ from: v, to: `${v}-${s}` });
    });
  });
  return { nodes, edges };
}

/** The independent variable whose paths a chain layer lights ('x' = s, 'y' = t, or the only one). */
export function chainTarget(src: ChainSource, direction: RnCourse['direction']): string {
  const wanted = direction === 'y' ? 't' : 's';
  return src.independents.includes(wanted) ? wanted : src.independents[0]!;
}

function chainScene(p: RnLayer, phase: Phase): FigureScene {
  const src = CHAIN_SOURCES[p.course.source] ?? CHAIN_SOURCES.ex341!;
  const tones = TONES[p.creative.scheme];
  const target = chainTarget(src, p.course.direction);
  const { nodes, edges } = chainLayout(src);
  const at = new Map(nodes.map((n) => [n.id, n]));
  const leaves = nodes.filter((n) => n.text === target && n.y < 1);
  const lit = new Set(leaves.flatMap((n) => [n.id, n.id.split('-')[0]!]));
  const r = 0.55;
  const lines: FigureItem[] = edges.map((e) => {
    const a = at.get(e.from)!;
    const b = at.get(e.to)!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
    const on = lit.has(e.to) && (e.from === 'w' || lit.has(e.from));
    return {
      k: 'segment',
      x1: a.x + ux * r,
      y1: a.y + uy * r,
      x2: b.x - ux * r,
      y2: b.y - uy * r,
      tone: on ? tones.main : 'guide',
      width: (on ? 3.4 : 1.4) * p.creative.weight,
    };
  });
  // Animation: a pulse travels down every lit path, from w to the chosen variable (one product each).
  const pulses: FigureItem[] =
    phase === null
      ? []
      : leaves.map((leaf): FigureItem => {
          const mid = at.get(leaf.id.split('-')[0]!)!;
          const top = at.get('w')!;
          const [from, to, t] = phase < 0.5 ? [top, mid, phase * 2] : [mid, leaf, phase * 2 - 1];
          return { k: 'point', x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, tone: tones.second };
        });
  const minX = Math.min(...nodes.map((n) => n.x)) - 1.2;
  const maxX = Math.max(...nodes.map((n) => n.x)) + 1.2;
  const span = Math.max(maxX - minX, 6.5);
  // Rotated copies turn about the root w, so every copy grows from the same w: a flower of chain-rule trees.
  const root = at.get('w')!;
  // In each rotated copy, a dot marks where each intermediate and independent variable sits.
  const joints: FigureItem[] = nodes
    .filter((n) => n.id !== 'w')
    .map((n) => ({ k: 'point', x: n.x, y: n.y, tone: tones.main }));
  const copiedJoints = withCopies(joints, p.creative, root.x, root.y).slice(0, -joints.length || undefined);
  const copies = [...copiedJoints, ...withCopies([...lines, ...pulses], p.creative, root.x, root.y)];
  const nodeItems: FigureItem[] = nodes.map((n) => ({ k: 'node', x: n.x, y: n.y, r, text: n.text }));
  const reach = Math.max(...nodes.map((n) => Math.hypot(n.x - root.x, n.y - root.y))) + 1;
  const half = span / 2;
  return {
    view:
      p.creative.copies > 1
        ? { xMin: root.x - reach, xMax: root.x + reach, yMin: root.y - reach, yMax: root.y + reach }
        : { xMin: -half, xMax: half, yMin: -0.9, yMax: 5.9 },
    aspect: p.creative.copies > 1 ? 1 : 6.8 / (2 * half),
    axes: { x: false, y: false },
    items: [...copies, ...nodeItems],
  };
}

function gridScene(p: RnLayer, phase: Phase): FigureScene {
  const src = GRID_SOURCES[p.course.source] ?? GRID_SOURCES.polar!;
  const tones = TONES[p.creative.scheme];
  const n = p.course.count;
  const items: FigureItem[] = [];
  for (let k = 0; k <= n; k++) {
    const a = src.a[0] + ((src.a[1] - src.a[0]) * k) / n;
    items.push(
      path2((b) => src.map(a, b), src.b[0], src.b[1], { tone: tones.main, width: 1.5 * p.creative.weight, steps: 90 }),
    );
    const b = src.b[0] + ((src.b[1] - src.b[0]) * k) / n;
    items.push(
      path2((s) => src.map(s, b), src.a[0], src.a[1], {
        tone: tones.second,
        width: 1.5 * p.creative.weight,
        steps: 90,
      }),
    );
  }
  // Animation: one curve of constant first coordinate sweeps through the grid.
  if (phase !== null) {
    const a = src.a[0] + (src.a[1] - src.a[0]) * phase;
    items.push(
      path2((b) => src.map(a, b), src.b[0], src.b[1], {
        tone: tones.second,
        width: 3.6 * p.creative.weight,
        steps: 120,
      }),
    );
  }
  const all = withCopies(items, p.creative, 0, 0);
  return {
    view: { xMin: -src.view, xMax: src.view, yMin: -src.view, yMax: src.view },
    aspect: 1,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y' },
    items: all.map((i) =>
      i.k === 'polyline'
        ? {
            ...i,
            points: i.points.map(([x, y]): [number, number] =>
              Math.abs(x) > src.view * 1.5 || Math.abs(y) > src.view * 1.5 ? [Number.NaN, Number.NaN] : [x, y],
            ),
          }
        : i,
    ),
  };
}

/** The artwork of one layer. */
export function rnLayerScene(
  studio: RnStudioKind,
  layer: RnLayer,
  phase: Phase = null,
  display: RnDisplay = 'math',
): FigureScene {
  const scene =
    studio === 'domainRegion'
      ? domainScene(layer, phase)
      : studio === 'surfaceSlice'
        ? surfaceScene(layer, phase, display)
        : studio === 'chainNetwork'
          ? chainScene(layer, phase)
          : gridScene(layer, phase);
  return { ...scene, items: withOpacity(scene.items, layer.opacity) };
}

/** The view that holds every visible layer, framed by the project's zoom and pan. */
function framed(scenes: FigureScene[], view: RnView): { view: FigureView; aspect: number } {
  const first = scenes[0]!;
  const union = scenes.reduce<FigureView>(
    (u, s) => ({
      xMin: Math.min(u.xMin, s.view.xMin),
      xMax: Math.max(u.xMax, s.view.xMax),
      yMin: Math.min(u.yMin, s.view.yMin),
      yMax: Math.max(u.yMax, s.view.yMax),
    }),
    { ...first.view },
  );
  // Keep the first layer's ratio of vertical to horizontal scale.
  const unit = (first.aspect * (first.view.xMax - first.view.xMin)) / (first.view.yMax - first.view.yMin);
  const zoom = Math.min(8, Math.max(0.5, view.zoom));
  const hw = (union.xMax - union.xMin) / 2;
  const hh = (union.yMax - union.yMin) / 2;
  const cx = (union.xMin + union.xMax) / 2 + view.panX * hw;
  const cy = (union.yMin + union.yMax) / 2 + view.panY * hh;
  const w = hw / zoom;
  const h = hh / zoom;
  return { view: { xMin: cx - w, xMax: cx + w, yMin: cy - h, yMax: cy + h }, aspect: (unit * hh) / hw };
}

/**
 * Layer scenes by layer object (layers are replaced, never mutated): zooming, moving and
 * changing another layer reuse the drawing instead of recomputing surfaces and grids.
 */
const LAYER_SCENES = new WeakMap<RnLayer, Map<string, FigureScene>>();
function cachedLayerScene(studio: RnStudioKind, layer: RnLayer, phase: Phase, display: RnDisplay): FigureScene {
  const key = `${studio}|${display}|${phase ?? 'still'}`;
  let byKey = LAYER_SCENES.get(layer);
  if (!byKey) {
    byKey = new Map();
    LAYER_SCENES.set(layer, byKey);
  }
  const hit = byKey.get(key);
  if (hit) return hit;
  const scene = rnLayerScene(studio, layer, phase, display);
  // Keep the still drawings and the latest animation frame only.
  for (const k of byKey.keys()) if (!k.endsWith('|still')) byKey.delete(k);
  byKey.set(key, scene);
  return scene;
}

/**
 * The artwork from exactly what it depends on: the studio, the layers and the view. Screens
 * memoise on these, so typing a title or explanation never redraws the canvas.
 */
export function rnSceneOf(
  studio: RnStudioKind,
  layers: readonly RnLayer[],
  frame: RnView,
  phase: Phase = null,
  display: RnDisplay = 'math',
): FigureScene {
  const scenes = layers.filter((l) => l.visible).map((l) => cachedLayerScene(studio, l, phase, display));
  if (scenes.length === 0) {
    return { view: { xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, aspect: 0.8, axes: { x: false, y: false }, items: [] };
  }
  const { view, aspect } = framed(scenes, frame);
  const scene: FigureScene = { view, aspect, axes: scenes[0]!.axes, items: scenes.flatMap((s) => s.items) };
  if (display === 'art') return { ...scene, axes: { x: false, y: false } };
  // Math view on a graph: numbered axes, computed after zoom and pan so the numbers match the view.
  // No extra grid: the bands and grid curves already fill the plane.
  return scene.axes.x || scene.axes.y ? withMathAxes(scene, { grid: false }) : scene;
}

/** The artwork of a project: its visible layers, bottom first, framed by its view. */
export const rnArtScene = (p: RnArtProject, phase: Phase = null): FigureScene =>
  rnSceneOf(p.studio, p.layers, p.view, phase, p.display);

// -----------------------------------------------------------------------------
// Math behind my art
// -----------------------------------------------------------------------------

export interface RnArtMath {
  /** The mathematics the artwork is made from (TeX). */
  tex: string;
  rows: { label: string; tex: string }[];
  explanation: string;
  origin: string;
}

/** The mathematics of one layer. */
export function rnLayerMath(studio: RnStudioKind, p: RnLayer): RnArtMath {
  switch (studio) {
    case 'domainRegion': {
      const src = DOMAIN_SOURCES[p.course.source] ?? DOMAIN_SOURCES.ex311!;
      return {
        tex: src.tex,
        rows: [
          { label: 'Shaded cells', tex: '\\text{points where } f(x, y) \\text{ is defined and real}' },
          { label: 'Band width', tex: `${fmt(p.course.count)}` },
        ],
        explanation: `Only the domain is coloured: a cell is drawn when the formula gives a real value at its centre. Its colour alternates with the band of width ${fmt(p.course.count)} that f(x, y) falls in, so the colour boundaries are level curves f(x, y) = constant.`,
        origin: src.origin,
      };
    }
    case 'surfaceSlice': {
      const src = SURFACE_SOURCES[p.course.source] ?? SURFACE_SOURCES.ex321!;
      const held =
        p.course.direction === 'x'
          ? 'y held constant'
          : p.course.direction === 'y'
            ? 'x held constant'
            : 'x or y held constant';
      return {
        tex: src.tex,
        rows: [
          { label: 'Slices', tex: `${p.course.count} \\text{ per direction}` },
          {
            label: 'Each slice',
            tex:
              p.course.direction === 'y'
                ? 'z = f(a, y)'
                : p.course.direction === 'x'
                  ? 'z = f(x, b)'
                  : 'z = f(x, b) \\text{ and } z = f(a, y)',
          },
          ...(src.third
            ? [{ label: `Held ${src.third.name}`, tex: `${src.third.name} = c = ${fmt(p.course.value)}` }]
            : []),
        ],
        explanation:
          `Each line is a slice of the surface with ${held}: a curve of one variable, whose slope is the partial derivative (§3.2.1). ${p.course.direction === 'both' ? 'Crossing slices in both directions show f_x and f_y at every crossing point.' : ''}`.trim(),
        origin: src.origin,
      };
    }
    case 'chainNetwork': {
      const src = CHAIN_SOURCES[p.course.source] ?? CHAIN_SOURCES.ex341!;
      const target = chainTarget(src, p.course.direction);
      const paths = chainLayout(src).nodes.filter((n) => n.text === target && n.y < 1).length;
      const symbol =
        src.independents.length === 1 ? `\\frac{dw}{d${target}}` : `\\frac{\\partial w}{\\partial ${target}}`;
      return {
        tex: src.tex,
        rows: [
          { label: 'Highlighted', tex: `\\text{paths from } w \\text{ to } ${target}` },
          {
            label: 'Products',
            tex: `${symbol} \\text{ is a sum of } ${paths} \\text{ product${paths === 1 ? '' : 's'}}`,
          },
        ],
        explanation: `The tree is the dependency diagram of the Chain Rule (Figures 3.1 and 3.2). Each highlighted path from w down to ${target} is one product of derivatives; ${symbol.includes('dw') ? 'dw/dt' : `∂w/∂${target}`} is their sum.`,
        origin: src.origin,
      };
    }
    case 'coordinateGrid': {
      const src = GRID_SOURCES[p.course.source] ?? GRID_SOURCES.polar!;
      return {
        tex: src.tex,
        rows: [
          { label: 'Curves', tex: `${src.names[0]} = \\text{constant and } ${src.names[1]} = \\text{constant}` },
          { label: 'Curves per family', tex: `${p.course.count + 1}` },
        ],
        explanation: `The two families of curves are where one new coordinate is constant. Changing variables (Examples 3.4.5 to 3.4.7) rewrites derivatives along these curves instead of along the x- and y-axes.`,
        origin: src.origin,
      };
    }
  }
}

/** The selected layer of a project. */
export const selectedLayer = (p: RnArtProject): RnLayer => p.layers.find((l) => l.id === p.selectedId) ?? p.layers[0]!;

/** The mathematics of the project's selected layer. */
export const rnArtMath = (p: RnArtProject): RnArtMath => rnLayerMath(p.studio, selectedLayer(p));

/** Readable summary lines for the saved composition: every layer's mathematics. */
export function rnArtSummary(p: RnArtProject): string[] {
  return p.layers.flatMap((l) => {
    const math = rnLayerMath(p.studio, l);
    return [`${l.name}${l.visible ? '' : ' (hidden)'}: ${math.tex}`, ...math.rows.map((r) => `  ${r.label}: ${r.tex}`)];
  });
}

/** What the animation shows in each studio (for the studio's caption). */
export const ANIMATION_TEXT: Record<RnStudioKind, string> = {
  domainRegion: 'The level value rises, so the level curves between the bands move across the domain.',
  surfaceSlice: 'The held value moves, so each slice sweeps across the surface.',
  chainNetwork:
    'A pulse travels down every lit path from w to the chosen variable: one product of the Chain Rule each.',
  coordinateGrid: 'One curve of constant first coordinate sweeps through the grid.',
};

export const RN_EXPLANATION_MIN = 20;
