/**
 * Tutorial 4 "Differential Calculus in ℝⁿ Part 2" (07 September 2026): all
 * 41 parts, transcribed exactly as printed (checked against the page images).
 *
 * Placement (approved specification; subtopics 6–9 all come from §3.4):
 *   Q1, Q2, Q6, Q8(c)                → §3.2.3 Higher-Order Partial Derivatives
 *   Q7, Q8(a)(b)                     → §3.2.1 Partial Derivatives (Advanced tutorial practice, MR3-T5)
 *   Q11–Q16                          → §3.4   Chain Rule: One Independent Variable
 *   Q3–Q5, Q9, Q10, Q17–Q23          → §3.4   Chain Rule: Two or More Independent Variables
 *   Q35                              → §3.4   Changing Variables with Differentials
 *   Q24–Q34, Q36, Q37                → §3.4   Second-Order Chain Rule and Coordinate Changes
 *
 * "Show that" identities for an arbitrary function f are written My Working:
 * they cannot be checked by evaluating expressions, so they are never
 * auto-graded. No answer key exists (MR3-T8): all working is app guidance.
 */
import type { PracticeItem } from '../../types';
import type { PartialTarget, Point } from '@/lib/math/partial';

import { RN_UNITS as U, type RnUnitId } from './ids';
import { d, num, type RnPracticeSpec, rnItem, SAMPLES_XY, SAMPLES_XYZ } from './practice';
import { TUT4 } from './sources';

function part(
  question: number,
  sub: string | null,
  page: number,
  section: '3-2-1' | '3-2-3' | '3-4',
  unitId: RnUnitId,
  spec: RnPracticeSpec,
): PracticeItem {
  const q = `Q${question}`;
  const item = sub ? `${q}(${sub})` : q;
  return rnItem(
    {
      id: `tut4-q${question}${sub ? `-${sub}` : ''}`,
      sourceType: 'tutorial-question',
      source: { document: TUT4, item, page },
      sourceQuestion: q,
      ...(sub ? { sourceSubquestion: sub } : {}),
      sourceSection: section,
      unitId,
    },
    spec,
  );
}

const WRITTEN_XY = { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [] };

/** A "show that" question: written My Working with app-written suggested working. */
function showThat(
  question: number,
  page: number,
  unitId: RnUnitId,
  spec: Pick<RnPracticeSpec, 'instruction' | 'problem' | 'condition' | 'technique' | 'difficulty' | 'method'> & {
    steps: [string, string?][];
    answerTex?: string;
  },
): PracticeItem {
  return part(question, null, page, '3-4', unitId, {
    ...spec,
    partial: WRITTEN_XY,
    grading: 'written',
    // The suggested conclusion: the last line of working that has a formula.
    answerTex: spec.answerTex ?? [...spec.steps].reverse().find(([, tex]) => tex)?.[1] ?? '',
  });
}

const PD = (top: string, bottom: string) => `\\frac{\\partial ${top}}{\\partial ${bottom}}`;
const PD2 = (top: string, a: string, b?: string) =>
  b
    ? `\\frac{\\partial^{2} ${top}}{\\partial ${a} \\partial ${b}}`
    : `\\frac{\\partial^{2} ${top}}{\\partial ${a}^{2}}`;

// -----------------------------------------------------------------------------
// Q1, Q2, Q6: second partial derivatives (§3.2.3)
// -----------------------------------------------------------------------------

const R2 = '(x^2 + y^2 + z^2)';
const Q1_F = `1/sqrt${R2}`;

const q1 = part(1, null, 1, '3-2-3', U.higherOrder, {
  instruction: 'Let f(x, y, z) = 1/√(x² + y² + z²). Show that fₓₓ + fᵧᵧ + f_zz = 0.',
  problem: 'f(x, y, z) = \\frac{1}{\\sqrt{x^{2} + y^{2} + z^{2}}}',
  technique: 'rn-higher-order',
  difficulty: 2,
  method:
    'Write f = (x² + y² + z²)^(−1/2). Find fₓ and fₓₓ, then use the symmetry of f to write down fᵧᵧ and f_zz. The three second derivatives are checked; showing that their sum is 0 is yours to write.',
  partial: {
    variables: ['x', 'y', 'z'],
    samples: SAMPLES_XYZ,
    targets: [d('fₓₓ', Q1_F, 'x', 'x'), d('fᵧᵧ', Q1_F, 'y', 'y'), d('f_zz', Q1_F, 'z', 'z')],
  },
  grading: 'partial',
  answers: [`(2x^2 - y^2 - z^2)/${R2}^(5/2)`, `(2y^2 - x^2 - z^2)/${R2}^(5/2)`, `(2z^2 - x^2 - y^2)/${R2}^(5/2)`],
  labelsTex: ['f_{xx}', 'f_{yy}', 'f_{zz}'],
  steps: [
    [
      'With $r^{2} = x^{2} + y^{2} + z^{2}$, $f = (x^{2} + y^{2} + z^{2})^{-1/2}$, so',
      'f_{x} = -x(x^{2} + y^{2} + z^{2})^{-3/2}',
    ],
    [
      'Product rule:',
      'f_{xx} = -(x^{2} + y^{2} + z^{2})^{-3/2} + 3x^{2}(x^{2} + y^{2} + z^{2})^{-5/2} = \\frac{2x^{2} - y^{2} - z^{2}}{(x^{2} + y^{2} + z^{2})^{5/2}}',
    ],
    [
      'By symmetry:',
      'f_{yy} = \\frac{2y^{2} - x^{2} - z^{2}}{(x^{2} + y^{2} + z^{2})^{5/2}}, \\qquad f_{zz} = \\frac{2z^{2} - x^{2} - y^{2}}{(x^{2} + y^{2} + z^{2})^{5/2}}',
    ],
    ['Adding, the numerators cancel:', 'f_{xx} + f_{yy} + f_{zz} = \\frac{0}{(x^{2} + y^{2} + z^{2})^{5/2}} = 0'],
  ],
  answerTex: 'f_{xx} + f_{yy} + f_{zz} = 0',
});

const Q2_F = '(x^2 - y^2)/sqrt(x^2 + y^2)';
const q2 = part(2, null, 1, '3-2-3', U.higherOrder, {
  instruction: 'Given f(x, y) = (x² − y²)/√(x² + y²). Show that ∂²f/∂x² + ∂²f/∂y² = −3f/(x² + y²).',
  problem: 'f(x, y) = \\frac{x^{2} - y^{2}}{\\sqrt{x^{2} + y^{2}}}',
  technique: 'rn-higher-order',
  difficulty: 3,
  method:
    'Write f = (x² − y²)(x² + y²)^(−1/2) and use the product rule twice. The two second derivatives are checked; the final identity is yours to write.',
  partial: {
    variables: ['x', 'y'],
    samples: SAMPLES_XY,
    targets: [d('∂²f/∂x²', Q2_F, 'x', 'x'), d('∂²f/∂y²', Q2_F, 'y', 'y')],
  },
  grading: 'partial',
  answers: ['3y^2(y^2 - x^2)/(x^2 + y^2)^(5/2)', '3x^2(y^2 - x^2)/(x^2 + y^2)^(5/2)'],
  labelsTex: [PD2('f', 'x'), PD2('f', 'y')],
  steps: [
    [
      'Product rule with respect to $x$:',
      '\\frac{\\partial f}{\\partial x} = 2x(x^{2} + y^{2})^{-1/2} - x(x^{2} - y^{2})(x^{2} + y^{2})^{-3/2} = \\frac{x^{3} + 3xy^{2}}{(x^{2} + y^{2})^{3/2}}',
    ],
    ['Differentiate again and simplify:', `${PD2('f', 'x')} = \\frac{3y^{2}(y^{2} - x^{2})}{(x^{2} + y^{2})^{5/2}}`],
    ['In the same way:', `${PD2('f', 'y')} = \\frac{3x^{2}(y^{2} - x^{2})}{(x^{2} + y^{2})^{5/2}}`],
    [
      'Add:',
      `${PD2('f', 'x')} + ${PD2('f', 'y')} = \\frac{3(y^{2} - x^{2})(x^{2} + y^{2})}{(x^{2} + y^{2})^{5/2}} = \\frac{-3(x^{2} - y^{2})}{(x^{2} + y^{2})^{3/2}} = \\frac{-3f}{x^{2} + y^{2}}`,
    ],
  ],
  answerTex: `${PD2('f', 'x')} + ${PD2('f', 'y')} = \\frac{-3f}{x^{2} + y^{2}}`,
});

