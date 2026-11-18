/**
 * Tutorial 6 "Multiple Integration" (28 September 2026, Dr J. Mushanyu),
 * Questions 1–17, transcribed exactly as printed (checked against the page
 * images). Questions 18–34 are in tutorial6b.ts.
 *
 * Placement (approved):
 *   Q1(i)–(v), Q2(i)–(vi)                       → Iterated Integrals (§5.1)
 *   Q3, Q4, Q10, Q11(i)–(iii), Q12, Q13,
 *   Q14(i)–(iv), Q15(i)–(vii), Q16(i)–(ii), Q17 → Comparing Different Orders of Integration (§5.1.1)
 *   Q5–Q9                                       → Double Integrals and Volume (§5.2.1)
 *
 * The tutorial has no answer key (MR5-23): every walkthrough is an
 * APP-GENERATED SOLUTION, pending lecturer review.
 */
import type { PracticeItem } from '../../types';

import { MI_UNITS as U, type MiUnitId } from './ids';
import { miItem, type MiPracticeSpec } from './practice';
import { TUT6 } from './sources';

const SECTION_UNIT: Record<string, MiUnitId> = {
  '5-1': U.iterated,
  '5-1-1': U.orders,
  '5-2-1': U.doubleVolume,
  '5-3': U.triple,
  '5-4-1': U.jacobians,
};

export function part(
  question: number,
  sub: string | null,
  page: number,
  section: string,
  spec: MiPracticeSpec,
): PracticeItem {
  const q = `Q${question}`;
  return miItem(
    {
      id: sub ? `tut6-q${question}-${sub}` : `tut6-q${question}`,
      sourceType: 'tutorial-question',
      source: { document: TUT6, item: sub ? `${q}(${sub})` : q, page },
      sourceQuestion: q,
      ...(sub ? { sourceSubquestion: sub } : {}),
      sourceSection: section,
      unitId: SECTION_UNIT[section]!,
    },
    spec,
  );
}

const SWITCH_NOTE =
  'By §5.1, the order of integration affects the ease of integration, but not the value of the integral.';

// =============================================================================
// Q1 and Q2: Iterated Integrals (§5.1)
// =============================================================================

const Q1 = 'Evaluate the integral.';
const X = [0.7, 1.6, 2.4];

const q1: PracticeItem[] = [
  part(1, 'i', 1, '5-1', {
    instruction: Q1,
    problem: '\\int_{0}^{x}(2x - y)\\,dy',
    technique: 'mi-partial-integration',
    difficulty: 1,
    method: 'Hold x constant and integrate with respect to y, then substitute y = x and y = 0.',
    multiple: {
      forms: [{ f: '2x - y', vars: ['y'], limits: [['0', 'x']] }],
      free: { x: X },
      exact: '3x^2/2',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Hold $x$ constant and integrate with respect to $y$:', check: '2x y - y^2/2' },
      { say: 'Substitute the limits $y = x$ and $y = 0$:', check: '2x^2 - x^2/2' },
    ],
    answer: '3x^2/2',
  }),
  part(1, 'ii', 1, '5-1', {
    instruction: Q1,
    problem: '\\int_{x}^{x^{2}}\\frac{y}{x}\\,dy',
    technique: 'mi-partial-integration',
    difficulty: 1,
    method: 'Treat 1/x as a constant factor and integrate y with respect to y.',
    multiple: {
      forms: [{ f: 'y/x', vars: ['y'], limits: [['x', 'x^2']] }],
      free: { x: X },
      exact: '(x^3 - x)/2',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'With $x$ constant, $\\frac{1}{x}$ is a constant factor:', check: 'y^2/(2x)' },
      { say: 'Substitute $y = x^{2}$ and $y = x$:', check: 'x^4/(2x) - x^2/(2x)' },
    ],
    answer: '(x^3 - x)/2',
  }),
  part(1, 'iii', 1, '5-1', {
    instruction: Q1,
    problem: '\\int_{e^{y}}^{y}\\frac{y\\ln x}{x}\\,dx',
    technique: 'mi-partial-integration',
    difficulty: 2,
    method: 'Hold y constant. An anti-derivative of (ln x)/x is (ln x)²/2.',
    multiple: {
      forms: [{ f: 'y ln(x)/x', vars: ['x'], limits: [['e^y', 'y']] }],
      free: { y: [0.6, 1.3, 2.1] },
      exact: 'y((ln(y))^2 - y^2)/2',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'Hold $y$ constant. Since $\\frac{d}{dx}\\left[\\frac{(\\ln x)^{2}}{2}\\right] = \\frac{\\ln x}{x}$:',
        check: 'y (ln(x))^2/2',
      },
      { say: 'Substitute $x = y$ and $x = e^{y}$ (note $\\ln e^{y} = y$):', check: 'y (ln(y))^2/2 - y (y^2)/2' },
    ],
    answer: 'y((ln(y))^2 - y^2)/2',
    reviewIds: ['MR5-19'],
  }),
  part(1, 'iv', 1, '5-1', {
    instruction: Q1,
    problem: '\\int_{0}^{x^{3}} ye^{-\\frac{y}{x}}\\,dy',
    technique: 'mi-partial-integration',
    difficulty: 3,
    method: 'Hold x constant and integrate by parts with u = y and dv = e^(−y/x) dy.',
    multiple: {
      forms: [{ f: 'y e^(-y/x)', vars: ['y'], limits: [['0', 'x^3']] }],
      free: { x: X },
      exact: 'x^2 - (x^4 + x^2) e^(-x^2)',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'Hold $x$ constant. Integration by parts ($u = y$, $dv = e^{-y/x}dy$, $v = -xe^{-y/x}$) gives',
        check: '-x y e^(-y/x) - x^2 e^(-y/x)',
      },
      { say: 'Substitute $y = x^{3}$ and $y = 0$:', check: '(-x^4 e^(-x^2) - x^2 e^(-x^2)) - (-x^2)' },
    ],
    answer: 'x^2 - (x^4 + x^2) e^(-x^2)',
  }),
  part(1, 'v', 1, '5-1', {
    instruction: Q1,
    problem: '\\int_{0}^{\\cos x} y\\,dy',
    technique: 'mi-partial-integration',
    difficulty: 1,
    method: 'Integrate y with respect to y; the upper limit is cos x.',
    multiple: {
      forms: [{ f: 'y', vars: ['y'], limits: [['0', 'cos(x)']] }],
      free: { x: [0.4, 1.1, 2.0] },
      exact: '(cos(x))^2/2',
      answer: { kind: 'value' },
    },
    working: [{ say: 'An anti-derivative of $y$ is $\\frac{y^{2}}{2}$:', check: 'y^2/2' }],
    answer: '(cos(x))^2/2',
  }),
];

