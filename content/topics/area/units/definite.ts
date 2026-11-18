import type { LearningUnitDefinition } from '../../../types';
import { APP_EXAMPLE_2_2_1, APP_EXAMPLE_2_2_2, APP_EXAMPLE_2_2_3, APP_MIDPOINTS } from '../figures';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, illustration, laterSteps, practiseStep, src, step, tryItStep } from '../steps';

/** Source: §2.2.1 The Definite Integral, including the Mid-point Rule (printed pages 27–30). */
export const theDefiniteIntegral: LearningUnitDefinition = {
  id: AREA_UNITS.definite,
  slug: 'the-definite-integral',
  title: 'The Definite Integral',
  summary: 'The definite integral as a limit of Riemann sums, evaluated with sums of powers, and the Mid-point Rule.',
  glyph: 'practice',
  tone: 'teal',
  source: [ch2('2.2.1', 27), ch2('2.2.1', 30)],
  steps: [
    step('concept', 'The definite integral', [
      {
        type: 'paragraph',
        text: 'The geometric problems that motivated the development of the integral calculus (determination of lengths, areas, and volumes) arose in the ancient civilizations of Northern Africa. Where solutions were found, they related to concrete problems such as the measurement of a quantity of grain. Greek philosophers took a more abstract approach. In fact, Eudoxus (around 400 B.C.) and Archimedes (250 B.C.) formulated ideas of integration as we know it today. Integral calculus developed independently, and without an obvious connection to differential calculus. The calculus became a “whole” in the last part of the seventeenth century when Isaac Barrow, Isaac Newton, and Gottfried Wilhelm Leibniz (with help from others) discovered that the integral of a function could be found by asking what was differentiated to obtain that function.',
        source: src('ch2-2.2.1-history'),
      },
      {
        type: 'definition',
        term: 'Definition 2.2.4',
        text: 'Let $f$ be a function defined on a closed interval $[a, b]$. Then the definite integral of $f$ from $a$ to $b$, denoted by $\\int_{a}^{b} f(x)\\,dx$, is defined to be',
        tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_{i}^{\\ast})\\Delta x',
        source: src('ch2-def-2.2.4'),
      },
      {
        type: 'definition',
        term: 'Integrable; limits of integration; sample point',
        text: 'If the limit exists, then the function $f$ is said to be Riemann integrable or simply integrable on the interval $[a, b]$. The numbers $a$ and $b$ are called the lower and upper limits of integration, respectively and $x_{i}^{\\ast}$ is a sample point in the $i$th subinterval $[x_{i-1}, x_{i}]$.',
        source: src('ch2-2.2.1-terms'),
      },
      {
        type: 'paragraph',
        text: 'If $f$ is integrable on $[a, b]$, then the limit in Definition 2.2.4 exists and gives the same value no matter how we choose the sample points $x_{i}^{\\ast}$. To simplify the calculation of the integral we often take the sample points to be right endpoints. Then $x_{i}^{\\ast} = x_{i}$ and the definition of an integral simplifies as follows.',
        source: src('ch2-2.2.1-sample-choice'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.2.1',
        text: 'If $f$ is integrable on $[a, b]$, then',
        tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_{i})\\Delta x',
        textAfter: 'where $\\Delta x = \\frac{b-a}{n}$ and $x_{i} = a + i\\Delta x$.',
        source: src('ch2-thm-2.2.1'),
      },
      {
        type: 'formulaList',
        title: 'Sums of powers of positive integers',
        items: [
          { tex: '(1)\\quad \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', source: src('ch2-2.2.1-power-sums') },
          { tex: '(2)\\quad \\sum_{i=1}^{n} i^{2} = \\frac{n(n+1)(2n+1)}{6}' },
          { tex: '(3)\\quad \\sum_{i=1}^{n} i^{3} = \\left[\\frac{n(n+1)}{2}\\right]^{2}' },
        ],
        source: src('ch2-2.2.1-power-sums'),
      },
    ]),
    step('worked-example', 'Evaluating integrals as limits of Riemann sums', [
      {
        type: 'workedExample',
        title: 'Example 2.2.1',
        prompt: 'Evaluate $\\int_{0}^{1} 2x\\,dx$ by calculating the limit of the Riemann Sums.',
        problemTex: '\\int_{0}^{1} 2x\\,dx',
        method: 'Limit of Riemann sums with right endpoints',
        figure: APP_EXAMPLE_2_2_1,
        steps: [
          {
            explanation: 'First divide the interval $[0, 1]$ into $n$ subintervals of equal length,',
            tex: '\\Delta x = \\frac{b-a}{n} = \\frac{1-0}{n} = \\frac{1}{n}.',
          },
          { explanation: 'Therefore,', tex: 'x_{i} = a + i\\Delta x = 0 + i\\cdot\\frac{1}{n} = \\frac{i}{n}.' },
          {
            explanation: 'The $n$th Riemann Sum is',
            tex: '\\sum_{i=1}^{n} f(x_{i})\\Delta x = \\sum_{i=1}^{n} f\\left(\\frac{i}{n}\\right)\\Delta x = \\sum_{i=1}^{n} 2\\left(\\frac{i}{n}\\right)\\Delta x = \\sum_{i=1}^{n} 2\\left(\\frac{i}{n}\\right)\\left(\\frac{1}{n}\\right) = \\sum_{i=1}^{n} \\frac{2}{n^{2}}i',
          },
          {
            explanation:
              'Inside the summation, $\\frac{2}{n^{2}}$ does not involve $i$, and so you can pull it outside the summation.',
            tex: '\\sum_{i=1}^{n} \\frac{2}{n^{2}}i = \\frac{2}{n^{2}}\\sum_{i=1}^{n} i = \\frac{2}{n^{2}}\\left[\\frac{n(n+1)}{2}\\right] = \\frac{2n^{2} + 2n}{2n^{2}} = 1 + \\frac{1}{n}.',
          },
          {
            explanation: 'Finally, you can find the limit of the Riemann Sums:',
            tex: '\\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_{i})\\Delta x = \\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right) = 1.',
          },
        ],
        resultTex: '\\int_{0}^{1} 2x\\,dx = 1',
        source: src('ch2-ex-2.2.1'),
        covers: ['ch2-sol-2.2.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'workedExample',
        title: 'Example 2.2.2',
        prompt:
          'Evaluate $\\int_{-1}^{2} \\left[(x-1)^{2} + 2\\right]dx$ by calculating the limit of the Riemann Sums.',
        problemTex: '\\int_{-1}^{2} \\left[(x-1)^{2} + 2\\right]dx',
        method: 'Limit of Riemann sums with right endpoints',
        figure: APP_EXAMPLE_2_2_2,
        steps: [
          {
            explanation: 'Divide $[-1, 2]$ as follows',
            tex: '\\Delta x = \\frac{2-(-1)}{n} = \\frac{3}{n}, \\quad \\text{then } x_{i} = a + i\\Delta x = -1 + \\frac{3i}{n}.',
          },
          {
            explanation: 'Then, the $n$th Riemann Sum is',
            tex: '\\sum_{i=1}^{n} f(x_{i})\\Delta x = \\sum_{i=1}^{n} f\\left(-1 + \\frac{3i}{n}\\right)\\cdot\\frac{3}{n} = \\sum_{i=1}^{n} \\left[\\left(-1 + \\frac{3i}{n} - 1\\right)^{2} + 2\\right]\\cdot\\frac{3}{n}',
          },
          {
            explanation: '',
            tex: '= \\sum_{i=1}^{n} \\left[\\left(\\frac{3i}{n} - 2\\right)^{2} + 2\\right]\\cdot\\frac{3}{n} = \\sum_{i=1}^{n} \\left[\\frac{9i^{2}}{n^{2}} - \\frac{12i}{n} + 4 + 2\\right]\\cdot\\frac{3}{n}',
          },
          {
            explanation: '',
            tex: '= \\sum_{i=1}^{n} \\left[\\frac{27}{n^{3}}i^{2} - \\frac{36}{n^{2}}i + \\frac{18}{n}\\right] = \\frac{27}{n^{3}}\\sum_{i=1}^{n} i^{2} - \\frac{36}{n^{2}}\\sum_{i=1}^{n} i + \\frac{18}{n}\\sum_{i=1}^{n} 1',
          },
          {
            explanation: '',
            tex: '= \\frac{27}{n^{3}}\\left[\\frac{n(n+1)(2n+1)}{6}\\right] - \\frac{36}{n^{2}}\\left[\\frac{n(n+1)}{2}\\right] + \\frac{18}{n}(n) = \\frac{9(n+1)(2n+1)}{2n^{2}} - \\frac{18(n+1)}{n} + 18.',
          },
          {
            explanation: 'The area is the limit of the Riemann Sum',
            tex: '\\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_{i})\\Delta x = \\lim_{n \\to \\infty} \\left[\\frac{9(n+1)(2n+1)}{2n^{2}} - \\frac{18(n+1)}{n} + 18\\right] = 9 - 18 + 18 = 9.',
          },
        ],
        resultTex: '\\int_{-1}^{2} \\left[(x-1)^{2} + 2\\right]dx = 9',
        source: src('ch2-ex-2.2.2'),
        covers: ['ch2-sol-2.2.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    tryItStep(AREA_UNITS.definite),
    step(
      'see-it',
      'The Mid-point Rule',
      [
        {
          type: 'paragraph',
          text: 'We often choose the sample point $x_{i}^{\\ast}$ to be the right endpoint of the $i$th subinterval because it is convenient for computing the limit. But if the purpose is to find an approximation to an integral, it is usually better to choose $x_{i}^{\\ast}$ to be the midpoint of the interval, which we denote by $\\bar{x}_{i}$. Any Riemann sum is an approximation to an integral, but if we use midpoints we get the following approximation.',
          source: src('ch2-2.2.1-midpoint-better'),
        },
        {
          type: 'formula',
          title: 'Mid-point Rule',
          tex: '\\int_{a}^{b} f(x)\\,dx \\approx \\sum_{i=1}^{n} f(\\bar{x}_{i})\\Delta x = \\Delta x\\left[f(\\bar{x}_{1}) + \\cdots + f(\\bar{x}_{n})\\right]',
          source: src('ch2-midpoint-rule'),
        },
        {
          type: 'paragraph',
          text: 'where $\\Delta x = \\frac{b-a}{n}$ and $\\bar{x}_{i} = \\frac{1}{2}(x_{i-1} + x_{i})$ is the midpoint of $[x_{i-1}, x_{i}]$.',
          source: src('ch2-midpoint-rule'),
        },
        illustration(APP_MIDPOINTS),
        {
          type: 'callout',
          tone: 'insight',
          title: 'Building the midpoint rectangles',
          text: 'Find $\\Delta x$, list the endpoints $x_{0}, x_{1}, \\ldots, x_{n}$, take the middle of each subinterval, $\\bar{x}_{i} = \\frac{1}{2}(x_{i-1} + x_{i})$, evaluate $f$ there, add the heights and multiply by $\\Delta x$.',
        },
        {
          type: 'workedExample',
          title: 'Example 2.2.3',
          prompt: 'Use the Midpoint Rule with $n = 4$ to approximate $\\int_{0}^{2} e^{x}\\,dx$.',
          problemTex: '\\int_{0}^{2} e^{x}\\,dx',
          method: 'Mid-point Rule',
          figure: APP_EXAMPLE_2_2_3,
          steps: [
            {
              explanation:
                'The endpoints of the four subintervals are $0, 0.5, 1.0, 1.5$ and $2.0$, so the midpoints are',
              tex: '\\bar{x}_{1} = 0.25, \\quad \\bar{x}_{2} = 0.75, \\quad \\bar{x}_{3} = 1.25 \\quad \\text{and} \\quad \\bar{x}_{4} = 1.75.',
            },
            {
              explanation:
                'The width of the subintervals is $\\Delta x = (2-0)/4 = 1/2 = 0.5$. Thus, the Midpoint Rule gives',
              tex: '\\int_{0}^{2} e^{x}\\,dx \\approx \\Delta x\\left[f(\\bar{x}_{1}) + f(\\bar{x}_{2}) + f(\\bar{x}_{3}) + f(\\bar{x}_{4})\\right]',
            },
            {
              explanation: '',
              tex: '= \\Delta x\\left[e^{\\bar{x}_{1}} + e^{\\bar{x}_{2}} + e^{\\bar{x}_{3}} + e^{\\bar{x}_{4}}\\right]',
            },
            { explanation: '', tex: '= 0.5[1.284025417 + 2.117000017 + 3.490342957 + 5.754602676]' },
            { explanation: '', tex: '= 0.5[12.64597107] = 6.322985534.' },
          ],
          resultTex: '\\int_{0}^{2} e^{x}\\,dx \\approx 6.322985534',
          source: src('ch2-ex-2.2.3'),
          covers: ['ch2-sol-2.2.3'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
      ],
      { key: 'midpoint-rule' },
    ),
    exploreStep(AREA_UNITS.definite),
    practiseStep(AREA_UNITS.definite),
    ...laterSteps(AREA_UNITS.definite),
  ],
};
