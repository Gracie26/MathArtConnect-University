/**
 * The Topic 4 Create studios (app-created visualisations; Chapter 4 has no
 * figures):
 *
 *   Gradient Field Art   arrows of ∇f across the plane; every arrow is (fx, fy) at its point (§4.1)
 *   Faceted Surface      a low-poly surface in which every facet is the tangent plane at the
 *                        centre of its cell (§4.2.1, the z = f(x, y) form of Theorem 4.2.2)
 *   Landscape Designer   a terrain built from peaks, pits and saddles; every critical point with
 *                        fx = fy = 0 is found numerically and labelled by Theorem 4.3.3 (§4.3.1)
 *
 * COURSE-ALIGNED settings decide the mathematics (the function, the grid, the
 * features); CREATIVE settings only colour and arrange it. Arrows and facets
 * are coloured by a mathematical quantity (the length of ∇f, the steepness of
 * the facet), and critical points are labelled in words, never by colour alone.
 * MR4-12: no steepest-ascent or level-curve claim is made about the gradient.
 *
 * Pure functions only; nothing here touches React.
 */
import {
  boxAxes,
  boxTicks,
  CUBE_VIEW,
  type Box3,
  type Camera,
  compileFn,
  fmt,
  projector,
  spaceCurve,
  spacePoint,
  spaceSegment,
} from '@/lib/explore/rn';
import { withMathAxes } from '@/lib/figures/ticks';
import { type CriticalType, findCriticalPoints, type FoundCritical, TYPE_LABEL } from '@/lib/explore/extrema';
import type { FigureItem, FigureScene, FillTone, StrokeTone } from '@/lib/figures/scene';

export type PaStudioKind = 'gradientField' | 'facetedSurface' | 'landscape';

export interface PaStudioConfig {
  studio: PaStudioKind;
  /** Starting source (gradient field / faceted surface) or starter landscape. */
  starter: string;
  /** The "Math behind my art" question. */
  question: string;
}

export type PaScheme = 'primary' | 'warm' | 'secondary';

