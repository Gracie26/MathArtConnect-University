/**
 * Content for the Explore tools, from the course examples (Chapter 1) and
 * Tutorial 1. Explanations are app guidance.
 */

export interface Option {
  tex: string;
  correct: boolean;
  feedback: string;
}

export interface Stage {
  label: string;
  tex: string;
  note: string;
}

// -----------------------------------------------------------------------------
// Substitution Highlighter (1.5)
// -----------------------------------------------------------------------------

export interface HighlightPart {
  tex: string;
  /** "u": contains the inner function; "du": part of du; "none": neither. */
  role: 'u' | 'du' | 'none';
}

export interface HighlightExample {
  id: string;
  title: string;
  parts: HighlightPart[];
  inner: Option[];
  du: Option[];
  stages: Stage[];
}

export const HIGHLIGHT_EXAMPLES: HighlightExample[] = [
  {
    id: 'cube',
    title: '∫ x(x² + 2)³ dx',
    parts: [
      { tex: '\\int', role: 'none' },
      { tex: 'x', role: 'du' },
      { tex: '(x^{2}+2)^{3}', role: 'u' },
      { tex: 'dx', role: 'du' },
    ],
    inner: [
      { tex: 'x^{2} + 2', correct: true, feedback: 'It sits inside the cube, and its derivative $2x$ almost appears.' },
      { tex: 'x', correct: false, feedback: '$x$ is not inside another function here.' },
      {
        tex: '(x^{2}+2)^{3}',
        correct: false,
        feedback: 'That is the whole power; the inner function is what is being cubed.',
      },
    ],
    du: [
      { tex: 'du = 2x\\,dx', correct: true, feedback: 'The $x\\,dx$ in the integrand is half of $du$.' },
      { tex: 'du = x\\,dx', correct: false, feedback: '$\\frac{d}{dx}(x^{2}+2) = 2x$.' },
    ],
    stages: [
      {
        label: 'Original integral',
        tex: '\\int x(x^{2}+2)^{3}\\,dx',
        note: 'Inner function $x^{2} + 2$; its derivative $2x$ is almost there.',
      },
      { label: 'Substitution', tex: 'u = x^{2} + 2, \\quad du = 2x\\,dx', note: 'So $x\\,dx = \\frac{1}{2}du$.' },
      { label: 'Transformed integral', tex: '\\frac{1}{2}\\int u^{3}\\,du', note: 'Everything is now in $u$.' },
      { label: 'Integrated', tex: '\\frac{1}{2} \\cdot \\frac{u^{4}}{4} + C', note: 'The power rule in $u$.' },
      { label: 'Back substitution', tex: '\\frac{1}{8}(x^{2}+2)^{4} + C', note: 'Replace $u$ by $x^{2} + 2$.' },
    ],
  },
  {
    id: 'negative-power',
    title: '∫ x/(4x² + 3)⁶ dx',
    parts: [
      { tex: '\\int', role: 'none' },
      { tex: '(4x^{2}+3)^{-6}', role: 'u' },
      { tex: 'x\\,dx', role: 'du' },
    ],
    inner: [
      { tex: '4x^{2} + 3', correct: true, feedback: 'Inside the power, with derivative $8x$.' },
      { tex: 'x', correct: false, feedback: '$x$ multiplies; it is not inside another function.' },
    ],
    du: [
      { tex: 'du = 8x\\,dx', correct: true, feedback: 'So $x\\,dx = \\frac{1}{8}du$.' },
      { tex: 'du = 4x\\,dx', correct: false, feedback: '$\\frac{d}{dx}4x^{2} = 8x$.' },
    ],
    stages: [
      {
        label: 'Original integral',
        tex: '\\int (4x^{2}+3)^{-6}\\,x\\,dx',
        note: 'Rewritten with a negative power, as in the notes.',
      },
      { label: 'Substitution', tex: 'u = 4x^{2} + 3, \\quad du = 8x\\,dx', note: 'So $x\\,dx = \\frac{1}{8}du$.' },
      { label: 'Transformed integral', tex: '\\frac{1}{8}\\int u^{-6}\\,du', note: 'Everything is in $u$.' },
      { label: 'Integrated', tex: '\\frac{1}{8} \\cdot \\frac{u^{-5}}{-5} + C', note: 'The power rule.' },
      { label: 'Back substitution', tex: '-\\frac{1}{40}(4x^{2}+3)^{-5} + C', note: 'Replace $u$.' },
    ],
  },
  {
    id: 'sin10x',
    title: '∫ sin 10x dx',
    parts: [
      { tex: '\\int', role: 'none' },
      { tex: '\\sin 10x', role: 'u' },
      { tex: 'dx', role: 'du' },
    ],
    inner: [
      { tex: '10x', correct: true, feedback: 'The inner function of $\\sin 10x$.' },
      { tex: '\\sin 10x', correct: false, feedback: 'That is the outer function applied to $10x$.' },
    ],
    du: [
      { tex: 'du = 10\\,dx', correct: true, feedback: 'So $dx = \\frac{1}{10}du$.' },
      { tex: 'du = dx', correct: false, feedback: '$\\frac{d}{dx}10x = 10$.' },
    ],
    stages: [
      { label: 'Original integral', tex: '\\int \\sin 10x\\,dx', note: 'A linear inner function.' },
      {
        label: 'Substitution',
        tex: 'u = 10x, \\quad du = 10\\,dx',
        note: 'Multiply inside by 10 and outside by $\\frac{1}{10}$.',
      },
      { label: 'Transformed integral', tex: '\\frac{1}{10}\\int \\sin u\\,du', note: 'Everything in $u$.' },
      { label: 'Integrated', tex: '\\frac{1}{10}(-\\cos u) + C', note: '$\\int \\sin u\\,du = -\\cos u$.' },
      { label: 'Back substitution', tex: '-\\frac{1}{10}\\cos 10x + C', note: 'Replace $u$.' },
    ],
  },
  {
    id: 'root',
    title: '∫ x²√(2x³ − 4) dx',
    parts: [
      { tex: '\\int', role: 'none' },
      { tex: 'x^{2}', role: 'du' },
      { tex: '\\sqrt{2x^{3}-4}', role: 'u' },
      { tex: 'dx', role: 'du' },
    ],
    inner: [
      { tex: '2x^{3} - 4', correct: true, feedback: 'Inside the root; its derivative is $6x^{2}$.' },
      { tex: 'x^{2}', correct: false, feedback: '$x^{2}$ is part of $du$, not the inner function.' },
    ],
    du: [
      { tex: 'du = 6x^{2}\\,dx', correct: true, feedback: 'So $x^{2}\\,dx = \\frac{1}{6}du$.' },
      { tex: 'du = 2x^{2}\\,dx', correct: false, feedback: '$\\frac{d}{dx}2x^{3} = 6x^{2}$.' },
    ],
    stages: [
      { label: 'Original integral', tex: '\\int x^{2}\\sqrt{2x^{3}-4}\\,dx', note: 'A tutorial question.' },
      {
        label: 'Substitution',
        tex: 'u = 2x^{3} - 4, \\quad du = 6x^{2}\\,dx',
        note: 'So $x^{2}\\,dx = \\frac{1}{6}du$.',
      },
      {
        label: 'Transformed integral',
        tex: '\\frac{1}{6}\\int u^{\\frac{1}{2}}\\,du',
        note: 'The root is the power $\\frac{1}{2}$.',
      },
      { label: 'Integrated', tex: '\\frac{1}{6} \\cdot \\frac{2}{3}u^{\\frac{3}{2}} + C', note: 'The power rule.' },
      { label: 'Back substitution', tex: '\\frac{1}{9}(2x^{3}-4)^{\\frac{3}{2}} + C', note: 'Replace $u$.' },
    ],
  },
];