const q6 = part(6, null, 1, '3-2-3', U.higherOrder, {
  instruction:
    'Given z = xᶜ e^(−y/x) where c is a constant. Determine the value of c such that z satisfies the partial differential equation ∂z/∂x = y ∂²z/∂y² + ∂z/∂y.',
  problem:
    'z = x^{c}e^{-y/x}, \\qquad \\frac{\\partial z}{\\partial x} = y\\frac{\\partial^{2} z}{\\partial y^{2}} + \\frac{\\partial z}{\\partial y}',
  technique: 'rn-higher-order',
  difficulty: 3,
  method:
    'Find ∂z/∂x, ∂z/∂y and ∂²z/∂y², substitute them into the equation, and compare both sides. The value of c is checked.',
  partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [num('c', -1)] },
  grading: 'partial',
  answers: ['-1'],
  labelsTex: ['c'],
  steps: [
    [
      'Differentiate:',
      '\\frac{\\partial z}{\\partial x} = cx^{c - 1}e^{-y/x} + yx^{c - 2}e^{-y/x}, \\quad \\frac{\\partial z}{\\partial y} = -x^{c - 1}e^{-y/x}, \\quad \\frac{\\partial^{2} z}{\\partial y^{2}} = x^{c - 2}e^{-y/x}',
    ],
    ['Substitute into the equation and divide by $e^{-y/x}$:', 'cx^{c - 1} + yx^{c - 2} = yx^{c - 2} - x^{c - 1}'],
    ['So $cx^{c - 1} = -x^{c - 1}$ for all $x$, which gives', 'c = -1'],
  ],
  answerTex: 'c = -1',
});

// -----------------------------------------------------------------------------
// Q7, Q8: piecewise functions at (0, 0): Advanced tutorial practice (MR3-T5)
// -----------------------------------------------------------------------------

const AT_ORIGIN = 'for $(x, y) \\neq (0, 0)$, and $f(0, 0) = 0$.';
const ORIGIN_DEFINITION =
  'f_{x}(0, 0) = \\lim_{h \\to 0} \\frac{f(h, 0) - f(0, 0)}{h}, \\qquad f_{y}(0, 0) = \\lim_{h \\to 0} \\frac{f(0, h) - f(0, 0)}{h}';

const q7 = (
  [
    [
      'i',
      'f(x, y) = \\frac{3x^{2}y}{x^{4} + y^{2}}',
      'f(h, 0) = \\frac{0}{h^{4}} = 0, \\qquad f(0, h) = \\frac{0}{h^{2}} = 0',
    ],
    [
      'ii',
      'f(x, y) = \\frac{2x^{2}y^{2}}{x^{4} + y^{4}}',
      'f(h, 0) = \\frac{0}{h^{4}} = 0, \\qquad f(0, h) = \\frac{0}{h^{4}} = 0',
    ],
  ] as const
).map(([sub, problem, values]) =>
  part(7, sub, 1, '3-2-1', U.partials, {
    instruction: 'Show that fₓ(0, 0) and fᵧ(0, 0) exist for the following function.',
    problem,
    condition: AT_ORIGIN,
    technique: 'rn-limit-definition',
    difficulty: 3,
    method:
      'At (0, 0) the formula does not apply, so use the definition of the partial derivative with f(0, 0) = 0. The two values are checked; the argument that the limits exist is yours to write.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [num('fₓ(0, 0)', 0), num('fᵧ(0, 0)', 0)] },
    grading: 'partial',
    advanced: true,
    reviewIds: ['MR3-T5'],
    before: [
      ['Use the definition at the origin:', ORIGIN_DEFINITION],
      ['Along the axes the function is zero:', values],
      ['So both difference quotients are $0$ for every $h \\neq 0$, and both limits exist:'],
    ],
    answers: ['0', '0'],
    labelsTex: ['f_{x}(0, 0)', 'f_{y}(0, 0)'],
  }),
);

const Q8_F = 'xy(x^2 - y^2)/(x^2 + y^2)';
const Q8_TEX = 'f(x, y) = xy\\left(\\frac{x^{2} - y^{2}}{x^{2} + y^{2}}\\right)';
const q8 = [
  part(8, 'a', 1, '3-2-1', U.partials, {
    instruction: 'Find fₓ(0, 0) and fᵧ(0, 0).',
    problem: Q8_TEX,
    condition: AT_ORIGIN,
    technique: 'rn-limit-definition',
    difficulty: 3,
    method: 'Use the definition of the partial derivative at (0, 0) with f(0, 0) = 0.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [num('fₓ(0, 0)', 0), num('fᵧ(0, 0)', 0)] },
    grading: 'partial',
    advanced: true,
    reviewIds: ['MR3-T5'],
    before: [
      ['Use the definition at the origin:', ORIGIN_DEFINITION],
      ['Along the axes:', 'f(h, 0) = 0, \\qquad f(0, h) = 0'],
    ],
    answers: ['0', '0'],
    labelsTex: ['f_{x}(0, 0)', 'f_{y}(0, 0)'],
  }),
  part(8, 'b', 1, '3-2-1', U.partials, {
    instruction: 'Compute fₓ(x, y) and fᵧ(x, y) where (x, y) ≠ (0, 0).',
    problem: Q8_TEX,
    condition: AT_ORIGIN,
    technique: 'rn-partial',
    difficulty: 3,
    method: 'Write f = (x³y − xy³)/(x² + y²) and use the quotient rule.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [d('fₓ', Q8_F, 'x'), d('fᵧ', Q8_F, 'y')] },
    advanced: true,
    reviewIds: ['MR3-T5'],
    before: [
      ['Write $f = \\frac{x^{3}y - xy^{3}}{x^{2} + y^{2}}$ and use the quotient rule, then simplify the numerator:'],
    ],
    answers: ['y(x^4 + 4x^2 y^2 - y^4)/(x^2 + y^2)^2', 'x(x^4 - 4x^2 y^2 - y^4)/(x^2 + y^2)^2'],
    labelsTex: ['f_{x}(x, y)', 'f_{y}(x, y)'],
  }),
  part(8, 'c', 2, '3-2-3', U.higherOrder, {
    instruction: 'Find fₓᵧ(0, 0) and fᵧₓ(0, 0) and verify that fₓᵧ(0, 0) ≠ fᵧₓ(0, 0).',
    problem: Q8_TEX,
    condition: AT_ORIGIN,
    technique: 'rn-higher-order',
    difficulty: 3,
    method:
      'In the notes, fₓᵧ = ∂/∂y(fₓ): use the definition at (0, 0) on fₓ from part (b) (with fₓ(0, 0) = 0), and similarly fᵧₓ = ∂/∂x(fᵧ). The two values are checked; the comparison is yours to write.',
    partial: { variables: ['x', 'y'], samples: SAMPLES_XY, targets: [num('fₓᵧ(0, 0)', -1), num('fᵧₓ(0, 0)', 1)] },
    grading: 'partial',
    advanced: true,
    reviewIds: ['MR3-T5', 'MR3-T6', 'MR3-03'],
    before: [
      [
        'From part (b), on the axes:',
        'f_{x}(0, h) = \\frac{h(-h^{4})}{h^{4}} = -h, \\qquad f_{y}(h, 0) = \\frac{h(h^{4})}{h^{4}} = h',
      ],
      [
        'Use the definition, with $f_{x}(0, 0) = f_{y}(0, 0) = 0$ from part (a):',
        'f_{xy}(0, 0) = \\lim_{h \\to 0} \\frac{f_{x}(0, h) - f_{x}(0, 0)}{h} = \\lim_{h \\to 0} \\frac{-h}{h}, \\qquad f_{yx}(0, 0) = \\lim_{h \\to 0} \\frac{f_{y}(h, 0) - f_{y}(0, 0)}{h} = \\lim_{h \\to 0} \\frac{h}{h}',
      ],
    ],
    answers: ['-1', '1'],
    labelsTex: ['f_{xy}(0, 0)', 'f_{yx}(0, 0)'],
  }),
];

// -----------------------------------------------------------------------------
// Q3–Q5, Q10: written chain-rule identities for an arbitrary function
// -----------------------------------------------------------------------------

const q3 = showThat(3, 1, U.chainTwo, {
  instruction: 'Show that if z = f((x − y)/y), then x ∂z/∂x + y ∂z/∂y = 0.',
  problem:
    'z = f\\left(\\frac{x - y}{y}\\right), \\qquad x\\frac{\\partial z}{\\partial x} + y\\frac{\\partial z}{\\partial y} = 0',
  technique: 'rn-chain-two',
  difficulty: 2,
  method: 'Let u = (x − y)/y = x/y − 1, so z = f(u). Use the chain rule: ∂z/∂x = f′(u) ∂u/∂x and ∂z/∂y = f′(u) ∂u/∂y.',
  steps: [
    [
      'Let $u = \\frac{x - y}{y} = \\frac{x}{y} - 1$. Then',
      '\\frac{\\partial u}{\\partial x} = \\frac{1}{y}, \\qquad \\frac{\\partial u}{\\partial y} = -\\frac{x}{y^{2}}',
    ],
    [
      'By the chain rule:',
      "\\frac{\\partial z}{\\partial x} = \\frac{f'(u)}{y}, \\qquad \\frac{\\partial z}{\\partial y} = -\\frac{x f'(u)}{y^{2}}",
    ],
    [
      'Substitute:',
      "x\\frac{\\partial z}{\\partial x} + y\\frac{\\partial z}{\\partial y} = \\frac{x f'(u)}{y} - \\frac{x f'(u)}{y} = 0",
    ],
  ],
  answerTex: 'x\\frac{\\partial z}{\\partial x} + y\\frac{\\partial z}{\\partial y} = 0',
});