const Q2 = 'Evaluate the iterated integral.';

const q2: PracticeItem[] = [
  part(2, 'i', 1, '5-1', {
    instruction: Q2,
    problem: '\\int_{0}^{1}\\int_{0}^{2}(x + y)\\,dy\\,dx',
    technique: 'mi-iterated',
    difficulty: 1,
    method: 'Integrate with respect to y from 0 to 2, then with respect to x from 0 to 1.',
    multiple: {
      forms: [
        {
          f: 'x + y',
          vars: ['y', 'x'],
          limits: [
            ['0', '2'],
            ['0', '1'],
          ],
        },
      ],
      exact: '3',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Inner integral, holding $x$ constant:', check: 'x y + y^2/2' },
      { say: 'Substitute $y = 2$ and $y = 0$:', check: '2x + 2' },
      { say: 'Outer integral:', check: 'x^2 + 2x' },
      { say: 'Substitute $x = 1$ and $x = 0$:', check: '3' },
    ],
    answer: '3',
  }),
  part(2, 'ii', 1, '5-1', {
    instruction: Q2,
    problem: '\\int_{0}^{1}\\int_{0}^{x}\\sqrt{1 - x^{2}}\\,dy\\,dx',
    technique: 'mi-iterated',
    difficulty: 2,
    method: 'The integrand does not contain y, so the inner integral is y√(1 − x²); then substitute w = 1 − x².',
    multiple: {
      forms: [
        {
          f: 'sqrt(1 - x^2)',
          vars: ['y', 'x'],
          limits: [
            ['0', 'x'],
            ['0', '1'],
          ],
        },
      ],
      exact: '1/3',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Inner integral: $\\sqrt{1 - x^{2}}$ is constant in $y$:', check: 'x sqrt(1 - x^2)' },
      { say: 'Outer integral (substitute $w = 1 - x^{2}$):', check: '-(1 - x^2)^(3/2)/3' },
      { say: 'Substitute $x = 1$ and $x = 0$:', check: '1/3' },
    ],
    answer: '1/3',
  }),
  part(2, 'iii', 1, '5-1', {
    instruction: Q2,
    problem: '\\int_{0}^{2}\\int_{3y^{2} - 6y}^{2y - y^{2}} 3y\\,dx\\,dy',
    technique: 'mi-iterated',
    difficulty: 2,
    method: 'Integrate 3y with respect to x (y is constant), subtract the limits, then integrate in y.',
    multiple: {
      forms: [
        {
          f: '3y',
          vars: ['x', 'y'],
          limits: [
            ['3y^2 - 6y', '2y - y^2'],
            ['0', '2'],
          ],
        },
      ],
      exact: '16',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Inner integral, holding $y$ constant:', check: '3x y' },
      { say: 'Substitute $x = 2y - y^{2}$ and $x = 3y^{2} - 6y$:', check: '3y(2y - y^2) - 3y(3y^2 - 6y)' },
      { say: 'Simplify:', check: '24y^2 - 12y^3' },
      { say: 'Outer integral:', check: '8y^3 - 3y^4' },
      { say: 'Substitute $y = 2$ and $y = 0$:', check: '16' },
    ],
    answer: '16',
  }),
  part(2, 'iv', 1, '5-1', {
    instruction: Q2,
    problem: '\\int_{0}^{\\frac{\\pi}{2}}\\int_{0}^{\\sin\\theta}\\theta r\\,dr\\,d\\theta',
    technique: 'mi-iterated',
    difficulty: 3,
    method: 'Integrate θr with respect to r, then use sin²θ = (1 − cos 2θ)/2 and integrate by parts.',
    multiple: {
      forms: [
        {
          f: 'θ r',
          vars: ['r', 'θ'],
          limits: [
            ['0', 'sin(θ)'],
            ['0', 'pi/2'],
          ],
        },
      ],
      exact: 'pi^2/32 + 1/8',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Inner integral, holding $\\theta$ constant:', check: 'θ r^2/2' },
      { say: 'Substitute $r = \\sin\\theta$ and $r = 0$:', check: 'θ (sin(θ))^2/2' },
      {
        say: 'With $\\sin^{2}\\theta = \\frac{1 - \\cos 2\\theta}{2}$ and integration by parts:',
        check: 'θ^2/8 - θ sin(2θ)/8 - cos(2θ)/16',
      },
      { say: 'Substitute $\\theta = \\frac{\\pi}{2}$ and $\\theta = 0$:', check: 'pi^2/32 + 1/8' },
    ],
    answer: 'pi^2/32 + 1/8',
  }),
  part(2, 'v', 1, '5-1', {
    instruction: Q2,
    problem: '\\int_{1}^{4}\\int_{1}^{2}\\left(\\frac{x}{y} + \\frac{y}{x}\\right)dy\\,dx',
    technique: 'mi-iterated',
    difficulty: 2,
    method: 'Integrate with respect to y: x ln y + y²/(2x); then with respect to x.',
    multiple: {
      forms: [
        {
          f: 'x/y + y/x',
          vars: ['y', 'x'],
          limits: [
            ['1', '2'],
            ['1', '4'],
          ],
        },
      ],
      exact: '(21/2) ln(2)',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Inner integral, holding $x$ constant:', check: 'x ln(y) + y^2/(2x)' },
      { say: 'Substitute $y = 2$ and $y = 1$:', check: 'x ln(2) + 3/(2x)' },
      { say: 'Outer integral:', check: 'x^2 ln(2)/2 + (3/2) ln(x)' },
      { say: 'Substitute $x = 4$ and $x = 1$:', check: '(15/2) ln(2) + (3/2) ln(4)' },
    ],
    answer: '(21/2) ln(2)',
  }),
  part(2, 'vi', 1, '5-1', {
    instruction: Q2,
    problem: '\\int_{1}^{3}\\int_{1}^{5}\\frac{\\ln y}{xy}\\,dy\\,dx',
    technique: 'mi-iterated',
    difficulty: 2,
    method: 'Hold x constant; an anti-derivative of (ln y)/y is (ln y)²/2.',
    multiple: {
      forms: [
        {
          f: 'ln(y)/(x y)',
          vars: ['y', 'x'],
          limits: [
            ['1', '5'],
            ['1', '3'],
          ],
        },
      ],
      exact: 'ln(3) (ln(5))^2/2',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Inner integral, holding $x$ constant:', check: '(ln(y))^2/(2x)' },
      { say: 'Substitute $y = 5$ and $y = 1$:', check: '(ln(5))^2/(2x)' },
      { say: 'Outer integral:', check: '(ln(5))^2 ln(x)/2' },
    ],
    answer: 'ln(3) (ln(5))^2/2',
  }),
];

// =============================================================================
// Q3 and Q4: reversing the order over a rectangle (§5.1.1)
// =============================================================================

