/**
 * Reflect and Review for every Topic 4 subtopic.
 *
 * Reflect: one mathematical reflection question per subtopic (saved to the
 * learner's history; never graded). Review: a recap of the key concepts,
 * formulas, conditions and common errors from Chapter 4 (common errors are
 * APP GUIDANCE), one App practice retrieval question, and the learner's real
 * history with a next action (features/review). Retrieval questions are
 * written for the app, labelled so, and kept out of the course practice lists
 * and the locked counts (`retrievalItems`). No mastery percentages.
 */
import type { ContentBlock, PracticeItem } from '../../types';

import { PDA_UNITS as U, type PdaUnitId } from './ids';
import { pdaItem, type PdaPracticeSpec, SAMPLES_XY, value } from './practice';
import { ch4 } from './sources';

// -----------------------------------------------------------------------------
// App practice retrieval questions (one per subtopic)
// -----------------------------------------------------------------------------

function retrieval(unitId: PdaUnitId, section: string, page: number, spec: PdaPracticeSpec): PracticeItem {
  return pdaItem(
    {
      id: `app4-r-${unitId.replace(/^pda-/, '')}`,
      sourceType: 'app-practice',
      source: ch4(section, page),
      sourceSection: section.replace(/\./g, '-'),
      unitId,
    },
    spec,
  );
}

export const PDA_RETRIEVAL: readonly PracticeItem[] = [
  retrieval(U.gradient, '4.1', 55, {
    kind: 'derivatives',
    instruction: 'Find the gradient of f at the point (1, 2). Give its two components, separated by commas.',
    problem: 'f(x, y) = x^{2}y + 3y',
    technique: 'pda-gradient',
    difficulty: 1,
    method: 'Find f_x and f_y, then substitute x = 1 and y = 2.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [
        value('f_x at (1, 2)', 'x^2 y + 3y', ['x'], { x: 1, y: 2 }),
        value('f_y at (1, 2)', 'x^2 y + 3y', ['y'], { x: 1, y: 2 }),
      ],
    },
    name: 'f',
    derivatives: ['2x y', 'x^2 + 3'],
    answers: ['4', '4'],
    labelsTex: ['f_{x}(1, 2)', 'f_{y}(1, 2)'],
    pointTex: '(1, 2)',
    answerTex: '\\nabla f(1, 2) = 4\\mathbf{i} + 4\\mathbf{j}',
  }),
  retrieval(U.tangentPlanes, '4.2.1', 57, {
    kind: 'surface',
    instruction: 'Find an equation of the tangent plane to the surface at the point (1, 1, 2).',
    problem: 'z = x^{2} + y^{2}',
    technique: 'pda-tangent-plane',
    difficulty: 1,
    method: 'Use F(x, y, z) = f(x, y) − z and Theorem 4.2.2.',
    surface: { F: 'x^2 + y^2 - z', point: { x: 1, y: 1, z: 2 }, ask: ['plane'] },
    Ftex: 'x^{2} + y^{2} - z',
    Fnote: 'with $F(x, y, z) = f(x, y) - z$',
    partials: ['2x', '2y', '-1'],
    values: ['2', '2', '-1'],
    pointTex: '(1, 1, 2)',
    substituted: '2(x - 1) + 2(y - 1) - (z - 2) = 0',
    plane: '2x + 2y - z = 2',
  }),
  retrieval(U.criticalPoints, '4.3.1', 59, {
    kind: 'extrema',
    instruction: 'Find all the critical points of f.',
    problem: 'f(x, y) = x^{2} + y^{2} - 4x + 2y',
    technique: 'pda-critical-points',
    difficulty: 1,
    method: 'Solve f_x = 0 and f_y = 0 together.',
    f: 'x^2 + y^2 - 4x + 2y',
    classify: false,
    fx: '2x - 4',
    fy: '2y + 2',
    solve: '$f_{x} = 0$ gives $x = 2$ and $f_{y} = 0$ gives $y = -1$.',
    points: [{ x: '2', y: '-1' }],
  }),
  retrieval(U.secondPartials, '4.3.1', 60, {
    kind: 'extrema',
    instruction: 'Find and classify the critical points of f.',
    problem: 'f(x, y) = x^{2} - y^{2} + 2',
    technique: 'pda-second-partials',
    difficulty: 1,
    method: 'Find the critical point, then compute d = f_xx f_yy − [f_xy]².',
    f: 'x^2 - y^2 + 2',
    classify: true,
    fx: '2x',
    fy: '-2y',
    solve: '$f_{x} = 0$ gives $x = 0$ and $f_{y} = 0$ gives $y = 0$.',
    second: ['2', '-2', '0'],
    points: [{ x: '0', y: '0', type: 'saddle', fxx: '2', d: '-4' }],
  }),
];