export interface PaFeature {
  id: string;
  kind: 'peak' | 'pit' | 'saddle';
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface PaCourse {
  /** Function (gradient field) or surface (faceted surface). */
  source: string;
  /** Arrows or facets along each side. */
  density: number;
  /** Landscape features (Landscape Designer only). */
  features: PaFeature[];
}

export interface PaCreative {
  scheme: PaScheme;
  /** Arrow length (gradient field) or gap between facets (faceted surface), 0.4–1. */
  size: number;
  /** Turn of the 3D view in degrees (faceted surface). */
  turn: number;
  /** Show level bands under a landscape. */
  bands: boolean;
  /** Math view shows the coordinate structure (axes, numbers, grid); Art view is the clean artwork. */
  view: 'math' | 'art';
  /** Light Cartesian grid in Math view (2D studios). */
  grid: boolean;
  /** The curved surface as a light mesh behind the facets (Faceted Surface, Math view). */
  mesh: boolean;
}

export interface PaArtProject {
  version: 1;
  studio: PaStudioKind;
  title: string;
  course: PaCourse;
  creative: PaCreative;
  explanation: string;
}

export const PA_EXPLANATION_MIN = 20;
export const MAX_FEATURES = 5;

// -----------------------------------------------------------------------------
// Sources
// -----------------------------------------------------------------------------

export interface FieldSource {
  label: string;
  tex: string;
  text: string;
  x: [number, number];
  y: [number, number];
  /** From the course notes (labelled with its example) or made for the app. */
  origin: string;
}

export const FIELD_SOURCES: Record<string, FieldSource> = {
  saddle: {
    label: 'x² − y²',
    tex: 'f(x, y) = x^{2} - y^{2}',
    text: 'x^2 - y^2',
    x: [-2, 2],
    y: [-2, 2],
    origin: 'a function made for the app',
  },
  ex411: {
    label: 'Example 4.1.1',
    tex: 'f(x, y) = y\\ln x + xy^{2}',
    text: 'y ln(x) + x y^2',
    x: [0.3, 3],
    y: [-1.5, 1.5],
    origin: 'Example 4.1.1 in the notes',
  },
  bowl: {
    label: 'x² + 2y²',
    tex: 'f(x, y) = x^{2} + 2y^{2}',
    text: 'x^2 + 2y^2',
    x: [-2, 2],
    y: [-2, 2],
    origin: 'a function made for the app',
  },
  waves: {
    label: 'sin x cos y',
    tex: 'f(x, y) = \\sin x\\cos y',
    text: 'sin(x) cos(y)',
    x: [-3, 3],
    y: [-3, 3],
    origin: 'a function made for the app',
  },
};

export interface SurfaceSource {
  label: string;
  /** The surface as printed or written, in TeX. */
  tex: string;
  /** z = f(x, y) (the upper sheet where the surface has two), in learner syntax. */
  z: string;
  box: Box3;
  origin: string;
}

export const SURFACE_SOURCES: Record<string, SurfaceSource> = {
  paraboloid: {
    label: 'Example 4.2.2',
    tex: 'z = 1 - \\frac{1}{10}(x^{2} + 4y^{2})',
    z: '1 - (x^2 + 4y^2)/10',
    box: { x: [-2.5, 2.5], y: [-2, 2], z: [-1.4, 1.1] },
    origin: 'Example 4.2.2 in the notes',
  },
  hyperboloid: {
    label: 'Example 4.2.1',
    tex: 'z^{2} - 2x^{2} - 2y^{2} = 12 \\quad (z > 0)',
    z: 'sqrt(12 + 2x^2 + 2y^2)',
    box: { x: [-2, 2], y: [-2, 2], z: [3, 5.4] },
    origin: 'the upper sheet of the hyperboloid of Example 4.2.1',
  },
  saddle: {
    label: 'A saddle',
    tex: 'z = \\frac{1}{2}(x^{2} - y^{2})',
    z: '(x^2 - y^2)/2',
    box: { x: [-2, 2], y: [-2, 2], z: [-2.2, 2.2] },
    origin: 'a surface made for the app',
  },
};

export const LANDSCAPE_STARTERS: Record<string, PaFeature[]> = {
  twoPeaks: [
    { id: 'f1', kind: 'peak', x: -1.2, y: 0.4, height: 2, width: 1 },
    { id: 'f2', kind: 'peak', x: 1.3, y: 0.2, height: 1.5, width: 0.9 },
    { id: 'f3', kind: 'pit', x: 0, y: -1.6, height: 1.2, width: 0.8 },
  ],
  saddle: [{ id: 'f1', kind: 'saddle', x: 0, y: 0, height: 1.5, width: 1.4 }],
};

export const LANDSCAPE_BOX: { x: [number, number]; y: [number, number] } = { x: [-3, 3], y: [-3, 3] };

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------

const DEFAULT_CREATIVE: PaCreative = {
  scheme: 'primary',
  size: 0.8,
  turn: -35,
  bands: true,
  view: 'math',
  grid: true,
  mesh: false,
};

export const DENSITY_RANGE: Record<PaStudioKind, [number, number]> = {
  gradientField: [5, 15],
  facetedSurface: [4, 12],
  landscape: [1, 1],
};

const STARTER_DENSITY: Record<PaStudioKind, number> = { gradientField: 9, facetedSurface: 7, landscape: 1 };

export function newPaProject(config: PaStudioConfig, title: string): PaArtProject {
  const features =
    config.studio === 'landscape' ? (LANDSCAPE_STARTERS[config.starter] ?? []).map((f) => ({ ...f })) : [];
  return {
    version: 1,
    studio: config.studio,
    title,
    course: { source: config.starter, density: STARTER_DENSITY[config.studio], features },
    creative: { ...DEFAULT_CREATIVE },
    explanation: '',
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const num = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;

/** A saved project read back safely (unknown or damaged values fall back to defaults); null if unusable. */
export function normalisePaProject(saved: unknown): PaArtProject | null {
  if (!isRecord(saved) || saved.version !== 1) return null;
  const studio = saved.studio;
  if (studio !== 'gradientField' && studio !== 'facetedSurface' && studio !== 'landscape') return null;
  const course = isRecord(saved.course) ? saved.course : {};
  const creative = isRecord(saved.creative) ? saved.creative : {};
  const sources = studio === 'gradientField' ? FIELD_SOURCES : studio === 'facetedSurface' ? SURFACE_SOURCES : null;
  const source =
    typeof course.source === 'string' && (!sources || course.source in sources)
      ? course.source
      : studio === 'gradientField'
        ? 'saddle'
        : studio === 'facetedSurface'
          ? 'paraboloid'
          : 'twoPeaks';
  const [lo, hi] = DENSITY_RANGE[studio];
  const features = Array.isArray(course.features)
    ? course.features
        .filter(isRecord)
        .slice(0, MAX_FEATURES)
        .map((f, i): PaFeature => ({
          id: typeof f.id === 'string' ? f.id : `f${i + 1}`,
          kind: f.kind === 'pit' || f.kind === 'saddle' ? f.kind : 'peak',
          x: num(f.x, 0, -2.5, 2.5),
          y: num(f.y, 0, -2.5, 2.5),
          height: num(f.height, 1, 0.3, 3),
          width: num(f.width, 1, 0.5, 2),
        }))
    : [];
  return {
    version: 1,
    studio,
    title: typeof saved.title === 'string' ? saved.title : 'My artwork',
    course: { source, density: Math.round(num(course.density, lo, lo, hi)), features },
    creative: {
      scheme: creative.scheme === 'warm' || creative.scheme === 'secondary' ? creative.scheme : 'primary',
      size: num(creative.size, 0.8, 0.4, 1),
      turn: num(creative.turn, -35, -170, 170),
      bands: creative.bands !== false,
      // Projects saved before Math view existed open in Math view, so the coordinates are shown.
      view: creative.view === 'art' ? 'art' : 'math',
      grid: creative.grid !== false,
      mesh: creative.mesh === true,
    },
    explanation: typeof saved.explanation === 'string' ? saved.explanation : '',
  };
}

// -----------------------------------------------------------------------------
// Mathematics
// -----------------------------------------------------------------------------

/** The landscape function: a sum of the features' terms. */
export function landscapeFn(features: readonly PaFeature[]): (x: number, y: number) => number {
  return (x, y) =>
    features.reduce((sum, f) => {
      const u = (x - f.x) / f.width;
      const v = (y - f.y) / f.width;
      const g = Math.exp(-(u * u + v * v));
      if (f.kind === 'peak') return sum + f.height * g;
      if (f.kind === 'pit') return sum - f.height * g;
      return sum + f.height * (u * u - v * v) * g;
    }, 0);
}

/** The landscape formula in TeX (one term per feature). */
export function landscapeTex(features: readonly PaFeature[]): string {
  if (features.length === 0) return 'f(x, y) = 0';
  const term = (f: PaFeature) => {
    const u = `\\frac{(x ${f.x < 0 ? '+' : '-'} ${fmt(Math.abs(f.x))})^{2} + (y ${f.y < 0 ? '+' : '-'} ${fmt(Math.abs(f.y))})^{2}}{${fmt(f.width * f.width)}}`;
    const e = `e^{-${u}}`;
    if (f.kind === 'peak') return `${fmt(f.height)}${e}`;
    if (f.kind === 'pit') return `-${fmt(f.height)}${e}`;
    return `${fmt(f.height)}\\,(u^{2} - v^{2})${e}`;
  };
  return `f(x, y) = ${features.map(term).join(' + ').replace(/\+ -/g, '- ')}`;
}

/** Critical points of the landscape (fx = fy = 0), classified by Theorem 4.3.3. */
export const landscapeCriticals = (features: readonly PaFeature[]): FoundCritical[] =>
  features.length === 0 ? [] : findCriticalPoints(landscapeFn(features), LANDSCAPE_BOX.x, LANDSCAPE_BOX.y, 11);

// -----------------------------------------------------------------------------
// Scenes
// -----------------------------------------------------------------------------

const STROKES: Record<PaScheme, [StrokeTone, StrokeTone, StrokeTone]> = {
  primary: ['curve', 'curve2', 'asymptote'],
  warm: ['asymptote', 'curve', 'curve2'],
  secondary: ['curve2', 'asymptote', 'curve'],
};
const FILLS: Record<PaScheme, [FillTone, FillTone, FillTone]> = {
  primary: ['fill', 'fill2', 'fill3'],
  warm: ['fill3', 'fill', 'fill2'],
  secondary: ['fill2', 'fill3', 'fill'],
};

/** Band 0, 1 or 2 of a value in [0, max]. */
const band = (v: number, max: number) =>
  (max <= 0 ? 0 : Math.min(2, Math.floor((3 * v) / (max * 1.0001)))) as 0 | 1 | 2;

/** What the learner has selected to inspect: an arrow or facet (by grid cell), a critical point, or a point. */
export type PaSelection =
  | { kind: 'cell'; i: number; j: number }
  | { kind: 'critical'; index: number }
  | { kind: 'point'; x: number; y: number }
  | null;

export interface FieldArrow {
  i: number;
  j: number;
  x: number;
  y: number;
  gx: number;
  gy: number;
  len: number;
}

/** The arrows of a gradient field: one per grid cell, at the cell centre, with ∇f = (fx, fy) there. */
export function fieldArrows(p: PaArtProject): FieldArrow[] {
  const src = FIELD_SOURCES[p.course.source] ?? FIELD_SOURCES.saddle!;
  const F = compileFn(src.text, ['x', 'y']);
  const n = p.course.density;
  const arrows: FieldArrow[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = src.x[0] + ((src.x[1] - src.x[0]) * (i + 0.5)) / n;
      const y = src.y[0] + ((src.y[1] - src.y[0]) * (j + 0.5)) / n;
      const gx = F.d({ x, y }, 'x');
      const gy = F.d({ x, y }, 'y');
      const len = Math.hypot(gx, gy);
      if (Number.isFinite(len)) arrows.push({ i, j, x, y, gx, gy, len });
    }
  }
  return arrows;
}

const isMath = (p: PaArtProject) => p.creative.view === 'math';

function gradientFieldScene(p: PaArtProject, selection: PaSelection): FigureScene {
  const src = FIELD_SOURCES[p.course.source] ?? FIELD_SOURCES.saddle!;
  const arrows = fieldArrows(p);
  const cell = Math.min(src.x[1] - src.x[0], src.y[1] - src.y[0]) / p.course.density;
  const longest = Math.max(...arrows.map((a) => a.len), 1e-9);
  const tones = STROKES[p.creative.scheme];
  const selected =
    selection?.kind === 'cell' ? arrows.find((a) => a.i === selection.i && a.j === selection.j) : undefined;
  const segment = (a: FieldArrow, tone: StrokeTone, width: number): FigureItem => {
    // Arrow length grows with |∇f| (scaled to fit the cell); direction is (fx, fy).
    const L = (0.9 * cell * p.creative.size * (0.35 + (0.65 * a.len) / longest)) / a.len;
    return {
      k: 'segment',
      x1: a.x - (a.gx * L) / 2,
      y1: a.y - (a.gy * L) / 2,
      x2: a.x + (a.gx * L) / 2,
      y2: a.y + (a.gy * L) / 2,
      tone,
      arrow: 'end',
      width,
    };
  };
  const items: FigureItem[] = arrows.map((a) =>
    a.len < 1e-9 ? { k: 'point', x: a.x, y: a.y, tone: tones[0] } : segment(a, tones[band(a.len, longest)], 2),
  );
  if (selected) {
    items.push(...(selected.len < 1e-9 ? [] : [segment(selected, 'text', 3.4)]), {
      k: 'point',
      x: selected.x,
      y: selected.y,
      tone: 'text',
    });
  }
  const scene: FigureScene = {
    view: { xMin: src.x[0], xMax: src.x[1], yMin: src.y[0], yMax: src.y[1] },
    aspect: (src.y[1] - src.y[0]) / (src.x[1] - src.x[0]),
    axes: isMath(p) ? { x: true, y: true, xLabel: 'x', yLabel: 'y' } : { x: false, y: false },
    items,
  };
  return isMath(p) ? withMathAxes(scene, { grid: p.creative.grid }) : scene;
}

export interface Facet {
  i: number;
  j: number;
  /** The sample point P = (a, b, c) at the centre of the cell. */
  a: number;
  b: number;
  c: number;
  fx: number;
  fy: number;
  depth: number;
  points: [number, number][];
}

const cameraOf = (p: PaArtProject): Camera => ({ azimuth: (p.creative.turn * Math.PI) / 180, elevation: 0.5 });

/** The tangent-plane facets of the surface, sorted far to near. */
export function surfaceFacets(p: PaArtProject): Facet[] {
  const src = SURFACE_SOURCES[p.course.source] ?? SURFACE_SOURCES.paraboloid!;
  const F = compileFn(src.z, ['x', 'y']);
  const P = projector(src.box, cameraOf(p));
  const n = p.course.density;
  const { x, y } = src.box;
  const dx = (x[1] - x[0]) / n;
  const dy = (y[1] - y[0]) / n;
  const shrink = 1 - 0.5 * (1 - p.creative.size);
  const facets: Facet[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = x[0] + (i + 0.5) * dx;
      const b = y[0] + (j + 0.5) * dy;
      const c = F.value({ x: a, y: b });
      const fx = F.d({ x: a, y: b }, 'x');
      const fy = F.d({ x: a, y: b }, 'y');
      if (![c, fx, fy].every(Number.isFinite)) continue;
      // The tangent plane at (a, b, c): z = c + fx (x − a) + fy (y − b), over the (shrunken) cell.
      const projected = (
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ] as const
      ).map(([s, t]) => {
        const X = a + (s * shrink * dx) / 2;
        const Y = b + (t * shrink * dy) / 2;
        return P(X, Y, c + fx * (X - a) + fy * (Y - b));
      });
      facets.push({
        i,
        j,
        a,
        b,
        c,
        fx,
        fy,
        depth: projected.reduce((sum, q) => sum + q[2], 0) / 4,
        points: projected.map(([u, v]) => [u, v]),
      });
    }
  }
  return facets.sort((m, k) => k.depth - m.depth);
}