const q34: PracticeItem[] = [
  part(3, null, 1, '5-1-1', {
    instruction: 'Evaluate',
    problem: '\\int_{0}^{1}\\int_{0}^{\\pi} x^{2}\\cos xy\\,dx\\,dy',
    technique: 'mi-rectangle-order',
    difficulty: 2,
    method:
      'The region is a rectangle, so reverse the order: integrating x² cos xy with respect to y first gives x sin xy.',
    multiple: {
      forms: [
        {
          f: 'x^2 cos(x y)',
          vars: ['x', 'y'],
          limits: [
            ['0', 'pi'],
            ['0', '1'],
          ],
          label: 'the order dx dy',
        },
        {
          f: 'x^2 cos(x y)',
          vars: ['y', 'x'],
          limits: [
            ['0', '1'],
            ['0', 'pi'],
          ],
          label: 'the order dy dx',
        },
      ],
      exact: 'pi',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: `The region is the rectangle $0 \\le x \\le \\pi$, $0 \\le y \\le 1$. ${SWITCH_NOTE} Reverse the order:`,
        check: '0 <= y <= 1, 0 <= x <= pi',
      },
      { say: 'Inner integral with respect to $y$, holding $x$ constant:', check: 'x sin(x y)' },
      { say: 'Substitute $y = 1$ and $y = 0$:', check: 'x sin(x)' },
      { say: 'Outer integral, by parts:', check: 'sin(x) - x cos(x)' },
      { say: 'Substitute $x = \\pi$ and $x = 0$:', check: 'pi' },
    ],
    answer: 'pi',
    reviewIds: ['MR5-21'],
  }),
  part(4, null, 1, '5-1-1', {
    instruction: 'Given that the equation holds, determine the values of $a$, $b$ and $p$.',
    problem:
      '\\int_{0}^{1}\\int_{-\\frac{1}{2}}^{2}(x + y)e^{x^{2} + 2xy}\\,dy\\,dx = \\frac{1}{a}e^{p} + \\frac{b}{2}',
    technique: 'mi-rectangle-order',
    difficulty: 3,
    method: 'Reverse the order: with respect to x, (x + y)e^(x² + 2xy) is half the derivative of e^(x² + 2xy).',
    multiple: {
      forms: [
        {
          f: '(x + y) e^(x^2 + 2x y)',
          vars: ['y', 'x'],
          limits: [
            ['-1/2', '2'],
            ['0', '1'],
          ],
          label: 'the order dy dx',
        },
        {
          f: '(x + y) e^(x^2 + 2x y)',
          vars: ['x', 'y'],
          limits: [
            ['0', '1'],
            ['-1/2', '2'],
          ],
          label: 'the order dx dy',
        },
      ],
      exact: 'e^5/4 - 3/2',
      answer: { kind: 'constants', names: ['a', 'b', 'p'], form: '(1/a) e^p + b/2' },
    },
    working: [
      { say: `The region is a rectangle. ${SWITCH_NOTE} Reverse the order:`, check: '0 <= x <= 1, -1/2 <= y <= 2' },
      {
        say: 'With $y$ constant, $\\frac{\\partial}{\\partial x}e^{x^{2} + 2xy} = 2(x + y)e^{x^{2} + 2xy}$, so',
        check: 'e^(x^2 + 2x y)/2',
      },
      { say: 'Substitute $x = 1$ and $x = 0$:', check: 'e^(1 + 2y)/2 - 1/2' },
      { say: 'Outer integral:', check: 'e^(1 + 2y)/4 - y/2' },
      { say: 'Substitute $y = 2$ and $y = -\\frac{1}{2}$:', check: 'e^5/4 - 3/2' },
      { say: 'Compare with $\\frac{1}{a}e^{p} + \\frac{b}{2}$.' },
    ],
    answer: 'a = 4, b = -3, p = 5',
    reviewIds: ['MR5-17', 'MR5-21'],
  }),
];

// =============================================================================
// Q5–Q9: double integrals over a region (§5.2.1)
// =============================================================================

