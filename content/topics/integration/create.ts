/**
 * Create activities for Topic 1. Graph art (the Equation Art Studio) is used
 * where graphs carry the mathematics: anti-derivative families, power curves,
 * substitution as a transformation, roots as arcs, and trigonometric patterns.
 * Partial fractions and integration by parts use structure / flow
 * compositions instead (no forced decorative art).
 *
 * Every studio opens on a starter artwork. Presets are original starting
 * points built from the subtopic's mathematics; pattern equations that are not
 * in the course notes are labelled as such.
 */
import type { Transformation } from '@/lib/graph/expression';
import type { FlowConfig, FlowExample, FlowNode } from '@/lib/graph/flow';
import { type ArtProject, emptyProject, newLayer } from '@/lib/graph/project';
import { ALL_FUNCTIONS, type GraphLayer, type GraphView, type Parameter } from '@/lib/graph/sample';
import type { StudioConfig, StudioPreset } from '@/lib/graph/studio';

const layer = (
  expression: string,
  name: string,
  color: number,
  extra: Partial<Omit<GraphLayer, 'id' | 'expression' | 'name' | 'color'>> = {},
): GraphLayer => ({ ...newLayer(extra.kind ?? 'cartesian', expression, name, color), ...extra });

const polar = (
  expression: string,
  name: string,
  color: number,
  extra: Partial<Omit<GraphLayer, 'id' | 'expression' | 'name' | 'color' | 'kind'>> = {},
): GraphLayer => layer(expression, name, color, { ...extra, kind: 'polar' });

const param = (name: string, value: number, min: number, max: number, step: number): Parameter => ({
  name,
  value,
  min,
  max,
  step,
});

const project = (title: string, view: GraphView, layers: GraphLayer[], parameters: Parameter[] = []): ArtProject => ({
  ...emptyProject(title, view),
  layers,
  parameters,
});

/**
 * Starters that use mathematics beyond Chapter 1 (decorative polar curves,
 * the heart's arccos curve, the non-elementary bell e^(−x²)). They are shown
 * under "Creative extensions", never as course content.
 */
const CREATIVE_EXTENSIONS = new Set([
  'flower',
  'flower-garden',
  'heart',
  'rose',
  'cos-plus-sin',
  'limacon',
  'mandala',
  'power-petals',
  'product-rose',
  'bell-mountains',
]);

const preset = (id: string, title: string, description: string, p: ArtProject): StudioPreset => ({
  id,
  title,
  description,
  category: CREATIVE_EXTENSIONS.has(id) ? 'extension' : 'course',
  project: p,
});

const view = (xMin: number, xMax: number, yMin: number, yMax: number, axes = true, grid = true): GraphView => ({
  xMin,
  xMax,
  yMin,
  yMax,
  axes,
  grid,
});

const WIDE = view(-6, 6, -4.5, 4.5);
const TWO_PI = 6.2832;
const FULL_TURN = { start: -TWO_PI, end: TWO_PI };

/** The starter a studio opens on: always a course-aligned one (the first, unless named). */
const firstPreset = (presets: StudioPreset[], id?: string) => () => {
  const course = presets.filter((p) => p.category === 'course');
  return ((id ? course.find((p) => p.id === id) : undefined) ?? course[0] ?? (presets[0] as StudioPreset)).project;
};

// -----------------------------------------------------------------------------
// 1. Antiderivative Curve Art (Understanding Integration)
// -----------------------------------------------------------------------------

const ribbonOffsets = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5];

const antiderivativePresets = [
  preset(
    'sine-ribbon',
    'Sine ribbon',
    'Seven anti-derivatives of $\\cos x$: $\\sin x + C$ for $C$ from $-1.5$ to $1.5$. Together they weave a ribbon; the thick curve moves with $C$.',
    project(
      'Sine ribbon',
      WIDE,
      [
        ...ribbonOffsets.map((c, i) =>
          layer(c === 0 ? 'sin(x)' : `sin(x) ${c < 0 ? '-' : '+'} ${Math.abs(c)}`, `C = ${c}`, i % 4, {
            domain: FULL_TURN,
            width: 2,
          }),
        ),
        layer('sin(x) + C', 'Moving curve', 4, { width: 4.5, domain: FULL_TURN }),
      ],
      [param('C', 2.5, -4, 4, 0.25)],
    ),
  ),
  preset(
    'nested-bowls',
    'Nested bowls',
    'Anti-derivatives of $x$: $\\frac{x^{2}}{2} + C$, cut off at $y = 3$. Each bowl is the same curve lifted by a different $C$.',
    project(
      'Nested bowls',
      view(-4.5, 4.5, -4, 4),
      [
        ...[-3, -2, -1, 0, 1, 2].map((c, i) =>
          layer(c === 0 ? 'x^2/2' : `x^2/2 ${c < 0 ? '-' : '+'} ${Math.abs(c)}`, `C = ${c}`, i % 4, {
            range: { min: null, max: 3 },
            width: 2.5,
          }),
        ),
        layer('x^2/2 + C', 'Moving bowl', 4, { range: { min: null, max: 3 }, width: 4 }),
      ],
      [param('C', -3.5, -4, 3, 0.25)],
    ),
  ),
  preset(
    'parabola-family',
    'Parabola family',
    'Layers of $F(x) = x^{2} + C$ for different $C$, all anti-derivatives of $2x$.',
    project(
      'Parabola family',
      view(-5, 5, -6, 10),
      [
        layer('x^2 - 3', 'C = −3', 0, { domain: { start: -2.5, end: 2.5 } }),
        layer('x^2 - 1', 'C = −1', 1, { domain: { start: -2.5, end: 2.5 } }),
        layer('x^2 + 1', 'C = 1', 2, { domain: { start: -2.5, end: 2.5 } }),
        layer('x^2 + C', 'Moving curve', 3, { width: 4 }),
      ],
      [param('C', 3, -5, 6, 0.5)],
    ),
  ),
  preset(
    'linear-term-family',
    'With a linear term',
    'Layers of $x^{2} + 5x + C$, anti-derivatives of $2x + 5$.',
    project(
      'With a linear term',
      view(-8, 3, -10, 8),
      [
        layer('x^2 + 5x', 'C = 0', 0),
        layer('x^2 + 5x + 4', 'C = 4', 1),
        layer('x^2 + 5x + C', 'Moving curve', 2, { width: 4 }),
      ],
      [param('C', 8, -6, 12, 0.5)],
    ),
  ),
];

