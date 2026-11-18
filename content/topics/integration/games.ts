/**
 * Game content for Topic 1, built on the shared engine (lib/games/engine).
 * Every round uses course examples (Chapter 1 or Tutorial 1) and every option
 * explains why it is right or wrong. Feedback is app guidance.
 */
import type { Choice, GameDefinition, Round } from '@/lib/games/engine';
import type { CheckProblem } from '@/lib/math/check';
import { integrandOf } from '@/lib/math/tex/evaluate';

import { INTEGRATION_TOPIC_ID, INTEGRATION_UNITS as U } from './ids';

/** The checker's view of "∫ … dx" for input rounds. */
function problem(tex: string, points: number[] = [0.35, 0.8, 1.4, 2.2]): CheckProblem {
  const f = integrandOf(tex, 'x');
  return { integrand: (x) => f({ x }), variable: 'x', points, constants: {} };
}

let choiceCounter = 0;
const right = (content: string, feedback: string, tex = true): Choice => ({
  id: `c${choiceCounter++}`,
  ...(tex ? { tex: content } : { text: content }),
  correct: true,
  feedback,
});
const wrong = (content: string, feedback: string, tex = true): Choice => ({
  id: `c${choiceCounter++}`,
  ...(tex ? { tex: content } : { text: content }),
  correct: false,
  feedback,
});

const game = (g: Omit<GameDefinition, 'topicId'>): GameDefinition => ({ ...g, topicId: INTEGRATION_TOPIC_ID });

// -----------------------------------------------------------------------------
// 1. Reverse the Derivative (Understanding Integration)
// -----------------------------------------------------------------------------
const reverseTheDerivative = game({
  id: 'reverse-the-derivative',
  title: 'Reverse the Derivative',
  unitId: U.understanding,
  summary: 'Find every function whose derivative is shown.',
  tutorial: {
    goal: 'Find anti-derivatives: functions $F$ whose derivative is the given $f$.',
    interaction:
      'Some rounds ask you to select every valid answer (there can be several that differ by a constant), some ask you to pair derivatives with anti-derivative families, and some ask you to type an anti-derivative.',
    skill: 'Reversing differentiation, and seeing that anti-derivatives differ only by a constant.',
    scoring:
      '10 points for each round right first time, 5 after a retry, 3 fewer if you use a hint. Mistakes never cost points.',
  },
  rounds: [
    {
      kind: 'select',
      multiple: true,
      level: 1,
      prompt: "Select every function $F$ with $F'(x) = 2x$.",
      hint: 'Differentiate each option. Adding a constant does not change the derivative.',
      choices: [
        right('x^{2}', '$\\frac{d}{dx}x^{2} = 2x$.'),
        right('x^{2} + 10', 'The constant 10 differentiates to 0, so the derivative is still $2x$.'),
        right('x^{2} - 1', 'The constant $-1$ differentiates to 0.'),
        wrong('2', 'That is the derivative of $2x$, not a function whose derivative is $2x$.'),
        wrong('\\frac{x^{2}}{2}', 'Its derivative is $x$, not $2x$.'),
        wrong('2x^{2}', 'Its derivative is $4x$.'),
      ],
      explanation: 'All anti-derivatives of $2x$ are $x^{2} + C$: they differ only by a constant.',
    },
    {
      kind: 'match',
      level: 1,
      prompt: 'Match each derivative $f(x)$ with its family of anti-derivatives.',
      hint: 'For each family, differentiate and see which $f$ you get.',
      pairs: [
        { id: 'a', left: { tex: 'f(x) = 2x' }, right: { tex: 'x^{2} + C' } },
        { id: 'b', left: { tex: 'f(x) = 2x + 5' }, right: { tex: 'x^{2} + 5x + C' } },
        { id: 'c', left: { tex: 'f(x) = \\cos x' }, right: { tex: '\\sin x + C' } },
        { id: 'd', left: { tex: 'f(x) = e^{x}' }, right: { tex: 'e^{x} + C' } },
      ],
    },
    {
      kind: 'select',
      multiple: true,
      level: 2,
      prompt: 'Select every anti-derivative of $\\cos x$.',
      hint: 'Which functions differentiate to $\\cos x$? Remember that $\\frac{d}{dx}\\sin x = \\cos x$.',
      choices: [
        right('\\sin x', '$\\frac{d}{dx}\\sin x = \\cos x$.'),
        right('\\sin x + 3', 'A constant does not change the derivative.'),
        right('\\sin x - \\pi', '$\\pi$ is a constant too.'),
        wrong('-\\sin x', 'Its derivative is $-\\cos x$.'),
        wrong('\\cos x + 1', 'Its derivative is $-\\sin x$.'),
      ],
    },
    {
      kind: 'select',
      level: 2,
      prompt: 'Which is an anti-derivative of $f(x) = \\frac{1}{x}$ for $x > 0$?',
      hint: 'The power rule fails for $n = -1$. Which standard formula covers $\\frac{1}{x}$?',
      choices: [
        right(
          '\\ln x + C',
          'For $x > 0$, $\\frac{d}{dx}\\ln x = \\frac{1}{x}$. In general, $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$.',
        ),
        wrong('\\frac{x^{0}}{0} + C', 'This is the power rule with $n = -1$, which divides by zero.'),
        wrong('-\\frac{1}{x^{2}} + C', 'That is the derivative of $\\frac{1}{x}$, not an anti-derivative.'),
        wrong('\\ln x^{2} + C', 'Its derivative is $\\frac{2}{x}$.'),
      ],
    },
    {
      kind: 'input',
      level: 3,
      prompt: 'Type an anti-derivative of $f(x) = 3x^{2} + 2$.',
      promptTex: '\\int (3x^{2} + 2)\\,dx',
      hint: 'Which function has derivative $3x^{2}$? And which has derivative 2?',
      placeholder: 'e.g. x^3 + ... + C',
      check: problem('\\int (3x^{2} + 2)\\,dx'),
      answerTex: 'x^{3} + 2x + C',
    },
    {
      kind: 'input',
      level: 3,
      prompt: 'Type an anti-derivative of $f(x) = \\sec^{2}x$.',
      promptTex: '\\int \\sec^{2}x\\,dx',
      hint: 'Which trigonometric function has derivative $\\sec^{2}x$?',
      placeholder: 'e.g. tan(x) + C',
      check: problem('\\int \\sec^{2}x\\,dx', [0.2, 0.5, 0.9, 1.2]),
      answerTex: '\\tan x + C',
    },
    {
      kind: 'select',
      multiple: true,
      level: 3,
      prompt: 'Select every anti-derivative of $\\frac{1}{1+x^{2}}$.',
      hint: 'Look at the list of standard anti-differentiation formulas.',
      choices: [
        right('\\tan^{-1}x', '$\\frac{d}{dx}\\tan^{-1}x = \\frac{1}{1+x^{2}}$.'),
        right('\\tan^{-1}x + 7', 'Adding a constant still gives an anti-derivative.'),
        wrong('\\ln(1+x^{2})', 'Its derivative is $\\frac{2x}{1+x^{2}}$.'),
        wrong('\\sin^{-1}x', 'Its derivative is $\\frac{1}{\\sqrt{1-x^{2}}}$.'),
      ],
    },
  ],
});

// -----------------------------------------------------------------------------
// 2. Rule Builder (Basic Integration Rules)
// -----------------------------------------------------------------------------
const order = (
  level: number,
  prompt: string,
  promptTex: string,
  steps: string[],
  distractor: [string, string],
  hint: string,
): Round => ({
  kind: 'order',
  level,
  prompt,
  promptTex,
  hint,
  cards: steps.map((text, i) => ({ id: `s${i}`, text })),
  distractors: [{ id: 'd0', text: distractor[0], why: distractor[1] }],
});