const q59: PracticeItem[] = [
  part(5, null, 1, '5-2-1', {
    instruction:
      'Let $f(x, y) = x^{2} + y^{2}$. Then the integral of $f$ over the region bounded by the straight line $y = x$ and the parabola $y = x^{2}$ is $\\frac{3}{a}$. Determine the value of $a$.',
    problem: '\\iint_{R}(x^{2} + y^{2})\\,dA = \\frac{3}{a}',
    technique: 'mi-double-region',
    difficulty: 2,
    method: 'The curves meet at x = 0 and x = 1, and x² ≤ y ≤ x there. Integrate in y, then in x.',
    multiple: {
      forms: [
        {
          f: 'x^2 + y^2',
          vars: ['y', 'x'],
          limits: [
            ['x^2', 'x'],
            ['0', '1'],
          ],
          label: 'the order dy dx',
        },
        {
          f: 'x^2 + y^2',
          vars: ['x', 'y'],
          limits: [
            ['y', 'sqrt(y)'],
            ['0', '1'],
          ],
          label: 'the order dx dy',
        },
      ],
      exact: '3/35',
      answer: { kind: 'constants', names: ['a'], form: '3/a' },
    },
    working: [
      {
        say: 'The curves meet where $x^{2} = x$, at $x = 0$ and $x = 1$; between them $x^{2} \\le x$. So the region is',
        check: 'x^2 <= y <= x, 0 <= x <= 1',
      },
      { say: 'Inner integral, holding $x$ constant:', check: 'x^2 y + y^3/3' },
      { say: 'Substitute $y = x$ and $y = x^{2}$:', check: 'x^3 + x^3/3 - x^4 - x^6/3' },
      { say: 'Integrate from $x = 0$ to $x = 1$:', check: '3/35' },
    ],
    answer: 'a = 35',
    reviewIds: ['MR5-17'],
  }),
  part(6, null, 1, '5-2-1', {
    instruction:
      'Evaluate the double integral, where $D$ is the region bounded by the line $y = x - 2$ and the parabola $x = y^{2}$.',
    problem: '\\iint_{D} y\\,dA',
    technique: 'mi-double-region',
    difficulty: 2,
    method: 'The curves meet at y = −1 and y = 2. Use the order dx dy: y² ≤ x ≤ y + 2.',
    multiple: {
      forms: [
        {
          f: 'y',
          vars: ['x', 'y'],
          limits: [
            ['y^2', 'y + 2'],
            ['-1', '2'],
          ],
          label: 'the order dx dy',
        },
      ],
      exact: '9/4',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The line is $x = y + 2$. It meets $x = y^{2}$ where $y^{2} = y + 2$, at $y = -1$ and $y = 2$. With horizontal strips:',
        check: 'y^2 <= x <= y + 2, -1 <= y <= 2',
      },
      { say: 'Inner integral, holding $y$ constant:', check: 'x y' },
      { say: 'Substitute $x = y + 2$ and $x = y^{2}$:', check: 'y(y + 2 - y^2)' },
      { say: 'Outer integral:', check: 'y^3/3 + y^2 - y^4/4' },
      { say: 'Substitute $y = 2$ and $y = -1$:', check: '9/4' },
    ],
    answer: '9/4',
  }),
  part(7, null, 1, '5-2-1', {
    instruction:
      'Evaluate the double integral, where $D$ is the region bounded by the line $y = x - 1$ and the parabola $y^{2} = 2x + 6$.',
    problem: '\\iint_{D} xy\\,dA',
    technique: 'mi-double-region',
    difficulty: 3,
    method: 'The curves meet at y = −2 and y = 4. Use the order dx dy: (y² − 6)/2 ≤ x ≤ y + 1.',
    multiple: {
      forms: [
        {
          f: 'x y',
          vars: ['x', 'y'],
          limits: [
            ['(y^2 - 6)/2', 'y + 1'],
            ['-2', '4'],
          ],
          label: 'the order dx dy',
        },
      ],
      exact: '36',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'Write both curves as $x$ in terms of $y$: $x = y + 1$ and $x = \\frac{y^{2} - 6}{2}$. They meet where $y^{2} - 2y - 8 = 0$, at $y = -2$ and $y = 4$:',
        check: '(y^2 - 6)/2 <= x <= y + 1, -2 <= y <= 4',
      },
      { say: 'Inner integral, holding $y$ constant:', check: 'x^2 y/2' },
      { say: 'Substitute the limits:', check: '(y/2)((y + 1)^2 - (y^2 - 6)^2/4)' },
      { say: 'Integrate from $y = -2$ to $y = 4$:', check: '36' },
    ],
    answer: '36',
  }),
  part(8, null, 1, '5-2-1', {
    instruction: 'Evaluate the double integral, where $D$ is the region bounded by $y = 0$, $y = x^{2}$ and $x = 1$.',
    problem: '\\iint_{D} x\\cos y\\,dA',
    technique: 'mi-double-region',
    difficulty: 2,
    method: 'Use the order dy dx: 0 ≤ y ≤ x², 0 ≤ x ≤ 1; then substitute w = x².',
    multiple: {
      forms: [
        {
          f: 'x cos(y)',
          vars: ['y', 'x'],
          limits: [
            ['0', 'x^2'],
            ['0', '1'],
          ],
          label: 'the order dy dx',
        },
      ],
      exact: '(1 - cos(1))/2',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'With vertical strips:', check: '0 <= y <= x^2, 0 <= x <= 1' },
      { say: 'Inner integral, holding $x$ constant:', check: 'x sin(y)' },
      { say: 'Substitute $y = x^{2}$ and $y = 0$:', check: 'x sin(x^2)' },
      { say: 'Outer integral (substitute $w = x^{2}$):', check: '-cos(x^2)/2' },
    ],
    answer: '(1 - cos(1))/2',
  }),
  part(9, null, 2, '5-2-1', {
    instruction:
      'Evaluate the double integral, where $D$ is the region bounded by the lines $y = x$, $y = 4$ and $x = 0$.',
    problem: '\\iint_{D} y^{2}e^{xy}\\,dA',
    technique: 'mi-double-region',
    difficulty: 3,
    method: 'Use the order dx dy (0 ≤ x ≤ y, 0 ≤ y ≤ 4): with y constant, y²e^(xy) has anti-derivative y e^(xy).',
    multiple: {
      forms: [
        {
          f: 'y^2 e^(x y)',
          vars: ['x', 'y'],
          limits: [
            ['0', 'y'],
            ['0', '4'],
          ],
          label: 'the order dx dy',
        },
      ],
      exact: '(e^16 - 17)/2',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The order $dy\\,dx$ would need $\\int y^{2}e^{xy}dy$, which is harder. With horizontal strips:',
        check: '0 <= x <= y, 0 <= y <= 4',
      },
      { say: 'Inner integral, holding $y$ constant:', check: 'y e^(x y)' },
      { say: 'Substitute $x = y$ and $x = 0$:', check: 'y e^(y^2) - y' },
      { say: 'Outer integral:', check: 'e^(y^2)/2 - y^2/2' },
      { say: 'Substitute $y = 4$ and $y = 0$:', check: 'e^16/2 - 8 - 1/2' },
    ],
    answer: '(e^16 - 17)/2',
  }),
];

// =============================================================================
// Q10–Q17: switching the order (§5.1.1)
// =============================================================================

const SKETCH = 'Sketch the region $R$ of integration and switch the order of integration.';
const AREA =
  'Sketch the region $R$ whose area is given by the iterated integral. Then switch the order of integration and show that both orders yield the same area.';
const Q15 = 'Evaluate the iterated integral. (Note it is necessary to switch the order of integration)';

/** Region-only forms (f = 1): the printed order and the reversed order. */
const region = (given: [string[], [string, string][]], reversed: [string[], [string, string][]]) => [
  { f: '1', vars: given[0], limits: given[1], label: `the order ${given[0].map((v) => `d${v}`).join(' ')}` },
  { f: '1', vars: reversed[0], limits: reversed[1], label: `the order ${reversed[0].map((v) => `d${v}`).join(' ')}` },
];

