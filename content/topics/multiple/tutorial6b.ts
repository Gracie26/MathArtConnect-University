/**
 * Tutorial 6 "Multiple Integration", Questions 18–34, transcribed exactly as
 * printed (checked against the page images).
 *
 * Placement (approved):
 *   Q19(i)–(vi)                                   → Triple Integrals (§5.3)
 *   Q18(i)–(iii), Q20(i)–(v), Q21–Q25, Q28–Q34    → Change of Variables: Jacobians (§5.4.1)
 *   Q26, Q27                                      → Comparing Different Orders of Integration (§5.1.1)
 *
 * Polar regions (Q18, Q21, Q25, Q28) are taught as APP GUIDANCE (MR5-14);
 * Q25 and Q29 are improper (MR5-15); Q24 and Q32 are taken in the first
 * quadrant (MR5-24). Every walkthrough is an APP-GENERATED SOLUTION, pending
 * lecturer review (MR5-23).
 */
import type { PracticeItem } from '../../types';

import { POLAR } from './practice';
import { part } from './tutorial6a';

const A = [1.3, 2.2, 0.8];

// =============================================================================
// Q18: polar coordinates (§5.4.1)
// =============================================================================

const Q18 = 'Use polar coordinates to evaluate each of the following integrals.';
const QUARTER = (f: string) => ({
  f,
  vars: ['r', 'θ'],
  limits: [
    ['0', '1'],
    ['0', 'pi/2'],
  ] as [string, string][],
  label: 'the polar form',
});

const q18: PracticeItem[] = [
  part(18, 'i', 2, '5-4-1', {
    instruction: Q18,
    problem: '\\int_{0}^{1}\\int_{0}^{\\sqrt{1 - x^{2}}}\\frac{dy\\,dx}{4 - x^{2} - y^{2}}',
    technique: 'mi-polar',
    difficulty: 2,
    method: 'The region is the quarter disc r ≤ 1, 0 ≤ θ ≤ π/2; the integrand becomes r/(4 − r²).',
    multiple: {
      forms: [
        {
          f: '1/(4 - x^2 - y^2)',
          vars: ['y', 'x'],
          limits: [
            ['0', 'sqrt(1 - x^2)'],
            ['0', '1'],
          ],
          label: 'the printed form',
        },
        QUARTER('r/(4 - r^2)'),
      ],
      exact: '(pi/4) ln(4/3)',
      transform: POLAR('1/(4 - x^2 - y^2)'),
      answer: { kind: 'value' },
    },
    working: [
      {
        say: '$0 \\le y \\le \\sqrt{1 - x^{2}}$, $0 \\le x \\le 1$ is the quarter of the unit disc in the first quadrant (APP GUIDANCE: read the polar limits from the sketch):',
        check: '0 <= r <= 1, 0 <= θ <= pi/2',
      },
      {
        say: 'With $x = r\\cos\\theta$, $y = r\\sin\\theta$, $x^{2} + y^{2} = r^{2}$ and $dA = r\\,dr\\,d\\theta$ (Example 5.4.1):',
        check: 'r/(4 - r^2)',
      },
      { say: 'Inner integral with respect to $r$:', check: '-ln(4 - r^2)/2' },
      { say: 'Substitute $r = 1$ and $r = 0$:', check: 'ln(4/3)/2' },
      { say: 'Outer integral over $0 \\le \\theta \\le \\frac{\\pi}{2}$:', check: '(pi/4) ln(4/3)' },
    ],
    answer: '(pi/4) ln(4/3)',
    reviewIds: ['MR5-14'],
  }),
  part(18, 'ii', 2, '5-4-1', {
    instruction: Q18,
    problem: '\\int_{0}^{2}\\int_{0}^{\\sqrt{4 - x^{2}}}(x^{2} + y^{2})^{\\frac{3}{2}}\\,dy\\,dx',
    technique: 'mi-polar',
    difficulty: 2,
    method: 'The region is the quarter disc r ≤ 2, 0 ≤ θ ≤ π/2; the integrand becomes r³ · r = r⁴.',
    multiple: {
      forms: [
        {
          f: '(x^2 + y^2)^(3/2)',
          vars: ['y', 'x'],
          limits: [
            ['0', 'sqrt(4 - x^2)'],
            ['0', '2'],
          ],
          label: 'the printed form',
        },
        {
          f: 'r^4',
          vars: ['r', 'θ'],
          limits: [
            ['0', '2'],
            ['0', 'pi/2'],
          ],
          label: 'the polar form',
        },
      ],
      exact: '16pi/5',
      transform: POLAR('(x^2 + y^2)^(3/2)'),
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The region is the quarter disc of radius 2 in the first quadrant:',
        check: '0 <= r <= 2, 0 <= θ <= pi/2',
      },
      { say: '$(x^{2} + y^{2})^{3/2} = r^{3}$, and $dA = r\\,dr\\,d\\theta$:', check: 'r^4' },
      { say: 'Inner integral with respect to $r$, from $0$ to $2$:', check: '32/5' },
      { say: 'Outer integral over $0 \\le \\theta \\le \\frac{\\pi}{2}$:', check: '16pi/5' },
    ],
    answer: '16pi/5',
    reviewIds: ['MR5-14'],
  }),
  part(18, 'iii', 2, '5-4-1', {
    instruction: Q18,
    problem: '\\int_{0}^{1}\\int_{0}^{\\sqrt{1 - y^{2}}}\\sin(x^{2} + y^{2})\\,dx\\,dy',
    technique: 'mi-polar',
    difficulty: 2,
    method: 'The region is the quarter disc r ≤ 1, 0 ≤ θ ≤ π/2; the integrand becomes r sin r².',
    multiple: {
      forms: [
        {
          f: 'sin(x^2 + y^2)',
          vars: ['x', 'y'],
          limits: [
            ['0', 'sqrt(1 - y^2)'],
            ['0', '1'],
          ],
          label: 'the printed form',
        },
        QUARTER('r sin(r^2)'),
      ],
      exact: 'pi (1 - cos(1))/4',
      transform: POLAR('sin(x^2 + y^2)'),
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The region is the quarter of the unit disc in the first quadrant:',
        check: '0 <= r <= 1, 0 <= θ <= pi/2',
      },
      { say: 'With $dA = r\\,dr\\,d\\theta$:', check: 'r sin(r^2)' },
      { say: 'Inner integral with respect to $r$:', check: '-cos(r^2)/2' },
      { say: 'Substitute $r = 1$ and $r = 0$:', check: '(1 - cos(1))/2' },
    ],
    answer: 'pi (1 - cos(1))/4',
    reviewIds: ['MR5-14'],
  }),
];

