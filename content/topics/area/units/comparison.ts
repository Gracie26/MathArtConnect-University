import type { LearningUnitDefinition } from '../../../types';
import { FIGURE_2_16 } from '../figures';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, figure, laterSteps, practiseStep, src, step } from '../steps';

/** Source: §2.5.3 A Comparison Test for Improper Integrals (printed pages 40–42). */
export const comparisonTest: LearningUnitDefinition = {
  id: AREA_UNITS.comparison,
  slug: 'comparison-test',
  title: 'Comparison Test for Improper Integrals',
  summary: 'Decide convergence without the exact value, by comparing with a simpler function.',
  glyph: 'match',
  tone: 'amber',
  source: [ch2('2.5.3', 40), ch2('2.5.3', 42)],
  steps: [
    step('concept', 'A Comparison Test for Improper Integrals', [
      {
        type: 'paragraph',
        text: 'Sometimes it is impossible to find the exact value of an improper integral and yet it is important to know whether it is convergent or divergent. In such cases, we shall employ the following theorem. Although it is stated for Type I integrals, a similar theorem is true for Type II integrals.',
        source: src('ch2-2.5.3-intro'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.5.1',
        title: 'Comparison Theorem',
        text: 'Suppose that $f$ and $g$ are continuous functions with $f(x) \\ge g(x) \\ge 0$ for $x \\ge a$. (a) If $\\int_{a}^{\\infty} f(x)\\,dx$ is convergent, then $\\int_{a}^{\\infty} g(x)\\,dx$ is convergent. (b) If $\\int_{a}^{\\infty} g(x)\\,dx$ is divergent, then $\\int_{a}^{\\infty} f(x)\\,dx$ is divergent.',
        source: src('ch2-thm-2.5.1'),
      },
      {
        type: 'paragraph',
        text: 'We omit the proof of the Comparison theorem. However, Figure 2.15 below makes it seem plausible.',
        source: src('ch2-2.5.3-proof-omitted'),
      },
      figure('ch2-fig-2.15'),
      {
        type: 'paragraph',
        text: 'If the area under the top curve $y = f(x)$ is finite, then so is the area under the bottom curve $y = g(x)$. And if the area under $y = g(x)$ is infinite, then so is the area under $y = f(x)$.',
        source: src('ch2-2.5.3-plausible'),
      },
      {
        type: 'callout',
        tone: 'caution',
        title: 'Remark 2.5.4',
        text: 'Note that the converse is not necessarily true, that is, (a) if $\\int_{a}^{\\infty} g(x)\\,dx$ is convergent, then $\\int_{a}^{\\infty} f(x)\\,dx$ may or may not be convergent, and (b) if $\\int_{a}^{\\infty} f(x)\\,dx$ is divergent, then $\\int_{a}^{\\infty} g(x)\\,dx$ may or may not be divergent.',
        source: src('ch2-rem-2.5.4'),
      },
    ]),
    step('worked-example', 'Using the Comparison Theorem', [
      {
        type: 'workedExample',
        title: 'Example 2.5.3',
        prompt: 'Show that $\\int_{0}^{\\infty} e^{-x^{2}}\\,dx$ is convergent.',
        problemTex: '\\int_{0}^{\\infty} e^{-x^{2}}\\,dx',
        method: 'Split at 1, then the Comparison Theorem',
        figure: FIGURE_2_16,
        steps: [
          {
            explanation:
              'Here, we cannot evaluate the integral directly since the anti-derivative of $e^{-x^{2}}$ is not an elementary function. We write',
            tex: '\\int_{0}^{\\infty} e^{-x^{2}}\\,dx = \\int_{0}^{1} e^{-x^{2}}\\,dx + \\int_{1}^{\\infty} e^{-x^{2}}\\,dx',
          },
          {
            explanation:
              'and observe that the first integral on the right-hand side is just an ordinary definite integral. For the second integral $\\int_{1}^{\\infty} e^{-x^{2}}\\,dx$, we use the fact that for $x \\ge 1$, we have',
            tex: 'x^{2} \\ge x \\Rightarrow -x^{2} \\le -x \\quad \\text{and} \\quad e^{-x^{2}} \\le e^{-x}. \\quad \\text{(See Figure 2.16).}',
          },
          {
            explanation: 'The integral of $e^{-x}$ is easy to evaluate:',
            tex: '\\int_{1}^{\\infty} e^{-x}\\,dx = \\lim_{t \\to \\infty} \\int_{1}^{t} e^{-x}\\,dx = \\lim_{t \\to \\infty} -e^{-x}\\Big|_{1}^{t} = \\lim_{t \\to \\infty} \\left(\\frac{1}{e} - \\frac{1}{e^{t}}\\right) = \\frac{1}{e}.',
          },
          {
            explanation:
              'Thus, by the Comparison Theorem, we can conclude that $\\int_{1}^{\\infty} e^{-x^{2}}\\,dx$ is convergent. Therefore, $\\int_{0}^{\\infty} e^{-x^{2}}\\,dx$ is convergent since both $\\int_{0}^{1} e^{-x^{2}}\\,dx$ and $\\int_{1}^{\\infty} e^{-x^{2}}\\,dx$ are convergent.',
          },
        ],
        resultTex: '\\int_{0}^{\\infty} e^{-x^{2}}\\,dx \\text{ is convergent}',
        source: src('ch2-ex-2.5.3'),
        covers: ['ch2-sol-2.5.3-split', 'ch2-fig-2.16', 'ch2-sol-2.5.3-end'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    exploreStep(AREA_UNITS.comparison),
    practiseStep(AREA_UNITS.comparison),
    ...laterSteps(AREA_UNITS.comparison),
  ],
};
