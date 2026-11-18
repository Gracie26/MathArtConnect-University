/**
 * Tutorial 5 "Gradient and Extrema of Functions of Two Variables"
 * (21 September 2026, Dr J. Mushanyu): all 35 parts, transcribed exactly as
 * printed (checked against the page images).
 *
 * Placement (approved specification):
 *   Q1(i)–(viii)  → The Gradient, as "Review from §3.3: Total Differential and Gradient Components"
 *                   (prior knowledge from Chapter 3 §3.3; source section 3-3, not a Chapter 4 page)
 *   Q2(i)–(iv)    → The Gradient (§4.1)
 *   Q3(i)–(v)     → Tangent Planes and Normal Lines (§4.2.1)
 *   Q4(i)–(v)     → Tangent Planes and Normal Lines (§4.2.1), plane and normal line
 *   Q5(a)–(m)     → The Second Partials Test (§4.3.1)
 *
 * The tutorial has no answer key: every walkthrough is an APP-GENERATED
 * SOLUTION, pending lecturer review. Q5(m) is a written self-check question
 * with its app solution withheld (MR4-10).
 */
import type { PracticeItem } from '../../types';

import { PDA_UNITS as U, type PdaUnitId } from './ids';
import {
  deriv,
  type DerivativeSpec,
  type ExtremaItemSpec,
  pdaItem,
  type PdaPracticeSpec,
  SAMPLES_XY,
  SAMPLES_XYZ,
  type SurfaceItemSpec,
  tex,
  value,
} from './practice';
import { TUT5 } from './sources';

const SECTION_UNIT: Record<string, PdaUnitId> = {
  '3-3': U.gradient,
  '4-1': U.gradient,
  '4-2-1': U.tangentPlanes,
  '4-3-1': U.secondPartials,
};

function part(question: number, sub: string, page: number, section: string, spec: PdaPracticeSpec): PracticeItem {
  const q = `Q${question}`;
  return pdaItem(
    {
      id: `tut5-q${question}-${sub}`,
      sourceType: 'tutorial-question',
      source: { document: TUT5, item: `${q}(${sub})`, page },
      sourceQuestion: q,
      sourceSubquestion: sub,
      sourceSection: section,
      unitId: SECTION_UNIT[section]!,
    },
    spec,
  );
}

// -----------------------------------------------------------------------------
// Q1: total differential (Review from §3.3)
// -----------------------------------------------------------------------------

const Q1 = 'Find the total differential of the following functions.';

function differential(
  name: 'z' | 'w',
  f: string,
  problem: string,
  derivatives: string[],
  difficulty: 1 | 2 | 3,
): DerivativeSpec {
  const variables = derivatives.length === 3 ? ['x', 'y', 'z'] : ['x', 'y'];
  const terms = derivatives.map((d, i) => `\\left(${tex(d)}\\right)d${variables[i]}`).join(' + ');
  return {
    kind: 'derivatives',
    instruction: Q1,
    problem,
    technique: 'pda-total-differential',
    difficulty,
    method:
      'Find each first partial derivative; the coefficient of each differential is the partial derivative with respect to that variable (§3.3). Give the coefficients in order, separated by commas.',
    partial: {
      variables,
      samples: variables.length === 3 ? SAMPLES_XYZ : SAMPLES_XY,
      targets: variables.map((v) => deriv(`coefficient of d${v}`, f, v)),
    },
    name,
    derivatives,
    answers: derivatives,
    labelsTex: variables.map((v) => `\\frac{\\partial ${name}}{\\partial ${v}}`),
    answerTex: `d${name} = ${terms}`,
  };
}

