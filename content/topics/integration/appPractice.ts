/**
 * App practice for the Try it steps of Understanding Integration (§1.1–1.2)
 * and Basic Integration Rules (§1.3–1.4). The notes have no "You Try It"
 * items in these sections, so these questions are written for the app,
 * practise only methods taught there, and are always labelled "App practice",
 * never presented as UNAM or lecturer questions.
 *
 * The My Working questions are PracticeItems: hints are app guidance, the
 * app-authored solutions stay `pendingLecturerReview` (hidden from learners),
 * and every answer is checked by differentiation in
 * __tests__/integration-solutions.test.ts. They sit in the topic's
 * retrievalItems, so course question counts are unchanged while attempts still
 * appear in Review, My Work and Progress.
 */
import type { ContentBlock, PracticeItem, QuickCheckQuestion } from '../../types';

import { INTEGRATION_UNITS as U, type IntegrationUnitId } from './ids';
import { buildPracticeItem, type PracticeSpec } from './practice';
import { CH1, sectionId } from './sources';

function appItem(
  id: string,
  unitId: IntegrationUnitId,
  section: string,
  page: number,
  spec: PracticeSpec,
): PracticeItem {
  return buildPracticeItem(
    {
      id: `app1-${id}`,
      sourceType: 'app-practice',
      source: { document: CH1, section, page },
      sourceSection: sectionId(section),
      unitId,
    },
    spec,
  );
}

// ---------------------------------------------------------------------------
// Understanding Integration
// ---------------------------------------------------------------------------

const UNDERSTANDING_CHECKS: QuickCheckQuestion[] = [
  {
    id: 'app1-qc-recognise',
    prompt: 'Which function is an anti-derivative of $f(x) = 3x^{2}$?',
    options: [
      { text: '$x^{3}$', feedback: 'Yes. Differentiating $x^{3}$ gives $3x^{2}$, which is $f(x)$.' },
      {
        text: '$6x$',
        feedback:
          '$6x$ is the derivative of $3x^{2}$. An anti-derivative goes the other way: its derivative is $3x^{2}$.',
      },
      { text: '$3x^{3}$', feedback: 'Differentiate $3x^{3}$: you get $9x^{2}$, not $3x^{2}$.' },
      { text: '$\\frac{x^{3}}{3}$', feedback: 'Differentiate $\\frac{x^{3}}{3}$: you get $x^{2}$, not $3x^{2}$.' },
    ],
    correctIndex: 0,
    hint: 'Differentiate each option. The anti-derivative is the one whose derivative is exactly $3x^{2}$.',
  },
  {
    id: 'app1-qc-match',
    prompt: '$F(x) = \\sin x + 4$ is an anti-derivative of which function?',
    options: [
      { text: '$\\cos x + 4$', feedback: "The constant 4 differentiates to 0, so it does not appear in $F'(x)$." },
      {
        text: '$-\\cos x$',
        feedback: 'The derivative of $\\sin x$ is $\\cos x$; the minus sign belongs to the derivative of $\\cos x$.',
      },
      { text: '$\\cos x$', feedback: "Yes. $F'(x) = \\cos x + 0 = \\cos x$." },
      {
        text: '$\\sin x$',
        feedback: 'That is part of $F$ itself. An anti-derivative of $f$ is a function whose derivative is $f$.',
      },
    ],
    correctIndex: 2,
    hint: "Find $F'(x)$. Remember what happens to a constant when you differentiate.",
  },
  {
    id: 'app1-qc-constant',
    prompt: '$F(x) = x^{2} + 7$ and $G(x) = x^{2} - 2$ are both anti-derivatives of $2x$. How are they related?',
    options: [
      {
        text: 'They have different derivatives.',
        feedback: "Check: $F'(x) = 2x$ and $G'(x) = 2x$. The derivatives are equal.",
      },
      {
        text: 'They differ by the constant 9.',
        feedback: 'Yes. $F(x) - G(x) = 9$ for every $x$: anti-derivatives of the same function differ by a constant.',
      },
      {
        text: 'Only one of them can be an anti-derivative.',
        feedback: 'Both differentiate to $2x$, so both are anti-derivatives. There are infinitely many.',
      },
      { text: 'They differ by $9x$.', feedback: 'Subtract them: $(x^{2} + 7) - (x^{2} - 2) = 9$, with no $x$ left.' },
    ],
    correctIndex: 1,
    hint: "Work out $F(x) - G(x)$, and compare $F'(x)$ with $G'(x)$.",
  },
  {
    id: 'app1-qc-family',
    prompt:
      'The curves $y = x^{2} + C$ are drawn for several values of $C$. What do all the curves have in common at $x = 1$?',
    options: [
      { text: 'The same $y$-value', feedback: 'At $x = 1$ the heights are $1 + C$, which change with $C$.' },
      { text: 'They all pass through the origin', feedback: 'Only the curve with $C = 0$ passes through the origin.' },
      {
        text: 'Nothing: they are unrelated curves',
        feedback: 'They are one family: each is a vertical shift of $y = x^{2}$.',
      },
      {
        text: 'The same slope, 2',
        feedback:
          'Yes. Every curve has slope $2x$, so at $x = 1$ each slope is 2: the curves are vertical shifts of each other.',
      },
    ],
    correctIndex: 3,
    hint: 'Differentiate $x^{2} + C$. Does $C$ change the slope or the height?',
  },
  {
    id: 'app1-qc-plus-c',
    prompt: 'For every constant $C$, which is true?',
    tex: '\\frac{d}{dx}\\left(x^{4} + C\\right) = \\;?',
    options: [
      { text: '$4x^{3} + C$', feedback: 'The derivative of a constant is 0, so $C$ disappears.' },
      { text: '$4x^{3}$', feedback: 'Yes. That is why $\\int 4x^{3}\\,dx = x^{4} + C$: every choice of $C$ works.' },
      { text: '$x^{4}$', feedback: 'That is the function itself, not its derivative.' },
      { text: '$4x^{3} + 1$', feedback: 'Nothing is added when a constant is differentiated: its derivative is 0.' },
    ],
    correctIndex: 1,
    hint: 'Differentiate term by term. What is the derivative of a constant?',
  },
];

