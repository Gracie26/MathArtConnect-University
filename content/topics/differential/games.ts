/**
 * Topic 3 games, one per subtopic. Every scored action is a mathematical
 * decision: choose a point in a domain, read the sign of a slice, build a
 * chain-rule product, solve differentials, or type a partial derivative that
 * is checked by the same engine as My Working (lib/math/partial). Feedback
 * explains every choice. Functions come from the Chapter 3 worked examples
 * or are made for the app; no tutorial answer is given away. Design informed
 * by prior research (evidence.ts); these games have not been evaluated.
 */
import type { Choice, GameDefinition, Round } from '@/lib/games/engine';
import type { PartialSpec, PartialTarget } from '@/lib/math/partial';

import { RN_TOPIC_ID, RN_UNITS as U } from './ids';
import { SAMPLES_XY, SAMPLES_XYZ } from './practice';

const c = (id: string, label: string, correct: boolean, feedback: string, tex = false): Choice =>
  tex ? { id, tex: label, correct, feedback } : { id, text: label, correct, feedback };

const select = (
  level: number,
  prompt: string,
  hint: string,
  choices: Choice[],
  explanation?: string,
  multiple = false,
): Round => ({
  kind: 'select',
  level,
  prompt,
  hint,
  choices,
  ...(multiple ? { multiple: true } : {}),
  ...(explanation ? { explanation } : {}),
});

const input = (
  level: number,
  prompt: string,
  hint: string,
  partial: PartialSpec,
  answerTex: string,
  placeholder: string,
  explanation?: string,
): Round => ({
  kind: 'input',
  level,
  prompt,
  hint,
  check: { partial },
  answerTex,
  placeholder,
  ...(explanation ? { explanation } : {}),
});

const d = (label: string, f: string, ...wrt: string[]): PartialTarget => ({ kind: 'derivative', label, f, wrt });
const xy = (targets: PartialTarget[]): PartialSpec => ({ variables: ['x', 'y'], samples: SAMPLES_XY, targets });
const xyz = (targets: PartialTarget[]): PartialSpec => ({ variables: ['x', 'y', 'z'], samples: SAMPLES_XYZ, targets });
const T_SAMPLES = [{ t: 0.3 }, { t: 0.8 }, { t: 1.3 }, { t: -0.6 }, { t: 0.55 }];
const ST_SAMPLES = [
  { s: 0.7, t: 1.3 },
  { s: 1.6, t: 0.45 },
  { s: -0.35, t: 2.2 },
  { s: 1.2, t: -0.9 },
];

const SCORING =
  '10 points for a decision right first time, 5 after a retry; a hint costs 3. Mistakes never cost points.';

// =============================================================================
// 1. Domain Detective (§3.1)
// =============================================================================

const DOMAIN_DETECTIVE: GameDefinition = {
  id: 'rn-domain-detective',
  title: 'Domain Detective',
  unitId: U.functions,
  topicId: RN_TOPIC_ID,
  summary: 'Decide where functions of two and three variables are defined, condition by condition.',
  tutorial: {
    goal: 'Find which points belong to the domain of each function, and why.',
    interaction:
      'Choose a point or a description, pair functions with their domains, or answer one condition at a time.',
    skill: 'The domain of a function of several variables: the points where the formula is defined and real (§3.1).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      'Which point is in the domain of $f(x, y) = \\sqrt{x - y}$?',
      'A square root needs a non-negative number inside.',
      [
        c('a', '(1, 3)', false, 'Here x − y = −2 < 0, so the square root is not real.'),
        c('b', '(3, 1)', true, 'x − y = 2 ≥ 0, so f(3, 1) = √2.'),
        c('c', '(0, 2)', false, 'x − y = −2 < 0.'),
        c('d', '(−1, 0)', false, 'x − y = −1 < 0.'),
      ],
    ),
    select(1, 'At which point is $f(x, y) = \\ln(xy)$ defined?', 'A logarithm needs a positive argument: xy > 0.', [
      c('a', '(2, −1)', false, 'xy = −2 < 0.'),
      c('b', '(0, 5)', false, 'xy = 0, and ln 0 is not defined.'),
      c('c', '(−1, 4)', false, 'xy = −4 < 0.'),
      c('d', '(−2, −3)', true, 'xy = 6 > 0: two negative numbers have a positive product.'),
    ]),
    {
      kind: 'match',
      level: 2,
      prompt: 'Pair each function with its domain.',
      hint: 'For each formula, list what it needs: a non-negative square root, a non-zero denominator, a positive logarithm.',
      pairs: [
        {
          id: 'disc',
          left: { tex: '\\sqrt{1 - x^{2} - y^{2}}' },
          right: { text: 'The closed disc $x^{2} + y^{2} \\leq 1$' },
        },
        { id: 'line', left: { tex: '\\frac{1}{x - y}' }, right: { text: 'Every point off the line $y = x$' } },
        {
          id: 'parabola',
          left: { tex: '\\ln(y - x^{2})' },
          right: { text: 'The points above the parabola $y = x^{2}$' },
        },
        {
          id: 'example',
          left: { tex: '\\frac{\\sqrt{x^{2} + y^{2} - 9}}{x}' },
          right: { text: 'On or outside the circle $x^{2} + y^{2} = 9$, with $x \\neq 0$' },
        },
      ],
      explanation:
        'The last function is Example 3.1.1(i): the root needs $x^{2} + y^{2} \\geq 9$ and the division needs $x \\neq 0$.',
    },
    select(
      2,
      'Select every point where $g(x, y, z) = \\frac{x}{\\sqrt{9 - x^{2} - y^{2} - z^{2}}}$ (Example 3.1.1(ii)) is defined.',
      'The square root must be real and must not be zero, because it is in the denominator: x² + y² + z² < 9.',
      [
        c('a', '(0, 0, 0)', true, '9 − 0 = 9 > 0.'),
        c('b', '(1, 2, 2)', false, 'x² + y² + z² = 9, so the denominator is 0.'),
        c('c', '(2, 1, 1)', true, '9 − 6 = 3 > 0.'),
        c('d', '(3, 0, 0)', false, 'The denominator is √0 = 0.'),
        c('e', '(0, 0, −2.9)', true, '9 − 8.41 = 0.59 > 0.'),
      ],
      'The domain is the inside of the sphere $x^{2} + y^{2} + z^{2} = 9$, without the sphere itself.',
      true,
    ),
    {
      kind: 'stages',
      level: 3,
      prompt: 'Find the domain of $f(x, y) = \\frac{\\sqrt{y - x}}{\\ln x}$, one condition at a time.',
      hint: 'Three parts of the formula each need a condition: the root, the logarithm and the division.',
      stages: [
        {
          label: 'The square root',
          question: 'What does $\\sqrt{y - x}$ need?',
          choices: [
            c('a', 'y − x > 0', false, 'The square root of 0 is defined, so equality is allowed.'),
            c('b', 'y − x ≥ 0', true, 'A square root needs a non-negative number.'),
            c('c', 'y ≥ 0', false, 'It is y − x, not y, that must be non-negative.'),
          ],
        },
        {
          label: 'The logarithm',
          question: 'What does $\\ln x$ need?',
          choices: [
            c('a', 'x ≠ 0', false, 'ln x is not defined for negative x either.'),
            c('b', 'x ≥ 0', false, 'ln 0 is not defined.'),
            c('c', 'x > 0', true, 'A logarithm needs a positive argument.'),
          ],
        },
        {
          label: 'The division',
          question: 'What does dividing by $\\ln x$ need?',
          choices: [
            c('a', 'x ≠ 1', true, 'ln x = 0 exactly when x = 1.'),
            c('b', 'x ≠ 0', false, 'x = 0 is already excluded, and ln x is not 0 there.'),
            c('c', 'y ≠ x', false, 'y = x makes the numerator 0, which is allowed.'),
          ],
        },
      ],
      explanation: 'The domain is $\\{(x, y) : y \\geq x, \\; x > 0, \\; x \\neq 1\\}$.',
    },
    select(
      3,
      'Which point is NOT in the domain of $f(x, y) = \\frac{\\sqrt{x^{2} + y^{2} - 9}}{x}$?',
      'Check both conditions: x² + y² ≥ 9 and x ≠ 0.',
      [
        c('a', '(3, 0)', false, 'x² + y² − 9 = 0, so the root is 0, and x = 3 ≠ 0: f(3, 0) = 0.'),
        c('b', '(−4, 1)', false, '16 + 1 − 9 = 8 ≥ 0 and x ≠ 0.'),
        c('c', '(0, 4)', true, 'x = 0, so the formula divides by zero.'),
        c('d', '(2, 3)', false, '4 + 9 − 9 = 4 ≥ 0 and x ≠ 0.'),
      ],
    ),
  ],
};

