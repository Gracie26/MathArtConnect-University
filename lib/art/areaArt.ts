/**
 * Topic 2 art: the Riemann Mosaic Studio and the Accumulation Art Studio.
 *
 * An artwork is a stack of layers, each generated from Chapter 2 mathematics:
 *   mosaic        Riemann-sum rectangles (left, right, midpoint) or mean value
 *                 bands (each band's height is the average value of f on its
 *                 subinterval, Theorem 2.4.1), for f on [a, b] with n pieces;
 *   accumulation  f and its accumulated area A(x) = ∫ₐˣ f(t) dt as linked
 *                 layers, with a moving x and repeated accumulation curves;
 *   trail         A(t) for an improper integral as t moves towards ∞ or an
 *                 asymptote: a trail of points that settles or keeps going.
 *
 * Course-aligned settings (function, interval, n, rule, x, t) decide the
 * mathematics. Creative-extension settings (mirror, repeat, spacing, colour
 * mode, gaps, opacity) change only how copies of it are arranged and styled;
 * the "Math behind my art" readout always describes one untransformed copy.
 *
 * Everything here is pure data and functions; components/art/area draws it.
 */
import { type Fn, riemannSum, simpson } from '@/lib/figures/scene';

// =============================================================================
// Functions (from the Chapter 2 notes and Tutorial 2)
// =============================================================================

export type AreaFunctionId =
  | 'cos'
  | 'sin'
  | 'exp'
  | 'square'
  | 'shifted'
  | 'sqrt'
  | 'line'
  | 'decay'
  | 'wave'
  | 'bowl'
  | 'invSquare'
  | 'recip'
  | 'expDecay'
  | 'gauss'
  | 'rootAsym'
  | 'cubeAsym'
  | 'powerAsym';

export interface Improper {
  /** 'infinite': t → ∞ from `from`. 'asymptote': t → `toward` from `from` (the other end). */
  kind: 'infinite' | 'asymptote';
  from: number;
  toward?: number;
  /** A(t) exactly: the integral between `from` and t. */
  partial: (t: number) => number;
  converges: boolean;
  limit?: number;
  integralTex: string;
  limitTex?: string;
}

export interface AreaFunction {
  id: AreaFunctionId;
  /** Plain text for buttons and screen readers. */
  label: string;
  tex: string;
  f: Fn;
  /** Where a and b may be placed, and the step between choices. */
  domain: [number, number];
  step: number;
  /** Default interval. */
  a: number;
  b: number;
  /** Where the function comes from (shown in Math behind my art). */
  source: string;
  improper?: Improper;
}

const PI = Math.PI;

export const AREA_FUNCTIONS: Record<AreaFunctionId, AreaFunction> = {
  cos: {
    id: 'cos',
    label: 'cos x',
    tex: '\\cos x',
    f: Math.cos,
    domain: [0, 2 * PI],
    step: PI / 4,
    a: 0,
    b: PI / 2,
    source: 'Riemann sums of cos x (§2.2)',
  },
  sin: {
    id: 'sin',
    label: 'sin x',
    tex: '\\sin x',
    f: Math.sin,
    domain: [0, 2 * PI],
    step: PI / 4,
    a: 0,
    b: PI,
    source: 'Area under sin x on [0, π] (§2.3)',
  },
  exp: {
    id: 'exp',
    label: 'eˣ',
    tex: 'e^{x}',
    f: Math.exp,
    domain: [-2, 2],
    step: 0.5,
    a: 0,
    b: 2,
    source: 'Example 2.2.3',
  },
  square: {
    id: 'square',
    label: 'x²',
    tex: 'x^{2}',
    f: (x) => x * x,
    domain: [-2, 2],
    step: 0.5,
    a: 0,
    b: 2,
    source: 'Example 2.2.1 and Figure 2.1',
  },
  shifted: {
    id: 'shifted',
    label: '(x − 1)² + 2',
    tex: '(x-1)^{2}+2',
    f: (x) => (x - 1) ** 2 + 2,
    domain: [-1, 3],
    step: 0.5,
    a: -1,
    b: 2,
    source: 'Example 2.2.2',
  },
  sqrt: {
    id: 'sqrt',
    label: '√x',
    tex: '\\sqrt{x}',
    f: (x) => Math.sqrt(Math.max(0, x)),
    domain: [0, 4],
    step: 0.5,
    a: 0,
    b: 4,
    source: 'Tutorial 2',
  },
  line: {
    id: 'line',
    label: '2x',
    tex: '2x',
    f: (x) => 2 * x,
    domain: [-1, 3],
    step: 0.5,
    a: 0,
    b: 1,
    source: 'Example 2.2.1',
  },
  decay: {
    id: 'decay',
    label: 'e^(−2x+3)',
    tex: 'e^{-2x+3}',
    f: (x) => Math.exp(-2 * x + 3),
    domain: [0, 4],
    step: 0.5,
    a: 0,
    b: 4,
    source: 'Tutorial 2',
  },
  wave: {
    id: 'wave',
    label: '1.2 sin t + 0.6',
    tex: '1.2\\sin t + 0.6',
    f: (t) => 1.2 * Math.sin(t) + 0.6,
    domain: [0, 2 * PI],
    step: PI / 4,
    a: 0,
    b: 2 * PI,
    source: 'App function for A(x) (§2.3)',
  },
  bowl: {
    id: 'bowl',
    label: 't² − 2t',
    tex: 't^{2}-2t',
    f: (t) => t * t - 2 * t,
    domain: [-1, 3],
    step: 0.5,
    a: 0,
    b: 3,
    source: 'App function for A(x) (§2.3)',
  },
  invSquare: {
    id: 'invSquare',
    label: '1/x²',
    tex: '\\frac{1}{x^{2}}',
    f: (x) => 1 / (x * x),
    domain: [1, 8],
    step: 0.5,
    a: 1,
    b: 6,
    source: 'Figures 2.6–2.8, equation (2.2)',
    improper: {
      kind: 'infinite',
      from: 1,
      partial: (t) => 1 - 1 / t,
      converges: true,
      limit: 1,
      integralTex: '\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx',
      limitTex: '1',
    },
  },
  recip: {
    id: 'recip',
    label: '1/x',
    tex: '\\frac{1}{x}',
    f: (x) => 1 / x,
    domain: [1, 8],
    step: 0.5,
    a: 1,
    b: 6,
    source: 'Example 2.5.1',
    improper: {
      kind: 'infinite',
      from: 1,
      partial: (t) => Math.log(t),
      converges: false,
      integralTex: '\\int_{1}^{\\infty} \\frac{1}{x}\\,dx',
    },
  },
  expDecay: {
    id: 'expDecay',
    label: 'e^(−x)',
    tex: 'e^{-x}',
    f: (x) => Math.exp(-x),
    domain: [0, 6],
    step: 0.5,
    a: 0,
    b: 4,
    source: 'Example 2.5.3',
    improper: {
      kind: 'infinite',
      from: 1,
      partial: (t) => Math.exp(-1) - Math.exp(-t),
      converges: true,
      limit: Math.exp(-1),
      integralTex: '\\int_{1}^{\\infty} e^{-x}\\,dx',
      limitTex: '\\frac{1}{e}',
    },
  },
  gauss: {
    id: 'gauss',
    label: 'e^(−x²)',
    tex: 'e^{-x^{2}}',
    f: (x) => Math.exp(-x * x),
    domain: [-3, 3],
    step: 0.5,
    a: -2,
    b: 2,
    source: 'Example 2.5.3 and Figure 2.16',
    improper: {
      kind: 'infinite',
      from: 1,
      partial: (t) => simpson((x) => Math.exp(-x * x), 1, Math.min(t, 12), 600),
      converges: true,
      limit: simpson((x) => Math.exp(-x * x), 1, 12, 600),
      integralTex: '\\int_{1}^{\\infty} e^{-x^{2}}\\,dx',
      limitTex: '\\approx 0.1394',
    },
  },
  rootAsym: {
    id: 'rootAsym',
    label: '1/√(x − 2)',
    tex: '\\frac{1}{\\sqrt{x-2}}',
    f: (x) => 1 / Math.sqrt(x - 2),
    domain: [2, 5],
    step: 0.5,
    a: 2.5,
    b: 5,
    source: 'Example 2.5.2 and Figure 2.14',
    improper: {
      kind: 'asymptote',
      from: 5,
      toward: 2,
      partial: (t) => 2 * Math.sqrt(3) - 2 * Math.sqrt(t - 2),
      converges: true,
      limit: 2 * Math.sqrt(3),
      integralTex: '\\int_{2}^{5} \\frac{dx}{\\sqrt{x-2}}',
      limitTex: '2\\sqrt{3}',
    },
  },
  cubeAsym: {
    id: 'cubeAsym',
    label: '1/x³',
    tex: '\\frac{1}{x^{3}}',
    f: (x) => 1 / x ** 3,
    domain: [0, 2],
    step: 0.25,
    a: 0.5,
    b: 2,
    source: 'Tutorial 2',
    improper: {
      kind: 'asymptote',
      from: 2,
      toward: 0,
      partial: (t) => -1 / 8 + 1 / (2 * t * t),
      converges: false,
      integralTex: '\\int_{0}^{2} \\frac{dx}{x^{3}}',
    },
  },
  powerAsym: {
    id: 'powerAsym',
    label: 'x^(−2/3)',
    tex: 'x^{-\\frac{2}{3}}',
    f: (x) => Math.cbrt(x) ** -2,
    domain: [0, 8],
    step: 0.5,
    a: 0.5,
    b: 8,
    source: 'Tutorial 2',
    improper: {
      kind: 'asymptote',
      from: 8,
      toward: 0,
      partial: (t) => 6 - 3 * Math.cbrt(t),
      converges: true,
      limit: 6,
      integralTex: '\\int_{0}^{8} x^{-\\frac{2}{3}}\\,dx',
      limitTex: '6',
    },
  },
};