// -----------------------------------------------------------------------------
// Transformation Labs (1.5; 1.8, Table 1.1, 1.8.1, 1.9)
// -----------------------------------------------------------------------------

export interface Scenario {
  id: string;
  title: string;
  /** Table 1.1 row (1-based) the scenario uses, if any. */
  tableRow?: number;
  /** Optional first decision: choose the substitution. */
  choose?: { question: string; options: Option[] };
  steps: (Stage & { hint: string })[];
}

const s = (label: string, tex: string, note: string, hint: string) => ({ label, tex, note, hint });

export const SUBSTITUTION_SCENARIOS: Scenario[] = [
  {
    id: 'cube',
    title: '∫ x(x² + 2)³ dx',
    steps: [
      s('Original', '\\int x(x^{2}+2)^{3}\\,dx', 'Spot the inner function and its derivative.', 'What is being cubed?'),
      s('Choose u', 'u = x^{2} + 2', 'The inner function.', 'Its derivative should appear in the integrand.'),
      s(
        'Find du',
        'du = 2x\\,dx \\;\\Rightarrow\\; x\\,dx = \\frac{1}{2}du',
        'Differentiate and solve for what the integrand contains.',
        'Differentiate $x^{2} + 2$.',
      ),
      s('Rewrite', '\\frac{1}{2}\\int u^{3}\\,du', 'Every $x$ has gone.', 'Replace $(x^{2}+2)^{3}$ and $x\\,dx$.'),
      s('Integrate', '\\frac{u^{4}}{8} + C', 'Power rule.', 'Add 1 to the power and divide.'),
      s('Back to x', '\\frac{1}{8}(x^{2}+2)^{4} + C', 'Substitute back.', 'Replace $u$ by $x^{2} + 2$.'),
    ],
  },
  {
    id: 'cos-sin',
    title: '∫ cos x sin(sin x) dx',
    steps: [
      s('Original', '\\int \\cos x\\sin(\\sin x)\\,dx', 'A tutorial question.', 'Which function is inside another?'),
      s('Choose u', 'u = \\sin x', 'Inside $\\sin(\\,\\cdot\\,)$.', 'Its derivative is $\\cos x$, which is there.'),
      s('Find du', 'du = \\cos x\\,dx', 'Exactly the remaining factor.', 'Differentiate $\\sin x$.'),
      s('Rewrite', '\\int \\sin u\\,du', 'Everything in $u$.', 'Replace $\\sin x$ by $u$.'),
      s('Integrate', '-\\cos u + C', 'A standard integral.', '$\\int \\sin u\\,du$.'),
      s('Back to x', '-\\cos(\\sin x) + C', 'Substitute back.', 'Replace $u$.'),
    ],
  },
  {
    id: 'tan-inverse',
    title: '∫ tan⁻¹x/(1 + x²) dx',
    steps: [
      s(
        'Original',
        '\\int \\frac{\\tan^{-1}x}{1+x^{2}}\\,dx',
        'A tutorial question.',
        'Which function has derivative $\\frac{1}{1+x^{2}}$?',
      ),
      s('Choose u', 'u = \\tan^{-1}x', 'Its derivative is in the integrand.', '$\\frac{d}{dx}\\tan^{-1}x$.'),
      s('Find du', 'du = \\frac{1}{1+x^{2}}\\,dx', 'The remaining factor.', 'Standard derivative.'),
      s('Rewrite', '\\int u\\,du', 'Everything in $u$.', 'Replace both parts.'),
      s('Integrate', '\\frac{u^{2}}{2} + C', 'Power rule.', 'Add 1 to the power.'),
      s('Back to x', '\\frac{1}{2}(\\tan^{-1}x)^{2} + C', 'Substitute back.', 'Replace $u$.'),
    ],
  },
];