const q4 = showThat(4, 1, U.chainTwo, {
  instruction:
    'If g(s, t) = f(s² − t², t² − s²) and f is differentiable, show that g satisfies the equation t ∂g/∂s + s ∂g/∂t = 0.',
  problem:
    'g(s, t) = f(s^{2} - t^{2}, t^{2} - s^{2}), \\qquad t\\frac{\\partial g}{\\partial s} + s\\frac{\\partial g}{\\partial t} = 0',
  technique: 'rn-chain-two',
  difficulty: 2,
  method: 'Let x = s² − t² and y = t² − s², so g = f(x, y). Apply Theorem 3.4.2 for ∂g/∂s and ∂g/∂t.',
  steps: [
    [
      'Let $x = s^{2} - t^{2}$, $y = t^{2} - s^{2}$. By Theorem 3.4.2:',
      '\\frac{\\partial g}{\\partial s} = 2s f_{x} - 2s f_{y}, \\qquad \\frac{\\partial g}{\\partial t} = -2t f_{x} + 2t f_{y}',
    ],
    [
      'Substitute:',
      't\\frac{\\partial g}{\\partial s} + s\\frac{\\partial g}{\\partial t} = 2st f_{x} - 2st f_{y} - 2st f_{x} + 2st f_{y} = 0',
    ],
  ],
  answerTex: 't\\frac{\\partial g}{\\partial s} + s\\frac{\\partial g}{\\partial t} = 0',
});

const q5 = showThat(5, 1, U.chainTwo, {
  instruction: 'Suppose that w = f(u), where u = (x² − y²)/(x² + y²). Show that x wₓ + y wᵧ = 0.',
  problem: 'w = f(u), \\quad u = \\frac{x^{2} - y^{2}}{x^{2} + y^{2}}, \\qquad xw_{x} + yw_{y} = 0',
  technique: 'rn-chain-two',
  difficulty: 2,
  method: 'By the chain rule, wₓ = f′(u) uₓ and wᵧ = f′(u) uᵧ. Find uₓ and uᵧ with the quotient rule.',
  steps: [
    [
      'Quotient rule:',
      'u_{x} = \\frac{4xy^{2}}{(x^{2} + y^{2})^{2}}, \\qquad u_{y} = \\frac{-4x^{2}y}{(x^{2} + y^{2})^{2}}',
    ],
    [
      'By the chain rule:',
      "xw_{x} + yw_{y} = f'(u)(xu_{x} + yu_{y}) = f'(u)\\frac{4x^{2}y^{2} - 4x^{2}y^{2}}{(x^{2} + y^{2})^{2}} = 0",
    ],
  ],
  answerTex: 'xw_{x} + yw_{y} = 0',
});

const q10 = showThat(10, 2, U.chainTwo, {
  instruction:
    'Suppose that f(u, v) = g(x, y) where u = x² − y² and v = 2xy. Then y ∂g/∂x − x ∂g/∂y = 2v ∂f/∂u − 2u ∂f/∂v.',
  problem:
    'f(u, v) = g(x, y), \\quad u = x^{2} - y^{2}, \\quad v = 2xy, \\qquad y\\frac{\\partial g}{\\partial x} - x\\frac{\\partial g}{\\partial y} = 2v\\frac{\\partial f}{\\partial u} - 2u\\frac{\\partial f}{\\partial v}',
  technique: 'rn-chain-two',
  difficulty: 2,
  method: 'Since g(x, y) = f(u, v), find ∂g/∂x and ∂g/∂y with Theorem 3.4.2, then substitute.',
  steps: [
    [
      'By Theorem 3.4.2:',
      '\\frac{\\partial g}{\\partial x} = 2x f_{u} + 2y f_{v}, \\qquad \\frac{\\partial g}{\\partial y} = -2y f_{u} + 2x f_{v}',
    ],
    [
      'Substitute and collect:',
      'y\\frac{\\partial g}{\\partial x} - x\\frac{\\partial g}{\\partial y} = 4xy f_{u} + 2(y^{2} - x^{2}) f_{v} = 2v f_{u} - 2u f_{v}',
    ],
  ],
});

// -----------------------------------------------------------------------------
// Q9, Q11–Q21: chain rules with explicit functions (checked through the intermediate variables)
// -----------------------------------------------------------------------------

const tSamples = (...ts: number[]): Point[] => ts.map((t) => ({ t }));

interface ChainSpec {
  instruction: string;
  problem: string;
  technique: 'rn-chain-one' | 'rn-chain-two';
  difficulty: 1 | 2 | 3;
  variables: string[];
  definitions: Record<string, string>;
  samples: Point[];
  /** [label, TeX label, dependent function, independent variable] */
  targets: [string, string, string, string][];
  answers: string[];
  working?: [string, string?][];
}

function chain(question: number, sub: string | null, page: number, unitId: RnUnitId, spec: ChainSpec): PracticeItem {
  const targets: PartialTarget[] = spec.targets.map(([label, , f, wrt]) => d(label, f, wrt));
  return part(question, sub, page, '3-4', unitId, {
    instruction: spec.instruction,
    problem: spec.problem,
    technique: spec.technique,
    difficulty: spec.difficulty,
    method:
      spec.technique === 'rn-chain-one'
        ? 'Theorem 3.4.1: add one product for each path from the dependent variable down to the independent variable (Figure 3.1). You may leave the intermediate variables in your answer.'
        : 'Theorem 3.4.2: for each independent variable, add one product for each path down to it (Figure 3.2). You may leave the intermediate variables in your answer.',
    partial: { variables: spec.variables, definitions: spec.definitions, samples: spec.samples, targets },
    ...(spec.working ? { before: spec.working } : {}),
    answers: spec.answers,
    labelsTex: spec.targets.map(([, tex]) => tex),
  });
}

const q9 = [
  chain(9, 'i', 2, U.chainTwo, {
    instruction: 'Find ∂r/∂x, ∂r/∂y and ∂r/∂z.',
    problem: 'r = e^{u + v + w}, \\quad u = yz, \\quad v = xz, \\quad w = xy',
    technique: 'rn-chain-two',
    difficulty: 2,
    variables: ['x', 'y', 'z'],
    definitions: { u: 'yz', v: 'xz', w: 'xy' },
    samples: SAMPLES_XYZ,
    targets: [
      ['∂r/∂x', PD('r', 'x'), 'e^(u + v + w)', 'x'],
      ['∂r/∂y', PD('r', 'y'), 'e^(u + v + w)', 'y'],
      ['∂r/∂z', PD('r', 'z'), 'e^(u + v + w)', 'z'],
    ],
    working: [
      [
        'Each of $\\frac{\\partial r}{\\partial u}$, $\\frac{\\partial r}{\\partial v}$, $\\frac{\\partial r}{\\partial w}$ equals $e^{u + v + w}$. For $x$:',
        '\\frac{\\partial r}{\\partial x} = e^{u + v + w}\\left(\\frac{\\partial u}{\\partial x} + \\frac{\\partial v}{\\partial x} + \\frac{\\partial w}{\\partial x}\\right) = e^{u + v + w}(0 + z + y)',
      ],
    ],
    answers: ['e^(u + v + w)(z + y)', 'e^(u + v + w)(z + x)', 'e^(u + v + w)(y + x)'],
  }),
  chain(9, 'ii', 2, U.chainTwo, {
    instruction: 'Find ∂r/∂x, ∂r/∂y and ∂r/∂z.',
    problem: 'r = uvw - u^{2} - v^{2} - w^{2}, \\quad u = y + z, \\quad v = x + z, \\quad w = x + y',
    technique: 'rn-chain-two',
    difficulty: 2,
    variables: ['x', 'y', 'z'],
    definitions: { u: 'y + z', v: 'x + z', w: 'x + y' },
    samples: SAMPLES_XYZ,
    targets: [
      ['∂r/∂x', PD('r', 'x'), 'uvw - u^2 - v^2 - w^2', 'x'],
      ['∂r/∂y', PD('r', 'y'), 'uvw - u^2 - v^2 - w^2', 'y'],
      ['∂r/∂z', PD('r', 'z'), 'uvw - u^2 - v^2 - w^2', 'z'],
    ],
    working: [
      [
        'The partial derivatives with respect to the intermediate variables are',
        '\\frac{\\partial r}{\\partial u} = vw - 2u, \\quad \\frac{\\partial r}{\\partial v} = uw - 2v, \\quad \\frac{\\partial r}{\\partial w} = uv - 2w',
      ],
      ['$x$ appears in $v$ and $w$ only (each with derivative 1), and similarly for $y$ and $z$.'],
    ],
    answers: ['(uw - 2v) + (uv - 2w)', '(vw - 2u) + (uv - 2w)', '(vw - 2u) + (uw - 2v)'],
  }),
];

