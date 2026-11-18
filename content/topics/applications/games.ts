/**
 * Topic 4 games, one per subtopic. Every scored action is a mathematical
 * decision: build a gradient component by component, assemble a tangent plane
 * and its normal line, decide whether a point is critical, or classify a
 * critical point with d = fxx fyy − [fxy]². Feedback explains every choice.
 * Functions come from the Chapter 4 worked examples or are made for the app;
 * no Tutorial 5 answer is given away. Typed answers are checked by the same
 * engine as My Working (lib/math/partial). Design informed by prior research
 * (evidence.ts); these games have not been evaluated.
 */
import type { Choice, GameDefinition, Round } from '@/lib/games/engine';
import type { PartialSpec, PartialTarget, Point } from '@/lib/math/partial';

import { PDA_TOPIC_ID, PDA_UNITS as U } from './ids';
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
const at = (label: string, f: string, wrt: string[], point: Point): PartialTarget => ({
  kind: 'value',
  label,
  f,
  wrt,
  at: point,
});
const xy = (targets: PartialTarget[]): PartialSpec => ({ variables: ['x', 'y'], samples: SAMPLES_XY, targets });
const xyz = (targets: PartialTarget[]): PartialSpec => ({ variables: ['x', 'y', 'z'], samples: SAMPLES_XYZ, targets });

const SCORING =
  '10 points for a decision right first time, 5 after a retry; a hint costs 3. Mistakes never cost points.';

// =============================================================================
// 1. Gradient Builder (§4.1)
// =============================================================================