const antiderivativeCurveArt: StudioConfig = {
  mode: 'full',
  layerKinds: ['cartesian'],
  functions: ['sin', 'cos', 'tan', 'ln', 'exp', 'arctan', 'arcsin'],
  concept:
    'Every curve $F(x) + C$ is an anti-derivative of the same $f(x)$. Changing $C$ moves the curve up or down; it never changes the slope at any $x$, so all the curves stay parallel.',
  transformations: ['Vertical shift by C', 'Domain restriction', 'Range restriction', 'Mirror image'],
  questions: [
    { id: 'changed', prompt: 'What changed between your layers?' },
    { id: 'same', prompt: 'What stayed the same?' },
    { id: 'why', prompt: 'Why are these all anti-derivatives of the same derivative?' },
  ],
  presets: antiderivativePresets,
  starter: firstPreset(antiderivativePresets),
  stamp: {
    label: 'Add this curve to the art',
    hint: 'Move $C$, then keep a copy. Each copy is another anti-derivative $F(x) + C$ of the same $f(x)$.',
  },
};

// -----------------------------------------------------------------------------
// 2. Function Curve Composer (Basic Integration Rules)
// -----------------------------------------------------------------------------

/** Right half of the plane, mirrored in the y-axis, clipped to a band so every curve ends inside the picture. */
const FAN = { domain: { start: 0, end: 2.4 }, mirror: true } as const;
const FAN_UP = { ...FAN, range: { min: null, max: 2 } };
const FAN_DOWN = { ...FAN, range: { min: -2, max: null } };

const composerPresets = [
  preset(
    'power-fan',
    'Symmetric power fan',
    'The power rule four times: $\\int a x^{n}\\,dx = \\frac{a}{n+1}x^{n+1}$ for $n = 1, 2, 3, 4$, drawn for $x \\ge 0$, mirrored in the $y$-axis and cut off at $|y| = 2$. Higher powers hug the axis longer, then rise faster. The slider $a$ opens and closes the fan.',
    project(
      'Symmetric power fan',
      view(-2.5, 2.5, -2.3, 2.3, false, true),
      [
        layer('a x^2/2', '∫ a x dx', 0, { ...FAN_UP, width: 3 }),
        layer('a x^3/3', '∫ a x² dx', 1, { ...FAN_UP, width: 3 }),
        layer('a x^4/4', '∫ a x³ dx', 2, { ...FAN_UP, width: 3 }),
        layer('a x^5/5', '∫ a x⁴ dx', 3, { ...FAN_UP, width: 3 }),
        layer('-a x^2/2', '∫ −a x dx', 0, { ...FAN_DOWN, width: 3 }),
        layer('-a x^3/3', '∫ −a x² dx', 1, { ...FAN_DOWN, width: 3 }),
        layer('-a x^4/4', '∫ −a x³ dx', 2, { ...FAN_DOWN, width: 3 }),
        layer('-a x^5/5', '∫ −a x⁴ dx', 3, { ...FAN_DOWN, width: 3 }),
      ],
      [param('a', 1, 0.25, 3, 0.25)],
    ),
  ),
  preset(
    'parabola-bloom',
    'Parabola bloom',
    'The constant-multiple rule: $\\int kx\\,dx = \\frac{k}{2}x^{2}$ for $k = \\frac{1}{2}, 1, 2, 4$ and their negatives, each cut off at $|y| = 2$. Nested parabolas open like petals; $C$ lifts the upper set.',
    project(
      'Parabola bloom',
      view(-3.2, 3.2, -2.4, 2.4, false, true),
      [
        ...[0.5, 1, 2, 4].flatMap((k, i) => [
          layer(`${k} x^2/2 + C`, `∫ ${k}x dx`, i, { range: { min: null, max: 2 }, width: 3 }),
          layer(`-${k} x^2/2`, `∫ −${k}x dx`, i, { range: { min: -2, max: null }, width: 3 }),
        ]),
      ],
      [param('C', 0, -1.5, 1.5, 0.25)],
    ),
  ),
  preset(
    'butterfly',
    'Polynomial wings',
    'Sums of powers, integrated term by term: $\\int (x^{3} - 2x)\\,dx = \\frac{x^{4}}{4} - x^{2}$, and smaller copies, mirrored to make wings.',
    project(
      'Polynomial wings',
      view(-3, 3, -2.5, 2.5),
      [
        layer('x^4/4 - x^2', 'Upper wing edge', 0, { domain: { start: -2, end: 2 }, width: 3 }),
        layer('-(x^4/4 - x^2)', 'Lower wing edge', 0, { domain: { start: -2, end: 2 }, width: 3 }),
        layer('a * (x^4/8 - x^2/2)', 'Inner wing', 2, { domain: { start: -2, end: 2 } }),
        layer('-a * (x^4/8 - x^2/2)', 'Inner wing (lower)', 2, { domain: { start: -2, end: 2 } }),
        layer('x^3/3', 'Body', 3, { domain: { start: -0.5, end: 0.5 }, width: 5 }),
      ],
      [param('a', 1, 0.2, 2, 0.1)],
    ),
  ),
];