// =============================================================================
// 2. Slice Slopes (§3.2.1)
// =============================================================================

const SLICE_SLOPES: GameDefinition = {
  id: 'rn-slice-slopes',
  title: 'Slice Slopes',
  unitId: U.partials,
  topicId: RN_TOPIC_ID,
  summary: 'Hold one variable constant, read the slope of the slice, and find partial derivatives.',
  tutorial: {
    goal: 'Find and interpret first partial derivatives of functions of two variables.',
    interaction:
      'Type a partial derivative (it is checked at several points), choose a value or a sign, or pair functions with derivatives.',
    skill: 'Partial derivatives as ordinary derivatives with the other variable held constant (§3.2.1).',
    scoring: SCORING,
  },
  rounds: [
    input(
      1,
      'Find $f_{x}$ for $f(x, y) = x^{3}y^{2} - 4xy$.',
      'Treat y as a constant number.',
      xy([d('f_x', 'x^3 y^2 - 4xy', 'x')]),
      'f_{x} = 3x^{2}y^{2} - 4y',
      'e.g. 3x^2 y^2 - 4y',
    ),
    input(
      1,
      'Find $f_{y}$ for $f(x, y) = e^{2x}\\sin y$.',
      'With x constant, e^{2x} is a constant factor.',
      xy([d('f_y', 'e^(2x) sin(y)', 'y')]),
      'f_{y} = e^{2x}\\cos y',
      'e.g. e^(2x) cos(y)',
    ),
    select(
      2,
      'Holding $y = 1$, the slice of $f(x, y) = x^{2}y - 3xy^{2}$ is $z = x^{2} - 3x$. What is $f_{x}(2, 1)$, the slope of this slice at $x = 2$?',
      'Differentiate x² − 3x and put x = 2.',
      [
        c('a', '−2', false, 'That is the height f(2, 1) = 4 − 6, not the slope.'),
        c('b', '1', true, 'f_x = 2xy − 3y², so f_x(2, 1) = 4 − 3 = 1.'),
        c('c', '−8', false, 'That is f_y(2, 1) = x² − 6xy, the slope in the y-direction.'),
        c('d', '4', false, 'The term −3xy² also depends on x: its x-derivative is −3y².'),
      ],
    ),
    select(
      2,
      'For $f(x, y) = 4 - x^{2} - 2y^{2}$, is the slice in the $y$-direction rising or falling at $(1, -1)$?',
      'Find f_y and its sign at the point.',
      [
        c('a', 'Rising', true, 'f_y = −4y, so f_y(1, −1) = 4 > 0: z increases as y increases.'),
        c('b', 'Falling', false, 'That is the x-direction: f_x(1, −1) = −2 < 0.'),
        c('c', 'Flat', false, 'f_y(1, −1) = 4, not 0.'),
      ],
    ),
    {
      kind: 'match',
      level: 2,
      prompt: 'Pair each function with its partial derivative with respect to $y$.',
      hint: 'Hold x constant in each one.',
      pairs: [
        { id: 'power', left: { tex: 'x^{2}y^{3}' }, right: { tex: '3x^{2}y^{2}' } },
        { id: 'exp', left: { tex: 'xe^{y}' }, right: { tex: 'xe^{y}' } },
        { id: 'sin', left: { tex: '\\sin(xy)' }, right: { tex: 'x\\cos(xy)' } },
        { id: 'ln', left: { tex: '\\ln(x + y^{2})' }, right: { tex: '\\frac{2y}{x + y^{2}}' } },
      ],
    },
    input(
      3,
      'For $f(x, y) = xe^{xy}$, find $f_{x}(1, 2)$.',
      'Product rule in x: f_x = e^{xy} + xy e^{xy}. Then put x = 1, y = 2.',
      xy([{ kind: 'value', label: 'f_x(1, 2)', f: 'x e^(xy)', wrt: ['x'], at: { x: 1, y: 2 } }]),
      'f_{x}(1, 2) = e^{2} + 2e^{2} = 3e^{2}',
      'e.g. 3e^2',
    ),
  ],
};