export const MOSAIC_FUNCTIONS: AreaFunctionId[] = [
  'cos',
  'sin',
  'exp',
  'square',
  'shifted',
  'sqrt',
  'line',
  'decay',
  'gauss',
];
export const ACCUMULATION_FUNCTIONS: AreaFunctionId[] = ['wave', 'bowl', 'cos', 'sin', 'line', 'shifted', 'gauss'];
export const TRAIL_FUNCTIONS: AreaFunctionId[] = [
  'invSquare',
  'recip',
  'expDecay',
  'gauss',
  'rootAsym',
  'powerAsym',
  'cubeAsym',
];

// =============================================================================
// Project model
// =============================================================================

export type MosaicRule = 'left' | 'right' | 'midpoint' | 'mean';
/** 'water': a faint reflection below the axis. */
export type Mirror = 'none' | 'sideways' | 'below' | 'both' | 'water';
export type ColourMode = 'solid' | 'fade' | 'alternate';

/** Creative extension: arrangement and style only, never the mathematics. */
export interface CreativeSettings {
  mirror: Mirror;
  /** Copies side by side (1 = just the original). */
  repeat: number;
  /** Space between copies, as a fraction of the copy's width. */
  spacing: number;
  colourMode: ColourMode;
  /** Gap trimmed from each side of every rectangle, as a fraction of Δx (mosaic). */
  gap: number;
  /** Line width multiplier (accumulation and trails). */
  weight: number;
  /** Turn every other repeated copy upside down, so the copies alternate above and below the axis. */
  flip?: boolean;
  /** Draw the rectangles as outlines only (mosaic). */
  outline?: boolean;
  /** Light window cells inside each rectangle (mosaic). */
  windows?: boolean;
  /** Split each rectangle into this many stacked mosaic cells (mosaic; 1 = solid). */
  cells?: number;
}

export interface LayerStyle {
  /** Index into the theme's curve palette. */
  colour: number;
  opacity: number;
  visible: boolean;
}

interface LayerBase {
  id: string;
  name: string;
  fnId: AreaFunctionId;
  style: LayerStyle;
  creative: CreativeSettings;
}

export type AreaLayer =
  | (LayerBase & {
      kind: 'mosaic';
      a: number;
      b: number;
      n: number;
      rule: MosaicRule;
      showCurve: boolean;
      /** Mark each sample point (xᵢ*, f(xᵢ*)) where the height is read (not for mean value bands). */
      showPoints?: boolean;
    })
  | (LayerBase & {
      kind: 'accumulation';
      a: number;
      b: number;
      /** The moving upper limit. */
      x: number;
      /** Constant multiple k: the layer draws k·f (Theorem 2.2.4 (i)). */
      k: number;
      /** Extra accumulation curves started at later points (0 = only A from a). */
      echoes: number;
      showF: boolean;
      showA: boolean;
    })
  | (LayerBase & {
      kind: 'trail';
      /** How far t has gone towards the improper end, 0–1 (logarithmic). */
      reach: number;
      /** Number of points in the trail. */
      dots: number;
      showLimit: boolean;
    });