const functionCurveComposer: StudioConfig = {
  mode: 'lite',
  layerKinds: ['cartesian'],
  functions: [],
  concept:
    'The power rule: $\\int ax^{n}\\,dx = \\frac{a}{n+1}x^{n+1} + C$. Each curve is the anti-derivative of a power function; the sum rule lets you integrate several powers term by term, and the slider $C$ moves the curves up or down.',
  transformations: ['Coefficient stretch', 'Vertical shift by C', 'Domain restriction', 'Reflection'],
  questions: [
    {
      id: 'curve',
      prompt: 'Pick one of your curves. Which integrand does it come from, and how can you tell from its shape?',
    },
  ],
  presets: composerPresets,
  starter: firstPreset(composerPresets),
  composer: { id: 'power-rule', exponents: [0, 1, 2, 3, 4] },
};

// -----------------------------------------------------------------------------
// 3. Transformation Art (Substitution)
// -----------------------------------------------------------------------------

const SUBSTITUTIONS: Transformation[] = [
  {
    id: 'linear',
    label: 'u = ax + b',
    effect:
      'Substitute $u = ax + b$: the curve is squeezed horizontally by $a$ and shifted by $-\\frac{b}{a}$. This is the substitution behind $\\int f(ax + b)\\,dx = \\frac{1}{a}F(ax + b) + C$.',
    inner: 'a x + b',
    parameters: [param('a', 2, -3, 3, 0.25), param('b', 1, -4, 4, 0.25)],
  },
  {
    id: 'shift',
    label: 'u = x − h',
    effect: 'Substitute $u = x - h$: the same shape, moved $h$ units to the right.',
    inner: 'x - h',
    parameters: [param('h', 1.5, -4, 4, 0.25)],
  },
  {
    id: 'stretch',
    label: 'u = ax',
    effect: 'Substitute $u = ax$: the curve is squeezed horizontally by the factor $a$ (and reflected if $a < 0$).',
    inner: 'a x',
    parameters: [param('a', 2, -3, 3, 0.25)],
  },
  {
    id: 'reflect',
    label: 'u = −x',
    effect: 'Substitute $u = -x$: the curve is reflected in the $y$-axis.',
    inner: '-x',
    parameters: [],
  },
  {
    id: 'scale',
    label: 'k · f(u)',
    effect: 'Multiply the output by $k$: the curve is stretched vertically.',
    outer: 'k f',
    parameters: [param('k', 1.5, -3, 3, 0.25)],
  },
  {
    id: 'lift',
    label: 'f(u) + c',
    effect: 'Add $c$ to the output: the curve moves up, like the $+C$ of an anti-derivative.',
    outer: 'f + c',
    parameters: [param('c', 1, -3, 3, 0.25)],
  },
];

const transformationPresets = [
  preset(
    'substitution-braid',
    'Substitution braid',
    'The dashed base $\\sin x$ and copies $\\sin(x - h)$ with $h = \\frac{2\\pi}{3}$ and $\\frac{4\\pi}{3}$ form a braid. The thick curve is $\\sin(ax + b)$: move $a$ and $b$.',
    project(
      'Substitution braid',
      WIDE,
      [
        layer('sin(x)', 'Base curve', 0, { domain: FULL_TURN, dashed: true, width: 2 }),
        layer('sin(x - 2.0944)', 'u = x − 2π/3', 1, { domain: FULL_TURN }),
        layer('sin(x - 4.1888)', 'u = x − 4π/3', 2, { domain: FULL_TURN }),
        layer('1.5 sin(a x + b)', 'u = ax + b', 4, { domain: FULL_TURN, width: 4 }),
      ],
      [param('a', 1, -3, 3, 0.25), param('b', 1, -4, 4, 0.25)],
    ),
  ),
  preset(
    'bell-mountains',
    'Bell mountains',
    'One bell curve $e^{-u^{2}}$ (dashed), drawn again with $u = ax + b$ and different heights: a mountain range from a single shape.',
    project(
      'Bell mountains',
      view(-6, 6, -1, 4),
      [
        layer('e^(-x^2)', 'Base curve', 0, { dashed: true, width: 2 }),
        layer('2.5 e^(-((x + 2.5)/1.5)^2)', 'u = (x + 2.5)/1.5', 1, { width: 3 }),
        layer('1.8 e^(-(x - 2)^2)', 'u = x − 2', 2, { width: 3 }),
        layer('1.2 e^(-(2x - 8)^2)', 'u = 2x − 8', 3, { width: 3 }),
        layer('k e^(-(a x + b)^2)', 'u = ax + b', 4, { width: 4 }),
      ],
      [param('a', 0.75, -3, 3, 0.25), param('b', 0, -4, 4, 0.25), param('k', 3, 0, 4, 0.25)],
    ),
  ),
  preset(
    'harmonic-stack',
    'Harmonic stack',
    '$\\frac{1}{n}\\cos(nx)$ for $n = 1, 2, 3, 4$: the substitution $u = nx$ squeezes $\\cos u$, and the factor $\\frac{1}{n}$ is the one in $\\int \\sin(nx)\\,dx$.',
    project(
      'Harmonic stack',
      view(-6.5, 6.5, -1.5, 1.5),
      [
        layer('cos(x)', 'Base curve (n = 1)', 0, { dashed: true, domain: FULL_TURN }),
        layer('cos(2x)/2', 'u = 2x', 1, { domain: FULL_TURN }),
        layer('cos(3x)/3', 'u = 3x', 2, { domain: FULL_TURN }),
        layer('cos(4x)/4', 'u = 4x', 3, { domain: FULL_TURN }),
        layer('cos(a x)/a', 'u = ax', 4, { domain: FULL_TURN, width: 4 }),
      ],
      [param('a', 5, 1, 8, 0.5)],
    ),
  ),
];

