/**
 * Reflect and Review for every Topic 3 subtopic.
 *
 * Reflect: one mathematical reflection question per subtopic (saved to the
 * learner's history; never graded). Review: a recap of the key concepts,
 * formulas, conditions and common errors from Chapter 3, one App practice
 * retrieval question, and the learner's real history with a next action
 * (features/review). Retrieval questions are written for the app, labelled
 * so, and kept out of the course practice lists and the locked counts
 * (they are `retrievalItems`, as in Topic 2). No mastery percentages.
 */
import type { ContentBlock, PracticeItem } from '../../types';

import { RN_UNITS as U, type RnUnitId } from './ids';
import { at, d, type RnPracticeSpec, rnItem, SAMPLES_XY, SAMPLES_XYZ } from './practice';
import { ch3 } from './sources';

// -----------------------------------------------------------------------------
// App practice retrieval questions (one per subtopic)
// -----------------------------------------------------------------------------

function retrieval(unitId: RnUnitId, section: string, page: number, spec: RnPracticeSpec): PracticeItem {
  return rnItem(
    {
      id: `app3-r-${unitId.replace(/^rn-/, '')}`,
      sourceType: 'app-practice',
      source: ch3(section, page),
      sourceSection: section.replace(/\./g, '-'),
      unitId,
    },
    spec,
  );
}