export const UNDERSTANDING_APP_PRACTICE: readonly PracticeItem[] = [
  appItem('understanding-1', U.understanding, '1.2', 2, {
    instruction: 'Reverse the derivative: find',
    problem: '\\int 4x^{3}\\,dx',
    technique: 'reverse-differentiation',
    difficulty: 1,
    method: 'Which function has derivative $4x^{3}$? Then add $C$ for the whole family.',
    steps: [
      ['Since $\\frac{d}{dx}x^{4} = 4x^{3}$, $x^{4}$ is an anti-derivative.', 'x^{4}'],
      ['Add the constant of integration.', 'x^{4} + C'],
    ],
    answer: 'x^{4} + C',
  }),
  appItem('understanding-2', U.understanding, '1.2', 2, {
    instruction: 'Reverse the derivative: find',
    problem: '\\int (6x + 1)\\,dx',
    technique: 'reverse-differentiation',
    difficulty: 1,
    method: 'Find a function whose derivative is $6x$, and one whose derivative is $1$.',
    steps: [
      ['Since $\\frac{d}{dx}3x^{2} = 6x$ and $\\frac{d}{dx}x = 1$:', '3x^{2} + x'],
      ['Add the constant of integration.', '3x^{2} + x + C'],
    ],
    answer: '3x^{2} + x + C',
  }),
  appItem('understanding-3', U.understanding, '1.2', 2, {
    instruction: 'Reverse the derivative: find',
    problem: '\\int \\cos x\\,dx',
    technique: 'reverse-differentiation',
    difficulty: 1,
    method: 'Which function differentiates to $\\cos x$?',
    steps: [
      ['Since $\\frac{d}{dx}\\sin x = \\cos x$, $\\sin x$ is an anti-derivative.', '\\sin x'],
      ['Add the constant of integration.', '\\sin x + C'],
    ],
    answer: '\\sin x + C',
  }),
];