const transformationArt: StudioConfig = {
  mode: 'full',
  layerKinds: ['cartesian'],
  functions: ['sin', 'cos', 'exp'],
  concept:
    'A substitution $u = g(x)$ changes where a curve is drawn, not its basic shape. With $u = ax + b$ the graph of $f(u)$ is squeezed by $a$ and shifted by $-\\frac{b}{a}$, which is why $\\int f(ax + b)\\,dx = \\frac{1}{a}F(ax + b) + C$. In your art, the dashed curve is the "before" and the solid curves are the "after".',
  transformations: [
    'Substitution u = ax + b',
    'Shift u = x − h',
    'Stretch u = ax',
    'Reflection u = −x',
    'Vertical stretch k · f',
    'Vertical shift + c',
  ],
  questions: [
    { id: 'what', prompt: 'Which substitution did you apply, and what did it do to the picture?' },
    { id: 'factor', prompt: 'For $u = ax + b$, why does $\\int f(ax + b)\\,dx$ have the factor $\\frac{1}{a}$?' },
  ],
  note: 'Bell mountains is a creative extension: the bell curve e^(−x²) has no elementary anti-derivative and is not in Chapter 1. It is used only as a shape to transform.',
  presets: transformationPresets,
  starter: firstPreset(transformationPresets),
  transform: {
    intro:
      'Choose a curve and a substitution. The original becomes the dashed "before" curve; the transformed copy is added with its own sliders.',
    operations: SUBSTITUTIONS,
  },
};

// -----------------------------------------------------------------------------
// 5. Equation Art Studio (Algebraic and Trigonometric Substitution)
// -----------------------------------------------------------------------------

const FLOWER_VIEW = view(-1.7, 1.7, -1.7, 1.7, false, false);