// =============================================================================
// Q19: triple integrals (§5.3)
// =============================================================================

const Q19 = 'Evaluate the triple integral.';

const q19: PracticeItem[] = [
  part(19, 'i', 3, '5-3', {
    instruction: Q19,
    problem: '\\int_{0}^{3}\\int_{0}^{2}\\int_{0}^{1}(x + y + z)\\,dx\\,dy\\,dz',
    technique: 'mi-triple',
    difficulty: 1,
    method: 'Integrate with respect to x (y, z constant), then y, then z.',
    multiple: {
      forms: [
        {
          f: 'x + y + z',
          vars: ['x', 'y', 'z'],
          limits: [
            ['0', '1'],
            ['0', '2'],
            ['0', '3'],
          ],
        },
      ],
      exact: '18',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Innermost, with respect to $x$ from $0$ to $1$:', check: '1/2 + y + z' },
      { say: 'Next, with respect to $y$ from $0$ to $2$:', check: '3 + 2z' },
      { say: 'Last, with respect to $z$ from $0$ to $3$:', check: '18' },
    ],
    answer: '18',
  }),
  part(19, 'ii', 3, '5-3', {
    instruction: Q19,
    problem: '\\int_{-1}^{1}\\int_{-1}^{1}\\int_{-1}^{1} x^{2}y^{2}z^{2}\\,dx\\,dy\\,dz',
    technique: 'mi-triple',
    difficulty: 1,
    method: 'Each integration gives a factor ∫₋₁¹ t² dt = 2/3.',
    multiple: {
      forms: [
        {
          f: 'x^2 y^2 z^2',
          vars: ['x', 'y', 'z'],
          limits: [
            ['-1', '1'],
            ['-1', '1'],
            ['-1', '1'],
          ],
        },
      ],
      exact: '8/27',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Innermost, with respect to $x$:', check: '2y^2 z^2/3' },
      { say: 'Next, with respect to $y$:', check: '4z^2/9' },
      { say: 'Last, with respect to $z$:', check: '8/27' },
    ],
    answer: '8/27',
  }),
  part(19, 'iii', 3, '5-3', {
    instruction: Q19,
    problem: '\\int_{1}^{4}\\int_{0}^{1}\\int_{0}^{x} 2ze^{-x^{2}}\\,dy\\,dx\\,dz',
    technique: 'mi-triple',
    difficulty: 2,
    method: 'With respect to y the integrand is constant; then x e^(−x²) integrates by substitution.',
    multiple: {
      forms: [
        {
          f: '2z e^(-x^2)',
          vars: ['y', 'x', 'z'],
          limits: [
            ['0', 'x'],
            ['0', '1'],
            ['1', '4'],
          ],
        },
      ],
      exact: '(15/2)(1 - e^(-1))',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Innermost, with respect to $y$ from $0$ to $x$:', check: '2x z e^(-x^2)' },
      { say: 'Next, with respect to $x$ from $0$ to $1$ (substitute $w = x^{2}$):', check: 'z (1 - e^(-1))' },
      { say: 'Last, with respect to $z$ from $1$ to $4$:', check: '(15/2)(1 - e^(-1))' },
    ],
    answer: '(15/2)(1 - e^(-1))',
  }),
  part(19, 'iv', 3, '5-3', {
    instruction: Q19,
    problem: '\\int_{1}^{4}\\int_{1}^{e^{2}}\\int_{0}^{\\frac{1}{xz}}\\ln z\\,dy\\,dz\\,dx',
    technique: 'mi-triple',
    difficulty: 2,
    method: 'With respect to y the integrand is constant; then (ln z)/z integrates to (ln z)²/2.',
    multiple: {
      forms: [
        {
          f: 'ln(z)',
          vars: ['y', 'z', 'x'],
          limits: [
            ['0', '1/(x z)'],
            ['1', 'e^2'],
            ['1', '4'],
          ],
        },
      ],
      exact: '4 ln(2)',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Innermost, with respect to $y$ from $0$ to $\\frac{1}{xz}$:', check: 'ln(z)/(x z)' },
      { say: 'Next, with respect to $z$ from $1$ to $e^{2}$ ($\\frac{(\\ln z)^{2}}{2}$ gives $2$):', check: '2/x' },
      { say: 'Last, with respect to $x$ from $1$ to $4$:', check: '2 ln(4)' },
    ],
    answer: '4 ln(2)',
  }),
  part(19, 'v', 3, '5-3', {
    instruction: Q19,
    problem: '\\int_{0}^{\\frac{\\pi}{2}}\\int_{0}^{\\frac{y}{2}}\\int_{0}^{\\frac{1}{y}}\\sin y\\,dz\\,dx\\,dy',
    technique: 'mi-triple',
    difficulty: 2,
    method: 'The z- and x-integrals give the factors 1/y and y/2, which cancel.',
    multiple: {
      forms: [
        {
          f: 'sin(y)',
          vars: ['z', 'x', 'y'],
          limits: [
            ['0', '1/y'],
            ['0', 'y/2'],
            ['0', 'pi/2'],
          ],
        },
      ],
      exact: '1/2',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Innermost, with respect to $z$ from $0$ to $\\frac{1}{y}$:', check: 'sin(y)/y' },
      { say: 'Next, with respect to $x$ from $0$ to $\\frac{y}{2}$:', check: 'sin(y)/2' },
      { say: 'Last, with respect to $y$ from $0$ to $\\frac{\\pi}{2}$:', check: '1/2' },
    ],
    answer: '1/2',
  }),
  part(19, 'vi', 3, '5-3', {
    instruction: Q19,
    problem: '\\int_{0}^{9}\\int_{0}^{\\frac{y}{3}}\\int_{0}^{\\sqrt{y^{2} - 9x^{2}}} z\\,dz\\,dx\\,dy',
    technique: 'mi-triple',
    difficulty: 3,
    method: 'The z-integral gives (y² − 9x²)/2; the x-integral gives y³/9.',
    multiple: {
      forms: [
        {
          f: 'z',
          vars: ['z', 'x', 'y'],
          limits: [
            ['0', 'sqrt(y^2 - 9x^2)'],
            ['0', 'y/3'],
            ['0', '9'],
          ],
        },
      ],
      exact: '729/4',
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Innermost, with respect to $z$:', check: '(y^2 - 9x^2)/2' },
      { say: 'Next, with respect to $x$ from $0$ to $\\frac{y}{3}$:', check: 'y^3/9' },
      { say: 'Last, with respect to $y$ from $0$ to $9$:', check: '9^4/36' },
    ],
    answer: '729/4',
  }),
];

