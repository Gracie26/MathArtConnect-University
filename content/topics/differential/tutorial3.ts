/**
 * Tutorial 3 "Differential Calculus in ℝⁿ Part 1" (24 August 2026): all 125
 * parts, transcribed exactly as printed (checked against the page images).
 *
 * Parts are placed by the method they practise (approved specification):
 *   Q1–Q2                                   → §3.1   Functions of Several Variables
 *   Q3–Q6, Q8(i)(ii), Q17                   → §3.2.1 Partial Derivatives
 *   Q9, Q10–Q16 (i)–(iii), Q19              → §3.2.2 Three or More Variables
 *   Q7, Q8(iii), Q10–Q16 (iv)–(xii), Q18    → §3.2.3 Higher-Order Partial Derivatives
 *
 * The tutorial has no answer key (MR3-T8): every walkthrough is app guidance,
 * pendingLecturerReview. Mixed partials follow the notes' convention
 * (∂²f/∂x∂y = ∂/∂x(∂f/∂y); MR3-03). Written parts (Q2, Q8(i)(ii), Q17(v),
 * Q19(i)) are never auto-graded.
 */
import type { PracticeItem } from '../../types';
import type { PartialTarget, Point } from '@/lib/math/partial';

import { AREA_TOPIC_ID, AREA_UNITS } from '../area/ids';
import { RN_UNITS as U, type RnUnitId } from './ids';
import { at, d, type RnPracticeSpec, rnItem, SAMPLES_XY, SAMPLES_XYZ, texOf } from './practice';
import { TUT3 } from './sources';

const SECTION_UNIT: Record<string, RnUnitId> = {
  '3-1': U.functions,
  '3-2-1': U.partials,
  '3-2-2': U.threeVariables,
  '3-2-3': U.higherOrder,
};

function part(question: number, sub: string | null, page: number, section: string, spec: RnPracticeSpec): PracticeItem {
  const q = `Q${question}`;
  const item = sub ? `${q}(${sub})` : q;
  return rnItem(
    {
      id: `tut3-q${question}${sub ? `-${sub}` : ''}`,
      sourceType: 'tutorial-question',
      source: { document: TUT3, item, page },
      sourceQuestion: q,
      ...(sub ? { sourceSubquestion: sub } : {}),
      sourceSection: section,
      unitId: SECTION_UNIT[section]!,
    },
    spec,
  );
}

/** Points with 2x + 3y < 6 (Q3(viii), Q11). */
const SAMPLES_SMALL_XY: Point[] = [
  { x: 0.3, y: 0.5 },
  { x: 0.8, y: 0.2 },
  { x: 0.1, y: 0.9 },
  { x: 0.5, y: 0.6 },
  { x: 1.1, y: 0.4 },
];
const SAMPLES_SMALL_XYZ: Point[] = SAMPLES_SMALL_XY.map((p, i) => ({ ...p, z: [0.4, 1.1, 0.7, 1.5, 0.2][i]! }));
/** Points with xy − 2x + 1 > 0 (Q3(ix)). */
const SAMPLES_Q3_IX: Point[] = [
  { x: 0.7, y: 2.3 },
  { x: 1.6, y: 2.45 },
  { x: 0.35, y: 1.2 },
  { x: 2.1, y: 2.7 },
  { x: 1.15, y: 3.8 },
];

const FX = '\\frac{\\partial f}{\\partial x}';
const FY = '\\frac{\\partial f}{\\partial y}';
const FZ = '\\frac{\\partial f}{\\partial z}';
const second = (a: string, b: string) => `\\frac{\\partial^{2} f}{\\partial ${a} \\partial ${b}}`;
const pure = (a: string) => `\\frac{\\partial^{2} f}{\\partial ${a}^{2}}`;

// -----------------------------------------------------------------------------
// Q1: evaluating a function of two variables (§3.1)
// -----------------------------------------------------------------------------

const Q1_F = 'x^3 - 2xy + 3y^2';
const Q1_TEX = 'f(x, y) = x^{3} - 2xy + 3y^{2}';

const q1 = [
  part(1, 'i', 1, '3-1', {
    instruction: 'If f(x, y) = x³ − 2xy + 3y², find f(−2, 3).',
    problem: Q1_TEX,
    technique: 'rn-evaluate',
    difficulty: 1,
    method: 'Substitute x = −2 and y = 3 into the formula.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [at('f(−2, 3)', Q1_F, [], { x: -2, y: 3 })] },
    before: [['Substitute $x = -2$ and $y = 3$:', 'f(-2, 3) = (-2)^{3} - 2(-2)(3) + 3(3)^{2} = -8 + 12 + 27']],
    answers: ['31'],
    labelsTex: ['f(-2, 3)'],
  }),
  part(1, 'ii', 1, '3-1', {
    instruction: 'If f(x, y) = x³ − 2xy + 3y², find f(1/x, 2/y).',
    problem: Q1_TEX,
    technique: 'rn-evaluate',
    difficulty: 1,
    method: 'Replace x by 1/x and y by 2/y everywhere in the formula, then simplify.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [d('f(1/x, 2/y)', '(1/x)^3 - 2(1/x)(2/y) + 3(2/y)^2')],
    },
    before: [
      [
        'Replace $x$ by $\\frac{1}{x}$ and $y$ by $\\frac{2}{y}$:',
        'f\\left(\\frac{1}{x}, \\frac{2}{y}\\right) = \\left(\\frac{1}{x}\\right)^{3} - 2\\left(\\frac{1}{x}\\right)\\left(\\frac{2}{y}\\right) + 3\\left(\\frac{2}{y}\\right)^{2}',
      ],
    ],
    answers: ['1/x^3 - 4/(xy) + 12/y^2'],
    labelsTex: ['f\\left(\\frac{1}{x}, \\frac{2}{y}\\right)'],
  }),
];

// -----------------------------------------------------------------------------
// Q2: domains (§3.1), written
// -----------------------------------------------------------------------------

const domain = (
  sub: string,
  problem: string,
  steps: [string, string?][],
  answerTex: string,
  difficulty: 1 | 2 | 3 = 2,
) =>
  part(2, sub, 1, '3-1', {
    instruction: 'Give the domain for which the following function is defined and is real.',
    problem,
    technique: 'rn-domain',
    difficulty,
    method:
      'Write down every condition the formula needs (denominators, logarithms, roots, inverse sine), then combine them.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [] },
    grading: 'written',
    steps,
    answerTex,
  });