const equationArtPresets = [
  preset(
    'flower',
    'Flower',
    'Polar petals $r = 1.3\\cos(a\\theta)$ and $r = 0.75\\sin(a\\theta)$ around a circle $r = 0.28$. Move $a$ to change the number of petals.',
    project(
      'Flower',
      FLOWER_VIEW,
      [
        polar('1.3 cos(a θ)', 'Outer petals', 0, { width: 3 }),
        polar('0.75 sin(a θ)', 'Inner petals', 2, { width: 2.5 }),
        polar('0.28', 'Centre', 3, { width: 4 }),
      ],
      [param('a', 4, 1, 9, 1)],
    ),
  ),
  preset(
    'heart',
    'Heart',
    'Two arcs of circles $y = \\sqrt{1 - (|x| - 1)^{2}}$ (roots like Table 1.1) on top of $y = \\cos^{-1}(1 - |x|) - \\pi$, each restricted to $-2 \\le x \\le 2$; a smaller copy sits inside.',
    project(
      'Heart',
      view(-2.6, 2.6, -3.5, 1.4),
      [
        layer('sqrt(1 - (|x| - 1)^2)', 'Top arcs', 2, { domain: { start: -2, end: 2 }, width: 3.5 }),
        layer('arccos(1 - |x|) - π', 'Lower curve', 2, { domain: { start: -2, end: 2 }, width: 3.5 }),
        layer('k * sqrt(1 - (|x|/k - 1)^2)', 'Inner top', 0, { domain: { start: -2, end: 2 } }),
        layer('k * (arccos(1 - |x|/k) - π)', 'Inner lower', 0, { domain: { start: -2, end: 2 } }),
      ],
      [param('k', 0.55, 0.2, 0.9, 0.05)],
    ),
  ),
  preset(
    'layered-waves',
    'Layered waves',
    'Five waves $a\\sin(x + j) + c_{j}$, each shifted along and lifted. One slider $a$ changes every amplitude at once.',
    project(
      'Layered waves',
      view(-6.3, 6.3, -3.5, 3.5),
      [
        layer('a sin(x) + 2', 'Wave 1', 0, { domain: FULL_TURN, width: 3 }),
        layer('a sin(x + 0.8) + 1', 'Wave 2', 1, { domain: FULL_TURN, width: 3 }),
        layer('a sin(x + 1.6)', 'Wave 3', 2, { domain: FULL_TURN, width: 3 }),
        layer('a sin(x + 2.4) - 1', 'Wave 4', 3, { domain: FULL_TURN, width: 3 }),
        layer('a sin(x + 3.2) - 2', 'Wave 5', 4, { domain: FULL_TURN, width: 3 }),
      ],
      [param('a', 0.7, 0, 1.5, 0.05)],
    ),
  ),
  preset(
    'arches',
    'Bridge of arcs',
    'Semicircles $y = \\sqrt{a^{2} - (x - c)^{2}}$, the roots in the first row of Table 1.1, translated and restricted, with their reflections $-\\frac{1}{2}\\sqrt{a^{2} - (x - c)^{2}}$ in the water. Move $a$ to resize the main arch.',
    project(
      'Bridge of arcs',
      view(-5.6, 5.6, -1.6, 2.6),
      [
        layer('sqrt(a^2 - x^2)', 'Main arch', 0, { width: 3.5 }),
        layer('sqrt(1 - (x - 2.8)^2)', 'Right arch', 1, { width: 3 }),
        layer('sqrt(1 - (x + 2.8)^2)', 'Left arch', 1, { width: 3 }),
        layer('sqrt(0.36 - (x - 4.6)^2)', 'Far right arch', 2, { width: 2.5 }),
        layer('sqrt(0.36 - (x + 4.6)^2)', 'Far left arch', 2, { width: 2.5 }),
        layer('2.1', 'Road', 3, { domain: { start: -5.3, end: 5.3 }, width: 3.5 }),
        layer('0', 'Water line', 4, { domain: { start: -5.3, end: 5.3 }, width: 2 }),
        layer('-sqrt(a^2 - x^2)/2', 'Main reflection', 0, { dashed: true, width: 2 }),
        layer('-sqrt(1 - (x - 2.8)^2)/2', 'Right reflection', 1, { dashed: true, width: 2 }),
        layer('-sqrt(1 - (x + 2.8)^2)/2', 'Left reflection', 1, { dashed: true, width: 2 }),
      ],
      [param('a', 1.6, 0.5, 2, 0.1)],
    ),
  ),
  preset(
    'flower-garden',
    'Flower garden',
    'Three polar flowers $r = \\cos(a\\theta)$ and $r = \\sin(a\\theta)$, each moved to its own centre $(h, k)$, scaled and turned, above a ground curve $y = 0.2\\sin 2x - 1.6$.',
    project(
      'Flower garden',
      view(-4, 4, -2.2, 2.6, false, false),
      [
        polar('cos(a θ)', 'Left flower', 0, { width: 2.5, placement: { h: -2.5, k: 0.4, scale: 0.8, rotation: 0 } }),
        polar('0.22', 'Left centre', 3, { width: 3, placement: { h: -2.5, k: 0.4, scale: 0.8, rotation: 0 } }),
        polar('cos(a θ)', 'Middle flower', 2, {
          width: 3,
          placement: { h: 0, k: 1.1, scale: 1.1, rotation: 22.5 },
        }),
        polar('0.25', 'Middle centre', 3, { width: 3, placement: { h: 0, k: 1.1, scale: 1.1, rotation: 0 } }),
        polar('sin(a θ)', 'Right flower', 1, { width: 2.5, placement: { h: 2.5, k: 0.2, scale: 0.75, rotation: 0 } }),
        polar('0.22', 'Right centre', 3, { width: 3, placement: { h: 2.5, k: 0.2, scale: 0.75, rotation: 0 } }),
        layer('0.2 sin(2x) - 1.6', 'Ground', 4, { domain: { start: -4, end: 4 }, width: 3 }),
      ],
      [param('a', 4, 1, 8, 1)],
    ),
  ),
  preset(
    'lens',
    'Lens',
    'A circle from $y = \\pm\\sqrt{4 - x^{2}}$ with an inner curve that changes with $a$.',
    project(
      'Lens',
      view(-3, 3, -2.5, 2.5),
      [
        layer('sqrt(4 - x^2)', 'Upper circle', 0),
        layer('-sqrt(4 - x^2)', 'Lower circle', 0),
        layer('sqrt(a^2 - x^2)/2', 'Upper lens', 2),
        layer('-sqrt(a^2 - x^2)/2', 'Lower lens', 2),
      ],
      [param('a', 1.5, 0.5, 2, 0.1)],
    ),
  ),
  preset(
    'hills',
    'Hills and sky',
    'Restricted pieces of $\\sin x$ and a parabola, with a moving sun $y = \\sqrt{r^{2} - (x - h)^{2}} + 3$.',
    project(
      'Hills and sky',
      WIDE,
      [
        layer('0.6 sin(1.5x) + 0.8', 'Hills', 1, { domain: { start: -6, end: 6 } }),
        layer('-x^2/4 + 2', 'Mountain', 0, { domain: { start: -2.8, end: 2.8 }, range: { min: 0.2, max: null } }),
        layer('sqrt(r^2 - (x - h)^2) + 3', 'Sun (top)', 3),
        layer('-sqrt(r^2 - (x - h)^2) + 3', 'Sun (bottom)', 3),
      ],
      [param('h', 3, -5, 5, 0.25), param('r', 0.6, 0.2, 1.2, 0.1)],
    ),
  ),
];

const equationArtStudio: StudioConfig = {
  mode: 'full',
  layerKinds: ['cartesian', 'polar'],
  functions: [...ALL_FUNCTIONS],
  concept:
    'The art is built from restricted pieces of functions. Roots such as $\\sqrt{a^{2} - x^{2}}$ draw arcs of circles: that is exactly why the substitution $x = a\\sin\\theta$ removes the root (Table 1.1). Polar layers $r = f(\\theta)$ give petals and loops.',
  transformations: [
    'Translation',
    'Vertical stretch',
    'Domain restriction',
    'Range restriction',
    'Mirror image',
    'Rotational symmetry',
    'Parameter animation',
  ],
  questions: [
    { id: 'equations', prompt: 'Which equations did you use, and what restriction did each need?' },
    { id: 'table', prompt: 'Pick one root in your art. Which substitution from Table 1.1 matches it, and why?' },
  ],
  note: 'Course-aligned starters use roots, sine curves and parabolas from the notes. The flower, garden and heart are creative extensions: their polar and inverse-cosine curves are not taught in Chapter 1.',
  presets: equationArtPresets,
  starter: firstPreset(equationArtPresets, 'arches'),
  equalScale: true,
};

// -----------------------------------------------------------------------------
// Trig Pattern Studio (Algebraic and Trigonometric Substitution)
// -----------------------------------------------------------------------------

