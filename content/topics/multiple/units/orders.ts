import type { LearningUnitDefinition } from '../../../types';
import { FIGURE_5_2, FIGURE_5_3, REGION_5_1_3_MATH } from '../figures';
import { MI_UNITS } from '../ids';
import { ch5 } from '../sources';
import { appGuidance, laterSteps, readingNote, src, step } from '../steps';

/** Source: §5.1.1 (printed pages 64–66). Practice: Tutorial 6 Q3, Q4, Q10–Q17, Q26 and Q27. */
export const orders: LearningUnitDefinition = {
  id: MI_UNITS.orders,
  slug: 'orders-of-integration',
  title: 'Comparing Different Orders of Integration',
  summary: 'Describe one region in two ways, with horizontal or vertical strips, and choose the easier order.',
  glyph: 'match',
  tone: 'blue',
  source: [ch5('5.1.1', 64)],
  steps: [
    step('concept', 'Two orders, one region', [
      appGuidance(
        '§5.1.1 is taught through Example 5.1.3. The method it uses: read the region from the given limits (the inner limits are the curves at the ends of a strip, the outer limits are where the strips start and stop), sketch it, then place a strip in the other direction and read the new limits from it. By §5.1, the order affects the ease of integration but not the value.',
      ),
      appGuidance(
        'A horizontal strip (height $\\Delta y$) gives the order $dx\\,dy$: $x$ runs between the left and right boundaries, written in terms of $y$. A vertical strip (width $\\Delta x$) gives the order $dy\\,dx$: $y$ runs between the lower and upper boundaries, written in terms of $x$.',
      ),
    ]),
    step(
      'see-it',
      'See it',
      [
        { type: 'figure', figure: REGION_5_1_3_MATH },
        appGuidance(
          'The same region as Figures 5.2 and 5.3, in Math View. Left: a horizontal strip from the curve $x = y^{2}$ to the line $x = 4$, so $y^{2} \\le x \\le 4$ for $0 \\le y \\le 2$. Right: a vertical strip from the $x$-axis up to $y = \\sqrt{x}$, so $0 \\le y \\le \\sqrt{x}$ for $0 \\le x \\le 4$. The corners $(0, 0)$, $(4, 0)$ and $(4, 2)$ are where the boundaries meet.',
        ),
      ],
      { required: false },
    ),
    step('worked-example', 'Examples 5.1.3 to 5.1.5', [
      {
        type: 'workedExample',
        title: 'Example 5.1.3',
        prompt:
          'Sketch the region whose area is represented by the integral $\\int_{0}^{2}\\int_{y^{2}}^{4} dx\\,dy$. Then find another iterated integral using the order $dy\\,dx$ to represent the area, and show that both integrals yield the same value.',
        problemTex: '\\int_{0}^{2}\\int_{y^{2}}^{4} dx\\,dy',
        method: 'Reversing the order of integration',
        steps: [
          {
            explanation:
              'From the given limits of integration, we know that $y^{2} \\le x \\le 4$ (inner limits of integration), which means that the region $R$ is bounded on the left by the parabola $x = y^{2}$ and on the right by the line $x = 4$ (Figure 5.2). Furthermore, because $0 \\le y \\le 2$ (outer limits of integration), we know that $R$ bounded below by the $x$-axis. The value of this integral is',
            tex: '\\int_{0}^{2}\\int_{y^{2}}^{4} dx\\,dy = \\int_{0}^{2} x\\Big]_{y^{2}}^{4} dy = \\int_{0}^{2}(4 - y^{2})\\,dy = \\left[4y - \\frac{y^{3}}{3}\\right]_{0}^{2} = \\frac{16}{3}.',
          },
          {
            explanation:
              'To change the order of integration to $dy\\,dx$, place a vertical rectangle in the region. From this we can see that the constant bounds $0 \\le x \\le 4$ serve as the outer limits of integration. By solving for $y$ in the equation $x = y^{2}$, we can conclude that the inner bounds are $0 \\le y \\le \\sqrt{x}$. Therefore, the area of the region can be represented by',
            tex: '\\int_{0}^{4}\\int_{0}^{\\sqrt{x}} dy\\,dx.',
          },
          {
            explanation:
              'By evaluating this integral, we can see that it has the same value as the original integral (Figure 5.3).',
            tex: '\\int_{0}^{4}\\int_{0}^{\\sqrt{x}} dy\\,dx = \\int_{0}^{4} y\\Big]_{0}^{\\sqrt{x}} dx = \\int_{0}^{4}\\sqrt{x}\\,dx = \\frac{2}{3}x^{\\frac{3}{2}}\\Big]_{0}^{4} = \\frac{16}{3}.',
          },
        ],
        resultTex:
          '\\int_{0}^{2}\\int_{y^{2}}^{4} dx\\,dy = \\int_{0}^{4}\\int_{0}^{\\sqrt{x}} dy\\,dx = \\frac{16}{3}',
        source: src('ch5-ex-5.1.3'),
        covers: ['ch5-sol-5.1.3', 'ch5-fig-5.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
        figure: FIGURE_5_2,
      },
      { type: 'figure', figure: FIGURE_5_3, source: src('ch5-fig-5.3') },
      {
        type: 'workedExample',
        title: 'Example 5.1.4',
        prompt:
          'Express $\\int_{0}^{4}\\int_{\\frac{x}{2}}^{2} e^{y^{2}}\\,dy\\,dx$ as an iterated integral with order of integration reversed and evaluate.',
        problemTex: '\\int_{0}^{4}\\int_{\\frac{x}{2}}^{2} e^{y^{2}}\\,dy\\,dx',
        method: 'Reversing the order of integration',
        steps: [
          {
            explanation:
              'From the given limits of integration we see that, for a fixed $x$, $y$ varies from $y = \\frac{x}{2}$ to $y = 2$ and $x$ varies from $x = 0$ to $x = 4$. We can also describe the region as, for $y$ fixed, $x$ varies from $x = 0$ to $x = 2y$ and $y$ varies from $y = 0$ to $y = 2$. The corresponding iterated integral is $\\int_{0}^{2}\\int_{0}^{2y} e^{y^{2}}\\,dx\\,dy$. Solving, we have',
            tex: '\\int_{0}^{2}\\int_{0}^{2y} e^{y^{2}}\\,dx\\,dy = \\int_{0}^{2} xe^{y^{2}}\\Big]_{x=0}^{x=2y} dy = \\int_{0}^{2} 2ye^{y^{2}}\\,dy = e^{y^{2}}\\Big]_{0}^{2} = e^{4} - 1.',
          },
        ],
        resultTex: 'e^{4} - 1',
        source: src('ch5-ex-5.1.4'),
        covers: ['ch5-sol-5.1.4'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'workedExample',
        title: 'Example 5.1.5',
        prompt: 'Evaluate $\\int_{0}^{2}\\int_{\\frac{y}{2}}^{1} ye^{x^{3}}\\,dx\\,dy$.',
        problemTex: '\\int_{0}^{2}\\int_{\\frac{y}{2}}^{1} ye^{x^{3}}\\,dx\\,dy',
        method: 'Reversing the order of integration',
        steps: [
          {
            explanation:
              'We cannot integrate first with respect to $x$, as indicated, because it happens that $e^{x^{3}}$ has no elementary anti-derivative. So we try to evaluate the integral by first reversing the order of integration.',
            tex: '\\int_{0}^{2}\\int_{\\frac{y}{2}}^{1} ye^{x^{3}}\\,dx\\,dy = \\int_{0}^{1}\\int_{0}^{2x} ye^{x^{3}}\\,dy\\,dx = \\int_{0}^{1}\\frac{1}{2}y^{2}\\Big]_{0}^{2} xe^{x^{3}}\\,dx',
          },
          {
            explanation: '',
            tex: '= \\int_{0}^{1} 2x^{2}e^{x^{3}}\\,dx = \\frac{2}{3}e^{x^{3}}\\Big]_{0}^{1} = \\frac{2}{3}(e - 1).',
          },
        ],
        resultTex: '\\frac{2}{3}(e - 1)',
        source: src('ch5-ex-5.1.5'),
        covers: ['ch5-sol-5.1.5'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      readingNote(
        'In the first line of the working the bracket is printed as $\\frac{1}{2}y^{2}\\Big]_{0}^{2} xe^{x^{3}}$. Integrating $ye^{x^{3}}$ with respect to $y$ from $0$ to $2x$ gives $\\frac{1}{2}y^{2}\\Big]_{0}^{2x}e^{x^{3}} = 2x^{2}e^{x^{3}}$, which is the next printed line; the final answer $\\frac{2}{3}(e - 1)$ is correct.',
      ),
    ]),
    ...laterSteps(MI_UNITS.orders),
  ],
};