const q2 = [
  domain(
    'i',
    'f(x, y) = \\frac{1}{x^{2} + y^{2} - 1}',
    [
      ['The formula is defined unless the denominator is zero:', 'x^{2} + y^{2} - 1 \\neq 0'],
      ['So every point except those on the circle of radius 1 centred at the origin.'],
    ],
    '\\{(x, y) : x^{2} + y^{2} \\neq 1\\}',
    1,
  ),
  domain(
    'ii',
    'f(x, y) = \\ln(x + y)',
    [
      ['A logarithm needs a positive argument:', 'x + y > 0'],
      ['So the points above the line $y = -x$ (the line itself is excluded).'],
    ],
    '\\{(x, y) : x + y > 0\\}',
    1,
  ),
  domain(
    'iii',
    'f(x, y) = \\sin^{-1}\\left(\\frac{2x - y}{x + y}\\right)',
    [
      ['The fraction needs a non-zero denominator:', 'x + y \\neq 0'],
      ['$\\sin^{-1}$ is defined only for arguments between $-1$ and $1$:', '-1 \\leq \\frac{2x - y}{x + y} \\leq 1'],
      ['Equivalently (multiply out by $|x + y|$):', '|2x - y| \\leq |x + y|'],
    ],
    '\\left\\{(x, y) : x + y \\neq 0, \\; -1 \\leq \\frac{2x - y}{x + y} \\leq 1\\right\\}',
    3,
  ),
  domain(
    'iv',
    'f(x, y) = \\ln\\{(16 - x^{2} - y^{2})(x^{2} + y^{2} - 4)\\}',
    [
      ['The argument of the logarithm must be positive:', '(16 - x^{2} - y^{2})(x^{2} + y^{2} - 4) > 0'],
      [
        'A product is positive when both factors have the same sign. Both negative would need $x^{2} + y^{2} > 16$ and $x^{2} + y^{2} < 4$, which is impossible, so both are positive:',
        '4 < x^{2} + y^{2} < 16',
      ],
      ['This is the ring between the circles of radius 2 and 4 centred at the origin (both circles excluded).'],
    ],
    '\\{(x, y) : 4 < x^{2} + y^{2} < 16\\}',
    3,
  ),
  domain(
    'v',
    'f(x, y) = \\sqrt{6 - (2x + 3y)}',
    [
      ['A square root needs a non-negative argument:', '6 - (2x + 3y) \\geq 0'],
      ['So the points on or below the line $2x + 3y = 6$.'],
    ],
    '\\{(x, y) : 2x + 3y \\leq 6\\}',
  ),
];

// -----------------------------------------------------------------------------
// Q3: first partial derivatives from the definition (§3.2.1)
// -----------------------------------------------------------------------------

const DEFINITION_X = 'f_{x}(x, y) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x, y) - f(x, y)}{\\Delta x}';

interface Q3Function {
  sub: string;
  f: string;
  tex: string;
  samples: Point[];
  /** The simplified difference quotients for x and for y (TeX), before letting Δ → 0. */
  quotients: [string, string];
  answers: [string, string];
  difficulty: 1 | 2 | 3;
}

const Q3_FUNCTIONS: Q3Function[] = [
  {
    sub: 'i',
    f: '3x^2 - xy + 2y^2 + 3',
    tex: 'f(x, y) = 3x^{2} - xy + 2y^{2} + 3',
    samples: SAMPLES_XY,
    quotients: ['6x + 3\\Delta x - y', '-x + 4y + 2\\Delta y'],
    answers: ['6x - y', '-x + 4y'],
    difficulty: 1,
  },
  {
    sub: 'ii',
    f: '2x + 4x^2 y^2 + 3y',
    tex: 'f(x, y) = 2x + 4x^{2}y^{2} + 3y',
    samples: SAMPLES_XY,
    quotients: ['2 + 8xy^{2} + 4y^{2}\\Delta x', '8x^{2}y + 4x^{2}\\Delta y + 3'],
    answers: ['2 + 8xy^2', '8x^2 y + 3'],
    difficulty: 1,
  },
  {
    sub: 'iii',
    f: 'x + 3xy^2 + 5x^3 y',
    tex: 'f(x, y) = x + 3xy^{2} + 5x^{3}y',
    samples: SAMPLES_XY,
    quotients: ['1 + 3y^{2} + 5y(3x^{2} + 3x\\Delta x + (\\Delta x)^{2})', '6xy + 3x\\Delta y + 5x^{3}'],
    answers: ['1 + 3y^2 + 15x^2 y', '6xy + 5x^3'],
    difficulty: 2,
  },
  {
    sub: 'iv',
    f: 'x^4 + 2xy^2 - y^3',
    tex: 'f(x, y) = x^{4} + 2xy^{2} - y^{3}',
    samples: SAMPLES_XY,
    quotients: [
      '4x^{3} + 6x^{2}\\Delta x + 4x(\\Delta x)^{2} + (\\Delta x)^{3} + 2y^{2}',
      '2x(2y + \\Delta y) - (3y^{2} + 3y\\Delta y + (\\Delta y)^{2})',
    ],
    answers: ['4x^3 + 2y^2', '4xy - 3y^2'],
    difficulty: 2,
  },
  {
    sub: 'v',
    f: 'x^2/y - x^3 y^2',
    tex: 'f(x, y) = \\frac{x^{2}}{y} - x^{3}y^{2}',
    samples: SAMPLES_XY,
    quotients: [
      '\\frac{2x + \\Delta x}{y} - y^{2}(3x^{2} + 3x\\Delta x + (\\Delta x)^{2})',
      '-\\frac{x^{2}}{y(y + \\Delta y)} - x^{3}(2y + \\Delta y)',
    ],
    answers: ['2x/y - 3x^2 y^2', '-x^2/y^2 - 2x^3 y'],
    difficulty: 2,
  },
  {
    sub: 'vi',
    f: 'xy e^(xy)',
    tex: 'f(x, y) = xye^{xy}',
    samples: SAMPLES_XY,
    quotients: [
      'y\\,\\frac{(x + \\Delta x)e^{(x + \\Delta x)y} - xe^{xy}}{\\Delta x}',
      'x\\,\\frac{(y + \\Delta y)e^{x(y + \\Delta y)} - ye^{xy}}{\\Delta y}',
    ],
    answers: ['y e^(xy) + x y^2 e^(xy)', 'x e^(xy) + x^2 y e^(xy)'],
    difficulty: 3,
  },
  {
    sub: 'vii',
    f: '(x - y)/(x + y)',
    tex: 'f(x, y) = \\frac{x - y}{x + y}',
    samples: SAMPLES_XY,
    quotients: ['\\frac{2y}{(x + \\Delta x + y)(x + y)}', '\\frac{-2x}{(x + y + \\Delta y)(x + y)}'],
    answers: ['2y/(x + y)^2', '-2x/(x + y)^2'],
    difficulty: 2,
  },
  {
    sub: 'viii',
    f: 'sqrt(6 - (2x + 3y))',
    tex: 'f(x, y) = \\sqrt{6 - (2x + 3y)}',
    samples: SAMPLES_SMALL_XY,
    quotients: [
      '\\frac{-2}{\\sqrt{6 - 2(x + \\Delta x) - 3y} + \\sqrt{6 - 2x - 3y}}',
      '\\frac{-3}{\\sqrt{6 - 2x - 3(y + \\Delta y)} + \\sqrt{6 - 2x - 3y}}',
    ],
    answers: ['-1/sqrt(6 - 2x - 3y)', '-3/(2sqrt(6 - 2x - 3y))'],
    difficulty: 3,
  },
  {
    sub: 'ix',
    f: 'sqrt(xy - 2x + 1)',
    tex: 'f(x, y) = \\sqrt{xy - 2x + 1}',
    samples: SAMPLES_Q3_IX,
    quotients: [
      '\\frac{y - 2}{\\sqrt{(x + \\Delta x)y - 2(x + \\Delta x) + 1} + \\sqrt{xy - 2x + 1}}',
      '\\frac{x}{\\sqrt{x(y + \\Delta y) - 2x + 1} + \\sqrt{xy - 2x + 1}}',
    ],
    answers: ['(y - 2)/(2sqrt(xy - 2x + 1))', 'x/(2sqrt(xy - 2x + 1))'],
    difficulty: 3,
  },
];