export const RN_RETRIEVAL: readonly PracticeItem[] = [
  retrieval(U.functions, '3.1', 43, {
    instruction: 'Evaluate f(2, −1).',
    problem: 'f(x, y) = x^{2}y - 3y',
    technique: 'rn-evaluate',
    difficulty: 1,
    method: 'Substitute x = 2 and y = −1.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [at('f(2, −1)', 'x^2 y - 3y', [], { x: 2, y: -1 })],
    },
    answers: ['-1'],
    labelsTex: ['f(2, -1)'],
  }),
  retrieval(U.partials, '3.2.1', 44, {
    instruction: 'Find ∂f/∂x and ∂f/∂y.',
    problem: 'f(x, y) = x^{2} + 3xy - y^{3}',
    technique: 'rn-partial',
    difficulty: 1,
    method: 'Hold the other variable constant each time.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [d('∂f/∂x', 'x^2 + 3xy - y^3', 'x'), d('∂f/∂y', 'x^2 + 3xy - y^3', 'y')],
    },
    answers: ['2x + 3y', '3x - 3y^2'],
    labelsTex: ['\\frac{\\partial f}{\\partial x}', '\\frac{\\partial f}{\\partial y}'],
  }),
  retrieval(U.threeVariables, '3.2.2', 46, {
    instruction: 'Find ∂f/∂z.',
    problem: 'f(x, y, z) = xye^{z} + z^{2}',
    technique: 'rn-partial',
    difficulty: 1,
    method: 'Hold x and y constant.',
    partial: { variables: ['x', 'y', 'z'], samples: SAMPLES_XYZ, targets: [d('∂f/∂z', 'x y e^z + z^2', 'z')] },
    answers: ['x y e^z + 2z'],
    labelsTex: ['\\frac{\\partial f}{\\partial z}'],
  }),
  retrieval(U.higherOrder, '3.2.3', 47, {
    instruction: 'Find fₓᵧ (differentiate with respect to x first, then y).',
    problem: 'f(x, y) = x^{3}y + xy^{2}',
    technique: 'rn-higher-order',
    difficulty: 2,
    method: 'Find fₓ first, then differentiate it with respect to y.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [d('f_xy', 'x^3 y + x y^2', 'x', 'y')] },
    answers: ['3x^2 + 2y'],
    labelsTex: ['f_{xy}'],
  }),
  retrieval(U.totalDifferential, '3.3', 48, {
    instruction: 'Find the total differential dz. Give the coefficients of dx and dy, separated by a comma.',
    problem: 'z = x^{3} - 2xy',
    technique: 'rn-total-differential',
    difficulty: 1,
    method: 'dz = (∂z/∂x) dx + (∂z/∂y) dy.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [d('coefficient of dx', 'x^3 - 2xy', 'x'), d('coefficient of dy', 'x^3 - 2xy', 'y')],
    },
    answers: ['3x^2 - 2y', '-2x'],
    labelsTex: ['\\frac{\\partial z}{\\partial x}', '\\frac{\\partial z}{\\partial y}'],
    answerTex: 'dz = (3x^{2} - 2y)dx - 2x\\,dy',
  }),
  retrieval(U.chainOne, '3.4', 49, {
    instruction: 'Use the Chain Rule to find dw/dt. You may leave x and y in your answer.',
    problem: 'w = x + y^{2}, \\quad x = t^{2}, \\quad y = \\sin t',
    technique: 'rn-chain-one',
    difficulty: 1,
    method: 'Theorem 3.4.1: one product for each path from w to t.',
    partial: {
      variables: ['t'],
      definitions: { x: 't^2', y: 'sin(t)' },
      samples: [{ t: 0.3 }, { t: 0.8 }, { t: 1.4 }, { t: -0.5 }],
      targets: [d('dw/dt', 'x + y^2', 't')],
    },
    answers: ['2t + 2y cos(t)'],
    labelsTex: ['\\frac{dw}{dt}'],
  }),
  retrieval(U.chainTwo, '3.4', 50, {
    instruction: 'Use the Chain Rule to find ∂w/∂t.',
    problem: 'w = x - y, \\quad x = st, \\quad y = s + t',
    technique: 'rn-chain-two',
    difficulty: 1,
    method: 'Theorem 3.4.2: one product for each path from w to t.',
    partial: {
      variables: ['s', 't'],
      definitions: { x: 's t', y: 's + t' },
      samples: [
        { s: 0.7, t: 1.3 },
        { s: 1.6, t: 0.45 },
        { s: -0.4, t: 2.1 },
      ],
      targets: [d('∂w/∂t', 'x - y', 't')],
    },
    answers: ['s - 1'],
    labelsTex: ['\\frac{\\partial w}{\\partial t}'],
  }),
  retrieval(U.changeVariables, '3.4', 52, {
    instruction: 'Use differentials to find ∂x/∂u.',
    problem: 'u = 2x + y, \\quad v = x - y',
    technique: 'rn-change-variables',
    difficulty: 2,
    method: 'Write du and dv in terms of dx and dy, then solve for dx.',
    partial: {
      variables: ['x', 'y'],
      samples: SAMPLES_XY,
      targets: [
        {
          kind: 'inverse',
          label: '∂x/∂u',
          outputs: ['u', 'v'],
          inputs: ['x', 'y'],
          forward: { u: '2x + y', v: 'x - y' },
          want: 'x',
          wrt: 'u',
        },
      ],
    },
    answers: ['1/3'],
    labelsTex: ['\\frac{\\partial x}{\\partial u}'],
  }),
  retrieval(U.secondOrder, '3.4', 53, {
    instruction: 'With x = r cos θ and y = r sin θ, find ∂w/∂r for w = x² + y². Simplify your answer.',
    problem: 'w = x^{2} + y^{2}, \\quad x = r\\cos\\theta, \\quad y = r\\sin\\theta',
    technique: 'rn-second-order',
    difficulty: 1,
    method: 'w_r = w_x cos θ + w_y sin θ, then use x = r cos θ and y = r sin θ.',
    partial: {
      variables: ['r', 'θ'],
      definitions: { x: 'r cos(theta)', y: 'r sin(theta)' },
      samples: [
        { r: 0.7, θ: 0.4 },
        { r: 1.3, θ: 1.9 },
        { r: 2.1, θ: -0.8 },
      ],
      targets: [d('∂w/∂r', 'x^2 + y^2', 'r')],
    },
    answers: ['2r'],
    labelsTex: ['\\frac{\\partial w}{\\partial r}'],
  }),
];

// -----------------------------------------------------------------------------
// Reflect and recap content
// -----------------------------------------------------------------------------