// =============================================================================
// 3. Hold-Two Relay (§3.2.2)
// =============================================================================

const HOLD_TWO_RELAY: GameDefinition = {
  id: 'rn-hold-two-relay',
  title: 'Hold-Two Relay',
  unitId: U.threeVariables,
  topicId: RN_TOPIC_ID,
  summary: 'Pass the derivative along: hold two variables still and differentiate in the third.',
  tutorial: {
    goal: 'Find partial derivatives of functions of three or more variables.',
    interaction:
      'Choose which variables are held constant, type derivatives, match functions with derivatives, or work through a chain of decisions.',
    skill: 'Partial derivatives of functions of three or more variables (§3.2.2).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      'To find $\\frac{\\partial f}{\\partial y}$ for $f(x, y, z)$, which variables are held constant?',
      'Every variable except the one you differentiate with respect to.',
      [
        c('a', 'Only x', false, 'z must be held constant too.'),
        c('b', 'Only z', false, 'x must be held constant too.'),
        c('c', 'Both x and z', true, 'All the other variables are held constant.'),
        c('d', 'None of them', false, 'Then it would not be a partial derivative.'),
      ],
    ),
    input(
      1,
      'Find $\\frac{\\partial f}{\\partial z}$ for $f(x, y, z) = x^{2}yz^{3}$.',
      'x²y is a constant factor.',
      xyz([d('∂f/∂z', 'x^2 y z^3', 'z')]),
      '\\frac{\\partial f}{\\partial z} = 3x^{2}yz^{2}',
      'e.g. 3x^2 y z^2',
    ),
    input(
      2,
      'Find $\\frac{\\partial f}{\\partial y}$ for $f(x, y, z) = xe^{yz}$.',
      'Chain rule: the derivative of yz with respect to y is z.',
      xyz([d('∂f/∂y', 'x e^(yz)', 'y')]),
      '\\frac{\\partial f}{\\partial y} = xze^{yz}',
      'e.g. x z e^(yz)',
    ),
    {
      kind: 'match',
      level: 2,
      prompt: 'For $f(x, y, z) = xy^{2}z^{3}$, pair each partial derivative with its value.',
      hint: 'Hold the other two variables constant each time.',
      pairs: [
        { id: 'x', left: { tex: 'f_{x}' }, right: { tex: 'y^{2}z^{3}' } },
        { id: 'y', left: { tex: 'f_{y}' }, right: { tex: '2xyz^{3}' } },
        { id: 'z', left: { tex: 'f_{z}' }, right: { tex: '3xy^{2}z^{2}' } },
      ],
    },
    {
      kind: 'stages',
      level: 3,
      prompt:
        'Find $\\frac{\\partial f}{\\partial w}$ for $f(x, y, z, w) = \\frac{x + y + z}{w}$ (as in Example 3.2.3(iii)).',
      hint: 'With x, y and z constant, the numerator is a constant.',
      stages: [
        {
          label: 'Hold constant',
          question: 'Which variables are constant?',
          choices: [
            c('a', 'x, y and z', true, 'Everything except w.'),
            c('b', 'Only w', false, 'w is the variable you differentiate with respect to.'),
          ],
        },
        {
          label: 'Rewrite',
          question: 'How can $f$ be written to differentiate in $w$?',
          choices: [
            c('a', '(x + y + z) − w', false, 'Dividing by w is not subtracting w.'),
            c('b', '(x + y + z) w⁻¹', true, 'A constant times w⁻¹.'),
            c('c', '(x + y + z) w', false, 'Dividing by w is multiplying by w⁻¹, not by w.'),
          ],
        },
        {
          label: 'Differentiate',
          question: 'So $\\frac{\\partial f}{\\partial w}$ is',
          choices: [
            c('a', '\\frac{1}{w}', false, 'That is the partial derivative with respect to x, y or z.', true),
            c('b', '0', false, 'f does change with w.', true),
            c('c', '-\\frac{x + y + z}{w^{2}}', true, 'The derivative of w⁻¹ is −w⁻².', true),
          ],
        },
      ],
    },
    select(
      3,
      'For $f(x, y, z) = \\ln(x^{2} + y^{2} + z^{2})$, which partial derivative is largest at $(1, 2, 3)$?',
      'f_x = 2x/(x² + y² + z²), and similarly for y and z.',
      [
        c('a', 'f_x', false, 'f_x(1, 2, 3) = 2/14, the smallest.'),
        c('b', 'f_z', true, 'f_z(1, 2, 3) = 6/14: the same denominator, and the largest numerator.'),
        c('c', 'f_y', false, 'f_y(1, 2, 3) = 4/14.'),
        c('d', 'They are equal', false, 'The numerators 2x, 2y and 2z differ at this point.'),
      ],
    ),
  ],
};

// =============================================================================
// 4. Order Matters? (§3.2.3)
// =============================================================================