export type AreaLayerKind = AreaLayer['kind'];
export type AreaStudioKind = 'mosaic' | 'accumulation';

export interface AreaArtProject {
  version: 1;
  studio: AreaStudioKind;
  title: string;
  templateId?: string;
  layers: AreaLayer[];
  /** Zoom (1 = fit everything) and pan as fractions of the fitted width/height. */
  view: { zoom: number; panX: number; panY: number };
  /** Background guide: nothing, a soft grid, or axes. */
  backdrop: 'none' | 'grid' | 'axes';
  /** The learner's own words: the mathematics behind the artwork. */
  explanation: string;
}

export const DEFAULT_CREATIVE: CreativeSettings = {
  mirror: 'none',
  repeat: 1,
  spacing: 0.15,
  colourMode: 'solid',
  gap: 0,
  weight: 1,
};

let counter = 0;
const layerId = () => `layer-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function newLayer(kind: AreaLayerKind, fnId?: AreaFunctionId, colour = 0): AreaLayer {
  const base = {
    id: layerId(),
    style: { colour, opacity: 0.85, visible: true },
    creative: { ...DEFAULT_CREATIVE },
  };
  if (kind === 'mosaic') {
    const fn = AREA_FUNCTIONS[fnId ?? 'cos'];
    return {
      ...base,
      kind,
      name: 'Riemann mosaic',
      fnId: fn.id,
      a: fn.a,
      b: fn.b,
      n: 8,
      rule: 'midpoint',
      showCurve: true,
    };
  }
  if (kind === 'accumulation') {
    const fn = AREA_FUNCTIONS[fnId ?? 'wave'];
    return {
      ...base,
      kind,
      name: 'Accumulation',
      fnId: fn.id,
      a: fn.a,
      b: fn.b,
      x: (fn.a + fn.b) / 2,
      k: 1,
      echoes: 0,
      showF: true,
      showA: true,
    };
  }
  const fn = AREA_FUNCTIONS[fnId ?? 'invSquare'];
  return {
    ...base,
    kind,
    name: 'Convergence trail',
    fnId: fn.improper ? fn.id : 'invSquare',
    reach: 0.7,
    dots: 24,
    showLimit: true,
  };
}

/** A copy of a layer with a new id. */
export const duplicateLayer = (layer: AreaLayer): AreaLayer => ({
  ...layer,
  id: layerId(),
  name: `${layer.name} copy`,
  style: { ...layer.style },
  creative: { ...layer.creative },
});

/** Moves a layer up (towards the front, +1) or down (−1) in the stack. */
export function moveLayer(layers: AreaLayer[], id: string, direction: 1 | -1): AreaLayer[] {
  const i = layers.findIndex((l) => l.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= layers.length) return layers;
  const next = [...layers];
  [next[i], next[j]] = [next[j] as AreaLayer, next[i] as AreaLayer];
  return next;
}

/** Clamp the course settings of a layer to valid values (a < b inside the domain, 1 ≤ n ≤ 60, a ≤ x ≤ b). */
export function normaliseLayer(layer: AreaLayer): AreaLayer {
  const fn = AREA_FUNCTIONS[layer.fnId];
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  if (layer.kind === 'trail') {
    return {
      ...layer,
      fnId: fn.improper ? fn.id : 'invSquare',
      reach: clamp(layer.reach, 0.05, 1),
      dots: Math.round(clamp(layer.dots, 4, 60)),
    };
  }
  let a = clamp(layer.a, fn.domain[0], fn.domain[1] - fn.step);
  let b = clamp(layer.b, a + fn.step, fn.domain[1]);
  // Keep away from asymptotes of functions defined only on part of the line.
  if (fn.improper?.kind === 'asymptote' && fn.improper.toward !== undefined && a <= fn.improper.toward) {
    a = fn.improper.toward + fn.step;
    b = Math.max(b, a + fn.step);
  }
  if (layer.kind === 'mosaic') return { ...layer, a, b, n: Math.round(clamp(layer.n, 1, 60)) };
  return {
    ...layer,
    a,
    b,
    x: clamp(layer.x, a, b),
    k: clamp(layer.k, -2, 2),
    echoes: Math.round(clamp(layer.echoes, 0, 6)),
  };
}

// =============================================================================
// The mathematics behind each layer
// =============================================================================

const RULE_WORDS: Record<MosaicRule, string> = {
  left: 'left endpoints',
  right: 'right endpoints',
  midpoint: 'midpoints (the Mid-point Rule)',
  mean: 'the average value of f on each subinterval (mean value bands)',
};

/** Height of the ith rectangle (i from 1). */
export function mosaicHeight(fn: AreaFunction, a: number, dx: number, i: number, rule: MosaicRule): number {
  const left = a + (i - 1) * dx;
  switch (rule) {
    case 'left':
      return fn.f(left);
    case 'right':
      return fn.f(left + dx);
    case 'midpoint':
      return fn.f(left + dx / 2);
    case 'mean':
      return simpson(fn.f, left, left + dx, 80) / dx;
  }
}

export interface MathRow {
  label: string;
  tex: string;
}

export interface LayerMath {
  rows: MathRow[];
  /** A sentence explaining how the shapes come from the mathematics. */
  explanation: string;
}

const fmt = (v: number, digits = 4): string => {
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : '-\\infty';
  const rounded = Number(v.toFixed(digits));
  return Object.is(rounded, -0) ? '0' : String(rounded);
};

/** a and b as TeX: multiples of π/4 are written with π. */
export function numberTex(v: number): string {
  const quarters = (v / PI) * 4;
  if (Math.abs(v) > 1e-9 && Math.abs(quarters - Math.round(quarters)) < 1e-9) {
    const q = Math.round(quarters);
    const g = gcd(Math.abs(q), 4);
    const [num, den] = [q / g, 4 / g];
    const top = num === 1 ? '\\pi' : num === -1 ? '-\\pi' : `${num}\\pi`;
    return den === 1 ? top : `\\frac{${top}}{${den}}`;
  }
  return fmt(v, 3);
}
const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

export function layerMath(layer: AreaLayer): LayerMath {
  const fn = AREA_FUNCTIONS[layer.fnId];
  if (layer.kind === 'mosaic') {
    const dx = (layer.b - layer.a) / layer.n;
    const area = simpson(fn.f, layer.a, layer.b, 2000);
    const sum =
      layer.rule === 'mean'
        ? Array.from({ length: layer.n }, (_, i) => mosaicHeight(fn, layer.a, dx, i + 1, 'mean') * dx).reduce(
            (s, v) => s + v,
            0,
          )
        : riemannSum(fn.f, layer.a, layer.b, layer.n, layer.rule);
    const point =
      layer.rule === 'left'
        ? 'x_{i-1}'
        : layer.rule === 'right'
          ? 'x_{i}'
          : layer.rule === 'midpoint'
            ? '\\bar{x}_{i}'
            : 'c_{i}';
    const integral = `\\int_{${numberTex(layer.a)}}^{${numberTex(layer.b)}} ${fn.tex}\\,dx`;
    return {
      rows: [
        { label: 'Function', tex: `f(x) = ${fn.tex}` },
        { label: 'Interval', tex: `[${numberTex(layer.a)}, ${numberTex(layer.b)}]` },
        { label: 'Rectangles', tex: `n = ${layer.n}` },
        { label: 'Width', tex: `\\Delta x = \\frac{b - a}{n} = ${fmt(dx)}` },
        { label: 'Heights from', tex: `f(${point})` },
        { label: 'Sum', tex: `\\sum_{i=1}^{${layer.n}} f(${point})\\,\\Delta x = ${fmt(sum)}` },
        { label: 'Signed area', tex: `${integral} \\approx ${fmt(area)}` },
      ],
      explanation:
        layer.rule === 'mean'
          ? `Each band stands on a subinterval of width Δx = ${fmt(dx)} and its height is the average value of f there, so by the Mean Value Theorem for Integrals every band has exactly the signed area under its piece of the curve. Together the ${layer.n} bands have the signed area ${fmt(area)}.`
          : `Each of the ${layer.n} tiles stands on a subinterval of width Δx = ${fmt(dx)}; its height is f at the ${RULE_WORDS[layer.rule]}. The tiles add up to ${fmt(sum)}, against the signed area ${fmt(area)} (difference ${fmt(sum - area)}). Tiles below the axis count as negative.`,
    };
  }
  if (layer.kind === 'accumulation') {
    const A = (x: number) => (x === layer.a ? 0 : layer.k * simpson(fn.f, layer.a, x, 400));
    const kTex = layer.k === 1 ? '' : `${fmt(layer.k, 2)}\\,`;
    const fx = layer.k * fn.f(layer.x);
    const ft = fn.tex.replace(/x/g, 't');
    return {
      rows: [
        { label: 'Function', tex: `f(t) = ${kTex}${ft}` },
        { label: 'Accumulated area', tex: `A(x) = \\int_{${numberTex(layer.a)}}^{x} f(t)\\,dt` },
        { label: 'Current x', tex: `x = ${fmt(layer.x, 3)}` },
        { label: 'Area so far', tex: `A(${fmt(layer.x, 3)}) = ${fmt(A(layer.x))}` },
        { label: 'Slope of A', tex: `A'(x) = f(x) = ${fmt(fx)}` },
        ...(layer.echoes > 0
          ? [{ label: 'Repeated curves', tex: `A_{c}(x) = \\int_{c}^{x} f(t)\\,dt = A(x) - A(c)` }]
          : []),
      ],
      explanation: `The shaded region under f from ${fmt(layer.a, 3)} to x is the area A(x); the second curve plots A. Its slope at x equals f(x) = ${fmt(fx, 3)} (the Fundamental Theorem of Calculus), so A rises where f is above the axis and falls where f is below it.${
        layer.echoes > 0
          ? ` The ${layer.echoes} extra curve${layer.echoes === 1 ? ' starts' : 's start'} accumulating at later points c; each differs from A by the constant A(c), so all have the same slope at every x.`
          : ''
      }`,
    };
  }
  const imp = fn.improper!;
  const t = trailT(fn, layer.reach);
  const value = imp.partial(t);
  const tTex = fmt(t, imp.kind === 'asymptote' ? 6 : 2);
  const lower = imp.kind === 'asymptote' ? 't' : numberTex(imp.from);
  const upper = imp.kind === 'asymptote' ? numberTex(imp.from) : 't';
  return {
    rows: [
      { label: 'Integral', tex: imp.integralTex },
      { label: 'Area so far', tex: `A(t) = \\int_{${lower}}^{${upper}} ${fn.tex}\\,dx` },
      { label: 'Current t', tex: `t = ${tTex}` },
      { label: 'A(t)', tex: fmt(value) },
      {
        label: 'As t moves on',
        tex: imp.converges ? `A(t) \\to ${imp.limitTex ?? fmt(imp.limit ?? 0)}` : 'A(t) \\to \\infty',
      },
    ],
    explanation: imp.converges
      ? `Each point of the trail is (step, A(t)) for t further ${imp.kind === 'infinite' ? 'out towards ∞' : `in towards the asymptote at x = ${imp.toward}`}. The steps shrink in effect: the trail flattens onto the dashed line at ${imp.limitTex ?? fmt(imp.limit ?? 0)}, so the integral converges.`
      : `Each point of the trail is (step, A(t)) for t further ${imp.kind === 'infinite' ? 'out towards ∞' : `in towards the asymptote at x = ${imp.toward}`}. The trail never levels off: A(t) has no finite limit, so the integral diverges.`,
  };
}