/** Try it for Understanding Integration: recognise anti-derivatives, then reverse a derivative in My Working. */
export const UNDERSTANDING_TRY_IT: ContentBlock[] = [
  {
    type: 'quickCheck',
    title: 'Recognise an anti-derivative',
    text: 'Choose an answer to see feedback on it. You can try again as often as you like.',
    questions: UNDERSTANDING_CHECKS,
  },
  {
    type: 'practiceGroup',
    title: 'Reverse the derivative',
    text: 'Write your answer in My Working. It is checked by differentiating it, and a missing $+ C$ is pointed out.',
    items: [...UNDERSTANDING_APP_PRACTICE],
  },
];

// ---------------------------------------------------------------------------
// Basic Integration Rules
// ---------------------------------------------------------------------------

const RULE_CHECKS: QuickCheckQuestion[] = [
  {
    id: 'app1-qc-exception',
    prompt: 'Which integral can the power rule NOT be used for?',
    options: [
      {
        text: '$\\int x^{-2}\\,dx$',
        feedback: 'Here $n = -2$, so $n + 1 = -1 \\neq 0$: the power rule works and gives $-x^{-1} + C$.',
      },
      { text: '$\\int x^{\\frac{1}{2}}\\,dx$', feedback: 'Fractional powers are fine: $n + 1 = \\frac{3}{2}$.' },
      {
        text: '$\\int x^{-1}\\,dx$',
        feedback:
          'Yes. With $n = -1$ the formula divides by $n + 1 = 0$. Use $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$ instead.',
      },
      { text: '$\\int x^{0}\\,dx$', feedback: '$x^{0} = 1$ and the power rule gives $x + C$, which is correct.' },
    ],
    correctIndex: 2,
    hint: 'The power rule divides by $n + 1$. For which exponent is that zero?',
  },
  {
    id: 'app1-qc-constant-multiple',
    prompt: 'Which is equal to the integral below?',
    tex: '\\int 7\\sin x\\,dx',
    options: [
      { text: '$7\\cos x + C$', feedback: 'Check the sign: $\\frac{d}{dx}\\cos x = -\\sin x$.' },
      { text: '$-7\\cos x + C$', feedback: 'Yes. Take the 7 outside, then $\\int \\sin x\\,dx = -\\cos x + C$.' },
      { text: '$7x\\sin x + C$', feedback: 'A constant factor comes outside the integral; it does not become $7x$.' },
      { text: '$-\\cos 7x + C$', feedback: 'The 7 multiplies $\\sin x$; it is not inside the sine.' },
    ],
    correctIndex: 1,
    hint: 'Use $\\int kf(x)\\,dx = k\\int f(x)\\,dx$, then the standard formula for $\\sin x$.',
  },
  {
    id: 'app1-qc-rewrite',
    prompt: 'Before using the power rule on $\\int \\frac{1}{\\sqrt{x}}\\,dx$, how should the integrand be written?',
    options: [
      {
        text: '$x^{\\frac{1}{2}}$',
        feedback: 'That is $\\sqrt{x}$ itself. Dividing by it makes the exponent negative.',
      },
      { text: '$x^{-2}$', feedback: 'That would be $\\frac{1}{x^{2}}$. A square root is the power $\\frac{1}{2}$.' },
      {
        text: '$-x^{\\frac{1}{2}}$',
        feedback: 'A reciprocal changes the sign of the exponent, not of the whole term.',
      },
      {
        text: '$x^{-\\frac{1}{2}}$',
        feedback: 'Yes. $\\sqrt{x} = x^{\\frac{1}{2}}$, so $\\frac{1}{\\sqrt{x}} = x^{-\\frac{1}{2}}$.',
      },
    ],
    correctIndex: 3,
    hint: 'Write the root as a power first, then use $\\frac{1}{x^{a}} = x^{-a}$.',
  },
];