const ORDER_MATTERS: GameDefinition = {
  id: 'rn-order-matters',
  title: 'Order Matters?',
  unitId: U.higherOrder,
  topicId: RN_TOPIC_ID,
  summary: 'Read the notation for higher-order partial derivatives correctly, then compute them.',
  tutorial: {
    goal: 'Use the notation of §3.2.3 and compute second and mixed partial derivatives.',
    interaction: 'Choose what a notation means, type derivatives, and compute both mixed partials step by step.',
    skill: 'Higher-order partial derivatives and their notation (§3.2.3).',
    scoring: SCORING,
  },
  rounds: [
    select(1, 'In the notes, what does $f_{xy}$ mean?', 'Read the subscripts from left to right (§3.2.3).', [
      c('a', 'Differentiate with respect to x first, then y', true, 'f_xy = (f_x)_y = ∂/∂y(∂f/∂x).'),
      c('b', 'Differentiate with respect to y first, then x', false, 'That is f_yx.'),
      c('c', 'Multiply f_x by f_y', false, 'Subscripts mean differentiation, not multiplication.'),
    ]),
    select(
      1,
      'In the notes’ notation, which expression is the same as $f_{xy}$?',
      'The derivative taken first is written nearest to f.',
      [
        c(
          'a',
          '\\frac{\\partial^{2} f}{\\partial x \\partial y}',
          false,
          'In the notes this is f_yx: ∂/∂x(∂f/∂y).',
          true,
        ),
        c('b', '\\frac{\\partial^{2} f}{\\partial x^{2}}', false, 'That differentiates twice with respect to x.', true),
        c('c', '\\frac{\\partial^{2} f}{\\partial y \\partial x}', true, 'f_xy = ∂/∂y(∂f/∂x) = ∂²f/∂y∂x.', true),
      ],
    ),
    input(
      2,
      'Find $f_{xy}$ for $f(x, y) = x^{3}y^{2} + 2xy$.',
      'First f_x = 3x²y² + 2y, then differentiate with respect to y.',
      xy([d('f_xy', 'x^3 y^2 + 2xy', 'x', 'y')]),
      'f_{xy} = 6x^{2}y + 2',
      'e.g. 6x^2 y + 2',
    ),
    input(
      2,
      'Find $f_{yy}$ for $f(x, y) = e^{x}\\sin y$.',
      'Differentiate twice with respect to y.',
      xy([d('f_yy', 'e^x sin(y)', 'y', 'y')]),
      'f_{yy} = -e^{x}\\sin y',
      'e.g. -e^x sin(y)',
    ),
    {
      kind: 'stages',
      level: 3,
      prompt: 'For $f(x, y) = x^{2}y^{3}$, compute both mixed partial derivatives.',
      hint: 'Keep the order: f_xy starts with f_x, f_yx starts with f_y.',
      stages: [
        {
          label: 'First in x',
          question: '$f_{x}$ is',
          choices: [
            c('a', '2xy^{3}', true, 'y³ is a constant factor.', true),
            c('b', '3x^{2}y^{2}', false, 'That is f_y.', true),
          ],
        },
        {
          label: 'Then in y',
          question: '$f_{xy} = (f_{x})_{y}$ is',
          choices: [
            c('a', '2xy^{3}', false, 'You still need to differentiate with respect to y.', true),
            c('b', '6xy^{2}', true, 'The derivative of 2xy³ with respect to y.', true),
          ],
        },
        {
          label: 'The other order',
          question: '$f_{yx} = (f_{y})_{x}$, with $f_{y} = 3x^{2}y^{2}$, is',
          choices: [
            c('a', '6x^{2}y', false, 'That differentiates 3x²y² with respect to y again.', true),
            c('b', '3x^{2}y^{2}', false, 'You still need to differentiate with respect to x.', true),
            c('c', '6xy^{2}', true, 'The same as f_xy, as Theorem 3.2.1 says for such a function.', true),
          ],
        },
      ],
    },
    input(
      3,
      'Find $f_{xz}$ for $f(x, y, z) = x^{2}yz^{3}$.',
      'f_x = 2xyz³; then differentiate with respect to z.',
      xyz([d('f_xz', 'x^2 y z^3', 'x', 'z')]),
      'f_{xz} = 6xyz^{2}',
      'e.g. 6x y z^2',
    ),
  ],
};

// =============================================================================
// 5. Differential Builder (§3.3)
// =============================================================================