export const TRIG_SCENARIOS: Scenario[] = [
  {
    id: 'tan-sub',
    title: '∫ 1/√(x² + a²) dx',
    tableRow: 2,
    choose: {
      question: 'Which substitution removes the root?',
      options: [
        {
          tex: 'x = a\\tan\\theta',
          correct: true,
          feedback: '$a^{2}\\tan^{2}\\theta + a^{2} = a^{2}\\sec^{2}\\theta$.',
        },
        {
          tex: 'x = a\\sin\\theta',
          correct: false,
          feedback: 'That fits $\\sqrt{a^{2}-x^{2}}$, not $\\sqrt{x^{2}+a^{2}}$.',
        },
        { tex: 'x = a\\sec\\theta', correct: false, feedback: 'That fits $\\sqrt{x^{2}-a^{2}}$.' },
      ],
    },
    steps: [
      s(
        'Original',
        '\\int \\frac{1}{\\sqrt{x^{2}+a^{2}}}\\,dx',
        'The root has the form $\\sqrt{a^{2}+x^{2}}$.',
        'Look at Table 1.1.',
      ),
      s(
        'Substitute',
        'x = a\\tan\\theta, \\quad dx = a\\sec^{2}\\theta\\,d\\theta',
        'Row 2 of Table 1.1.',
        'Differentiate $a\\tan\\theta$.',
      ),
      s(
        'Simplify the root',
        '\\sqrt{a^{2}\\tan^{2}\\theta + a^{2}} = a\\sec\\theta',
        'Using $1 + \\tan^{2}\\theta = \\sec^{2}\\theta$.',
        'Take out $a^{2}$.',
      ),
      s(
        'Transformed',
        '\\int \\sec\\theta\\,d\\theta',
        'The factors of $a$ cancel.',
        '$\\frac{a\\sec^{2}\\theta}{a\\sec\\theta}$.',
      ),
      s('Integrate', '\\ln|\\sec\\theta + \\tan\\theta| + K', 'A standard result.', 'The integral of $\\sec\\theta$.'),
      s(
        'Back to x',
        '\\ln\\left(\\frac{x}{a} + \\sqrt{\\left(\\frac{x}{a}\\right)^{2} + 1}\\right) + K',
        'As in the notes.',
        '$\\tan\\theta = \\frac{x}{a}$.',
      ),
    ],
  },
  {
    id: 'sin-sub',
    title: '∫ dx/√(4 − 3x²)',
    tableRow: 1,
    choose: {
      question: 'Which substitution removes the root?',
      options: [
        {
          tex: '\\sqrt{3}x = 2\\sin\\theta',
          correct: true,
          feedback: 'The root has the form $\\sqrt{a^{2} - (\\sqrt{3}x)^{2}}$ with $a = 2$.',
        },
        { tex: '\\sqrt{3}x = 2\\tan\\theta', correct: false, feedback: 'That fits a sum of squares under the root.' },
      ],
    },
    steps: [
      s(
        'Original',
        '\\int \\frac{dx}{\\sqrt{4-3x^{2}}}',
        'A tutorial question.',
        'Write $3x^{2}$ as $(\\sqrt{3}x)^{2}$.',
      ),
      s(
        'Substitute',
        '\\sqrt{3}x = 2\\sin\\theta, \\quad dx = \\frac{2}{\\sqrt{3}}\\cos\\theta\\,d\\theta',
        'Row 1 of Table 1.1.',
        'Differentiate both sides.',
      ),
      s(
        'Simplify the root',
        '\\sqrt{4 - 4\\sin^{2}\\theta} = 2\\cos\\theta',
        'Using $1 - \\sin^{2}\\theta = \\cos^{2}\\theta$.',
        'Take out 4.',
      ),
      s(
        'Transformed',
        '\\frac{1}{\\sqrt{3}}\\int d\\theta',
        'Everything cancels except a constant.',
        'Divide $dx$ by the root.',
      ),
      s(
        'Back to x',
        '\\frac{1}{\\sqrt{3}}\\sin^{-1}\\left(\\frac{\\sqrt{3}x}{2}\\right) + C',
        '$\\theta = \\sin^{-1}\\frac{\\sqrt{3}x}{2}$.',
        'Solve for $\\theta$.',
      ),
    ],
  },
  {
    id: 'rationalise',
    title: 'Rationalising with t = √(4x + 1)',
    tableRow: 6,
    choose: {
      question: 'Which substitution turns this into a rational function?',
      options: [
        { tex: 't = \\sqrt{4x+1}', correct: true, feedback: 'As in the notes: then $t^{2} = 4x + 1$.' },
        { tex: 't = 4x + 1', correct: false, feedback: 'A root $\\sqrt{t}$ would remain.' },
      ],
    },
    steps: [
      s(
        'Original',
        '\\int \\frac{2x+3+2\\sqrt{4x+1}}{5x-7-\\sqrt{4x+1}}\\,dx',
        'A function of $x$ and $\\sqrt{ax+b}$ (row 6).',
        'Let the new variable be the root.',
      ),
      s(
        'Substitute',
        't^{2} = 4x + 1, \\quad x = \\frac{t^{2}-1}{4}, \\quad dx = \\frac{1}{2}t\\,dt',
        'Express $x$ and $dx$ in $t$.',
        'Solve $t^{2} = 4x + 1$ for $x$.',
      ),
      s(
        'Rewrite',
        '\\int \\frac{2\\left(\\frac{t^{2}-1}{4}\\right) + 3 + 2t}{5\\left(\\frac{t^{2}-1}{4}\\right) - 7 - t} \\cdot \\frac{t}{2}\\,dt',
        'Substitute everywhere.',
        'Replace $x$, the root and $dx$.',
      ),
      s(
        'Rational form',
        '\\int \\frac{t(t^{2}+4t+5)}{5t^{2}-4t-33}\\,dt',
        'A rational function of $t$: partial fractions can finish it.',
        'Clear the inner fractions.',
      ),
    ],
  },
  {
    id: 'half-angle',
    title: '∫ dx/(5 + 3 cos x)',
    choose: {
      question: 'Which substitution?',
      options: [
        { tex: 't = \\tan\\frac{x}{2}', correct: true, feedback: 'For rational functions of $\\sin x$ and $\\cos x$.' },
        {
          tex: 't = \\tan x',
          correct: false,
          feedback: 'That is for rational functions of $\\cos 2x$, $\\sin 2x$, $\\cos^{2}x$ and $\\sin^{2}x$.',
        },
      ],
    },
    steps: [
      s('Original', '\\int \\frac{dx}{5+3\\cos x}', 'A rational function of $\\cos x$.', 'Section 1.9.'),
      s(
        'Substitute',
        '\\cos x = \\frac{1-t^{2}}{1+t^{2}}, \\quad dx = \\frac{2\\,dt}{1+t^{2}}',
        'With $t = \\tan\\frac{x}{2}$.',
        'The half-angle identities.',
      ),
      s(
        'Combine',
        '\\int \\frac{2\\,dt}{5(1+t^{2}) + 3(1-t^{2})} = \\int \\frac{2\\,dt}{8+2t^{2}}',
        'Common denominator $1 + t^{2}$.',
        'Multiply out.',
      ),
      s(
        'Integrate',
        '\\int \\frac{dt}{t^{2}+4} = \\frac{1}{2}\\tan^{-1}\\frac{t}{2} + C',
        'An inverse tangent.',
        '$t^{2} + 2^{2}$.',
      ),
      s(
        'Back to x',
        '\\frac{1}{2}\\tan^{-1}\\left(\\frac{1}{2}\\tan\\frac{x}{2}\\right) + C',
        'As in the notes.',
        'Replace $t$.',
      ),
    ],
  },
  {
    id: 'fractional',
    title: '∫ 1/(x^½ + x^¼) dx',
    tableRow: 10,
    choose: {
      question: 'Which substitution?',
      options: [
        { tex: 'x = u^{4}', correct: true, feedback: '4 is the LCM of the denominators 2 and 4.' },
        {
          tex: 'x = u^{2}',
          correct: false,
          feedback: '$x^{\\frac{1}{4}} = u^{\\frac{1}{2}}$ would still be fractional.',
        },
      ],
    },
    steps: [
      s(
        'Original',
        '\\int \\frac{1}{x^{\\frac{1}{2}}+x^{\\frac{1}{4}}}\\,dx',
        'Fractional powers (row 10).',
        'LCM of 2 and 4.',
      ),
      s('Substitute', 'x = u^{4}, \\quad dx = 4u^{3}\\,du', 'Both powers become whole.', 'Differentiate $u^{4}$.'),
      s(
        'Rewrite',
        '4\\int \\frac{u^{3}}{u^{2}+u}\\,du = 4\\int \\frac{u^{2}}{u+1}\\,du',
        'A rational function of $u$.',
        'Cancel a factor of $u$.',
      ),
      s('Divide', '4\\int \\left(u - 1 + \\frac{1}{u+1}\\right)du', 'Long division.', 'Improper rational function.'),
      s(
        'Back to x',
        '2x^{\\frac{1}{2}} - 4x^{\\frac{1}{4}} + 4\\ln(1+x^{\\frac{1}{4}}) + C',
        'Integrate and substitute back.',
        'Replace $u = x^{\\frac{1}{4}}$.',
      ),
    ],
  },
];

