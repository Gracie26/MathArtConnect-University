import type { LearningUnitDefinition } from '../../../types';
import { APP_ACCUMULATION, APP_EXAMPLE_2_3_1 } from '../figures';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, illustration, laterSteps, practiseStep, reviewOf, src, step } from '../steps';

/** Source: §2.3 The Fundamental Theorem of Calculus (printed pages 32–33). */
export const fundamentalTheorem: LearningUnitDefinition = {
  id: AREA_UNITS.ftc,
  slug: 'fundamental-theorem-of-calculus',
  title: 'The Fundamental Theorem of Calculus',
  summary:
    'Evaluate definite integrals with anti-derivatives, and differentiate an integral with a variable upper limit.',
  glyph: 'tangent',
  tone: 'coral',
  source: [ch2('2.3', 32), ch2('2.3', 33)],
  steps: [
    step('concept', 'The Fundamental Theorem of Calculus', [
      {
        type: 'paragraph',
        text: 'The two major branches of calculus, that is, differential calculus (introduced with the tangent line problem) and integral calculus (introduced with the area problem) may seem to be unrelated. However, the great mathematicians Isaac Newton and Gottfried Leibniz independently discovered that there is a very close connection between differential calculus and integral calculus. This is appropriately stated in a theorem called the Fundamental Theorem of Calculus.',
        source: src('ch2-2.3-connection'),
      },
      {
        type: 'paragraph',
        text: 'What type of functions are integrable? We shall see that continuous functions are integrable. In this theorem, we shall see that the concept of an anti-derivative of a continuous function provides the bridge between differential calculus and integral calculus. The theorem was developed by anticipating that differentiation and (definite) integration are inverse operations, in the same sense that division and multiplication are inverse operations.',
        source: src('ch2-2.3-integrable'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.3.1',
        title: 'The Fundamental Theorem of Calculus (FTC)',
        text: "Let $f$ be continuous on $[a, b]$ and let $F$ be any function for which $F'(x) = f(x)$. Then",
        tex: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a).',
        source: src('ch2-thm-2.3.1'),
      },
      {
        type: 'callout',
        tone: 'insight',
        title: 'Remark 2.3.1',
        text: 'The Fundamental Theorem of Calculus provides a way to evaluate a definite integral without having to use the approach of finding a limit of a sum. If the anti-derivative of a function $f$ is known, then one can proceed to evaluate the definite integral using the following convenient notation. See for instance example 2.3.1 below.',
        tex: '\\underbrace{\\int_{a}^{b} f(x)\\,dx}_{\\text{definite integral}} = \\underbrace{\\int f(x)\\,dx\\Big|_{a}^{b}}_{\\text{indefinite integral}} = F(x)\\Big|_{a}^{b} = F(b) - F(a).',
        source: src('ch2-rem-2.3.1'),
      },
      {
        type: 'callout',
        tone: 'insight',
        title: 'Remark 2.3.2',
        text: 'It is not necessary to include a constant of integration $C$ in the anti-derivative since',
        tex: '\\int_{a}^{b} f(x)\\,dx = (F(x) + C)\\Big|_{a}^{b} = (F(b) + C) - (F(a) + C) = F(b) - F(a).',
        source: src('ch2-rem-2.3.2'),
      },
    ]),
    step('worked-example', 'Evaluating with the FTC', [
      {
        type: 'workedExample',
        title: 'Example 2.3.1',
        prompt: 'Evaluate',
        problemTex: '\\int_{1}^{3} x\\,dx.',
        method: 'The Fundamental Theorem of Calculus',
        figure: APP_EXAMPLE_2_3_1,
        steps: [
          {
            explanation: 'An anti-derivative of $f(x) = x$ is $F(x) = \\frac{x^{2}}{2}$. Consequently,',
            tex: '\\int_{1}^{3} x\\,dx = \\frac{x^{2}}{2}\\Big|_{1}^{3} = \\frac{9}{2} - \\frac{1}{2} = 4.',
          },
        ],
        resultTex: '\\int_{1}^{3} x\\,dx = 4',
        source: src('ch2-ex-2.3.1'),
        covers: ['ch2-sol-2.3.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    step(
      'see-it',
      'The Second Fundamental Theorem',
      [
        {
          type: 'theorem',
          label: 'Theorem 2.3.2',
          title: 'The Second Fundamental Theorem of Calculus (SFTC)',
          text: 'If $f$ is continuous on $[a, b]$, then the function $g$ defined by',
          tex: 'g(x) = \\int_{a}^{x} f(t)\\,dt, \\qquad a \\le x \\le b',
          textAfter: "is continuous on $[a, b]$ and differentiable on $(a, b)$, and $g'(x) = f(x)$.",
          source: src('ch2-thm-2.3.2'),
        },
        illustration(APP_ACCUMULATION),
        {
          type: 'paragraph',
          text: 'Using Leibniz notation for derivatives, we can write the Second Fundamental Theorem of Calculus as follows.',
          source: src('ch2-2.3-leibniz'),
        },
        {
          type: 'theorem',
          label: 'Theorem 2.3.3',
          title: 'Alternative form for the SFTC',
          text: 'If $f$ is continuous on an open interval $I$ containing $a$, then, for every $x$ in the interval,',
          tex: '\\frac{d}{dx}\\left[\\int_{a}^{x} f(t)\\,dt\\right] = f(x).',
          source: src('ch2-thm-2.3.3'),
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Remark 2.3.3',
          text: 'Theorem 2.3.3 points out that that if we first integrate $f$ and then differentiate the result, we get back to the original function $f$.',
          source: src('ch2-rem-2.3.3'),
          ...reviewOf('ch2-rem-2.3.3'),
        },
      ],
      { key: 'second-fundamental-theorem' },
    ),
    step(
      'worked-example',
      'Differentiating an integral',
      [
        {
          type: 'workedExample',
          title: 'Example 2.3.2',
          prompt: 'Evaluate',
          problemTex: '\\frac{d}{dx}\\left[\\int_{a}^{x} \\sqrt{t^{2} + 1}\\,dt\\right].',
          method: 'The Second Fundamental Theorem of Calculus',
          steps: [
            {
              explanation:
                'Note that $f(t) = \\sqrt{t^{2} + 1}$ is continuous on the entire real line. So using the SFTC, you can write',
              tex: '\\frac{d}{dx}\\left[\\int_{a}^{x} \\sqrt{t^{2} + 1}\\,dt\\right] = \\sqrt{x^{2} + 1}.',
            },
          ],
          resultTex: '\\sqrt{x^{2} + 1}',
          source: src('ch2-ex-2.3.2'),
          covers: ['ch2-sol-2.3.2'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Example 2.3.3',
          prompt: 'Find the derivative of',
          problemTex: 'F(x) = \\int_{\\pi/3}^{x^{3}} \\cos t\\,dt.',
          method: 'The SFTC with the chain rule',
          steps: [
            {
              explanation:
                'Introduce the substitution $u = x^{3}$. We can then apply the SFTC together with chain rule as follows',
              tex: "F'(x) = \\frac{dF}{du} \\times \\frac{du}{dx} = \\frac{d}{du}\\left[\\int_{\\pi/3}^{x^{3}} \\cos t\\,dt\\right] \\times \\frac{du}{dx} = \\frac{d}{du}\\left[\\int_{\\pi/3}^{u} \\cos t\\,dt\\right] \\times (3x^{2})",
              reviewIds: ['MR2-07'],
            },
            { explanation: '', tex: '= (\\cos u)(3x^{2}) = 3x^{2}\\cos x^{3}.' },
          ],
          resultTex: "F'(x) = 3x^{2}\\cos x^{3}",
          source: src('ch2-ex-2.3.3'),
          covers: ['ch2-sol-2.3.3'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
      ],
      { key: 'sftc-examples' },
    ),
    exploreStep(AREA_UNITS.ftc),
    practiseStep(AREA_UNITS.ftc),
    ...laterSteps(AREA_UNITS.ftc),
  ],
};