const q3 = Q3_FUNCTIONS.map((fn) =>
  part(3, fn.sub, 1, '3-2-1', {
    instruction: 'Use the definition of partial derivative to find ∂f/∂x and ∂f/∂y for the following function.',
    problem: fn.tex,
    technique: 'rn-limit-definition',
    difficulty: fn.difficulty,
    method:
      'Write the difference quotient from the definition, simplify it until Δx (or Δy) can be cancelled, then let Δx → 0 (or Δy → 0). Your final derivatives are checked; the limit working is yours to write.',
    partial: { variables: ['x', 'y'], samples: fn.samples, targets: [d('∂f/∂x', fn.f, 'x'), d('∂f/∂y', fn.f, 'y')] },
    grading: 'partial',
    before: [
      ['By the definition (§3.2.1):', DEFINITION_X],
      [
        'Expanding and simplifying the difference quotient:',
        `\\frac{f(x + \\Delta x, y) - f(x, y)}{\\Delta x} = ${fn.quotients[0]}`,
      ],
      ['In the same way for $y$:', `\\frac{f(x, y + \\Delta y) - f(x, y)}{\\Delta y} = ${fn.quotients[1]}`],
      ['Now let $\\Delta x \\to 0$ and $\\Delta y \\to 0$.'],
    ],
    answers: fn.answers,
    labelsTex: [FX, FY],
  }),
);

// -----------------------------------------------------------------------------
// Q4–Q6: partial derivatives at a point (§3.2.1)
// -----------------------------------------------------------------------------

const q4to6 = [
  part(4, null, 1, '3-2-1', {
    instruction: 'Given φ(x, y) = eˣ ln y. Find φₓ(0, e) and φᵧ(0, e).',
    problem: '\\phi(x, y) = e^{x}\\ln y',
    technique: 'rn-partial',
    difficulty: 1,
    method: 'Find φₓ and φᵧ, then substitute x = 0 and y = e.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [
        at('φₓ(0, e)', 'e^x ln(y)', ['x'], { x: 0, y: Math.E }),
        at('φᵧ(0, e)', 'e^x ln(y)', ['y'], { x: 0, y: Math.E }),
      ],
    },
    before: [
      ['Hold $y$ constant, then hold $x$ constant:', '\\phi_{x} = e^{x}\\ln y, \\qquad \\phi_{y} = \\frac{e^{x}}{y}'],
      ['Substitute $x = 0$, $y = e$:', '\\phi_{x}(0, e) = e^{0}\\ln e, \\qquad \\phi_{y}(0, e) = \\frac{e^{0}}{e}'],
    ],
    answers: ['1', '1/e'],
    labelsTex: ['\\phi_{x}(0, e)', '\\phi_{y}(0, e)'],
  }),
  part(5, null, 1, '3-2-1', {
    instruction: 'Given φ(x, y) = e⁻ˣ sin(x + 2y). Find φₓ(0, π/4) and φᵧ(0, π/4).',
    problem: '\\phi(x, y) = e^{-x}\\sin(x + 2y)',
    technique: 'rn-partial',
    difficulty: 1,
    method: 'Use the product rule for φₓ and the chain rule for φᵧ, then substitute x = 0 and y = π/4.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [
        at('φₓ(0, π/4)', 'e^(-x) sin(x + 2y)', ['x'], { x: 0, y: Math.PI / 4 }),
        at('φᵧ(0, π/4)', 'e^(-x) sin(x + 2y)', ['y'], { x: 0, y: Math.PI / 4 }),
      ],
    },
    before: [
      [
        'Differentiate:',
        '\\phi_{x} = -e^{-x}\\sin(x + 2y) + e^{-x}\\cos(x + 2y), \\qquad \\phi_{y} = 2e^{-x}\\cos(x + 2y)',
      ],
      [
        'At $(0, \\frac{\\pi}{4})$, $x + 2y = \\frac{\\pi}{2}$, so $\\sin = 1$ and $\\cos = 0$:',
        '\\phi_{x}\\left(0, \\frac{\\pi}{4}\\right) = -1 + 0, \\qquad \\phi_{y}\\left(0, \\frac{\\pi}{4}\\right) = 2(0)',
      ],
    ],
    answers: ['-1', '0'],
    labelsTex: ['\\phi_{x}\\left(0, \\frac{\\pi}{4}\\right)', '\\phi_{y}\\left(0, \\frac{\\pi}{4}\\right)'],
  }),
  part(6, null, 1, '3-2-1', {
    instruction: 'Given φ(u, v) = u/(u + v). Find φᵤ(1, 2) and φᵥ(1, 2).',
    problem: '\\phi(u, v) = \\frac{u}{u + v}',
    technique: 'rn-partial',
    difficulty: 1,
    method: 'Use the quotient rule, holding the other variable constant, then substitute u = 1, v = 2.',
    partial: {
      variables: ['u', 'v'],
      samples: [
        { u: 0.7, v: 1.3 },
        { u: 1.6, v: 0.45 },
        { u: 0.35, v: 2.2 },
      ],
      targets: [at('φᵤ(1, 2)', 'u/(u + v)', ['u'], { u: 1, v: 2 }), at('φᵥ(1, 2)', 'u/(u + v)', ['v'], { u: 1, v: 2 })],
    },
    before: [
      [
        'By the quotient rule:',
        '\\phi_{u} = \\frac{(u + v) - u}{(u + v)^{2}} = \\frac{v}{(u + v)^{2}}, \\qquad \\phi_{v} = \\frac{-u}{(u + v)^{2}}',
      ],
      ['Substitute $u = 1$, $v = 2$:', '\\phi_{u}(1, 2) = \\frac{2}{9}, \\qquad \\phi_{v}(1, 2) = -\\frac{1}{9}'],
    ],
    answers: ['2/9', '-1/9'],
    labelsTex: ['\\phi_{u}(1, 2)', '\\phi_{v}(1, 2)'],
  }),
];