/** The value of t for a reach between 0 and 1 (logarithmic in the distance to the improper end). */
export function trailT(fn: AreaFunction, reach: number): number {
  const imp = fn.improper;
  if (!imp) return fn.b;
  if (imp.kind === 'infinite') return imp.from + (10 ** (3 * reach) - 1);
  const toward = imp.toward ?? 0;
  return toward + (imp.from - toward) * 10 ** (-3 * reach);
}

// =============================================================================
// Geometry: shapes in world coordinates
// =============================================================================

export type Shape =
  | {
      t: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      colour: number;
      opacity: number;
      outline?: boolean;
      /** 'surface': drawn in the background colour (windows), not a palette colour. */
      tone?: 'surface';
    }
  | { t: 'path'; points: [number, number][]; colour: number; opacity: number; width: number; dashed?: boolean }
  | { t: 'fill'; points: [number, number][]; colour: number; opacity: number }
  | { t: 'dot'; x: number; y: number; r: number; colour: number; opacity: number };

const sampleCurve = (f: Fn, from: number, to: number, steps = 120): [number, number][] => {
  const pts: [number, number][] = [];
  for (let k = 0; k <= steps; k++) {
    const x = from + ((to - from) * k) / steps;
    const y = f(x);
    if (Number.isFinite(y)) pts.push([x, y]);
  }
  return pts;
};

/** Trail points above this height are off the canvas (the trail has escaped). */
export const TRAIL_CEILING = 10;