function facetedScene(p: PaArtProject, selection: PaSelection): FigureScene {
  const src = SURFACE_SOURCES[p.course.source] ?? SURFACE_SOURCES.paraboloid!;
  const camera = cameraOf(p);
  const F = compileFn(src.z, ['x', 'y']);
  const facets = surfaceFacets(p);
  const steepest = Math.max(...facets.map((f) => Math.hypot(f.fx, f.fy)), 1e-9);
  const fills = FILLS[p.creative.scheme];
  const items: FigureItem[] = [];
  if (isMath(p)) {
    items.push(...boxAxes(src.box, camera), ...boxTicks(src.box, camera));
    if (p.creative.mesh) {
      // The surface itself as a light mesh, for comparing each facet with the curved surface.
      for (let k = 0; k <= 6; k++) {
        const xk = src.box.x[0] + ((src.box.x[1] - src.box.x[0]) * k) / 6;
        const yk = src.box.y[0] + ((src.box.y[1] - src.box.y[0]) * k) / 6;
        items.push(
          spaceCurve(
            (t) => {
              const y = src.box.y[0] + (src.box.y[1] - src.box.y[0]) * t;
              return [xk, y, F.value({ x: xk, y })];
            },
            src.box,
            camera,
            { tone: 'guide', width: 1 },
          ),
          spaceCurve(
            (t) => {
              const x = src.box.x[0] + (src.box.x[1] - src.box.x[0]) * t;
              return [x, yk, F.value({ x, y: yk })];
            },
            src.box,
            camera,
            { tone: 'guide', width: 1 },
          ),
        );
      }
    }
  }
  items.push(
    ...facets.map((f) => ({
      k: 'polygon' as const,
      points: f.points,
      tone: fills[band(Math.hypot(f.fx, f.fy), steepest)],
      opacity: 0.9,
      outline: 'edge' as const,
    })),
  );
  const chosen =
    selection?.kind === 'cell' ? facets.find((f) => f.i === selection.i && f.j === selection.j) : undefined;
  if (chosen) {
    // Outline the chosen facet, mark P, and draw the normal direction (fx, fy, −1) through P.
    items.push({
      k: 'polyline',
      points: [...chosen.points, chosen.points[0]!],
      tone: 'text',
      width: 3,
    });
    items.push(...spacePoint([chosen.a, chosen.b, chosen.c], src.box, camera, 'text'));
    const zSpan = src.box.z[1] - src.box.z[0];
    const s = (0.3 * zSpan) / Math.max(1, Math.hypot(chosen.fx, chosen.fy));
    items.push(
      spaceSegment(
        [chosen.a, chosen.b, chosen.c],
        [chosen.a - s * chosen.fx, chosen.b - s * chosen.fy, chosen.c + s],
        src.box,
        camera,
        { tone: 'asymptote', width: 2.6 },
      ),
    );
  }
  return { view: CUBE_VIEW, aspect: 0.82, axes: { x: false, y: false }, items };
}

