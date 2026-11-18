/**
 * Tutorial 2 "Integration (Part 2)": the 69 parts that belong to Topic 2,
 * transcribed from the tutorial exactly (checked against the page images).
 *
 * Question 1(a)–(g) practises Chapter 1 methods and lives in Topic 1
 * (content/topics/integration/tutorial2.ts). Q3 (MR2-T1) and Q8(d)
 * (MR2-T2) are stored as printed and withheld from learners until the
 * lecturer resolves them. The tutorial has no answer key: every walkthrough
 * is app-authored and pendingLecturerReview (MR2-SOL).
 */
import type { PracticeItem } from '../../types';

import { AREA_UNITS as U, type AreaUnitId } from './ids';
import { type AreaPracticeSpec, approximationSteps, buildAreaItem } from './practice';
import { TUT2, TUTORIAL2_SECTION_MAP } from './sources';

function part(
  question: string,
  sub: string | null,
  page: number,
  unitId: AreaUnitId,
  spec: AreaPracticeSpec,
): PracticeItem {
  const item = sub ? `${question}(${sub})` : question;
  return buildAreaItem(
    {
      id: `tut2-${question.toLowerCase()}${sub ? `-${sub}` : ''}`,
      sourceType: 'tutorial-question',
      source: { document: TUT2, item, page },
      sourceQuestion: question,
      ...(sub ? { sourceSubquestion: sub } : {}),
      sourceSection: TUTORIAL2_SECTION_MAP[item] ?? '',
      unitId,
    },
    spec,
  );
}

const E = Math.E;
const PI = Math.PI;

// -----------------------------------------------------------------------------
// Q5: the given integrals
// -----------------------------------------------------------------------------

const Q5_GIVEN =
  'Given $\\int_{2}^{4} x^{3}\\,dx = 60$, $\\int_{2}^{4} x\\,dx = 6$ and $\\int_{2}^{4} dx = 2$, use properties of definite integrals.';
const q5 = (
  sub: string,
  problem: string,
  integrand: string,
  reversed: boolean,
  value: number,
  steps: [string, string?][],
  answer: string,
  difficulty: 1 | 2 = 1,
): PracticeItem =>
  part('Q5', sub, 2, U.properties, {
    instruction: 'Use properties of definite integrals to evaluate',
    problem,
    condition: Q5_GIVEN,
    technique: 'properties',
    difficulty,
    method: 'Write the integral in terms of the three given integrals (§2.2.2).',
    steps,
    answer,
    definite: {
      integrand,
      variable: 'x',
      lower: reversed ? 4 : 2,
      upper: reversed ? 2 : sub === 'b' ? 2 : 4,
      answer: { kind: 'value', value },
    },
  });

// -----------------------------------------------------------------------------
// Q10–Q12: rectangle approximations (values and walkthroughs computed from the function)
// -----------------------------------------------------------------------------

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** m·π/(4n) as exact TeX (points of [0, π/2] at half-steps). */
const piPoint = (n: number) => (m: number) => {
  if (m === 0) return '0';
  const g = gcd(m, 4 * n);
  const [num, den] = [m / g, (4 * n) / g];
  const top = num === 1 ? '\\pi' : `${num}\\pi`;
  return den === 1 ? top : `\\frac{${top}}{${den}}`;
};
/** m·2/n as a decimal (points of [0, 4] at half-steps). */
const fourPoint = (n: number) => (m: number) => {
  const v = (m * 2) / n;
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6)));
};

const expDecay = (x: number) => Math.exp(-2 * x + 3);
const expTex = (p: string) => `f(${p})`;
const cosTex = (p: string) => `\\cos ${p.startsWith('\\frac') ? p : `(${p})`}`;

const Q10_PROBLEM = 'f(x) = e^{-2x+3}, \\quad 0 \\le x \\le 4';
const Q11_PROBLEM = 'f(x) = \\cos x, \\quad 0 \\le x \\le \\frac{\\pi}{2}';

function midpointExp(sub: string, n: number): PracticeItem {
  const { steps, value } = approximationSteps({
    f: expDecay,
    fTex: expTex,
    a: 0,
    b: 4,
    n,
    rule: 'midpoint',
    dxTex: `\\frac{4 - 0}{${n}} = ${fourPoint(n)(2)}`,
    pointTex: fourPoint(n),
    name: `M_{${n}}`,
  });
  return part('Q10', sub, 2, U.definite, {
    instruction: `Estimate the area under the graph using the Mid-point Rule with ${['four', 'six', 'eight'][n / 2 - 2]} subintervals`,
    problem: Q10_PROBLEM,
    technique: 'midpoint-rule',
    difficulty: 1,
    method: `Mid-point Rule with n = ${n}: Δx = 4/${n}, heights at the midpoints of the subintervals.`,
    steps: [...steps, [`Here $f(x) = e^{-2x+3}$, so each height is $e^{3 - 2\\bar{x}_{i}}$.`]],
    answer: `M_{${n}} \\approx ${value.toFixed(6)}`,
    definite: {
      integrand: 'e^(-2x+3)',
      variable: 'x',
      lower: 0,
      upper: 4,
      answer: { kind: 'value', value, approximate: true },
    },
  });
}

function cosApproximations(rule: 'right' | 'left' | 'midpoint', n: number) {
  return approximationSteps({
    f: Math.cos,
    fTex: cosTex,
    a: 0,
    b: PI / 2,
    n,
    rule,
    dxTex: `\\frac{\\pi/2 - 0}{${n}} = ${piPoint(n)(2)}`,
    pointTex: piPoint(n),
    name: `${rule === 'right' ? 'R' : rule === 'left' ? 'L' : 'M'}_{${n}}`,
  });
}

function endpointCos(sub: 'a' | 'b'): PracticeItem {
  const rule = sub === 'a' ? 'right' : 'left';
  const letter = sub === 'a' ? 'R' : 'L';
  const runs = [4, 6, 8].map((n) => ({ n, ...cosApproximations(rule, n) }));
  return part('Q11', sub, 3, U.riemann, {
    instruction: `Approximate the area of the region by the formulas ${letter}₄, ${letter}₆ and ${letter}₈, the sum of the areas of the rectangles using ${rule} endpoints`,
    problem: Q11_PROBLEM,
    technique: 'riemann-approximation',
    difficulty: 2,
    method: `${rule === 'right' ? 'Right' : 'Left'} endpoints with n = 4, 6 and 8 (Δx = π/(2n)).`,
    steps: runs.flatMap((run) => [[`With $n = ${run.n}$:`] as [string], ...run.steps]),
    answer: runs.map((run) => `${letter}_{${run.n}} \\approx ${run.value.toFixed(4)}`).join(',\\quad '),
    definite: {
      integrand: 'cos x',
      variable: 'x',
      lower: 0,
      upper: PI / 2,
      answer: { kind: 'values', labels: [`${letter}₄`, `${letter}₆`, `${letter}₈`], values: runs.map((r) => r.value) },
    },
  });
}

function midpointCos(sub: string, n: number): PracticeItem {
  const { steps, value } = cosApproximations('midpoint', n);
  return part('Q12', sub, 3, U.definite, {
    instruction: `Estimate the area under the graph using the Mid-point Rule with ${['four', 'six', 'eight'][n / 2 - 2]} subintervals`,
    problem: Q11_PROBLEM,
    technique: 'midpoint-rule',
    difficulty: 1,
    method: `Mid-point Rule with n = ${n}: Δx = π/${2 * n}, heights cos x̄ᵢ at the midpoints.`,
    steps,
    answer: `M_{${n}} \\approx ${value.toFixed(6)}`,
    definite: {
      integrand: 'cos x',
      variable: 'x',
      lower: 0,
      upper: PI / 2,
      answer: { kind: 'value', value, approximate: true },
    },
  });
}

// -----------------------------------------------------------------------------
// The 69 parts
// -----------------------------------------------------------------------------