/** The shapes of one copy of a layer, before mirroring and repeating. */
function baseShapes(layer: AreaLayer, palette: number): Shape[] {
  const fn = AREA_FUNCTIONS[layer.fnId];
  const { colour, opacity } = layer.style;
  const c = (offset: number) => (colour + offset) % palette;
  const weight = layer.creative.weight;
  if (layer.kind === 'mosaic') {
    const dx = (layer.b - layer.a) / layer.n;
    const gap = layer.creative.gap * dx;
    const cells = Math.max(1, Math.min(8, Math.round(layer.creative.cells ?? 1)));
    const shapes: Shape[] = [];
    const marks: Shape[] = [];
    for (let i = 1; i <= layer.n; i++) {
      // The rectangle itself is always [xᵢ₋₁, xᵢ] × height f(xᵢ*): creative settings only trim, split or decorate it.
      const h = mosaicHeight(fn, layer.a, dx, i, layer.rule);
      const mode = layer.creative.colourMode;
      const tileOpacity = mode === 'fade' ? opacity * (0.35 + (0.65 * i) / layer.n) : opacity;
      const tileColour = mode === 'alternate' && i % 2 === 0 ? c(1) : c(0);
      const x = layer.a + (i - 1) * dx + gap;
      const w = Math.max(dx - 2 * gap, dx * 0.05);
      const y = Math.min(0, h);
      const height = Math.abs(h);
      if (cells === 1 || layer.creative.outline) {
        shapes.push({
          t: 'rect',
          x,
          y,
          w,
          h: height,
          colour: tileColour,
          opacity: tileOpacity,
          outline: layer.creative.outline,
        });
      } else {
        // Mosaic cells: the same rectangle split into stacked tiles of alternating shade.
        const cell = height / cells;
        for (let k = 0; k < cells; k++) {
          shapes.push({
            t: 'rect',
            x,
            y: y + k * cell + cell * 0.06,
            w,
            h: cell * 0.88,
            colour: (k + i) % 2 === 0 ? tileColour : c(1),
            opacity: tileOpacity * ((k + i) % 2 === 0 ? 1 : 0.7),
          });
        }
      }
      if (layer.creative.windows && height > 0) {
        // Window cells inside the rectangle (decoration only).
        const rows = Math.max(1, Math.min(7, Math.floor(height / (w * 1.4))));
        for (let r = 0; r < rows; r++) {
          for (const side of [0.2, 0.58]) {
            marks.push({
              t: 'rect',
              x: x + w * side,
              y: y + ((r + 0.25) * height) / rows,
              w: w * 0.22,
              h: (height / rows) * 0.4,
              colour: 0,
              opacity: 0.55,
              tone: 'surface',
            });
          }
        }
      }
      if (layer.showPoints && layer.rule !== 'mean') {
        const offset = layer.rule === 'left' ? 0 : layer.rule === 'right' ? 1 : 0.5;
        marks.push({ t: 'dot', x: layer.a + (i - 1 + offset) * dx, y: h, r: 3.5, colour: c(2), opacity: 1 });
      }
    }
    shapes.push(...marks);
    if (layer.showCurve)
      shapes.push({
        t: 'path',
        points: sampleCurve(fn.f, layer.a, layer.b),
        colour: c(2),
        opacity: 1,
        width: 2 * weight,
      });
    return shapes;
  }
  if (layer.kind === 'accumulation') {
    const k = layer.k;
    const g = (x: number) => k * fn.f(x);
    const shapes: Shape[] = [];
    const A = (from: number) => (x: number) => (x <= from ? 0 : simpson(g, from, x, 120));
    if (layer.showF) {
      const filled = sampleCurve(g, layer.a, layer.x, 80);
      if (filled.length > 1) {
        shapes.push({
          t: 'fill',
          points: [[layer.a, 0], ...filled, [layer.x, 0]],
          colour: c(0),
          opacity: opacity * 0.45,
        });
      }
      shapes.push({ t: 'path', points: sampleCurve(g, layer.a, layer.b), colour: c(0), opacity, width: 2 * weight });
    }
    if (layer.showA) {
      // Repeated accumulation curves from later starting points (drawn faint, behind A).
      for (let e = 1; e <= layer.echoes; e++) {
        const start = layer.a + ((layer.b - layer.a) * e) / (layer.echoes + 1);
        shapes.push({
          t: 'path',
          points: sampleCurve(A(start), start, layer.b, 80),
          colour: c(1 + (e % 2)),
          opacity: opacity * (0.75 - (0.4 * e) / (layer.echoes + 1)),
          width: 1.5 * weight,
        });
      }
      const whole = sampleCurve(A(layer.a), layer.a, layer.b, 120);
      shapes.push({ t: 'fill', points: [[layer.a, 0], ...whole, [layer.b, 0]], colour: c(1), opacity: opacity * 0.12 });
      shapes.push({ t: 'path', points: whole, colour: c(1), opacity: opacity * 0.45, width: 1.5 * weight });
      shapes.push({
        t: 'path',
        points: sampleCurve(A(layer.a), layer.a, layer.x, 80),
        colour: c(1),
        opacity,
        width: 3 * weight,
      });
      const ax = A(layer.a)(layer.x);
      const slope = g(layer.x);
      const half = (layer.b - layer.a) * 0.08;
      shapes.push({
        t: 'path',
        points: [
          [layer.x - half, ax - slope * half],
          [layer.x + half, ax + slope * half],
        ],
        colour: c(2),
        opacity: 1,
        width: 2 * weight,
      });
      shapes.push({ t: 'dot', x: layer.x, y: ax, r: 5 * weight, colour: c(1), opacity: 1 });
    }
    return shapes;
  }
  // Trail: x is the step (0 … 8), y is A(t) at that step.
  const imp = fn.improper;
  if (!imp) return [];
  const width = 8;
  const shapes: Shape[] = [];
  const points: [number, number][] = [];
  const count = layer.dots;
  for (let k = 0; k <= count; k++) {
    const s = (layer.reach * k) / count;
    const y = imp.partial(trailT(fn, s));
    // A divergent trail leaves the canvas instead of squashing the others.
    if (Number.isFinite(y) && Math.abs(y) <= TRAIL_CEILING) points.push([s * width, y]);
  }
  if (layer.showLimit && imp.converges && imp.limit !== undefined) {
    shapes.push({
      t: 'path',
      points: [
        [0, imp.limit],
        [width, imp.limit],
      ],
      colour: c(2),
      opacity: 0.8,
      width: 1.5,
      dashed: true,
    });
  }
  shapes.push({ t: 'path', points, colour: c(0), opacity: opacity * 0.5, width: 1.5 * weight });
  points.forEach(([x, y], k) => {
    const fade = layer.creative.colourMode === 'fade' ? 0.3 + (0.7 * k) / Math.max(1, points.length - 1) : 1;
    shapes.push({
      t: 'dot',
      x,
      y,
      r: (2 + 5 * (1 - k / Math.max(1, points.length))) * weight,
      colour: layer.creative.colourMode === 'alternate' && k % 2 ? c(1) : c(0),
      opacity: opacity * fade,
    });
  });
  return shapes;
}