// -----------------------------------------------------------------------------
// Q7, Q8: mixed partial derivatives (§3.2.3) and the written parts of Q8 (§3.2.1)
// -----------------------------------------------------------------------------

const Q7_F = 'x e^(x^2 + 2y^2)';
const q7 = part(7, null, 1, '3-2-3', {
  instruction: 'Let f(x, y) = x e^(x² + 2y²). Find ∂f/∂x, ∂f/∂y and verify that ∂²f/∂x∂y = ∂²f/∂y∂x.',
  problem: 'f(x, y) = xe^{x^{2} + 2y^{2}}',
  technique: 'rn-higher-order',
  difficulty: 2,
  method:
    'Find both first partial derivatives, then differentiate each with respect to the other variable. The four derivatives are checked; the verification (that the two mixed partials agree) is yours to write.',
  partial: {
    variables: ['x', 'y'],
    samples: SAMPLES_XY,
    targets: [
      d('∂f/∂x', Q7_F, 'x'),
      d('∂f/∂y', Q7_F, 'y'),
      d('∂²f/∂x∂y', Q7_F, 'y', 'x'),
      d('∂²f/∂y∂x', Q7_F, 'x', 'y'),
    ],
  },
  grading: 'partial',
  answers: [
    'e^(x^2 + 2y^2)(1 + 2x^2)',
    '4xy e^(x^2 + 2y^2)',
    '4y(1 + 2x^2) e^(x^2 + 2y^2)',
    '4y(1 + 2x^2) e^(x^2 + 2y^2)',
  ],
  labelsTex: [FX, FY, second('x', 'y'), second('y', 'x')],
  steps: [
    [
      'Product rule with respect to $x$:',
      `${FX} = e^{x^{2} + 2y^{2}} + 2x^{2}e^{x^{2} + 2y^{2}} = (1 + 2x^{2})e^{x^{2} + 2y^{2}}`,
    ],
    ['With respect to $y$ ($x$ constant):', `${FY} = 4xye^{x^{2} + 2y^{2}}`],
    [
      'Differentiate $\\frac{\\partial f}{\\partial y}$ with respect to $x$:',
      `${second('x', 'y')} = 4ye^{x^{2} + 2y^{2}} + 8x^{2}ye^{x^{2} + 2y^{2}} = 4y(1 + 2x^{2})e^{x^{2} + 2y^{2}}`,
    ],
    [
      'Differentiate $\\frac{\\partial f}{\\partial x}$ with respect to $y$:',
      `${second('y', 'x')} = 4y(1 + 2x^{2})e^{x^{2} + 2y^{2}}`,
    ],
    ['The two mixed partial derivatives are equal, as Theorem 3.2.1 predicts.'],
  ],
});

const Q8_TEX = 'z = x^{2}\\tan^{-1}\\frac{y}{x}';
const Q8_Z = 'x^2 arctan(y/x)';
const q8 = [
  part(8, 'i', 1, '3-2-1', {
    instruction: 'If z = x² tan⁻¹(y/x), find ∂f/∂x.',
    problem: Q8_TEX,
    technique: 'rn-partial',
    difficulty: 2,
    method: 'Use the product rule and the chain rule, holding y constant.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [] },
    grading: 'written',
    reviewIds: ['MR3-T1'],
    steps: [
      [
        'Hold $y$ constant. By the product rule, with $\\frac{\\partial}{\\partial x}\\tan^{-1}\\frac{y}{x} = \\frac{1}{1 + y^{2}/x^{2}} \\cdot \\left(-\\frac{y}{x^{2}}\\right) = -\\frac{y}{x^{2} + y^{2}}$:',
        '\\frac{\\partial z}{\\partial x} = 2x\\tan^{-1}\\frac{y}{x} - \\frac{x^{2}y}{x^{2} + y^{2}}',
      ],
    ],
    answerTex: '\\frac{\\partial z}{\\partial x} = 2x\\tan^{-1}\\frac{y}{x} - \\frac{x^{2}y}{x^{2} + y^{2}}',
    verify: { targets: [d('∂z/∂x', Q8_Z, 'x')], answers: ['2x arctan(y/x) - x^2 y/(x^2 + y^2)'] },
  }),
  part(8, 'ii', 1, '3-2-1', {
    instruction: 'If z = x² tan⁻¹(y/x), find ∂f/∂y.',
    problem: Q8_TEX,
    technique: 'rn-partial',
    difficulty: 2,
    method: 'Hold x constant and use the chain rule.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [] },
    grading: 'written',
    reviewIds: ['MR3-T1'],
    steps: [
      [
        'Hold $x$ constant: $\\frac{\\partial}{\\partial y}\\tan^{-1}\\frac{y}{x} = \\frac{1}{1 + y^{2}/x^{2}} \\cdot \\frac{1}{x} = \\frac{x}{x^{2} + y^{2}}$, so',
        '\\frac{\\partial z}{\\partial y} = x^{2} \\cdot \\frac{x}{x^{2} + y^{2}} = \\frac{x^{3}}{x^{2} + y^{2}}',
      ],
    ],
    answerTex: '\\frac{\\partial z}{\\partial y} = \\frac{x^{3}}{x^{2} + y^{2}}',
    verify: { targets: [d('∂z/∂y', Q8_Z, 'y')], answers: ['x^3/(x^2 + y^2)'] },
  }),
  part(8, 'iii', 1, '3-2-3', {
    instruction: 'If z = x² tan⁻¹(y/x), find ∂²z/∂x∂y at (1, 1).',
    problem: Q8_TEX,
    technique: 'rn-higher-order',
    difficulty: 3,
    method:
      'In the notes’ notation ∂²z/∂x∂y = ∂/∂x(∂z/∂y): find ∂z/∂y, differentiate it with respect to x, then substitute (1, 1).',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [at('∂²z/∂x∂y at (1, 1)', Q8_Z, ['y', 'x'], { x: 1, y: 1 })],
    },
    steps: [
      ['First, holding $x$ constant:', '\\frac{\\partial z}{\\partial y} = \\frac{x^{3}}{x^{2} + y^{2}}'],
      [
        'Differentiate with respect to $x$ (quotient rule):',
        '\\frac{\\partial^{2} z}{\\partial x \\partial y} = \\frac{3x^{2}(x^{2} + y^{2}) - x^{3}(2x)}{(x^{2} + y^{2})^{2}} = \\frac{x^{4} + 3x^{2}y^{2}}{(x^{2} + y^{2})^{2}}',
      ],
      ['At $(1, 1)$:', '\\frac{1 + 3}{(1 + 1)^{2}} = 1'],
    ],
    answers: ['1'],
    labelsTex: ['\\frac{\\partial^{2} z}{\\partial x \\partial y}(1, 1)'],
  }),
];