const q1017: PracticeItem[] = [
  part(10, null, 2, '5-1-1', {
    instruction:
      'Given that $f$ is a continuous function of two variables where the equation holds, determine $a$, $b$, $g(y)$ and $h(y)$.',
    problem:
      '\\int_{0}^{3}\\int_{\\frac{1}{6}x^{2}}^{\\frac{1}{2}x} f(x, y)\\,dy\\,dx = \\int_{a}^{b}\\int_{g(y)}^{h(y)} f(x, y)\\,dx\\,dy',
    technique: 'mi-sketch-switch',
    difficulty: 2,
    method: 'The curves y = x²/6 and y = x/2 meet at x = 0 and x = 3; solve each for x.',
    multiple: {
      forms: region(
        [
          ['y', 'x'],
          [
            ['x^2/6', 'x/2'],
            ['0', '3'],
          ],
        ],
        [
          ['x', 'y'],
          [
            ['2y', 'sqrt(6y)'],
            ['0', '3/2'],
          ],
        ],
      ),
      answer: { kind: 'limits', form: 1, named: ['a', 'b', 'g', 'h'] },
    },
    working: [
      {
        say: 'The region lies between $y = \\frac{1}{6}x^{2}$ (below) and $y = \\frac{1}{2}x$ (above), which meet at $x = 0$ and $x = 3$, that is at $(0, 0)$ and $(3, \\frac{3}{2})$.',
      },
      {
        say: 'Solve each curve for $x$: $y = \\frac{1}{2}x$ gives $x = 2y$ (left) and $y = \\frac{1}{6}x^{2}$ gives $x = \\sqrt{6y}$ (right). With horizontal strips:',
        check: '2y <= x <= sqrt(6y), 0 <= y <= 3/2',
      },
    ],
    answer: 'a = 0, b = 3/2, g(y) = 2y, h(y) = sqrt(6y)',
    answerTex: 'a = 0, \\quad b = \\frac{3}{2}, \\quad g(y) = 2y, \\quad h(y) = \\sqrt{6y}',
  }),
  part(11, 'i', 2, '5-1-1', {
    instruction: SKETCH,
    problem: '\\int_{0}^{4}\\int_{0}^{y} f(x, y)\\,dx\\,dy',
    technique: 'mi-sketch-switch',
    difficulty: 1,
    method: 'R is the triangle 0 ≤ x ≤ y ≤ 4 with corners (0, 0), (0, 4) and (4, 4).',
    multiple: {
      forms: region(
        [
          ['x', 'y'],
          [
            ['0', 'y'],
            ['0', '4'],
          ],
        ],
        [
          ['y', 'x'],
          [
            ['x', '4'],
            ['0', '4'],
          ],
        ],
      ),
      answer: { kind: 'limits', form: 1 },
    },
    working: [
      {
        say: 'Sketch (self-check): $R$ is the triangle with corners $(0, 0)$, $(0, 4)$ and $(4, 4)$, between the $y$-axis and the line $y = x$.',
        check: '0 <= x <= y, 0 <= y <= 4',
      },
      { say: 'With vertical strips, $y$ runs from the line $y = x$ up to $y = 4$:', check: 'x <= y <= 4, 0 <= x <= 4' },
    ],
    answer: 'x <= y <= 4, 0 <= x <= 4',
    grading: 'partial',
  }),
  part(11, 'ii', 2, '5-1-1', {
    instruction: SKETCH,
    problem: '\\int_{0}^{4}\\int_{\\sqrt{y}}^{2} f(x, y)\\,dx\\,dy',
    technique: 'mi-sketch-switch',
    difficulty: 2,
    method: 'x = √y is the curve y = x²; R lies between it and x = 2.',
    multiple: {
      forms: region(
        [
          ['x', 'y'],
          [
            ['sqrt(y)', '2'],
            ['0', '4'],
          ],
        ],
        [
          ['y', 'x'],
          [
            ['0', 'x^2'],
            ['0', '2'],
          ],
        ],
      ),
      answer: { kind: 'limits', form: 1 },
    },
    working: [
      {
        say: 'Sketch (self-check): $R$ lies to the right of the parabola $y = x^{2}$ ($x = \\sqrt{y}$) and to the left of $x = 2$, for $0 \\le y \\le 4$.',
      },
      { say: 'With vertical strips, $y$ runs from $0$ up to the parabola:', check: '0 <= y <= x^2, 0 <= x <= 2' },
    ],
    answer: '0 <= y <= x^2, 0 <= x <= 2',
    grading: 'partial',
  }),
  part(11, 'iii', 2, '5-1-1', {
    instruction: SKETCH,
    problem: '\\int_{-1}^{1}\\int_{x^{2}}^{1} f(x, y)\\,dy\\,dx',
    technique: 'mi-sketch-switch',
    difficulty: 2,
    method: 'R lies between the parabola y = x² and the line y = 1; solve y = x² for x.',
    multiple: {
      forms: region(
        [
          ['y', 'x'],
          [
            ['x^2', '1'],
            ['-1', '1'],
          ],
        ],
        [
          ['x', 'y'],
          [
            ['-sqrt(y)', 'sqrt(y)'],
            ['0', '1'],
          ],
        ],
      ),
      answer: { kind: 'limits', form: 1 },
    },
    working: [
      { say: 'Sketch (self-check): $R$ lies above the parabola $y = x^{2}$ and below the line $y = 1$.' },
      {
        say: 'With horizontal strips, $x$ runs from $-\\sqrt{y}$ to $\\sqrt{y}$:',
        check: '-sqrt(y) <= x <= sqrt(y), 0 <= y <= 1',
      },
    ],
    answer: '-sqrt(y) <= x <= sqrt(y), 0 <= y <= 1',
    grading: 'partial',
  }),
  part(12, null, 2, '5-1-1', {
    instruction: 'Given that the equation holds, determine the values of $a$ and $b$.',
    problem: '\\int_{0}^{1}\\int_{2y}^{2}\\frac{x}{1 + x^{3}}\\,dx\\,dy = \\frac{a}{b}\\ln b',
    technique: 'mi-switch-evaluate',
    difficulty: 3,
    method: 'Reverse the order: 0 ≤ y ≤ x/2, 0 ≤ x ≤ 2. The y-integral gives x²/(2(1 + x³)).',
    multiple: {
      forms: [
        {
          f: 'x/(1 + x^3)',
          vars: ['x', 'y'],
          limits: [
            ['2y', '2'],
            ['0', '1'],
          ],
          label: 'the order dx dy',
        },
        {
          f: 'x/(1 + x^3)',
          vars: ['y', 'x'],
          limits: [
            ['0', 'x/2'],
            ['0', '2'],
          ],
          label: 'the order dy dx',
        },
      ],
      exact: 'ln(3)/3',
      answer: { kind: 'constants', names: ['a', 'b'], form: '(a/b) ln(b)' },
    },
    working: [
      {
        say: 'The inner integral $\\int \\frac{x}{1 + x^{3}}dx$ would need partial fractions; reversing the order is simpler. $R$ is the triangle with corners $(0, 0)$, $(2, 0)$ and $(2, 1)$:',
        check: '0 <= y <= x/2, 0 <= x <= 2',
      },
      { say: 'Inner integral, holding $x$ constant:', check: 'x^2/(2(1 + x^3))' },
      { say: 'Outer integral (substitute $w = 1 + x^{3}$):', check: 'ln(1 + x^3)/6' },
      { say: 'Substitute $x = 2$ and $x = 0$:', check: 'ln(9)/6' },
      { say: 'So the integral is $\\frac{1}{6}\\ln 9 = \\frac{1}{3}\\ln 3$.' },
    ],
    answer: 'a = 1, b = 3',
    reviewIds: ['MR5-16'],
  }),
  part(13, null, 2, '5-1-1', {
    instruction: 'Given that the equation holds, determine the values of $a$ and $b$.',
    problem: '\\int_{-1}^{1}\\int_{|y|}^{1}(x + y)^{2}\\,dx\\,dy = \\frac{a}{b}',
    technique: 'mi-switch-evaluate',
    difficulty: 3,
    method: 'Reverse the order: the region |y| ≤ x ≤ 1 is −x ≤ y ≤ x, 0 ≤ x ≤ 1.',
    multiple: {
      forms: [
        {
          f: '(x + y)^2',
          vars: ['x', 'y'],
          limits: [
            ['|y|', '1'],
            ['-1', '1'],
          ],
          label: 'the order dx dy',
        },
        {
          f: '(x + y)^2',
          vars: ['y', 'x'],
          limits: [
            ['-x', 'x'],
            ['0', '1'],
          ],
          label: 'the order dy dx',
        },
      ],
      exact: '2/3',
      answer: { kind: 'constants', names: ['a', 'b'], form: 'a/b' },
    },
    working: [
      {
        say: 'The limit $|y|$ makes the order $dx\\,dy$ awkward. $R$ is the triangle with corners $(0, 0)$, $(1, -1)$ and $(1, 1)$:',
        check: '-x <= y <= x, 0 <= x <= 1',
      },
      { say: 'Inner integral, holding $x$ constant:', check: '(x + y)^3/3' },
      { say: 'Substitute $y = x$ and $y = -x$:', check: '8x^3/3' },
      { say: 'Integrate from $x = 0$ to $x = 1$:', check: '2/3' },
    ],
    answer: 'a = 2, b = 3',
    reviewIds: ['MR5-17'],
  }),
  part(14, 'i', 2, '5-1-1', {
    instruction: AREA,
    problem: '\\int_{0}^{1}\\int_{0}^{2}dy\\,dx',
    technique: 'mi-sketch-switch',
    difficulty: 1,
    method: 'R is the rectangle 0 ≤ x ≤ 1, 0 ≤ y ≤ 2; both orders have constant limits.',
    multiple: {
      forms: region(
        [
          ['y', 'x'],
          [
            ['0', '2'],
            ['0', '1'],
          ],
        ],
        [
          ['x', 'y'],
          [
            ['0', '1'],
            ['0', '2'],
          ],
        ],
      ),
      exact: '2',
      answer: { kind: 'limits', form: 1 },
    },
    working: [
      {
        say: 'Sketch (self-check): $R$ is the rectangle with corners $(0, 0)$, $(1, 0)$, $(1, 2)$ and $(0, 2)$. Reversed:',
        check: '0 <= x <= 1, 0 <= y <= 2',
      },
      { say: 'Both orders give the area:', check: '2' },
    ],
    answer: '0 <= x <= 1, 0 <= y <= 2',
    grading: 'partial',
  }),
  part(14, 'ii', 2, '5-1-1', {
    instruction: AREA,
    problem: '\\int_{0}^{2}\\int_{\\frac{x}{2}}^{1}dy\\,dx',
    technique: 'mi-sketch-switch',
    difficulty: 1,
    method: 'R is the triangle between y = x/2 and y = 1 for 0 ≤ x ≤ 2; solve y = x/2 for x.',
    multiple: {
      forms: region(
        [
          ['y', 'x'],
          [
            ['x/2', '1'],
            ['0', '2'],
          ],
        ],
        [
          ['x', 'y'],
          [
            ['0', '2y'],
            ['0', '1'],
          ],
        ],
      ),
      exact: '1',
      answer: { kind: 'limits', form: 1 },
    },
    working: [
      {
        say: 'Sketch (self-check): $R$ is the triangle with corners $(0, 0)$, $(0, 1)$ and $(2, 1)$. With horizontal strips, $x$ runs from $0$ to $2y$:',
        check: '0 <= x <= 2y, 0 <= y <= 1',
      },
      {
        say: 'Order $dy\\,dx$: $\\int_{0}^{2}\\left(1 - \\frac{x}{2}\\right)dx = 1$. Order $dx\\,dy$: $\\int_{0}^{1} 2y\\,dy = 1$. Both orders give',
        check: '1',
      },
    ],
    answer: '0 <= x <= 2y, 0 <= y <= 1',
    grading: 'partial',
  }),
  part(14, 'iii', 2, '5-1-1', {
    instruction: AREA,
    problem: '\\int_{0}^{4}\\int_{\\sqrt{x}}^{2}dy\\,dx',
    technique: 'mi-sketch-switch',
    difficulty: 2,
    method: 'R lies above y = √x and below y = 2; y = √x is x = y².',
    multiple: {
      forms: region(
        [
          ['y', 'x'],
          [
            ['sqrt(x)', '2'],
            ['0', '4'],
          ],
        ],
        [
          ['x', 'y'],
          [
            ['0', 'y^2'],
            ['0', '2'],
          ],
        ],
      ),
      exact: '8/3',
      answer: { kind: 'limits', form: 1 },
    },
    working: [
      {
        say: 'Sketch (self-check): $R$ is bounded by the $y$-axis, the line $y = 2$ and the curve $y = \\sqrt{x}$ (that is, $x = y^{2}$). With horizontal strips:',
        check: '0 <= x <= y^2, 0 <= y <= 2',
      },
      {
        say: 'Order $dy\\,dx$: $\\int_{0}^{4}(2 - \\sqrt{x})dx = 8 - \\frac{16}{3}$. Order $dx\\,dy$: $\\int_{0}^{2} y^{2}dy$. Both give',
        check: '8/3',
      },
    ],
    answer: '0 <= x <= y^2, 0 <= y <= 2',
    grading: 'partial',
  }),
  part(14, 'iv', 2, '5-1-1', {
    instruction: AREA,
    problem: '\\int_{-2}^{2}\\int_{0}^{4 - y^{2}}dx\\,dy',
    technique: 'mi-sketch-switch',
    difficulty: 2,
    method: 'R lies between the y-axis and the parabola x = 4 − y²; solve it for y: y = ±√(4 − x).',
    multiple: {
      forms: region(
        [
          ['x', 'y'],
          [
            ['0', '4 - y^2'],
            ['-2', '2'],
          ],
        ],
        [
          ['y', 'x'],
          [
            ['-sqrt(4 - x)', 'sqrt(4 - x)'],
            ['0', '4'],
          ],
        ],
      ),
      exact: '32/3',
      answer: { kind: 'limits', form: 1 },
    },
    working: [
      {
        say: 'Sketch (self-check): $R$ lies between the $y$-axis and the parabola $x = 4 - y^{2}$, which opens to the left with vertex $(4, 0)$. With vertical strips:',
        check: '-sqrt(4 - x) <= y <= sqrt(4 - x), 0 <= x <= 4',
      },
      {
        say: 'Order $dx\\,dy$: $\\int_{-2}^{2}(4 - y^{2})dy$. Order $dy\\,dx$: $\\int_{0}^{4} 2\\sqrt{4 - x}\\,dx$. Both give',
        check: '32/3',
      },
    ],
    answer: '-sqrt(4 - x) <= y <= sqrt(4 - x), 0 <= x <= 4',
    grading: 'partial',
  }),
];