const trigPresets = [
  preset(
    'sine-cosine-layers',
    'Sine and cosine layers',
    'Transformations of $\\sin x$ and $\\cos x$: $a\\sin(bx)$, $a\\cos(bx)$ and $\\sin x + \\cos x$, the functions met in the substitution $t = \\tan\\frac{x}{2}$. Move $a$ and $b$ to change height and frequency.',
    project(
      'Sine and cosine layers',
      view(-6.3, 6.3, -2.6, 2.6),
      [
        layer('a sin(b x)', 'a sin(bx)', 0, { domain: FULL_TURN, width: 3 }),
        layer('a cos(b x)', 'a cos(bx)', 2, { domain: FULL_TURN, width: 3 }),
        layer('sin(x) + cos(x)', 'sin x + cos x', 1, { domain: FULL_TURN, width: 2.5, dashed: true }),
        layer('-a sin(b x)', '−a sin(bx)', 3, { domain: FULL_TURN, width: 2 }),
      ],
      [param('a', 1.5, 0.25, 2.5, 0.25), param('b', 1, 0.5, 4, 0.5)],
    ),
  ),
  preset(
    'rose',
    'Rose',
    '$r = \\cos(a\\theta)$: the number of petals follows $a$.',
    project(
      'Rose',
      view(-1.2, 1.2, -1.2, 1.2, false, false),
      [polar('cos(a θ)', 'Rose', 0, { width: 3 })],
      [param('a', 3, 1, 9, 1)],
    ),
  ),
  preset(
    'cos-plus-sin',
    'Cosine plus sine',
    '$r = \\cos(a\\theta) + \\sin(a\\theta)$ morphs as $a$ changes.',
    project(
      'Cosine plus sine',
      view(-1.6, 1.6, -1.6, 1.6, false, false),
      [polar('cos(a θ) + sin(a θ)', 'Pattern', 1, { width: 3 })],
      [param('a', 2, 0.5, 8, 0.5)],
    ),
  ),
  preset(
    'limacon',
    'Limaçon',
    '$r = 1 + b\\cos\\theta$ with a sine wave band below.',
    project(
      'Limaçon',
      view(-3, 3, -3, 3, false, false),
      [polar('1 + b cos(θ)', 'Limaçon', 2, { width: 3 }), layer('0.3 sin(4x) - 2.4', 'Wave band', 0)],
      [param('b', 1.5, 0, 3, 0.1)],
    ),
  ),
];

const trigPatternStudio: StudioConfig = {
  mode: 'full',
  layerKinds: ['polar', 'cartesian'],
  functions: ['sin', 'cos', 'tan'],
  concept:
    'These patterns are made from sine and cosine with parameters. In a polar layer, $r$ depends on $\\theta$; changing a parameter changes the frequency and the symmetry of the pattern.',
  note: 'The course-aligned starter uses sine and cosine as in the notes. The polar patterns (rose, limaçon) are creative extensions: Chapter 1 does not teach polar curves.',
  transformations: [
    'Frequency change',
    'Rotational symmetry',
    'Reflection symmetry',
    'Sum of sine and cosine',
    'Domain restriction',
  ],
  questions: [
    {
      id: 'parameter',
      prompt: 'What happens to your pattern when you change a parameter? Use the words frequency or symmetry.',
    },
  ],
  presets: trigPresets,
  starter: firstPreset(trigPresets),
  equalScale: true,
};

// -----------------------------------------------------------------------------
// 7. Dynamic Pattern Studio (Advanced Integration Patterns)
// -----------------------------------------------------------------------------

const UNIT = view(-1.25, 1.25, -1.25, 1.25, false, false);

const dynamicPresets = [
  preset(
    'mandala',
    'Mandala',
    'A product rose $r = \\cos(p\\theta)\\sin(q\\theta)$ with six rotated copies, a ring $r = 0.6\\cos^{2}(q\\theta)$ and a centre circle. Move $p$ and $q$, or press play.',
    project(
      'Mandala',
      UNIT,
      [
        polar('cos(p θ) sin(q θ)', 'Petal ring', 0, { width: 1.6, repeat: 6 }),
        polar('0.6 cos(q θ)^2', 'Inner ring', 2, { width: 2.2 }),
        polar('0.18', 'Centre', 3, { width: 3 }),
      ],
      [param('p', 5, 1, 9, 1), param('q', 3, 1, 9, 1)],
    ),
  ),
  preset(
    'power-petals',
    'Power petals',
    '$r = \\sin^{m}\\theta\\cos^{n}\\theta$, the integrands of the notes, as a rotated pattern.',
    project(
      'Power petals',
      UNIT,
      [polar('sin(θ)^m cos(θ)^n', 'Petals', 1, { width: 2.5, repeat: 4 })],
      [param('m', 1, 0, 6, 1), param('n', 2, 0, 6, 1)],
    ),
  ),
  preset(
    'product-rose',
    'Product rose',
    '$r = \\sin(p\\theta)\\cos(q\\theta)$ with rotated copies.',
    project(
      'Product rose',
      UNIT,
      [
        polar('sin(p θ) cos(q θ)', 'Rose', 0, { width: 2.5, repeat: 3 }),
        polar('0.35 cos(p θ)', 'Centre', 3, { width: 1.5 }),
      ],
      [param('p', 5, 1, 9, 1), param('q', 2, 1, 9, 1)],
    ),
  ),
  preset(
    'wave-lattice',
    'Wave lattice',
    'Rows of $\\sin(px)\\cos(qx)$ and their mirror images. By the product-to-sum identity each row is also $\\frac{1}{2}\\sin(p+q)x + \\frac{1}{2}\\sin(p-q)x$.',
    project(
      'Wave lattice',
      view(-3.2, 3.2, -3, 3, false, false),
      [
        layer('sin(p x) cos(q x) + 2', 'Row 1', 0, { width: 2.5 }),
        layer('-sin(p x) cos(q x) + 2', 'Row 1 mirror', 1, { width: 2.5 }),
        layer('sin(p x) cos(q x)', 'Row 2', 2, { width: 2.5 }),
        layer('-sin(p x) cos(q x)', 'Row 2 mirror', 3, { width: 2.5 }),
        layer('sin(p x) cos(q x) - 2', 'Row 3', 0, { width: 2.5 }),
        layer('-sin(p x) cos(q x) - 2', 'Row 3 mirror', 1, { width: 2.5 }),
      ],
      [param('p', 3, 1, 8, 1), param('q', 1, 1, 8, 1)],
    ),
  ),
  preset(
    'power-integrands',
    'Power integrands',
    'The integrands of the notes, $\\sin^{m}x\\cos^{n}x$: fixed layers $\\sin^{2}x$, $\\cos^{2}x$ and $\\sin x\\cos x$, and a moving curve whose powers $m$ and $n$ you choose. Odd and even powers change the symmetry.',
    project(
      'Power integrands',
      view(-3.3, 3.3, -1.3, 1.3, true, true),
      [
        layer('sin(x)^2', 'sin²x', 0, { width: 2.5 }),
        layer('cos(x)^2', 'cos²x', 1, { width: 2.5 }),
        layer('sin(x) cos(x)', 'sin x cos x', 2, { width: 2.5 }),
        layer('sin(x)^m cos(x)^n', 'sinᵐx cosⁿx', 4, { width: 4 }),
      ],
      [param('m', 3, 0, 6, 1), param('n', 2, 0, 6, 1)],
    ),
  ),
  preset(
    'identity-check',
    'Product-to-sum, drawn',
    'Two layers, $\\sin px\\cos qx$ and $\\frac{1}{2}\\sin(p+q)x + \\frac{1}{2}\\sin(p-q)x$, lie on top of each other for every $p$ and $q$: the identity from the notes.',
    project(
      'Product-to-sum, drawn',
      WIDE,
      [
        layer('sin(p x) cos(q x)', 'Product', 0, { width: 5 }),
        layer('0.5 sin((p + q) x) + 0.5 sin((p - q) x)', 'Sum', 2, { width: 2 }),
      ],
      [param('p', 3, 1, 8, 1), param('q', 2, 1, 8, 1)],
    ),
  ),
];