const ruleBuilder = game({
  id: 'rule-builder',
  title: 'Rule Builder',
  unitId: U.basicRules,
  summary: 'Arrange the steps of an integration in order.',
  tutorial: {
    goal: 'Build each integration from its steps, in the right order.',
    interaction:
      'Tap the cards in the order you would use them. Use the arrows to move a card, or × to take it back. One card in each round does not belong: leave it out.',
    skill: 'The power rule, the special case $n = -1$, constant multiples, sums and the standard formulas.',
    scoring:
      '10 points for a correct order first time, 5 after a retry, 3 fewer with a hint. Mistakes never cost points.',
  },
  rounds: [
    order(
      1,
      'Put the steps in order.',
      '\\int x^{6}\\,dx',
      [
        'Increase the exponent: $6 + 1 = 7$.',
        'Divide by the new exponent: $\\frac{x^{7}}{7}$.',
        'Add the constant of integration $C$.',
      ],
      ['Multiply by the exponent 6.', 'Multiplying by the exponent is what differentiation does, not integration.'],
      'Integration reverses differentiation: increase the exponent, then divide.',
    ),
    order(
      1,
      'Put the steps in order.',
      '\\int \\frac{1}{x^{5}}\\,dx',
      [
        'Rewrite $\\frac{1}{x^{5}}$ as $x^{-5}$.',
        'Increase the exponent: $-5 + 1 = -4$.',
        'Divide by $-4$: $\\frac{x^{-4}}{-4}$.',
        'Simplify to $-\\frac{1}{4x^{4}}$ and add $C$.',
      ],
      ['Increase the exponent to $-6$.', 'Adding 1 to $-5$ gives $-4$, not $-6$.'],
      'The power rule needs the integrand as a power of $x$ first.',
    ),
    order(
      2,
      'Put the steps in order.',
      '\\int \\sqrt{x}\\,dx',
      [
        'Rewrite $\\sqrt{x}$ as $x^{\\frac{1}{2}}$.',
        'Increase the exponent: $\\frac{1}{2} + 1 = \\frac{3}{2}$.',
        'Divide by $\\frac{3}{2}$, that is, multiply by $\\frac{2}{3}$.',
        'Write $\\frac{2}{3}x^{\\frac{3}{2}} + C$.',
      ],
      [
        'Use $\\int \\frac{1}{x}\\,dx = \\ln|x|$.',
        'That formula is only for $x^{-1}$; here the power is $\\frac{1}{2}$.',
      ],
      'Roots are fractional powers: $\\sqrt{x} = x^{\\frac{1}{2}}$.',
    ),
    order(
      2,
      'Put the steps in order.',
      '\\int \\left(4x - 2x^{-\\frac{1}{3}} + \\frac{5}{x^{2}}\\right)dx',
      [
        'Split it into three integrals, one for each term.',
        'Take the constants $4$, $-2$ and $5$ outside the integrals.',
        'Apply the power rule to each term.',
        'Add a single constant of integration $C$.',
      ],
      [
        'Multiply the three integrals together.',
        'The integral of a sum is the sum of the integrals, not their product.',
      ],
      'Use the sum rule first, then the constant multiple rule.',
    ),
    order(
      3,
      'Put the steps in order.',
      '\\int \\left(\\frac{5}{x} - 2\\sqrt[3]{x^{2}}\\right)dx',
      [
        'Split it into two integrals.',
        'Take the constants $5$ and $-2$ outside.',
        'For $\\frac{1}{x}$, use $\\int \\frac{1}{x}\\,dx = \\ln|x|$.',
        'For $x^{\\frac{2}{3}}$, use the power rule.',
        'Add $C$.',
      ],
      [
        'Apply the power rule to $x^{-1}$.',
        'With $n = -1$ the power rule would divide by zero; use $\\ln|x|$ instead.',
      ],
      'One term is the special case $n = -1$.',
    ),
    order(
      3,
      'Put the steps in order.',
      '\\int (\\cos x + e^{x})\\,dx',
      [
        'Split it into two integrals.',
        'Use $\\int \\cos x\\,dx = \\sin x$.',
        'Use $\\int e^{x}\\,dx = e^{x}$.',
        'Add $C$.',
      ],
      [
        'Use $\\int \\cos x\\,dx = -\\sin x$.',
        '$-\\sin x$ differentiates to $-\\cos x$. The formula is $\\int \\cos x\\,dx = \\sin x + C$.',
      ],
      'Both terms are standard formulas.',
    ),
  ],
});

// -----------------------------------------------------------------------------
// 3. Spot the Substitution (Substitution)
// -----------------------------------------------------------------------------
const STAGES = ['Choose u', 'du', 'Match', 'Rewrite', 'Integrate', 'Back to x'];

const substitutionRound = (
  level: number,
  integrand: string,
  stages: [Choice[], Choice[], Choice[], Choice[], Choice[], Choice[]],
  hint: string,
): Round => ({
  kind: 'stages',
  level,
  prompt: 'Work through the substitution one step at a time.',
  promptTex: integrand,
  hint,
  stages: [
    { label: STAGES[0] as string, question: 'Which inner function should be $u$?', choices: stages[0] },
    { label: STAGES[1] as string, question: 'What is $du$?', choices: stages[1] },
    { label: STAGES[2] as string, question: 'Which part of the integrand becomes $du$?', choices: stages[2] },
    { label: STAGES[3] as string, question: 'What is the integral in terms of $u$?', choices: stages[3] },
    { label: STAGES[4] as string, question: 'Integrate.', choices: stages[4] },
    { label: STAGES[5] as string, question: 'Write the answer in terms of $x$.', choices: stages[5] },
  ],
});