const q1: PracticeItem[] = [
  part(1, 'i', 1, '3-3', differential('z', '3x^2 y^3', 'z = 3x^{2}y^{3}', ['6x y^3', '9x^2 y^2'], 1)),
  part(1, 'ii', 1, '3-3', differential('z', 'x^2/y', 'z = \\frac{x^{2}}{y}', ['2x/y', '-x^2/y^2'], 1)),
  part(
    1,
    'iii',
    1,
    '3-3',
    differential('z', 'x cos(y) - y cos(x)', 'z = x\\cos y - y\\cos x', ['cos(y) + y sin(x)', '-x sin(y) - cos(x)'], 2),
  ),
  part(
    1,
    'iv',
    1,
    '3-3',
    differential('w', 'e^x cos(y) + z', 'w = e^{x}\\cos y + z', ['e^x cos(y)', '-e^x sin(y)', '1'], 1),
  ),
  part(
    1,
    'v',
    1,
    '3-3',
    differential(
      'w',
      'x^2 y z^2 sin(y z)',
      'w = x^{2}yz^{2}\\sin yz',
      ['2x y z^2 sin(y z)', 'x^2 z^2 sin(y z) + x^2 y z^3 cos(y z)', '2x^2 y z sin(y z) + x^2 y^2 z^2 cos(y z)'],
      3,
    ),
  ),
  part(
    1,
    'vi',
    1,
    '3-3',
    differential(
      'z',
      '(1/2)(e^(x^2 + y^2) - e^(-x^2 - y^2))',
      'z = \\frac{1}{2}\\left(e^{x^{2}+y^{2}} - e^{-x^{2}-y^{2}}\\right)',
      ['x(e^(x^2 + y^2) + e^(-x^2 - y^2))', 'y(e^(x^2 + y^2) + e^(-x^2 - y^2))'],
      2,
    ),
  ),
  part(1, 'vii', 1, '3-3', differential('z', 'e^x sin(y)', 'z = e^{x}\\sin y', ['e^x sin(y)', 'e^x cos(y)'], 1)),
  part(
    1,
    'viii',
    1,
    '3-3',
    differential(
      'w',
      '(x + y)/(z - 2y)',
      'w = \\frac{x + y}{z - 2y}',
      ['1/(z - 2y)', '(z + 2x)/(z - 2y)^2', '-(x + y)/(z - 2y)^2'],
      2,
    ),
  ),
];

// -----------------------------------------------------------------------------
// Q2: the gradient at a point (§4.1)
// -----------------------------------------------------------------------------

const Q2 = 'Find the gradient of the function at the indicated point.';

function gradient(spec: {
  name: string;
  f: string;
  problem: string;
  point: Record<string, number>;
  pointTex: string;
  derivatives: string[];
  answers: string[];
  answerTex: string;
  difficulty: 1 | 2 | 3;
  reviewIds?: string[];
}): DerivativeSpec {
  const variables = Object.keys(spec.point);
  const labelsTex = variables.map((v) => `${spec.name}_{${v}}${spec.pointTex}`);
  return {
    kind: 'derivatives',
    instruction: Q2,
    problem: spec.problem,
    technique: 'pda-gradient',
    difficulty: spec.difficulty,
    method:
      'Find each first partial derivative, then evaluate it at the point. Give the components of the gradient in order, separated by commas.',
    partial: {
      variables,
      samples: variables.length === 3 ? SAMPLES_XYZ : SAMPLES_XY,
      targets: variables.map((v) => value(`${spec.name}_${v} at the point`, spec.f, [v], spec.point)),
    },
    name: spec.name,
    derivatives: spec.derivatives,
    answers: spec.answers,
    labelsTex,
    pointTex: spec.pointTex,
    answerTex: spec.answerTex,
    ...(spec.reviewIds ? { reviewIds: spec.reviewIds } : {}),
  };
}