const GRADIENT_BUILDER: GameDefinition = {
  id: 'pda-gradient-builder',
  title: 'Gradient Builder',
  unitId: U.gradient,
  topicId: PDA_TOPIC_ID,
  summary: 'Build gradients one component at a time, then evaluate them at a point.',
  tutorial: {
    goal: 'Build ∇f from its components and evaluate it at points.',
    interaction:
      'Choose the right vector, build a gradient stage by stage, match functions to gradients, or type the components.',
    skill: 'The gradient ∇f(x, y) = fx i + fy j, and ∇f(x, y, z) as used in Example 4.1.2 (§4.1).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      'Which vector is $\\nabla f(x, y)$ for $f(x, y) = x^{2}y$?',
      'The i-component is fx (hold y constant); the j-component is fy (hold x constant).',
      [
        c('a', '2xy\\mathbf{i} + x^{2}\\mathbf{j}', true, 'fx = 2xy and fy = x².', true),
        c('b', 'x^{2}\\mathbf{i} + 2xy\\mathbf{j}', false, 'The components are swapped: fx goes with i.', true),
        c('c', '2xy + x^{2}', false, 'The gradient is a vector, not the sum of its components.', true),
        c(
          'd',
          '2x\\mathbf{i} + \\mathbf{j}',
          false,
          'Hold the other variable constant, but keep it as a factor.',
          true,
        ),
      ],
    ),
    {
      kind: 'stages',
      level: 1,
      prompt: 'Build $\\nabla f(2, 0)$ for $f(x, y) = xe^{y}$.',
      hint: 'Differentiate first, then substitute x = 2 and y = 0.',
      stages: [
        {
          label: 'f_x',
          question: 'What is $f_{x}(x, y)$?',
          choices: [
            c('a', 'e^{y}', true, 'With y constant, xe^y is a constant multiple of x.', true),
            c('b', 'xe^{y}', false, 'That is ∂f/∂y.', true),
            c('c', '1', false, 'The factor e^y stays.', true),
          ],
        },
        {
          label: 'f_y',
          question: 'What is $f_{y}(x, y)$?',
          choices: [
            c('a', 'xe^{y}', true, 'With x constant, the derivative of e^y is e^y.', true),
            c('b', 'e^{y}', false, 'The constant factor x stays.', true),
            c('c', '0', false, 'f depends on y through e^y.', true),
          ],
        },
        {
          label: '∇f(2, 0)',
          question: 'So $\\nabla f(2, 0) = $',
          choices: [
            c('a', '\\mathbf{i} + 2\\mathbf{j}', true, 'fx(2, 0) = e⁰ = 1 and fy(2, 0) = 2e⁰ = 2.', true),
            c('b', '2\\mathbf{i} + \\mathbf{j}', false, 'The components are swapped.', true),
            c('c', '\\mathbf{i} + \\mathbf{j}', false, 'fy(2, 0) = x e^y = 2.', true),
          ],
        },
      ],
    },
    {
      kind: 'match',
      level: 2,
      prompt: 'Pair each function with its gradient.',
      hint: 'Find fx and fy for each function.',
      pairs: [
        { id: 'sq', left: { tex: 'x^{2} + y^{2}' }, right: { tex: '2x\\mathbf{i} + 2y\\mathbf{j}' } },
        { id: 'xy', left: { tex: 'xy' }, right: { tex: 'y\\mathbf{i} + x\\mathbf{j}' } },
        {
          id: 'exp',
          left: { tex: 'e^{x}\\sin y' },
          right: { tex: 'e^{x}\\sin y\\,\\mathbf{i} + e^{x}\\cos y\\,\\mathbf{j}' },
        },
        { id: 'ln', left: { tex: '\\ln x + y' }, right: { tex: '\\frac{1}{x}\\mathbf{i} + \\mathbf{j}' } },
      ],
    },
    input(
      2,
      'Type the components of $\\nabla f$ for $f(x, y) = x^{3} + 2xy^{2}$: $f_{x}$, then $f_{y}$.',
      'Hold y constant for fx, then x constant for fy.',
      xy([d('f_x', 'x^3 + 2x y^2', 'x'), d('f_y', 'x^3 + 2x y^2', 'y')]),
      '3x^{2} + 2y^{2}, \\; 4xy',
      'e.g. 3x^2 + 2y^2, 4xy',
    ),
    input(
      2,
      'Type the components of $\\nabla f(1, 1)$ for $f(x, y) = x^{2}y^{3}$.',
      'fx = 2xy³ and fy = 3x²y²; substitute x = 1, y = 1.',
      xy([at('f_x(1, 1)', 'x^2 y^3', ['x'], { x: 1, y: 1 }), at('f_y(1, 1)', 'x^2 y^3', ['y'], { x: 1, y: 1 })]),
      '2, \\; 3',
      'e.g. 2, 3',
    ),
    select(
      3,
      'As in Example 4.1.2, find $\\nabla f(x, y, z)$ for $f(x, y, z) = xyz$.',
      'One component for each variable: fx, fy and fz.',
      [
        c(
          'a',
          'yz\\mathbf{i} + xz\\mathbf{j} + xy\\mathbf{k}',
          true,
          'Hold the other two variables constant each time.',
          true,
        ),
        c('b', 'yz + xz + xy', false, 'The gradient is a vector.', true),
        c(
          'c',
          'x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}',
          false,
          'Each component is a partial derivative of xyz.',
          true,
        ),
      ],
    ),
    select(
      3,
      'The total differential of a function is $dz = (2x + y)\\,dx + x\\,dy$ (§3.3). What is $\\nabla z$?',
      'The coefficients of dx and dy are the first partial derivatives.',
      [
        c(
          'a',
          '(2x + y)\\mathbf{i} + x\\mathbf{j}',
          true,
          'The coefficient of dx is z_x and the coefficient of dy is z_y.',
          true,
        ),
        c('b', 'x\\mathbf{i} + (2x + y)\\mathbf{j}', false, 'The coefficient of dx goes with i.', true),
        c('c', '(2x + y) + x', false, 'The gradient keeps the components separate, as a vector.', true),
      ],
      'The coefficients in a total differential and the components of the gradient are the same first partial derivatives.',
    ),
  ],
};

// =============================================================================
// 2. Plane Builder (§4.2.1)
// =============================================================================

