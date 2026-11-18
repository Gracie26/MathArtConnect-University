import type { LearningUnitDefinition } from '../../../types';
import { FIGURE_2_14 } from '../figures';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, figure, laterSteps, practiseStep, src, step } from '../steps';

/** Source: §2.5.2 TYPE II: Discontinuous Integrands (printed pages 37–40). */
export const improperDiscontinuous: LearningUnitDefinition = {
  id: AREA_UNITS.typeTwo,
  slug: 'improper-integrals-discontinuous-integrands',
  title: 'Improper Integrals: Discontinuous Integrands',
  summary: 'Type II improper integrals: an integrand with a vertical asymptote at an endpoint or inside the interval.',
  glyph: 'limits',
  tone: 'coral',
  source: [ch2('2.5.2', 37), ch2('2.5.2', 40)],
  steps: [
    step('concept', 'TYPE II: Discontinuous integrands', [
      {
        type: 'paragraph',
        text: 'Suppose that $f$ is a positive continuous function defined on a finite interval $[a, b)$ but has a vertical asymptote at $b$. Let $S$ be the unbounded region under the graph of $f$ and above the $x$-axis between $a$ and $b$. Take note here that the region extends indefinitely in a vertical direction. The area of the part of $S$ between $a$ and $t$ (shaded region in Figure 2.11) is $A(t) = \\int_{a}^{t} f(x)\\,dx$.',
        source: src('ch2-2.5.2-setup'),
      },
      figure('ch2-fig-2.11'),
      {
        type: 'paragraph',
        text: 'If it happens that $A(t)$ approaches a definite number $A$ as $t \\to b^{-}$, then we say that the area of the region $S$ is $A$ and we write $\\int_{a}^{b} f(x)\\,dx = \\lim_{t \\to b^{-}} \\int_{a}^{t} f(x)\\,dx$. We use this equation to define an improper integral of Type II even when $f$ is not a positive function, no matter what type of discontinuity $f$ has at $b$.',
        source: src('ch2-2.5.2-limit'),
      },
      {
        type: 'definition',
        term: 'Definition 2.5.2',
        text: 'If $f$ is continuous on $[a, b)$ and is discontinuous at $b$, then, if the limit exists (as a finite number),',
        tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{t \\to b^{-}} \\int_{a}^{t} f(x)\\,dx',
        source: src('ch2-def-2.5.2'),
      },
      {
        type: 'definition',
        term: 'Definition 2.5.3',
        text: 'If $f$ is continuous on $(a, b]$ and is discontinuous at $a$, then, if the limit exists (as a finite number),',
        tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{t \\to a^{+}} \\int_{t}^{b} f(x)\\,dx',
        source: src('ch2-def-2.5.3'),
      },
      {
        type: 'callout',
        tone: 'insight',
        title: 'Remark 2.5.3',
        text: 'The improper integral $\\int_{a}^{b} f(x)\\,dx$ is called convergent if the corresponding limit exists and divergent if the limit does not exist.',
        source: src('ch2-rem-2.5.3'),
      },
      {
        type: 'definition',
        term: 'Definition 2.5.4',
        text: 'If $f$ has a discontinuity at $c$, where $a < c < b$, and both $\\int_{a}^{c} f(x)\\,dx$ and $\\int_{c}^{b} f(x)\\,dx$ are convergent, then we define',
        tex: '\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{c} f(x)\\,dx + \\int_{c}^{b} f(x)\\,dx.',
        source: src('ch2-def-2.5.4'),
      },
      {
        type: 'paragraph',
        text: 'Definitions 2.5.3 and 2.5.4 above are illustrated in Figure 2.12 and Figure 2.13 respectively where $f(x) \\ge 0$ and $f$ has vertical asymptotes at $a$ and $c$ respectively.',
        source: src('ch2-2.5.2-illustrated'),
      },
      figure('ch2-fig-2.12'),
      figure('ch2-fig-2.13'),
    ]),
    step('worked-example', 'An asymptote at an endpoint', [
      {
        type: 'workedExample',
        title: 'Example 2.5.2',
        prompt: 'Find',
        problemTex: '\\int_{2}^{5} \\frac{1}{\\sqrt{x-2}}\\,dx.',
        method: 'Definition 2.5.3 (discontinuous at the lower limit)',
        figure: FIGURE_2_14,
        steps: [
          {
            explanation: '',
            tex: '\\int_{2}^{5} \\frac{1}{\\sqrt{x-2}}\\,dx = \\lim_{t \\to 2^{+}} \\int_{t}^{5} \\frac{1}{\\sqrt{x-2}}\\,dx = \\lim_{t \\to 2^{+}} 2\\sqrt{x-2}\\Big|_{t}^{5} = \\lim_{t \\to 2^{+}} \\left(2\\sqrt{3} - 2\\sqrt{t-2}\\right) = 2\\sqrt{3}.',
          },
          {
            explanation:
              'Thus, the given improper integral is convergent and, since the integrand is positive, we can interpret the value of the integral as the area of the shaded region in Figure 2.14 below.',
          },
        ],
        resultTex: '\\int_{2}^{5} \\frac{1}{\\sqrt{x-2}}\\,dx = 2\\sqrt{3}',
        source: src('ch2-ex-2.5.2'),
        covers: ['ch2-sol-2.5.2', 'ch2-fig-2.14'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    exploreStep(AREA_UNITS.typeTwo),
    practiseStep(AREA_UNITS.typeTwo),
    ...laterSteps(AREA_UNITS.typeTwo),
  ],
};