const q2: PracticeItem[] = [
  part(
    2,
    'i',
    1,
    '4-1',
    gradient({
      name: 'h',
      f: 'x tan(y)',
      problem: 'h(x, y) = x\\tan y \\text{ at } \\left(2, \\frac{\\pi}{4}\\right)',
      point: { x: 2, y: Math.PI / 4 },
      pointTex: '\\left(2, \\frac{\\pi}{4}\\right)',
      derivatives: ['tan(y)', 'x/cos(y)^2'],
      answers: ['1', '4'],
      answerTex: '\\nabla h\\left(2, \\frac{\\pi}{4}\\right) = \\mathbf{i} + 4\\mathbf{j}',
      difficulty: 1,
    }),
  ),
  part(
    2,
    'ii',
    1,
    '4-1',
    gradient({
      name: 'h',
      f: 'y cos(x - y)',
      problem: 'h(x, y) = y\\cos(x - y) \\text{ at } \\left(0, \\frac{\\pi}{3}\\right)',
      point: { x: 0, y: Math.PI / 3 },
      pointTex: '\\left(0, \\frac{\\pi}{3}\\right)',
      derivatives: ['-y sin(x - y)', 'cos(x - y) + y sin(x - y)'],
      answers: ['pi sqrt(3)/6', '1/2 - pi sqrt(3)/6'],
      answerTex:
        '\\nabla h\\left(0, \\frac{\\pi}{3}\\right) = \\frac{\\sqrt{3}\\pi}{6}\\mathbf{i} + \\left(\\frac{1}{2} - \\frac{\\sqrt{3}\\pi}{6}\\right)\\mathbf{j}',
      difficulty: 2,
    }),
  ),
  part(
    2,
    'iii',
    1,
    '4-1',
    gradient({
      name: 'g',
      f: 'y e^(-x^2)',
      problem: 'g(x, y) = ye^{-x^{2}} \\text{ at } (0, 5)',
      point: { x: 0, y: 5 },
      pointTex: '(0, 5)',
      derivatives: ['-2x y e^(-x^2)', 'e^(-x^2)'],
      answers: ['0', '1'],
      answerTex: '\\nabla g(0, 5) = 0\\mathbf{i} + \\mathbf{j} = \\mathbf{j}',
      difficulty: 1,
    }),
  ),
  part(
    2,
    'iv',
    1,
    '4-1',
    gradient({
      name: 'w',
      f: 'x y^2 z^2',
      problem: 'w = xy^{2}z^{2} \\text{ at } (2, 1, 1)',
      point: { x: 2, y: 1, z: 1 },
      pointTex: '(2, 1, 1)',
      derivatives: ['y^2 z^2', '2x y z^2', '2x y^2 z'],
      answers: ['1', '4', '4'],
      answerTex: '\\nabla w(2, 1, 1) = \\mathbf{i} + 4\\mathbf{j} + 4\\mathbf{k}',
      difficulty: 1,
      reviewIds: ['MR4-02'],
    }),
  ),
];

// -----------------------------------------------------------------------------
// Q3 and Q4: tangent planes and normal lines (§4.2.1)
// -----------------------------------------------------------------------------

const Q3 = 'Find an equation of the tangent plane to the surface at the indicated point.';
const Q4 =
  'Find an equation for the tangent plane and find the symmetric equations for the normal line to the surface at the indicated point.';
const FROM_Z = 'with $F(x, y, z) = f(x, y) - z$ (§4.2.1)';
const ONE_SIDE = 'by moving every term to one side';

function surface(
  spec: Omit<SurfaceItemSpec, 'kind' | 'instruction' | 'technique' | 'method' | 'surface'> & {
    F: string;
    point: { x: number; y: number; z: number };
    normal?: boolean;
  },
): SurfaceItemSpec {
  const { F, point, normal, ...rest } = spec;
  return {
    kind: 'surface',
    instruction: normal ? Q4 : Q3,
    technique: normal ? 'pda-normal-line' : 'pda-tangent-plane',
    method: normal
      ? 'Write the surface as F(x, y, z) = 0, evaluate ∇F at the point, use Theorem 4.2.2 for the plane and the components of ∇F as the direction numbers of the normal line. Give the plane, then the symmetric equations, separated by a semicolon.'
      : 'Write the surface as F(x, y, z) = 0, evaluate F_x, F_y and F_z at the point, and substitute into Theorem 4.2.2.',
    surface: { F, point, ask: normal ? ['plane', 'normal'] : ['plane'] },
    ...rest,
  };
}