const DIFFERENTIAL_BUILDER: GameDefinition = {
  id: 'rn-differential-builder',
  title: 'Differential Builder',
  unitId: U.totalDifferential,
  topicId: RN_TOPIC_ID,
  summary: 'Build total differentials term by term, one term for each variable.',
  tutorial: {
    goal: 'Write total differentials and evaluate them, as in §3.3 and Example 3.3.1.',
    interaction:
      'Type the coefficients of the differentials, choose values of dz and dw, and match functions with their differentials.',
    skill: 'The total differential dz = f_x dx + f_y dy, and dw for three or more variables (§3.3).',
    scoring: SCORING,
  },
  rounds: [
    input(
      1,
      'Find $dz$ for $z = x^{2}y$. Give the coefficients of $dx$ and $dy$, separated by a comma.',
      'The coefficient of dx is ∂z/∂x; the coefficient of dy is ∂z/∂y.',
      xy([d('coefficient of dx', 'x^2 y', 'x'), d('coefficient of dy', 'x^2 y', 'y')]),
      'dz = 2xy\\,dx + x^{2}\\,dy',
      'e.g. 2xy, x^2',
    ),
    select(
      2,
      'For $z = x^{2}y$ at $(2, 1)$ with $dx = 0.1$ and $dy = -0.2$, what is $dz$?',
      'dz = 2xy dx + x² dy with x = 2, y = 1.',
      [
        c('a', '−0.8', false, 'That is only the dy term, x² dy = 4(−0.2). Add the dx term as well.'),
        c('b', '0.4', false, 'That is only the dx term, 2xy dx = 4(0.1). Add the dy term as well.'),
        c('c', '−0.4', true, 'dz = 2xy dx + x² dy = 4(0.1) + 4(−0.2) = −0.4.'),
        c('d', '1.2', false, 'Check the sign of dy: dy = −0.2.'),
      ],
    ),
    select(
      2,
      'In §3.3, $w = f(x, y, z, u)$. How many terms does the total differential $dw$ have?',
      'One term for each independent variable.',
      [
        c('a', '2', false, 'That is the number of terms for z = f(x, y).'),
        c('b', '3', false, 'w depends on four variables: x, y, z and u.'),
        c('c', '4', true, 'dw = w_x dx + w_y dy + w_z dz + w_u du: one term for each variable.'),
      ],
    ),
    input(
      2,
      'Find $dw$ for $w = xyz$. Give the coefficients of $dx$, $dy$ and $dz$, in order.',
      'One term for each variable.',
      xyz([d('coefficient of dx', 'xyz', 'x'), d('coefficient of dy', 'xyz', 'y'), d('coefficient of dz', 'xyz', 'z')]),
      'dw = yz\\,dx + xz\\,dy + xy\\,dz',
      'e.g. yz, xz, xy',
    ),
    select(
      3,
      'For $w = x^{2} + y^{2} + z^{2}$ (Example 3.3.1(ii)) at $(1, 2, -1)$, with $dx = 0.1$, $dy = 0.2$ and $dz = 0.3$, what is $dw$?',
      'dw = 2x dx + 2y dy + 2z dz. Watch the sign of z.',
      [
        c('a', '1.6', false, 'At z = −1 the coefficient 2z is −2, so the dz term is −0.6.'),
        c('b', '0.4', true, 'dw = 2(1)(0.1) + 2(2)(0.2) + 2(−1)(0.3) = 0.2 + 0.8 − 0.6 = 0.4.'),
        c('c', '0.2', false, 'The coefficients are 2x, 2y and 2z, not x, y and z.'),
      ],
    ),
    {
      kind: 'match',
      level: 2,
      prompt: 'Pair each function with its total differential.',
      hint: 'Find both partial derivatives of each function.',
      pairs: [
        { id: 'sin', left: { tex: 'z = \\sin(xy)' }, right: { tex: 'y\\cos(xy)\\,dx + x\\cos(xy)\\,dy' } },
        { id: 'quot', left: { tex: 'z = \\frac{x}{y}' }, right: { tex: '\\frac{1}{y}\\,dx - \\frac{x}{y^{2}}\\,dy' } },
        { id: 'exp', left: { tex: 'z = e^{x + 2y}' }, right: { tex: 'e^{x + 2y}\\,dx + 2e^{x + 2y}\\,dy' } },
      ],
    },
  ],
};

// =============================================================================
// 6. Path Finder (§3.4, one independent variable)
// =============================================================================

const PATH_FINDER: GameDefinition = {
  id: 'rn-path-finder',
  title: 'Path Finder',
  unitId: U.chainOne,
  topicId: RN_TOPIC_ID,
  summary: 'Follow every path of the tree diagram from w down to t, and add the products.',
  tutorial: {
    goal: 'Use Theorem 3.4.1 to find dw/dt when w depends on t through intermediate variables.',
    interaction: 'Count paths, put the steps in order, type dw/dt (checked at several values of t), and choose values.',
    skill: 'The Chain Rule with one independent variable (§3.4, Theorem 3.4.1, Figure 3.1).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      '$w = f(x, y)$ with $x = x(t)$ and $y = y(t)$. How many paths lead from $w$ to $t$ in the tree diagram?',
      'Look at Figure 3.1.',
      [
        c('a', '1', false, 'w depends on t through x and through y.'),
        c('b', '2', true, 'One path through x and one through y: two products.'),
        c('c', '4', false, 'Each intermediate variable gives one path.'),
      ],
    ),
    {
      kind: 'order',
      level: 2,
      prompt: 'Put the steps in order to find $\\frac{dw}{dt}$ for $w = xy$, $x = \\cos t$, $y = \\sin t$.',
      hint: 'Partial derivatives of w first, then derivatives of x and y, then combine.',
      cards: [
        { id: '1', text: 'Find $\\frac{\\partial w}{\\partial x} = y$ and $\\frac{\\partial w}{\\partial y} = x$' },
        { id: '2', text: 'Find $\\frac{dx}{dt} = -\\sin t$ and $\\frac{dy}{dt} = \\cos t$' },
        { id: '3', text: 'Multiply along each path and add: $y(-\\sin t) + x\\cos t$' },
        { id: '4', text: 'Substitute $x = \\cos t$, $y = \\sin t$: $\\cos^{2} t - \\sin^{2} t$' },
      ],
      distractors: [
        {
          id: 'x',
          text: 'Differentiate $w = xy$ with respect to $t$, treating $x$ and $y$ as constants',
          why: 'x and y depend on t, so they are not constants.',
        },
      ],
    },
    input(
      2,
      'Find $\\frac{dw}{dt}$ for $w = x^{2} + y^{2}$, $x = t^{2}$, $y = 3t$. You may leave $x$ and $y$ in your answer.',
      'dw/dt = 2x · dx/dt + 2y · dy/dt.',
      {
        variables: ['t'],
        definitions: { x: 't^2', y: '3t' },
        samples: T_SAMPLES,
        targets: [d('dw/dt', 'x^2 + y^2', 't')],
      },
      '\\frac{dw}{dt} = 2x(2t) + 2y(3) = 4t^{3} + 18t',
      'e.g. 2x(2t) + 2y(3)',
    ),
    select(
      2,
      'For $w = xe^{y}$, $x = 1 + t$, $y = t^{2}$, what is $\\frac{dw}{dt}$ at $t = 0$?',
      'dw/dt = e^y · 1 + x e^y · 2t; at t = 0, x = 1 and y = 0.',
      [
        c('a', '0', false, 'The path through x gives e⁰ · 1 = 1.'),
        c('b', '2', false, 'The path through y is x e^y · 2t = 0 at t = 0.'),
        c('c', 'e', false, 'At t = 0, y = 0, so e^y = 1.'),
        c('d', '1', true, 'Path through x: 1; path through y: 0. Sum: 1.'),
      ],
    ),
    input(
      3,
      'Find $\\frac{dw}{dt}$ for $w = xy + z$, $x = \\cos t$, $y = \\sin t$, $z = t^{2}$.',
      'Three intermediate variables give three paths.',
      {
        variables: ['t'],
        definitions: { x: 'cos(t)', y: 'sin(t)', z: 't^2' },
        samples: T_SAMPLES,
        targets: [d('dw/dt', 'xy + z', 't')],
      },
      '\\frac{dw}{dt} = y(-\\sin t) + x\\cos t + 2t',
      'e.g. y(-sin(t)) + x cos(t) + 2t',
    ),
    select(
      3,
      'Example 3.4.1 ($w = x^{2}y - y^{2}$, $x = \\sin t$, $y = e^{t}$) gives $\\frac{dw}{dt} = -2$ at $t = 0$. Which path contributes 0 there?',
      'At t = 0, x = 0 and y = 1. Evaluate each product.',
      [
        c('a', 'The path through x', true, '(2xy)(cos t) = 0 at t = 0, because x = sin 0 = 0.'),
        c('b', 'The path through y', false, '(x² − 2y)(e^t) = −2 at t = 0: all of the −2 comes from this path.'),
        c('c', 'Neither', false, 'One product is 0.'),
      ],
    ),
  ],
};