// -----------------------------------------------------------------------------
// Fraction Decomposer (1.6, 1.6.1–1.6.3, 1.7)
// -----------------------------------------------------------------------------

export interface Factor {
  tex: string;
  kind: 'linear' | 'quadratic';
  multiplicity: number;
}

export interface DecomposerExample {
  id: string;
  title: string;
  fractionTex: string;
  /** Long division first, for improper fractions. */
  division?: { options: Option[] };
  factors: Factor[];
  /** Which cases apply (the learner must pick all of them). */
  cases: ('distinct' | 'repeated' | 'quadratic' | 'repeatedQuadratic')[];
}

export const CASE_LABELS = {
  distinct: 'Distinct linear factors (Case I)',
  repeated: 'Repeated linear factor (Case II)',
  quadratic: 'Irreducible quadratic factor (Case III)',
  repeatedQuadratic: 'Repeated irreducible quadratic factor (Case IV)',
} as const;

export const DECOMPOSER_EXAMPLES: DecomposerExample[] = [
  {
    id: 'distinct',
    title: '(x + 7)/(x² − x − 6)',
    fractionTex: '\\frac{x+7}{x^{2}-x-6} = \\frac{x+7}{(x-3)(x+2)}',
    factors: [
      { tex: 'x-3', kind: 'linear', multiplicity: 1 },
      { tex: 'x+2', kind: 'linear', multiplicity: 1 },
    ],
    cases: ['distinct'],
  },
  {
    id: 'repeated',
    title: '(5x² + 20x + 6)/(x³ + 2x² + x)',
    fractionTex: '\\frac{5x^{2}+20x+6}{x(x+1)^{2}}',
    factors: [
      { tex: 'x', kind: 'linear', multiplicity: 1 },
      { tex: 'x+1', kind: 'linear', multiplicity: 2 },
    ],
    cases: ['distinct', 'repeated'],
  },
  {
    id: 'quadratic',
    title: '(x + 1)/(x(x² + 1))',
    fractionTex: '\\frac{x+1}{x(x^{2}+1)}',
    factors: [
      { tex: 'x', kind: 'linear', multiplicity: 1 },
      { tex: 'x^{2}+1', kind: 'quadratic', multiplicity: 1 },
    ],
    cases: ['distinct', 'quadratic'],
  },
  {
    id: 'two-quadratics',
    title: 'x/((x − 2)(x² + 1)(x² + 4))',
    fractionTex: '\\frac{x}{(x-2)(x^{2}+1)(x^{2}+4)}',
    factors: [
      { tex: 'x-2', kind: 'linear', multiplicity: 1 },
      { tex: 'x^{2}+1', kind: 'quadratic', multiplicity: 1 },
      { tex: 'x^{2}+4', kind: 'quadratic', multiplicity: 1 },
    ],
    cases: ['distinct', 'quadratic'],
  },
  {
    id: 'repeated-quadratic',
    title: '(1 − x + 2x² − x³)/(x(x² + 1)²)',
    fractionTex: '\\frac{1-x+2x^{2}-x^{3}}{x(x^{2}+1)^{2}}',
    factors: [
      { tex: 'x', kind: 'linear', multiplicity: 1 },
      { tex: 'x^{2}+1', kind: 'quadratic', multiplicity: 2 },
    ],
    cases: ['distinct', 'repeatedQuadratic'],
  },
  {
    id: 'improper',
    title: '(x⁵ + x − 1)/(x⁴ − x³)',
    fractionTex: '\\frac{x^{5}+x-1}{x^{4}-x^{3}}',
    division: {
      options: [
        {
          tex: 'x + 1 + \\frac{x^{3}+x-1}{x^{3}(x-1)}',
          correct: true,
          feedback: 'Degree 5 over degree 4: divide first. The remainder fraction is proper.',
        },
        {
          tex: 'x + \\frac{x+1}{x^{3}(x-1)}',
          correct: false,
          feedback: 'Multiply back: $x(x^{4} - x^{3}) = x^{5} - x^{4}$, which leaves $x^{4} + x - 1$ still to divide.',
        },
      ],
    },
    factors: [
      { tex: 'x', kind: 'linear', multiplicity: 3 },
      { tex: 'x-1', kind: 'linear', multiplicity: 1 },
    ],
    cases: ['distinct', 'repeated'],
  },
];