// =============================================================================
// Q20: Jacobians (§5.4.1)
// =============================================================================

const Q20 = 'Find the Jacobian $\\frac{\\partial(x, y)}{\\partial(u, v)}$ for the indicated change of variables.';

const q20: PracticeItem[] = [
  part(20, 'i', 3, '5-4-1', {
    instruction: Q20,
    problem: 'x = -\\frac{1}{2}(u - v), \\quad y = \\frac{1}{2}(u + v)',
    technique: 'mi-jacobian',
    difficulty: 1,
    method: 'x_u = −1/2, x_v = 1/2, y_u = 1/2, y_v = 1/2.',
    multiple: {
      forms: [],
      transform: { vars: ['u', 'v'], x: '-(1/2)(u - v)', y: '(1/2)(u + v)' },
      answer: { kind: 'jacobian' },
    },
    working: [
      {
        say: 'The partial derivatives:',
        tex: '\\frac{\\partial x}{\\partial u} = -\\frac{1}{2}, \\quad \\frac{\\partial x}{\\partial v} = \\frac{1}{2}, \\quad \\frac{\\partial y}{\\partial u} = \\frac{1}{2}, \\quad \\frac{\\partial y}{\\partial v} = \\frac{1}{2}',
      },
      {
        say: 'By the Definition of the Jacobian, $\\left(-\\frac{1}{2}\\right)\\left(\\frac{1}{2}\\right) - \\left(\\frac{1}{2}\\right)\\left(\\frac{1}{2}\\right) =$',
        check: '-1/2',
      },
    ],
    answer: '-1/2',
  }),
  part(20, 'ii', 3, '5-4-1', {
    instruction: Q20,
    problem: 'x = au + bv, \\quad y = cu + dv',
    technique: 'mi-jacobian',
    difficulty: 1,
    method: 'x_u = a, x_v = b, y_u = c, y_v = d.',
    multiple: {
      forms: [],
      // The constant d is read as q: "dv" would be read as a differential (see MultipleSpec.rename).
      transform: { vars: ['u', 'v'], x: 'a u + b v', y: 'c u + q v' },
      free: { a: [1.3, -0.7, 2.1], b: [0.4, 1.9, -1.2], c: [-0.8, 0.6, 1.5], q: [2.2, -1.4, 0.3] },
      rename: { d: 'q' },
      answer: { kind: 'jacobian' },
    },
    working: [
      {
        say: 'The partial derivatives are the constants:',
        tex: '\\frac{\\partial x}{\\partial u} = a, \\quad \\frac{\\partial x}{\\partial v} = b, \\quad \\frac{\\partial y}{\\partial u} = c, \\quad \\frac{\\partial y}{\\partial v} = d',
      },
      { say: 'So the Jacobian is', tex: 'ad - bc' },
    ],
    answer: 'a d - b c',
    answerTex: 'ad - bc',
  }),
  part(20, 'iii', 3, '5-4-1', {
    instruction: Q20,
    problem: 'x = u - uv, \\quad y = uv',
    technique: 'mi-jacobian',
    difficulty: 1,
    method: 'x_u = 1 − v, x_v = −u, y_u = v, y_v = u.',
    multiple: { forms: [], transform: { vars: ['u', 'v'], x: 'u - u v', y: 'u v' }, answer: { kind: 'jacobian' } },
    working: [
      {
        say: 'The partial derivatives:',
        tex: '\\frac{\\partial x}{\\partial u} = 1 - v, \\quad \\frac{\\partial x}{\\partial v} = -u, \\quad \\frac{\\partial y}{\\partial u} = v, \\quad \\frac{\\partial y}{\\partial v} = u',
      },
      { say: 'So the Jacobian is $(1 - v)u - v(-u) =$', check: 'u' },
    ],
    answer: 'u',
  }),
  part(20, 'iv', 3, '5-4-1', {
    instruction: Q20,
    problem: 'x = u\\cos\\theta - v\\sin\\theta, \\quad y = u\\sin\\theta + v\\cos\\theta',
    technique: 'mi-jacobian',
    difficulty: 2,
    method: 'θ is a constant here: x_u = cos θ, x_v = −sin θ, y_u = sin θ, y_v = cos θ.',
    multiple: {
      forms: [],
      transform: { vars: ['u', 'v'], x: 'u cos(θ) - v sin(θ)', y: 'u sin(θ) + v cos(θ)' },
      free: { θ: [0.4, 1.3, 2.6] },
      answer: { kind: 'jacobian' },
    },
    working: [
      {
        say: 'Here $\\theta$ is a constant (a fixed angle):',
        tex: '\\frac{\\partial x}{\\partial u} = \\cos\\theta, \\quad \\frac{\\partial x}{\\partial v} = -\\sin\\theta, \\quad \\frac{\\partial y}{\\partial u} = \\sin\\theta, \\quad \\frac{\\partial y}{\\partial v} = \\cos\\theta',
      },
      { say: 'So the Jacobian is $\\cos^{2}\\theta + \\sin^{2}\\theta =$', check: '1' },
    ],
    answer: '1',
  }),
  part(20, 'v', 3, '5-4-1', {
    instruction: Q20,
    problem: 'x = e^{u}\\sin v, \\quad y = e^{u}\\cos v',
    technique: 'mi-jacobian',
    difficulty: 2,
    method: 'x_u = e^u sin v, x_v = e^u cos v, y_u = e^u cos v, y_v = −e^u sin v.',
    multiple: {
      forms: [],
      transform: { vars: ['u', 'v'], x: 'e^u sin(v)', y: 'e^u cos(v)' },
      answer: { kind: 'jacobian' },
    },
    working: [
      {
        say: 'The partial derivatives:',
        tex: '\\frac{\\partial x}{\\partial u} = e^{u}\\sin v, \\quad \\frac{\\partial x}{\\partial v} = e^{u}\\cos v, \\quad \\frac{\\partial y}{\\partial u} = e^{u}\\cos v, \\quad \\frac{\\partial y}{\\partial v} = -e^{u}\\sin v',
      },
      { say: 'So the Jacobian is $-e^{2u}\\sin^{2}v - e^{2u}\\cos^{2}v =$', check: '-e^(2u)' },
    ],
    answer: '-e^(2u)',
  }),
];