// -----------------------------------------------------------------------------
// Reflect and Review
// -----------------------------------------------------------------------------

export interface PdaReviewContent {
  /** One mathematical reflection question. */
  reflect: string;
  /** Things learners can name as difficult (chips in the reflection card). */
  difficulties: string[];
  concepts: string[];
  formulas: { tex: string; note?: string }[];
  conditions: string[];
  errors: string[];
}

export const PDA_REVIEW: Record<PdaUnitId, PdaReviewContent> = {
  [U.gradient]: {
    reflect:
      'What information does each component of $\\nabla f$ carry? How are the components of the gradient related to the coefficients in the total differential $dz$ from §3.3?',
    difficulties: [
      'Finding each partial derivative',
      'Evaluating at the point',
      'Writing the vector',
      'Three variables',
    ],
    concepts: [
      'The gradient of $f(x, y)$ is the vector whose components are the first partial derivatives: $\\nabla f(x, y) = f_{x}(x, y)\\mathbf{i} + f_{y}(x, y)\\mathbf{j}$.',
      'It is a vector-valued function: at each point it gives a vector. It is read “del $f$” and also written grad $f(x, y)$.',
    ],
    formulas: [
      { tex: '\\nabla f(x, y) = f_{x}(x, y)\\mathbf{i} + f_{y}(x, y)\\mathbf{j}', note: '§4.1' },
      {
        tex: '\\nabla f(x, y, z) = f_{x}\\mathbf{i} + f_{y}\\mathbf{j} + f_{z}\\mathbf{k}',
        note: 'as used in Example 4.1.2',
      },
    ],
    conditions: ['The gradient exists where $f_{x}$ and $f_{y}$ exist (§4.1).'],
    errors: [
      'Substituting the point before differentiating.',
      'Writing a single number instead of a vector: the gradient has one component for each variable.',
    ],
  },
  [U.tangentPlanes]: {
    reflect:
      'Why does the single vector $\\nabla F$ at a point $P$ give both the tangent plane and the normal line to the surface at $P$?',
    difficulties: [
      'Writing F(x, y, z) = 0',
      'Partial derivatives of F',
      'Simplifying the plane',
      'Symmetric equations',
    ],
    concepts: [
      'Write the surface as $F(x, y, z) = 0$; for $z = f(x, y)$ use $F(x, y, z) = f(x, y) - z$.',
      'The gradient $\\nabla F$ at $P$ is orthogonal to every curve on the surface through $P$: the tangent plane is normal to it, and the normal line points along it (Theorem 4.2.1).',
    ],
    formulas: [
      {
        tex: 'F_{x}(x_{0}, y_{0}, z_{0})(x - x_{0}) + F_{y}(x_{0}, y_{0}, z_{0})(y - y_{0}) + F_{z}(x_{0}, y_{0}, z_{0})(z - z_{0}) = 0',
        note: 'Theorem 4.2.2',
      },
      {
        tex: 'f_{x}(x_{0}, y_{0})(x - x_{0}) + f_{y}(x_{0}, y_{0})(y - y_{0}) - (z - z_{0}) = 0',
        note: 'for z = f(x, y)',
      },
    ],
    conditions: ['Theorem 4.2.1 requires $F$ differentiable at $P$ with $\\nabla F(x_{0}, y_{0}, z_{0}) \\neq 0$.'],
    errors: [
      'Forgetting the term $-(z - z_{0})$ when the surface is $z = f(x, y)$.',
      'Using the value of $F$ instead of its partial derivatives at the point.',
    ],
  },
  [U.criticalPoints]: {
    reflect:
      'Using Example 4.3.2, explain how a relative maximum can occur at a point where the partial derivatives do not exist.',
    difficulties: ['Solving the system', 'Partials that do not exist', 'Missing a solution', 'Relative or absolute'],
    concepts: [
      'A relative minimum (maximum) at $(x_{0}, y_{0})$: $f(x, y) \\geq f(x_{0}, y_{0})$ ($\\leq$) on an open disc around it.',
      'Relative extrema on an open region occur only at critical points (Theorem 4.3.2): where $f_{x} = f_{y} = 0$, or where the partial derivatives do not exist.',
    ],
    formulas: [{ tex: 'f_{x}(x_{0}, y_{0}) = 0 \\quad \\text{and} \\quad f_{y}(x_{0}, y_{0}) = 0' }],
    conditions: ['The Extreme Value Theorem (Theorem 4.3.1) needs $f$ continuous on a closed bounded region $R$.'],
    errors: [
      'Solving only one of the two equations $f_{x} = 0$ and $f_{y} = 0$.',
      'Dividing by a variable that can be 0 and losing a critical point.',
    ],
  },
  [U.secondPartials]: {
    reflect:
      'What does $d < 0$ tell you about the surface near a critical point, and why does the sign of $f_{xx}$ not matter then?',
    difficulties: ['Finding every critical point', 'Second partial derivatives', 'The sign of d', 'When d = 0'],
    concepts: [
      'At a critical point with $f_{x} = f_{y} = 0$, the quantity $d = f_{xx}f_{yy} - [f_{xy}]^{2}$ decides the type (Theorem 4.3.3).',
      'A saddle point is neither a relative maximum nor a relative minimum.',
    ],
    formulas: [
      { tex: 'd = f_{xx}(a, b)f_{yy}(a, b) - [f_{xy}(a, b)]^{2}', note: 'Theorem 4.3.3' },
      { tex: 'd = \\begin{vmatrix} f_{xx}(a, b) & f_{xy}(a, b) \\\\ f_{yx}(a, b) & f_{yy}(a, b) \\end{vmatrix}' },
    ],
    conditions: [
      'Theorem 4.3.3 needs continuous second partial derivatives near $(a, b)$ and $f_{x}(a, b) = f_{y}(a, b) = 0$. If $d = 0$ the test is inconclusive.',
    ],
    errors: [
      'Looking at the sign of $f_{xx}$ when $d < 0$: the point is a saddle point whatever $f_{xx}$ is.',
      'Squaring wrongly: $d$ subtracts $[f_{xy}]^{2}$, which is never negative.',
    ],
  },
};

/** The Review recap blocks for a subtopic (before the learner's history). */
export function pdaReviewRecap(unitId: PdaUnitId): ContentBlock[] {
  const content = PDA_REVIEW[unitId];
  const items = PDA_RETRIEVAL.filter((i) => i.unitId === unitId);
  return [
    { type: 'summary', title: 'Key concepts', points: content.concepts },
    { type: 'formulaList', title: 'Formulas', items: content.formulas },
    { type: 'summary', title: 'When the results apply', points: content.conditions },
    {
      type: 'callout',
      tone: 'caution',
      title: 'Common errors (APP GUIDANCE)',
      text: content.errors.map((e) => `• ${e}`).join('\n'),
    },
    {
      type: 'practiceGroup',
      title: 'App practice: quick retrieval',
      text: 'Written for the app (not from the course notes or tutorials). Recall the method without looking back, then check your answer.',
      items,
    },
  ];
}