const dynamicPatternStudio: StudioConfig = {
  mode: 'full',
  layerKinds: ['polar', 'cartesian'],
  functions: ['sin', 'cos', 'tan'],
  concept:
    'Powers and products of sine and cosine, as in the notes: $\\sin^{m}x\\cos^{n}x$, and $\\sin px\\cos qx = \\frac{1}{2}\\sin(p+q)x + \\frac{1}{2}\\sin(p-q)x$. Rotated copies and mirroring add symmetry; the integers $p$ and $q$ decide how many petals appear.',
  note: 'Course-aligned starters use only the identities and integrands of the notes. Creative extensions (mandala, petals, roses) arrange them as polar patterns, which Chapter 1 does not teach.',
  transformations: [
    'Product-to-sum identity',
    'Odd/even powers',
    'Rotational symmetry',
    'Mirror image',
    'Parameter animation',
    'Domain restriction',
  ],
  questions: [
    { id: 'identity', prompt: 'Which identity explains one of your layers? Write it.' },
    { id: 'parameters', prompt: 'How did changing a parameter change the symmetry or the number of petals?' },
  ],
  presets: dynamicPresets,
  starter: firstPreset(dynamicPresets),
  equalScale: true,
};

export const STUDIO_CONFIGS: Readonly<Record<string, StudioConfig>> = {
  'antiderivative-curve-art': antiderivativeCurveArt,
  'function-curve-composer': functionCurveComposer,
  'transformation-art': transformationArt,
  'equation-art-studio': equationArtStudio,
  'trig-pattern-studio': trigPatternStudio,
  'dynamic-pattern-studio': dynamicPatternStudio,
};

// -----------------------------------------------------------------------------
// Structure and solution-flow creations
// -----------------------------------------------------------------------------

const nodes = (prefix: string, list: [string, string, string][]): FlowNode[] =>
  list.map(([role, tex, note], i) => ({ id: `${prefix}-${i}`, role, tex, note }));

const example = (id: string, title: string, list: [string, string, string][]): FlowExample => ({
  id,
  title,
  nodes: nodes(id, list),
});