// =============================================================================
// Q21–Q25, Q28–Q34: change of variables (§5.4.1); Q26–Q27 (§5.1.1)
// =============================================================================

const q2125: PracticeItem[] = [
  part(21, null, 3, '5-4-1', {
    instruction:
      'Evaluate the double integral, where $D$ is the region bounded by $x^{2} + y^{2} = 4$ and $x^{2} + y^{2} = 9$.',
    problem: '\\iint_{D}\\sqrt{x^{2} + y^{2}}\\,dx\\,dy',
    technique: 'mi-polar',
    difficulty: 2,
    method: 'D is the ring 2 ≤ r ≤ 3, 0 ≤ θ ≤ 2π; the integrand becomes r · r = r².',
    multiple: {
      forms: [
        {
          f: 'r^2',
          vars: ['r', 'θ'],
          limits: [
            ['2', '3'],
            ['0', '2pi'],
          ],
          label: 'the polar form',
        },
      ],
      exact: '38pi/3',
      transform: POLAR('sqrt(x^2 + y^2)'),
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The region between the circles of radius 2 and 3 (APP GUIDANCE: in polar coordinates, a ring):',
        check: '2 <= r <= 3, 0 <= θ <= 2pi',
      },
      { say: '$\\sqrt{x^{2} + y^{2}} = r$ and $dA = r\\,dr\\,d\\theta$:', check: 'r^2' },
      { say: 'Inner integral with respect to $r$, from $2$ to $3$:', check: '19/3' },
      { say: 'Outer integral over $0 \\le \\theta \\le 2\\pi$:', check: '38pi/3' },
    ],
    answer: '38pi/3',
    reviewIds: ['MR5-14'],
  }),
  part(22, null, 3, '5-4-1', {
    instruction:
      'Evaluate the double integral, where $D$ is the parallelogram bounded by the lines $x + y = 0$, $x + y = 1$, $2x - y = 0$ and $2x - y = 3$.',
    problem: '\\iint_{D}(x + y)^{2}\\,dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 2,
    method: 'Let u = x + y and v = 2x − y: then 0 ≤ u ≤ 1, 0 ≤ v ≤ 3 and |∂(x, y)/∂(u, v)| = 1/3.',
    multiple: {
      forms: [
        {
          f: 'u^2/3',
          vars: ['u', 'v'],
          limits: [
            ['0', '1'],
            ['0', '3'],
          ],
          label: 'the u, v form',
        },
      ],
      exact: '1/3',
      transform: {
        vars: ['u', 'v'],
        x: '(u + v)/3',
        y: '(2u - v)/3',
        f: '(x + y)^2',
        inverse: { u: 'x + y', v: '2x - y' },
      },
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'Let $u = x + y$ and $v = 2x - y$, so the boundaries are $u = 0$, $u = 1$, $v = 0$ and $v = 3$:',
        check: '0 <= u <= 1, 0 <= v <= 3',
      },
      { say: 'First $\\frac{\\partial(u, v)}{\\partial(x, y)} = (1)(-1) - (1)(2) =$', check: '-3' },
      { say: 'So by the reciprocal formula $\\frac{\\partial(x, y)}{\\partial(u, v)} =$', check: '-1/3' },
      { say: 'By Theorem 5.4.1 the integrand becomes $u^{2}\\left|-\\frac{1}{3}\\right|$:', check: 'u^2/3' },
      { say: 'Inner integral with respect to $u$, from $0$ to $1$:', check: '1/9' },
      { say: 'Outer integral with respect to $v$, from $0$ to $3$:', check: '1/3' },
    ],
    answer: '1/3',
  }),
  part(23, null, 3, '5-4-1', {
    instruction:
      'Let $D$ be the region in the first quadrant bounded by the hyperbolas $xy = 1$, $xy = 9$ and the lines $y = x$, $y = 4x$. Evaluate',
    problem: '\\iint_{D}\\left(\\sqrt{\\frac{y}{x}} + \\sqrt{xy}\\right)dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 3,
    method: 'Let u = xy and v = y/x: 1 ≤ u ≤ 9, 1 ≤ v ≤ 4, and ∂(u, v)/∂(x, y) = 2y/x = 2v.',
    multiple: {
      forms: [
        {
          f: '(sqrt(v) + sqrt(u))/(2v)',
          vars: ['u', 'v'],
          limits: [
            ['1', '9'],
            ['1', '4'],
          ],
          label: 'the u, v form',
        },
      ],
      exact: '8 + (52/3) ln(2)',
      transform: {
        vars: ['u', 'v'],
        x: 'sqrt(u/v)',
        y: 'sqrt(u v)',
        f: 'sqrt(y/x) + sqrt(x y)',
        inverse: { u: 'x y', v: 'y/x' },
      },
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'Let $u = xy$ and $v = \\frac{y}{x}$: the boundaries become $u = 1$, $u = 9$, $v = 1$ and $v = 4$:',
        check: '1 <= u <= 9, 1 <= v <= 4',
      },
      {
        say: '$\\frac{\\partial(u, v)}{\\partial(x, y)} = y\\cdot\\frac{1}{x} - x\\cdot\\left(-\\frac{y}{x^{2}}\\right) = \\frac{2y}{x}$, which is $2v$, so $\\frac{\\partial(x, y)}{\\partial(u, v)} =$',
        check: '1/(2v)',
      },
      { say: 'The integrand $\\sqrt{v} + \\sqrt{u}$ times $\\frac{1}{2v}$:', check: '(sqrt(v) + sqrt(u))/(2v)' },
      { say: 'Inner integral with respect to $u$, from $1$ to $9$:', check: '(8sqrt(v) + 52/3)/(2v)' },
      { say: 'Outer integral with respect to $v$, from $1$ to $4$:', check: '8 + (26/3) ln(4)' },
    ],
    answer: '8 + (52/3) ln(2)',
  }),
  part(24, null, 3, '5-4-1', {
    instruction:
      'Using a suitable transformation, evaluate the double integral, where $R$ is the region bounded by $x^{2} - y^{2} = 1$, $x^{2} - y^{2} = 2$, $2y = x$ and $5y = x$.',
    problem: '\\iint_{R} x(x^{2} - y^{2})^{\\frac{1}{2}}\\,dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 3,
    method:
      'Let u = x² − y² and v = y/x: 1 ≤ u ≤ 2, 1/5 ≤ v ≤ 1/2, ∂(u, v)/∂(x, y) = 2(1 − v²), and x = √(u/(1 − v²)).',
    multiple: {
      forms: [
        {
          f: 'u/(2(1 - v^2)^(3/2))',
          vars: ['u', 'v'],
          limits: [
            ['1', '2'],
            ['1/5', '1/2'],
          ],
          label: 'the u, v form',
        },
      ],
      exact: 'sqrt(3)/4 - sqrt(6)/16',
      transform: {
        vars: ['u', 'v'],
        x: 'sqrt(u/(1 - v^2))',
        y: 'v sqrt(u/(1 - v^2))',
        f: 'x (x^2 - y^2)^(1/2)',
        inverse: { u: 'x^2 - y^2', v: 'y/x' },
      },
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The boundaries are $x^{2} - y^{2} = $ constant and $\\frac{y}{x} = $ constant, so let $u = x^{2} - y^{2}$ and $v = \\frac{y}{x}$ (taking the region with $x > 0$):',
        check: '1 <= u <= 2, 1/5 <= v <= 1/2',
      },
      {
        say: '$\\frac{\\partial(u, v)}{\\partial(x, y)} = 2x\\cdot\\frac{1}{x} - (-2y)\\left(-\\frac{y}{x^{2}}\\right) = 2(1 - v^{2})$, so $\\frac{\\partial(x, y)}{\\partial(u, v)} =$',
        check: '1/(2(1 - v^2))',
      },
      {
        say: 'Since $u = x^{2}(1 - v^{2})$, $x = \\sqrt{\\frac{u}{1 - v^{2}}}$, and the integrand $x\\sqrt{u}$ times $\\frac{1}{2(1 - v^{2})}$ is',
        check: 'u/(2(1 - v^2)^(3/2))',
      },
      { say: 'Inner integral with respect to $u$, from $1$ to $2$:', check: '3/(4(1 - v^2)^(3/2))' },
      {
        say: 'Outer integral: an anti-derivative of $(1 - v^{2})^{-3/2}$ is $\\frac{v}{\\sqrt{1 - v^{2}}}$:',
        check: '3v/(4sqrt(1 - v^2))',
      },
      { say: 'Substitute $v = \\frac{1}{2}$ and $v = \\frac{1}{5}$:', check: '(3/4)(1/sqrt(3) - 1/(2sqrt(6)))' },
    ],
    answer: 'sqrt(3)/4 - sqrt(6)/16',
    reviewIds: ['MR5-24'],
  }),
  part(25, null, 3, '5-4-1', {
    instruction:
      'Using polar co-ordinates, evaluate the integral. Deduce the value of $\\int_{0}^{\\infty} e^{-x^{2}}dx$.',
    problem: '\\int_{0}^{\\infty}\\int_{0}^{\\infty} e^{-(x^{2} + y^{2})}\\,dx\\,dy',
    technique: 'mi-polar',
    difficulty: 3,
    method: 'The first quadrant is 0 ≤ r < ∞, 0 ≤ θ ≤ π/2; then the double integral is the square of ∫₀^∞ e^(−x²) dx.',
    multiple: {
      forms: [
        {
          f: 'e^(-(x^2 + y^2))',
          vars: ['x', 'y'],
          limits: [
            ['0', 'inf'],
            ['0', 'inf'],
          ],
          label: 'the printed form',
        },
        {
          f: 'r e^(-r^2)',
          vars: ['r', 'θ'],
          limits: [
            ['0', 'inf'],
            ['0', 'pi/2'],
          ],
          label: 'the polar form',
        },
      ],
      exact: 'pi/4',
      transform: POLAR('e^(-(x^2 + y^2))'),
      answer: { kind: 'values', values: ['pi/4', 'sqrt(pi)/2'], labels: ['the double integral', '∫₀^∞ e^(−x²) dx'] },
      nodes: 80,
    },
    working: [
      {
        say: 'The first quadrant in polar coordinates (APP GUIDANCE; this integral is improper, which the notes do not treat):',
        tex: '0 \\le r < \\infty, \\quad 0 \\le \\theta \\le \\frac{\\pi}{2}',
      },
      { say: 'With $dA = r\\,dr\\,d\\theta$:', check: 'r e^(-r^2)' },
      {
        say: 'Inner integral: $\\int_{0}^{\\infty} re^{-r^{2}}dr = \\lim_{t \\to \\infty}\\left[-\\frac{1}{2}e^{-r^{2}}\\right]_{0}^{t} =$',
        check: '1/2',
      },
      { say: 'Outer integral over $0 \\le \\theta \\le \\frac{\\pi}{2}$:', check: 'pi/4' },
      {
        say: 'Deduce (self-check): the double integral equals $\\left(\\int_{0}^{\\infty}e^{-x^{2}}dx\\right)\\left(\\int_{0}^{\\infty}e^{-y^{2}}dy\\right) = I^{2}$, so $I^{2} = \\frac{\\pi}{4}$ and, since $I > 0$, $I = \\frac{\\sqrt{\\pi}}{2}$.',
      },
    ],
    answer: 'pi/4, sqrt(pi)/2',
    answerTex: '\\frac{\\pi}{4}; \\quad \\int_{0}^{\\infty}e^{-x^{2}}dx = \\frac{\\sqrt{\\pi}}{2}',
    grading: 'partial',
    reviewIds: ['MR5-14', 'MR5-15'],
  }),
];

