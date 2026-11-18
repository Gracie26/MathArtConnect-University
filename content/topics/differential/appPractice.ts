/**
 * APP PRACTICE for §3.3 The Total Differential (approved decision; MR3-T7).
 *
 * Neither Tutorial 3 nor Tutorial 4 has a total-differential question, so
 * these three items are written for the app. They follow the formulas of
 * §3.3 and the pattern of Example 3.3.1, are always labelled APP PRACTICE,
 * and are never presented as tutorial questions.
 */
import type { PracticeItem } from '../../types';

import { RN_UNITS } from './ids';
import { d, rnItem, SAMPLES_XY, SAMPLES_XYZ } from './practice';
import { CH3 } from './sources';

const base = (n: number) => ({
  id: `ap3-${n}`,
  sourceType: 'app-practice' as const,
  // The section of the notes these items practise (they are not printed there).
  source: { document: CH3, section: '3.3', item: `APP PRACTICE AP3-${n}`, page: 48 },
  sourceSection: '3-3',
  unitId: RN_UNITS.totalDifferential,
});

const METHOD =
  'Find each first partial derivative; the coefficient of each differential is the partial derivative with respect to that variable (§3.3). Give the coefficients in order, separated by commas.';

const coefficient = (variable: string) => `coefficient of d${variable}`;

export const APP_PRACTICE_ITEMS: PracticeItem[] = [
  rnItem(base(1), {
    instruction: 'Find the total differential dz. Give the coefficients of dx and dy, separated by commas.',
    problem: 'z = 3x^{2}\\sin y + 2xy^{3}',
    technique: 'rn-total-differential',
    difficulty: 1,
    method: METHOD,
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [d(coefficient('x'), '3x^2 sin(y) + 2x y^3', 'x'), d(coefficient('y'), '3x^2 sin(y) + 2x y^3', 'y')],
    },
    answers: ['6x sin(y) + 2y^3', '3x^2 cos(y) + 6x y^2'],
    labelsTex: ['\\frac{\\partial z}{\\partial x}', '\\frac{\\partial z}{\\partial y}'],
    answerTex: 'dz = (6x\\sin y + 2y^{3})dx + (3x^{2}\\cos y + 6xy^{2})dy',
  }),
  rnItem(base(2), {
    instruction: 'Find the total differential dw. Give the coefficients of dx, dy and dz, separated by commas.',
    problem: 'w = x^{2} + 2y^{2} + 3z^{2}',
    technique: 'rn-total-differential',
    difficulty: 1,
    method: METHOD,
    partial: {
      variables: ['x', 'y', 'z'],
      samples: SAMPLES_XYZ,
      targets: ['x', 'y', 'z'].map((v) => d(coefficient(v), 'x^2 + 2y^2 + 3z^2', v)),
    },
    answers: ['2x', '4y', '6z'],
    labelsTex: [
      '\\frac{\\partial w}{\\partial x}',
      '\\frac{\\partial w}{\\partial y}',
      '\\frac{\\partial w}{\\partial z}',
    ],
    answerTex: 'dw = 2x\\,dx + 4y\\,dy + 6z\\,dz',
  }),
  rnItem(base(3), {
    instruction: 'Find the total differential dw. Give the coefficients of dx, dy, dz and du, separated by commas.',
    problem: 'w = xy + zu',
    technique: 'rn-total-differential',
    difficulty: 2,
    method: METHOD,
    partial: {
      variables: ['x', 'y', 'z', 'u'],
      samples: SAMPLES_XYZ.map((p, i) => ({ ...p, u: [0.6, 1.4, 0.25, 1.9, 0.85][i]! })),
      targets: ['x', 'y', 'z', 'u'].map((v) => d(coefficient(v), 'xy + zu', v)),
    },
    answers: ['y', 'x', 'u', 'z'],
    labelsTex: [
      '\\frac{\\partial w}{\\partial x}',
      '\\frac{\\partial w}{\\partial y}',
      '\\frac{\\partial w}{\\partial z}',
      '\\frac{\\partial w}{\\partial u}',
    ],
    answerTex: 'dw = y\\,dx + x\\,dy + u\\,dz + z\\,du',
  }),
];