const spotTheSubstitution = game({
  id: 'spot-the-substitution',
  title: 'Spot the Substitution',
  unitId: U.substitution,
  summary: 'Each reasoning step of a substitution scores.',
  tutorial: {
    goal: 'Solve integrals by substitution, one reasoning step at a time.',
    interaction:
      'Each integral has six steps: choose $u$, find $du$, match the integrand, rewrite in $u$, integrate, and substitute back. Pick the right option at each step.',
    skill: 'Recognising a function inside a function together with its derivative.',
    scoring: 'Every step scores: 10 if right first time, 5 after a retry, 3 fewer once you have used the hint.',
  },
  rounds: [
    substitutionRound(
      1,
      '\\int x(x^{2}+2)^{3}\\,dx',
      [
        [
          right('u = x^{2} + 2', 'The inner function, and its derivative $2x$ almost appears.'),
          wrong('u = x', 'Then $du = dx$ and $(x^{2}+2)^{3}$ is unchanged: no simpler.'),
          wrong('u = (x^{2}+2)^{3}', 'Its derivative $6x(x^{2}+2)^{2}$ does not appear in the integrand.'),
        ],
        [
          right('du = 2x\\,dx', '$\\frac{d}{dx}(x^{2}+2) = 2x$.'),
          wrong('du = x\\,dx', 'The derivative of $x^{2} + 2$ is $2x$, not $x$.'),
          wrong('du = 2\\,dx', 'You need the derivative of $x^{2} + 2$, which is $2x$.'),
        ],
        [
          right('x\\,dx = \\frac{1}{2}\\,du', 'The integrand has $x\\,dx$, which is half of $du$.'),
          wrong('x\\,dx = 2\\,du', '$du = 2x\\,dx$, so $x\\,dx$ is half of $du$, not double.'),
          wrong('x\\,dx = du', 'A factor of 2 is missing.'),
        ],
        [
          right(
            '\\frac{1}{2}\\int u^{3}\\,du',
            '$(x^{2}+2)^{3}$ becomes $u^{3}$ and $x\\,dx$ becomes $\\frac{1}{2}du$.',
          ),
          wrong('2\\int u^{3}\\,du', 'The factor is $\\frac{1}{2}$, not 2.'),
          wrong('\\int u^{3}\\,du', 'The factor $\\frac{1}{2}$ is missing.'),
        ],
        [
          right('\\frac{u^{4}}{8} + C', '$\\frac{1}{2} \\cdot \\frac{u^{4}}{4} = \\frac{u^{4}}{8}$.'),
          wrong('\\frac{u^{4}}{2} + C', 'Divide by the new exponent 4 as well.'),
          wrong('\\frac{3u^{2}}{2} + C', 'That differentiates $u^{3}$ instead of integrating it.'),
        ],
        [
          right('\\frac{(x^{2}+2)^{4}}{8} + C', 'Replace $u$ by $x^{2} + 2$.'),
          wrong('\\frac{x^{4}}{8} + C', 'Replace $u$ by $x^{2} + 2$, not by $x$.'),
          wrong('\\frac{(x^{2}+2)^{4}}{2} + C', 'The coefficient is $\\frac{1}{8}$.'),
        ],
      ],
      'Look for the inner function whose derivative (up to a constant) is also in the integrand.',
    ),
    substitutionRound(
      1,
      '\\int \\sin 10x\\,dx',
      [
        [
          right('u = 10x', 'The inner function of $\\sin 10x$.'),
          wrong('u = \\sin 10x', 'Its derivative $10\\cos 10x$ does not appear.'),
          wrong('u = x', 'That changes nothing.'),
        ],
        [
          right('du = 10\\,dx', '$\\frac{d}{dx}(10x) = 10$.'),
          wrong('du = dx', 'The derivative of $10x$ is 10.'),
          wrong('du = \\cos 10x\\,dx', 'That differentiates $\\sin 10x$, not $u = 10x$.'),
        ],
        [
          right('dx = \\frac{1}{10}\\,du', 'Divide $du = 10\\,dx$ by 10.'),
          wrong('dx = 10\\,du', 'Divide by 10, do not multiply.'),
          wrong('dx = du', 'A factor of $\\frac{1}{10}$ is missing.'),
        ],
        [
          right('\\frac{1}{10}\\int \\sin u\\,du', 'The integrand becomes $\\sin u$ times $\\frac{1}{10}\\,du$.'),
          wrong('10\\int \\sin u\\,du', 'The factor is $\\frac{1}{10}$.'),
          wrong('\\int \\sin u\\,du', 'The factor $\\frac{1}{10}$ is missing.'),
        ],
        [
          right('-\\frac{1}{10}\\cos u + C', '$\\int \\sin u\\,du = -\\cos u + C$.'),
          wrong('\\frac{1}{10}\\cos u + C', 'Check the sign: $\\frac{d}{du}\\cos u = -\\sin u$.'),
          wrong('-10\\cos u + C', 'The factor is $\\frac{1}{10}$.'),
        ],
        [
          right('-\\frac{1}{10}\\cos 10x + C', 'Replace $u$ by $10x$.'),
          wrong('-\\frac{1}{10}\\cos x + C', 'Replace $u$ by $10x$, not $x$.'),
          wrong('-\\cos 10x + C', 'The factor $\\frac{1}{10}$ is still needed.'),
        ],
      ],
      'The inner function here is linear.',
    ),
    substitutionRound(
      2,
      '\\int \\frac{x}{(4x^{2}+3)^{6}}\\,dx',
      [
        [
          right('u = 4x^{2} + 3', 'The inner function; its derivative $8x$ is a multiple of the $x$ on top.'),
          wrong('u = x', 'The denominator stays as it is: no simpler.'),
          wrong('u = (4x^{2}+3)^{6}', 'Its derivative is not in the integrand.'),
        ],
        [
          right('du = 8x\\,dx', '$\\frac{d}{dx}(4x^{2}+3) = 8x$.'),
          wrong('du = 4x\\,dx', 'The derivative of $4x^{2}$ is $8x$.'),
          wrong('du = 8\\,dx', 'Differentiate $4x^{2} + 3$ with respect to $x$: $8x$.'),
        ],
        [
          right('x\\,dx = \\frac{1}{8}\\,du', 'Divide $du = 8x\\,dx$ by 8.'),
          wrong('x\\,dx = 8\\,du', 'Divide by 8, do not multiply.'),
          wrong('x\\,dx = du', 'A factor of $\\frac{1}{8}$ is missing.'),
        ],
        [
          right('\\frac{1}{8}\\int u^{-6}\\,du', '$(4x^{2}+3)^{-6}$ becomes $u^{-6}$.'),
          wrong('\\frac{1}{8}\\int u^{6}\\,du', 'The power is in the denominator, so it is $u^{-6}$.'),
          wrong('8\\int u^{-6}\\,du', 'The factor is $\\frac{1}{8}$.'),
        ],
        [
          right('-\\frac{1}{40}u^{-5} + C', '$\\frac{1}{8} \\cdot \\frac{u^{-5}}{-5} = -\\frac{1}{40}u^{-5}$.'),
          wrong('\\frac{1}{8} \\cdot \\frac{u^{-7}}{-7} + C', 'Add 1 to the exponent: $-6 + 1 = -5$.'),
          wrong('\\frac{1}{40}u^{-5} + C', 'Dividing by $-5$ makes it negative.'),
        ],
        [
          right('-\\frac{1}{40}(4x^{2}+3)^{-5} + C', 'Replace $u$ by $4x^{2} + 3$.'),
          wrong('-\\frac{1}{40}x^{-5} + C', 'Replace $u$ by $4x^{2} + 3$.'),
          wrong('-\\frac{1}{40}(4x^{2}+3)^{-7} + C', 'The exponent after integrating is $-5$.'),
        ],
      ],
      'Write the integrand as $(4x^{2}+3)^{-6}\\,x$ first.',
    ),
    substitutionRound(
      3,
      '\\int x^{2}\\sqrt{2x^{3}-4}\\,dx',
      [
        [
          right('u = 2x^{3} - 4', 'Inside the root, and its derivative $6x^{2}$ matches $x^{2}$ up to a constant.'),
          wrong('u = x^{2}', 'Then the root is still in terms of $x$.'),
          wrong('u = \\sqrt{2x^{3}-4}', 'Possible, but harder: choose the expression inside the root.'),
        ],
        [
          right('du = 6x^{2}\\,dx', '$\\frac{d}{dx}(2x^{3}-4) = 6x^{2}$.'),
          wrong('du = 2x^{2}\\,dx', 'Differentiate $2x^{3}$: $6x^{2}$.'),
          wrong('du = 6x\\,dx', 'The derivative of $x^{3}$ is $3x^{2}$.'),
        ],
        [
          right('x^{2}\\,dx = \\frac{1}{6}\\,du', 'Divide by 6.'),
          wrong('x^{2}\\,dx = 6\\,du', 'Divide by 6, do not multiply.'),
          wrong('x^{2}\\,dx = du', 'A factor of $\\frac{1}{6}$ is missing.'),
        ],
        [
          right('\\frac{1}{6}\\int u^{\\frac{1}{2}}\\,du', 'The root becomes $u^{\\frac{1}{2}}$.'),
          wrong('\\frac{1}{6}\\int u^{2}\\,du', 'A square root is the power $\\frac{1}{2}$.'),
          wrong('6\\int u^{\\frac{1}{2}}\\,du', 'The factor is $\\frac{1}{6}$.'),
        ],
        [
          right(
            '\\frac{1}{9}u^{\\frac{3}{2}} + C',
            '$\\frac{1}{6} \\cdot \\frac{2}{3}u^{\\frac{3}{2}} = \\frac{1}{9}u^{\\frac{3}{2}}$.',
          ),
          wrong('\\frac{1}{6}u^{\\frac{3}{2}} + C', 'Divide by the new exponent $\\frac{3}{2}$ too.'),
          wrong('\\frac{1}{4}u^{\\frac{3}{2}} + C', '$\\frac{1}{6} \\cdot \\frac{2}{3} = \\frac{1}{9}$.'),
        ],
        [
          right('\\frac{1}{9}(2x^{3}-4)^{\\frac{3}{2}} + C', 'Replace $u$ by $2x^{3} - 4$.'),
          wrong('\\frac{1}{9}x^{\\frac{9}{2}} + C', 'Replace $u$, do not substitute $x$ into the power.'),
          wrong('\\frac{1}{9}(2x^{3}-4)^{\\frac{1}{2}} + C', 'The exponent after integrating is $\\frac{3}{2}$.'),
        ],
      ],
      'The expression inside the root has derivative $6x^{2}$.',
    ),
    substitutionRound(
      3,
      '\\int \\cos x\\sin(\\sin x)\\,dx',
      [
        [
          right('u = \\sin x', 'The inner function of $\\sin(\\sin x)$, and its derivative $\\cos x$ is there.'),
          wrong('u = \\cos x', 'Its derivative $-\\sin x$ does not appear on its own.'),
          wrong('u = \\sin(\\sin x)', 'Its derivative is not in the integrand.'),
        ],
        [
          right('du = \\cos x\\,dx', '$\\frac{d}{dx}\\sin x = \\cos x$.'),
          wrong('du = -\\cos x\\,dx', 'The derivative of $\\sin x$ is $+\\cos x$.'),
          wrong('du = \\sin x\\,dx', 'Differentiate $\\sin x$.'),
        ],
        [
          right('\\cos x\\,dx = du', 'Exactly $du$, with no constant needed.'),
          wrong('\\cos x\\,dx = \\frac{1}{2}du', 'No factor is needed here.'),
          wrong('\\sin x\\,dx = du', 'It is $\\cos x\\,dx$ that matches $du$.'),
        ],
        [
          right('\\int \\sin u\\,du', 'The integrand becomes $\\sin u$.'),
          wrong('\\int u\\sin u\\,du', 'There is no extra $u$.'),
          wrong('\\int \\cos u\\,du', 'The outer function is $\\sin$.'),
        ],
        [
          right('-\\cos u + C', '$\\int \\sin u\\,du = -\\cos u + C$.'),
          wrong('\\cos u + C', 'Check the sign.'),
          wrong('-\\sin u + C', 'Integrate $\\sin u$, do not differentiate it.'),
        ],
        [
          right('-\\cos(\\sin x) + C', 'Replace $u$ by $\\sin x$.'),
          wrong('-\\cos x + C', 'Replace $u$ by $\\sin x$.'),
          wrong('-\\cos(\\cos x) + C', '$u$ was $\\sin x$.'),
        ],
      ],
      'One function sits inside another; its derivative multiplies the outside.',
    ),
  ],
});