const mapShape = (shape: Shape, map: (p: [number, number]) => [number, number]): Shape => {
  switch (shape.t) {
    case 'rect': {
      const [x1, y1] = map([shape.x, shape.y]);
      const [x2, y2] = map([shape.x + shape.w, shape.y + shape.h]);
      return { ...shape, x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
    }
    case 'dot': {
      const [x, y] = map([shape.x, shape.y]);
      return { ...shape, x, y };
    }
    default:
      return { ...shape, points: shape.points.map(map) };
  }
};

function xRange(layer: AreaLayer): [number, number] {
  if (layer.kind === 'trail') return [0, 8];
  return [layer.a, layer.b];
}

/** All shapes of a layer: the base copy, then mirrored and repeated copies (creative extension). */
export function layerShapes(layer: AreaLayer, palette: number): Shape[] {
  if (!layer.style.visible) return [];
  const base = baseShapes(layer, palette);
  const [x0, x1] = xRange(layer);
  const w = x1 - x0;
  const { mirror, repeat, spacing } = layer.creative;
  const copies: Shape[] = [...base];
  if (mirror === 'sideways' || mirror === 'both')
    copies.push(...base.map((s) => mapShape(s, ([x, y]) => [2 * x1 - x, y])));
  if (mirror === 'below' || mirror === 'both') {
    const current = [...copies];
    copies.push(...current.map((s) => mapShape(s, ([x, y]) => [x, -y])));
  }
  if (mirror === 'water') {
    // A faint reflection: the same shapes upside down, without decorations.
    const reflected = base
      .filter((s) => !(s.t === 'rect' && s.tone === 'surface'))
      .map((s) => ({ ...mapShape(s, ([x, y]) => [x, -y]), opacity: s.opacity * 0.3 }) as Shape);
    copies.unshift(...reflected);
  }
  const unit = (mirror === 'sideways' || mirror === 'both' ? 2 * w : w) * (1 + spacing);
  const all: Shape[] = [];
  const flip = layer.creative.flip ?? false;
  for (let r = 0; r < Math.max(1, Math.min(6, repeat)); r++) {
    const sign = flip && r % 2 === 1 ? -1 : 1;
    all.push(...copies.map((s) => mapShape(s, ([x, y]) => [x + r * unit, sign * y])));
  }
  return all;
}

export interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** The box around every visible shape, with a margin; never empty. */
export function shapeBounds(shapes: Shape[]): Bounds {
  let [xMin, xMax, yMin, yMax] = [Infinity, -Infinity, Infinity, -Infinity];
  const add = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    xMin = Math.min(xMin, x);
    xMax = Math.max(xMax, x);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  };
  for (const s of shapes) {
    if (s.t === 'rect') {
      add(s.x, s.y);
      add(s.x + s.w, s.y + s.h);
    } else if (s.t === 'dot') add(s.x, s.y);
    else s.points.forEach(([x, y]) => add(x, y));
  }
  if (!Number.isFinite(xMin)) return { xMin: -1, xMax: 1, yMin: -1, yMax: 1 };
  // Very tall curves (near an asymptote) are capped so the art stays readable.
  yMax = Math.min(yMax, yMin + 12 * Math.max(1e-6, xMax - xMin));
  const padX = Math.max(1e-3, (xMax - xMin) * 0.06);
  const padY = Math.max(1e-3, (yMax - yMin) * 0.08);
  return { xMin: xMin - padX, xMax: xMax + padX, yMin: Math.min(yMin, 0) - padY, yMax: Math.max(yMax, 0) + padY };
}

/** The visible window after zoom and pan. */
export function viewWindow(bounds: Bounds, view: AreaArtProject['view']): Bounds {
  const w = bounds.xMax - bounds.xMin;
  const h = bounds.yMax - bounds.yMin;
  const cx = (bounds.xMin + bounds.xMax) / 2 + view.panX * w;
  const cy = (bounds.yMin + bounds.yMax) / 2 + view.panY * h;
  const z = Math.max(0.25, Math.min(8, view.zoom));
  return { xMin: cx - w / (2 * z), xMax: cx + w / (2 * z), yMin: cy - h / (2 * z), yMax: cy + h / (2 * z) };
}

/** Whether any creative-extension arrangement or decoration is applied to the layer. */
export const hasCreativeLayout = (layer: AreaLayer): boolean => {
  const c = layer.creative;
  return c.mirror !== 'none' || c.repeat > 1 || !!c.flip || !!c.outline || !!c.windows || (c.cells ?? 1) > 1;
};

/** A screen-reader description of the whole artwork. */
export function describeArtwork(project: AreaArtProject): string {
  const visible = project.layers.filter((l) => l.style.visible);
  if (visible.length === 0) return `${project.title}: an empty canvas.`;
  const parts = visible.map((l) => {
    const fn = AREA_FUNCTIONS[l.fnId];
    const creative =
      l.creative.mirror !== 'none' || l.creative.repeat > 1
        ? `, ${l.creative.mirror !== 'none' ? (l.creative.mirror === 'water' ? 'reflected in water' : `mirrored ${l.creative.mirror}`) : ''}${l.creative.mirror !== 'none' && l.creative.repeat > 1 ? ' and ' : ''}${l.creative.repeat > 1 ? `repeated ${l.creative.repeat} times` : ''}`
        : '';
    if (l.kind === 'mosaic')
      return `${l.n} ${l.rule === 'mean' ? 'mean value bands' : `${l.rule} rectangles`} under ${fn.label} from ${fmt(l.a, 2)} to ${fmt(l.b, 2)}${creative}`;
    if (l.kind === 'accumulation')
      return `${fn.label} with its accumulated area A(x) up to x = ${fmt(l.x, 2)}${l.echoes ? ` and ${l.echoes} repeated accumulation curves` : ''}${creative}`;
    return `a trail of ${l.dots} points of A(t) for ${fn.label}, which ${fn.improper?.converges ? 'levels off' : 'keeps growing'}${creative}`;
  });
  return `${project.title}: ${parts.join('; ')}.`;
}