const decompositionMap: FlowConfig = {
  kind: 'structure',
  concept:
    'Partial fractions: the factors of the denominator decide the form of the decomposition, and each simpler fraction has a standard integral.',
  examples: [
    example('case-1', 'Distinct linear factors', [
      ['Original rational function', '\\frac{x+7}{x^{2}-x-6}', 'Proper: degree 1 over degree 2.'],
      ['Denominator factorisation', '(x-3)(x+2)', 'Two different linear factors.'],
      ['Case', '\\text{Case I: distinct linear factors}', 'One constant over each factor.'],
      ['Decomposition', '\\frac{2}{x-3} - \\frac{1}{x+2}', 'Find the constants.'],
      ['Simpler integrals', '2\\int \\frac{dx}{x-3} - \\int \\frac{dx}{x+2}', 'Integrate each term.'],
      ['Anti-derivative', '2\\ln|x-3| - \\ln|x+2| + C', 'Logarithms.'],
    ]),
    example('case-2', 'A repeated factor', [
      ['Original rational function', '\\frac{5x^{2}+20x+6}{x^{3}+2x^{2}+x}', 'Proper: degree 2 over degree 3.'],
      ['Denominator factorisation', 'x(x+1)^{2}', 'The factor x + 1 repeats.'],
      ['Case', '\\text{Case II: repeated linear factor}', 'Every power of the repeated factor appears.'],
      ['Decomposition', '\\frac{6}{x} - \\frac{1}{x+1} + \\frac{9}{(x+1)^{2}}', 'Find the constants.'],
      [
        'Simpler integrals',
        '\\int \\frac{6}{x}\\,dx - \\int \\frac{dx}{x+1} + \\int \\frac{9}{(x+1)^{2}}\\,dx',
        'Integrate each term.',
      ],
      ['Anti-derivative', '\\ln\\left|\\frac{x^{6}}{x+1}\\right| - \\frac{9}{x+1} + C', 'Two logarithms and a power.'],
    ]),
    example('case-3', 'A quadratic factor', [
      ['Original rational function', '\\frac{x+1}{x(x^{2}+1)}', 'Proper: degree 1 over degree 3.'],
      ['Denominator factorisation', 'x(x^{2}+1)', 'x² + 1 has no real factors.'],
      ['Case', '\\text{Case III: irreducible quadratic factor}', 'A linear numerator over the quadratic.'],
      ['Decomposition', '\\frac{1}{x} + \\frac{-x+1}{x^{2}+1}', 'Find the constants.'],
      [
        'Simpler integrals',
        '\\int \\frac{dx}{x} - \\int \\frac{x\\,dx}{x^{2}+1} + \\int \\frac{dx}{x^{2}+1}',
        'Split the quadratic term.',
      ],
      [
        'Anti-derivative',
        '\\ln|x| - \\frac{1}{2}\\ln(x^{2}+1) + \\tan^{-1}x + C',
        'A logarithm and an inverse tangent.',
      ],
    ]),
    example('improper', 'An improper fraction', [
      ['Original rational function', '\\frac{x^{5}+x-1}{x^{4}-x^{3}}', 'Improper: degree 5 over degree 4.'],
      ['Long division', 'x + 1 + \\frac{x^{3}+x-1}{x^{4}-x^{3}}', 'Divide first.'],
      ['Denominator factorisation', 'x^{3}(x-1)', 'The factor x repeats three times.'],
      ['Decomposition', '\\frac{1}{x^{3}} + \\frac{1}{x-1}', 'Here A = B = 0.'],
      ['Simpler integrals', '\\int \\left(x + 1 + x^{-3} + \\frac{1}{x-1}\\right)dx', 'Integrate term by term.'],
      ['Anti-derivative', '\\frac{x^{2}}{2} + x - \\frac{1}{2x^{2}} + \\ln|x-1| + C', 'As in the notes.'],
    ]),
  ],
  questions: [{ id: 'repeat', prompt: 'How does a repeated factor change the decomposition in your map?' }],
};

const solutionFlowBuilder: FlowConfig = {
  kind: 'flow',
  concept:
    'Integration by parts: $\\int u\\,dv = uv - \\int v\\,du$. A good $u$ simplifies when differentiated; repeat the method if a product remains.',
  examples: [
    example('xex', '∫ x eˣ dx', [
      ['Original integral', '\\int xe^{x}\\,dx', 'A product.'],
      ['Choose u and dv', 'u = x, \\quad dv = e^{x}\\,dx', 'x simplifies when differentiated.'],
      ['du and v', 'du = dx, \\quad v = e^{x}', 'Differentiate u, integrate dv.'],
      ['Formula', 'xe^{x} - \\int e^{x}\\,dx', 'uv − ∫ v du.'],
      ['Remaining integral', '\\int e^{x}\\,dx = e^{x}', 'A standard integral.'],
      ['Final answer', 'xe^{x} - e^{x} + C', 'Add C.'],
    ]),
    example('x2lnx', '∫ x² ln x dx', [
      ['Original integral', '\\int x^{2}\\ln x\\,dx', 'A product with a logarithm.'],
      ['Choose u and dv', 'u = \\ln x, \\quad dv = x^{2}\\,dx', 'x² is easier to integrate than ln x.'],
      ['du and v', 'du = \\frac{1}{x}\\,dx, \\quad v = \\frac{x^{3}}{3}', 'Differentiate u, integrate dv.'],
      ['Formula', '\\frac{x^{3}}{3}\\ln x - \\int \\frac{x^{3}}{3} \\cdot \\frac{1}{x}\\,dx', 'uv − ∫ v du.'],
      ['Remaining integral', '\\frac{1}{3}\\int x^{2}\\,dx = \\frac{x^{3}}{9}', 'A power.'],
      ['Final answer', '\\frac{x^{3}}{3}\\ln x - \\frac{x^{3}}{9} + C', 'Add C.'],
    ]),
    example('x2ex', '∫ x² eˣ dx (twice)', [
      ['Original integral', '\\int x^{2}e^{x}\\,dx', 'A product.'],
      ['Choose u and dv', 'u = x^{2}, \\quad dv = e^{x}\\,dx', 'x² simplifies when differentiated.'],
      ['du and v', 'du = 2x\\,dx, \\quad v = e^{x}', 'Differentiate u, integrate dv.'],
      ['Formula', 'x^{2}e^{x} - \\int 2xe^{x}\\,dx', 'A product remains.'],
      ['Repeat', 'u = 2x, \\quad dv = e^{x}\\,dx', 'Apply integration by parts again.'],
      ['Remaining integral', '2xe^{x} - \\int 2e^{x}\\,dx', 'Now a standard integral.'],
      ['Final answer', 'e^{x}(x^{2} - 2x + 2) + C', 'As in the notes.'],
    ]),
  ],
  questions: [{ id: 'u', prompt: 'What made your choice of u useful in this flow?' }],
};

export const FLOW_CONFIGS: Readonly<Record<string, FlowConfig>> = {
  'decomposition-map': decompositionMap,
  'solution-flow-builder': solutionFlowBuilder,
};