// -----------------------------------------------------------------------------
// Q9: a function of three variables at a point (§3.2.2)
// -----------------------------------------------------------------------------

const Q9_F = '3x y^3 + z^2 e^x';
const Q9_AT = { x: Math.LN2, y: 1, z: -2 };
const q9 = (
  [
    [
      'i',
      'x',
      'fₓ(x₁, y₁, z₁)',
      'f_{x}(x_{1}, y_{1}, z_{1})',
      '11',
      'f_{x} = 3y^{3} + z^{2}e^{x} = 3(1)^{3} + (-2)^{2}e^{\\ln 2} = 3 + 8',
    ],
    ['ii', 'y', 'fᵧ(x₁, y₁, z₁)', 'f_{y}(x_{1}, y_{1}, z_{1})', '9ln(2)', 'f_{y} = 9xy^{2} = 9(\\ln 2)(1)^{2}'],
    ['iii', 'z', 'f_z(x₁, y₁, z₁)', 'f_{z}(x_{1}, y_{1}, z_{1})', '-8', 'f_{z} = 2ze^{x} = 2(-2)e^{\\ln 2} = -4(2)'],
  ] as const
).map(([sub, v, label, labelTex, answer, working]) =>
  part(9, sub, 1, '3-2-2', {
    instruction: `Let f(x, y, z) = 3xy³ + z²eˣ and (x₁, y₁, z₁) = (ln 2, 1, −2). Find ${label}.`,
    problem: 'f(x, y, z) = 3xy^{3} + z^{2}e^{x}, \\quad (x_{1}, y_{1}, z_{1}) = (\\ln 2, 1, -2)',
    technique: 'rn-partial',
    difficulty: 1,
    method: `Differentiate with respect to ${v}, holding the other two variables constant, then substitute the point.`,
    partial: { variables: ['x', 'y', 'z'], samples: SAMPLES_XYZ, targets: [at(label, Q9_F, [v], Q9_AT)] },
    before: [['Differentiate, then substitute $(\\ln 2, 1, -2)$:', working]],
    answers: [answer],
    labelsTex: [labelTex],
  }),
);

// -----------------------------------------------------------------------------
// Q10–Q16: twelve derivatives of a function of three variables
// -----------------------------------------------------------------------------

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'] as const;

/** Part → [label, TeX label, order of differentiation (first variable first)], in the printed order. */
const TWELVE: [string, string, string[]][] = [
  ['∂f/∂x', FX, ['x']],
  ['∂f/∂y', FY, ['y']],
  ['∂f/∂z', FZ, ['z']],
  ['∂²f/∂x∂y', second('x', 'y'), ['y', 'x']],
  ['∂²f/∂y∂x', second('y', 'x'), ['x', 'y']],
  ['∂²f/∂x∂z', second('x', 'z'), ['z', 'x']],
  ['∂²f/∂z∂x', second('z', 'x'), ['x', 'z']],
  ['∂²f/∂y∂z', second('y', 'z'), ['z', 'y']],
  ['∂²f/∂z∂y', second('z', 'y'), ['y', 'z']],
  ['∂²f/∂x²', pure('x'), ['x', 'x']],
  ['∂²f/∂y²', pure('y'), ['y', 'y']],
  ['∂²f/∂z²', pure('z'), ['z', 'z']],
];

interface TwelveFunction {
  question: number;
  f: string;
  /** Learner-readable formula for the instruction. */
  text: string;
  tex: string;
  samples: Point[];
  condition?: string;
  /** fx, fy, fz, then the mixed pairs xy, xz, yz (equal in either order here), then fxx, fyy, fzz. */
  answers: {
    fx: string;
    fy: string;
    fz: string;
    xy: string;
    xz: string;
    yz: string;
    xx: string;
    yy: string;
    zz: string;
  };
  difficulty: [1 | 2 | 3, 1 | 2 | 3];
  method: string;
}