const q2627: PracticeItem[] = [
  part(26, null, 3, '5-1-1', {
    instruction: 'By changing the order of integration or otherwise, evaluate',
    problem: '\\int_{0}^{a}\\int_{0}^{a - \\sqrt{a^{2} - x^{2}}}\\frac{xy\\log(y + a)}{(y - a)^{2}}\\,dy\\,dx',
    technique: 'mi-switch-evaluate',
    difficulty: 3,
    method:
      'y ≤ a − √(a² − x²) means x ≥ √(2ay − y²). Reversed, the x-integral gives (a − y)²/2, which cancels (y − a)².',
    multiple: {
      forms: [
        {
          f: 'x y ln(y + a)/(y - a)^2',
          vars: ['y', 'x'],
          limits: [
            ['0', 'a - sqrt(a^2 - x^2)'],
            ['0', 'a'],
          ],
          label: 'the printed order',
        },
        {
          f: 'x y ln(y + a)/(y - a)^2',
          vars: ['x', 'y'],
          limits: [
            ['sqrt(2a y - y^2)', 'a'],
            ['0', 'a'],
          ],
          label: 'the reversed order',
        },
      ],
      free: { a: A },
      exact: 'a^2/8 + (a^2/4) ln(a)',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'Here $\\log$ is the natural logarithm and $a > 0$. $y \\le a - \\sqrt{a^{2} - x^{2}}$ means $(a - y)^{2} \\ge a^{2} - x^{2}$, that is $x \\ge \\sqrt{2ay - y^{2}}$. Reversed:',
        check: 'sqrt(2a y - y^2) <= x <= a, 0 <= y <= a',
      },
      { say: 'Inner integral with respect to $x$:', check: 'x^2 y ln(y + a)/(2(y - a)^2)' },
      {
        say: 'Substitute $x = a$ and $x = \\sqrt{2ay - y^{2}}$: since $a^{2} - (2ay - y^{2}) = (a - y)^{2}$,',
        check: 'y ln(y + a)/2',
      },
      {
        say: 'With $t = y + a$, $\\frac{1}{2}\\int_{a}^{2a}(t - a)\\ln t\\,dt$, by parts:',
        check: 'a^2/8 + (a^2/4) ln(a)',
      },
    ],
    answer: 'a^2/8 + (a^2/4) ln(a)',
    reviewIds: ['MR5-18'],
  }),
  part(27, null, 3, '5-1-1', {
    instruction: 'Change the order of integration and evaluate the integral',
    problem: '\\int_{0}^{1}\\int_{\\sqrt{x}}^{1}\\frac{xy^{2}}{\\sqrt{x^{2} + y^{2}}}\\,dy\\,dx',
    technique: 'mi-switch-evaluate',
    difficulty: 3,
    method: 'Reversed: 0 ≤ x ≤ y², 0 ≤ y ≤ 1. With y constant, x/√(x² + y²) has anti-derivative √(x² + y²).',
    multiple: {
      forms: [
        {
          f: 'x y^2/sqrt(x^2 + y^2)',
          vars: ['y', 'x'],
          limits: [
            ['sqrt(x)', '1'],
            ['0', '1'],
          ],
          label: 'the printed order',
        },
        {
          f: 'x y^2/sqrt(x^2 + y^2)',
          vars: ['x', 'y'],
          limits: [
            ['0', 'y^2'],
            ['0', '1'],
          ],
          label: 'the reversed order',
        },
      ],
      exact: '(8sqrt(2) - 7)/60',
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The region is $\\sqrt{x} \\le y \\le 1$, $0 \\le x \\le 1$, that is $0 \\le x \\le y^{2}$. Reversed:',
        check: '0 <= x <= y^2, 0 <= y <= 1',
      },
      { say: 'Inner integral with respect to $x$, holding $y$ constant:', check: 'y^2 sqrt(x^2 + y^2)' },
      { say: 'Substitute $x = y^{2}$ and $x = 0$ (for $y > 0$):', check: 'y^3 sqrt(y^2 + 1) - y^3' },
      { say: 'Outer integral (substitute $w = y^{2} + 1$ in the first term):', check: '(8sqrt(2) - 7)/60' },
    ],
    answer: '(8sqrt(2) - 7)/60',
  }),
];