const chainOne = (
  question: number,
  problem: string,
  label: [string, string],
  f: string,
  variable: string,
  definitions: Record<string, string>,
  samples: Point[],
  answer: string,
  working: [string, string?][],
  difficulty: 1 | 2 | 3 = 2,
): PracticeItem =>
  chain(question, null, 2, U.chainOne, {
    instruction: `Given the following information, use the Chain Rule to determine ${label[0]}.`,
    problem,
    technique: 'rn-chain-one',
    difficulty,
    variables: [variable],
    definitions,
    samples,
    targets: [[label[0], label[1], f, variable]],
    answers: [answer],
    working,
  });

const DZDX = ['dz/dx', '\\frac{dz}{dx}'] as [string, string];
const DWDT = ['dw/dt', '\\frac{dw}{dt}'] as [string, string];
const DZDT = ['dz/dt', '\\frac{dz}{dt}'] as [string, string];

const q11to16 = [
  chainOne(
    11,
    'z = x^{2}y^{4} - 2y, \\qquad y = \\sin(x^{2})',
    DZDX,
    'x^2 y^4 - 2y',
    'x',
    { y: 'sin(x^2)' },
    [{ x: 0.7 }, { x: 1.1 }, { x: 0.3 }, { x: 1.4 }, { x: 0.9 }],
    '2x y^4 + (4x^2 y^3 - 2)(2x cos(x^2))',
    [
      [
        '$z$ depends on $x$ directly and through $y$:',
        '\\frac{dz}{dx} = \\frac{\\partial z}{\\partial x} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dx}, \\quad \\frac{\\partial z}{\\partial x} = 2xy^{4}, \\quad \\frac{\\partial z}{\\partial y} = 4x^{2}y^{3} - 2, \\quad \\frac{dy}{dx} = 2x\\cos(x^{2})',
      ],
    ],
  ),
  chainOne(
    12,
    'w = x^{2} + y^{2}, \\qquad x = e^{t}, \\quad y = e^{-t}',
    DWDT,
    'x^2 + y^2',
    't',
    { x: 'e^t', y: 'e^(-t)' },
    tSamples(0.3, 0.7, -0.4, 1.1, 0.5),
    '2e^(2t) - 2e^(-2t)',
    [['By Theorem 3.4.1:', '\\frac{dw}{dt} = 2x \\cdot e^{t} + 2y \\cdot (-e^{-t}) = 2e^{t}e^{t} - 2e^{-t}e^{-t}']],
    1,
  ),
  chainOne(
    13,
    'w = \\ln\\left(\\frac{y}{x}\\right), \\qquad x = \\cos t, \\quad y = \\sin t',
    DWDT,
    'ln(y/x)',
    't',
    { x: 'cos(t)', y: 'sin(t)' },
    tSamples(0.3, 0.7, 1.1, 0.5, 1.3),
    'tan(t) + cot(t)',
    [
      [
        'Write $w = \\ln y - \\ln x$. By Theorem 3.4.1:',
        '\\frac{dw}{dt} = -\\frac{1}{x}(-\\sin t) + \\frac{1}{y}\\cos t = \\frac{\\sin t}{\\cos t} + \\frac{\\cos t}{\\sin t}',
      ],
    ],
  ),
  chainOne(
    14,
    'w = \\sqrt{x^{2} + y^{2}}, \\qquad x = \\sin t, \\quad y = e^{t}',
    DWDT,
    'sqrt(x^2 + y^2)',
    't',
    { x: 'sin(t)', y: 'e^t' },
    tSamples(0.3, 0.7, -0.4, 1.1, 0.5),
    '(sin(t)cos(t) + e^(2t))/sqrt((sin(t))^2 + e^(2t))',
    [
      [
        'By Theorem 3.4.1:',
        '\\frac{dw}{dt} = \\frac{x}{\\sqrt{x^{2} + y^{2}}}\\cos t + \\frac{y}{\\sqrt{x^{2} + y^{2}}}e^{t}',
      ],
    ],
  ),
  chainOne(
    15,
    'z = \\cos(yx^{2}), \\qquad x = t^{4} - 2t, \\quad y = 1 - t^{6}',
    DZDT,
    'cos(y x^2)',
    't',
    { x: 't^4 - 2t', y: '1 - t^6' },
    tSamples(0.3, 0.7, -0.4, 1.1, 0.5),
    '-sin(y x^2)(2xy(4t^3 - 2) - 6t^5 x^2)',
    [['By Theorem 3.4.1:', '\\frac{dz}{dt} = -2xy\\sin(yx^{2})(4t^{3} - 2) - x^{2}\\sin(yx^{2})(-6t^{5})']],
  ),
  chainOne(
    16,
    'w = \\frac{x^{2} - z}{y^{4}}, \\qquad x = t^{3} + 7, \\quad y = \\cos(2t), \\quad z = 4t',
    DWDT,
    '(x^2 - z)/y^4',
    't',
    { x: 't^3 + 7', y: 'cos(2t)', z: '4t' },
    tSamples(0.1, 0.3, 0.5, 0.2, 0.6),
    '6t^2 x/y^4 + 8(x^2 - z)sin(2t)/y^5 - 4/y^4',
    [
      [
        'Three paths from $w$ to $t$:',
        '\\frac{dw}{dt} = \\frac{2x}{y^{4}}(3t^{2}) + \\left(-\\frac{4(x^{2} - z)}{y^{5}}\\right)(-2\\sin 2t) + \\left(-\\frac{1}{y^{4}}\\right)(4)',
      ],
    ],
    3,
  ),
];