const TWELVE_FUNCTIONS: TwelveFunction[] = [
  {
    question: 10,
    f: 'ln(x + y)',
    text: 'ln(x + y)',
    tex: 'f(x, y, z) = \\ln(x + y)',
    samples: SAMPLES_XYZ,
    answers: {
      fx: '1/(x + y)',
      fy: '1/(x + y)',
      fz: '0',
      xy: '-1/(x + y)^2',
      xz: '0',
      yz: '0',
      xx: '-1/(x + y)^2',
      yy: '-1/(x + y)^2',
      zz: '0',
    },
    difficulty: [1, 1],
    method: 'f does not contain z, so every derivative with respect to z is 0.',
  },
  {
    question: 11,
    f: 'sqrt(6 - (2x + 3y))',
    text: '√(6 − (2x + 3y))',
    tex: 'f(x, y, z) = \\sqrt{6 - (2x + 3y)}',
    samples: SAMPLES_SMALL_XYZ,
    answers: {
      fx: '-1/sqrt(6 - 2x - 3y)',
      fy: '-3/(2sqrt(6 - 2x - 3y))',
      fz: '0',
      xy: '-3/(2(6 - 2x - 3y)^(3/2))',
      xz: '0',
      yz: '0',
      xx: '-1/(6 - 2x - 3y)^(3/2)',
      yy: '-9/(4(6 - 2x - 3y)^(3/2))',
      zz: '0',
    },
    difficulty: [1, 2],
    method: 'Write f = (6 − 2x − 3y)^(1/2) and use the chain rule; f does not contain z.',
  },
  {
    question: 12,
    f: 'xy/(x + y + z)',
    text: 'xy/(x + y + z)',
    tex: 'f(x, y, z) = \\frac{xy}{x + y + z}',
    samples: SAMPLES_XYZ,
    answers: {
      fx: 'y(y + z)/(x + y + z)^2',
      fy: 'x(x + z)/(x + y + z)^2',
      fz: '-xy/(x + y + z)^2',
      xy: '(2xy + xz + yz + z^2)/(x + y + z)^3',
      xz: 'y(x - y - z)/(x + y + z)^3',
      yz: 'x(y - x - z)/(x + y + z)^3',
      xx: '-2y(y + z)/(x + y + z)^3',
      yy: '-2x(x + z)/(x + y + z)^3',
      zz: '2xy/(x + y + z)^3',
    },
    difficulty: [2, 3],
    method:
      'Use the quotient rule; for second derivatives, differentiate the first derivatives again with the quotient rule.',
  },
  {
    question: 13,
    f: 'arctan(xyz)',
    text: 'tan⁻¹(xyz)',
    tex: 'f(x, y, z) = \\tan^{-1}(xyz)',
    samples: SAMPLES_XYZ,
    answers: {
      fx: 'yz/(1 + (xyz)^2)',
      fy: 'xz/(1 + (xyz)^2)',
      fz: 'xy/(1 + (xyz)^2)',
      xy: 'z(1 - (xyz)^2)/(1 + (xyz)^2)^2',
      xz: 'y(1 - (xyz)^2)/(1 + (xyz)^2)^2',
      yz: 'x(1 - (xyz)^2)/(1 + (xyz)^2)^2',
      xx: '-2x y^3 z^3/(1 + (xyz)^2)^2',
      yy: '-2x^3 y z^3/(1 + (xyz)^2)^2',
      zz: '-2x^3 y^3 z/(1 + (xyz)^2)^2',
    },
    difficulty: [2, 3],
    method: 'Use d/du tan⁻¹u = 1/(1 + u²) with the chain rule.',
  },
  {
    question: 14,
    f: 'y^x arctan(z)',
    text: 'yˣ tan⁻¹z',
    tex: 'f(x, y, z) = y^{x}\\tan^{-1} z',
    samples: SAMPLES_XYZ,
    condition: 'Here $y > 0$, so that $y^{x}$ is defined for every $x$.',
    answers: {
      fx: 'y^x ln(y) arctan(z)',
      fy: 'x y^(x - 1) arctan(z)',
      fz: 'y^x/(1 + z^2)',
      xy: '(y^(x - 1) + x y^(x - 1) ln(y)) arctan(z)',
      xz: 'y^x ln(y)/(1 + z^2)',
      yz: 'x y^(x - 1)/(1 + z^2)',
      xx: 'y^x (ln(y))^2 arctan(z)',
      yy: 'x(x - 1) y^(x - 2) arctan(z)',
      zz: '-2z y^x/(1 + z^2)^2',
    },
    difficulty: [2, 3],
    method:
      'With respect to x, yˣ is an exponential (derivative yˣ ln y); with respect to y it is a power (derivative x yˣ⁻¹).',
  },
  {
    question: 15,
    f: 'sqrt(x^2 + y^2 + z^2)',
    text: '√(x² + y² + z²)',
    tex: 'f(x, y, z) = \\sqrt{x^{2} + y^{2} + z^{2}}',
    samples: SAMPLES_XYZ,
    answers: {
      fx: 'x/sqrt(x^2 + y^2 + z^2)',
      fy: 'y/sqrt(x^2 + y^2 + z^2)',
      fz: 'z/sqrt(x^2 + y^2 + z^2)',
      xy: '-xy/(x^2 + y^2 + z^2)^(3/2)',
      xz: '-xz/(x^2 + y^2 + z^2)^(3/2)',
      yz: '-yz/(x^2 + y^2 + z^2)^(3/2)',
      xx: '(y^2 + z^2)/(x^2 + y^2 + z^2)^(3/2)',
      yy: '(x^2 + z^2)/(x^2 + y^2 + z^2)^(3/2)',
      zz: '(x^2 + y^2)/(x^2 + y^2 + z^2)^(3/2)',
    },
    difficulty: [2, 3],
    method: 'Write r = √(x² + y² + z²); then ∂r/∂x = x/r, and similarly for y and z.',
  },
  {
    question: 16,
    f: 'ln(sqrt(x^2 + y^2 + z^2))',
    text: 'ln(√(x² + y² + z²))',
    tex: 'f(x, y, z) = \\ln\\left(\\sqrt{x^{2} + y^{2} + z^{2}}\\right)',
    samples: SAMPLES_XYZ,
    answers: {
      fx: 'x/(x^2 + y^2 + z^2)',
      fy: 'y/(x^2 + y^2 + z^2)',
      fz: 'z/(x^2 + y^2 + z^2)',
      xy: '-2xy/(x^2 + y^2 + z^2)^2',
      xz: '-2xz/(x^2 + y^2 + z^2)^2',
      yz: '-2yz/(x^2 + y^2 + z^2)^2',
      xx: '(y^2 + z^2 - x^2)/(x^2 + y^2 + z^2)^2',
      yy: '(x^2 + z^2 - y^2)/(x^2 + y^2 + z^2)^2',
      zz: '(x^2 + y^2 - z^2)/(x^2 + y^2 + z^2)^2',
    },
    difficulty: [2, 3],
    method: 'Simplify first: ln √(x² + y² + z²) = ½ ln(x² + y² + z²).',
  },
];

const q10to16 = TWELVE_FUNCTIONS.flatMap((fn) => {
  const a = fn.answers;
  const answers = [a.fx, a.fy, a.fz, a.xy, a.xy, a.xz, a.xz, a.yz, a.yz, a.xx, a.yy, a.zz];
  return TWELVE.map(([label, labelTex, wrt], i) => {
    const first = wrt.length === 1;
    return part(fn.question, ROMAN[i]!, 2, first ? '3-2-2' : '3-2-3', {
      instruction: `Given f(x, y, z) = ${fn.text}, find ${label}.`,
      problem: fn.tex,
      ...(fn.condition ? { condition: fn.condition } : {}),
      technique: first ? 'rn-partial' : 'rn-higher-order',
      difficulty: first ? fn.difficulty[0] : fn.difficulty[1],
      method: first
        ? `${fn.method} Hold the other two variables constant.`
        : `${fn.method} In the notes’ notation, ${label} means: differentiate with respect to ${wrt[0]} first, then ${wrt[1]}.`,
      partial: { variables: ['x', 'y', 'z'], samples: fn.samples, targets: [d(label, fn.f, ...wrt)] },
      answers: [answers[i]!],
      labelsTex: [labelTex],
    });
  });
});

// -----------------------------------------------------------------------------
// Q17: derivatives of integrals with variable limits (§3.2.1, with Topic 2's FTC)
// -----------------------------------------------------------------------------

const Q17_PREREQUISITE: PracticeItem['prerequisite'] = {
  topicId: AREA_TOPIC_ID,
  unitId: AREA_UNITS.ftc,
  note: 'This question uses the Fundamental Theorem of Calculus (Topic 2) together with the chain rule.',
};