// -----------------------------------------------------------------------------
// Choose U Lab and Repeated-Parts Flow (1.10, 1.11)
// -----------------------------------------------------------------------------

export interface PartsChoice {
  label: string;
  u: string;
  dv: string;
  du: string;
  v: string;
  remaining: string;
  verdict: 'useful' | 'harder' | 'stuck';
  why: string;
}

export interface PartsExample {
  id: string;
  title: string;
  integralTex: string;
  choices: PartsChoice[];
}

export const PARTS_EXAMPLES: PartsExample[] = [
  {
    id: 'xex',
    title: '∫ x eˣ dx',
    integralTex: '\\int xe^{x}\\,dx',
    choices: [
      {
        label: 'u = x',
        u: 'x',
        dv: 'e^{x}\\,dx',
        du: 'dx',
        v: 'e^{x}',
        remaining: '\\int e^{x}\\,dx',
        verdict: 'useful',
        why: 'Differentiating $x$ gives 1, so the remaining integral is easy.',
      },
      {
        label: 'u = eˣ',
        u: 'e^{x}',
        dv: 'x\\,dx',
        du: 'e^{x}\\,dx',
        v: '\\frac{x^{2}}{2}',
        remaining: '\\int \\frac{x^{2}}{2}e^{x}\\,dx',
        verdict: 'harder',
        why: 'This choice is valid, but it makes the remaining integral harder: the power of $x$ went up.',
      },
    ],
  },
  {
    id: 'x2lnx',
    title: '∫ x² ln x dx',
    integralTex: '\\int x^{2}\\ln x\\,dx',
    choices: [
      {
        label: 'u = ln x',
        u: '\\ln x',
        dv: 'x^{2}\\,dx',
        du: '\\frac{1}{x}\\,dx',
        v: '\\frac{x^{3}}{3}',
        remaining: '\\frac{1}{3}\\int x^{2}\\,dx',
        verdict: 'useful',
        why: '$x^{2}$ is more easily integrated than $\\ln x$, as the notes say.',
      },
      {
        label: 'u = x²',
        u: 'x^{2}',
        dv: '\\ln x\\,dx',
        du: '2x\\,dx',
        v: 'x\\ln x - x',
        remaining: '\\int 2x(x\\ln x - x)\\,dx',
        verdict: 'harder',
        why: 'This choice is valid, but you first need $\\int \\ln x\\,dx$ for $v$, and the remaining integral still has a logarithm.',
      },
    ],
  },
  {
    id: 'lnx',
    title: '∫ ln x dx',
    integralTex: '\\int \\ln x\\,dx',
    choices: [
      {
        label: 'u = ln x, dv = dx',
        u: '\\ln x',
        dv: 'dx',
        du: '\\frac{1}{x}\\,dx',
        v: 'x',
        remaining: '\\int dx',
        verdict: 'useful',
        why: 'With one factor, take $dv = dx$; the logarithm disappears when differentiated.',
      },
      {
        label: 'u = 1, dv = ln x dx',
        u: '1',
        dv: '\\ln x\\,dx',
        du: '0',
        v: '\\int \\ln x\\,dx',
        remaining: '-',
        verdict: 'stuck',
        why: 'Finding $v$ needs $\\int \\ln x\\,dx$, the very integral you want, so this goes in a circle.',
      },
    ],
  },
  {
    id: 'xtan',
    title: '∫ x tan⁻¹x dx',
    integralTex: '\\int x\\tan^{-1}x\\,dx',
    choices: [
      {
        label: 'u = tan⁻¹x',
        u: '\\tan^{-1}x',
        dv: 'x\\,dx',
        du: '\\frac{1}{1+x^{2}}\\,dx',
        v: '\\frac{x^{2}}{2}',
        remaining: '\\frac{1}{2}\\int \\frac{x^{2}}{1+x^{2}}\\,dx',
        verdict: 'useful',
        why: 'The inverse tangent becomes a rational function when differentiated.',
      },
      {
        label: 'u = x',
        u: 'x',
        dv: '\\tan^{-1}x\\,dx',
        du: 'dx',
        v: '\\int \\tan^{-1}x\\,dx',
        remaining: '\\int v\\,dx',
        verdict: 'harder',
        why: 'This choice is valid, but finding $v$ needs integration by parts itself.',
      },
    ],
  },
];