const q17to21 = [
  chain(17, null, 2, U.chainTwo, {
    instruction: 'Given the following information, use the Chain Rule to determine ∂z/∂u and ∂z/∂v.',
    problem: 'z = x^{-2}y^{6} - 4x, \\qquad x = u^{2}v, \\quad y = v - 3u',
    technique: 'rn-chain-two',
    difficulty: 2,
    variables: ['u', 'v'],
    definitions: { x: 'u^2 v', y: 'v - 3u' },
    samples: [
      { u: 0.7, v: 1.3 },
      { u: 1.6, v: 0.45 },
      { u: 0.35, v: 2.2 },
      { u: 1.2, v: 1.7 },
      { u: 0.9, v: 0.8 },
    ],
    targets: [
      ['∂z/∂u', PD('z', 'u'), 'x^(-2) y^6 - 4x', 'u'],
      ['∂z/∂v', PD('z', 'v'), 'x^(-2) y^6 - 4x', 'v'],
    ],
    working: [
      [
        'First:',
        '\\frac{\\partial z}{\\partial x} = -2x^{-3}y^{6} - 4, \\qquad \\frac{\\partial z}{\\partial y} = 6x^{-2}y^{5}',
      ],
      [
        'And:',
        '\\frac{\\partial x}{\\partial u} = 2uv, \\quad \\frac{\\partial x}{\\partial v} = u^{2}, \\quad \\frac{\\partial y}{\\partial u} = -3, \\quad \\frac{\\partial y}{\\partial v} = 1',
      ],
    ],
    answers: ['(-2x^(-3) y^6 - 4)(2uv) - 18x^(-2) y^5', '(-2x^(-3) y^6 - 4)u^2 + 6x^(-2) y^5'],
  }),
  chain(18, null, 2, U.chainTwo, {
    instruction: 'Given the following information, use the Chain Rule to determine ∂w/∂r and ∂w/∂θ.',
    problem: 'w = xy + yz + zx, \\qquad x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\quad z = r\\theta',
    technique: 'rn-chain-two',
    difficulty: 2,
    variables: ['r', 'θ'],
    definitions: { x: 'r cos(theta)', y: 'r sin(theta)', z: 'r theta' },
    samples: [
      { r: 0.7, θ: 1.3 },
      { r: 1.6, θ: 0.45 },
      { r: 0.35, θ: 2.2 },
      { r: 2.1, θ: 1.7 },
      { r: 1.15, θ: 0.8 },
    ],
    targets: [
      ['∂w/∂r', PD('w', 'r'), 'xy + yz + zx', 'r'],
      ['∂w/∂θ', PD('w', '\\theta'), 'xy + yz + zx', 'θ'],
    ],
    working: [
      [
        'First:',
        '\\frac{\\partial w}{\\partial x} = y + z, \\quad \\frac{\\partial w}{\\partial y} = x + z, \\quad \\frac{\\partial w}{\\partial z} = x + y',
      ],
    ],
    answers: [
      '(y + z)cos(theta) + (x + z)sin(theta) + (x + y)theta',
      '-r(y + z)sin(theta) + r(x + z)cos(theta) + r(x + y)',
    ],
  }),
  chain(19, null, 3, U.chainTwo, {
    instruction: 'Given the following information, use the Chain Rule to determine ∂P/∂x and ∂P/∂y.',
    problem: 'P = \\sqrt{u^{2} + v^{2} + w^{2}}, \\qquad u = xe^{y}, \\quad v = ye^{x}, \\quad w = e^{xy}',
    technique: 'rn-chain-two',
    difficulty: 2,
    variables: ['x', 'y'],
    definitions: { u: 'x e^y', v: 'y e^x', w: 'e^(xy)', P: 'sqrt(u^2 + v^2 + w^2)' },
    samples: SAMPLES_XY,
    targets: [
      ['∂P/∂x', PD('P', 'x'), 'P', 'x'],
      ['∂P/∂y', PD('P', 'y'), 'P', 'y'],
    ],
    working: [
      [
        'First:',
        '\\frac{\\partial P}{\\partial u} = \\frac{u}{P}, \\quad \\frac{\\partial P}{\\partial v} = \\frac{v}{P}, \\quad \\frac{\\partial P}{\\partial w} = \\frac{w}{P}',
      ],
      [
        'And for $x$:',
        '\\frac{\\partial u}{\\partial x} = e^{y}, \\quad \\frac{\\partial v}{\\partial x} = ye^{x}, \\quad \\frac{\\partial w}{\\partial x} = ye^{xy}',
      ],
    ],
    answers: ['(u e^y + v y e^x + w y e^(xy))/P', '(u x e^y + v e^x + w x e^(xy))/P'],
  }),
  chain(20, null, 3, U.chainTwo, {
    instruction: 'Given the following information, use the Chain Rule to determine ∂z/∂t and ∂z/∂p.',
    problem: 'z = 4y\\sin(2x), \\qquad x = 3u - p, \\quad y = p^{2}u, \\quad u = t^{2} + 1',
    technique: 'rn-chain-two',
    difficulty: 3,
    variables: ['t', 'p'],
    definitions: { x: '3u - p', y: 'p^2 u', u: 't^2 + 1' },
    samples: [
      { t: 0.7, p: 1.3 },
      { t: 1.6, p: 0.45 },
      { t: 0.35, p: 2.2 },
      { t: -0.8, p: 1.7 },
      { t: 1.15, p: -0.8 },
    ],
    targets: [
      ['∂z/∂t', PD('z', 't'), '4y sin(2x)', 't'],
      ['∂z/∂p', PD('z', 'p'), '4y sin(2x)', 'p'],
    ],
    working: [
      [
        '$t$ reaches $z$ only through $u$, which appears in both $x$ and $y$:',
        '\\frac{\\partial z}{\\partial t} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial u}\\frac{du}{dt} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial u}\\frac{du}{dt}',
      ],
      [
        '$p$ appears in $x$ and $y$ directly:',
        '\\frac{\\partial z}{\\partial p} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial p} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial p}',
      ],
    ],
    answers: ['8y cos(2x)(3)(2t) + 4sin(2x)p^2(2t)', '-8y cos(2x) + 8p u sin(2x)'],
  }),
  chain(21, null, 3, U.chainTwo, {
    instruction: 'Given the following information, use the Chain Rule to determine ∂w/∂t and ∂w/∂s.',
    problem:
      'w = \\sqrt{x^{2} + y^{2}} + \\frac{6z}{y}, \\qquad x = \\sin(p), \\quad y = p + 3t - 4s, \\quad z = \\frac{t^{3}}{s^{2}}, \\quad p = 1 - 2t',
    technique: 'rn-chain-two',
    difficulty: 3,
    variables: ['t', 's'],
    definitions: { x: 'sin(p)', y: 'p + 3t - 4s', z: 't^3/s^2', p: '1 - 2t' },
    samples: [
      { t: 0.5, s: 0.1 },
      { t: 1.2, s: 0.2 },
      { t: 0.3, s: 0.6 },
      { t: 2, s: 0.3 },
      { t: 0.8, s: 0.15 },
    ],
    targets: [
      ['∂w/∂t', PD('w', 't'), 'sqrt(x^2 + y^2) + 6z/y', 't'],
      ['∂w/∂s', PD('w', 's'), 'sqrt(x^2 + y^2) + 6z/y', 's'],
    ],
    working: [
      [
        'First:',
        '\\frac{\\partial w}{\\partial x} = \\frac{x}{\\sqrt{x^{2} + y^{2}}}, \\quad \\frac{\\partial w}{\\partial y} = \\frac{y}{\\sqrt{x^{2} + y^{2}}} - \\frac{6z}{y^{2}}, \\quad \\frac{\\partial w}{\\partial z} = \\frac{6}{y}',
      ],
      [
        '$t$ reaches $x$ through $p$, $y$ directly and through $p$, and $z$ directly:',
        '\\frac{\\partial x}{\\partial t} = -2\\cos p, \\quad \\frac{\\partial y}{\\partial t} = -2 + 3 = 1, \\quad \\frac{\\partial z}{\\partial t} = \\frac{3t^{2}}{s^{2}}',
      ],
    ],
    answers: [
      '-2x cos(p)/sqrt(x^2 + y^2) + y/sqrt(x^2 + y^2) - 6z/y^2 + 18t^2/(s^2 y)',
      '-4(y/sqrt(x^2 + y^2) - 6z/y^2) - 12t^3/(s^3 y)',
    ],
  }),
];

// -----------------------------------------------------------------------------
// Q22, Q23: general chain-rule formulas (written)
// -----------------------------------------------------------------------------

const q22 = part(22, null, 3, '3-4', U.chainTwo, {
  instruction: 'Determine formulas for ∂w/∂t and ∂w/∂v for the following situation.',
  problem: 'w = w(x, y), \\quad x = x(p, q, s), \\quad y = y(p, u, v), \\quad s = s(u, v), \\quad p = p(t)',
  technique: 'rn-chain-general',
  difficulty: 2,
  method:
    'Draw the tree diagram (as in Figures 3.1 and 3.2). For each variable, follow every path from w down to it and add the products.',
  partial: WRITTEN_XY,
  grading: 'written',
  steps: [
    [
      '$t$ reaches $w$ only through $p$, and $p$ appears in both $x$ and $y$:',
      '\\frac{\\partial w}{\\partial t} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial p}\\frac{dp}{dt} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial p}\\frac{dp}{dt}',
    ],
    [
      '$v$ reaches $w$ through $s$ (inside $x$) and directly through $y$:',
      '\\frac{\\partial w}{\\partial v} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial s}\\frac{\\partial s}{\\partial v} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial v}',
    ],
  ],
  answerTex:
    '\\frac{\\partial w}{\\partial t} = \\left(\\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial p} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial p}\\right)\\frac{dp}{dt}, \\quad \\frac{\\partial w}{\\partial v} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial s}\\frac{\\partial s}{\\partial v} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial v}',
});

const q23 = part(23, null, 3, '3-4', U.chainTwo, {
  instruction: 'Determine formulas for ∂w/∂t and ∂w/∂u for the following situation.',
  problem:
    'w = w(x, y, z), \\quad x = x(t), \\quad y = y(u, v, p), \\quad z = z(v, p), \\quad v = v(r, u), \\quad p = p(t, u)',
  technique: 'rn-chain-general',
  difficulty: 3,
  method:
    'The independent variables are t, r and u. Draw the tree diagram and follow every path from w down to t, then to u.',
  partial: WRITTEN_XY,
  grading: 'written',
  steps: [
    [
      '$t$ reaches $w$ through $x$, and through $p$ (inside $y$ and $z$):',
      '\\frac{\\partial w}{\\partial t} = \\frac{\\partial w}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial p}\\frac{\\partial p}{\\partial t} + \\frac{\\partial w}{\\partial z}\\frac{\\partial z}{\\partial p}\\frac{\\partial p}{\\partial t}',
    ],
    [
      '$u$ reaches $w$ directly through $y$, and through $v$ and $p$ (inside $y$ and $z$):',
      '\\frac{\\partial w}{\\partial u} = \\frac{\\partial w}{\\partial y}\\left(\\frac{\\partial y}{\\partial u} + \\frac{\\partial y}{\\partial v}\\frac{\\partial v}{\\partial u} + \\frac{\\partial y}{\\partial p}\\frac{\\partial p}{\\partial u}\\right) + \\frac{\\partial w}{\\partial z}\\left(\\frac{\\partial z}{\\partial v}\\frac{\\partial v}{\\partial u} + \\frac{\\partial z}{\\partial p}\\frac{\\partial p}{\\partial u}\\right)',
    ],
  ],
});