// =============================================================================
// 7. Tree Builder (§3.4, two independent variables)
// =============================================================================

const TREE_BUILDER: GameDefinition = {
  id: 'rn-tree-builder',
  title: 'Tree Builder',
  unitId: U.chainTwo,
  topicId: RN_TOPIC_ID,
  summary: 'Build ∂w/∂s and ∂w/∂t from the paths of a tree diagram.',
  tutorial: {
    goal: 'Use Theorem 3.4.2 when the intermediate variables depend on two independent variables.',
    interaction:
      'Count products, match edges with derivatives, type partial derivatives (checked at several points), and build Example 3.4.4 step by step.',
    skill: 'The Chain Rule with two or more independent variables (§3.4, Theorem 3.4.2, Figure 3.2).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      '$w = f(x, y)$ with $x = x(s, t)$ and $y = y(s, t)$. How many products are in $\\frac{\\partial w}{\\partial s}$?',
      'Count the paths from w down to s in Figure 3.2.',
      [
        c('a', '4', false, 'Only the paths that end at s count.'),
        c('b', '1', false, 'Both x and y depend on s.'),
        c('c', '2', true, 'One path through x and one through y.'),
      ],
    ),
    {
      kind: 'match',
      level: 2,
      prompt: 'For $w = x^{2} + y^{2}$, $x = s + t$, $y = s - t$, pair each edge of the tree with its derivative.',
      hint: 'Each edge is the derivative of the upper variable with respect to the lower one.',
      pairs: [
        { id: 'wx', left: { tex: '\\frac{\\partial w}{\\partial x}' }, right: { tex: '2x' } },
        { id: 'wy', left: { tex: '\\frac{\\partial w}{\\partial y}' }, right: { tex: '2y' } },
        { id: 'xs', left: { tex: '\\frac{\\partial x}{\\partial s}' }, right: { tex: '1' } },
        { id: 'yt', left: { tex: '\\frac{\\partial y}{\\partial t}' }, right: { tex: '-1' } },
      ],
    },
    input(
      2,
      'Find $\\frac{\\partial w}{\\partial s}$ for $w = xy$, $x = s + t$, $y = s - t$. You may leave $x$ and $y$ in your answer.',
      'Two paths: (∂w/∂x)(∂x/∂s) + (∂w/∂y)(∂y/∂s).',
      {
        variables: ['s', 't'],
        definitions: { x: 's + t', y: 's - t' },
        samples: ST_SAMPLES,
        targets: [d('∂w/∂s', 'xy', 's')],
      },
      '\\frac{\\partial w}{\\partial s} = y(1) + x(1) = 2s',
      'e.g. y + x',
    ),
    {
      kind: 'stages',
      level: 3,
      prompt:
        'Build $\\frac{\\partial w}{\\partial s}$ for Example 3.4.4: $w = xy + yz + xz$, $x = s\\cos t$, $y = s\\sin t$, $z = t$.',
      hint: 'z = t does not depend on s.',
      stages: [
        {
          label: 'Paths',
          question: 'How many paths lead from $w$ to $s$?',
          choices: [
            c('a', '3', false, 'z = t does not depend on s, so there is no path through z.'),
            c('b', '2', true, 'Through x and through y.'),
          ],
        },
        {
          label: 'Lower edges',
          question: '$\\frac{\\partial x}{\\partial s}$ and $\\frac{\\partial y}{\\partial s}$ are',
          choices: [
            c('a', '\\cos t \\text{ and } \\sin t', true, 'Hold t constant.', true),
            c('b', '-s\\sin t \\text{ and } s\\cos t', false, 'Those are the derivatives with respect to t.', true),
          ],
        },
        {
          label: 'Combine',
          question: 'With $\\frac{\\partial w}{\\partial x} = y + z$ and $\\frac{\\partial w}{\\partial y} = x + z$:',
          choices: [
            c(
              'a',
              '(y + z)\\sin t + (x + z)\\cos t',
              false,
              'Each upper edge goes with the lower edge on the same path.',
              true,
            ),
            c(
              'b',
              '(y + z)\\cos t + (x + z)\\sin t',
              true,
              'Path through x: (y + z)cos t; path through y: (x + z)sin t.',
              true,
            ),
          ],
        },
      ],
      explanation: 'Example 3.4.4 then evaluates this at $s = 1$, $t = 2\\pi$.',
    },
    input(
      3,
      'Find $\\frac{\\partial w}{\\partial t}$ for $w = x^{2}y$, $x = st$, $y = s + t$.',
      'Two paths: (2xy)(s) + (x²)(1).',
      {
        variables: ['s', 't'],
        definitions: { x: 's t', y: 's + t' },
        samples: ST_SAMPLES,
        targets: [d('∂w/∂t', 'x^2 y', 't')],
      },
      '\\frac{\\partial w}{\\partial t} = 2xy(s) + x^{2}(1)',
      'e.g. 2xy s + x^2',
    ),
    select(
      2,
      'Three intermediate variables $x$, $y$, $z$ each depend on $s$ and $t$. How many products are in $\\frac{\\partial w}{\\partial t}$?',
      'One product for each path that ends at t.',
      [
        c('a', '3', true, 'One path through each intermediate variable.'),
        c('b', '6', false, 'That counts the paths to s as well.'),
        c('c', '2', false, 'There are three intermediate variables, so three paths.'),
      ],
    ),
  ],
};