// =============================================================================
// Templates
// =============================================================================

export interface AreaTemplate {
  id: string;
  title: string;
  description: string;
  studio: AreaStudioKind;
  build: () => Omit<AreaArtProject, 'title' | 'explanation'>;
}

const withCreative = (
  layer: AreaLayer,
  creative: Partial<CreativeSettings>,
  style?: Partial<LayerStyle>,
): AreaLayer => ({
  ...layer,
  creative: { ...layer.creative, ...creative },
  style: { ...layer.style, ...style },
});

const mosaic = (
  fnId: AreaFunctionId,
  settings: { a?: number; b?: number; n: number; rule: MosaicRule; showCurve?: boolean; name: string },
  colour: number,
): AreaLayer => {
  const layer = newLayer('mosaic', fnId, colour);
  if (layer.kind !== 'mosaic') return layer;
  const fn = AREA_FUNCTIONS[fnId];
  return {
    ...layer,
    name: settings.name,
    a: settings.a ?? fn.a,
    b: settings.b ?? fn.b,
    n: settings.n,
    rule: settings.rule,
    showCurve: settings.showCurve ?? true,
  };
};

const accumulation = (
  fnId: AreaFunctionId,
  settings: { x: number; echoes?: number; k?: number; showF?: boolean; name: string; a?: number; b?: number },
  colour: number,
): AreaLayer => {
  const layer = newLayer('accumulation', fnId, colour);
  if (layer.kind !== 'accumulation') return layer;
  const fn = AREA_FUNCTIONS[fnId];
  return {
    ...layer,
    name: settings.name,
    a: settings.a ?? fn.a,
    b: settings.b ?? fn.b,
    x: settings.x,
    echoes: settings.echoes ?? 0,
    k: settings.k ?? 1,
    showF: settings.showF ?? true,
  };
};

const trail = (
  fnId: AreaFunctionId,
  settings: { reach: number; dots: number; name: string },
  colour: number,
): AreaLayer => {
  const layer = newLayer('trail', fnId, colour);
  return layer.kind === 'trail' ? { ...layer, ...settings } : layer;
};

const VIEW = { zoom: 1, panX: 0, panY: 0 };