// -----------------------------------------------------------------------------
// Q24–Q34, Q36, Q37: second-order chain rule and coordinate changes (written)
// -----------------------------------------------------------------------------

const SO = U.secondOrder;
const SO_METHOD =
  'Find the first derivatives with the Chain Rule, then differentiate them again, applying the Chain Rule to the first partial derivatives themselves (Example 3.4.7). Assume the mixed partial derivatives are equal (continuous second partial derivatives).';

const q24to34 = [
  showThat(24, 3, SO, {
    instruction:
      'Suppose that w = f(r) and that r = √(x² + y² + z²). Show that ∂²w/∂x² + ∂²w/∂y² + ∂²w/∂z² = d²w/dr² + (2/r) dw/dr.',
    problem:
      'w = f(r), \\quad r = \\sqrt{x^{2} + y^{2} + z^{2}}, \\qquad \\frac{\\partial^{2} w}{\\partial x^{2}} + \\frac{\\partial^{2} w}{\\partial y^{2}} + \\frac{\\partial^{2} w}{\\partial z^{2}} = \\frac{d^{2}w}{dr^{2}} + \\frac{2}{r}\\frac{dw}{dr}',
    technique: 'rn-second-order',
    difficulty: 3,
    method: `${SO_METHOD} Here ∂r/∂x = x/r.`,
    steps: [
      [
        'Since $\\frac{\\partial r}{\\partial x} = \\frac{x}{r}$:',
        "\\frac{\\partial w}{\\partial x} = f'(r)\\frac{x}{r}",
      ],
      [
        'Differentiate again (product rule and chain rule):',
        "\\frac{\\partial^{2} w}{\\partial x^{2}} = f''(r)\\frac{x^{2}}{r^{2}} + f'(r)\\frac{r^{2} - x^{2}}{r^{3}}",
      ],
      [
        'Similarly for $y$ and $z$. Add, using $x^{2} + y^{2} + z^{2} = r^{2}$:',
        "f''(r)\\frac{r^{2}}{r^{2}} + f'(r)\\frac{3r^{2} - r^{2}}{r^{3}} = f''(r) + \\frac{2}{r}f'(r)",
      ],
    ],
  }),
  showThat(25, 3, SO, {
    instruction:
      'Suppose that w = f(u) + g(v), where u = x − at and v = x + at. Show that ∂²w/∂t² + a² ∂²w/∂x² = 2a²(∂²w/∂u² + ∂²w/∂v²).',
    problem:
      'w = f(u) + g(v), \\quad u = x - at, \\quad v = x + at, \\qquad \\frac{\\partial^{2} w}{\\partial t^{2}} + a^{2}\\frac{\\partial^{2} w}{\\partial x^{2}} = 2a^{2}\\left(\\frac{\\partial^{2} w}{\\partial u^{2}} + \\frac{\\partial^{2} w}{\\partial v^{2}}\\right)',
    technique: 'rn-second-order',
    difficulty: 2,
    method: SO_METHOD,
    steps: [
      [
        'With respect to $t$:',
        "\\frac{\\partial w}{\\partial t} = -af'(u) + ag'(v), \\qquad \\frac{\\partial^{2} w}{\\partial t^{2}} = a^{2}f''(u) + a^{2}g''(v)",
      ],
      [
        'With respect to $x$:',
        "\\frac{\\partial w}{\\partial x} = f'(u) + g'(v), \\qquad \\frac{\\partial^{2} w}{\\partial x^{2}} = f''(u) + g''(v)",
      ],
      [
        "Since $\\frac{\\partial^{2} w}{\\partial u^{2}} = f''(u)$ and $\\frac{\\partial^{2} w}{\\partial v^{2}} = g''(v)$:",
        "\\frac{\\partial^{2} w}{\\partial t^{2}} + a^{2}\\frac{\\partial^{2} w}{\\partial x^{2}} = 2a^{2}(f''(u) + g''(v))",
      ],
    ],
  }),
  showThat(26, 3, SO, {
    instruction:
      'Suppose that w = f(x, y) = g(u, v) where x = u² − v² and y = 2uv, and that f and g are twice continuously differentiable functions. Then ∂²g/∂u² − ∂²g/∂v² = 4x ∂²f/∂x² + 8y ∂²f/∂x∂y − 4x ∂²f/∂y² + 4 ∂f/∂x.',
    problem:
      '\\frac{\\partial^{2} g}{\\partial u^{2}} - \\frac{\\partial^{2} g}{\\partial v^{2}} = 4x\\frac{\\partial^{2} f}{\\partial x^{2}} + 8y\\frac{\\partial^{2} f}{\\partial x \\partial y} - 4x\\frac{\\partial^{2} f}{\\partial y^{2}} + 4\\frac{\\partial f}{\\partial x}',
    condition: '$w = f(x, y) = g(u, v)$, $x = u^{2} - v^{2}$, $y = 2uv$.',
    technique: 'rn-second-order',
    difficulty: 3,
    method: SO_METHOD,
    steps: [
      ['First derivatives:', 'g_{u} = 2uf_{x} + 2vf_{y}, \\qquad g_{v} = -2vf_{x} + 2uf_{y}'],
      [
        'Second derivatives (chain rule on $f_{x}$, $f_{y}$):',
        'g_{uu} = 2f_{x} + 4u^{2}f_{xx} + 8uvf_{xy} + 4v^{2}f_{yy}, \\qquad g_{vv} = -2f_{x} + 4v^{2}f_{xx} - 8uvf_{xy} + 4u^{2}f_{yy}',
      ],
      [
        'Subtract, using $u^{2} - v^{2} = x$ and $2uv = y$:',
        'g_{uu} - g_{vv} = 4(u^{2} - v^{2})f_{xx} + 16uvf_{xy} - 4(u^{2} - v^{2})f_{yy} + 4f_{x} = 4xf_{xx} + 8yf_{xy} - 4xf_{yy} + 4f_{x}',
      ],
    ],
  }),
  showThat(27, 3, SO, {
    instruction:
      'Let f(x, y) be a function of x and y where x = e^(u−v) cos(u + v), y = e^(u−v) sin(u + v). Show that ∂f/∂u + ∂f/∂v = 2x ∂f/∂y − 2y ∂f/∂x.',
    problem:
      'x = e^{u - v}\\cos(u + v), \\quad y = e^{u - v}\\sin(u + v), \\qquad \\frac{\\partial f}{\\partial u} + \\frac{\\partial f}{\\partial v} = 2x\\frac{\\partial f}{\\partial y} - 2y\\frac{\\partial f}{\\partial x}',
    technique: 'rn-chain-two',
    difficulty: 2,
    method: 'Find ∂x/∂u, ∂x/∂v, ∂y/∂u, ∂y/∂v and write them in terms of x and y, then use Theorem 3.4.2.',
    steps: [
      ['Differentiate:', 'x_{u} = x - y, \\quad x_{v} = -x - y, \\quad y_{u} = y + x, \\quad y_{v} = -y + x'],
      ['By Theorem 3.4.2:', 'f_{u} + f_{v} = f_{x}(x_{u} + x_{v}) + f_{y}(y_{u} + y_{v}) = f_{x}(-2y) + f_{y}(2x)'],
    ],
  }),
  showThat(28, 3, SO, {
    instruction:
      'Assume that w = f(u, v) where u = x + y and v = x − y. Show that (∂w/∂x)(∂w/∂y) = (∂w/∂u)² − (∂w/∂v)².',
    problem:
      'w = f(u, v), \\quad u = x + y, \\quad v = x - y, \\qquad \\frac{\\partial w}{\\partial x}\\frac{\\partial w}{\\partial y} = \\left(\\frac{\\partial w}{\\partial u}\\right)^{2} - \\left(\\frac{\\partial w}{\\partial v}\\right)^{2}',
    technique: 'rn-chain-two',
    difficulty: 1,
    method: 'Use Theorem 3.4.2 to write ∂w/∂x and ∂w/∂y in terms of ∂w/∂u and ∂w/∂v.',
    steps: [
      [
        'By Theorem 3.4.2:',
        '\\frac{\\partial w}{\\partial x} = w_{u} + w_{v}, \\qquad \\frac{\\partial w}{\\partial y} = w_{u} - w_{v}',
      ],
      [
        'Multiply (difference of two squares):',
        '\\frac{\\partial w}{\\partial x}\\frac{\\partial w}{\\partial y} = (w_{u} + w_{v})(w_{u} - w_{v}) = w_{u}^{2} - w_{v}^{2}',
      ],
    ],
  }),
  showThat(29, 4, SO, {
    instruction:
      'Suppose that w = f(x, y) and that x = u + v and y = u − v. Show that ∂²w/∂x² − ∂²w/∂y² = ½(∂²w/∂u∂v + ∂²w/∂v∂u).',
    problem:
      'w = f(x, y), \\quad x = u + v, \\quad y = u - v, \\qquad \\frac{\\partial^{2} w}{\\partial x^{2}} - \\frac{\\partial^{2} w}{\\partial y^{2}} = \\frac{1}{2}\\left(\\frac{\\partial^{2} w}{\\partial u \\partial v} + \\frac{\\partial^{2} w}{\\partial v \\partial u}\\right)',
    technique: 'rn-second-order',
    difficulty: 2,
    method: SO_METHOD,
    steps: [
      ['First derivatives:', 'w_{u} = w_{x} + w_{y}, \\qquad w_{v} = w_{x} - w_{y}'],
      [
        'Differentiate $w_{u}$ with respect to $v$ (and $w_{v}$ with respect to $u$):',
        'w_{uv} = w_{xx} - w_{xy} + w_{yx} - w_{yy} = w_{xx} - w_{yy}, \\qquad w_{vu} = w_{xx} + w_{xy} - w_{yx} - w_{yy} = w_{xx} - w_{yy}',
      ],
      ['So the average of the two mixed derivatives is', '\\frac{1}{2}(w_{uv} + w_{vu}) = w_{xx} - w_{yy}'],
    ],
  }),
  showThat(30, 4, SO, {
    instruction:
      'Given z = f(x, y) has continuous second order partial derivatives with x = r² + s² and y = 2rs. Show that ∂z/∂r = 2r ∂z/∂x + 2s ∂z/∂y and ∂²z/∂r² = 2 ∂z/∂x + 4r² ∂²z/∂x² + 8rs ∂²z/∂x∂y + 4s² ∂²z/∂y².',
    problem:
      '\\frac{\\partial z}{\\partial r} = 2r\\frac{\\partial z}{\\partial x} + 2s\\frac{\\partial z}{\\partial y}, \\qquad \\frac{\\partial^{2} z}{\\partial r^{2}} = 2\\frac{\\partial z}{\\partial x} + 4r^{2}\\frac{\\partial^{2} z}{\\partial x^{2}} + 8rs\\frac{\\partial^{2} z}{\\partial x \\partial y} + 4s^{2}\\frac{\\partial^{2} z}{\\partial y^{2}}',
    condition: '$z = f(x, y)$, $x = r^{2} + s^{2}$, $y = 2rs$.',
    technique: 'rn-second-order',
    difficulty: 2,
    method: SO_METHOD,
    steps: [
      ['Since $x_{r} = 2r$ and $y_{r} = 2s$:', 'z_{r} = 2rz_{x} + 2sz_{y}'],
      [
        'Differentiate again with respect to $r$ (product rule on $2rz_{x}$):',
        'z_{rr} = 2z_{x} + 2r(2rz_{xx} + 2sz_{xy}) + 2s(2rz_{yx} + 2sz_{yy})',
      ],
      ['With $z_{xy} = z_{yx}$:', 'z_{rr} = 2z_{x} + 4r^{2}z_{xx} + 8rsz_{xy} + 4s^{2}z_{yy}'],
    ],
  }),
  showThat(31, 4, SO, {
    instruction:
      'Let V = f(x, y), where x and y are given in polar co-ordinates by the equations x = r cos θ and y = r sin θ. Show that (∂V/∂x)² + (∂V/∂y)² = (∂V/∂r)² + (1/r²)(∂V/∂θ)².',
    problem:
      '\\left(\\frac{\\partial V}{\\partial x}\\right)^{2} + \\left(\\frac{\\partial V}{\\partial y}\\right)^{2} = \\left(\\frac{\\partial V}{\\partial r}\\right)^{2} + \\frac{1}{r^{2}}\\left(\\frac{\\partial V}{\\partial \\theta}\\right)^{2}',
    condition: '$V = f(x, y)$, $x = r\\cos\\theta$, $y = r\\sin\\theta$.',
    technique: 'rn-chain-two',
    difficulty: 2,
    method: 'Write ∂V/∂r and ∂V/∂θ with Theorem 3.4.2, then expand the right-hand side.',
    steps: [
      [
        'By Theorem 3.4.2:',
        'V_{r} = V_{x}\\cos\\theta + V_{y}\\sin\\theta, \\qquad V_{\\theta} = -rV_{x}\\sin\\theta + rV_{y}\\cos\\theta',
      ],
      [
        'Square and add (the cross terms cancel):',
        'V_{r}^{2} + \\frac{1}{r^{2}}V_{\\theta}^{2} = V_{x}^{2}(\\cos^{2}\\theta + \\sin^{2}\\theta) + V_{y}^{2}(\\sin^{2}\\theta + \\cos^{2}\\theta) = V_{x}^{2} + V_{y}^{2}',
      ],
    ],
  }),
  showThat(32, 4, SO, {
    instruction:
      'Given V = f(x, y). Show that if x = r cos θ and y = r sin θ, then ∂²V/∂x² + ∂²V/∂y² = ∂²V/∂r² + (1/r) ∂V/∂r + (1/r²) ∂²V/∂θ².',
    problem:
      '\\frac{\\partial^{2} V}{\\partial x^{2}} + \\frac{\\partial^{2} V}{\\partial y^{2}} = \\frac{\\partial^{2} V}{\\partial r^{2}} + \\frac{1}{r}\\frac{\\partial V}{\\partial r} + \\frac{1}{r^{2}}\\frac{\\partial^{2} V}{\\partial \\theta^{2}}',
    condition: '$V = f(x, y)$, $x = r\\cos\\theta$, $y = r\\sin\\theta$.',
    technique: 'rn-second-order',
    difficulty: 3,
    method: `${SO_METHOD} This is the same computation as Example 3.4.7.`,
    steps: [
      [
        'First derivatives:',
        'V_{r} = V_{x}\\cos\\theta + V_{y}\\sin\\theta, \\qquad V_{\\theta} = -rV_{x}\\sin\\theta + rV_{y}\\cos\\theta',
      ],
      [
        'Second derivative in $r$:',
        'V_{rr} = V_{xx}\\cos^{2}\\theta + 2V_{xy}\\sin\\theta\\cos\\theta + V_{yy}\\sin^{2}\\theta',
      ],
      [
        'Second derivative in $\\theta$:',
        'V_{\\theta\\theta} = r^{2}(V_{xx}\\sin^{2}\\theta - 2V_{xy}\\sin\\theta\\cos\\theta + V_{yy}\\cos^{2}\\theta) - r(V_{x}\\cos\\theta + V_{y}\\sin\\theta)',
      ],
      [
        'So $\\frac{1}{r^{2}}V_{\\theta\\theta} = V_{xx}\\sin^{2}\\theta - 2V_{xy}\\sin\\theta\\cos\\theta + V_{yy}\\cos^{2}\\theta - \\frac{1}{r}V_{r}$. Add:',
        'V_{rr} + \\frac{1}{r}V_{r} + \\frac{1}{r^{2}}V_{\\theta\\theta} = V_{xx} + V_{yy}',
      ],
    ],
  }),
  showThat(33, 4, SO, {
    instruction:
      'Given that w = f(x, y), x = eᵘ cos v and y = eᵘ sin v. Show that (∂w/∂x)² + (∂w/∂y)² = e^(−2u)[(∂w/∂u)² + (∂w/∂v)²].',
    problem:
      '\\left(\\frac{\\partial w}{\\partial x}\\right)^{2} + \\left(\\frac{\\partial w}{\\partial y}\\right)^{2} = e^{-2u}\\left[\\left(\\frac{\\partial w}{\\partial u}\\right)^{2} + \\left(\\frac{\\partial w}{\\partial v}\\right)^{2}\\right]',
    condition: '$w = f(x, y)$, $x = e^{u}\\cos v$, $y = e^{u}\\sin v$.',
    technique: 'rn-chain-two',
    difficulty: 2,
    method: 'Note that ∂x/∂u = x, ∂y/∂u = y, ∂x/∂v = −y, ∂y/∂v = x. Use Theorem 3.4.2, then square and add.',
    steps: [
      ['By Theorem 3.4.2:', 'w_{u} = xw_{x} + yw_{y}, \\qquad w_{v} = -yw_{x} + xw_{y}'],
      [
        'Square and add (the cross terms cancel):',
        'w_{u}^{2} + w_{v}^{2} = (x^{2} + y^{2})(w_{x}^{2} + w_{y}^{2}) = e^{2u}(w_{x}^{2} + w_{y}^{2})',
      ],
      ['Multiply both sides by $e^{-2u}$.'],
    ],
  }),
  showThat(34, 4, SO, {
    instruction:
      'Given that w = f(x, y), x = eᵘ cos v and y = eᵘ sin v. Show that ∂²w/∂x² + ∂²w/∂y² = e^(−2u)[∂²w/∂u² + ∂²w/∂v²].',
    problem:
      '\\frac{\\partial^{2} w}{\\partial x^{2}} + \\frac{\\partial^{2} w}{\\partial y^{2}} = e^{-2u}\\left[\\frac{\\partial^{2} w}{\\partial u^{2}} + \\frac{\\partial^{2} w}{\\partial v^{2}}\\right]',
    condition: '$w = f(x, y)$, $x = e^{u}\\cos v$, $y = e^{u}\\sin v$.',
    technique: 'rn-second-order',
    difficulty: 3,
    method: `${SO_METHOD} Start from wᵤ = x wₓ + y wᵧ and wᵥ = −y wₓ + x wᵧ.`,
    steps: [
      ['First derivatives:', 'w_{u} = xw_{x} + yw_{y}, \\qquad w_{v} = -yw_{x} + xw_{y}'],
      [
        'Differentiate again (remember $x_{u} = x$, $y_{u} = y$, $x_{v} = -y$, $y_{v} = x$):',
        'w_{uu} = xw_{x} + yw_{y} + x^{2}w_{xx} + 2xyw_{xy} + y^{2}w_{yy}',
      ],
      ['and', 'w_{vv} = -xw_{x} - yw_{y} + y^{2}w_{xx} - 2xyw_{xy} + x^{2}w_{yy}'],
      ['Add:', 'w_{uu} + w_{vv} = (x^{2} + y^{2})(w_{xx} + w_{yy}) = e^{2u}(w_{xx} + w_{yy})'],
    ],
  }),
];