const MARK: Record<CriticalType, string> = { max: 'max', min: 'min', saddle: 'saddle', inconclusive: '?' };

function landscapeScene(p: PaArtProject, selection: PaSelection): FigureScene {
  const f = landscapeFn(p.course.features);
  const { x, y } = LANDSCAPE_BOX;
  const n = 36;
  const items: FigureItem[] = [];
  if (p.creative.bands) {
    let lo = Infinity;
    let hi = -Infinity;
    const values: number[][] = [];
    for (let i = 0; i < n; i++) {
      values.push([]);
      for (let j = 0; j < n; j++) {
        const v = f(x[0] + ((x[1] - x[0]) * (i + 0.5)) / n, y[0] + ((y[1] - y[0]) * (j + 0.5)) / n);
        values[i]!.push(v);
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
    const fills = FILLS[p.creative.scheme];
    const polys: [number, number][][][] = [[], [], []];
    const w = (x[1] - x[0]) / n;
    const h = (y[1] - y[0]) / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = values[i]![j]!;
        // Three height bands: low, middle, high (the shading shows height; labels show types).
        const k = hi - lo < 1e-9 ? 1 : Math.min(2, Math.floor((3 * (v - lo)) / (hi - lo + 1e-9)));
        const x0 = x[0] + i * w;
        const y0 = y[0] + j * h;
        polys[k]!.push([
          [x0, y0],
          [x0 + w, y0],
          [x0 + w, y0 + h],
          [x0, y0 + h],
        ]);
      }
    }
    polys.forEach((list, k) => {
      if (list.length > 0) items.push({ k: 'polygons', polys: list, tone: fills[k], opacity: 0.55 });
    });
  }
  const found = landscapeCriticals(p.course.features);
  found.forEach((c, index) => {
    const chosen = selection?.kind === 'critical' && selection.index === index;
    items.push(
      { k: 'point', x: c.x, y: c.y, tone: chosen ? 'text' : c.type === 'saddle' ? 'curve2' : 'asymptote' },
      { k: 'label', x: c.x, y: c.y + 0.22, text: MARK[c.type], size: 'small', anchor: 'middle' },
    );
  });
  if (selection?.kind === 'point') items.push({ k: 'point', x: selection.x, y: selection.y, tone: 'text' });
  const scene: FigureScene = {
    view: { xMin: x[0], xMax: x[1], yMin: y[0], yMax: y[1] },
    aspect: 1,
    axes: isMath(p) ? { x: true, y: true, xLabel: 'x', yLabel: 'y' } : { x: false, y: false },
    items,
  };
  return isMath(p) ? withMathAxes(scene, { grid: p.creative.grid }) : scene;
}