const q2834: PracticeItem[] = [
  part(28, null, 3, '5-4-1', {
    instruction:
      'Evaluate the double integral, where $R$ is the region in which $x^{2} + y^{2} \\le 4$, $x \\ge 0$, $y \\ge 0$.',
    problem: '\\iint_{R}\\sqrt{x^{2} + y^{2}}\\,dy\\,dx',
    technique: 'mi-polar',
    difficulty: 2,
    method: 'R is the quarter disc 0 ≤ r ≤ 2, 0 ≤ θ ≤ π/2; the integrand becomes r · r = r².',
    multiple: {
      forms: [
        {
          f: 'sqrt(x^2 + y^2)',
          vars: ['y', 'x'],
          limits: [
            ['0', 'sqrt(4 - x^2)'],
            ['0', '2'],
          ],
          label: 'the order dy dx',
        },
        {
          f: 'r^2',
          vars: ['r', 'θ'],
          limits: [
            ['0', '2'],
            ['0', 'pi/2'],
          ],
          label: 'the polar form',
        },
      ],
      exact: '4pi/3',
      transform: POLAR('sqrt(x^2 + y^2)'),
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'The quarter disc of radius 2 (APP GUIDANCE: polar coordinates suit $\\sqrt{x^{2} + y^{2}}$ and a disc):',
        check: '0 <= r <= 2, 0 <= θ <= pi/2',
      },
      { say: '$\\sqrt{x^{2} + y^{2}} = r$ and $dA = r\\,dr\\,d\\theta$:', check: 'r^2' },
      { say: 'Inner integral with respect to $r$:', check: '8/3' },
      { say: 'Outer integral over $0 \\le \\theta \\le \\frac{\\pi}{2}$:', check: '4pi/3' },
    ],
    answer: '4pi/3',
    reviewIds: ['MR5-14'],
  }),
  part(29, null, 3, '5-4-1', {
    instruction: 'By means of the substitutions $u = x + y$ and $v = y - x$, evaluate the integral',
    problem: '\\int_{0}^{a}\\int_{0}^{a}\\frac{1}{\\sqrt{a^{2} - (y - x)^{2}}}\\,dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 3,
    method:
      'x = (u − v)/2, y = (u + v)/2, so ∂(x, y)/∂(u, v) = 1/2; the square becomes |v| ≤ u ≤ 2a − |v|, −a ≤ v ≤ a.',
    multiple: {
      forms: [
        {
          f: '1/(2sqrt(a^2 - v^2))',
          vars: ['u', 'v'],
          limits: [
            ['|v|', '2a - |v|'],
            ['-a', 'a'],
          ],
          label: 'the u, v form',
        },
      ],
      free: { a: A },
      exact: 'a(pi - 2)',
      transform: {
        vars: ['u', 'v'],
        x: '(u - v)/2',
        y: '(u + v)/2',
        f: '1/sqrt(a^2 - (y - x)^2)',
        inverse: { u: 'x + y', v: 'y - x' },
      },
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'Solving $u = x + y$, $v = y - x$ gives $x = \\frac{u - v}{2}$ and $y = \\frac{u + v}{2}$, so $\\frac{\\partial(x, y)}{\\partial(u, v)} = \\frac{1}{2}\\cdot\\frac{1}{2} - \\frac{1}{2}\\left(-\\frac{1}{2}\\right) =$',
        check: '1/2',
      },
      {
        say: 'The square $0 \\le x \\le a$, $0 \\le y \\le a$ becomes (for each $v$, $u$ runs between the images of the sides):',
        check: '|v| <= u <= 2a - |v|, -a <= v <= a',
      },
      { say: 'The integrand times $\\frac{1}{2}$:', check: '1/(2sqrt(a^2 - v^2))' },
      { say: 'Inner integral with respect to $u$:', check: '(a - |v|)/sqrt(a^2 - v^2)' },
      {
        say: 'By symmetry, $2\\int_{0}^{a}\\frac{a - v}{\\sqrt{a^{2} - v^{2}}}dv = 2\\left[a\\arcsin\\frac{v}{a} + \\sqrt{a^{2} - v^{2}}\\right]_{0}^{a}$ (an improper integral: the integrand is unbounded at $v = a$):',
        check: 'a(pi - 2)',
      },
    ],
    answer: 'a(pi - 2)',
    reviewIds: ['MR5-15'],
  }),
  part(30, null, 3, '5-4-1', {
    instruction:
      'By means of substitutions $x = \\frac{1}{2}(u + v)$ and $y = \\frac{1}{2}(u - v)$, evaluate the integral',
    problem: '\\int_{0}^{a}\\int_{0}^{a}\\frac{dx\\,dy}{\\sqrt{a^{2} + (y + x)^{2}}}',
    technique: 'mi-change-variables',
    difficulty: 3,
    method: 'u = x + y, v = x − y, |∂(x, y)/∂(u, v)| = 1/2; for 0 ≤ u ≤ 2a, v runs between ±(a − |u − a|).',
    multiple: {
      forms: [
        {
          f: '1/(2sqrt(a^2 + u^2))',
          vars: ['v', 'u'],
          limits: [
            ['-(a - |u - a|)', 'a - |u - a|'],
            ['0', '2a'],
          ],
          label: 'the u, v form',
        },
      ],
      free: { a: A },
      exact: 'a(2sqrt(2) - 1 - sqrt(5)) + 2a ln((2 + sqrt(5))/(1 + sqrt(2)))',
      transform: {
        vars: ['u', 'v'],
        x: '(u + v)/2',
        y: '(u - v)/2',
        f: '1/sqrt(a^2 + (y + x)^2)',
        inverse: { u: 'x + y', v: 'x - y' },
      },
      answer: { kind: 'value' },
    },
    working: [
      {
        say: '$\\frac{\\partial(x, y)}{\\partial(u, v)} = \\frac{1}{2}\\left(-\\frac{1}{2}\\right) - \\frac{1}{2}\\cdot\\frac{1}{2} =$',
        check: '-1/2',
      },
      {
        say: 'With $u = x + y$ and $v = x - y$, the square becomes $0 \\le u \\le 2a$ with $|v| \\le u$ and $|v| \\le 2a - u$:',
        check: '-(a - |u - a|) <= v <= a - |u - a|, 0 <= u <= 2a',
      },
      {
        say: 'The integrand $\\frac{1}{\\sqrt{a^{2} + u^{2}}}$ times $\\left|-\\frac{1}{2}\\right|$, integrated with respect to $v$:',
        check: '(a - |u - a|)/sqrt(a^2 + u^2)',
      },
      {
        say: 'Split at $u = a$: $\\int_{0}^{a}\\frac{u}{\\sqrt{a^{2} + u^{2}}}du + \\int_{a}^{2a}\\frac{2a - u}{\\sqrt{a^{2} + u^{2}}}du$, using $\\int\\frac{du}{\\sqrt{a^{2} + u^{2}}} = \\ln\\left(u + \\sqrt{a^{2} + u^{2}}\\right)$:',
        check: 'a(2sqrt(2) - 1 - sqrt(5)) + 2a ln((2 + sqrt(5))/(1 + sqrt(2)))',
      },
    ],
    answer: 'a(2sqrt(2) - 1 - sqrt(5)) + 2a ln((2 + sqrt(5))/(1 + sqrt(2)))',
  }),
  part(31, null, 3, '5-4-1', {
    instruction:
      'Calculate the double integral, where $R$ is the region bounded by the lines $x + y = \\pi$, $x + y = 5\\pi$, $x - y = \\pi$ and $x - y = -\\pi$.',
    problem: '\\iint_{R}(x + y)^{3}\\cos^{2}(x - y)\\,dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 2,
    method: 'u = x + y (π ≤ u ≤ 5π), v = x − y (−π ≤ v ≤ π), |∂(x, y)/∂(u, v)| = 1/2.',
    multiple: {
      forms: [
        {
          f: 'u^3 (cos(v))^2/2',
          vars: ['v', 'u'],
          limits: [
            ['-pi', 'pi'],
            ['pi', '5pi'],
          ],
          label: 'the u, v form',
        },
      ],
      exact: '78pi^5',
      transform: {
        vars: ['u', 'v'],
        x: '(u + v)/2',
        y: '(u - v)/2',
        f: '(x + y)^3 (cos(x - y))^2',
        inverse: { u: 'x + y', v: 'x - y' },
      },
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Let $u = x + y$ and $v = x - y$:', check: '-pi <= v <= pi, pi <= u <= 5pi' },
      {
        say: 'Then $x = \\frac{u + v}{2}$, $y = \\frac{u - v}{2}$ and $\\frac{\\partial(x, y)}{\\partial(u, v)} =$',
        check: '-1/2',
      },
      {
        say: 'The integrand becomes $u^{3}\\cos^{2}v\\cdot\\frac{1}{2}$. Inner integral with respect to $v$ ($\\int_{-\\pi}^{\\pi}\\cos^{2}v\\,dv = \\pi$):',
        check: 'pi u^3/2',
      },
      { say: 'Outer integral with respect to $u$:', check: 'pi (625pi^4 - pi^4)/8' },
    ],
    answer: '78pi^5',
  }),
  part(32, null, 4, '5-4-1', {
    instruction: 'Calculate the area of the region bounded by $xy = 4$, $xy = 8$, $xy^{3} = 5$ and $xy^{3} = 15$.',
    problem: '\\text{Area} = \\iint_{R} dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 2,
    method: 'u = xy (4 ≤ u ≤ 8), v = xy³ (5 ≤ v ≤ 15); ∂(u, v)/∂(x, y) = 2xy³ = 2v, as in Example 5.4.4.',
    multiple: {
      forms: [
        {
          f: '1/(2v)',
          vars: ['v', 'u'],
          limits: [
            ['5', '15'],
            ['4', '8'],
          ],
          label: 'the u, v form',
        },
      ],
      exact: '2 ln(3)',
      transform: { vars: ['u', 'v'], x: 'sqrt(u^3/v)', y: 'sqrt(v/u)', f: '1', inverse: { u: 'x y', v: 'x y^3' } },
      answer: { kind: 'value' },
    },
    working: [
      {
        say: 'As in Example 5.4.4, let $u = xy$ and $v = xy^{3}$ (the first-quadrant region):',
        check: '5 <= v <= 15, 4 <= u <= 8',
      },
      {
        say: '$\\frac{\\partial(u, v)}{\\partial(x, y)} = y\\cdot 3xy^{2} - x\\cdot y^{3} = 2xy^{3} = 2v$, so $\\frac{\\partial(x, y)}{\\partial(u, v)} =$',
        check: '1/(2v)',
      },
      { say: 'Inner integral with respect to $v$, from $5$ to $15$:', check: 'ln(3)/2' },
      { say: 'Outer integral with respect to $u$, from $4$ to $8$:', check: '2 ln(3)' },
    ],
    answer: '2 ln(3)',
    reviewIds: ['MR5-24'],
  }),
  part(33, null, 4, '5-4-1', {
    instruction:
      'Calculate the area of the parallelogram bounded by the lines $x + y = 1$, $x + y = 2$ and $2x - 3y = 2$, $2x - 3y = 5$.',
    problem: '\\text{Area} = \\iint_{R} dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 1,
    method: 'u = x + y (1 ≤ u ≤ 2), v = 2x − 3y (2 ≤ v ≤ 5); ∂(u, v)/∂(x, y) = −5.',
    multiple: {
      forms: [
        {
          f: '1/5',
          vars: ['u', 'v'],
          limits: [
            ['1', '2'],
            ['2', '5'],
          ],
          label: 'the u, v form',
        },
      ],
      exact: '3/5',
      transform: { vars: ['u', 'v'], x: '(3u + v)/5', y: '(2u - v)/5', f: '1', inverse: { u: 'x + y', v: '2x - 3y' } },
      answer: { kind: 'value' },
    },
    working: [
      { say: 'Let $u = x + y$ and $v = 2x - 3y$:', check: '1 <= u <= 2, 2 <= v <= 5' },
      { say: '$\\frac{\\partial(u, v)}{\\partial(x, y)} = (1)(-3) - (1)(2) =$', check: '-5' },
      { say: 'So $\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| =$', check: '1/5' },
      { say: 'The area is $\\int_{2}^{5}\\int_{1}^{2}\\frac{1}{5}\\,du\\,dv =$', check: '3/5' },
    ],
    answer: '3/5',
  }),
  part(34, null, 4, '5-4-1', {
    instruction:
      'Evaluate the double integral, where $R$ is the region in the first quadrant bounded by the hyperbolas $x^{2} - y^{2} = 6$, $x^{2} - y^{2} = 1$, $2xy = 4$ and $2xy = 1$. (Hint: Use $u = x^{2} - y^{2}$, $v = 2xy$)',
    problem: '\\iint_{R}(x^{2} + y^{2})\\,dx\\,dy',
    technique: 'mi-change-variables',
    difficulty: 2,
    method: 'With the hint, ∂(u, v)/∂(x, y) = 4(x² + y²), so the integrand times |∂(x, y)/∂(u, v)| is 1/4.',
    multiple: {
      forms: [
        {
          f: '1/4',
          vars: ['u', 'v'],
          limits: [
            ['1', '6'],
            ['1', '4'],
          ],
          label: 'the u, v form',
        },
      ],
      exact: '15/4',
      transform: {
        vars: ['u', 'v'],
        x: 'sqrt((u + sqrt(u^2 + v^2))/2)',
        y: 'v/(2sqrt((u + sqrt(u^2 + v^2))/2))',
        f: 'x^2 + y^2',
        inverse: { u: 'x^2 - y^2', v: '2x y' },
      },
      answer: { kind: 'value' },
    },
    working: [
      { say: 'With $u = x^{2} - y^{2}$ and $v = 2xy$:', check: '1 <= u <= 6, 1 <= v <= 4' },
      {
        say: '$\\frac{\\partial(u, v)}{\\partial(x, y)} = (2x)(2x) - (-2y)(2y) = 4(x^{2} + y^{2})$:',
        check: '4(x^2 + y^2)',
      },
      { say: 'So $(x^{2} + y^{2})\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| =$', check: '1/4' },
      { say: 'Integrate over $1 \\le u \\le 6$, $1 \\le v \\le 4$:', check: '15/4' },
    ],
    answer: '15/4',
  }),
];

export const TUTORIAL6_PART_B: PracticeItem[] = [...q18, ...q19, ...q20, ...q2125, ...q2627, ...q2834];