// =============================================================================
// 8. Differential Solver (§3.4, changing variables)
// =============================================================================

const DIFFERENTIAL_SOLVER: GameDefinition = {
  id: 'rn-differential-solver',
  title: 'Differential Solver',
  unitId: U.changeVariables,
  topicId: RN_TOPIC_ID,
  summary: 'Write the differentials of a change of variables and solve them for the inverse partial derivatives.',
  tutorial: {
    goal: 'Use differentials to find partial derivatives of an inverse change of variables, as in Examples 3.4.5 and 3.4.6.',
    interaction:
      'Choose the differentials, solve step by step, and type inverse partial derivatives (checked at several points).',
    skill: 'Changing variables with differentials (§3.4).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      'For $u = x + y$ and $v = xy$ (Example 3.4.5), the differentials are',
      'Take the total differential of each equation.',
      [
        c('a', 'du = dx + dy, \\quad dv = dx\\,dy', false, 'dv is a sum of terms, one for each variable.', true),
        c(
          'b',
          'du = dx + dy, \\quad dv = y\\,dx + x\\,dy',
          true,
          'dv = v_x dx + v_y dy with v_x = y and v_y = x.',
          true,
        ),
        c('c', 'du = dx\\,dy, \\quad dv = y\\,dx + x\\,dy', false, 'du = u_x dx + u_y dy = dx + dy.', true),
      ],
    ),
    {
      kind: 'stages',
      level: 2,
      prompt: 'Polar coordinates: $x = r\\cos\\theta$, $y = r\\sin\\theta$. Find $\\frac{\\partial r}{\\partial x}$.',
      hint: 'Write dx and dy, then combine them to remove dθ.',
      stages: [
        {
          label: 'Differentials',
          question: 'The differentials are',
          choices: [
            c(
              'a',
              'dx = \\cos\\theta\\,dr - r\\sin\\theta\\,d\\theta, \\; dy = \\sin\\theta\\,dr + r\\cos\\theta\\,d\\theta',
              true,
              'Total differentials in r and θ.',
              true,
            ),
            c('b', 'dx = \\cos\\theta\\,dr, \\; dy = \\sin\\theta\\,dr', false, 'x and y also change with θ.', true),
          ],
        },
        {
          label: 'Eliminate dθ',
          question: 'Multiply $dx$ by $\\cos\\theta$, $dy$ by $\\sin\\theta$ and add:',
          choices: [
            c(
              'a',
              '\\cos\\theta\\,dx + \\sin\\theta\\,dy = r\\,d\\theta',
              false,
              'The dθ terms cancel; dr remains.',
              true,
            ),
            c(
              'b',
              '\\cos\\theta\\,dx + \\sin\\theta\\,dy = dr',
              true,
              'cos²θ + sin²θ = 1 and the dθ terms cancel.',
              true,
            ),
          ],
        },
        {
          label: 'Read off',
          question: 'So $\\frac{\\partial r}{\\partial x}$ is',
          choices: [
            c('a', '\\cos\\theta', true, 'The coefficient of dx.', true),
            c(
              'b',
              '\\frac{1}{\\cos\\theta}',
              false,
              'Partial derivatives of the inverse are not reciprocals here.',
              true,
            ),
          ],
        },
      ],
    },
    input(
      2,
      'For $u = x + y$ and $v = x - y$, find $\\frac{\\partial x}{\\partial u}$.',
      'du = dx + dy and dv = dx − dy. Add them and solve for dx.',
      {
        variables: ['x', 'y'],
        samples: SAMPLES_XY,
        targets: [
          {
            kind: 'inverse',
            label: '∂x/∂u',
            outputs: ['u', 'v'],
            inputs: ['x', 'y'],
            forward: { u: 'x + y', v: 'x - y' },
            want: 'x',
            wrt: 'u',
          },
        ],
      },
      '\\frac{\\partial x}{\\partial u} = \\frac{1}{2}',
      'e.g. 1/2',
    ),
    input(
      3,
      'For $u = x^{2} - y^{2}$ and $v = 2xy$, find $\\frac{\\partial x}{\\partial u}$ in terms of $x$ and $y$.',
      'du = 2x dx − 2y dy, dv = 2y dx + 2x dy. Eliminate dy.',
      {
        variables: ['x', 'y'],
        samples: SAMPLES_XY,
        targets: [
          {
            kind: 'inverse',
            label: '∂x/∂u',
            outputs: ['u', 'v'],
            inputs: ['x', 'y'],
            forward: { u: 'x^2 - y^2', v: '2xy' },
            want: 'x',
            wrt: 'u',
          },
        ],
      },
      '\\frac{\\partial x}{\\partial u} = \\frac{x}{2(x^{2} + y^{2})}',
      'e.g. x/(2(x^2 + y^2))',
    ),
    select(2, 'In Example 3.4.5, why must $x \\neq y$?', 'Look at the denominators in the result.', [
      c('a', 'Because u would be 0', false, 'u = x + y, not x − y.'),
      c('b', 'Because v would be negative', false, 'The sign of v does not matter here.'),
      c(
        'c',
        'Because solving the differentials divides by x − y',
        true,
        '(x − y)dx = x du − dv: dividing by x − y needs x ≠ y.',
      ),
    ]),
    select(
      3,
      'For polar coordinates, $\\frac{\\partial \\theta}{\\partial x}$ is',
      'Eliminate dr instead: −sin θ dx + cos θ dy = r dθ.',
      [
        c('a', '-r\\sin\\theta', false, 'That is ∂x/∂θ, the derivative in the other direction.', true),
        c('b', '-\\frac{\\sin\\theta}{r}', true, 'From r dθ = −sin θ dx + cos θ dy.', true),
        c('c', '\\frac{\\cos\\theta}{r}', false, 'That is ∂θ/∂y.', true),
      ],
    ),
  ],
};

