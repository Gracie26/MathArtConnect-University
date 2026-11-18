import type { LearningUnitDefinition } from '../../../types';
import { INTEGRATION_UNITS } from '../ids';
import { ch1 } from '../sources';
import { activityStep, practiseStep, reflectAndReview, src, step, tryItStep } from '../steps';

/** Source: Chapter 1, §1.5 (all items in the inventory for this section). */
export const substitution: LearningUnitDefinition = {
  id: INTEGRATION_UNITS.substitution,
  slug: 'substitution',
  title: 'Substitution',
  summary: 'Recognise a function inside a function, together with its derivative, and simplify with u.',
  glyph: 'match',
  tone: 'coral',
  source: [ch1('1.5', 5)],
  steps: [
    step(
      'concept',
      'A function inside a function',
      [
        {
          type: 'paragraph',
          text: "Some integrands contain an inner function $g(x)$ together with its derivative $g'(x)$. Naming the inner function $u$ turns the integral into a simpler one in $u$. This gives the indefinite integral of a power of a function, and of many other composite functions.",
        },
        {
          type: 'theorem',
          label: 'Theorem',
          title: 'Substitution',
          text: 'If $F$ is an anti-derivative of $f$, then',
          tex: "\\int f(g(x))\\,g'(x)\\,dx = F(g(x)) + C",
          source: src('ch1-thm-1.5.1'),
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Why it works',
          text: "By the chain rule, $\\frac{d}{dx}F(g(x)) = f(g(x))\\,g'(x)$. Substitution runs the chain rule in reverse.",
        },
        {
          type: 'summary',
          title: 'How to substitute',
          points: [
            'Choose $u$ as the inner function $g(x)$.',
            "Find $du = g'(x)\\,dx$. If a constant factor is missing, multiply inside and divide outside.",
            'Integrate in $u$, then write the answer in terms of $x$.',
          ],
        },
      ],
      { source: [ch1('1.5', 5)] },
    ),
    step(
      'see-it',
      'Spotting u',
      [
        {
          type: 'workedExample',
          title: 'A linear inner function',
          problemTex: '\\int \\sin 10x\\,dx',
          method: 'Substitution',
          steps: [
            {
              explanation: 'If $u = 10x$, we then need $du = 10\\,dx$.',
              tex: 'u = 10x, \\quad du = 10\\,dx',
            },
            {
              explanation: 'Multiply inside by 10 and outside by $\\frac{1}{10}$.',
              tex: '\\int \\sin 10x\\,dx = \\frac{1}{10}\\int \\sin 10x\\,(10\\,dx) = \\frac{1}{10}\\int \\sin u\\,du',
              why: 'Multiplying by $10$ and by $\\frac{1}{10}$ leaves the integral unchanged, but creates exactly $du$.',
            },
            { explanation: 'Integrate, then return to $x$.', tex: '\\frac{1}{10}(-\\cos u) + C' },
          ],
          resultTex: '-\\frac{1}{10}\\cos 10x + C',
          source: src('ch1-1.5-ex-sin10x'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.5', 6)] },
    ),
    activityStep('explore', INTEGRATION_UNITS.substitution),
    tryItStep(
      INTEGRATION_UNITS.substitution,
      'Your turn',
      'Choose $u$, find $du$, then integrate. Write each step in My working and check it as you go.',
    ),
    step(
      'worked-example',
      'Worked examples',
      [
        {
          type: 'workedExample',
          title: 'A negative power',
          problemTex: '\\int \\frac{x}{(4x^{2} + 3)^{6}}\\,dx',
          method: 'Substitution',
          steps: [
            { explanation: 'Rewrite the integral with a negative power.', tex: '\\int (4x^{2}+3)^{-6}\\,x\\,dx' },
            {
              explanation: 'Make the identifications',
              tex: 'u = 4x^{2} + 3 \\quad\\text{and}\\quad du = 8x\\,dx',
              why: 'The derivative of the inner function $4x^{2} + 3$ is $8x$, and $x$ already appears in the integrand.',
            },
            {
              explanation:
                'Supply the factor 8 inside and $\\frac{1}{8}$ outside, so that $(4x^{2}+3)^{-6}$ becomes $u^{-6}$ and $8x\\,dx$ becomes $du$.',
              tex: '\\frac{1}{8}\\int (4x^{2}+3)^{-6}\\,8x\\,dx = \\frac{1}{8}\\int u^{-6}\\,du',
            },
            { explanation: 'Integrate with the power rule.', tex: '\\frac{1}{8} \\cdot \\frac{u^{-5}}{-5} + C' },
          ],
          resultTex: '-\\frac{1}{40}(4x^{2} + 3)^{-5} + C',
          source: src('ch1-1.5-ex-neg-power'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A power of a function',
          problemTex: '\\int x(x^{2} + 2)^{3}\\,dx',
          method: 'Substitution',
          steps: [
            { explanation: 'If $u = x^{2} + 2$ then $du = 2x\\,dx$.', tex: 'u = x^{2} + 2, \\quad du = 2x\\,dx' },
            {
              explanation: 'Supply the factor 2, so that $(x^{2}+2)^{3}$ becomes $u^{3}$ and $2x\\,dx$ becomes $du$.',
              tex: '\\int x(x^{2}+2)^{3}\\,dx = \\frac{1}{2}\\int (x^{2}+2)^{3}\\,2x\\,dx = \\frac{1}{2}\\int u^{3}\\,du',
            },
            { explanation: 'Integrate with the power rule.', tex: '\\frac{1}{2} \\cdot \\frac{u^{4}}{4} + C' },
          ],
          resultTex: '\\frac{1}{8}(x^{2} + 2)^{4} + C',
          source: src('ch1-1.5-ex-cube'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.5', 5), ch1('1.5', 6)] },
    ),
    practiseStep(INTEGRATION_UNITS.substitution),
    activityStep('play', INTEGRATION_UNITS.substitution),
    activityStep('create', INTEGRATION_UNITS.substitution),
    ...reflectAndReview(INTEGRATION_UNITS.substitution, 'How do you recognise a useful u?', [
      'Choosing u',
      'Finding du and the missing constant',
      'Rewriting the whole integral in u',
      'Substituting back at the end',
    ]),
  ],
};