export function paArtScene(p: PaArtProject, selection: PaSelection = null): FigureScene {
  if (p.studio === 'gradientField') return gradientFieldScene(p, selection);
  if (p.studio === 'facetedSurface') return facetedScene(p, selection);
  return landscapeScene(p, selection);
}

// -----------------------------------------------------------------------------
// Inspecting a selection (readout and screen-reader text)
// -----------------------------------------------------------------------------

/** A sensible first selection, so the readout explains something before the learner taps. */
export function defaultSelection(p: PaArtProject): PaSelection {
  if (p.studio === 'landscape')
    return landscapeCriticals(p.course.features).length > 0 ? { kind: 'critical', index: 0 } : null;
  const n = p.course.density;
  return { kind: 'cell', i: Math.min(n - 1, Math.floor((3 * n) / 4)), j: Math.floor(n / 2) };
}

/** The selection nearest to a tap (graph coordinates for 2D studios, projected coordinates for 3D). */
export function pickAt(p: PaArtProject, x: number, y: number): PaSelection {
  if (p.studio === 'gradientField') {
    const nearest = fieldArrows(p).sort((m, k) => Math.hypot(m.x - x, m.y - y) - Math.hypot(k.x - x, k.y - y))[0];
    return nearest ? { kind: 'cell', i: nearest.i, j: nearest.j } : null;
  }
  if (p.studio === 'facetedSurface') {
    // The front-most facet whose drawn outline contains the tap.
    const inside = (pts: [number, number][]) => {
      let hit = false;
      for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
        const [xa, ya] = pts[a]!;
        const [xb, yb] = pts[b]!;
        if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) hit = !hit;
      }
      return hit;
    };
    const front = surfaceFacets(p)
      .filter((f) => inside(f.points))
      .sort((m, k) => m.depth - k.depth)[0];
    return front ? { kind: 'cell', i: front.i, j: front.j } : null;
  }
  const found = landscapeCriticals(p.course.features);
  const index = found.findIndex((c) => Math.hypot(c.x - x, c.y - y) < 0.35);
  return index >= 0 ? { kind: 'critical', index } : { kind: 'point', x, y };
}