/** Q15(i)–(vii): the printed form, the reversed form, the reversed limits and the working. */
function q15(
  sub: string,
  problem: string,
  f: string,
  given: [string[], [string, string][]],
  reversed: [string[], [string, string][]],
  exact: string,
  reversedLimits: string,
  working: { say: string; check?: string }[],
  method: string,
  difficulty: 1 | 2 | 3,
  reviewIds?: string[],
): PracticeItem {
  return part(15, sub, 2, '5-1-1', {
    instruction: Q15,
    problem,
    technique: 'mi-switch-evaluate',
    difficulty,
    method,
    multiple: {
      forms: [
        { f, vars: given[0], limits: given[1], label: 'the printed order' },
        { f, vars: reversed[0], limits: reversed[1], label: 'the reversed order' },
      ],
      exact,
      answer: { kind: 'value' },
    },
    working: [{ say: 'Sketch the region and reverse the order of integration:', check: reversedLimits }, ...working],
    answer: exact,
    ...(reviewIds ? { reviewIds } : {}),
  });
}

const q15items: PracticeItem[] = [
  q15(
    'i',
    '\\int_{0}^{2}\\int_{x}^{2} x\\sqrt{1 + y^{3}}\\,dy\\,dx',
    'x sqrt(1 + y^3)',
    [
      ['y', 'x'],
      [
        ['x', '2'],
        ['0', '2'],
      ],
    ],
    [
      ['x', 'y'],
      [
        ['0', 'y'],
        ['0', '2'],
      ],
    ],
    '26/9',
    '0 <= x <= y, 0 <= y <= 2',
    [
      { say: 'Inner integral with respect to $x$, holding $y$ constant:', check: 'x^2 sqrt(1 + y^3)/2' },
      { say: 'Substitute $x = y$ and $x = 0$:', check: 'y^2 sqrt(1 + y^3)/2' },
      { say: 'Outer integral (substitute $w = 1 + y^{3}$):', check: '(1 + y^3)^(3/2)/9' },
      { say: 'Substitute $y = 2$ and $y = 0$:', check: '(27 - 1)/9' },
    ],
    '∫√(1 + y³) dy is not elementary; with x first, the factor y² appears and w = 1 + y³ works.',
    2,
  ),
  q15(
    'ii',
    '\\int_{0}^{2}\\int_{x}^{2} e^{-y^{2}}\\,dy\\,dx',
    'e^(-y^2)',
    [
      ['y', 'x'],
      [
        ['x', '2'],
        ['0', '2'],
      ],
    ],
    [
      ['x', 'y'],
      [
        ['0', 'y'],
        ['0', '2'],
      ],
    ],
    '(1 - e^(-4))/2',
    '0 <= x <= y, 0 <= y <= 2',
    [
      { say: 'Inner integral with respect to $x$:', check: 'x e^(-y^2)' },
      { say: 'Substitute $x = y$ and $x = 0$:', check: 'y e^(-y^2)' },
      { say: 'Outer integral:', check: '-e^(-y^2)/2' },
    ],
    'e^(−y²) has no elementary anti-derivative in y; integrating in x first gives y e^(−y²).',
    2,
  ),
  q15(
    'iii',
    '\\int_{0}^{1}\\int_{y}^{1}\\sin x^{2}\\,dx\\,dy',
    'sin(x^2)',
    [
      ['x', 'y'],
      [
        ['y', '1'],
        ['0', '1'],
      ],
    ],
    [
      ['y', 'x'],
      [
        ['0', 'x'],
        ['0', '1'],
      ],
    ],
    '(1 - cos(1))/2',
    '0 <= y <= x, 0 <= x <= 1',
    [
      { say: 'Inner integral with respect to $y$:', check: 'y sin(x^2)' },
      { say: 'Substitute $y = x$ and $y = 0$:', check: 'x sin(x^2)' },
      { say: 'Outer integral:', check: '-cos(x^2)/2' },
    ],
    'sin x² has no elementary anti-derivative; integrating in y first gives x sin x².',
    2,
  ),
  q15(
    'iv',
    '\\int_{0}^{2}\\int_{y^{2}}^{4}\\sqrt{x}\\sin x\\,dx\\,dy',
    'sqrt(x) sin(x)',
    [
      ['x', 'y'],
      [
        ['y^2', '4'],
        ['0', '2'],
      ],
    ],
    [
      ['y', 'x'],
      [
        ['0', 'sqrt(x)'],
        ['0', '4'],
      ],
    ],
    'sin(4) - 4cos(4)',
    '0 <= y <= sqrt(x), 0 <= x <= 4',
    [
      { say: 'Inner integral with respect to $y$:', check: 'y sqrt(x) sin(x)' },
      { say: 'Substitute $y = \\sqrt{x}$ and $y = 0$:', check: 'x sin(x)' },
      { say: 'Outer integral, by parts:', check: 'sin(x) - x cos(x)' },
    ],
    '√x sin x has no elementary anti-derivative; with y first, √x·√x = x and x sin x integrates by parts.',
    3,
  ),
  q15(
    'v',
    '\\int_{0}^{1}\\int_{y}^{1}\\frac{dx\\,dy}{1 + x^{4}}',
    '1/(1 + x^4)',
    [
      ['x', 'y'],
      [
        ['y', '1'],
        ['0', '1'],
      ],
    ],
    [
      ['y', 'x'],
      [
        ['0', 'x'],
        ['0', '1'],
      ],
    ],
    'pi/8',
    '0 <= y <= x, 0 <= x <= 1',
    [
      { say: 'Inner integral with respect to $y$:', check: 'y/(1 + x^4)' },
      { say: 'Substitute $y = x$ and $y = 0$:', check: 'x/(1 + x^4)' },
      { say: 'Outer integral (substitute $w = x^{2}$):', check: 'arctan(x^2)/2' },
    ],
    'With y first the integrand becomes x/(1 + x⁴); then w = x² gives an inverse tangent.',
    3,
  ),
  q15(
    'vi',
    '\\int_{0}^{\\pi}\\int_{x}^{\\pi}\\frac{\\sin y}{y}\\,dy\\,dx',
    'sin(y)/y',
    [
      ['y', 'x'],
      [
        ['x', 'pi'],
        ['0', 'pi'],
      ],
    ],
    [
      ['x', 'y'],
      [
        ['0', 'y'],
        ['0', 'pi'],
      ],
    ],
    '2',
    '0 <= x <= y, 0 <= y <= pi',
    [
      { say: 'Inner integral with respect to $x$:', check: 'x sin(y)/y' },
      { say: 'Substitute $x = y$ and $x = 0$:', check: 'sin(y)' },
      { say: 'Outer integral:', check: '-cos(y)' },
    ],
    '(sin y)/y has no elementary anti-derivative; with x first the factor y cancels.',
    2,
  ),
  q15(
    'vii',
    '\\int_{0}^{1}\\int_{y}^{1} e^{-x^{2}}\\,dx\\,dy',
    'e^(-x^2)',
    [
      ['x', 'y'],
      [
        ['y', '1'],
        ['0', '1'],
      ],
    ],
    [
      ['y', 'x'],
      [
        ['0', 'x'],
        ['0', '1'],
      ],
    ],
    '(1 - e^(-1))/2',
    '0 <= y <= x, 0 <= x <= 1',
    [
      {
        say: 'This is the integral of Example 5.2.1 in the order $dx\\,dy$. Inner integral with respect to $y$:',
        check: 'y e^(-x^2)',
      },
      { say: 'Substitute $y = x$ and $y = 0$:', check: 'x e^(-x^2)' },
      { say: 'Outer integral:', check: '-e^(-x^2)/2' },
    ],
    'As in Example 5.2.1: integrating in y first gives x e^(−x²).',
    2,
    ['MR5-20'],
  ),
];

