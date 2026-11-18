import type { LearningUnitDefinition } from '../../../types';
import { BASE_5_2_1_MATH } from '../figures';
import { MI_UNITS } from '../ids';
import { ch5 } from '../sources';
import { appGuidance, laterSteps, readingNote, src, step } from '../steps';

/** Source: §5.2 and §5.2.1 (printed pages 67–68). Practice: Tutorial 6 Q5–Q9. */
export const doubleVolume: LearningUnitDefinition = {
  id: MI_UNITS.doubleVolume,
  slug: 'double-integrals-volume',
  title: 'Double Integrals and Volume',
  summary: 'A double integral is a limit of sums f(xᵢ, yᵢ)ΔxᵢΔyᵢ; when f ≥ 0 it is the volume of a solid.',
  glyph: 'wave',
  tone: 'amber',
  source: [ch5('5.2.1', 67)],
  steps: [
    step('concept', 'Double integrals and volume', [
      {
        type: 'definition',
        term: 'Definition of Double Integral',
        text: 'If $f$ is defined on a closed, bounded region $R$ in the $xy$-plane, then the double integral of $f$ over $R$ is given by',
        tex: '\\iint_{R} f(x, y)\\,dA = \\lim_{|\\Delta| \\to 0}\\sum_{i=1}^{n} f(x_{i}, y_{i})\\Delta x_{i}\\Delta y_{i}',
        source: src('ch5-def-double'),
      },
      {
        type: 'paragraph',
        text: 'provided the limit exists. If the limit exists, then $f$ is integrable over $R$.',
        source: src('ch5-def-double'),
      },
      {
        type: 'paragraph',
        text: 'A double integral can be used to find the volume of a solid region that lies between the $xy$-plane and the surface given by $z = f(x, y)$.',
        source: src('ch5-5.2.1-volume-intro'),
      },
      {
        type: 'definition',
        term: 'Volume of a Solid Region',
        text: 'If $f$ is integrable over a plane region $R$ and $f(x, y) \\ge 0$ for all $(x, y)$ in $R$, then the volume of the solid region that lies above $R$ and below the graph of $f$ is defined as',
        tex: 'V = \\iint_{R} f(x, y)\\,dA.',
        source: src('ch5-def-volume'),
      },
      appGuidance(
        'Reading the definition: split $R$ into small rectangles of sides $\\Delta x_{i}$ and $\\Delta y_{i}$, choose a point $(x_{i}, y_{i})$ in each, and stand a column of height $f(x_{i}, y_{i})$ on it. Each column has volume $f(x_{i}, y_{i})\\Delta x_{i}\\Delta y_{i}$; the sum of the columns approaches the double integral as the rectangles shrink. Volume Builder in Explore lets you do this.',
      ),
    ]),
    step(
      'see-it',
      'See it',
      [
        { type: 'figure', figure: BASE_5_2_1_MATH },
        appGuidance(
          'The notes print no figure for §5.2. This drawing shows the base $R$ of the solid in Example 5.2.1 in Math View; above each point $(x, y)$ of $R$ the solid reaches the height $z = e^{-x^{2}}$.',
        ),
      ],
      { required: false },
    ),
    step('worked-example', 'Example 5.2.1', [
      {
        type: 'workedExample',
        title: 'Example 5.2.1',
        prompt:
          'Find the volume of the solid region $R$ bounded by the surface $f(x, y) = e^{-x^{2}}$ and the planes $y = 0$, $y = x$ and $x = 1$.',
        problemTex: 'f(x, y) = e^{-x^{2}}; \\quad y = 0, \\; y = x, \\; x = 1',
        method: 'Volume as a double integral',
        steps: [
          {
            explanation:
              'The base of $R$ in the $xy$-plane is bounded by the lines $y = 0$, $x = 1$ and $y = x$. The two possible orders of integration are',
            tex: '\\int_{0}^{1}\\int_{0}^{x} e^{-x^{2}}\\,dy\\,dx \\quad \\text{and} \\quad \\int_{0}^{1}\\int_{y}^{1} e^{-x^{2}}\\,dx\\,dy.',
          },
          {
            explanation:
              'By setting up the corresponding iterated integrals, we can see that the order $dx\\,dy$ requires the anti-derivative $\\int e^{-x^{2}}dx$, which is not an elementary function. On the other hand, the order $dy\\,dx$ produces the integral',
            tex: '\\int_{1}^{0}\\int_{0}^{x} e^{-x^{2}}\\,dy\\,dx = \\int_{0}^{1} e^{-x^{2}}y\\Big]_{0}^{x} dx = \\int_{0}^{1} xe^{-x^{2}}\\,dx = -\\frac{1}{2}e^{-x^{2}}\\Big]_{0}^{1}',
          },
          {
            explanation: '',
            tex: '= -\\frac{1}{2}\\left(\\frac{1}{e} - 1\\right) = \\frac{e - 1}{2e} = 0.316.',
          },
        ],
        resultTex: 'V = \\frac{e - 1}{2e} = 0.316',
        source: src('ch5-ex-5.2.1'),
        covers: ['ch5-sol-5.2.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      readingNote(
        'The first integral of the last part is printed $\\int_{1}^{0}$; the working that follows uses $\\int_{0}^{1}$, which is what gives $\\frac{e - 1}{2e}$. To more decimal places, $\\frac{e - 1}{2e} \\approx 0.31606$.',
      ),
    ]),
    ...laterSteps(MI_UNITS.doubleVolume),
  ],
};