const FTC_RULE =
  '\\frac{\\partial}{\\partial x}\\int_{a(x, y)}^{b(x, y)} g(t)\\,dt = g(b)\\frac{\\partial b}{\\partial x} - g(a)\\frac{\\partial a}{\\partial x}';

const integral = (
  sub: string,
  problem: string,
  g: { integrand: string; t: string; lower: string; upper: string },
  working: [string, string?][],
  answers: [string, string],
  difficulty: 1 | 2 | 3,
): PracticeItem => {
  const targets: PartialTarget[] = (['x', 'y'] as const).map((wrt) => ({
    kind: 'integralDerivative',
    label: wrt === 'x' ? '∂f/∂x' : '∂f/∂y',
    ...g,
    wrt,
  }));
  return part(17, sub, 3, '3-2-1', {
    instruction: 'Determine ∂f/∂x and ∂f/∂y.',
    problem,
    technique: 'rn-partial',
    difficulty,
    method:
      'By the Fundamental Theorem of Calculus, the derivative of an integral with respect to its upper limit is the integrand at that limit; multiply by the derivative of the limit (chain rule). A limit that does not contain the variable contributes 0.',
    partial: { variables: ['x', 'y'], samples: sub === 'iii' || sub === 'iv' ? SAMPLES_SMALL_XY : SAMPLES_XY, targets },
    reviewIds: ['MR3-T4'],
    prerequisite: Q17_PREREQUISITE,
    before: [['Fundamental Theorem of Calculus with the chain rule:', FTC_RULE], ...working],
    answers,
    labelsTex: [FX, FY],
  });
};

const q17 = [
  integral(
    'i',
    'f(x, y) = \\int_{x}^{y} \\sqrt{\\frac{2}{t}}\\,dt',
    { integrand: 'sqrt(2/t)', t: 't', lower: 'x', upper: 'y' },
    [
      [
        'The lower limit is $x$ and the upper limit is $y$:',
        `${FX} = -\\sqrt{\\frac{2}{x}}, \\qquad ${FY} = \\sqrt{\\frac{2}{y}}`,
      ],
    ],
    ['-sqrt(2/x)', 'sqrt(2/y)'],
    1,
  ),
  integral(
    'ii',
    'f(x, y) = \\int_{0}^{\\ln y} te^{2t}\\,dt',
    { integrand: 't e^(2t)', t: 't', lower: '0', upper: 'ln(y)' },
    [
      [
        'Neither limit contains $x$, so $\\frac{\\partial f}{\\partial x} = 0$. For $y$:',
        `${FY} = (\\ln y)e^{2\\ln y} \\cdot \\frac{1}{y} = (\\ln y)\\frac{y^{2}}{y}`,
      ],
    ],
    ['0', 'y ln(y)'],
    2,
  ),
  integral(
    'iii',
    'f(x, y) = \\int_{\\sin y}^{\\cos x} (\\sec \\theta + \\tan \\theta)\\,d\\theta',
    { integrand: 'sec(t) + tan(t)', t: 't', lower: 'sin(y)', upper: 'cos(x)' },
    [
      [
        'The upper limit depends on $x$ only and the lower limit on $y$ only:',
        `${FX} = (\\sec(\\cos x) + \\tan(\\cos x))(-\\sin x), \\qquad ${FY} = -(\\sec(\\sin y) + \\tan(\\sin y))\\cos y`,
      ],
    ],
    ['-sin(x)(sec(cos(x)) + tan(cos(x)))', '-cos(y)(sec(sin(y)) + tan(sin(y)))'],
    2,
  ),
  integral(
    'iv',
    'f(x, y) = \\int_{0}^{\\tan y} \\sin^{2} t\\cos t\\,dt',
    { integrand: '(sin(t))^2 cos(t)', t: 't', lower: '0', upper: 'tan(y)' },
    [['Only the upper limit depends on $y$:', `${FY} = \\sin^{2}(\\tan y)\\cos(\\tan y)\\sec^{2} y`]],
    ['0', '(sin(tan(y)))^2 cos(tan(y)) (sec(y))^2'],
    2,
  ),
  part(17, 'v', 3, '3-2-1', {
    instruction: 'Determine ∂f/∂x and ∂f/∂y.',
    problem: 'f(x, y) = \\int_{0}^{e^{y}} \\frac{1 - \\ln t}{t}\\,dt',
    technique: 'rn-partial',
    difficulty: 3,
    method:
      'Use the Fundamental Theorem of Calculus with the chain rule. Think about whether the integrand is defined on the whole interval of integration.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [] },
    grading: 'written',
    reviewIds: ['MR3-T4', 'MR3-T9'],
    prerequisite: Q17_PREREQUISITE,
    steps: [
      ['Neither limit contains $x$:', `${FX} = 0`],
      [
        'Applying the Fundamental Theorem with the chain rule to the upper limit $e^{y}$:',
        `${FY} = \\frac{1 - \\ln e^{y}}{e^{y}} \\cdot e^{y} = 1 - y`,
      ],
      [
        'Check the integrand near the lower limit: $\\frac{1 - \\ln t}{t}$ is not defined at $t = 0$ and grows without bound as $t \\to 0^{+}$. Say in your answer how this affects $f$.',
      ],
    ],
    answerTex: `${FX} = 0, \\quad ${FY} = 1 - y`,
    verify: {
      targets: [
        {
          kind: 'integralDerivative',
          label: '∂f/∂y',
          integrand: '(1 - ln(t))/t',
          t: 't',
          lower: '1',
          upper: 'e^y',
          wrt: 'y',
        },
      ],
      answers: ['1 - y'],
    },
  }),
  integral(
    'vi',
    'f(x, y) = \\int_{0}^{2/\\sqrt{y}} \\frac{1}{4 + 9t^{2}}\\,dt',
    { integrand: '1/(4 + 9t^2)', t: 't', lower: '0', upper: '2/sqrt(y)' },
    [
      [
        'Only the upper limit depends on $y$, and $\\frac{d}{dy}\\frac{2}{\\sqrt{y}} = -y^{-3/2}$:',
        `${FY} = \\frac{1}{4 + \\frac{36}{y}} \\cdot \\left(-\\frac{1}{y\\sqrt{y}}\\right) = -\\frac{1}{4\\sqrt{y}(y + 9)}`,
      ],
    ],
    ['0', '-1/(4sqrt(y)(y + 9))'],
    3,
  ),
];

// -----------------------------------------------------------------------------
// Q18: second and mixed partial derivatives of the Q3 functions (§3.2.3)
// -----------------------------------------------------------------------------