const q3: PracticeItem[] = [
  part(
    3,
    'i',
    1,
    '4-2-1',
    surface({
      problem: 'z = 25 - x^{2} - y^{2} \\text{ at } (3, 1, 15)',
      difficulty: 1,
      F: '25 - x^2 - y^2 - z',
      Ftex: '25 - x^{2} - y^{2} - z',
      Fnote: FROM_Z,
      point: { x: 3, y: 1, z: 15 },
      pointTex: '(3, 1, 15)',
      partials: ['-2x', '-2y', '-1'],
      values: ['-6', '-2', '-1'],
      substituted: '-6(x - 3) - 2(y - 1) - (z - 15) = 0',
      plane: '6x + 2y + z = 35',
    }),
  ),
  part(
    3,
    'ii',
    1,
    '4-2-1',
    surface({
      problem: 'z = \\sqrt{x^{2} + y^{2}} \\text{ at } (3, 4, 5)',
      difficulty: 2,
      F: 'sqrt(x^2 + y^2) - z',
      Ftex: '\\sqrt{x^{2} + y^{2}} - z',
      Fnote: FROM_Z,
      point: { x: 3, y: 4, z: 5 },
      pointTex: '(3, 4, 5)',
      partials: ['x/sqrt(x^2 + y^2)', 'y/sqrt(x^2 + y^2)', '-1'],
      values: ['3/5', '4/5', '-1'],
      substituted: '(3/5)(x - 3) + (4/5)(y - 4) - (z - 5) = 0',
      plane: '3x + 4y - 5z = 0',
    }),
  ),
  part(
    3,
    'iii',
    1,
    '4-2-1',
    surface({
      problem: 'x^{2} + 4y^{2} + z^{2} = 36 \\text{ at } (2, -2, 4)',
      difficulty: 1,
      F: 'x^2 + 4y^2 + z^2 - 36',
      Ftex: 'x^{2} + 4y^{2} + z^{2} - 36',
      Fnote: ONE_SIDE,
      point: { x: 2, y: -2, z: 4 },
      pointTex: '(2, -2, 4)',
      partials: ['2x', '8y', '2z'],
      values: ['4', '-16', '8'],
      substituted: '4(x - 2) - 16(y + 2) + 8(z - 4) = 0',
      plane: 'x - 4y + 2z = 18',
    }),
  ),
  part(
    3,
    'iv',
    1,
    '4-2-1',
    surface({
      problem: 'xy^{2} + 3x - z^{2} = 4 \\text{ at } (2, 1, -2)',
      difficulty: 2,
      F: 'x y^2 + 3x - z^2 - 4',
      Ftex: 'xy^{2} + 3x - z^{2} - 4',
      Fnote: ONE_SIDE,
      point: { x: 2, y: 1, z: -2 },
      pointTex: '(2, 1, -2)',
      partials: ['y^2 + 3', '2x y', '-2z'],
      values: ['4', '4', '4'],
      substituted: '4(x - 2) + 4(y - 1) + 4(z + 2) = 0',
      plane: 'x + y + z = 1',
    }),
  ),
  part(
    3,
    'v',
    1,
    '4-2-1',
    surface({
      problem: 'xyz + x^{2} - 2y^{2} + z^{3} = 14 \\text{ at } (5, -2, 3)',
      difficulty: 2,
      F: 'x y z + x^2 - 2y^2 + z^3 - 14',
      Ftex: 'xyz + x^{2} - 2y^{2} + z^{3} - 14',
      Fnote: ONE_SIDE,
      point: { x: 5, y: -2, z: 3 },
      pointTex: '(5, -2, 3)',
      partials: ['y z + 2x', 'x z - 4y', 'x y + 3z^2'],
      values: ['4', '23', '17'],
      substituted: '4(x - 5) + 23(y + 2) + 17(z - 3) = 0',
      plane: '4x + 23y + 17z = 25',
    }),
  ),
];