export interface PartsTimeline {
  id: string;
  title: string;
  extension?: boolean;
  nodes: { label: string; tex: string; note: string }[];
}

export const PARTS_TIMELINES: PartsTimeline[] = [
  {
    id: 'x2ex',
    title: '∫ x² eˣ dx',
    nodes: [
      {
        label: 'Start',
        tex: '\\int x^{2}e^{x}\\,dx',
        note: 'Two applications will be needed: the power of $x$ drops by one each time.',
      },
      {
        label: 'Application 1',
        tex: 'u = x^{2},\\ dv = e^{x}\\,dx \\;\\Rightarrow\\; x^{2}e^{x} - \\int 2xe^{x}\\,dx',
        note: 'A simpler product remains.',
      },
      {
        label: 'Application 2',
        tex: 'u = 2x,\\ dv = e^{x}\\,dx \\;\\Rightarrow\\; 2xe^{x} - \\int 2e^{x}\\,dx',
        note: 'No product remains.',
      },
      { label: 'Combine', tex: 'x^{2}e^{x} - (2xe^{x} - 2e^{x}) + C', note: 'Watch the signs.' },
      { label: 'Answer', tex: 'e^{x}(x^{2} - 2x + 2) + C', note: 'As in the notes.' },
    ],
  },
  {
    id: 'x3cos',
    title: '∫ x³ cos x dx',
    nodes: [
      {
        label: 'Start',
        tex: '\\int x^{3}\\cos x\\,dx',
        note: 'A tutorial question: three applications, each lowering the power of $x$.',
      },
      {
        label: 'Application 1',
        tex: 'x^{3}\\sin x - \\int 3x^{2}\\sin x\\,dx',
        note: '$u = x^{3}$, $dv = \\cos x\\,dx$.',
      },
      {
        label: 'Application 2',
        tex: '\\int 3x^{2}\\sin x\\,dx = -3x^{2}\\cos x + \\int 6x\\cos x\\,dx',
        note: '$u = 3x^{2}$, $dv = \\sin x\\,dx$.',
      },
      {
        label: 'Application 3',
        tex: '\\int 6x\\cos x\\,dx = 6x\\sin x + 6\\cos x',
        note: '$u = 6x$, $dv = \\cos x\\,dx$.',
      },
      {
        label: 'Answer',
        tex: 'x^{3}\\sin x + 3x^{2}\\cos x - 6x\\sin x - 6\\cos x + C',
        note: 'Collect the terms carefully.',
      },
    ],
  },
  {
    id: 'exsin',
    title: '∫ eˣ sin x dx',
    extension: true,
    nodes: [
      {
        label: 'Start',
        tex: 'I = \\int e^{x}\\sin x\\,dx',
        note: 'Neither factor simplifies, so the integral comes back.',
      },
      {
        label: 'Application 1',
        tex: 'I = e^{x}\\sin x - \\int e^{x}\\cos x\\,dx',
        note: '$u = \\sin x$, $dv = e^{x}\\,dx$.',
      },
      {
        label: 'Application 2',
        tex: '\\int e^{x}\\cos x\\,dx = e^{x}\\cos x + I',
        note: '$u = \\cos x$; the original integral $I$ reappears.',
      },
      { label: 'Solve for I', tex: '2I = e^{x}(\\sin x - \\cos x)', note: 'Move $I$ to one side.' },
      { label: 'Answer', tex: 'I = \\frac{1}{2}e^{x}(\\sin x - \\cos x) + C', note: 'Beyond the notes: an extension.' },
    ],
  },
];