const Q18_ANSWERS: [string, string, string, string][] = [
  ['6', '4', '-1', '-1'],
  ['8y^2', '8x^2', '16xy', '16xy'],
  ['30xy', '6x', '6y + 15x^2', '6y + 15x^2'],
  ['12x^2', '4x - 6y', '4y', '4y'],
  ['2/y - 6x y^2', '2x^2/y^3 - 2x^3', '-2x/y^2 - 6x^2 y', '-2x/y^2 - 6x^2 y'],
  ['y^2 e^(xy)(2 + xy)', 'x^2 e^(xy)(2 + xy)', 'e^(xy)(1 + 3xy + x^2 y^2)', 'e^(xy)(1 + 3xy + x^2 y^2)'],
];

const q18 = Q3_FUNCTIONS.slice(0, 6).map((fn, i) =>
  part(18, fn.sub, 3, '3-2-3', {
    instruction:
      'Considering the results from question 3, find the second partial derivatives ∂²f/∂x² and ∂²f/∂y² and mixed partial derivatives ∂²f/∂x∂y and ∂²f/∂y∂x using the definition of partial derivative.',
    problem: fn.tex,
    technique: 'rn-higher-order',
    difficulty: fn.difficulty === 3 ? 3 : 2,
    method:
      'Apply the definition of a first partial derivative to fₓ and to fᵧ (from question 3). In the notes’ notation ∂²f/∂x∂y = ∂/∂x(∂f/∂y). The four derivatives are checked; the limit working is yours to write.',
    partial: {
      variables: ['x', 'y'],
      samples: fn.samples,
      targets: [
        d('∂²f/∂x²', fn.f, 'x', 'x'),
        d('∂²f/∂y²', fn.f, 'y', 'y'),
        d('∂²f/∂x∂y', fn.f, 'y', 'x'),
        d('∂²f/∂y∂x', fn.f, 'x', 'y'),
      ],
    },
    grading: 'partial',
    reviewIds: ['MR3-T3'],
    before: [
      [
        'From question 3, the first partial derivatives are known. This walkthrough applies the definition of a first partial derivative to each of them in turn:',
        `${FX} = ${texOf(fn.answers[0])}, \\qquad ${FY} = ${texOf(fn.answers[1])}`,
      ],
    ],
    answers: Q18_ANSWERS[i]!,
    labelsTex: [pure('x'), pure('y'), second('x', 'y'), second('y', 'x')],
  }),
);

// -----------------------------------------------------------------------------
// Q19: f = x^(y^z) (§3.2.2)
// -----------------------------------------------------------------------------

const Q19_TEX = 'f(x, y, z) = x^{y^{z}}';
const Q19_CONDITION = 'Here $x > 0$ and $y > 0$.';
const q19 = [
  part(19, 'i', 3, '3-2-2', {
    instruction: 'Let f(x, y, z) = x^(y^z). Determine the function k(y, z) given that ∂f/∂x = y^z x^k(z,z).',
    problem: `${Q19_TEX}, \\qquad \\frac{\\partial f}{\\partial x} = y^{z}x^{k(z, z)}`,
    condition: Q19_CONDITION,
    technique: 'rn-partial',
    difficulty: 3,
    method: 'Holding y and z constant, x^(y^z) is a power of x.',
    partial: { variables: ['x', 'y', 'z'], samples: SAMPLES_XYZ, targets: [] },
    grading: 'written',
    reviewIds: ['MR3-T2'],
    steps: [
      ['With $y$ and $z$ constant, $y^{z}$ is a constant power, so by the power rule:', `${FX} = y^{z}x^{y^{z} - 1}`],
      ['Compare with the given form: the exponent of $x$ is $y^{z} - 1$.'],
    ],
    answerTex: 'k = y^{z} - 1',
    verify: { targets: [d('∂f/∂x', 'x^(y^z)', 'x')], answers: ['y^z x^(y^z - 1)'] },
  }),
  part(19, 'ii', 3, '3-2-2', {
    instruction: 'Let f(x, y, z) = x^(y^z). Determine the function g(x, y, z) given that ∂f/∂y = x^(y^z) g(x, y, z).',
    problem: `${Q19_TEX}, \\qquad \\frac{\\partial f}{\\partial y} = x^{y^{z}}g(x, y, z)`,
    condition: Q19_CONDITION,
    technique: 'rn-partial',
    difficulty: 3,
    method: 'Write x^(y^z) = e^(y^z ln x) and differentiate with respect to y.',
    partial: { variables: ['x', 'y', 'z'], samples: SAMPLES_XYZ, targets: [d('g(x, y, z)', 'y^z ln(x)', 'y')] },
    before: [
      [
        'Write $f = e^{y^{z}\\ln x}$. With $x$ and $z$ constant:',
        `${FY} = e^{y^{z}\\ln x} \\cdot zy^{z - 1}\\ln x = x^{y^{z}} \\cdot zy^{z - 1}\\ln x`,
      ],
      ['Compare with the given form:'],
    ],
    answers: ['z y^(z - 1) ln(x)'],
    labelsTex: ['g(x, y, z)'],
  }),
  part(19, 'iii', 3, '3-2-2', {
    instruction: 'Let f(x, y, z) = x^(y^z). Determine the function h(x, y) given that ∂f/∂z = x^(y^z) y^z h(x, y).',
    problem: `${Q19_TEX}, \\qquad \\frac{\\partial f}{\\partial z} = x^{y^{z}}y^{z}h(x, y)`,
    condition: Q19_CONDITION,
    technique: 'rn-partial',
    difficulty: 3,
    method: 'Write x^(y^z) = e^(y^z ln x); with respect to z, y^z is an exponential with derivative y^z ln y.',
    partial: { variables: ['x', 'y', 'z'], samples: SAMPLES_XYZ, targets: [d('h(x, y)', 'ln(x) ln(y)')] },
    before: [
      [
        'Write $f = e^{y^{z}\\ln x}$. With $x$ and $y$ constant:',
        `${FZ} = e^{y^{z}\\ln x} \\cdot y^{z}\\ln y \\ln x = x^{y^{z}}y^{z} \\cdot \\ln x\\ln y`,
      ],
      ['Compare with the given form:'],
    ],
    answers: ['ln(x) ln(y)'],
    labelsTex: ['h(x, y)'],
  }),
];

/** All 125 parts of Tutorial 3, in the order printed. */
export const TUTORIAL3_ITEMS: PracticeItem[] = [
  ...q1,
  ...q2,
  ...q3,
  ...q4to6,
  q7,
  ...q8,
  ...q9,
  ...q10to16,
  ...q17,
  ...q18,
  ...q19,
];