export const BASIC_RULES_APP_PRACTICE: readonly PracticeItem[] = [
  appItem('basic-power', U.basicRules, '1.3', 3, {
    problem: '\\int x^{9}\\,dx',
    technique: 'standard-forms',
    difficulty: 1,
    method: 'Power rule with $n = 9$.',
    steps: [['Raise the exponent from 9 to 10, then divide by 10.', '\\frac{x^{10}}{10} + C']],
    answer: '\\frac{x^{10}}{10} + C',
  }),
  appItem('basic-multiple', U.basicRules, '1.4', 4, {
    problem: '\\int 5x^{4}\\,dx',
    technique: 'standard-forms',
    difficulty: 1,
    method: 'Constant multiple rule, then the power rule.',
    steps: [
      ['Take the constant 5 outside the integral.', '5\\int x^{4}\\,dx'],
      ['Apply the power rule with $n = 4$.', '5 \\cdot \\frac{x^{5}}{5} + C = x^{5} + C'],
    ],
    answer: 'x^{5} + C',
  }),
  appItem('basic-sum', U.basicRules, '1.4', 4, {
    problem: '\\int \\left(3x^{2} - 4x + 7\\right)dx',
    technique: 'standard-forms',
    difficulty: 1,
    method: 'Integrate term by term (sum and difference rule), with constants outside.',
    steps: [
      ['Integrate each term separately.', '3\\int x^{2}\\,dx - 4\\int x\\,dx + \\int 7\\,dx'],
      ['Apply the power rule and $\\int a\\,dx = ax + C$.', 'x^{3} - 2x^{2} + 7x + C'],
    ],
    answer: 'x^{3} - 2x^{2} + 7x + C',
  }),
  appItem('basic-root', U.basicRules, '1.3', 3, {
    problem: '\\int 6\\sqrt{x}\\,dx',
    technique: 'standard-forms',
    difficulty: 2,
    method: 'Write the root as a power, then use the power rule with $n = \\frac{1}{2}$.',
    steps: [
      ['Write $\\sqrt{x}$ as $x^{\\frac{1}{2}}$ and take the 6 outside.', '6\\int x^{\\frac{1}{2}}\\,dx'],
      ['Apply the power rule.', '6 \\cdot \\frac{x^{\\frac{3}{2}}}{\\frac{3}{2}} + C = 4x^{\\frac{3}{2}} + C'],
    ],
    answer: '4x^{\\frac{3}{2}} + C',
  }),
  appItem('basic-standard', U.basicRules, '1.4', 4, {
    problem: '\\int \\left(2\\cos x - e^{x}\\right)dx',
    technique: 'standard-forms',
    difficulty: 1,
    method: 'Use the standard formulas for $\\cos x$ and $e^{x}$, term by term.',
    steps: [
      ['Integrate each term, constants outside.', '2\\int \\cos x\\,dx - \\int e^{x}\\,dx'],
      ['Use $\\int \\cos x\\,dx = \\sin x + C$ and $\\int e^{x}\\,dx = e^{x} + C$.', '2\\sin x - e^{x} + C'],
    ],
    answer: '2\\sin x - e^{x} + C',
  }),
  appItem('basic-exception', U.basicRules, '1.4', 4, {
    problem: '\\int \\left(\\frac{2}{x} + \\frac{1}{x^{2}}\\right)dx',
    technique: 'standard-forms',
    difficulty: 2,
    method: 'The $\\frac{1}{x}$ term is the exception $n = -1$; the other term is a power.',
    steps: [
      ['Write the second term as a power.', '2\\int \\frac{1}{x}\\,dx + \\int x^{-2}\\,dx'],
      ['Use $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$ and the power rule with $n = -2$.', '2\\ln|x| - x^{-1} + C'],
    ],
    answer: '2\\ln|x| - \\frac{1}{x} + C',
  }),
];

/** Try it for Basic Integration Rules: choose the right rule, then apply the rules in My Working. */
export const BASIC_RULES_TRY_IT: ContentBlock[] = [
  {
    type: 'quickCheck',
    title: 'Choose the rule',
    text: 'Choose an answer to see feedback on it. You can try again as often as you like.',
    questions: RULE_CHECKS,
  },
  {
    type: 'practiceGroup',
    title: 'Apply the rules',
    text: 'From one rule at a time to all of them together. Check each step in My Working and ask for hints when you need them.',
    items: [...BASIC_RULES_APP_PRACTICE],
  },
];

/** Every Topic 1 App practice question answered in My Working. */
export const INTEGRATION_APP_PRACTICE: readonly PracticeItem[] = [
  ...UNDERSTANDING_APP_PRACTICE,
  ...BASIC_RULES_APP_PRACTICE,
];