const q1617: PracticeItem[] = [
  part(16, 'i', 2, '5-1-1', {
    instruction: 'Evaluate',
    problem: '\\int_{0}^{1}\\int_{\\sqrt{x}}^{1} e^{-\\frac{x}{y^{2}}}\\,dy\\,dx',
    technique: 'mi-switch-evaluate',
    difficulty: 3,
    method: 'Reverse the order: 0 ≤ x ≤ y², 0 ≤ y ≤ 1. With y constant, e^(−x/y²) integrates easily in x.',
    multiple: {
      forms: [
        {
          f: 'e^(-x/y^2)',
          vars: ['y', 'x'],
          limits: [
            ['sqrt(x)', '1'],
            ['0', '1'],
          ],
          label: 'the printed order',
        },
        {
          f: 'e^(-x/y^2)',
          vars: ['x', 'y'],
          limits: [
            ['0', 'y^2'],
            ['0', '1'],
          ],
          label: 'the reversed order',
        },
      ],
      exact: '(1 - e^(-1))/3',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The inner integral in $y$ is not elementary. $R$: $\\sqrt{x} \\le y \\le 1$, that is $0 \\le x \\le y^{2}$:',
        check: '0 <= x <= y^2, 0 <= y <= 1',
      },
      { say: 'Inner integral with respect to $x$, holding $y$ constant:', check: '-y^2 e^(-x/y^2)' },
      { say: 'Substitute $x = y^{2}$ and $x = 0$:', check: 'y^2 (1 - e^(-1))' },
      { say: 'Outer integral:', check: '(1 - e^(-1))/3' },
    ],
    answer: '(1 - e^(-1))/3',
  }),
  part(16, 'ii', 2, '5-1-1', {
    instruction: 'Evaluate',
    problem: '\\int_{0}^{\\sqrt{\\pi}}\\int_{y}^{\\sqrt{\\pi}}\\sin(x^{2})\\,dx\\,dy',
    technique: 'mi-switch-evaluate',
    difficulty: 2,
    method: 'Reverse the order: 0 ≤ y ≤ x, 0 ≤ x ≤ √π; the inner integral then gives x sin(x²).',
    multiple: {
      forms: [
        {
          f: 'sin(x^2)',
          vars: ['x', 'y'],
          limits: [
            ['y', 'sqrt(pi)'],
            ['0', 'sqrt(pi)'],
          ],
          label: 'the printed order',
        },
        {
          f: 'sin(x^2)',
          vars: ['y', 'x'],
          limits: [
            ['0', 'x'],
            ['0', 'sqrt(pi)'],
          ],
          label: 'the reversed order',
        },
      ],
      exact: '1',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'sin(x²) has no elementary anti-derivative. Reverse the order:',
        check: '0 <= y <= x, 0 <= x <= sqrt(pi)',
      },
      { say: 'Inner integral with respect to $y$, then substitute the limits:', check: 'x sin(x^2)' },
      { say: 'Outer integral:', check: '-cos(x^2)/2' },
      { say: 'Substitute $x = \\sqrt{\\pi}$ and $x = 0$: $\\frac{1 - \\cos\\pi}{2} =$', check: '1' },
    ],
    answer: '1',
  }),
  part(17, null, 2, '5-1-1', {
    instruction: 'Given that the equation holds, determine the values of $a$ and $b$.',
    problem: '\\int_{0}^{1}\\int_{\\arctan y}^{\\pi/4}\\sec^{5}x\\,dx\\,dy = \\frac{1}{a}\\left(b\\sqrt{2} - 1\\right)',
    technique: 'mi-switch-evaluate',
    difficulty: 3,
    method: 'Reverse the order: 0 ≤ y ≤ tan x, 0 ≤ x ≤ π/4; then tan x sec⁵x = sec⁴x (sec x tan x).',
    multiple: {
      forms: [
        {
          f: '(sec(x))^5',
          vars: ['x', 'y'],
          limits: [
            ['arctan(y)', 'pi/4'],
            ['0', '1'],
          ],
          label: 'the printed order',
        },
        {
          f: '(sec(x))^5',
          vars: ['y', 'x'],
          limits: [
            ['0', 'tan(x)'],
            ['0', 'pi/4'],
          ],
          label: 'the reversed order',
        },
      ],
      exact: '(4sqrt(2) - 1)/5',
      answer: { kind: 'constants', names: ['a', 'b'], form: '(1/a)(b sqrt(2) - 1)' },
    },
    working: [
      { say: 'arctan y ≤ x ≤ π/4 means y ≤ tan x. Reverse the order:', check: '0 <= y <= tan(x), 0 <= x <= pi/4' },
      { say: 'Inner integral with respect to $y$:', check: 'tan(x) (sec(x))^5' },
      { say: 'Outer integral ($\\frac{d}{dx}\\sec^{5}x = 5\\sec^{5}x\\tan x$):', check: '(sec(x))^5/5' },
      {
        say: 'Substitute $x = \\frac{\\pi}{4}$ ($\\sec\\frac{\\pi}{4} = \\sqrt{2}$, so $\\sec^{5} = 4\\sqrt{2}$) and $x = 0$:',
        check: '(4sqrt(2) - 1)/5',
      },
    ],
    answer: 'a = 5, b = 4',
    reviewIds: ['MR5-17'],
  }),
];

export const TUTORIAL6_PART_A: PracticeItem[] = [...q1, ...q2, ...q34, ...q59, ...q1017, ...q15items, ...q1617];