/** Moves a cell selection by one step (for the arrow buttons), staying inside the grid. */
export function stepSelection(p: PaArtProject, selection: PaSelection, di: number, dj: number): PaSelection {
  const n = p.course.density;
  if (p.studio === 'landscape') {
    const count = landscapeCriticals(p.course.features).length;
    if (count === 0) return selection;
    const index = selection?.kind === 'critical' ? selection.index : -1;
    return { kind: 'critical', index: (((index + di + dj) % count) + count) % count };
  }
  const base = selection?.kind === 'cell' ? selection : (defaultSelection(p) as { kind: 'cell'; i: number; j: number });
  return { kind: 'cell', i: Math.min(n - 1, Math.max(0, base.i + di)), j: Math.min(n - 1, Math.max(0, base.j + dj)) };
}

export interface PaInspection {
  title: string;
  rows: [label: string, tex: string][];
  /** The same information as one sentence for screen readers. */
  spoken: string;
}

const pt = (...v: number[]) => `(${v.map(fmt).join(', ')})`;
const signedTex = (v: number) => (v < 0 ? `- ${fmt(-v)}` : `+ ${fmt(v)}`);

/** What the selection is, mathematically: its point, its vector or plane, and its classification. */
export function paInspect(p: PaArtProject, selection: PaSelection): PaInspection | null {
  if (!selection) return null;
  if (p.studio === 'gradientField' && selection.kind === 'cell') {
    const a = fieldArrows(p).find((x) => x.i === selection.i && x.j === selection.j);
    if (!a) return null;
    return {
      title: `Arrow at ${pt(a.x, a.y)}`,
      rows: [
        ['Point', pt(a.x, a.y)],
        ['Gradient', `\\nabla f = ${fmt(a.gx)}\\mathbf{i} ${signedTex(a.gy)}\\mathbf{j}`],
        ['Length', `|\\nabla f| = ${fmt(a.len)}`],
      ],
      spoken: `Arrow at x ${fmt(a.x)}, y ${fmt(a.y)}. Gradient components f x ${fmt(a.gx)} and f y ${fmt(a.gy)}. Length ${fmt(a.len)}.`,
    };
  }
  if (p.studio === 'facetedSurface' && selection.kind === 'cell') {
    const f = surfaceFacets(p).find((x) => x.i === selection.i && x.j === selection.j);
    if (!f) return null;
    const plane = `${fmt(f.fx)}(x ${signedTex(-f.a)}) ${signedTex(f.fy)}(y ${signedTex(-f.b)}) - (z ${signedTex(-f.c)}) = 0`;
    return {
      title: `Facet at P = ${pt(f.a, f.b, f.c)}`,
      rows: [
        ['P', pt(f.a, f.b, f.c)],
        ['Partial derivatives', `f_{x} = ${fmt(f.fx)}, \\; f_{y} = ${fmt(f.fy)}`],
        ['Tangent plane', plane],
        ['Normal direction', `(${fmt(f.fx)}, ${fmt(f.fy)}, -1)`],
      ],
      spoken: `Facet at P with x ${fmt(f.a)}, y ${fmt(f.b)}, z ${fmt(f.c)}. f x ${fmt(f.fx)}, f y ${fmt(f.fy)}. Tangent plane ${fmt(f.fx)} times x minus ${fmt(f.a)}, plus ${fmt(f.fy)} times y minus ${fmt(f.b)}, minus z minus ${fmt(f.c)}, equals 0.`,
    };
  }
  if (p.studio === 'landscape') {
    const f = landscapeFn(p.course.features);
    if (selection.kind === 'critical') {
      const c = landscapeCriticals(p.course.features)[selection.index];
      if (!c) return null;
      return {
        title: `Critical point ${pt(c.x, c.y)}`,
        rows: [
          ['Point', `${pt(c.x, c.y)}, \\; f = ${fmt(f(c.x, c.y))}`],
          ['Second partials', `f_{xx} = ${fmt(c.fxx)}, \\; f_{yy} = ${fmt(c.fyy)}, \\; f_{xy} = ${fmt(c.fxy)}`],
          ['d', `d = ${fmt(c.d)}`],
          ['Type', `\\text{${TYPE_LABEL[c.type]}}`],
        ],
        spoken: `Critical point at x ${fmt(c.x)}, y ${fmt(c.y)}. d equals ${fmt(c.d)}, f x x equals ${fmt(c.fxx)}: ${TYPE_LABEL[c.type]}.`,
      };
    }
    if (selection.kind === 'point') {
      const h = 1e-4;
      const gx = (f(selection.x + h, selection.y) - f(selection.x - h, selection.y)) / (2 * h);
      const gy = (f(selection.x, selection.y + h) - f(selection.x, selection.y - h)) / (2 * h);
      return {
        title: `Point ${pt(selection.x, selection.y)}`,
        rows: [
          ['Point', pt(selection.x, selection.y)],
          ['Height', `f = ${fmt(f(selection.x, selection.y))}`],
          ['Gradient', `\\nabla f = ${fmt(gx)}\\mathbf{i} ${signedTex(gy)}\\mathbf{j}`],
        ],
        spoken: `Point x ${fmt(selection.x)}, y ${fmt(selection.y)}, height ${fmt(f(selection.x, selection.y))}. Not a critical point.`,
      };
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// "Math behind my art"
// -----------------------------------------------------------------------------

export interface PaArtMath {
  tex: string;
  rows: { label: string; tex: string }[];
  explanation: string;
  origin: string;
}

/** The settings behind the artwork, in words (shown in "Math behind my art" and saved with it). */
function settingsRow(p: PaArtProject, count: string): { label: string; tex: string } {
  const view = p.creative.view === 'math' ? 'Math view' : 'Art view';
  return { label: `Your settings (${view}, size ${Math.round(p.creative.size * 100)}%)`, tex: count };
}

/**
 * The mathematics of the artwork as the learner set it up: their surface or
 * field, their grid, and the arrow or facet they selected (or a default one).
 */
export function paArtMath(p: PaArtProject, selection: PaSelection = null): PaArtMath {
  const chosen = selection?.kind === 'cell' ? selection : defaultSelection(p);
  const cell = chosen?.kind === 'cell' ? chosen : null;
  if (p.studio === 'gradientField') {
    const src = FIELD_SOURCES[p.course.source] ?? FIELD_SOURCES.saddle!;
    const arrows = fieldArrows(p);
    const arrow = arrows.find((x) => cell && x.i === cell.i && x.j === cell.j) ?? arrows[0];
    return {
      tex: src.tex,
      rows: [
        { label: 'Gradient (§4.1)', tex: '\\nabla f(x, y) = f_{x}(x, y)\\mathbf{i} + f_{y}(x, y)\\mathbf{j}' },
        ...(arrow
          ? [
              {
                label: `${selection ? 'Selected arrow' : 'One arrow'}, at (${fmt(arrow.x)}, ${fmt(arrow.y)})`,
                tex: `\\nabla f = ${fmt(arrow.gx)}\\mathbf{i} ${signedTex(arrow.gy)}\\mathbf{j}, \\; |\\nabla f| = ${fmt(arrow.len)}`,
              },
            ]
          : []),
        settingsRow(p, `${p.course.density} \\times ${p.course.density} \\text{ arrows}`),
      ],
      explanation: `Each arrow is drawn at the centre of a grid cell in the direction of the vector (f_x, f_y) there; longer and differently coloured arrows have a larger |∇f|. Arrow sizes are scaled to fit the grid.`,
      origin: src.origin,
    };
  }
  if (p.studio === 'facetedSurface') {
    const src = SURFACE_SOURCES[p.course.source] ?? SURFACE_SOURCES.paraboloid!;
    const facets = surfaceFacets(p);
    const f = facets.find((x) => cell && x.i === cell.i && x.j === cell.j) ?? facets[0];
    return {
      tex: src.tex,
      rows: [
        {
          label: 'Tangent plane (§4.2.1)',
          tex: 'f_{x}(x_{0}, y_{0})(x - x_{0}) + f_{y}(x_{0}, y_{0})(y - y_{0}) - (z - z_{0}) = 0',
        },
        ...(f
          ? [
              {
                label: `${selection ? 'Selected facet' : 'One facet'}, at P = (${fmt(f.a)}, ${fmt(f.b)}, ${fmt(f.c)})`,
                tex: `${fmt(f.fx)}(x ${signedTex(-f.a)}) ${signedTex(f.fy)}(y ${signedTex(-f.b)}) - (z ${signedTex(-f.c)}) = 0`,
              },
            ]
          : []),
        settingsRow(
          p,
          `${p.course.density} \\times ${p.course.density} \\text{ facets, turned } ${Math.round(p.creative.turn)}^{\\circ}`,
        ),
      ],
      explanation:
        'Each facet is a piece of the tangent plane at the centre of its cell, so it is normal to ∇F there (Theorem 4.2.1). Steeper facets (larger |∇f|) are coloured differently. The gap between facets is only creative.',
      origin: src.origin,
    };
  }
  const found = landscapeCriticals(p.course.features);
  return {
    tex: landscapeTex(p.course.features),
    rows: found.slice(0, 6).map((c) => ({
      label: `(${fmt(c.x)}, ${fmt(c.y)}): ${TYPE_LABEL[c.type]}`,
      tex: `d = ${fmt(c.d)}, \\quad f_{xx} = ${fmt(c.fxx)}`,
    })),
    explanation: `The app found ${found.length} critical point${found.length === 1 ? '' : 's'} with f_x = f_y = 0 (numerically) and classified each with d = f_xx f_yy − [f_xy]² (Theorem 4.3.3). Labels: max, min, saddle, or ? where d = 0.${
      found.length > 6 ? ' The first six are listed.' : ''
    } In each saddle feature, u and v are the scaled distances (x − a)/w and (y − b)/w from its centre.`,
    origin: 'a landscape you designed in the app',
  };
}

/** One-line summaries saved with the project (readable outside the app). */
export function paArtSummary(p: PaArtProject): string[] {
  const math = paArtMath(p);
  return [math.tex, ...math.rows.map((r) => `${r.label}: ${r.tex}`)];
}