// -----------------------------------------------------------------------------
// Q35: partial derivatives of the inverse change of variables (checked)
// -----------------------------------------------------------------------------

const Q35_FORWARD = { x: 'e^(2r) cos(theta)', y: 'e^(3r) sin(theta)' };
const inverse = (label: string, want: string, wrt: string): PartialTarget => ({
  kind: 'inverse',
  label,
  outputs: ['x', 'y'],
  inputs: ['r', 'θ'],
  forward: Q35_FORWARD,
  want,
  wrt,
});
const D35 = '(2(cos(theta))^2 + 3(sin(theta))^2)';

const q35 = part(35, null, 4, '3-4', U.changeVariables, {
  instruction:
    'Considering x and y as independent variables, find ∂r/∂x, ∂r/∂y, ∂θ/∂x, ∂θ/∂y. Give your answers in terms of r and θ.',
  problem: 'x = e^{2r}\\cos\\theta, \\qquad y = e^{3r}\\sin\\theta',
  technique: 'rn-change-variables',
  difficulty: 3,
  method:
    'As in Examples 3.4.5 and 3.4.6: write dx and dy in terms of dr and dθ, then solve the two equations for dr and dθ. The coefficients of dx and dy are the partial derivatives.',
  partial: {
    variables: ['r', 'θ'],
    samples: [
      { r: 0.2, θ: 0.4 },
      { r: -0.3, θ: 1.1 },
      { r: 0.5, θ: 2.3 },
      { r: 0.1, θ: -0.7 },
      { r: -0.6, θ: 0.9 },
    ],
    targets: [
      inverse('∂r/∂x', 'r', 'x'),
      inverse('∂r/∂y', 'r', 'y'),
      inverse('∂θ/∂x', 'θ', 'x'),
      inverse('∂θ/∂y', 'θ', 'y'),
    ],
  },
  before: [
    [
      'Take differentials:',
      'dx = 2e^{2r}\\cos\\theta\\,dr - e^{2r}\\sin\\theta\\,d\\theta, \\qquad dy = 3e^{3r}\\sin\\theta\\,dr + e^{3r}\\cos\\theta\\,d\\theta',
    ],
    [
      'Solve for $dr$ and $d\\theta$ (the determinant is $e^{5r}(2\\cos^{2}\\theta + 3\\sin^{2}\\theta)$):',
      'dr = \\frac{e^{3r}\\cos\\theta\\,dx + e^{2r}\\sin\\theta\\,dy}{e^{5r}(2\\cos^{2}\\theta + 3\\sin^{2}\\theta)}, \\qquad d\\theta = \\frac{-3e^{3r}\\sin\\theta\\,dx + 2e^{2r}\\cos\\theta\\,dy}{e^{5r}(2\\cos^{2}\\theta + 3\\sin^{2}\\theta)}',
    ],
    ['Read off the coefficients:'],
  ],
  answers: [
    `cos(theta)/(e^(2r) ${D35})`,
    `sin(theta)/(e^(3r) ${D35})`,
    `-3sin(theta)/(e^(2r) ${D35})`,
    `2cos(theta)/(e^(3r) ${D35})`,
  ],
  labelsTex: [PD('r', 'x'), PD('r', 'y'), PD('\\theta', 'x'), PD('\\theta', 'y')],
});