const q4: PracticeItem[] = [
  part(
    4,
    'i',
    1,
    '4-2-1',
    surface({
      problem: 'x^{2} + y^{2} + z = 9 \\text{ at } (1, 2, 4)',
      difficulty: 1,
      normal: true,
      F: 'x^2 + y^2 + z - 9',
      Ftex: 'x^{2} + y^{2} + z - 9',
      Fnote: ONE_SIDE,
      point: { x: 1, y: 2, z: 4 },
      pointTex: '(1, 2, 4)',
      partials: ['2x', '2y', '1'],
      values: ['2', '4', '1'],
      substituted: '2(x - 1) + 4(y - 2) + (z - 4) = 0',
      plane: '2x + 4y + z = 14',
      line: '(x - 1)/2 = (y - 2)/4 = (z - 4)/1',
    }),
  ),
  part(
    4,
    'ii',
    1,
    '4-2-1',
    surface({
      problem: 'xy - z = 0 \\text{ at } (-2, -3, 6)',
      difficulty: 1,
      normal: true,
      F: 'x y - z',
      Ftex: 'xy - z',
      Fnote: 'as printed',
      point: { x: -2, y: -3, z: 6 },
      pointTex: '(-2, -3, 6)',
      partials: ['y', 'x', '-1'],
      values: ['-3', '-2', '-1'],
      substituted: '-3(x + 2) - 2(y + 3) - (z - 6) = 0',
      plane: '3x + 2y + z = -6',
      line: '(x + 2)/(-3) = (y + 3)/(-2) = (z - 6)/(-1)',
    }),
  ),
  part(
    4,
    'iii',
    1,
    '4-2-1',
    surface({
      problem: 'z = \\tan^{-1}\\left(\\frac{y}{x}\\right) \\text{ at } \\left(1, 1, \\frac{\\pi}{4}\\right)',
      difficulty: 3,
      normal: true,
      F: 'arctan(y/x) - z',
      Ftex: '\\tan^{-1}\\left(\\frac{y}{x}\\right) - z',
      Fnote: FROM_Z,
      point: { x: 1, y: 1, z: Math.PI / 4 },
      pointTex: '\\left(1, 1, \\frac{\\pi}{4}\\right)',
      partials: ['-y/(x^2 + y^2)', 'x/(x^2 + y^2)', '-1'],
      values: ['-1/2', '1/2', '-1'],
      substituted: '-(1/2)(x - 1) + (1/2)(y - 1) - (z - pi/4) = 0',
      plane: 'x - y + 2z = pi/2',
      line: '(x - 1)/(-1/2) = (y - 1)/(1/2) = (z - pi/4)/(-1)',
    }),
  ),
  part(
    4,
    'iv',
    1,
    '4-2-1',
    surface({
      problem: 'xyz = 10 \\text{ at } (1, 2, 5)',
      difficulty: 1,
      normal: true,
      F: 'x y z - 10',
      Ftex: 'xyz - 10',
      Fnote: ONE_SIDE,
      point: { x: 1, y: 2, z: 5 },
      pointTex: '(1, 2, 5)',
      partials: ['y z', 'x z', 'x y'],
      values: ['10', '5', '2'],
      substituted: '10(x - 1) + 5(y - 2) + 2(z - 5) = 0',
      plane: '10x + 5y + 2z = 30',
      line: '(x - 1)/10 = (y - 2)/5 = (z - 5)/2',
    }),
  ),
  part(
    4,
    'v',
    1,
    '4-2-1',
    surface({
      problem: 'x^{2} + y^{2} + z^{2} = 9 \\text{ at } (1, 2, 2)',
      difficulty: 1,
      normal: true,
      F: 'x^2 + y^2 + z^2 - 9',
      Ftex: 'x^{2} + y^{2} + z^{2} - 9',
      Fnote: ONE_SIDE,
      point: { x: 1, y: 2, z: 2 },
      pointTex: '(1, 2, 2)',
      partials: ['2x', '2y', '2z'],
      values: ['2', '4', '4'],
      substituted: '2(x - 1) + 4(y - 2) + 4(z - 2) = 0',
      plane: 'x + 2y + 2z = 9',
      line: '(x - 1)/2 = (y - 2)/4 = (z - 2)/4',
    }),
  ),
];

// -----------------------------------------------------------------------------
// Q5: find and classify the stationary points (§4.3.1, Second Partials Test)
// -----------------------------------------------------------------------------