export const TUTORIAL2_ITEMS: readonly PracticeItem[] = [
  // Q2: reversed limits and the dummy variable
  part('Q2', null, 1, U.properties, {
    instruction: 'Use the given result to find',
    problem: '\\int_{1}^{0} 3u\\sqrt{u^{2}+4}\\,du',
    condition: 'Given that $\\int_{0}^{1} 3x\\sqrt{x^{2}+4}\\,dx = 5\\sqrt{5} - 8$.',
    technique: 'properties',
    difficulty: 1,
    method:
      'The variable of integration is a dummy variable, and reversing the limits changes the sign (Theorem 2.2.3).',
    steps: [
      [
        'The letter used for the variable does not change the value (dummy variable), so',
        '\\int_{0}^{1} 3u\\sqrt{u^{2}+4}\\,du = \\int_{0}^{1} 3x\\sqrt{x^{2}+4}\\,dx = 5\\sqrt{5} - 8',
      ],
      [
        'Reversing the limits changes the sign (Theorem 2.2.3):',
        '\\int_{1}^{0} 3u\\sqrt{u^{2}+4}\\,du = -(5\\sqrt{5} - 8)',
      ],
    ],
    answer: '8 - 5\\sqrt{5}',
    definite: {
      integrand: '3u sqrt(u^2+4)',
      variable: 'u',
      lower: 1,
      upper: 0,
      answer: { kind: 'value', value: 8 - 5 * Math.sqrt(5) },
    },
  }),

  // Q3: printed with dt (MR2-T1): withheld
  part('Q3', null, 1, U.properties, {
    instruction: 'Evaluate the definite integral',
    problem: '\\int_{1}^{4} \\frac{x^{3}\\sin^{4}x\\tan x\\sec x}{x^{3}-4x^{2}+5}\\,dt',
    technique: 'properties',
    difficulty: 2,
    method: 'Awaiting lecturer review of the printed question (the integrand is in x, the differential is dt).',
    steps: [['This question is withheld until the lecturer confirms what is intended.']],
    answer: '\\text{awaiting lecturer review}',
    reviewIds: ['MR2-T1'],
  }),

  // Q4: a piecewise function (Theorem 2.2.4 (iii) and the FTC)
  part('Q4', null, 1, U.ftc, {
    instruction: 'Find',
    problem: '\\int_{0}^{10} f(x)\\,dx',
    condition:
      'where $f(x) = x^{2} - 14x + 5$ for $x < 3$, $f(x) = x^{-2} + x^{3}$ for $3 \\le x < 6$, and $f(x) = xe^{x}$ for $x \\ge 6$.',
    technique: 'ftc-evaluate',
    difficulty: 3,
    method:
      'Split the interval where the formula changes (Theorem 2.2.4 (iii)), then use the FTC on each piece; xeˣ needs integration by parts.',
    steps: [
      [
        'Split at $x = 3$ and $x = 6$:',
        '\\int_{0}^{10} f = \\int_{0}^{3} (x^{2}-14x+5)\\,dx + \\int_{3}^{6} (x^{-2}+x^{3})\\,dx + \\int_{6}^{10} xe^{x}\\,dx',
      ],
      ['First piece:', '\\left[\\frac{x^{3}}{3} - 7x^{2} + 5x\\right]_{0}^{3} = 9 - 63 + 15 = -39'],
      [
        'Second piece:',
        '\\left[-\\frac{1}{x} + \\frac{x^{4}}{4}\\right]_{3}^{6} = \\left(-\\frac{1}{6} + 324\\right) - \\left(-\\frac{1}{3} + \\frac{81}{4}\\right) = \\frac{3647}{12}',
      ],
      [
        'Third piece, by parts ($\\int xe^{x}dx = (x-1)e^{x}$):',
        '\\left[(x-1)e^{x}\\right]_{6}^{10} = 9e^{10} - 5e^{6}',
      ],
      ['Add the three pieces:', '-39 + \\frac{3647}{12} + 9e^{10} - 5e^{6} = \\frac{3179}{12} + 9e^{10} - 5e^{6}'],
    ],
    answer: '\\frac{3179}{12} + 9e^{10} - 5e^{6} \\approx 196485.97',
    definite: {
      pieces: [
        { integrand: 'x^2 - 14x + 5', from: 0, to: 3 },
        { integrand: 'x^(-2) + x^3', from: 3, to: 6 },
        { integrand: 'x e^x', from: 6, to: 10 },
      ],
      variable: 'x',
      lower: 0,
      upper: 10,
      answer: { kind: 'value', value: 3179 / 12 + 9 * E ** 10 - 5 * E ** 6 },
    },
  }),

  // Q5 (a)–(j)
  q5(
    'a',
    '\\int_{4}^{2} x\\,dx',
    'x',
    true,
    -6,
    [['Reverse the limits (Theorem 2.2.3):', '\\int_{4}^{2} x\\,dx = -\\int_{2}^{4} x\\,dx = -6']],
    '-6',
  ),
  q5(
    'b',
    '\\int_{2}^{2} x^{3}\\,dx',
    'x^3',
    false,
    0,
    [['Both limits are equal (Theorem 2.2.2):', '\\int_{2}^{2} x^{3}\\,dx = 0']],
    '0',
  ),
  q5(
    'c',
    '\\int_{2}^{4} 8x\\,dx',
    '8x',
    false,
    48,
    [['Take the constant out (Theorem 2.2.4 (i)):', '8\\int_{2}^{4} x\\,dx = 8(6) = 48']],
    '48',
  ),
  q5(
    'd',
    '\\int_{2}^{4} 25\\,dx',
    '25',
    false,
    50,
    [['A constant integrand (Theorem 2.2.5):', '25\\int_{2}^{4} dx = 25(2) = 50']],
    '50',
  ),
  q5(
    'e',
    '\\int_{2}^{4} (x-9)\\,dx',
    'x - 9',
    false,
    -12,
    [['Split the difference (Theorem 2.2.4 (ii)):', '\\int_{2}^{4} x\\,dx - 9\\int_{2}^{4} dx = 6 - 18 = -12']],
    '-12',
  ),
  q5(
    'f',
    '\\int_{2}^{4} (x^{3}+4)\\,dx',
    'x^3 + 4',
    false,
    68,
    [['Split the sum:', '\\int_{2}^{4} x^{3}\\,dx + 4\\int_{2}^{4} dx = 60 + 8 = 68']],
    '68',
  ),
  q5(
    'g',
    '\\int_{2}^{4} (13-x^{3})\\,dx',
    '13 - x^3',
    false,
    -34,
    [['Split the difference:', '13\\int_{2}^{4} dx - \\int_{2}^{4} x^{3}\\,dx = 26 - 60 = -34']],
    '-34',
  ),
  q5(
    'h',
    '\\int_{2}^{4} \\left(\\frac{1}{2}x^{3} - 3x + 2\\right)dx',
    'x^3/2 - 3x + 2',
    false,
    16,
    [
      [
        'Use each property in turn:',
        '\\frac{1}{2}\\int_{2}^{4} x^{3}\\,dx - 3\\int_{2}^{4} x\\,dx + 2\\int_{2}^{4} dx = 30 - 18 + 4 = 16',
      ],
    ],
    '16',
    2,
  ),
  q5(
    'i',
    '\\int_{4}^{2} (4x^{3}-3x)\\,dx',
    '4x^3 - 3x',
    true,
    -222,
    [
      ['Reverse the limits first:', '\\int_{4}^{2} (4x^{3}-3x)\\,dx = -\\int_{2}^{4} (4x^{3}-3x)\\,dx'],
      ['Then split:', '-\\left[4(60) - 3(6)\\right] = -(240 - 18) = -222'],
    ],
    '-222',
    2,
  ),
  q5(
    'j',
    '\\int_{4}^{2} (10 + 4x - 3x^{3})\\,dx',
    '10 + 4x - 3x^3',
    true,
    136,
    [
      ['Reverse the limits first:', '-\\int_{2}^{4} (10 + 4x - 3x^{3})\\,dx'],
      ['Then split:', '-\\left[10(2) + 4(6) - 3(60)\\right] = -(20 + 24 - 180) = 136'],
    ],
    '136',
    2,
  ),

  // Q6 (a)–(n): FTC with Chapter 1 techniques
  part('Q6', 'a', 2, U.ftc, {
    problem: '\\int_{1}^{8} \\sqrt{\\frac{2}{x}}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 1,
    method: 'Write the integrand as √2·x^(−1/2) and use the power rule.',
    steps: [
      [
        'Rewrite: $\\sqrt{\\frac{2}{x}} = \\sqrt{2}\\,x^{-\\frac{1}{2}}$. An anti-derivative is',
        'F(x) = 2\\sqrt{2}\\,x^{\\frac{1}{2}} = 2\\sqrt{2x}',
      ],
      ['Evaluate:', 'F(8) - F(1) = 2\\sqrt{16} - 2\\sqrt{2} = 8 - 2\\sqrt{2}'],
    ],
    answer: '8 - 2\\sqrt{2}',
    definite: {
      integrand: 'sqrt(2/x)',
      variable: 'x',
      lower: 1,
      upper: 8,
      answer: { kind: 'value', value: 8 - 2 * Math.SQRT2 },
    },
  }),
  part('Q6', 'b', 2, U.ftc, {
    problem: '\\int_{1}^{4} x^{3}e^{2x+5}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 3,
    method: 'Integration by parts three times (Chapter 1, §1.11), then the FTC.',
    steps: [
      [
        'Repeated integration by parts gives the anti-derivative',
        'F(x) = e^{2x+5}\\left(\\frac{x^{3}}{2} - \\frac{3x^{2}}{4} + \\frac{3x}{4} - \\frac{3}{8}\\right)',
      ],
      [
        'At $x = 4$ the bracket is $32 - 12 + 3 - \\frac{3}{8} = \\frac{181}{8}$; at $x = 1$ it is $\\frac{1}{8}$.',
        'F(4) - F(1) = \\frac{181}{8}e^{13} - \\frac{1}{8}e^{7}',
      ],
    ],
    answer: '\\frac{181e^{13} - e^{7}}{8}',
    definite: {
      integrand: 'x^3 e^(2x+5)',
      variable: 'x',
      lower: 1,
      upper: 4,
      answer: { kind: 'value', value: (181 * E ** 13 - E ** 7) / 8 },
    },
  }),
  part('Q6', 'c', 2, U.ftc, {
    problem: '\\int_{1}^{4} (3 - |x-3|)\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 2,
    method: 'Split at x = 3, where |x − 3| changes form (Theorem 2.2.4 (iii)).',
    steps: [
      [
        'On $[1, 3]$, $|x - 3| = 3 - x$, so the integrand is $x$:',
        '\\int_{1}^{3} x\\,dx = \\left[\\frac{x^{2}}{2}\\right]_{1}^{3} = 4',
      ],
      [
        'On $[3, 4]$, $|x - 3| = x - 3$, so the integrand is $6 - x$:',
        '\\int_{3}^{4} (6 - x)\\,dx = \\left[6x - \\frac{x^{2}}{2}\\right]_{3}^{4} = 16 - \\frac{27}{2} = \\frac{5}{2}',
      ],
      ['Add:', '4 + \\frac{5}{2} = \\frac{13}{2}'],
    ],
    answer: '\\frac{13}{2}',
    definite: { integrand: '3 - |x - 3|', variable: 'x', lower: 1, upper: 4, answer: { kind: 'value', value: 6.5 } },
  }),
  part('Q6', 'd', 2, U.ftc, {
    problem: '\\int_{-\\pi/3}^{\\pi/3} 4\\sec\\theta\\tan\\theta\\,d\\theta',
    technique: 'ftc-evaluate',
    difficulty: 1,
    method: 'sec θ tan θ is the derivative of sec θ.',
    steps: [
      ['An anti-derivative is $4\\sec\\theta$:', '\\left[4\\sec\\theta\\right]_{-\\pi/3}^{\\pi/3} = 4(2) - 4(2) = 0'],
    ],
    answer: '0',
    definite: {
      integrand: '4 sec θ tan θ',
      variable: 'θ',
      lower: -PI / 3,
      upper: PI / 3,
      answer: { kind: 'value', value: 0 },
    },
  }),
  part('Q6', 'e', 2, U.ftc, {
    problem: '\\int_{0}^{\\pi/4} \\frac{\\sec^{2}\\theta}{\\tan^{2}\\theta + 1}\\,d\\theta',
    technique: 'ftc-evaluate',
    difficulty: 1,
    method: 'Use the identity tan²θ + 1 = sec²θ.',
    steps: [
      [
        'Since $\\tan^{2}\\theta + 1 = \\sec^{2}\\theta$, the integrand is 1:',
        '\\int_{0}^{\\pi/4} 1\\,d\\theta = \\frac{\\pi}{4}',
      ],
    ],
    answer: '\\frac{\\pi}{4}',
    definite: {
      integrand: 'sec(θ)^2/(tan(θ)^2 + 1)',
      variable: 'θ',
      lower: 0,
      upper: PI / 4,
      answer: { kind: 'value', value: PI / 4 },
    },
  }),
  part('Q6', 'f', 2, U.ftc, {
    problem: '\\int_{0}^{\\pi} \\sin^{2}t\\cos t\\,dt',
    technique: 'ftc-evaluate',
    difficulty: 1,
    method: 'Substitute u = sin t (Chapter 1, §1.5).',
    steps: [
      ['With $u = \\sin t$, $du = \\cos t\\,dt$, an anti-derivative is', 'F(t) = \\frac{\\sin^{3}t}{3}'],
      ['Evaluate:', 'F(\\pi) - F(0) = 0 - 0 = 0'],
    ],
    answer: '0',
    definite: { integrand: 'sin(t)^2 cos(t)', variable: 't', lower: 0, upper: PI, answer: { kind: 'value', value: 0 } },
  }),
  part('Q6', 'g', 2, U.ftc, {
    problem: '\\int_{1}^{e} \\frac{1 - \\ln x}{x}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 2,
    method: 'Substitute u = ln x.',
    steps: [
      ['With $u = \\ln x$, $du = \\frac{dx}{x}$; an anti-derivative is', 'F(x) = \\ln x - \\frac{(\\ln x)^{2}}{2}'],
      ['Evaluate ($\\ln e = 1$, $\\ln 1 = 0$):', 'F(e) - F(1) = 1 - \\frac{1}{2} = \\frac{1}{2}'],
    ],
    answer: '\\frac{1}{2}',
    definite: { integrand: '(1 - ln x)/x', variable: 'x', lower: 1, upper: E, answer: { kind: 'value', value: 0.5 } },
  }),
  part('Q6', 'h', 2, U.ftc, {
    problem: '\\int_{0}^{2/\\sqrt{3}} \\frac{1}{4 + 9x^{2}}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 2,
    method: 'Write 4 + 9x² = 4(1 + (3x/2)²) and use the inverse tangent.',
    steps: [
      ['An anti-derivative is', 'F(x) = \\frac{1}{6}\\tan^{-1}\\left(\\frac{3x}{2}\\right)'],
      [
        'At $x = \\frac{2}{\\sqrt{3}}$, $\\frac{3x}{2} = \\sqrt{3}$ and $\\tan^{-1}\\sqrt{3} = \\frac{\\pi}{3}$:',
        'F\\left(\\frac{2}{\\sqrt{3}}\\right) - F(0) = \\frac{1}{6}\\cdot\\frac{\\pi}{3} = \\frac{\\pi}{18}',
      ],
    ],
    answer: '\\frac{\\pi}{18}',
    definite: {
      integrand: '1/(4 + 9x^2)',
      variable: 'x',
      lower: 0,
      upper: 2 / Math.sqrt(3),
      answer: { kind: 'value', value: PI / 18 },
    },
  }),
  part('Q6', 'i', 2, U.ftc, {
    problem: '\\int_{\\pi/6}^{\\pi/3} \\frac{\\cos^{3}x}{\\sqrt{\\sin x}}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 3,
    method: 'Write cos³x = (1 − sin²x) cos x and substitute u = sin x.',
    steps: [
      [
        'With $u = \\sin x$, $du = \\cos x\\,dx$, the integrand becomes $(1 - u^{2})u^{-\\frac{1}{2}}$:',
        '\\int (u^{-\\frac{1}{2}} - u^{\\frac{3}{2}})\\,du = 2u^{\\frac{1}{2}} - \\frac{2}{5}u^{\\frac{5}{2}}',
      ],
      [
        'The limits become $u = \\frac{1}{2}$ and $u = \\frac{\\sqrt{3}}{2}$:',
        '\\left[2u^{\\frac{1}{2}} - \\frac{2}{5}u^{\\frac{5}{2}}\\right]_{1/2}^{\\sqrt{3}/2} = \\frac{17}{10}\\left(\\frac{\\sqrt{3}}{2}\\right)^{\\frac{1}{2}} - \\frac{19}{10\\sqrt{2}}',
      ],
    ],
    answer:
      '\\frac{17}{10}\\left(\\frac{\\sqrt{3}}{2}\\right)^{\\frac{1}{2}} - \\frac{19}{10\\sqrt{2}} \\approx 0.238525',
    definite: {
      integrand: 'cos(x)^3/sqrt(sin x)',
      variable: 'x',
      lower: PI / 6,
      upper: PI / 3,
      answer: { kind: 'value', value: 1.7 * Math.sqrt(Math.sqrt(3) / 2) - 1.9 / Math.SQRT2 },
    },
  }),
  part('Q6', 'j', 2, U.ftc, {
    problem: '\\int_{0}^{1} \\frac{x + 3}{\\sqrt{4 - x^{2}}}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 2,
    method: 'Split into x/√(4 − x²) and 3/√(4 − x²).',
    steps: [
      ['An anti-derivative is', 'F(x) = -\\sqrt{4 - x^{2}} + 3\\sin^{-1}\\left(\\frac{x}{2}\\right)'],
      [
        'Evaluate:',
        'F(1) - F(0) = \\left(-\\sqrt{3} + 3\\cdot\\frac{\\pi}{6}\\right) - (-2) = 2 - \\sqrt{3} + \\frac{\\pi}{2}',
      ],
    ],
    answer: '2 - \\sqrt{3} + \\frac{\\pi}{2}',
    definite: {
      integrand: '(x + 3)/sqrt(4 - x^2)',
      variable: 'x',
      lower: 0,
      upper: 1,
      answer: { kind: 'value', value: 2 - Math.sqrt(3) + PI / 2 },
    },
  }),
  part('Q6', 'k', 2, U.ftc, {
    problem: '\\int_{0}^{\\pi^{\\frac{1}{3}}} \\frac{x^{2}}{\\sqrt{16 - x^{6}}}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 3,
    method: 'Substitute u = x³, then use the inverse sine.',
    steps: [
      [
        'With $u = x^{3}$, $du = 3x^{2}\\,dx$; the limits become $0$ and $\\pi$:',
        '\\frac{1}{3}\\int_{0}^{\\pi} \\frac{du}{\\sqrt{16 - u^{2}}} = \\frac{1}{3}\\left[\\sin^{-1}\\frac{u}{4}\\right]_{0}^{\\pi}',
      ],
      ['Evaluate:', '\\frac{1}{3}\\sin^{-1}\\left(\\frac{\\pi}{4}\\right)'],
    ],
    answer: '\\frac{1}{3}\\sin^{-1}\\left(\\frac{\\pi}{4}\\right) \\approx 0.301113',
    definite: {
      integrand: 'x^2/sqrt(16 - x^6)',
      variable: 'x',
      lower: 0,
      upper: Math.cbrt(PI),
      answer: { kind: 'value', value: Math.asin(PI / 4) / 3 },
    },
  }),
  part('Q6', 'l', 2, U.ftc, {
    problem: '\\int_{0}^{1} \\frac{2}{e^{-x} + 1}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 2,
    method: 'Multiply top and bottom by eˣ, then substitute u = 1 + eˣ.',
    steps: [
      [
        'Multiply by $\\frac{e^{x}}{e^{x}}$:',
        '\\int_{0}^{1} \\frac{2e^{x}}{1 + e^{x}}\\,dx = \\left[2\\ln(1 + e^{x})\\right]_{0}^{1}',
      ],
      ['Evaluate:', '2\\ln(1 + e) - 2\\ln 2 = 2\\ln\\left(\\frac{1 + e}{2}\\right)'],
    ],
    answer: '2\\ln\\left(\\frac{1 + e}{2}\\right)',
    definite: {
      integrand: '2/(e^(-x) + 1)',
      variable: 'x',
      lower: 0,
      upper: 1,
      answer: { kind: 'value', value: 2 * Math.log((1 + E) / 2) },
    },
  }),
  part('Q6', 'm', 2, U.ftc, {
    problem: '\\int_{3}^{5} \\frac{2x}{x^{2} + 2x + 1}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 2,
    method: 'Factorise x² + 2x + 1 = (x + 1)² and use partial fractions.',
    steps: [
      ['Partial fractions:', '\\frac{2x}{(x+1)^{2}} = \\frac{2}{x+1} - \\frac{2}{(x+1)^{2}}'],
      ['An anti-derivative is', 'F(x) = 2\\ln|x+1| + \\frac{2}{x+1}'],
      [
        'Evaluate:',
        'F(5) - F(3) = \\left(2\\ln 6 + \\frac{1}{3}\\right) - \\left(2\\ln 4 + \\frac{1}{2}\\right) = 2\\ln\\frac{3}{2} - \\frac{1}{6}',
      ],
    ],
    answer: '2\\ln\\frac{3}{2} - \\frac{1}{6}',
    definite: {
      integrand: '2x/(x^2 + 2x + 1)',
      variable: 'x',
      lower: 3,
      upper: 5,
      answer: { kind: 'value', value: 2 * Math.log(1.5) - 1 / 6 },
    },
  }),
  part('Q6', 'n', 2, U.ftc, {
    problem: '\\int_{0}^{1} \\frac{4}{4x^{2} + 4x + 65}\\,dx',
    technique: 'ftc-evaluate',
    difficulty: 3,
    method: 'Complete the square: 4x² + 4x + 65 = (2x + 1)² + 64.',
    steps: [
      [
        'With $u = 2x + 1$, $du = 2\\,dx$:',
        '\\int \\frac{4}{(2x+1)^{2} + 64}\\,dx = \\frac{1}{4}\\tan^{-1}\\left(\\frac{2x+1}{8}\\right)',
      ],
      ['Evaluate:', '\\frac{1}{4}\\left[\\tan^{-1}\\frac{3}{8} - \\tan^{-1}\\frac{1}{8}\\right]'],
    ],
    answer: '\\frac{1}{4}\\left(\\tan^{-1}\\frac{3}{8} - \\tan^{-1}\\frac{1}{8}\\right) \\approx 0.058604',
    definite: {
      integrand: '4/(4x^2 + 4x + 65)',
      variable: 'x',
      lower: 0,
      upper: 1,
      answer: { kind: 'value', value: (Math.atan(3 / 8) - Math.atan(1 / 8)) / 4 },
    },
  }),

  // Q7 (a)–(g): limits of Riemann sums
  part('Q7', 'a', 2, U.definite, {
    instruction: 'Evaluate by calculating the limit of the Riemann sums',
    problem: '\\int_{2}^{6} 8\\,dx',
    technique: 'riemann-limit',
    difficulty: 1,
    method: 'Right endpoints (Theorem 2.2.1) with Δx = 4/n.',
    steps: [
      [
        'Divide $[2, 6]$ into $n$ subintervals:',
        '\\Delta x = \\frac{6 - 2}{n} = \\frac{4}{n}, \\quad x_{i} = 2 + \\frac{4i}{n}',
      ],
      ['Every height is $f(x_{i}) = 8$:', '\\sum_{i=1}^{n} 8\\cdot\\frac{4}{n} = \\frac{32}{n}\\cdot n = 32'],
      ['Take the limit:', '\\lim_{n \\to \\infty} 32 = 32'],
    ],
    answer: '32',
    definite: { integrand: '8', variable: 'x', lower: 2, upper: 6, answer: { kind: 'value', value: 32 } },
  }),
  part('Q7', 'b', 2, U.definite, {
    instruction: 'Evaluate by calculating the limit of the Riemann sums',
    problem: '\\int_{-2}^{3} x\\,dx',
    technique: 'riemann-limit',
    difficulty: 1,
    method: 'Right endpoints with Δx = 5/n and formula (1) for Σ i.',
    steps: [
      ['Divide $[-2, 3]$:', '\\Delta x = \\frac{5}{n}, \\quad x_{i} = -2 + \\frac{5i}{n}'],
      [
        'The nth Riemann sum:',
        '\\sum_{i=1}^{n} \\left(-2 + \\frac{5i}{n}\\right)\\frac{5}{n} = -10 + \\frac{25}{n^{2}}\\cdot\\frac{n(n+1)}{2} = -10 + \\frac{25(n+1)}{2n}',
      ],
      [
        'Take the limit:',
        '\\lim_{n \\to \\infty} \\left[-10 + \\frac{25(n+1)}{2n}\\right] = -10 + \\frac{25}{2} = \\frac{5}{2}',
      ],
    ],
    answer: '\\frac{5}{2}',
    definite: { integrand: 'x', variable: 'x', lower: -2, upper: 3, answer: { kind: 'value', value: 2.5 } },
  }),
  part('Q7', 'c', 2, U.definite, {
    instruction: 'Evaluate by calculating the limit of the Riemann sums',
    problem: '\\int_{-1}^{1} x^{3}\\,dx',
    technique: 'riemann-limit',
    difficulty: 3,
    method: 'Right endpoints with Δx = 2/n and formulas (1)–(3).',
    steps: [
      ['Divide $[-1, 1]$:', '\\Delta x = \\frac{2}{n}, \\quad x_{i} = -1 + \\frac{2i}{n}'],
      [
        'Expand $f(x_{i})\\Delta x$:',
        '\\left(-1 + \\frac{2i}{n}\\right)^{3}\\frac{2}{n} = -\\frac{2}{n} + \\frac{12i}{n^{2}} - \\frac{24i^{2}}{n^{3}} + \\frac{16i^{3}}{n^{4}}',
      ],
      [
        'Sum with formulas (1)–(3):',
        '-2 + \\frac{6(n+1)}{n} - \\frac{4(n+1)(2n+1)}{n^{2}} + \\frac{4(n+1)^{2}}{n^{2}} = \\frac{2}{n}',
      ],
      ['Take the limit:', '\\lim_{n \\to \\infty} \\frac{2}{n} = 0'],
    ],
    answer: '0',
    definite: { integrand: 'x^3', variable: 'x', lower: -1, upper: 1, answer: { kind: 'value', value: 0 } },
  }),
  part('Q7', 'd', 2, U.definite, {
    instruction: 'Evaluate by calculating the limit of the Riemann sums',
    problem: '\\int_{1}^{4} 4x^{2}\\,dx',
    technique: 'riemann-limit',
    difficulty: 2,
    method: 'Right endpoints with Δx = 3/n and formulas (1)–(2).',
    steps: [
      ['Divide $[1, 4]$:', '\\Delta x = \\frac{3}{n}, \\quad x_{i} = 1 + \\frac{3i}{n}'],
      [
        'Expand $f(x_{i})\\Delta x$:',
        '4\\left(1 + \\frac{3i}{n}\\right)^{2}\\frac{3}{n} = \\frac{12}{n} + \\frac{72i}{n^{2}} + \\frac{108i^{2}}{n^{3}}',
      ],
      ['Sum:', '12 + \\frac{36(n+1)}{n} + \\frac{18(n+1)(2n+1)}{n^{2}}'],
      ['Take the limit:', '12 + 36 + 36 = 84'],
    ],
    answer: '84',
    definite: { integrand: '4x^2', variable: 'x', lower: 1, upper: 4, answer: { kind: 'value', value: 84 } },
  }),
  part('Q7', 'e', 2, U.definite, {
    instruction: 'Evaluate by calculating the limit of the Riemann sums',
    problem: '\\int_{1}^{2} (x^{2} + 1)\\,dx',
    technique: 'riemann-limit',
    difficulty: 2,
    method: 'Right endpoints with Δx = 1/n.',
    steps: [
      ['Divide $[1, 2]$:', '\\Delta x = \\frac{1}{n}, \\quad x_{i} = 1 + \\frac{i}{n}'],
      [
        'Expand $f(x_{i})\\Delta x$:',
        '\\left[\\left(1 + \\frac{i}{n}\\right)^{2} + 1\\right]\\frac{1}{n} = \\frac{2}{n} + \\frac{2i}{n^{2}} + \\frac{i^{2}}{n^{3}}',
      ],
      ['Sum:', '2 + \\frac{n+1}{n} + \\frac{(n+1)(2n+1)}{6n^{2}}'],
      ['Take the limit:', '2 + 1 + \\frac{1}{3} = \\frac{10}{3}'],
    ],
    answer: '\\frac{10}{3}',
    definite: { integrand: 'x^2 + 1', variable: 'x', lower: 1, upper: 2, answer: { kind: 'value', value: 10 / 3 } },
  }),
  part('Q7', 'f', 2, U.definite, {
    instruction: 'Evaluate by calculating the limit of the Riemann sums',
    problem: '\\int_{-2}^{1} (2x^{2} + 3)\\,dx',
    technique: 'riemann-limit',
    difficulty: 2,
    method: 'Right endpoints with Δx = 3/n (as in Example 2.2.2).',
    steps: [
      ['Divide $[-2, 1]$:', '\\Delta x = \\frac{3}{n}, \\quad x_{i} = -2 + \\frac{3i}{n}'],
      [
        'Expand $f(x_{i})\\Delta x$:',
        '\\left[2\\left(-2 + \\frac{3i}{n}\\right)^{2} + 3\\right]\\frac{3}{n} = \\frac{33}{n} - \\frac{72i}{n^{2}} + \\frac{54i^{2}}{n^{3}}',
      ],
      ['Sum:', '33 - \\frac{36(n+1)}{n} + \\frac{9(n+1)(2n+1)}{n^{2}}'],
      ['Take the limit:', '33 - 36 + 18 = 15'],
    ],
    answer: '15',
    definite: { integrand: '2x^2 + 3', variable: 'x', lower: -2, upper: 1, answer: { kind: 'value', value: 15 } },
  }),
  part('Q7', 'g', 2, U.definite, {
    instruction: 'Evaluate by calculating the limit of the Riemann sums',
    problem: '\\int_{0}^{4} \\left(x^{3} - 2x\\right)dx',
    technique: 'riemann-limit',
    difficulty: 2,
    method: 'Right endpoints with Δx = 4/n and formulas (1) and (3).',
    steps: [
      ['Divide $[0, 4]$:', '\\Delta x = \\frac{4}{n}, \\quad x_{i} = \\frac{4i}{n}'],
      [
        'Expand $f(x_{i})\\Delta x$:',
        '\\left(\\frac{64i^{3}}{n^{3}} - \\frac{8i}{n}\\right)\\frac{4}{n} = \\frac{256i^{3}}{n^{4}} - \\frac{32i}{n^{2}}',
      ],
      ['Sum:', '\\frac{64(n+1)^{2}}{n^{2}} - \\frac{16(n+1)}{n}'],
      ['Take the limit:', '64 - 16 = 48'],
    ],
    answer: '48',
    definite: { integrand: 'x^3 - 2x', variable: 'x', lower: 0, upper: 4, answer: { kind: 'value', value: 48 } },
  }),

  // Q8 (a)–(d): limit-of-Riemann-sum expressions
  part('Q8', 'a', 2, U.definite, {
    instruction: 'Obtain an expression for the limit of Riemann sums for',
    problem: '\\int_{1}^{4} e^{2x}\\,dx',
    technique: 'riemann-expression',
    difficulty: 1,
    method: 'Theorem 2.2.1 with Δx = 3/n and xᵢ = 1 + 3i/n.',
    steps: [
      ['Divide $[1, 4]$:', '\\Delta x = \\frac{3}{n}, \\quad x_{i} = 1 + \\frac{3i}{n}'],
      [
        'By Theorem 2.2.1:',
        '\\int_{1}^{4} e^{2x}\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} e^{2 + \\frac{6i}{n}}\\cdot\\frac{3}{n}',
      ],
    ],
    answer: '\\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\frac{3}{n}e^{2 + \\frac{6i}{n}}',
    definite: {
      integrand: 'e^(2x)',
      variable: 'x',
      lower: 1,
      upper: 4,
      answer: { kind: 'riemannTerm', rule: 'right' },
    },
  }),
  part('Q8', 'b', 2, U.definite, {
    instruction: 'Obtain an expression for the limit of Riemann sums for',
    problem: '\\int_{0}^{\\pi/4} \\tan x\\,dx',
    technique: 'riemann-expression',
    difficulty: 1,
    method: 'Theorem 2.2.1 with Δx = π/(4n).',
    steps: [
      ['Divide $[0, \\frac{\\pi}{4}]$:', '\\Delta x = \\frac{\\pi}{4n}, \\quad x_{i} = \\frac{i\\pi}{4n}'],
      [
        'By Theorem 2.2.1:',
        '\\int_{0}^{\\pi/4} \\tan x\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\tan\\left(\\frac{i\\pi}{4n}\\right)\\frac{\\pi}{4n}',
      ],
    ],
    answer: '\\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\frac{\\pi}{4n}\\tan\\left(\\frac{i\\pi}{4n}\\right)',
    definite: {
      integrand: 'tan x',
      variable: 'x',
      lower: 0,
      upper: PI / 4,
      answer: { kind: 'riemannTerm', rule: 'right' },
    },
  }),
  part('Q8', 'c', 2, U.definite, {
    instruction: 'Obtain an expression for the limit of Riemann sums for',
    problem: '\\int_{0}^{\\pi/2} \\sin x\\,dx',
    technique: 'riemann-expression',
    difficulty: 1,
    method: 'Theorem 2.2.1 with Δx = π/(2n).',
    steps: [
      ['Divide $[0, \\frac{\\pi}{2}]$:', '\\Delta x = \\frac{\\pi}{2n}, \\quad x_{i} = \\frac{i\\pi}{2n}'],
      [
        'By Theorem 2.2.1:',
        '\\int_{0}^{\\pi/2} \\sin x\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\sin\\left(\\frac{i\\pi}{2n}\\right)\\frac{\\pi}{2n}',
      ],
    ],
    answer: '\\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\frac{\\pi}{2n}\\sin\\left(\\frac{i\\pi}{2n}\\right)',
    definite: {
      integrand: 'sin x',
      variable: 'x',
      lower: 0,
      upper: PI / 2,
      answer: { kind: 'riemannTerm', rule: 'right' },
    },
  }),
  part('Q8', 'd', 2, U.definite, {
    instruction: 'Obtain an expression for the limit of Riemann sums for',
    problem: '\\int_{0}^{1} \\ln x\\,dx',
    technique: 'riemann-expression',
    difficulty: 2,
    method: 'Awaiting lecturer review: ln x is unbounded at x = 0, so this integral is improper.',
    steps: [['This question is withheld until the lecturer confirms the intended exercise.']],
    answer: '\\text{awaiting lecturer review}',
    reviewIds: ['MR2-T2'],
  }),

  // Q9 (a)(b): A_R and A_L for e^(−2x+3) on [0, 4]
  part('Q9', 'a', 2, U.riemann, {
    instruction: 'Without evaluating the limit, determine an expression for A_R (right endpoints) for the area under',
    problem: Q10_PROBLEM,
    technique: 'riemann-expression',
    difficulty: 1,
    method: 'Definition 2.2.1 with Δx = 4/n and xᵢ = 4i/n.',
    steps: [
      ['Divide $[0, 4]$:', '\\Delta x = \\frac{4}{n}, \\quad x_{i} = \\frac{4i}{n}'],
      [
        'Right endpoints (Definition 2.2.1):',
        'A_{R} = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} e^{3 - \\frac{8i}{n}}\\cdot\\frac{4}{n}',
      ],
    ],
    answer: 'A_{R} = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\frac{4}{n}e^{3 - \\frac{8i}{n}}',
    definite: {
      integrand: 'e^(-2x+3)',
      variable: 'x',
      lower: 0,
      upper: 4,
      answer: { kind: 'riemannTerm', rule: 'right' },
    },
  }),
  part('Q9', 'b', 2, U.riemann, {
    instruction: 'Without evaluating the limit, determine an expression for A_L (left endpoints) for the area under',
    problem: Q10_PROBLEM,
    technique: 'riemann-expression',
    difficulty: 1,
    method: 'Definition 2.2.2: left endpoints xᵢ₋₁ = 4(i − 1)/n.',
    steps: [
      [
        'Divide $[0, 4]$; the left endpoint of the ith subinterval is',
        '\\Delta x = \\frac{4}{n}, \\quad x_{i-1} = \\frac{4(i-1)}{n}',
      ],
      [
        'Left endpoints (Definition 2.2.2):',
        'A_{L} = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} e^{3 - \\frac{8(i-1)}{n}}\\cdot\\frac{4}{n}',
      ],
    ],
    answer: 'A_{L} = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\frac{4}{n}e^{3 - \\frac{8(i-1)}{n}}',
    definite: {
      integrand: 'e^(-2x+3)',
      variable: 'x',
      lower: 0,
      upper: 4,
      answer: { kind: 'riemannTerm', rule: 'left' },
    },
  }),

  // Q10 (a)–(c): Mid-point Rule for e^(−2x+3)
  midpointExp('a', 4),
  midpointExp('b', 6),
  midpointExp('c', 8),

  // Q11 (a)–(c): right and left endpoints for cos x
  endpointCos('a'),
  endpointCos('b'),
  part('Q11', 'c', 3, U.riemann, {
    instruction: 'Comment on the results obtained in questions (11a) and (11b)',
    problem: Q11_PROBLEM,
    technique: 'riemann-approximation',
    difficulty: 2,
    method: 'Compare the rectangles with the curve: cos x is decreasing on [0, π/2].',
    steps: [
      [
        'Since $\\cos x$ decreases on $[0, \\frac{\\pi}{2}]$, a right endpoint gives the lowest height in its subinterval, so every right rectangle lies under the curve: $R_{n}$ underestimates the area.',
      ],
      ['Similarly every left rectangle reaches above the curve, so $L_{n}$ overestimates the area.'],
      [
        'As $n$ increases from 4 to 8, $R_{n}$ increases and $L_{n}$ decreases: both approach the exact area, which is 1.',
      ],
    ],
    answer: 'R_{n} < 1 < L_{n}',
    definite: { integrand: 'cos x', variable: 'x', lower: 0, upper: PI / 2, answer: { kind: 'explanation' } },
  }),

  // Q12 (a)–(c): Mid-point Rule for cos x
  midpointCos('a', 4),
  midpointCos('b', 6),
  midpointCos('c', 8),

  // Q13 (a)–(p): improper integrals
  part('Q13', 'a', 3, U.typeTwo, {
    problem: '\\int_{0}^{8} x^{-\\frac{2}{3}}\\,dx',
    technique: 'improper-type2',
    difficulty: 1,
    method: 'x^(−2/3) is unbounded at x = 0: Definition 2.5.3, t → 0⁺.',
    steps: [
      [
        'The integrand is unbounded at $x = 0$:',
        '\\int_{0}^{8} x^{-\\frac{2}{3}}\\,dx = \\lim_{t \\to 0^{+}} \\int_{t}^{8} x^{-\\frac{2}{3}}\\,dx = \\lim_{t \\to 0^{+}} \\left[3x^{\\frac{1}{3}}\\right]_{t}^{8}',
      ],
      ['Evaluate the limit:', '\\lim_{t \\to 0^{+}} \\left(6 - 3t^{\\frac{1}{3}}\\right) = 6'],
    ],
    answer: '6',
    definite: {
      integrand: 'x^(-2/3)',
      variable: 'x',
      lower: 0,
      upper: 8,
      singular: [0],
      answer: { kind: 'value', value: 6 },
    },
  }),
  part('Q13', 'b', 3, U.typeTwo, {
    problem: '\\int_{0}^{1} \\frac{dx}{\\sqrt[3]{x}}',
    technique: 'improper-type2',
    difficulty: 1,
    method: 'Unbounded at x = 0: Definition 2.5.3.',
    steps: [
      [
        '',
        '\\int_{0}^{1} x^{-\\frac{1}{3}}\\,dx = \\lim_{t \\to 0^{+}} \\left[\\frac{3}{2}x^{\\frac{2}{3}}\\right]_{t}^{1} = \\lim_{t \\to 0^{+}} \\left(\\frac{3}{2} - \\frac{3}{2}t^{\\frac{2}{3}}\\right) = \\frac{3}{2}',
      ],
    ],
    answer: '\\frac{3}{2}',
    definite: {
      integrand: '1/x^(1/3)',
      variable: 'x',
      lower: 0,
      upper: 1,
      singular: [0],
      answer: { kind: 'value', value: 1.5 },
    },
  }),
  part('Q13', 'c', 3, U.typeTwo, {
    problem: '\\int_{0}^{2} \\frac{dx}{x^{3}}',
    technique: 'improper-type2',
    difficulty: 1,
    method: 'Unbounded at x = 0: Definition 2.5.3.',
    steps: [
      [
        '',
        '\\int_{0}^{2} x^{-3}\\,dx = \\lim_{t \\to 0^{+}} \\left[-\\frac{1}{2x^{2}}\\right]_{t}^{2} = \\lim_{t \\to 0^{+}} \\left(-\\frac{1}{8} + \\frac{1}{2t^{2}}\\right) = \\infty',
      ],
      ['The limit is not a finite number, so the integral diverges.'],
    ],
    answer: '\\text{divergent}',
    definite: { integrand: '1/x^3', variable: 'x', lower: 0, upper: 2, singular: [0], answer: { kind: 'divergent' } },
  }),
  part('Q13', 'd', 3, U.typeTwo, {
    problem: '\\int_{-1}^{2} \\frac{dx}{x^{3}}',
    technique: 'improper-type2',
    difficulty: 2,
    method: 'The discontinuity x = 0 is inside [−1, 2]: Definition 2.5.4 needs both parts to converge.',
    steps: [
      [
        'Split at $x = 0$ (Definition 2.5.4):',
        '\\int_{-1}^{2} \\frac{dx}{x^{3}} = \\int_{-1}^{0} \\frac{dx}{x^{3}} + \\int_{0}^{2} \\frac{dx}{x^{3}}',
      ],
      [
        'The first part:',
        '\\lim_{t \\to 0^{-}} \\left[-\\frac{1}{2x^{2}}\\right]_{-1}^{t} = \\lim_{t \\to 0^{-}} \\left(-\\frac{1}{2t^{2}} + \\frac{1}{2}\\right) = -\\infty',
      ],
      ['One part diverges, so the integral diverges.'],
    ],
    answer: '\\text{divergent}',
    definite: { integrand: '1/x^3', variable: 'x', lower: -1, upper: 2, singular: [0], answer: { kind: 'divergent' } },
  }),
  part('Q13', 'e', 3, U.typeTwo, {
    problem: '\\int_{1}^{4} \\frac{1}{(x-3)^{3}}\\,dx',
    technique: 'improper-type2',
    difficulty: 2,
    method: 'The discontinuity x = 3 is inside [1, 4]: Definition 2.5.4.',
    steps: [
      [
        'Split at $x = 3$:',
        '\\int_{1}^{4} \\frac{dx}{(x-3)^{3}} = \\int_{1}^{3} \\frac{dx}{(x-3)^{3}} + \\int_{3}^{4} \\frac{dx}{(x-3)^{3}}',
      ],
      [
        'The second part:',
        '\\lim_{t \\to 3^{+}} \\left[-\\frac{1}{2(x-3)^{2}}\\right]_{t}^{4} = \\lim_{t \\to 3^{+}} \\left(-\\frac{1}{2} + \\frac{1}{2(t-3)^{2}}\\right) = \\infty',
      ],
      ['One part diverges, so the integral diverges.'],
    ],
    answer: '\\text{divergent}',
    definite: {
      integrand: '1/(x-3)^3',
      variable: 'x',
      lower: 1,
      upper: 4,
      singular: [3],
      answer: { kind: 'divergent' },
    },
  }),
  part('Q13', 'f', 3, U.typeOne, {
    problem: '\\int_{1}^{\\infty} \\frac{1}{x^{3}}\\,dx',
    technique: 'improper-type1',
    difficulty: 1,
    method: 'Definition 2.5.1 (1): integrate to t, then t → ∞.',
    steps: [
      [
        '',
        '\\int_{1}^{\\infty} x^{-3}\\,dx = \\lim_{t \\to \\infty} \\left[-\\frac{1}{2x^{2}}\\right]_{1}^{t} = \\lim_{t \\to \\infty} \\left(\\frac{1}{2} - \\frac{1}{2t^{2}}\\right) = \\frac{1}{2}',
      ],
    ],
    answer: '\\frac{1}{2}',
    definite: { integrand: '1/x^3', variable: 'x', lower: 1, upper: Infinity, answer: { kind: 'value', value: 0.5 } },
  }),
  part('Q13', 'g', 3, U.typeOne, {
    problem: '\\int_{-\\infty}^{-1} xe^{-x^{2}}\\,dx',
    technique: 'improper-type1',
    difficulty: 2,
    method: 'Definition 2.5.1 (2), with the substitution u = −x².',
    steps: [
      [
        'An anti-derivative is $-\\frac{1}{2}e^{-x^{2}}$:',
        '\\int_{-\\infty}^{-1} xe^{-x^{2}}\\,dx = \\lim_{t \\to -\\infty} \\left[-\\frac{1}{2}e^{-x^{2}}\\right]_{t}^{-1}',
      ],
      [
        'Evaluate the limit ($e^{-t^{2}} \\to 0$):',
        '\\lim_{t \\to -\\infty} \\left(-\\frac{1}{2e} + \\frac{1}{2}e^{-t^{2}}\\right) = -\\frac{1}{2e}',
      ],
    ],
    answer: '-\\frac{1}{2e}',
    definite: {
      integrand: 'x e^(-x^2)',
      variable: 'x',
      lower: -Infinity,
      upper: -1,
      answer: { kind: 'value', value: -1 / (2 * E) },
    },
  }),
  part('Q13', 'h', 3, U.typeTwo, {
    problem: '\\int_{-6}^{-1} (x+1)^{-3}\\,dx',
    technique: 'improper-type2',
    difficulty: 2,
    method: 'Unbounded at the upper limit x = −1: Definition 2.5.2, t → −1⁻.',
    steps: [
      [
        '',
        '\\lim_{t \\to -1^{-}} \\int_{-6}^{t} (x+1)^{-3}\\,dx = \\lim_{t \\to -1^{-}} \\left[-\\frac{1}{2(x+1)^{2}}\\right]_{-6}^{t} = \\lim_{t \\to -1^{-}} \\left(-\\frac{1}{2(t+1)^{2}} + \\frac{1}{50}\\right) = -\\infty',
      ],
      ['The limit is not a finite number, so the integral diverges.'],
    ],
    answer: '\\text{divergent}',
    definite: {
      integrand: '(x+1)^(-3)',
      variable: 'x',
      lower: -6,
      upper: -1,
      singular: [-1],
      answer: { kind: 'divergent' },
    },
  }),
  part('Q13', 'i', 3, U.typeTwo, {
    problem: '\\int_{0}^{16} x^{-\\frac{3}{4}}\\,dx',
    technique: 'improper-type2',
    difficulty: 1,
    method: 'Unbounded at x = 0: Definition 2.5.3.',
    steps: [
      [
        '',
        '\\lim_{t \\to 0^{+}} \\left[4x^{\\frac{1}{4}}\\right]_{t}^{16} = \\lim_{t \\to 0^{+}} \\left(8 - 4t^{\\frac{1}{4}}\\right) = 8',
      ],
    ],
    answer: '8',
    definite: {
      integrand: 'x^(-3/4)',
      variable: 'x',
      lower: 0,
      upper: 16,
      singular: [0],
      answer: { kind: 'value', value: 8 },
    },
  }),
  part('Q13', 'j', 3, U.typeOne, {
    problem: '\\int_{-\\infty}^{\\infty} \\frac{e^{x}}{1 + e^{2x}}\\,dx',
    technique: 'improper-type1',
    difficulty: 3,
    method: 'Definition 2.5.1 (3): split at 0; with u = eˣ an anti-derivative is tan⁻¹(eˣ).',
    steps: [
      [
        'With $u = e^{x}$, an anti-derivative is $\\tan^{-1}(e^{x})$. Split at $0$:',
        '\\int_{-\\infty}^{0} \\frac{e^{x}}{1+e^{2x}}\\,dx + \\int_{0}^{\\infty} \\frac{e^{x}}{1+e^{2x}}\\,dx',
      ],
      [
        'First part:',
        '\\lim_{t \\to -\\infty} \\left[\\tan^{-1}e^{x}\\right]_{t}^{0} = \\frac{\\pi}{4} - 0 = \\frac{\\pi}{4}',
      ],
      [
        'Second part:',
        '\\lim_{t \\to \\infty} \\left[\\tan^{-1}e^{x}\\right]_{0}^{t} = \\frac{\\pi}{2} - \\frac{\\pi}{4} = \\frac{\\pi}{4}',
      ],
      ['Both converge, so', '\\int_{-\\infty}^{\\infty} \\frac{e^{x}}{1+e^{2x}}\\,dx = \\frac{\\pi}{2}'],
    ],
    answer: '\\frac{\\pi}{2}',
    definite: {
      integrand: 'e^x/(1 + e^(2x))',
      variable: 'x',
      lower: -Infinity,
      upper: Infinity,
      answer: { kind: 'value', value: PI / 2 },
    },
  }),
  part('Q13', 'k', 3, U.typeOne, {
    problem: '\\int_{1}^{\\infty} (1 - x)e^{-x}\\,dx',
    technique: 'improper-type1',
    difficulty: 3,
    method: 'Integration by parts gives the anti-derivative xe^(−x); then t → ∞.',
    steps: [
      ['By parts ($u = 1 - x$, $dv = e^{-x}dx$):', '\\int (1 - x)e^{-x}\\,dx = -(1 - x)e^{-x} + e^{-x} = xe^{-x}'],
      [
        '',
        '\\lim_{t \\to \\infty} \\left[xe^{-x}\\right]_{1}^{t} = \\lim_{t \\to \\infty} \\left(te^{-t} - e^{-1}\\right) = -\\frac{1}{e}',
      ],
    ],
    answer: '-\\frac{1}{e}',
    definite: {
      integrand: '(1 - x)e^(-x)',
      variable: 'x',
      lower: 1,
      upper: Infinity,
      answer: { kind: 'value', value: -1 / E },
    },
  }),
  part('Q13', 'l', 3, U.typeTwo, {
    problem: '\\int_{0}^{1} \\frac{dx}{\\sqrt{x}(x + 1)}',
    technique: 'improper-type2',
    difficulty: 3,
    method: 'Unbounded at x = 0; substitute u = √x, so the integrand becomes 2/(u² + 1).',
    steps: [
      ['With $u = \\sqrt{x}$, $dx = 2u\\,du$: an anti-derivative is', '2\\tan^{-1}\\sqrt{x}'],
      [
        '',
        '\\lim_{t \\to 0^{+}} \\left[2\\tan^{-1}\\sqrt{x}\\right]_{t}^{1} = 2\\cdot\\frac{\\pi}{4} - 0 = \\frac{\\pi}{2}',
      ],
    ],
    answer: '\\frac{\\pi}{2}',
    definite: {
      integrand: '1/(sqrt(x)(x + 1))',
      variable: 'x',
      lower: 0,
      upper: 1,
      singular: [0],
      answer: { kind: 'value', value: PI / 2 },
    },
  }),
  part('Q13', 'm', 3, U.typeOne, {
    problem: '\\int_{4}^{\\infty} \\frac{1}{x(\\ln x)^{3}}\\,dx',
    technique: 'improper-type1',
    difficulty: 2,
    method: 'Substitute u = ln x; then t → ∞.',
    steps: [
      ['With $u = \\ln x$, $du = \\frac{dx}{x}$: an anti-derivative is', '-\\frac{1}{2(\\ln x)^{2}}'],
      [
        '',
        '\\lim_{t \\to \\infty} \\left[-\\frac{1}{2(\\ln x)^{2}}\\right]_{4}^{t} = 0 + \\frac{1}{2(\\ln 4)^{2}} = \\frac{1}{2(\\ln 4)^{2}}',
      ],
    ],
    answer: '\\frac{1}{2(\\ln 4)^{2}}',
    definite: {
      integrand: '1/(x ln(x)^3)',
      variable: 'x',
      lower: 4,
      upper: Infinity,
      answer: { kind: 'value', value: 1 / (2 * Math.log(4) ** 2) },
    },
  }),
  part('Q13', 'n', 3, U.typeOne, {
    problem: '\\int_{0}^{\\infty} \\frac{x^{3}}{(x^{2}+1)^{2}}\\,dx',
    technique: 'improper-type1',
    difficulty: 3,
    method: 'Substitute u = x² + 1, so x³ dx = ½(u − 1) du.',
    steps: [
      ['With $u = x^{2} + 1$: an anti-derivative is', '\\frac{1}{2}\\left[\\ln(x^{2}+1) + \\frac{1}{x^{2}+1}\\right]'],
      ['', '\\lim_{t \\to \\infty} \\frac{1}{2}\\left[\\ln(t^{2}+1) + \\frac{1}{t^{2}+1} - 1\\right] = \\infty'],
      ['The limit is not a finite number, so the integral diverges.'],
    ],
    answer: '\\text{divergent}',
    definite: { integrand: 'x^3/(x^2 + 1)^2', variable: 'x', lower: 0, upper: Infinity, answer: { kind: 'divergent' } },
  }),
  part('Q13', 'o', 3, U.typeOne, {
    problem: '\\int_{-\\infty}^{\\infty} \\frac{4}{16 + x^{2}}\\,dx',
    technique: 'improper-type1',
    difficulty: 2,
    method: 'Definition 2.5.1 (3): split at 0; an anti-derivative is tan⁻¹(x/4).',
    steps: [
      [
        'An anti-derivative is $\\tan^{-1}\\frac{x}{4}$. Split at $0$:',
        '\\lim_{t \\to -\\infty} \\left[\\tan^{-1}\\frac{x}{4}\\right]_{t}^{0} + \\lim_{t \\to \\infty} \\left[\\tan^{-1}\\frac{x}{4}\\right]_{0}^{t}',
      ],
      ['Both parts converge:', '\\left(0 + \\frac{\\pi}{2}\\right) + \\left(\\frac{\\pi}{2} - 0\\right) = \\pi'],
    ],
    answer: '\\pi',
    definite: {
      integrand: '4/(16 + x^2)',
      variable: 'x',
      lower: -Infinity,
      upper: Infinity,
      answer: { kind: 'value', value: PI },
    },
  }),
  part('Q13', 'p', 3, U.typeTwo, {
    problem: '\\int_{0}^{1} \\frac{1}{\\sqrt{2x - x^{2}}}\\,dx',
    technique: 'improper-type2',
    difficulty: 3,
    method: 'Complete the square: 2x − x² = 1 − (x − 1)²; unbounded at x = 0.',
    steps: [
      ['Since $2x - x^{2} = 1 - (x-1)^{2}$, an anti-derivative is', '\\sin^{-1}(x - 1)'],
      ['', '\\lim_{t \\to 0^{+}} \\left[\\sin^{-1}(x - 1)\\right]_{t}^{1} = 0 - \\sin^{-1}(-1) = \\frac{\\pi}{2}'],
    ],
    answer: '\\frac{\\pi}{2}',
    definite: {
      integrand: '1/sqrt(2x - x^2)',
      variable: 'x',
      lower: 0,
      upper: 1,
      singular: [0],
      answer: { kind: 'value', value: PI / 2 },
    },
  }),

  // Q14 (a)–(d): the Comparison Theorem
  part('Q14', 'a', 3, U.comparison, {
    instruction: 'Use the Comparison Theorem to determine if the integral converges or diverges',
    problem: '\\int_{1}^{\\infty} e^{-x^{2}}\\,dx',
    technique: 'comparison-test',
    difficulty: 1,
    method: 'Compare with e^(−x), as in Example 2.5.3.',
    steps: [
      ['For $x \\ge 1$, $x^{2} \\ge x$, so', '0 \\le e^{-x^{2}} \\le e^{-x}'],
      [
        '',
        '\\int_{1}^{\\infty} e^{-x}\\,dx = \\lim_{t \\to \\infty} \\left(\\frac{1}{e} - \\frac{1}{e^{t}}\\right) = \\frac{1}{e}',
      ],
      ['The larger integral converges, so by Theorem 2.5.1 (a) $\\int_{1}^{\\infty} e^{-x^{2}}\\,dx$ converges.'],
    ],
    answer: '\\text{convergent}',
    definite: {
      integrand: 'e^(-x^2)',
      variable: 'x',
      lower: 1,
      upper: Infinity,
      answer: { kind: 'verdict', converges: true },
    },
  }),
  part('Q14', 'b', 3, U.comparison, {
    instruction: 'Use the Comparison Theorem to determine if the integral converges or diverges',
    problem: '\\int_{1}^{\\infty} \\frac{1}{x^{5} + 1}\\,dx',
    technique: 'comparison-test',
    difficulty: 1,
    method: 'Compare with 1/x⁵.',
    steps: [
      ['For $x \\ge 1$:', '0 \\le \\frac{1}{x^{5} + 1} \\le \\frac{1}{x^{5}}'],
      [
        '',
        '\\int_{1}^{\\infty} x^{-5}\\,dx = \\lim_{t \\to \\infty} \\left(\\frac{1}{4} - \\frac{1}{4t^{4}}\\right) = \\frac{1}{4}',
      ],
      ['The larger integral converges, so the given integral converges (Theorem 2.5.1 (a)).'],
    ],
    answer: '\\text{convergent}',
    definite: {
      integrand: '1/(x^5 + 1)',
      variable: 'x',
      lower: 1,
      upper: Infinity,
      answer: { kind: 'verdict', converges: true },
    },
  }),
  part('Q14', 'c', 3, U.comparison, {
    instruction: 'Use the Comparison Theorem to determine if the integral converges or diverges',
    problem: '\\int_{0}^{\\infty} \\frac{x}{x^{3} + 1}\\,dx',
    technique: 'comparison-test',
    difficulty: 2,
    method: 'Split at 1 (as in Example 2.5.3); for x ≥ 1 compare with 1/x².',
    steps: [
      [
        'Split at 1: $\\int_{0}^{1} \\frac{x}{x^{3}+1}\\,dx$ is an ordinary definite integral.',
        '\\int_{0}^{\\infty} \\frac{x}{x^{3}+1}\\,dx = \\int_{0}^{1} \\frac{x}{x^{3}+1}\\,dx + \\int_{1}^{\\infty} \\frac{x}{x^{3}+1}\\,dx',
      ],
      ['For $x \\ge 1$:', '0 \\le \\frac{x}{x^{3}+1} \\le \\frac{x}{x^{3}} = \\frac{1}{x^{2}}'],
      [
        '$\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx = 1$ converges (equation (2.2)), so both parts converge and the integral converges.',
      ],
    ],
    answer: '\\text{convergent}',
    definite: {
      integrand: 'x/(x^3 + 1)',
      variable: 'x',
      lower: 0,
      upper: Infinity,
      answer: { kind: 'verdict', converges: true },
    },
  }),
  part('Q14', 'd', 3, U.comparison, {
    instruction: 'Use the Comparison Theorem to determine if the integral converges or diverges',
    problem: '\\int_{1}^{\\infty} \\frac{2 + e^{-x}}{x}\\,dx',
    technique: 'comparison-test',
    difficulty: 2,
    method: 'Compare from below with 1/x (Example 2.5.1 shows its integral diverges).',
    steps: [
      ['Since $e^{-x} > 0$, for $x \\ge 1$:', '\\frac{2 + e^{-x}}{x} \\ge \\frac{2}{x} \\ge \\frac{1}{x} \\ge 0'],
      [
        '$\\int_{1}^{\\infty} \\frac{1}{x}\\,dx$ diverges (Example 2.5.1), so by Theorem 2.5.1 (b) the larger integral diverges.',
      ],
    ],
    answer: '\\text{divergent}',
    definite: {
      integrand: '(2 + e^(-x))/x',
      variable: 'x',
      lower: 1,
      upper: Infinity,
      answer: { kind: 'verdict', converges: false },
    },
  }),
];