// -----------------------------------------------------------------------------
// 4. Build the Decomposition (Partial Fractions)
// -----------------------------------------------------------------------------
const buildTheDecomposition = game({
  id: 'build-the-decomposition',
  title: 'Build the Decomposition',
  unitId: U.partialFractions,
  summary: 'Classify, factorise, choose the form, solve and integrate.',
  tutorial: {
    goal: 'Integrate rational functions with partial fractions, step by step.',
    interaction:
      'For each integral: classify it (proper or improper), factorise the denominator, choose the decomposition form, find the constants, and integrate.',
    skill: 'Choosing the right partial-fraction form for each kind of factor.',
    scoring: 'Every step scores: 10 if right first time, 5 after a retry, 3 fewer once you have used the hint.',
  },
  rounds: [
    {
      kind: 'stages',
      level: 1,
      prompt: 'Distinct linear factors.',
      promptTex: '\\int \\frac{x+7}{x^{2}-x-6}\\,dx',
      hint: 'Two numbers that multiply to $-6$ and add to $-1$.',
      stages: [
        {
          label: 'Classify',
          question: 'Is the fraction proper?',
          choices: [
            right(
              'Proper: the numerator has degree 1 and the denominator degree 2.',
              'Correct: no long division is needed.',
              false,
            ),
            wrong(
              'Improper: divide first.',
              'The numerator’s degree (1) is lower than the denominator’s (2), so it is proper.',
              false,
            ),
          ],
        },
        {
          label: 'Factorise',
          question: 'Factorise the denominator.',
          choices: [
            right('(x-3)(x+2)', '$(x-3)(x+2) = x^{2} - x - 6$.'),
            wrong('(x+3)(x-2)', 'That expands to $x^{2} + x - 6$.'),
            wrong('(x-6)(x+1)', 'That expands to $x^{2} - 5x - 6$.'),
          ],
        },
        {
          label: 'Form',
          question: 'Which decomposition form is right?',
          choices: [
            right('\\frac{A}{x-3} + \\frac{B}{x+2}', 'Two distinct linear factors: one constant over each.'),
            wrong('\\frac{A}{x-3} + \\frac{B}{(x+2)^{2}}', 'No factor is repeated, so no squared term is needed.'),
            wrong('\\frac{Ax+B}{x^{2}-x-6}', 'The quadratic factorises into real linear factors, so split it.'),
          ],
        },
        {
          label: 'Constants',
          question: 'Find the constants.',
          choices: [
            right('A = 2, \\quad B = -1', 'Check: $\\frac{2}{x-3} - \\frac{1}{x+2} = \\frac{x+7}{x^{2}-x-6}$.'),
            wrong('A = 1, \\quad B = 1', 'Put $x = 3$: $10 = 5A$, so $A = 2$.'),
            wrong('A = -1, \\quad B = 2', 'Put $x = -2$: $5 = -5B$, so $B = -1$.'),
          ],
        },
        {
          label: 'Integrate',
          question: 'Integrate.',
          choices: [
            right('2\\ln|x-3| - \\ln|x+2| + C', 'Each term gives a logarithm.'),
            wrong('\\ln|x-3| + \\ln|x+2| + C', 'Keep the constants 2 and $-1$.'),
            wrong('\\frac{2}{(x-3)^{2}} - \\frac{1}{(x+2)^{2}} + C', 'That differentiates instead of integrating.'),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 2,
      prompt: 'A repeated linear factor.',
      promptTex: '\\int \\frac{5x^{2}+20x+6}{x^{3}+2x^{2}+x}\\,dx',
      hint: 'Take out the common factor $x$ first.',
      stages: [
        {
          label: 'Classify',
          question: 'Is the fraction proper?',
          choices: [
            right('Proper: degree 2 over degree 3.', 'Correct.', false),
            wrong('Improper: divide first.', 'Degree 2 is lower than degree 3, so it is proper.', false),
          ],
        },
        {
          label: 'Factorise',
          question: 'Factorise the denominator.',
          choices: [
            right('x(x+1)^{2}', '$x(x^{2} + 2x + 1) = x(x+1)^{2}$.'),
            wrong('x(x+1)(x+2)', 'That expands to $x^{3} + 3x^{2} + 2x$.'),
            wrong('(x+1)^{3}', 'That expands to $x^{3} + 3x^{2} + 3x + 1$.'),
          ],
        },
        {
          label: 'Form',
          question: 'Which decomposition form is right?',
          choices: [
            right(
              '\\frac{A}{x} + \\frac{B}{x+1} + \\frac{C}{(x+1)^{2}}',
              'One term for $x$, and every power of the repeated factor.',
            ),
            wrong(
              '\\frac{A}{x} + \\frac{B}{(x+1)^{2}}',
              'Because this factor repeats to the second power, both the first and second powers must appear.',
            ),
            wrong(
              '\\frac{A}{x} + \\frac{B}{x+1}',
              'Because this factor repeats to the second power, both the first and second powers must appear.',
            ),
          ],
        },
        {
          label: 'Constants',
          question: 'Find the constants.',
          choices: [
            right('A = 6, \\quad B = -1, \\quad C = 9', 'As in the notes.'),
            wrong('A = 6, \\quad B = 9, \\quad C = -1', 'Put $x = -1$: $-9 = -C$, so $C = 9$.'),
            wrong('A = 5, \\quad B = 0, \\quad C = 1', 'Put $x = 0$: $6 = A$.'),
          ],
        },
        {
          label: 'Integrate',
          question: 'Integrate.',
          choices: [
            right('6\\ln|x| - \\ln|x+1| - \\frac{9}{x+1} + C', '$\\int \\frac{9}{(x+1)^{2}}\\,dx = -\\frac{9}{x+1}$.'),
            wrong(
              '6\\ln|x| - \\ln|x+1| + 9\\ln|x+1| + C',
              '$\\int \\frac{9}{(x+1)^{2}}\\,dx$ is $-\\frac{9}{x+1}$, not a logarithm.',
            ),
            wrong(
              '6\\ln|x| - \\ln|x+1| + \\frac{9}{x+1} + C',
              'Check the sign: $\\int (x+1)^{-2}\\,dx = -(x+1)^{-1}$.',
            ),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 2,
      prompt: 'An irreducible quadratic factor.',
      promptTex: '\\int \\frac{x+1}{x(x^{2}+1)}\\,dx',
      hint: '$x^{2} + 1$ has no real factors.',
      stages: [
        {
          label: 'Classify',
          question: 'Is the fraction proper?',
          choices: [
            right('Proper: degree 1 over degree 3.', 'Correct.', false),
            wrong('Improper: divide first.', 'Degree 1 is lower than degree 3.', false),
          ],
        },
        {
          label: 'Factor',
          question: 'What kind of factors does the denominator have?',
          choices: [
            right(
              'A linear factor $x$ and an irreducible quadratic $x^{2} + 1$.',
              '$x^{2} + 1$ has $b^{2} - 4ac = -4 < 0$.',
              false,
            ),
            wrong('Three linear factors $x(x+1)(x-1)$.', 'That would be $x^{3} - x$; here it is $x^{3} + x$.', false),
          ],
        },
        {
          label: 'Form',
          question: 'Which decomposition form is right?',
          choices: [
            right('\\frac{A}{x} + \\frac{Bx + C}{x^{2}+1}', 'Over an irreducible quadratic the numerator is linear.'),
            wrong(
              '\\frac{A}{x} + \\frac{B}{x^{2}+1}',
              'Over an irreducible quadratic the numerator must be linear, $Bx + C$.',
            ),
            wrong(
              '\\frac{A}{x} + \\frac{B}{x+1} + \\frac{C}{x-1}',
              '$x^{2} + 1$ does not factorise over the real numbers.',
            ),
          ],
        },
        {
          label: 'Constants',
          question: 'Find the constants.',
          choices: [
            right(
              'A = 1, \\quad B = -1, \\quad C = 1',
              '$\\frac{1}{x} + \\frac{-x+1}{x^{2}+1} = \\frac{x+1}{x(x^{2}+1)}$.',
            ),
            wrong('A = 1, \\quad B = 1, \\quad C = -1', 'Compare the $x^{2}$ terms: $A + B = 0$, so $B = -1$.'),
            wrong('A = 0, \\quad B = 1, \\quad C = 1', 'Put $x = 0$: $1 = A$.'),
          ],
        },
        {
          label: 'Integrate',
          question: 'Integrate.',
          choices: [
            right(
              '\\ln|x| - \\frac{1}{2}\\ln(x^{2}+1) + \\tan^{-1}x + C',
              '$\\int \\frac{-x}{x^{2}+1}\\,dx = -\\frac{1}{2}\\ln(x^{2}+1)$ and $\\int \\frac{1}{x^{2}+1}\\,dx = \\tan^{-1}x$.',
            ),
            wrong(
              '\\ln|x| - \\ln(x^{2}+1) + \\tan^{-1}x + C',
              '$\\int \\frac{x}{x^{2}+1}\\,dx = \\frac{1}{2}\\ln(x^{2}+1)$.',
            ),
            wrong('\\ln|x| + \\tan^{-1}x + C', 'The $-\\frac{x}{x^{2}+1}$ term also needs integrating.'),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 3,
      prompt: 'An improper rational function.',
      promptTex: '\\int \\frac{x^{5}+x-1}{x^{4}-x^{3}}\\,dx',
      hint: 'Divide first, then decompose the proper fraction that remains.',
      stages: [
        {
          label: 'Classify',
          question: 'Is the fraction proper?',
          choices: [
            right('Improper: degree 5 over degree 4, so divide first.', 'Correct: long division comes first.', false),
            wrong('Proper.', 'The numerator’s degree (5) is not lower than the denominator’s (4).', false),
          ],
        },
        {
          label: 'Divide',
          question: 'What does long division give?',
          choices: [
            right(
              'x + 1 + \\frac{x^{3}+x-1}{x^{4}-x^{3}}',
              'Check: $(x+1)(x^{4}-x^{3}) = x^{5} - x^{3}$; the remainder is $x^{3} + x - 1$.',
            ),
            wrong(
              'x + \\frac{x+1}{x^{4}-x^{3}}',
              'Multiply back: $x(x^{4}-x^{3}) = x^{5} - x^{4}$, which leaves more to divide.',
            ),
          ],
        },
        {
          label: 'Form',
          question: 'Factorise $x^{4} - x^{3} = x^{3}(x-1)$. Which form is right?',
          choices: [
            right(
              '\\frac{A}{x} + \\frac{B}{x^{2}} + \\frac{C}{x^{3}} + \\frac{D}{x-1}',
              'The factor $x$ is repeated three times, so every power up to $x^{3}$ appears.',
            ),
            wrong(
              '\\frac{A}{x^{3}} + \\frac{B}{x-1}',
              'Because $x$ repeats to the third power, the first, second and third powers must all appear.',
            ),
          ],
        },
        {
          label: 'Constants',
          question: 'Find the constants.',
          choices: [
            right(
              'A = 0,\\ B = 0,\\ C = 1,\\ D = 1',
              '$\\frac{1}{x^{3}} + \\frac{1}{x-1} = \\frac{x^{3}+x-1}{x^{3}(x-1)}$.',
            ),
            wrong('A = 1,\\ B = 0,\\ C = 0,\\ D = 1', 'Check $x = 0$ after multiplying out: $-1 = -C$, so $C = 1$.'),
          ],
        },
        {
          label: 'Integrate',
          question: 'Integrate.',
          choices: [
            right('\\frac{x^{2}}{2} + x - \\frac{1}{2x^{2}} + \\ln|x-1| + C', 'As in the notes.'),
            wrong(
              '\\frac{x^{2}}{2} + x + \\ln|x^{3}| + \\ln|x-1| + C',
              '$\\int x^{-3}\\,dx = -\\frac{1}{2}x^{-2}$, not a logarithm.',
            ),
          ],
        },
      ],
    },
  ],
});

// -----------------------------------------------------------------------------
// 5. Transformation Challenge (Algebraic and Trigonometric Substitution)
// -----------------------------------------------------------------------------
const transformationChallenge = game({
  id: 'transformation-challenge',
  title: 'Transformation Challenge',
  unitId: U.algebraicTrig,
  summary: 'Match expressions to substitutions and transformed forms.',
  tutorial: {
    goal: 'Recognise which substitution transforms an integrand into something you can integrate.',
    interaction:
      'Match each type of integrand with its substitution from the table, then follow full transformations step by step.',
    skill: 'Table 1.1, rationalisation, and the substitution $t = \\tan\\frac{x}{2}$.',
    scoring: '10 points for each match round or step right first time, 5 after a retry, 3 fewer with a hint.',
  },
  rounds: [
    {
      kind: 'match',
      level: 1,
      prompt: 'Match each root with its suggested substitution (Table 1.1).',
      hint: 'Think of $\\sin^{2}\\theta + \\cos^{2}\\theta = 1$ and $1 + \\tan^{2}\\theta = \\sec^{2}\\theta$.',
      pairs: [
        { id: 'a', left: { tex: '\\sqrt{a^{2}-x^{2}}' }, right: { tex: 'x = a\\sin\\theta' } },
        { id: 'b', left: { tex: '\\sqrt{a^{2}+x^{2}}' }, right: { tex: 'x = a\\tan\\theta' } },
        { id: 'c', left: { tex: '\\sqrt{x^{2}-a^{2}}' }, right: { tex: 'x = a\\sec\\theta' } },
        { id: 'd', left: { text: 'Functions of $x$ and $\\sqrt{ax+b}$' }, right: { tex: 'ax + b = u^{2}' } },
      ],
    },
    {
      kind: 'match',
      level: 2,
      prompt: 'Match each integrand with its substitution.',
      hint: 'Fractional powers call for $x = u^{n}$; rational functions of $\\sin x$ and $\\cos x$ call for $t = \\tan\\frac{x}{2}$.',
      pairs: [
        {
          id: 'a',
          left: { text: 'Fractional powers of $x$' },
          right: { text: '$x = u^{n}$, $n$ the LCM of the denominators' },
        },
        { id: 'b', left: { tex: '\\frac{1}{x(ax^{m}+b)}' }, right: { tex: 'x^{m} = \\frac{1}{t}' } },
        {
          id: 'c',
          left: { text: 'Functions of $x$ and $\\sqrt{x^{2}+bx+c}$ (irreducible)' },
          right: { tex: 'x + \\sqrt{x^{2}+bx+c} = u' },
        },
        {
          id: 'd',
          left: { text: 'Rational functions of $\\sin x$ and $\\cos x$' },
          right: { tex: 't = \\tan\\frac{x}{2}' },
        },
      ],
    },
    {
      kind: 'stages',
      level: 2,
      prompt: 'Transform the integral.',
      promptTex: '\\int \\frac{1}{\\sqrt{x^{2}+a^{2}}}\\,dx',
      hint: 'The root is $\\sqrt{a^{2}+x^{2}}$.',
      stages: [
        {
          label: 'Substitution',
          question: 'Which substitution?',
          choices: [
            right('x = a\\tan\\theta', '$a^{2}\\tan^{2}\\theta + a^{2} = a^{2}\\sec^{2}\\theta$ removes the root.'),
            wrong('x = a\\sin\\theta', 'That is for $\\sqrt{a^{2}-x^{2}}$.'),
            wrong('x = a\\sec\\theta', 'That is for $\\sqrt{x^{2}-a^{2}}$.'),
          ],
        },
        {
          label: 'dx',
          question: 'What is $dx$?',
          choices: [
            right('dx = a\\sec^{2}\\theta\\,d\\theta', '$\\frac{d}{d\\theta}(a\\tan\\theta) = a\\sec^{2}\\theta$.'),
            wrong('dx = a\\cos\\theta\\,d\\theta', 'That differentiates $a\\sin\\theta$.'),
          ],
        },
        {
          label: 'Transformed',
          question: 'What does the integral become?',
          choices: [
            right(
              '\\int \\sec\\theta\\,d\\theta',
              '$\\frac{1}{a\\sec\\theta} \\cdot a\\sec^{2}\\theta = \\sec\\theta$.',
            ),
            wrong('\\int a\\sec\\theta\\,d\\theta', 'The factors of $a$ cancel.'),
            wrong('\\int \\sec^{2}\\theta\\,d\\theta', 'One $\\sec\\theta$ cancels with the root.'),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 2,
      prompt: 'Transform the integral.',
      promptTex: '\\int \\frac{dx}{5 + 3\\cos x}',
      hint: 'A rational function of $\\cos x$.',
      stages: [
        {
          label: 'Substitution',
          question: 'Which substitution?',
          choices: [
            right(
              't = \\tan\\frac{x}{2}',
              'It turns rational functions of $\\sin x$ and $\\cos x$ into rational functions of $t$.',
            ),
            wrong(
              't = \\tan x',
              'That is for rational functions of $\\cos 2x$, $\\sin 2x$, $\\cos^{2}x$ and $\\sin^{2}x$.',
            ),
            wrong('u = 5 + 3\\cos x', 'Its derivative $-3\\sin x$ is not in the integrand.'),
          ],
        },
        {
          label: 'Replace',
          question: 'What replaces $\\cos x$ and $dx$?',
          choices: [
            right(
              '\\cos x = \\frac{1-t^{2}}{1+t^{2}}, \\quad dx = \\frac{2\\,dt}{1+t^{2}}',
              'The identities for $t = \\tan\\frac{x}{2}$.',
            ),
            wrong(
              '\\cos x = \\frac{2t}{1+t^{2}}, \\quad dx = \\frac{2\\,dt}{1+t^{2}}',
              '$\\frac{2t}{1+t^{2}}$ is $\\sin x$.',
            ),
          ],
        },
        {
          label: 'Transformed',
          question: 'What does the integral become?',
          choices: [
            right(
              '\\int \\frac{dt}{t^{2}+4}',
              '$\\frac{2}{5(1+t^{2}) + 3(1-t^{2})} = \\frac{2}{8 + 2t^{2}} = \\frac{1}{t^{2}+4}$.',
            ),
            wrong('\\int \\frac{dt}{t^{2}+1}', 'Combine $5(1+t^{2}) + 3(1-t^{2}) = 8 + 2t^{2}$.'),
          ],
        },
        {
          label: 'Result',
          question: 'Integrate and return to $x$.',
          choices: [
            right(
              '\\frac{1}{2}\\tan^{-1}\\left(\\frac{1}{2}\\tan\\frac{x}{2}\\right) + C',
              '$\\int \\frac{dt}{t^{2}+4} = \\frac{1}{2}\\tan^{-1}\\frac{t}{2}$.',
            ),
            wrong(
              '\\tan^{-1}\\left(\\tan\\frac{x}{2}\\right) + C',
              'With $t^{2} + 2^{2}$ the result is $\\frac{1}{2}\\tan^{-1}\\frac{t}{2}$.',
            ),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 3,
      prompt: 'Rationalise the integral.',
      promptTex: '\\int \\frac{2x+3+2\\sqrt{4x+1}}{5x-7-\\sqrt{4x+1}}\\,dx',
      hint: 'Let the new variable equal the root.',
      stages: [
        {
          label: 'Substitution',
          question: 'Which substitution makes it rational?',
          choices: [
            right('t = \\sqrt{4x+1}', 'As in the notes: then $t^{2} = 4x + 1$.'),
            wrong('t = 4x + 1', 'The root $\\sqrt{t}$ would remain.'),
          ],
        },
        {
          label: 'x and dx',
          question: 'Express $x$ and $dx$ in terms of $t$.',
          choices: [
            right('x = \\frac{t^{2}-1}{4}, \\quad dx = \\frac{1}{2}t\\,dt', 'From $t^{2} = 4x + 1$.'),
            wrong('x = \\frac{t^{2}+1}{4}, \\quad dx = \\frac{1}{2}t\\,dt', '$4x = t^{2} - 1$.'),
          ],
        },
        {
          label: 'Transformed',
          question: 'What does the integral become?',
          choices: [
            right(
              '\\int \\frac{t(t^{2}+4t+5)}{5t^{2}-4t-33}\\,dt',
              'A rational function of $t$, as printed in the notes.',
            ),
            wrong(
              '\\int \\frac{t^{2}+4t+5}{5t^{2}-4t-33}\\,dt',
              'The factor $\\frac{t}{2}$ from $dx$ gives the extra $t$.',
            ),
          ],
        },
      ],
    },
    {
      kind: 'stages',
      level: 3,
      prompt: 'Several fractional powers.',
      promptTex: '\\int \\frac{x^{\\frac{2}{3}}}{1+x^{\\frac{1}{2}}}\\,dx',
      hint: 'Find the LCM of the denominators 3 and 2.',
      stages: [
        {
          label: 'Substitution',
          question: 'Which substitution?',
          choices: [
            right('x = u^{6}', '6 is the LCM of 3 and 2, so both powers become whole.'),
            wrong('x = u^{5}', 'The LCM of 3 and 2 is 6.'),
            wrong('x = u^{2}', 'Then $x^{\\frac{2}{3}} = u^{\\frac{4}{3}}$ is still fractional.'),
          ],
        },
        {
          label: 'Rewrite',
          question: 'Rewrite the pieces.',
          choices: [
            right(
              'x^{\\frac{2}{3}} = u^{4}, \\quad x^{\\frac{1}{2}} = u^{3}, \\quad dx = 6u^{5}\\,du',
              'Each power is multiplied by 6.',
            ),
            wrong(
              'x^{\\frac{2}{3}} = u^{3}, \\quad x^{\\frac{1}{2}} = u^{4}, \\quad dx = 6u^{5}\\,du',
              '$\\frac{2}{3} \\cdot 6 = 4$ and $\\frac{1}{2} \\cdot 6 = 3$.',
            ),
          ],
        },
        {
          label: 'Transformed',
          question: 'What does the integral become?',
          choices: [
            right('6\\int \\frac{u^{9}}{1+u^{3}}\\,du', '$u^{4} \\cdot 6u^{5} = 6u^{9}$.'),
            wrong('6\\int \\frac{u^{4}}{1+u^{3}}\\,du', 'Include $u^{5}$ from $dx$.'),
          ],
        },
      ],
    },
  ],
});

// -----------------------------------------------------------------------------
// 6. Choose U (Integration by Parts)
// -----------------------------------------------------------------------------
const partsRound = (
  level: number,
  integral: string,
  u: Choice[],
  du: Choice[],
  v: Choice[],
  remaining: Choice[],
  answer: Choice[],
  hint: string,
): Round => ({
  kind: 'stages',
  level,
  prompt: 'Choose $u$ and $dv$, then build the rest.',
  promptTex: integral,
  hint,
  stages: [
    { label: 'Choose u', question: 'Which choice of $u$ is most useful?', choices: u },
    { label: 'du', question: 'What is $du$?', choices: du },
    { label: 'v', question: 'What is $v$?', choices: v },
    { label: 'Remaining', question: 'What integral remains in $uv - \\int v\\,du$?', choices: remaining },
    { label: 'Answer', question: 'Finish the integral.', choices: answer },
  ],
});

const chooseU = game({
  id: 'choose-u',
  title: 'Choose U',
  unitId: U.byParts,
  summary: 'Choose a useful u and dv, then build du, v and the remaining integral.',
  tutorial: {
    goal: 'Use $\\int u\\,dv = uv - \\int v\\,du$ with a good choice of $u$.',
    interaction:
      'Choose $u$ (and so $dv$), then find $du$, $v$, the remaining integral and the answer. Some choices are valid but make the remaining integral harder: the feedback explains why.',
    skill: 'Choosing $u$ to simplify when differentiated, and $dv$ to be easy to integrate; repeating the method.',
    scoring: 'Every step scores: 10 if right first time, 5 after a retry, 3 fewer once you have used the hint.',
  },
  rounds: [
    partsRound(
      1,
      '\\int xe^{x}\\,dx',
      [
        right('u = x, \\quad dv = e^{x}\\,dx', '$x$ becomes 1 when differentiated, and $e^{x}$ is easy to integrate.'),
        wrong(
          'u = e^{x}, \\quad dv = x\\,dx',
          'This choice is valid, but it makes the remaining integral harder: $\\int \\frac{x^{2}}{2}e^{x}\\,dx$.',
        ),
      ],
      [right('du = dx', '$\\frac{d}{dx}x = 1$.'), wrong('du = x\\,dx', 'Differentiate $u = x$.')],
      [right('v = e^{x}', '$\\int e^{x}\\,dx = e^{x}$.'), wrong('v = xe^{x}', 'Integrate $dv = e^{x}\\,dx$ only.')],
      [
        right('\\int e^{x}\\,dx', '$v\\,du = e^{x}\\,dx$.'),
        wrong('\\int xe^{x}\\,dx', 'That is the original integral.'),
      ],
      [right('xe^{x} - e^{x} + C', 'As in the notes.'), wrong('xe^{x} + e^{x} + C', 'Subtract $\\int e^{x}\\,dx$.')],
      'Which factor becomes simpler when differentiated?',
    ),
    partsRound(
      1,
      '\\int x^{2}\\ln x\\,dx',
      [
        right(
          'u = \\ln x, \\quad dv = x^{2}\\,dx',
          '$x^{2}$ is more easily integrated than $\\ln x$, as the notes say.',
        ),
        wrong(
          'u = x^{2}, \\quad dv = \\ln x\\,dx',
          'This choice is valid, but it makes the work harder: you would first need $v = \\int \\ln x\\,dx = x\\ln x - x$.',
        ),
      ],
      [
        right('du = \\frac{1}{x}\\,dx', '$\\frac{d}{dx}\\ln x = \\frac{1}{x}$.'),
        wrong('du = \\ln x\\,dx', 'Differentiate $\\ln x$.'),
      ],
      [
        right('v = \\frac{x^{3}}{3}', '$\\int x^{2}\\,dx = \\frac{x^{3}}{3}$.'),
        wrong('v = 2x', 'Integrate $x^{2}$, do not differentiate it.'),
      ],
      [
        right('\\frac{1}{3}\\int x^{2}\\,dx', '$\\frac{x^{3}}{3} \\cdot \\frac{1}{x} = \\frac{x^{2}}{3}$.'),
        wrong('\\frac{1}{3}\\int x^{3}\\ln x\\,dx', 'Multiply $v$ by $du$, not by $u$.'),
      ],
      [
        right('\\frac{x^{3}}{3}\\ln x - \\frac{x^{3}}{9} + C', 'As in the notes.'),
        wrong(
          '\\frac{x^{3}}{3}\\ln x - \\frac{x^{3}}{3} + C',
          '$\\frac{1}{3} \\cdot \\frac{x^{3}}{3} = \\frac{x^{3}}{9}$.',
        ),
      ],
      'A logarithm is easier to differentiate than to integrate.',
    ),
    partsRound(
      2,
      '\\int \\ln x\\,dx',
      [
        right('u = \\ln x, \\quad dv = dx', 'There is no second factor, so take $dv = dx$.'),
        wrong('u = 1, \\quad dv = \\ln x\\,dx', 'Then $v = \\int \\ln x\\,dx$, the very integral you want.'),
      ],
      [right('du = \\frac{1}{x}\\,dx', 'Correct.'), wrong('du = dx', 'Differentiate $\\ln x$.')],
      [right('v = x', '$\\int dx = x$.'), wrong('v = 1', 'Integrate $dv = dx$.')],
      [right('\\int dx', '$x \\cdot \\frac{1}{x} = 1$.'), wrong('\\int \\ln x\\,dx', 'That is the original integral.')],
      [right('x\\ln x - x + C', 'As in the notes.'), wrong('x\\ln x + x + C', 'Subtract $\\int dx = x$.')],
      'With only one factor, let $dv = dx$.',
    ),
    partsRound(
      2,
      '\\int x\\tan^{-1}x\\,dx',
      [
        right('u = \\tan^{-1}x, \\quad dv = x\\,dx', 'Inverse tangent is easy to differentiate and hard to integrate.'),
        wrong(
          'u = x, \\quad dv = \\tan^{-1}x\\,dx',
          'This choice is valid, but it makes the work harder: $v = \\int \\tan^{-1}x\\,dx$ needs parts itself.',
        ),
      ],
      [
        right('du = \\frac{1}{1+x^{2}}\\,dx', 'Standard derivative.'),
        wrong('du = \\frac{1}{\\sqrt{1-x^{2}}}\\,dx', 'That is the derivative of $\\sin^{-1}x$.'),
      ],
      [right('v = \\frac{x^{2}}{2}', 'Correct.'), wrong('v = 1', 'Integrate $x\\,dx$.')],
      [
        right(
          '\\frac{1}{2}\\int \\frac{x^{2}}{1+x^{2}}\\,dx',
          'Then write $\\frac{x^{2}}{1+x^{2}} = 1 - \\frac{1}{1+x^{2}}$.',
        ),
        wrong('\\int \\frac{x}{1+x^{2}}\\,dx', 'Multiply $v = \\frac{x^{2}}{2}$ by $du$.'),
      ],
      [
        right('\\frac{1}{2}(x^{2}+1)\\tan^{-1}x - \\frac{x}{2} + C', 'Collect the $\\tan^{-1}x$ terms.'),
        wrong('\\frac{x^{2}}{2}\\tan^{-1}x - \\frac{x}{2} + C', 'The $+\\frac{1}{2}\\tan^{-1}x$ term is missing.'),
      ],
      'Inverse trigonometric functions make good choices of $u$.',
    ),
    {
      kind: 'stages',
      level: 3,
      prompt: 'Integration by parts, twice.',
      promptTex: '\\int x^{2}e^{x}\\,dx',
      hint: 'Each application lowers the power of $x$ by one.',
      stages: [
        {
          label: 'Choose u',
          question: 'First application: which $u$?',
          choices: [
            right(
              'u = x^{2}, \\quad dv = e^{x}\\,dx',
              'The derivative of $x^{2}$ becomes simpler; that of $e^{x}$ does not.',
            ),
            wrong('u = e^{x}, \\quad dv = x^{2}\\,dx', 'This choice is valid, but the power of $x$ would go up.'),
          ],
        },
        {
          label: 'First result',
          question: 'After one application:',
          choices: [
            right('x^{2}e^{x} - \\int 2xe^{x}\\,dx', '$du = 2x\\,dx$ and $v = e^{x}$.'),
            wrong('x^{2}e^{x} + \\int 2xe^{x}\\,dx', 'The formula subtracts $\\int v\\,du$.'),
          ],
        },
        {
          label: 'Again',
          question: 'Second application, for $\\int 2xe^{x}\\,dx$: which $u$?',
          choices: [
            right('u = 2x, \\quad dv = e^{x}\\,dx', 'Again the polynomial is $u$.'),
            wrong('u = e^{x}, \\quad dv = 2x\\,dx', 'This brings back $x^{2}$.'),
          ],
        },
        {
          label: 'Answer',
          question: 'Finish.',
          choices: [
            right('e^{x}(x^{2} - 2x + 2) + C', 'As in the notes.'),
            wrong('e^{x}(x^{2} + 2x + 2) + C', 'Check the signs: $x^{2}e^{x} - (2xe^{x} - 2e^{x})$.'),
          ],
        },
      ],
    },
  ],
});

// -----------------------------------------------------------------------------
// 7. Pattern Detective (Advanced Integration Patterns)
// -----------------------------------------------------------------------------
const STRATEGIES = {
  saveSine: 'Keep one $\\sin x$ aside and use $\\sin^{2}x = 1 - \\cos^{2}x$',
  saveCosine: 'Keep one $\\cos x$ aside and use $\\cos^{2}x = 1 - \\sin^{2}x$',
  powerReduction: 'Lower the powers with $\\sin^{2}x = \\frac{1-\\cos 2x}{2}$ and $\\cos^{2}x = \\frac{1+\\cos 2x}{2}$',
  productToSum: 'Use a product-to-sum formula',
  parts: 'Integration by parts',
  reduction: 'A reduction formula',
  quotient: 'Write the numerator as $p(\\text{denominator}) + q(\\text{its derivative}) + r$',
};

const detectiveRound = (
  level: number,
  integral: string,
  strategy: Choice[],
  firstStep: Choice[],
  hint: string,
): Round => ({
  kind: 'stages',
  level,
  prompt: 'Choose the strategy before calculating.',
  promptTex: integral,
  hint,
  stages: [
    { label: 'Strategy', question: 'Which strategy fits best?', choices: strategy },
    { label: 'First step', question: 'What is the first step?', choices: firstStep },
  ],
});

const patternDetective = game({
  id: 'pattern-detective',
  title: 'Pattern Detective',
  unitId: U.advancedPatterns,
  summary: 'Choose the right strategy before calculating.',
  tutorial: {
    goal: 'Spot the pattern in each integral and choose a strategy before calculating anything.',
    interaction:
      'Pick the strategy card that fits the integral, then the first step it leads to. Every card is a real strategy; the feedback says when it fits and when another is better.',
    skill:
      'Odd and even powers, product-to-sum, reduction formulas, integration by parts, and quotients of sine and cosine.',
    scoring: '10 points for each step right first time, 5 after a retry, 3 fewer once you have used the hint.',
  },
  rounds: [
    detectiveRound(
      1,
      '\\int \\sin^{3}x\\,dx',
      [
        right(STRATEGIES.saveSine, 'The power of sine is odd (case 1).', false),
        wrong(STRATEGIES.powerReduction, 'Power reduction is for even powers; here the power is odd.', false),
        wrong(STRATEGIES.reduction, 'The $\\sin^{n}$ reduction formula works, but saving one sine is quicker.', false),
      ],
      [
        right('\\int (1 - \\cos^{2}x)\\sin x\\,dx', 'Then let $u = \\cos x$.'),
        wrong('\\int (1 - \\sin^{2}x)\\sin x\\,dx', 'Replace $\\sin^{2}x$ by $1 - \\cos^{2}x$.'),
      ],
      'Is the power of sine odd or even?',
    ),
    detectiveRound(
      1,
      '\\int \\sin^{4}x\\cos^{3}x\\,dx',
      [
        right(STRATEGIES.saveCosine, 'The power of cosine is odd, so keep one $\\cos x$ aside.', false),
        wrong(STRATEGIES.saveSine, 'The power of sine is even, so this leaves an odd power of cosine.', false),
        wrong(STRATEGIES.powerReduction, 'Not both powers are even.', false),
      ],
      [
        right('\\int \\sin^{4}x(1 - \\sin^{2}x)\\cos x\\,dx', 'Then let $u = \\sin x$.'),
        wrong('\\int \\sin^{4}x(1 - \\cos^{2}x)\\cos x\\,dx', 'Replace $\\cos^{2}x$ by $1 - \\sin^{2}x$.'),
      ],
      'Which power is odd?',
    ),
    detectiveRound(
      2,
      '\\int \\sin^{5}x\\cos^{2}x\\,dx',
      [
        right(STRATEGIES.saveSine, 'The power of sine (5) is odd.', false),
        wrong(
          STRATEGIES.saveCosine,
          'The power of cosine (2) is even, so keeping one aside leaves an odd power.',
          false,
        ),
        wrong(STRATEGIES.productToSum, 'That is for products such as $\\sin px\\cos qx$, not powers.', false),
      ],
      [
        right('\\int \\cos^{2}x(1-\\cos^{2}x)^{2}\\sin x\\,dx', 'As in the notes.'),
        wrong('\\int \\cos^{2}x(1-\\sin^{2}x)^{2}\\sin x\\,dx', 'Write $\\sin^{4}x = (1 - \\cos^{2}x)^{2}$.'),
      ],
      'Look for the odd power.',
    ),
    detectiveRound(
      2,
      '\\int \\cos^{4}x\\,dx',
      [
        right(STRATEGIES.powerReduction, 'Both powers are even (case II).', false),
        wrong(STRATEGIES.saveCosine, 'With an even power, keeping one $\\cos x$ leaves an odd power of cosine.', false),
        wrong(STRATEGIES.parts, 'Possible through a reduction formula, but the identities are more direct.', false),
      ],
      [
        right('\\int \\left(\\frac{1+\\cos 2x}{2}\\right)^{2}dx', 'As in the notes.'),
        wrong('\\int \\left(\\frac{1-\\cos 2x}{2}\\right)^{2}dx', 'That identity is for $\\sin^{2}x$.'),
      ],
      'All the powers are even.',
    ),
    detectiveRound(
      2,
      '\\int \\sin 8x\\cos 6x\\,dx',
      [
        right(STRATEGIES.productToSum, 'A product of sine and cosine of different multiples of $x$.', false),
        wrong(STRATEGIES.powerReduction, 'There are no powers here, only different multiples of $x$.', false),
        wrong(STRATEGIES.saveSine, 'There is no odd power here.', false),
      ],
      [
        right(
          '\\frac{1}{2}\\int (\\sin 14x + \\sin 2x)\\,dx',
          '$\\sin px\\cos qx = \\frac{1}{2}\\sin(p+q)x + \\frac{1}{2}\\sin(p-q)x$.',
        ),
        wrong('\\frac{1}{2}\\int (\\cos 14x + \\cos 2x)\\,dx', 'A sine times a cosine gives sines.'),
      ],
      'Different multiples of $x$, not powers.',
    ),
    {
      kind: 'select',
      multiple: true,
      level: 3,
      prompt: 'Select every strategy that works.',
      promptTex: '\\int x^{2}e^{x}\\,dx',
      hint: 'There is more than one valid route here.',
      choices: [
        right(STRATEGIES.parts, 'Apply it twice, as in the notes.', false),
        right(
          STRATEGIES.reduction,
          '$\\int x^{n}e^{x}\\,dx = x^{n}e^{x} - n\\int x^{n-1}e^{x}\\,dx$ with $n = 2$.',
          false,
        ),
        wrong(STRATEGIES.productToSum, 'There are no products of sines and cosines.', false),
      ],
    },
    detectiveRound(
      3,
      '\\int \\sin^{n}x\\,dx \\text{ for general } n',
      [
        right(STRATEGIES.reduction, 'It lowers the power by 2 each time.', false),
        wrong(STRATEGIES.saveSine, 'That works only once $n$ is known to be odd.', false),
      ],
      [
        right(
          '-\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n-1}{n}\\int \\sin^{n-2}x\\,dx',
          'The reduction formula from the notes.',
        ),
        wrong(
          '-\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n-1}{n}\\int \\sin^{n-1}x\\,dx',
          'The power drops by 2, to $n - 2$.',
        ),
      ],
      'The power is unknown.',
    ),
    detectiveRound(
      3,
      '\\int \\frac{1+\\cos x-3\\sin x}{2+2\\cos x-\\sin x}\\,dx',
      [
        right(STRATEGIES.quotient, 'This is the quotient form of the last section.', false),
        wrong(STRATEGIES.productToSum, 'This is a quotient, not a product.', false),
        wrong(STRATEGIES.parts, 'There is no product to split here.', false),
      ],
      [
        right(
          'p = 1, \\quad q = 1, \\quad r = -1',
          '$1 + \\cos x - 3\\sin x = (2 + 2\\cos x - \\sin x) + (-2\\sin x - \\cos x) - 1$.',
        ),
        wrong('p = 1, \\quad q = -1, \\quad r = 1', 'Compare the coefficients of $\\cos x$ and $\\sin x$ again.'),
      ],
      'Numerator and denominator are both of the form $a\\cos x + b\\sin x + c$.',
    ),
  ],
});

export const INTEGRATION_GAMES: readonly GameDefinition[] = [
  reverseTheDerivative,
  ruleBuilder,
  spotTheSubstitution,
  buildTheDecomposition,
  transformationChallenge,
  chooseU,
  patternDetective,
];

export const gameById = (id: string): GameDefinition | undefined => INTEGRATION_GAMES.find((g) => g.id === id);
