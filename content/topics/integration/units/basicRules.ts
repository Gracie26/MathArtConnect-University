import type { LearningUnitDefinition } from '../../../types';
import { INTEGRATION_UNITS } from '../ids';
import { ch1 } from '../sources';
import { BASIC_RULES_TRY_IT } from '../appPractice';
import { activityStep, practiseStep, reflectAndReview, src, step } from '../steps';

/** Source: Chapter 1, §1.3–1.4 (all items in the inventory for these sections). */
export const basicIntegrationRules: LearningUnitDefinition = {
  id: INTEGRATION_UNITS.basicRules,
  slug: 'basic-integration-rules',
  title: 'Basic Integration Rules',
  summary: 'The power rule, its one exception, sums, constant multiples and the standard anti-derivatives.',
  glyph: 'practice',
  tone: 'amber',
  source: [ch1('1.3', 3), ch1('1.4', 4)],
  steps: [
    step(
      'concept',
      'Reversing the power rule',
      [
        {
          type: 'paragraph',
          text: 'When differentiating the power $x^{n}$, we multiply by the exponent $n$ and decrease the exponent by 1. To find an anti-derivative of $x^{n}$, reverse that rule: increase the exponent by 1 and divide by the new exponent $n + 1$.',
          source: src('ch1-1.3-reverse'),
        },
        {
          type: 'theorem',
          label: 'Power rule',
          text: 'If $n$ is a rational number, then for $n \\neq -1$',
          tex: '\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C',
          source: src('ch1-1.3-power-rule'),
          covers: ['ch1-1.3-proof'],
          proof: [
            {
              explanation: 'Differentiate the right-hand side.',
              tex: '\\frac{d}{dx}\\left(\\frac{x^{n+1}}{n+1} + C\\right) = (n+1)\\frac{x^{(n+1)-1}}{n+1} + 0 = x^{n}',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'The restriction n ≠ −1',
          text: 'With $n = -1$ the formula would divide by zero, so it cannot be used. That case is covered by a separate formula in the list below:',
          tex: '\\int \\frac{1}{x}\\,dx = \\ln|x| + C',
        },
        {
          type: 'paragraph',
          text: 'The next property is an immediate consequence of the fact that the derivative of a sum is the sum of the derivatives.',
          source: src('ch1-1.3-sum-reason'),
        },
        {
          type: 'theorem',
          label: 'Theorem',
          title: 'Sums and differences',
          text: "If $F'(x) = f(x)$ and $G'(x) = g(x)$, then",
          tex: '\\int [f(x) \\pm g(x)]\\,dx = \\int f(x)\\,dx \\pm \\int g(x)\\,dx = F(x) \\pm G(x) + C',
          source: src('ch1-thm-1.3.1'),
        },
        {
          type: 'theorem',
          label: 'Theorem',
          title: 'Constant multiples',
          text: "If $F'(x) = f(x)$, then for any constant $k$",
          tex: '\\int kf(x)\\,dx = k\\int f(x)\\,dx',
          source: src('ch1-thm-1.3.2'),
        },
        {
          type: 'paragraph',
          text: 'So the anti-derivative, or indefinite integral, of any finite sum can be obtained by integrating each term.',
          source: src('ch1-1.3-finite-sum'),
        },
        {
          type: 'formulaList',
          title: 'Some anti-differentiation formulas',
          items: [
            { tex: '\\int cf(x)\\,dx = c\\int f(x)\\,dx', source: src('ch1-1.4-f1') },
            {
              tex: '\\int [f(x) \\pm g(x)] = \\int f(x)\\,dx \\pm \\int g(x)\\,dx',
              source: src('ch1-1.4-f2'),
              reviewIds: ['MR-15'],
            },
            { tex: '\\int x^{n}\\,dx = \\frac{1}{n+1}x^{n+1} + C', note: 'For n ≠ −1.', source: src('ch1-1.4-f3') },
            { tex: '\\int a\\,dx = ax + C', source: src('ch1-1.4-f4') },
            { tex: '\\int \\cos x\\,dx = \\sin x + C', source: src('ch1-1.4-f5') },
            { tex: '\\int \\sin x\\,dx = -\\cos x + C', source: src('ch1-1.4-f6') },
            { tex: '\\int \\sec^{2}x\\,dx = \\tan x + C', source: src('ch1-1.4-f7') },
            { tex: '\\int e^{x}\\,dx = e^{x} + C', source: src('ch1-1.4-f8') },
            { tex: '\\int \\frac{1}{x}\\,dx = \\ln|x| + C', source: src('ch1-1.4-f9') },
            { tex: '\\int \\frac{1}{\\sqrt{1-x^{2}}}\\,dx = \\sin^{-1}x + C', source: src('ch1-1.4-f10') },
            { tex: '\\int \\frac{1}{1+x^{2}}\\,dx = \\tan^{-1}x + C', source: src('ch1-1.4-f11') },
          ],
        },
        {
          type: 'summary',
          title: 'Key points',
          points: [
            'Power rule: add 1 to the exponent and divide by the new exponent, for $n \\neq -1$.',
            'Rewrite roots and reciprocals as powers first, such as $\\sqrt{x} = x^{\\frac{1}{2}}$ and $\\frac{1}{x^{5}} = x^{-5}$.',
            'Integrate sums term by term and take constant factors outside.',
          ],
        },
      ],
      { source: [ch1('1.3', 3), ch1('1.3', 4), ch1('1.4', 4), ch1('1.4', 5)] },
    ),
    step(
      'see-it',
      'The power rule in action',
      [
        {
          type: 'workedExample',
          title: 'A whole-number power',
          problemTex: '\\int x^{6}\\,dx',
          method: 'Power rule',
          steps: [
            {
              explanation: 'Raise the exponent from 6 to 7, then divide by 7.',
              tex: '\\int x^{6}\\,dx = \\frac{x^{7}}{7} + C',
            },
          ],
          resultTex: '\\frac{x^{7}}{7} + C',
          source: src('ch1-1.3-ex-x6'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A negative power',
          problemTex: '\\int \\frac{1}{x^{5}}\\,dx',
          method: 'Power rule',
          steps: [
            {
              explanation: 'Write $\\frac{1}{x^{5}}$ as $x^{-5}$.',
              tex: '\\int x^{-5}\\,dx',
              why: 'The power rule needs the integrand written as a power of $x$.',
            },
            { explanation: 'Apply the power rule with $n = -5$.', tex: '\\frac{x^{-4}}{-4} + C' },
          ],
          resultTex: '-\\frac{1}{4x^{4}} + C',
          source: src('ch1-1.3-ex-x-5'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A fractional power',
          problemTex: '\\int \\sqrt{x}\\,dx',
          method: 'Power rule',
          steps: [
            {
              explanation: 'Write $\\sqrt{x}$ as $x^{\\frac{1}{2}}$.',
              tex: '\\int \\sqrt{x}\\,dx = \\int x^{\\frac{1}{2}}\\,dx',
            },
            {
              explanation: 'Apply the power rule with $n = \\frac{1}{2}$.',
              tex: '\\frac{x^{\\frac{3}{2}}}{\\frac{3}{2}} + C',
            },
          ],
          resultTex: '\\frac{2}{3}x^{\\frac{3}{2}} + C',
          source: src('ch1-1.3-ex-sqrt'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.3', 3)] },
    ),
    activityStep('explore', INTEGRATION_UNITS.basicRules),
    // §1.3–1.4 contain no "You Try It" items, so Try it is App practice (labelled as such) and optional;
    // this subtopic's tutorial question is in Practise.
    step('try-it', 'Try it: use the rules', BASIC_RULES_TRY_IT, {
      required: false,
      source: [ch1('1.3', 3), ch1('1.4', 4)],
    }),
    step(
      'worked-example',
      'Worked examples',
      [
        {
          type: 'workedExample',
          title: 'A sum of two powers',
          problemTex: '\\int \\left(x^{-\\frac{1}{2}} + x^{4}\\right)dx',
          method: 'Sum rule and power rule',
          steps: [
            { explanation: 'Integrate each term separately.', tex: '\\int x^{-\\frac{1}{2}}\\,dx + \\int x^{4}\\,dx' },
            {
              explanation: 'Apply the power rule to each term.',
              tex: '\\frac{x^{\\frac{1}{2}}}{\\frac{1}{2}} + \\frac{x^{5}}{5} + C',
            },
          ],
          resultTex: '2x^{\\frac{1}{2}} + \\frac{x^{5}}{5} + C',
          source: src('ch1-1.3-ex-sum'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Several rules at once',
          problemTex: '\\int \\left(4x - 2x^{-\\frac{1}{3}} + \\frac{5}{x^{2}}\\right)dx',
          method: 'Sum rule, constant multiples and the power rule',
          steps: [
            {
              explanation: 'Integrate term by term and take the constants outside.',
              tex: '4\\int x\\,dx - 2\\int x^{-\\frac{1}{3}}\\,dx + 5\\int x^{-2}\\,dx',
            },
            {
              explanation: 'Apply the power rule to each term.',
              tex: '4 \\cdot \\frac{x^{2}}{2} - 2 \\cdot \\frac{x^{\\frac{2}{3}}}{\\frac{2}{3}} + 5 \\cdot \\frac{x^{-1}}{-1} + C',
            },
            { explanation: 'Simplify.', tex: '2x^{2} - 3x^{\\frac{2}{3}} - 5x^{-1} + C' },
          ],
          resultTex: '2x^{2} - 3x^{\\frac{2}{3}} - 5x^{-1} + C',
          source: src('ch1-1.3-ex-three-terms'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A logarithm and a root',
          problemTex: '\\int \\left(\\frac{5}{x} - 2\\sqrt[3]{x^{2}}\\right)dx',
          method: 'Standard formulas and the power rule',
          steps: [
            {
              explanation: 'Take the constants outside and write the root as a power.',
              tex: '5\\int \\frac{1}{x}\\,dx - 2\\int x^{\\frac{2}{3}}\\,dx',
              why: 'The term $\\frac{5}{x}$ is the $n = -1$ case, so it uses $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$.',
            },
            { explanation: 'Integrate each term.', tex: '5\\ln|x| - 2\\frac{1}{\\frac{5}{3}}x^{\\frac{5}{3}} + C' },
          ],
          resultTex: '5\\ln|x| - \\frac{6}{5}x^{\\frac{5}{3}} + C',
          source: src('ch1-1.4-ex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.3', 4), ch1('1.4', 5)] },
    ),
    practiseStep(INTEGRATION_UNITS.basicRules),
    activityStep('play', INTEGRATION_UNITS.basicRules),
    activityStep('create', INTEGRATION_UNITS.basicRules),
    ...reflectAndReview(INTEGRATION_UNITS.basicRules, 'Which rule caused you the most difficulty, and why?', [
      'The power rule with negative or fractional powers',
      'The special case n = −1',
      'Rewriting roots and fractions as powers',
      'Remembering the standard formulas',
    ]),
  ],
};