const PLANE_BUILDER: GameDefinition = {
  id: 'pda-plane-builder',
  title: 'Plane Builder',
  unitId: U.tangentPlanes,
  topicId: PDA_TOPIC_ID,
  summary: 'Check the point, find ∇F, assemble the tangent plane, then pick the normal line.',
  tutorial: {
    goal: 'Build tangent planes and normal lines from ∇F at a point.',
    interaction: 'Check that the point is on the surface, write F, then choose each part of the plane and the line.',
    skill:
      'Theorem 4.2.1 and Theorem 4.2.2: the tangent plane is normal to ∇F at P; the normal line has its direction.',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      'Which point lies on the surface $x^{2} + y^{2} + z^{2} = 14$?',
      'Substitute each point: the left side must equal 14.',
      [
        c('a', '(1, 2, 3)', true, '1 + 4 + 9 = 14.'),
        c('b', '(2, 2, 2)', false, '4 + 4 + 4 = 12.'),
        c('c', '(1, 1, 3)', false, '1 + 1 + 9 = 11.'),
        c('d', '(3, 2, 0)', false, '9 + 4 + 0 = 13.'),
      ],
      'A tangent plane is only defined at a point on the surface, so check this first.',
    ),
    select(
      1,
      'Write the surface $z = x^{2} - y$ in the form $F(x, y, z) = 0$, as in §4.2.1.',
      '§4.2.1 uses F(x, y, z) = f(x, y) − z.',
      [
        c('a', 'F(x, y, z) = x^{2} - y - z', true, 'F = f(x, y) − z, so F = 0 is the surface.', true),
        c('b', 'F(x, y, z) = x^{2} - y + z', false, 'F = 0 would then mean z = y − x², a different surface.', true),
        c('c', 'F(x, y, z) = x^{2} - y', false, 'F must involve z, so that F = 0 is the surface.', true),
      ],
    ),
    {
      kind: 'stages',
      level: 2,
      prompt: 'Build the tangent plane to $x^{2} + 2y^{2} + z^{2} = 7$ at $(1, 1, 2)$.',
      hint: 'F = x² + 2y² + z² − 7. Evaluate Fx, Fy, Fz at the point, then use Theorem 4.2.2.',
      stages: [
        {
          label: '∇F(1, 1, 2)',
          question: 'With $\\nabla F = 2x\\mathbf{i} + 4y\\mathbf{j} + 2z\\mathbf{k}$, what is $\\nabla F(1, 1, 2)$?',
          choices: [
            c('a', '2\\mathbf{i} + 4\\mathbf{j} + 4\\mathbf{k}', true, '2(1), 4(1) and 2(2).', true),
            c('b', '2\\mathbf{i} + 2\\mathbf{j} + 4\\mathbf{k}', false, 'Fy = 4y, so Fy(1, 1, 2) = 4.', true),
            c('c', '1\\mathbf{i} + 1\\mathbf{j} + 2\\mathbf{k}', false, 'That is the point, not the gradient.', true),
          ],
        },
        {
          label: 'Theorem 4.2.2',
          question: 'Substitute into Theorem 4.2.2:',
          choices: [
            c(
              'a',
              '2(x - 1) + 4(y - 1) + 4(z - 2) = 0',
              true,
              'Each component multiplies its own (variable − coordinate).',
              true,
            ),
            c('b', '1(x - 2) + 1(y - 4) + 2(z - 4) = 0', false, 'The gradient and the point have been swapped.', true),
            c('c', '2x + 4y + 4z = 0', false, 'The plane must pass through (1, 1, 2).', true),
          ],
        },
        {
          label: 'Simplify',
          question: 'Simplified, the tangent plane is',
          choices: [
            c('a', 'x + 2y + 2z = 7', true, 'Expand to 2x + 4y + 4z − 14 = 0 and divide by 2.', true),
            c('b', 'x + 2y + 2z = 0', false, 'Keep the constant terms: 2 + 4 + 8 = 14.', true),
            c('c', 'x + y + 2z = 6', false, 'Check the coefficient of y.', true),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 2,
      prompt: 'Now the normal line to $x^{2} + 2y^{2} + z^{2} = 7$ at $(1, 1, 2)$.',
      hint: 'The normal line goes through the point in the direction of ∇F there (Theorem 4.2.1).',
      stages: [
        {
          label: 'Direction',
          question: 'Which direction numbers can the normal line use?',
          choices: [
            c('a', '1, 2, 2', true, 'Half of 2, 4, 4: any nonzero multiple of ∇F gives the same line.'),
            c('b', '1, 1, 2', false, 'Those are the coordinates of the point.'),
            c('c', '2, 1, 1', false, 'Not a multiple of 2, 4, 4.'),
          ],
        },
        {
          label: 'Symmetric equations',
          question: 'Its symmetric equations are',
          choices: [
            c(
              'a',
              '\\frac{x - 1}{1} = \\frac{y - 1}{2} = \\frac{z - 2}{2}',
              true,
              'Point (1, 1, 2), direction 1, 2, 2.',
              true,
            ),
            c(
              'b',
              '\\frac{x - 1}{1} = \\frac{y - 2}{1} = \\frac{z - 2}{2}',
              false,
              'Numerators use the point, denominators the direction.',
              true,
            ),
            c('c', 'x + 2y + 2z = 7', false, 'That is the tangent plane.', true),
          ],
        },
      ],
    },
    select(
      3,
      'Which is the tangent plane to $z = x^{2} + y^{2}$ at $(1, 2, 5)$? Use the $z = f(x, y)$ form of §4.2.1.',
      'fx(x₀, y₀)(x − x₀) + fy(x₀, y₀)(y − y₀) − (z − z₀) = 0.',
      [
        c('a', '2(x - 1) + 4(y - 2) - (z - 5) = 0', true, 'fx(1, 2) = 2 and fy(1, 2) = 4.', true),
        c('b', '2(x - 1) + 4(y - 2) + (z - 5) = 0', false, 'The z-term has a minus sign, because F = f − z.', true),
        c('c', '(x - 1) + (y - 2) - (z - 5) = 0', false, 'Use the partial derivatives at the point.', true),
      ],
    ),
    input(
      3,
      'Type $F_{x}$, $F_{y}$ and $F_{z}$ at $(1, 1, 1)$ for the surface $xy + yz + xz = 3$.',
      'F = xy + yz + xz − 3. Fx = y + z, Fy = x + z, Fz = x + y.',
      xyz([
        at('F_x(1, 1, 1)', 'x y + y z + x z - 3', ['x'], { x: 1, y: 1, z: 1 }),
        at('F_y(1, 1, 1)', 'x y + y z + x z - 3', ['y'], { x: 1, y: 1, z: 1 }),
        at('F_z(1, 1, 1)', 'x y + y z + x z - 3', ['z'], { x: 1, y: 1, z: 1 }),
      ]),
      '2, \\; 2, \\; 2',
      'e.g. 2, 2, 2',
      'So the tangent plane is 2(x − 1) + 2(y − 1) + 2(z − 1) = 0, that is x + y + z = 3.',
    ),
  ],
};

// =============================================================================
// 3. Is It Critical? (§4.3.1, opening)
// =============================================================================

const IS_IT_CRITICAL: GameDefinition = {
  id: 'pda-is-it-critical',
  title: 'Is It Critical?',
  unitId: U.criticalPoints,
  topicId: PDA_TOPIC_ID,
  summary: 'Decide whether points are critical, and why: both partials zero, a partial undefined, or neither.',
  tutorial: {
    goal: 'Find and recognise critical points.',
    interaction: 'Choose critical points, select every one, or pair functions with their critical points.',
    skill: 'The Definition of Critical Point and Theorem 4.3.2 (§4.3.1).',
    scoring: SCORING,
  },
  rounds: [
    select(
      1,
      'Which point is a critical point of $f(x, y) = x^{2} + y^{2} - 2x$?',
      'Solve fx = 2x − 2 = 0 and fy = 2y = 0.',
      [
        c('a', '(1, 0)', true, 'fx(1, 0) = 0 and fy(1, 0) = 0.'),
        c('b', '(0, 0)', false, 'fx(0, 0) = −2 ≠ 0.'),
        c('c', '(2, 0)', false, 'fx(2, 0) = 2 ≠ 0.'),
        c('d', '(1, 1)', false, 'fy(1, 1) = 2 ≠ 0.'),
      ],
    ),
    select(
      2,
      'Select every critical point of $f(x, y) = x^{3} - 3x + y^{2}$.',
      'fx = 3x² − 3 = 0 gives x = ±1; fy = 2y = 0 gives y = 0.',
      [
        c('a', '(1, 0)', true, 'Both partial derivatives are 0.'),
        c('b', '(−1, 0)', true, 'Both partial derivatives are 0.'),
        c('c', '(0, 0)', false, 'fx(0, 0) = −3.'),
        c('d', '(1, 1)', false, 'fy(1, 1) = 2.'),
      ],
      undefined,
      true,
    ),
    select(
      2,
      'Is $(0, 0)$ a critical point of $f(x, y) = \\sqrt{x^{2} + y^{2}}$?',
      'fx = x/√(x² + y²). What happens at (0, 0)?',
      [
        c(
          'a',
          'Yes: the partial derivatives do not exist there',
          true,
          'This is the second type of critical point, as in Example 4.3.2.',
        ),
        c(
          'b',
          'Yes: both partial derivatives are 0 there',
          false,
          'At (0, 0) the formula divides by 0: they do not exist.',
        ),
        c(
          'c',
          'No: the partial derivatives are never 0',
          false,
          'Points where they do not exist are critical points too.',
        ),
      ],
    ),
    select(2, 'Where are the critical points of $f(x, y) = x^{2}y$?', 'fx = 2xy and fy = x². When are both 0?', [
      c('a', 'Every point on the y-axis', true, 'fy = x² = 0 needs x = 0, and then fx = 0 for every y.'),
      c('b', 'Only (0, 0)', false, 'Try (0, 5): fx = 0 and fy = 0 there too.'),
      c('c', 'There are none', false, 'Every point with x = 0 makes both partial derivatives 0.'),
    ]),
    select(
      3,
      'By Theorem 4.3.2, if $f$ has a relative maximum at $(a, b)$ on an open region, then …',
      'Read Theorem 4.3.2 and the Definition of Critical Point.',
      [
        c('a', '(a, b) is a critical point of f', true, 'That is exactly what Theorem 4.3.2 says.'),
        c(
          'b',
          'f_x(a, b) = 0 and f_y(a, b) = 0',
          false,
          'Not always: Example 4.3.2 has a maximum where they do not exist.',
        ),
        c('c', '(a, b) is an absolute maximum', false, 'A relative maximum need not be absolute.'),
      ],
    ),
    select(
      3,
      'For $f(x, y) = x^{2} - y^{2}$, the point $(0, 0)$ is critical. Is it a relative extremum?',
      'Compare f(0, 0) = 0 with nearby values along each axis.',
      [
        c(
          'a',
          'No: f takes both larger and smaller values near (0, 0)',
          true,
          'f(h, 0) = h² > 0 and f(0, h) = −h² < 0.',
        ),
        c(
          'b',
          'Yes: every critical point is an extremum',
          false,
          'Critical points are where to look; they need not be extrema.',
        ),
        c('c', 'Yes: a relative minimum', false, 'f(0, h) = −h² < 0 = f(0, 0).'),
      ],
      'Some critical points are saddle points: the next subtopic classifies them.',
    ),
    {
      kind: 'match',
      level: 3,
      prompt: 'Pair each function with its only critical point.',
      hint: 'Set fx = 0 and fy = 0, or look for where they do not exist.',
      pairs: [
        { id: 'a', left: { tex: 'x^{2} + y^{2} - 4x + 2y' }, right: { text: '(2, −1)' } },
        { id: 'b', left: { tex: '(x - 3)^{2} + (y + 1)^{2}' }, right: { text: '(3, −1)' } },
        {
          id: 'c',
          left: { tex: '1 - (x^{2} + y^{2})^{\\frac{1}{3}}' },
          right: { text: '(0, 0), where fx and fy do not exist' },
        },
        { id: 'd', left: { tex: 'xe^{y} - e^{x}' }, right: { text: '(0, 0), where fx = fy = 0' } },
      ],
    },
  ],
};

// =============================================================================
// 4. Classify It (§4.3.1, The Second Partials Test)
// =============================================================================

const CLASSIFY_IT: GameDefinition = {
  id: 'pda-classify-it',
  title: 'Classify It',
  unitId: U.secondPartials,
  topicId: PDA_TOPIC_ID,
  summary: 'Classify critical points with d = fxx fyy − [fxy]²: minimum, maximum, saddle or inconclusive.',
  tutorial: {
    goal: 'Classify critical points with the Second Partials Test.',
    interaction: 'Read the signs of d and fxx, work through a function stage by stage, or type d.',
    skill: 'Theorem 4.3.3: d > 0 and fxx > 0 minimum; d > 0 and fxx < 0 maximum; d < 0 saddle; d = 0 inconclusive.',
    scoring: SCORING,
  },
  rounds: [
    select(1, 'At a critical point, $d = 5$ and $f_{xx} = 2$. The point is …', 'd > 0: look at the sign of fxx.', [
      c('a', 'a relative minimum', true, 'd > 0 and fxx > 0.'),
      c('b', 'a relative maximum', false, 'That needs fxx < 0.'),
      c('c', 'a saddle point', false, 'That needs d < 0.'),
      c('d', 'inconclusive', false, 'That needs d = 0.'),
    ]),
    select(1, 'At a critical point, $d = 3$ and $f_{xx} = -1$. The point is …', 'd > 0: look at the sign of fxx.', [
      c('a', 'a relative maximum', true, 'd > 0 and fxx < 0.'),
      c('b', 'a relative minimum', false, 'That needs fxx > 0.'),
      c('c', 'a saddle point', false, 'That needs d < 0.'),
    ]),
    select(
      2,
      'At a critical point, $d = -4$ and $f_{xx} = 6$. The point is …',
      'When d < 0, does the sign of fxx matter?',
      [
        c('a', 'a saddle point', true, 'd < 0 gives a saddle point whatever the sign of fxx.'),
        c('b', 'a relative minimum', false, 'fxx > 0 only decides when d > 0.'),
        c('c', 'inconclusive', false, 'That needs d = 0.'),
      ],
    ),
    select(2, 'At a critical point, $d = 0$. Theorem 4.3.3 says …', 'Read item 4 of the theorem.', [
      c('a', 'the test is inconclusive', true, 'The test gives no conclusion when d = 0.'),
      c('b', 'the point is a saddle point', false, 'That needs d < 0.'),
      c('c', 'the point is not critical', false, 'It is critical; the test just does not classify it.'),
    ]),
    {
      kind: 'match',
      level: 2,
      prompt: 'Pair each set of second partial derivatives (at a critical point) with its type.',
      hint: 'Compute d = fxx fyy − fxy² first.',
      pairs: [
        {
          id: 'min',
          left: { tex: 'f_{xx} = 2,\\; f_{yy} = 3,\\; f_{xy} = 1' },
          right: { text: 'Relative minimum (d = 5)' },
        },
        {
          id: 'max',
          left: { tex: 'f_{xx} = -4,\\; f_{yy} = -1,\\; f_{xy} = 1' },
          right: { text: 'Relative maximum (d = 3)' },
        },
        {
          id: 'saddle',
          left: { tex: 'f_{xx} = 1,\\; f_{yy} = -2,\\; f_{xy} = 0' },
          right: { text: 'Saddle point (d = −2)' },
        },
        {
          id: 'none',
          left: { tex: 'f_{xx} = 2,\\; f_{yy} = 2,\\; f_{xy} = 2' },
          right: { text: 'Inconclusive (d = 0)' },
        },
      ],
    },
    {
      kind: 'stages',
      level: 3,
      prompt: 'Classify the critical point of $f(x, y) = x^{2} + xy + y^{2} - 3x$.',
      hint: 'fx = 2x + y − 3 and fy = x + 2y.',
      stages: [
        {
          label: 'Critical point',
          question: 'Solving $f_{x} = 0$ and $f_{y} = 0$ gives',
          choices: [
            c('a', '(2, −1)', true, 'From fy = 0, x = −2y; then −4y + y − 3 = 0 gives y = −1, x = 2.'),
            c('b', '(1, 1)', false, 'fx(1, 1) = 0 but fy(1, 1) = 3.'),
            c('c', '(3/2, 0)', false, 'fy(3/2, 0) = 3/2 ≠ 0.'),
          ],
        },
        {
          label: 'd',
          question: 'With $f_{xx} = 2$, $f_{yy} = 2$, $f_{xy} = 1$: $d = $',
          choices: [
            c('a', '3', true, '2 · 2 − 1² = 3.'),
            c('b', '5', false, 'Subtract fxy², do not add it.'),
            c('c', '4', false, 'Remember the −fxy² term.'),
          ],
        },
        {
          label: 'Type',
          question: 'So $(2, -1)$ is',
          choices: [
            c('a', 'a relative minimum', true, 'd = 3 > 0 and fxx = 2 > 0.'),
            c('b', 'a relative maximum', false, 'fxx > 0.'),
            c('c', 'a saddle point', false, 'd > 0.'),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 3,
      prompt:
        'For $f(x, y) = x^{3} - 3xy + 3y^{2}$, the critical points are $(0, 0)$ and $\\left(\\frac{1}{2}, \\frac{1}{4}\\right)$, with $f_{xx} = 6x$, $f_{yy} = 6$, $f_{xy} = -3$.',
      hint: 'Evaluate d at each point separately.',
      stages: [
        {
          label: '(0, 0)',
          question: 'At $(0, 0)$: $d = 0 \\cdot 6 - 9 = -9$. The point is',
          choices: [
            c('a', 'a saddle point', true, 'd < 0.'),
            c('b', 'a relative minimum', false, 'd < 0 means a saddle point.'),
            c('c', 'inconclusive', false, 'd = −9, not 0.'),
          ],
        },
        {
          label: '(1/2, 1/4)',
          question:
            'At $\\left(\\frac{1}{2}, \\frac{1}{4}\\right)$: $d = 3 \\cdot 6 - 9 = 9$ and $f_{xx} = 3$. The point is',
          choices: [
            c('a', 'a relative minimum', true, 'd > 0 and fxx > 0.'),
            c('b', 'a relative maximum', false, 'fxx > 0.'),
            c('c', 'a saddle point', false, 'd > 0.'),
          ],
        },
      ],
    },
    input(
      3,
      'Type $d$ at $(0, 0)$ for $f(x, y) = 3x^{2} + 2xy - y^{2}$.',
      'fxx = 6, fyy = −2, fxy = 2.',
      xy([{ kind: 'number', label: 'd at (0, 0)', value: -16 }]),
      '-16',
      'e.g. 5',
      'd = 6(−2) − 2² = −16 < 0, so (0, 0) is a saddle point.',
    ),
  ],
};

export const PDA_GAMES: GameDefinition[] = [GRADIENT_BUILDER, PLANE_BUILDER, IS_IT_CRITICAL, CLASSIFY_IT];