// =============================================================================
// 9. Polar Converter (§3.4, second-order chain rule)
// =============================================================================

const POLAR_CONVERTER: GameDefinition = {
  id: 'rn-polar-converter',
  title: 'Polar Converter',
  unitId: U.secondOrder,
  topicId: RN_TOPIC_ID,
  summary: 'Rewrite first and second derivatives in polar coordinates, as in Example 3.4.7.',
  tutorial: {
    goal: 'Use the Chain Rule twice to change variables in second derivatives.',
    interaction:
      'Choose the first derivatives, order the steps for w_rr, compute a polar Laplacian, and type a second derivative.',
    skill: 'The second-order Chain Rule and coordinate changes (§3.4, Example 3.4.7).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      'With $x = r\\cos\\theta$, $y = r\\sin\\theta$, what is $w_{r}$?',
      'Theorem 3.4.2 with ∂x/∂r = cos θ and ∂y/∂r = sin θ.',
      [
        c('a', 'w_{x}\\cos\\theta + w_{y}\\sin\\theta', true, 'One product for each path to r.', true),
        c('b', 'w_{x}\\sin\\theta + w_{y}\\cos\\theta', false, 'The cosine goes with x = r cos θ.', true),
        c('c', '-rw_{x}\\sin\\theta + rw_{y}\\cos\\theta', false, 'That is w_θ.', true),
      ],
    ),
    select(1, 'And $w_{\\theta}$ is', '∂x/∂θ = −r sin θ and ∂y/∂θ = r cos θ.', [
      c('a', 'w_{x}\\cos\\theta + w_{y}\\sin\\theta', false, 'That is w_r.', true),
      c('b', '-rw_{x}\\sin\\theta + rw_{y}\\cos\\theta', true, 'One product for each path to θ.', true),
      c(
        'c',
        '-w_{x}\\sin\\theta + w_{y}\\cos\\theta',
        false,
        'Each term needs the factor r from ∂x/∂θ and ∂y/∂θ.',
        true,
      ),
    ]),
    {
      kind: 'order',
      level: 2,
      prompt: 'Put the steps of finding $w_{rr}$ in order (Example 3.4.7).',
      hint: 'w_x and w_y are themselves functions of x and y.',
      cards: [
        { id: '1', text: 'Start from $w_{r} = w_{x}\\cos\\theta + w_{y}\\sin\\theta$' },
        { id: '2', text: 'Differentiate with respect to $r$; $\\cos\\theta$ and $\\sin\\theta$ are constants' },
        {
          id: '3',
          text: 'Use the Chain Rule on $w_{x}$ and $w_{y}$: $(w_{x})_{r} = w_{xx}\\cos\\theta + w_{xy}\\sin\\theta$',
        },
        {
          id: '4',
          text: 'Collect: $w_{rr} = w_{xx}\\cos^{2}\\theta + 2w_{xy}\\sin\\theta\\cos\\theta + w_{yy}\\sin^{2}\\theta$',
        },
      ],
      distractors: [
        {
          id: 'x',
          text: 'Treat $w_{x}$ and $w_{y}$ as constants, so $w_{rr} = 0$',
          why: 'w_x and w_y depend on x and y, which depend on r.',
        },
      ],
    },
    select(
      2,
      'For $w = x^{2} + y^{2} = r^{2}$, what is $w_{rr} + \\frac{1}{r}w_{r} + \\frac{1}{r^{2}}w_{\\theta\\theta}$?',
      'w = r²: w_r = 2r, w_rr = 2, w_θθ = 0.',
      [
        c('a', '2', false, 'Add the term (1/r)w_r = 2 as well.'),
        c('b', '2r', false, 'w_rr = 2 does not depend on r.'),
        c('c', '0', false, 'Only w_θθ is 0.'),
        c('d', '4', true, '2 + 2 + 0 = 4, the same as w_xx + w_yy = 2 + 2.'),
      ],
    ),
    input(
      3,
      'In polar coordinates $w = x^{2} - y^{2}$ is $w = r^{2}\\cos 2\\theta$. Find $w_{\\theta\\theta}$.',
      'Differentiate twice with respect to θ, holding r constant.',
      {
        variables: ['r', 'θ'],
        samples: [
          { r: 0.7, θ: 0.4 },
          { r: 1.3, θ: 1.9 },
          { r: 2.1, θ: -0.8 },
        ],
        targets: [d('w_θθ', 'r^2 cos(2theta)', 'θ', 'θ')],
      },
      'w_{\\theta\\theta} = -4r^{2}\\cos 2\\theta',
      'e.g. -4r^2 cos(2theta)',
    ),
    select(
      3,
      'Which term of the polar form is there because the circles of the polar grid curve?',
      'Compare with the Cartesian form, which has no first derivatives.',
      [
        c('a', 'w_{rr}', false, 'It corresponds to the straight radial direction.', true),
        c(
          'b',
          '\\frac{1}{r}w_{r}',
          true,
          'A first-derivative term appears because the θ-direction turns as you move.',
          true,
        ),
        c(
          'c',
          '\\frac{1}{r^{2}}w_{\\theta\\theta}',
          false,
          'This is the second derivative along the circle, scaled by its radius.',
          true,
        ),
      ],
    ),
  ],
};

export const RN_GAMES: GameDefinition[] = [
  DOMAIN_DETECTIVE,
  SLICE_SLOPES,
  HOLD_TWO_RELAY,
  ORDER_MATTERS,
  DIFFERENTIAL_BUILDER,
  PATH_FINDER,
  TREE_BUILDER,
  DIFFERENTIAL_SOLVER,
  POLAR_CONVERTER,
];
