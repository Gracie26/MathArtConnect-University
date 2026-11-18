import type { LearningUnitDefinition } from '../../../types';
import { PDA_UNITS } from '../ids';
import { ch4 } from '../sources';
import { laterSteps, src, step } from '../steps';

/**
 * Source: §4.3 and the opening of §4.3.1, up to (not including) "The Second
 * Partials Test" (printed pages 58–60). Practice: APP PRACTICE (Tutorial 5
 * Q5 asks to find AND classify, so it is in The Second Partials Test).
 */
export const criticalPoints: LearningUnitDefinition = {
  id: PDA_UNITS.criticalPoints,
  slug: 'critical-points',
  title: 'Critical Points and Relative Extrema',
  summary: 'Relative minima and maxima, and where to look for them: the critical points of f.',
  glyph: 'limits',
  tone: 'amber',
  source: [ch4('4.3', 58), ch4('4.3.1', 58)],
  steps: [
    step('concept', 'Extrema and critical points', [
      {
        type: 'theorem',
        label: 'Theorem 4.3.1',
        title: 'Extreme Value Theorem',
        text: 'Let $f$ be a continuous function of two variables $x$ and $y$ defined on a closed bounded region $R$ in the $xy$-plane.\n1. There is at least one point in $R$ where $f$ takes on a minimum value.\n2. There is at least one point in $R$ where $f$ takes on a maximum value.',
        source: src('ch4-thm-4.3.1'),
      },
      {
        type: 'paragraph',
        text: 'A minimum value is also called an absolute minimum and a maximum is also called an absolute maximum.',
        source: src('ch4-4.3.1-absolute'),
      },
      {
        type: 'definition',
        term: 'Definition of Relative Extrema',
        text: 'Let $f$ be a function defined on a region $R$ containing $(x_{0}, y_{0})$.\n1. The function $f$ has a relative minimum at $(x_{0}, y_{0})$ if $f(x, y) \\geq f(x_{0}, y_{0})$ for all $(x, y)$ in an open disc containing $(x_{0}, y_{0})$.\n2. The function $f$ has a relative maximum at $(x_{0}, y_{0})$ if $f(x, y) \\leq f(x_{0}, y_{0})$ for all $(x, y)$ in an open disc containing $(x_{0}, y_{0})$.',
        source: src('ch4-4.3.1-relative'),
      },
      {
        type: 'paragraph',
        text: 'To locate relative extreme of $f$, we can investigate the points at which the gradient of $f$ is $\\mathbf{0}$. Such points are called critical points of $f$.',
        source: src('ch4-4.3.1-critical-intro'),
      },
      {
        type: 'definition',
        term: 'Definition of Critical Point',
        text: 'Let $f$ be defined on an open region $R$ containing $(x_{0}, y_{0})$. The point $(x_{0}, y_{0})$ is a critical point of $f$ if one of the following is true.\n1. $f_{x}(x_{0}, y_{0}) = 0$ and $f_{y}(x_{0}, y_{0}) = 0$.\n2. $f_{x}(x_{0}, y_{0})$ and $f_{y}(x_{0}, y_{0})$ does not exist.',
        source: src('ch4-4.3.1-critical'),
      },
      {
        type: 'theorem',
        label: 'Theorem 4.3.2',
        text: 'If $f$ has a relative extremum at $(x_{0}, y_{0})$ on an open region $R$, then $(x_{0}, y_{0})$ is a critical point of $f$.',
        source: src('ch4-thm-4.3.2'),
      },
    ]),
    step('worked-example', 'Examples 4.3.1 and 4.3.2', [
      {
        type: 'workedExample',
        title: 'Example 4.3.1',
        prompt: 'Determine the relative extrema of $f(x, y) = 2x^{2} + y^{2} + 8x - 6y + 20$.',
        problemTex: 'f(x, y) = 2x^{2} + y^{2} + 8x - 6y + 20',
        method: 'Critical points, then completing the square',
        steps: [
          {
            explanation:
              'Begin by finding the critical points of $f$. Because $f_{x}(x, y) = 4x + 8$ and $f_{y}(x, y) = 2y - 6$ are defined for all $x$ and $y$, the only critical points are those for which both first partial derivatives are $0$. To locate these points, let $f_{x}(x, y)$ and $f_{y}(x, y)$ be $0$, and solve the system of equations',
            tex: '4x + 8 = 0 \\quad \\text{and} \\quad 2y - 6 = 0',
          },
          {
            explanation:
              'to obtain the critical point $(-2, 3)$. By completing the square, we can conclude that for all $(x, y) \\neq (-2, 3)$,',
            tex: 'f(x, y) = 2(x + 2)^{2} + (y - 3)^{2} + 3 > 3.',
          },
          {
            explanation:
              'Therefore, a relative minimum of $f$ occurs at $(-2, 3)$. The value of the relative minimum is',
            tex: 'f(-2, 3) = 3.',
          },
        ],
        resultTex: '\\text{relative minimum } f(-2, 3) = 3',
        source: src('ch4-ex-4.3.1'),
        covers: ['ch4-sol-4.3.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'paragraph',
        text: 'The above example shows a relative minimum occurring at one type of critical point, the type for which both $f_{x}(x, y)$ and $f_{y}(x, y)$ are $0$. The next example concerns a relative maximum that occurs at the other type of critical point, the type for which either $f_{x}(x, y)$ or $f_{y}(x, y)$ is undefined.',
        source: src('ch4-4.3.1-two-types'),
      },
      {
        type: 'workedExample',
        title: 'Example 4.3.2',
        prompt: 'Determine the relative extrema of $f(x, y) = 1 - (x^{2} + y^{2})^{\\frac{1}{3}}$.',
        problemTex: 'f(x, y) = 1 - (x^{2} + y^{2})^{\\frac{1}{3}}',
        method: 'A critical point where the partial derivatives are undefined',
        steps: [
          {
            explanation: 'Because',
            tex: 'f_{x}(x, y) = -\\frac{2x}{3(x^{2} + y^{2})^{\\frac{2}{3}}} \\quad \\text{and} \\quad f_{y}(x, y) = -\\frac{2y}{3(x^{2} + y^{2})^{\\frac{2}{3}}}',
          },
          {
            explanation:
              'it follows that both partial derivatives are defined for all points in the $xy$-plane except for $(0, 0)$. Moreover, because the partial derivatives cannot both be $0$ unless both $x$ and $y$ are $0$, we can conclude that $(0, 0)$ is the only critical point. Note that $f(0, 0) = 1$, for all other $(x, y)$ it is clear that',
            tex: 'f(x, y) = 1 - (x^{2} + y^{2})^{\\frac{1}{3}} < 1.',
          },
          { explanation: 'Therefore, $f$ has a relative maximum at $(0, 0)$.' },
        ],
        resultTex: '\\text{relative maximum at } (0, 0)',
        source: src('ch4-ex-4.3.2'),
        covers: ['ch4-sol-4.3.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    ...laterSteps(PDA_UNITS.criticalPoints),
  ],
};