const q36 = showThat(36, 4, SO, {
  instruction:
    'Given that U = U(x, y), x = 2r − s, y = r + 2s. Show that ∂²U/∂y∂x = (1/25)(2 ∂²U/∂r² + 3 ∂²U/∂r∂s − 2 ∂²U/∂s²) assuming U has continuous second partial derivatives.',
  problem:
    'U = U(x, y), \\quad x = 2r - s, \\quad y = r + 2s, \\qquad \\frac{\\partial^{2} U}{\\partial y \\partial x} = \\frac{1}{25}\\left(2\\frac{\\partial^{2} U}{\\partial r^{2}} + 3\\frac{\\partial^{2} U}{\\partial r \\partial s} - 2\\frac{\\partial^{2} U}{\\partial s^{2}}\\right)',
  technique: 'rn-second-order',
  difficulty: 3,
  method: `${SO_METHOD} Express U_rr, U_rs and U_ss in terms of Uₓₓ, Uₓᵧ and Uᵧᵧ, then substitute into the right-hand side.`,
  steps: [
    ['First derivatives:', 'U_{r} = 2U_{x} + U_{y}, \\qquad U_{s} = -U_{x} + 2U_{y}'],
    [
      'Second derivatives:',
      'U_{rr} = 4U_{xx} + 4U_{xy} + U_{yy}, \\quad U_{rs} = -2U_{xx} + 3U_{xy} + 2U_{yy}, \\quad U_{ss} = U_{xx} - 4U_{xy} + 4U_{yy}',
    ],
    ['Combine:', '2U_{rr} + 3U_{rs} - 2U_{ss} = (8 - 6 - 2)U_{xx} + (8 + 9 + 8)U_{xy} + (2 + 6 - 8)U_{yy} = 25U_{xy}'],
    ['Divide by 25 (with $U_{xy} = U_{yx}$).'],
  ],
});

const q37 = showThat(37, 4, SO, {
  instruction:
    'Given that f = f(x, y), x = u² + 3v, y = uv. Show that fᵤᵤ = 2 ∂f/∂x + 4u² ∂²f/∂x² + 4uv ∂²f/∂x∂y + v² ∂²f/∂y².',
  problem:
    'f = f(x, y), \\quad x = u^{2} + 3v, \\quad y = uv, \\qquad f_{uu} = 2\\frac{\\partial f}{\\partial x} + 4u^{2}\\frac{\\partial^{2} f}{\\partial x^{2}} + 4uv\\frac{\\partial^{2} f}{\\partial x \\partial y} + v^{2}\\frac{\\partial^{2} f}{\\partial y^{2}}',
  technique: 'rn-second-order',
  difficulty: 2,
  method: SO_METHOD,
  steps: [
    ['Since $x_{u} = 2u$ and $y_{u} = v$:', 'f_{u} = 2uf_{x} + vf_{y}'],
    ['Differentiate again with respect to $u$:', 'f_{uu} = 2f_{x} + 2u(2uf_{xx} + vf_{xy}) + v(2uf_{yx} + vf_{yy})'],
    ['With $f_{xy} = f_{yx}$:', 'f_{uu} = 2f_{x} + 4u^{2}f_{xx} + 4uvf_{xy} + v^{2}f_{yy}'],
  ],
});

/** All 41 parts of Tutorial 4, in the order printed. */
export const TUTORIAL4_ITEMS: PracticeItem[] = [
  q1,
  q2,
  q3,
  q4,
  q5,
  q6,
  ...q7,
  ...q8,
  ...q9,
  q10,
  ...q11to16,
  ...q17to21,
  q22,
  q23,
  ...q24to34,
  q35,
  q36,
  q37,
];