const Q5 = 'Find and classify the stationary points of';
const Q5_METHOD =
  'Find the critical points by solving f_x = 0 and f_y = 0 together, then compute d = f_xx f_yy − [f_xy]² at each one and use Theorem 4.3.3. Give each point and its type, e.g. (1, 0) min; (0, 0) saddle.';

const classify = (
  spec: Omit<ExtremaItemSpec, 'kind' | 'instruction' | 'technique' | 'method' | 'classify'>,
): ExtremaItemSpec => ({
  kind: 'extrema',
  instruction: Q5,
  technique: 'pda-second-partials',
  method: Q5_METHOD,
  classify: true,
  ...spec,
  reviewIds: ['MR4-08', ...(spec.reviewIds ?? [])],
});

const C = '(2/5)^(1/3)';
const Y_PLUS = '(-8 + 2sqrt(61))/9';
const Y_MINUS = '(-8 - 2sqrt(61))/9';

const q5: PracticeItem[] = [
  part(
    5,
    'a',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = x^{2} - 2xy + 2y^{2} - 2x + 2y + 4',
      difficulty: 1,
      f: 'x^2 - 2x y + 2y^2 - 2x + 2y + 4',
      fx: '2x - 2y - 2',
      fy: '-2x + 4y + 2',
      solve:
        'Solve $f_{x} = 0$ and $f_{y} = 0$ together: the first gives $x = y + 1$; substituting into the second gives $2y = 0$, so $y = 0$ and $x = 1$.',
      second: ['2', '4', '-2'],
      points: [{ x: '1', y: '0', type: 'min', fxx: '2', d: '4' }],
    }),
  ),
  part(
    5,
    'b',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = (y - 2)x^{2} - y^{2}',
      difficulty: 2,
      f: '(y - 2)x^2 - y^2',
      fx: '2x(y - 2)',
      fy: 'x^2 - 2y',
      solve:
        'From $f_{x} = 2x(y - 2) = 0$, either $x = 0$ or $y = 2$. If $x = 0$, then $f_{y} = -2y = 0$ gives $y = 0$. If $y = 2$, then $x^{2} = 4$, so $x = \\pm 2$.',
      second: ['2(y - 2)', '-2', '2x'],
      points: [
        { x: '0', y: '0', type: 'max', fxx: '-4', d: '8' },
        { x: '2', y: '2', type: 'saddle', fxx: '0', d: '-16' },
        { x: '-2', y: '2', type: 'saddle', fxx: '0', d: '-16' },
      ],
    }),
  ),
  part(
    5,
    'c',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = 7x - 8y + 2xy - x^{2} + y^{3}',
      difficulty: 2,
      f: '7x - 8y + 2x y - x^2 + y^3',
      fx: '7 + 2y - 2x',
      fy: '-8 + 2x + 3y^2',
      solve:
        'From $f_{x} = 0$, $x = \\frac{7 + 2y}{2}$. Substituting into $f_{y} = 0$ gives $3y^{2} + 2y - 1 = 0$, so $y = \\frac{1}{3}$ or $y = -1$.',
      second: ['-2', '6y', '2'],
      points: [
        { x: '23/6', y: '1/3', type: 'saddle', fxx: '-2', d: '-8' },
        { x: '5/2', y: '-1', type: 'max', fxx: '-2', d: '8' },
      ],
    }),
  ),
  part(
    5,
    'd',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = x^{5} + y^{5} - x^{2} - y^{2} + 1',
      difficulty: 3,
      f: 'x^5 + y^5 - x^2 - y^2 + 1',
      fx: '5x^4 - 2x',
      fy: '5y^4 - 2y',
      solve:
        '$f_{x} = x(5x^{3} - 2) = 0$ gives $x = 0$ or $x = \\left(\\frac{2}{5}\\right)^{1/3}$, and $f_{y} = 0$ gives the same values for $y$. Every combination is a critical point.',
      second: ['20x^3 - 2', '20y^3 - 2', '0'],
      points: [
        { x: '0', y: '0', type: 'max', fxx: '-2', d: '4' },
        { x: '0', y: C, type: 'saddle', fxx: '-2', d: '-12' },
        { x: C, y: '0', type: 'saddle', fxx: '6', d: '-12' },
        { x: C, y: C, type: 'min', fxx: '6', d: '36' },
      ],
    }),
  ),
  part(
    5,
    'e',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = 2x^{2} + 2xy + y^{2} + 2x - 3',
      difficulty: 1,
      f: '2x^2 + 2x y + y^2 + 2x - 3',
      fx: '4x + 2y + 2',
      fy: '2x + 2y',
      solve: '$f_{y} = 0$ gives $y = -x$; then $f_{x} = 2x + 2 = 0$, so $x = -1$ and $y = 1$.',
      second: ['4', '2', '2'],
      points: [{ x: '-1', y: '1', type: 'min', fxx: '4', d: '4' }],
    }),
  ),
  part(
    5,
    'f',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = (3x + 4x^{3})(y^{2} + 2y)',
      difficulty: 3,
      f: '(3x + 4x^3)(y^2 + 2y)',
      fx: '(3 + 12x^2)(y^2 + 2y)',
      fy: '(3x + 4x^3)(2y + 2)',
      solve:
        'Since $3 + 12x^{2} > 0$, $f_{x} = 0$ needs $y^{2} + 2y = 0$, so $y = 0$ or $y = -2$. For these $y$, $2y + 2 \\neq 0$, so $f_{y} = 0$ needs $x(3 + 4x^{2}) = 0$, that is $x = 0$.',
      second: ['24x(y^2 + 2y)', '2(3x + 4x^3)', '(3 + 12x^2)(2y + 2)'],
      points: [
        { x: '0', y: '0', type: 'saddle', fxx: '0', d: '-36' },
        { x: '0', y: '-2', type: 'saddle', fxx: '0', d: '-36' },
      ],
    }),
  ),
  part(
    5,
    'g',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = x^{3} + y^{3} - 3x - 12y + 20',
      difficulty: 2,
      f: 'x^3 + y^3 - 3x - 12y + 20',
      fx: '3x^2 - 3',
      fy: '3y^2 - 12',
      solve: '$f_{x} = 0$ gives $x = \\pm 1$ and $f_{y} = 0$ gives $y = \\pm 2$: four critical points.',
      second: ['6x', '6y', '0'],
      points: [
        { x: '1', y: '2', type: 'min', fxx: '6', d: '72' },
        { x: '1', y: '-2', type: 'saddle', fxx: '6', d: '-72' },
        { x: '-1', y: '2', type: 'saddle', fxx: '-6', d: '-72' },
        { x: '-1', y: '-2', type: 'max', fxx: '-6', d: '72' },
      ],
    }),
  ),
  part(
    5,
    'h',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = 4xy - y^{4} - x^{4}',
      difficulty: 2,
      f: '4x y - y^4 - x^4',
      fx: '4y - 4x^3',
      fy: '4x - 4y^3',
      solve: '$f_{x} = 0$ gives $y = x^{3}$; then $f_{y} = 4x - 4x^{9} = 0$, so $x = 0$, $1$ or $-1$.',
      second: ['-12x^2', '-12y^2', '4'],
      points: [
        { x: '0', y: '0', type: 'saddle', fxx: '0', d: '-16' },
        { x: '1', y: '1', type: 'max', fxx: '-12', d: '128' },
        { x: '-1', y: '-1', type: 'max', fxx: '-12', d: '128' },
      ],
    }),
  ),
  part(
    5,
    'i',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = 3y^{3} - x^{2}y^{2} + 8y^{2} + 4x^{2} - 20y',
      difficulty: 3,
      reviewIds: ['MR4-11'],
      f: '3y^3 - x^2 y^2 + 8y^2 + 4x^2 - 20y',
      fx: '-2x y^2 + 8x',
      fy: '9y^2 - 2x^2 y + 16y - 20',
      solve:
        '$f_{x} = 2x(4 - y^{2}) = 0$ gives $x = 0$ or $y = \\pm 2$. With $x = 0$: $9y^{2} + 16y - 20 = 0$, so $y = \\frac{-8 \\pm 2\\sqrt{61}}{9}$. With $y = 2$: $48 - 4x^{2} = 0$, so $x = \\pm 2\\sqrt{3}$. With $y = -2$: $4x^{2} - 16 = 0$, so $x = \\pm 2$.',
      second: ['8 - 2y^2', '18y - 2x^2 + 16', '-4x y'],
      points: [
        { x: '0', y: Y_PLUS, type: 'min', fxx: '(32 + 64sqrt(61))/81', d: '(15616 + 128sqrt(61))/81' },
        { x: '0', y: Y_MINUS, type: 'max', fxx: '(32 - 64sqrt(61))/81', d: '(15616 - 128sqrt(61))/81' },
        { x: '2sqrt(3)', y: '2', type: 'saddle', fxx: '0', d: '-768' },
        { x: '-2sqrt(3)', y: '2', type: 'saddle', fxx: '0', d: '-768' },
        { x: '2', y: '-2', type: 'saddle', fxx: '0', d: '-256' },
        { x: '-2', y: '-2', type: 'saddle', fxx: '0', d: '-256' },
      ],
    }),
  ),
  part(
    5,
    'j',
    1,
    '4-3-1',
    classify({
      problem: 'f(x, y) = (x - 1)^{2} + (y - 3)^{2}',
      difficulty: 1,
      f: '(x - 1)^2 + (y - 3)^2',
      fx: '2(x - 1)',
      fy: '2(y - 3)',
      solve: '$f_{x} = 0$ gives $x = 1$ and $f_{y} = 0$ gives $y = 3$.',
      second: ['2', '2', '0'],
      points: [{ x: '1', y: '3', type: 'min', fxx: '2', d: '4' }],
    }),
  ),
  part(
    5,
    'k',
    2,
    '4-3-1',
    classify({
      problem: 'f(x, y) = -5x^{2} + 4xy - y^{2} + 16x + 10',
      difficulty: 1,
      f: '-5x^2 + 4x y - y^2 + 16x + 10',
      fx: '-10x + 4y + 16',
      fy: '4x - 2y',
      solve: '$f_{y} = 0$ gives $y = 2x$; then $f_{x} = -2x + 16 = 0$, so $x = 8$ and $y = 16$.',
      second: ['-10', '-2', '4'],
      points: [{ x: '8', y: '16', type: 'max', fxx: '-10', d: '4' }],
    }),
  ),
  part(
    5,
    'l',
    2,
    '4-3-1',
    classify({
      problem: 'f(x, y) = x^{3} - 3xy + y^{3}',
      difficulty: 2,
      f: 'x^3 - 3x y + y^3',
      fx: '3x^2 - 3y',
      fy: '-3x + 3y^2',
      solve: '$f_{x} = 0$ gives $y = x^{2}$; then $f_{y} = 0$ gives $x = x^{4}$, so $x = 0$ or $x = 1$.',
      second: ['6x', '6y', '-3'],
      points: [
        { x: '0', y: '0', type: 'saddle', fxx: '0', d: '-9' },
        { x: '1', y: '1', type: 'min', fxx: '6', d: '27' },
      ],
    }),
  ),
  // Q5(m): every point of an ellipse is a critical point with d = 0 (MR4-10). Written self-check;
  // the app solution is withheld until the lecturer gives guidance.
  part(5, 'm', 2, '4-3-1', {
    kind: 'written',
    instruction: Q5,
    problem: 'f(x, y) = (x^{2} - 2x + 4y^{2} - 8y)^{2}',
    technique: 'pda-second-partials',
    difficulty: 3,
    method:
      'Find f_x and f_y and look for every point where both are 0. Then think about where the Second Partials Test applies and what it says (Theorem 4.3.3).',
    reviewIds: ['MR4-08', 'MR4-10'],
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [deriv('f_x', '(x^2 - 2x + 4y^2 - 8y)^2', 'x'), deriv('f_y', '(x^2 - 2x + 4y^2 - 8y)^2', 'y')],
    },
  }),
];

export const TUTORIAL5_ITEMS: PracticeItem[] = [...q1, ...q2, ...q3, ...q4, ...q5];