export const AREA_TEMPLATES: AreaTemplate[] = [
  // --- Riemann Mosaic Studio -------------------------------------------------
  {
    id: 'staircase-wave',
    title: 'Staircase Wave',
    description:
      'Right-endpoint steps under sin x (solid) and left-endpoint steps (outlined), repeated with every other copy turned over into a travelling stair wave.',
    studio: 'mosaic',
    build: () => ({
      version: 1,
      studio: 'mosaic',
      templateId: 'staircase-wave',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(
          mosaic('sin', { a: 0, b: PI, n: 8, rule: 'left', showCurve: false, name: 'Left steps (outline)' }, 3),
          { repeat: 4, spacing: 0, flip: true, outline: true },
          { opacity: 0.9 },
        ),
        withCreative(mosaic('sin', { a: 0, b: PI, n: 8, rule: 'right', name: 'Right steps under sin x' }, 1), {
          repeat: 4,
          spacing: 0,
          flip: true,
          colourMode: 'fade',
        }),
      ],
    }),
  },
  {
    id: 'area-skyline',
    title: 'Area Skyline',
    description:
      'Towers of eˣ from right endpoints, midpoints and left endpoints, mirrored into a skyline and layered from far (overestimate) to near (underestimate).',
    studio: 'mosaic',
    build: () => ({
      version: 1,
      studio: 'mosaic',
      templateId: 'area-skyline',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(
          mosaic('exp', { n: 10, rule: 'right', showCurve: false, name: 'Far towers: right endpoints' }, 3),
          { gap: 0.04, mirror: 'sideways' },
          { opacity: 0.3 },
        ),
        withCreative(
          mosaic('exp', { n: 10, rule: 'midpoint', showCurve: false, name: 'Middle towers: midpoints' }, 1),
          { gap: 0.1, mirror: 'sideways' },
          { opacity: 0.55 },
        ),
        withCreative(
          mosaic('exp', { n: 10, rule: 'left', showCurve: false, name: 'Near towers: left endpoints' }, 5),
          { gap: 0.18, mirror: 'sideways' },
          { opacity: 0.95 },
        ),
      ],
    }),
  },
  {
    id: 'midpoint-mosaic',
    title: 'Midpoint Mosaic',
    description:
      'Midpoint tiles of the Example 2.2.2 parabola cut into mosaic cells, with every midpoint marked on the curve and the n = 3 tiles outlined behind.',
    studio: 'mosaic',
    build: () => ({
      version: 1,
      studio: 'mosaic',
      templateId: 'midpoint-mosaic',
      backdrop: 'none',
      view: VIEW,
      layers: [
        {
          ...withCreative(mosaic('shifted', { n: 3, rule: 'midpoint', showCurve: false, name: 'n = 3 (outline)' }, 3), {
            outline: true,
          }),
          showPoints: true,
        } as AreaLayer,
        {
          ...withCreative(mosaic('shifted', { n: 12, rule: 'midpoint', name: 'n = 12 mosaic' }, 0), {
            gap: 0.06,
            cells: 5,
          }),
          showPoints: true,
        } as AreaLayer,
      ],
    }),
  },
  {
    id: 'layered-landscape',
    title: 'Layered Riemann Landscape',
    description:
      'Midpoint sums of e^(−x²) with n = 4, 8 and 16 laid over each other as translucent hills that close in on the curve.',
    studio: 'mosaic',
    build: () => ({
      version: 1,
      studio: 'mosaic',
      templateId: 'layered-landscape',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(
          mosaic('gauss', { a: -2, b: 2, n: 4, rule: 'midpoint', showCurve: false, name: 'n = 4' }, 3),
          { repeat: 2, spacing: 0 },
          { opacity: 0.3 },
        ),
        withCreative(
          mosaic('gauss', { a: -2, b: 2, n: 8, rule: 'midpoint', showCurve: false, name: 'n = 8' }, 1),
          { repeat: 2, spacing: 0 },
          { opacity: 0.4 },
        ),
        withCreative(
          mosaic('gauss', { a: -2, b: 2, n: 16, rule: 'midpoint', name: 'n = 16' }, 0),
          {
            repeat: 2,
            spacing: 0,
          },
          { opacity: 0.55 },
        ),
      ],
    }),
  },
  {
    id: 'integral-city',
    title: 'Integral City',
    description:
      'One interval split into three districts of (x − 1)² + 2: lit towers whose integrals add up to the whole, reflected in the water.',
    studio: 'mosaic',
    build: () => ({
      version: 1,
      studio: 'mosaic',
      templateId: 'integral-city',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(
          mosaic('shifted', { a: -1, b: 0, n: 4, rule: 'mean', showCurve: false, name: 'West district [−1, 0]' }, 5),
          { gap: 0.18, mirror: 'water', windows: true },
        ),
        withCreative(
          mosaic('shifted', { a: 0, b: 1, n: 3, rule: 'mean', showCurve: false, name: 'Centre [0, 1]' }, 2),
          { gap: 0.22, mirror: 'water', windows: true },
        ),
        withCreative(
          mosaic('shifted', { a: 1, b: 2, n: 5, rule: 'mean', showCurve: false, name: 'East district [1, 2]' }, 1),
          { gap: 0.16, mirror: 'water', windows: true },
        ),
      ],
    }),
  },
  // --- Accumulation Art Studio ---------------------------------------------
  {
    id: 'accumulation-flow',
    title: 'Accumulation Flow',
    description: 'A wave and the area it accumulates, with repeated accumulation curves flowing from later starts.',
    studio: 'accumulation',
    build: () => ({
      version: 1,
      studio: 'accumulation',
      templateId: 'accumulation-flow',
      backdrop: 'none',
      view: VIEW,
      layers: [withCreative(accumulation('wave', { x: 3.6, echoes: 4, name: 'Wave and A(x)' }, 0), { weight: 1.2 })],
    }),
  },
  {
    id: 'mean-value-bands',
    title: 'Mean Value Bands',
    description:
      'Bands at the average value of f on each piece, each with exactly the area under the curve, reflected into a ribbon.',
    studio: 'accumulation',
    build: () => ({
      version: 1,
      studio: 'accumulation',
      templateId: 'mean-value-bands',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(
          mosaic('sqrt', { a: 0, b: 4, n: 4, rule: 'mean', showCurve: false, name: 'Wide bands' }, 3),
          { mirror: 'below', gap: 0.02 },
          { opacity: 0.35 },
        ),
        withCreative(mosaic('sqrt', { a: 0, b: 4, n: 16, rule: 'mean', name: 'Fine bands' }, 1), {
          mirror: 'below',
          gap: 0.15,
          colourMode: 'fade',
        }),
      ],
    }),
  },
  {
    id: 'convergence-trail',
    title: 'Convergence Trail',
    description:
      'A(t) for 1/x², e^(−x) and 1/x as t heads to infinity: two comet trails settle on their limits, one keeps climbing.',
    studio: 'accumulation',
    build: () => ({
      version: 1,
      studio: 'accumulation',
      templateId: 'convergence-trail',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(
          trail('recip', { reach: 0.7, dots: 28, name: '1/x: diverges' }, 2),
          { mirror: 'below', colourMode: 'alternate' },
          { opacity: 0.55 },
        ),
        withCreative(trail('expDecay', { reach: 1, dots: 30, name: 'e^(−x): converges' }, 3), {
          mirror: 'below',
          colourMode: 'fade',
        }),
        withCreative(trail('invSquare', { reach: 1, dots: 36, name: '1/x²: converges' }, 0), {
          mirror: 'below',
          colourMode: 'fade',
          weight: 1.2,
        }),
      ],
    }),
  },
  {
    id: 'asymptote-trail',
    title: 'Asymptote Trail',
    description: 'Trails of A(t) as t closes in on a vertical asymptote: 1/√(x − 2) and x^(−2/3) settle, 1/x³ escapes.',
    studio: 'accumulation',
    build: () => ({
      version: 1,
      studio: 'accumulation',
      templateId: 'asymptote-trail',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(
          trail('cubeAsym', { reach: 0.55, dots: 24, name: '1/x³ on (0, 2]: diverges' }, 2),
          { colourMode: 'alternate' },
          { opacity: 0.55 },
        ),
        withCreative(trail('powerAsym', { reach: 1, dots: 30, name: 'x^(−2/3) on (0, 8]: converges' }, 4), {
          colourMode: 'fade',
        }),
        withCreative(trail('rootAsym', { reach: 1, dots: 30, name: '1/√(x − 2) on (2, 5]: converges' }, 0), {
          colourMode: 'fade',
          weight: 1.2,
        }),
      ],
    }),
  },
  {
    id: 'twin-comparison-trails',
    title: 'Twin Comparison Trails',
    description:
      'Twin trails of e^(−x²) and e^(−x) from x = 1: the smaller integrand’s trail stays below a trail that converges.',
    studio: 'accumulation',
    build: () => ({
      version: 1,
      studio: 'accumulation',
      templateId: 'twin-comparison-trails',
      backdrop: 'none',
      view: VIEW,
      layers: [
        withCreative(trail('expDecay', { reach: 0.85, dots: 30, name: 'e^(−x): the larger function' }, 2), {
          mirror: 'below',
          colourMode: 'alternate',
        }),
        withCreative(trail('gauss', { reach: 0.85, dots: 30, name: 'e^(−x²): the smaller function' }, 0), {
          mirror: 'below',
          colourMode: 'fade',
          weight: 1.2,
        }),
      ],
    }),
  },
];

export const templateById = (id: string): AreaTemplate | undefined => AREA_TEMPLATES.find((t) => t.id === id);

/** A fresh project from a template. */
export function projectFromTemplate(template: AreaTemplate, title: string): AreaArtProject {
  return { ...template.build(), title, explanation: '' };
}

/** Configuration for one Create activity on an area studio. */
export interface AreaStudioConfig {
  studio: AreaStudioKind;
  /** The template a new project starts from. */
  starter: string;
  /** Layer kinds learners can add. */
  layerKinds: AreaLayerKind[];
  /** A question for "Math behind my art", answered in the learner's own words. */
  question: string;
}

/** Readable summary lines for a saved composition. */
export const layerSummary = (layer: AreaLayer): string => {
  const fn = AREA_FUNCTIONS[layer.fnId];
  if (layer.kind === 'mosaic')
    return `${layer.rule} sum of ${fn.label} on [${fmt(layer.a, 3)}, ${fmt(layer.b, 3)}], n = ${layer.n}`;
  if (layer.kind === 'accumulation')
    return `A(x) = ∫ from ${fmt(layer.a, 3)} to x of ${fn.label}, x = ${fmt(layer.x, 3)}`;
  return `A(t) for ${fn.label}, reach ${fmt(layer.reach, 2)}`;
};
