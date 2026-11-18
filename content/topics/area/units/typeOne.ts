import type { LearningUnitDefinition } from '../../../types';
import { FIGURE_2_6 } from '../figures';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, figure, laterSteps, practiseStep, reviewOf, src, step } from '../steps';

/** Source: §2.5 Improper Integrals and §2.5.1 TYPE I (printed pages 34–37). */
export const improperInfiniteIntervals: LearningUnitDefinition = {
  id: AREA_UNITS.typeOne,
  slug: 'improper-integrals-infinite-intervals',
  title: 'Improper Integrals: Infinite Intervals',
  summary:
    'Type I improper integrals: integrate up to t, let t → ∞, and decide whether the integral converges or diverges.',
  glyph: 'wave',
  tone: 'teal',
  source: [ch2('2.5', 34), ch2('2.5.1', 34), ch2('2.5.1', 37)],
  steps: [
    step('concept', 'Improper integrals', [
      {
        type: 'definition',
        term: '2.5 Improper Integrals',
        text: 'In this section, we extend the concept of definite integral to the case where the interval considered is an infinite interval. Also, we consider the case where $f$ has an infinite discontinuity in the interval $[a, b]$. In either case the integral is called an improper integral.',
        source: src('ch2-2.5-intro'),
      },
      {
        type: 'workedExample',
        title: 'The region under y = 1/x² to the right of x = 1',
        prompt:
          'The infinite region $S$ that lies under the curve $y = 1/x^{2}$, above the $x$-axis, and to the right of the line $x = 1$: what is its area?',
        problemTex: 'A(S) = \\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx',
        method: 'Integrate up to t, then let t → ∞',
        figure: FIGURE_2_6,
        steps: [
          {
            explanation:
              'Consider the infinite region $S$ that lies under the curve $y = 1/x^{2}$, above the $x$-axis, and to the right of the line $x = 1$. One can observe and think that the area of $S$ is infinite since $S$ is infinite in extent. But taking a closer look, one can note that the area of the part of $S$ that lies to the left of the general vertical line $x = t$ (shaded in Figure 2.6) is',
            tex: 'A(t) = \\int_{1}^{t} \\frac{1}{x^{2}}\\,dx = -\\frac{1}{x}\\Big|_{1}^{t}. \\qquad (2.1)',
          },
          { explanation: 'Notice that $A(t) < 1$ regardless of how large $t$ is chosen.' },
          {
            explanation: 'We also observe that',
            tex: '\\lim_{t \\to \\infty} A(t) = \\lim_{t \\to \\infty} \\left(1 - \\frac{1}{t}\\right) = 1.',
          },
          {
            explanation:
              'Thus, the area of the shaded region approaches 1 as $t \\to \\infty$ (see Figure 2.7). Therefore, the area of the infinite region $S$ is equal to 1 and we write',
            tex: '\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx = \\lim_{t \\to \\infty} \\int_{1}^{t} \\frac{1}{x^{2}}\\,dx = \\lim_{t \\to \\infty} -\\frac{1}{x}\\Big|_{1}^{t} = \\lim_{t \\to \\infty} \\left(1 - \\frac{1}{t}\\right) = 1. \\qquad (2.2)',
          },
        ],
        resultTex: '\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx = 1',
        source: src('ch2-2.5.1-region'),
        covers: ['ch2-2.5.1-bounded', 'ch2-fig-2.6', 'ch2-2.5.1-limit'],
        origin: 'unamSourceAdapted',
        solutionStatus: 'unamSource',
      },
      figure('ch2-fig-2.7'),
    ]),
    step(
      'concept',
      'TYPE I: Integrals over infinite intervals',
      [
        {
          type: 'paragraph',
          text: 'Based on this example, we now define the integral of $f$ (not necessarily a positive function) over an infinite interval as the limit of integrals over finite intervals.',
          source: src('ch2-2.5.1-based'),
        },
        {
          type: 'definition',
          term: 'Definition 2.5.1 (1)',
          text: 'If $\\int_{a}^{t} f(x)\\,dx$ exists for every number $t \\ge a$, then, provided this limit exists (as a finite number),',
          tex: '\\int_{a}^{\\infty} f(x)\\,dx = \\lim_{t \\to \\infty} \\int_{a}^{t} f(x)\\,dx \\qquad (2.3)',
          source: src('ch2-def-2.5.1-1'),
        },
        {
          type: 'definition',
          term: 'Definition 2.5.1 (2)',
          text: 'If $\\int_{t}^{b} f(x)\\,dx$ exists for every number $t \\le b$, then, provided this limit exists (as a finite number),',
          tex: '\\int_{-\\infty}^{b} f(x)\\,dx = \\lim_{t \\to -\\infty} \\int_{t}^{b} f(x)\\,dx \\qquad (2.4)',
          source: src('ch2-def-2.5.1-2'),
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Remark 2.5.1',
          text: 'The improper integrals $\\int_{a}^{\\infty} f(x)\\,dx$ and $\\int_{-\\infty}^{b} f(x)\\,dx$ are called convergent if the corresponding limit exists and divergent if the limit does not exist.',
          source: src('ch2-rem-2.5.1'),
        },
        {
          type: 'definition',
          term: 'Definition 2.5.1 (3)',
          text: 'If both $\\int_{a}^{\\infty} f(x)\\,dx$ and $\\int_{-\\infty}^{a} f(x)\\,dx$ are convergent, then we define',
          tex: '\\int_{-\\infty}^{\\infty} f(x)\\,dx = \\int_{-\\infty}^{a} f(x)\\,dx + \\int_{a}^{\\infty} f(x)\\,dx. \\qquad (2.5)',
          source: src('ch2-def-2.5.1-3'),
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Remark 2.5.2',
          text: 'In part (3), any real number $a$ can be used.',
          source: src('ch2-rem-2.5.2'),
        },
        {
          type: 'paragraph',
          text: 'Any of the improper integrals in the Definition 2.5.3 can be interpreted as an area provided that $f$ is a positive function. For instance, in case (1) if $f(x) \\ge 0$ and the integral $\\int_{a}^{\\infty} f(x)\\,dx$ is convergent, then we define the area of the region $S$ in Figure 2.8 as $A(S) = \\int_{a}^{\\infty} f(x)\\,dx$ where $S = \\{(x, y) \\mid x \\ge a, 0 \\le y \\le f(x)\\}$. This is appropriate because $\\int_{a}^{\\infty} f(x)\\,dx$ is the limit as $t \\to \\infty$ of the area under the graph of $f$ from $a$ to $t$.',
          source: src('ch2-2.5.1-area'),
          ...reviewOf('ch2-2.5.1-area'),
        },
        figure('ch2-fig-2.8'),
      ],
      { key: 'type-one' },
    ),
    step('worked-example', 'Convergent or divergent?', [
      {
        type: 'workedExample',
        title: 'Example 2.5.1',
        prompt: 'Determine whether the integral $\\int_{1}^{\\infty} \\frac{1}{x}\\,dx$ is convergent or divergent.',
        problemTex: '\\int_{1}^{\\infty} \\frac{1}{x}\\,dx',
        method: 'Definition 2.5.1 (1)',
        steps: [
          {
            explanation: '',
            tex: '\\int_{1}^{\\infty} \\frac{1}{x}\\,dx = \\lim_{t \\to \\infty} \\int_{1}^{t} \\frac{1}{x}\\,dx = \\lim_{t \\to \\infty} \\ln|x|\\Big|_{1}^{t} = \\lim_{t \\to \\infty} (\\ln|t| - \\ln|1|) = \\lim_{t \\to \\infty} \\ln t = \\infty.',
          },
          {
            explanation:
              'The limit does not exist as a finite number and so the improper integral $\\int_{1}^{\\infty} \\frac{1}{x}\\,dx$ is divergent.',
          },
        ],
        resultTex: '\\int_{1}^{\\infty} \\frac{1}{x}\\,dx \\text{ is divergent}',
        source: src('ch2-ex-2.5.1'),
        covers: ['ch2-sol-2.5.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'paragraph',
        text: 'Let’s compare the result of example 2.5.1 with example given in (2.2): $\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx$ converges while $\\int_{1}^{\\infty} \\frac{1}{x}\\,dx$ diverges. Geometrically, this means that although the curves $y = 1/x^{2}$ and $y = 1/x$ look very similar for $x > 0$, the region under $y = 1/x^{2}$ to the right of $x = 1$ (the shaded region in Figure 2.9) has finite area whereas the corresponding region under $y = 1/x$ (in Figure 2.10) has infinite area.',
        source: src('ch2-2.5.1-compare'),
      },
      figure('ch2-fig-2.9'),
      figure('ch2-fig-2.10'),
      {
        type: 'callout',
        tone: 'insight',
        title: 'Why one is finite and the other is not',
        text: 'Note that both $1/x^{2}$ and $1/x$ approach 0 as $x \\to \\infty$ but $1/x^{2}$ approaches 0 faster than $1/x$. The underlying reason for an infinite value for the integral of $1/x$ is that $1/x$ does not decrease fast enough for its integral to have a finite value.',
        source: src('ch2-2.5.1-decay'),
      },
    ]),
    exploreStep(AREA_UNITS.typeOne),
    practiseStep(AREA_UNITS.typeOne),
    ...laterSteps(AREA_UNITS.typeOne),
  ],
};