export interface RnReviewContent {
  /** One mathematical reflection question. */
  reflect: string;
  /** Things learners can name as difficult (chips in the reflection card). */
  difficulties: string[];
  concepts: string[];
  formulas: { tex: string; note?: string }[];
  conditions: string[];
  errors: string[];
}

export const RN_REVIEW: Record<RnUnitId, RnReviewContent> = {
  [U.functions]: {
    reflect:
      'Explain why the domain of a function of two variables is a region of the plane rather than an interval. Use Example 3.1.1(i) to describe one point inside and one point outside its domain.',
    difficulties: ['Square roots', 'Denominators', 'Logarithms', 'Drawing the region'],
    concepts: [
      'A function of two variables assigns one real number $f(x, y)$ to each point $(x, y)$ of its domain.',
      'The domain is the set of points where the formula is defined and real; its graph $z = f(x, y)$ is a surface.',
    ],
    formulas: [{ tex: 'z = f(x, y), \\qquad w = f(x, y, z)' }],
    conditions: [
      'Square roots need a non-negative argument, denominators must not be zero, and logarithms need a positive argument.',
    ],
    errors: [
      'Forgetting a condition: every root, denominator and logarithm in the formula adds one.',
      'Writing $>$ where $\\geq$ is allowed: $\\sqrt{0} = 0$ is defined unless the root is in a denominator.',
    ],
  },
  [U.partials]: {
    reflect:
      'In your own words, what does $f_{x}(a, b)$ measure? Describe the slice of the surface it is the slope of.',
    difficulties: ['Holding y constant', 'The limit definition', 'Product and chain rules', 'Evaluating at a point'],
    concepts: [
      'To find $f_{x}$, hold $y$ constant and differentiate with respect to $x$; to find $f_{y}$, hold $x$ constant.',
      '$f_{x}(a, b)$ is the slope of the slice $y = b$ of the surface at $x = a$.',
    ],
    formulas: [
      { tex: 'f_{x}(x, y) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x, y) - f(x, y)}{\\Delta x}' },
      { tex: 'f_{y}(x, y) = \\lim_{\\Delta y \\to 0} \\frac{f(x, y + \\Delta y) - f(x, y)}{\\Delta y}' },
    ],
    conditions: ['The partial derivative exists at a point when the limit in its definition exists there.'],
    errors: [
      'Differentiating a term that does not contain $x$ as if it did: with $y$ constant, $y^{2}$ has $x$-derivative $0$.',
      'Dropping a constant factor: with $y$ constant, $\\frac{\\partial}{\\partial x}(x^{2}y^{2}) = 2xy^{2}$, not $2x$.',
    ],
  },
  [U.threeVariables]: {
    reflect:
      'For $f(x, y, z)$, explain why finding $\\frac{\\partial f}{\\partial z}$ is the same skill as finding an ordinary derivative.',
    difficulties: ['Which variables are constant', 'Chain rule inside', 'Many variables', 'Evaluating at a point'],
    concepts: [
      'For a function of three or more variables, every variable except one is held constant.',
      'The result is again a function of all the variables.',
    ],
    formulas: [
      {
        tex: '\\frac{\\partial f}{\\partial z} = \\lim_{\\Delta z \\to 0} \\frac{f(x, y, z + \\Delta z) - f(x, y, z)}{\\Delta z}',
      },
    ],
    conditions: ['Only one variable changes at a time; all others are held constant.'],
    errors: [
      'Holding only one of the other variables constant.',
      'Forgetting the inner derivative, e.g. $\\frac{\\partial}{\\partial y}e^{yz} = ze^{yz}$.',
    ],
  },
  [U.higherOrder]: {
    reflect:
      'In the notes’ notation, $f_{xy}$ and $\\frac{\\partial^{2} f}{\\partial y \\partial x}$ mean the same thing. Explain the order of differentiation each notation describes.',
    difficulties: ['Reading the notation', 'Order of differentiation', 'Clairaut’s Theorem', 'Third-order derivatives'],
    concepts: [
      'Second partial derivatives: $f_{xx}$, $f_{yy}$ and the mixed partials $f_{xy}$ and $f_{yx}$.',
      'In the notes, $f_{xy} = (f_{x})_{y} = \\frac{\\partial^{2} f}{\\partial y \\partial x}$: differentiate with respect to $x$ first.',
    ],
    formulas: [
      {
        tex: 'f_{xy} = \\frac{\\partial}{\\partial y}\\left(\\frac{\\partial f}{\\partial x}\\right) = \\frac{\\partial^{2} f}{\\partial y \\partial x}',
      },
      {
        tex: 'f_{yx} = \\frac{\\partial}{\\partial x}\\left(\\frac{\\partial f}{\\partial y}\\right) = \\frac{\\partial^{2} f}{\\partial x \\partial y}',
      },
    ],
    conditions: [
      'Theorem 3.2.1 (Clairaut’s Theorem) states when $f_{xy} = f_{yx}$; read its conditions in §3.2.3. Where they fail, the two mixed partials can differ at a point (Explore: “When the order matters”).',
    ],
    errors: [
      'Reversing the order of the subscripts, or of the denominators in $\\frac{\\partial^{2} f}{\\partial y \\partial x}$.',
      'Assuming $f_{xy} = f_{yx}$ without checking the conditions of the theorem.',
    ],
  },
  [U.totalDifferential]: {
    reflect:
      'Explain why the total differential of $w = f(x, y, z, u)$ in §3.3 has four terms. What does each term contain?',
    difficulties: [
      'Finding each partial derivative',
      'Many variables',
      'Which differential goes with which term',
      'Evaluating at a point',
    ],
    concepts: [
      'The total differential adds one term for each variable: the partial derivative times the differential of that variable.',
      'The differentials of the independent variables are their increments: $dx = \\Delta x$ and $dy = \\Delta y$.',
    ],
    formulas: [
      { tex: 'dz = \\frac{\\partial z}{\\partial x}dx + \\frac{\\partial z}{\\partial y}dy' },
      {
        tex: 'dw = \\frac{\\partial w}{\\partial x}dx + \\frac{\\partial w}{\\partial y}dy + \\frac{\\partial w}{\\partial z}dz + \\frac{\\partial w}{\\partial u}du',
      },
    ],
    conditions: ['$dx = \\Delta x$ and $dy = \\Delta y$ for the independent variables.'],
    errors: [
      'Leaving out a variable’s term.',
      'Writing $dz = f_{x} + f_{y}$: each partial derivative must be multiplied by its own differential.',
    ],
  },
  [U.chainOne]: {
    reflect: 'Using the tree diagram of Figure 3.1, explain why $\\frac{dw}{dt}$ is a sum of two products.',
    difficulties: [
      'Drawing the tree',
      'Partial or ordinary derivatives',
      'Substituting back',
      'Three intermediate variables',
    ],
    concepts: [
      'When $w = f(x, y)$ and $x$, $y$ depend on $t$, $w$ depends on $t$ through both $x$ and $y$.',
      'Each path from $w$ down to $t$ in the tree diagram gives one product of derivatives.',
    ],
    formulas: [
      {
        tex: '\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial w}{\\partial y}\\frac{dy}{dt}',
        note: 'Theorem 3.4.1',
      },
    ],
    conditions: [
      'Theorem 3.4.1 applies when $w$ is a differentiable function of $x$ and $y$, and $x$, $y$ are differentiable functions of $t$.',
    ],
    errors: [
      'Using only one path.',
      'Writing $\\frac{\\partial x}{\\partial t}$ when $x$ depends on $t$ alone: it is the ordinary derivative $\\frac{dx}{dt}$.',
    ],
  },
  [U.chainTwo]: {
    reflect:
      'Explain how the tree diagram (Figure 3.2) tells you which derivatives to multiply for $\\frac{\\partial w}{\\partial s}$.',
    difficulties: ['Which paths end at s', 'Matching edges', 'Three intermediate variables', 'Evaluating at a point'],
    concepts: [
      'With two independent variables, follow every path from $w$ down to the variable you differentiate with respect to.',
      'Each intermediate variable that depends on that variable contributes one product.',
    ],
    formulas: [
      {
        tex: '\\frac{\\partial w}{\\partial s} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial s}',
        note: 'Theorem 3.4.2',
      },
      {
        tex: '\\frac{\\partial w}{\\partial t} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial t} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial t}',
      },
    ],
    conditions: [
      'Theorem 3.4.2 applies when $w$ is differentiable in $x$ and $y$, and $x$, $y$ have first partial derivatives in $s$ and $t$.',
    ],
    errors: [
      'Including a path to the wrong independent variable.',
      'Forgetting a path through a third intermediate variable (as $z$ in Example 3.4.4).',
    ],
  },
  [U.changeVariables]: {
    reflect:
      'In Example 3.4.5, why do the partial derivatives of $x$ and $y$ need $x \\neq y$? Explain using the differentials.',
    difficulties: [
      'Writing the differentials',
      'Solving for dx and dy',
      'Reading off the coefficients',
      'Which variables are independent',
    ],
    concepts: [
      'Take the differentials of the equations that define the new variables.',
      'Solve the resulting linear equations for the differentials you need; the coefficients are the partial derivatives.',
    ],
    formulas: [{ tex: 'du = u_{x}\\,dx + u_{y}\\,dy, \\qquad dv = v_{x}\\,dx + v_{y}\\,dy' }],
    conditions: [
      'The equations can be solved for $dx$ and $dy$ only where the coefficients do not make the system degenerate (in Example 3.4.5, $x \\neq y$).',
    ],
    errors: [
      'Taking reciprocals: $\\frac{\\partial x}{\\partial u}$ is not $1 \\big/ \\frac{\\partial u}{\\partial x}$ in general.',
      'Mixing up which variables are held constant.',
    ],
  },
  [U.secondOrder]: {
    reflect: 'In Example 3.4.7, why must the Chain Rule be applied again to $w_{x}$ and $w_{y}$ when finding $w_{rr}$?',
    difficulties: ['First derivatives in r and θ', 'Differentiating w_x and w_y', 'Collecting terms', 'Mixed partials'],
    concepts: [
      'First derivatives in new coordinates come from the Chain Rule; second derivatives need it again, because $w_{x}$ and $w_{y}$ are functions of $x$ and $y$.',
      'In polar coordinates, $w_{xx} + w_{yy}$ becomes $w_{rr} + \\frac{1}{r}w_{r} + \\frac{1}{r^{2}}w_{\\theta\\theta}$.',
    ],
    formulas: [
      {
        tex: 'w_{r} = w_{x}\\cos\\theta + w_{y}\\sin\\theta, \\qquad w_{\\theta} = -rw_{x}\\sin\\theta + rw_{y}\\cos\\theta',
      },
      { tex: 'w_{xx} + w_{yy} = w_{rr} + \\frac{1}{r}w_{r} + \\frac{1}{r^{2}}w_{\\theta\\theta}' },
    ],
    conditions: ['The second-order formulas use $w_{xy} = w_{yx}$, which needs continuous second partial derivatives.'],
    errors: [
      'Treating $w_{x}$ and $w_{y}$ as constants when differentiating with respect to $r$ or $\\theta$.',
      'Forgetting the product rule on terms such as $-rw_{x}\\sin\\theta$.',
    ],
  },
};

/** The Review recap blocks for a subtopic (before the learner's history). */
export function rnReviewRecap(unitId: RnUnitId): ContentBlock[] {
  const content = RN_REVIEW[unitId];
  const items = RN_RETRIEVAL.filter((i) => i.unitId === unitId);
  return [
    { type: 'summary', title: 'Key concepts', points: content.concepts },
    { type: 'formulaList', title: 'Formulas', items: content.formulas },
    { type: 'summary', title: 'When the results apply', points: content.conditions },
    { type: 'callout', tone: 'caution', title: 'Common errors', text: content.errors.map((e) => `• ${e}`).join('\n') },
    {
      type: 'practiceGroup',
      title: 'App practice: quick retrieval',
      text: 'Written for the app (not from the course notes or tutorials). Recall the method without looking back, then check your answer.',
      items,
    },
  ];
}
