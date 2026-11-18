import type { LearningUnitDefinition } from '../../../types';
import { APP_LEFT_ENDPOINTS } from '../figures';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, figure, illustration, laterSteps, practiseStep, reviewOf, src, step } from '../steps';

/** Source: chapter introduction, §2.1 and §2.2 (printed pages 23–27). */
export const areaAndRiemannSums: LearningUnitDefinition = {
  id: AREA_UNITS.riemann,
  slug: 'area-and-riemann-sums',
  title: 'Area Under a Graph and Riemann Sums',
  summary:
    'The area problem, and approximating an area by rectangles: right endpoints, left endpoints and sample points.',
  glyph: 'function-art',
  tone: 'blue',
  source: [ch2('2.1', 23), ch2('2.2', 24)],
  steps: [
    step('concept', 'Integration as area', [
      {
        type: 'callout',
        tone: 'insight',
        title: 'Chapter 2: Integration as a Process of Finding the Area Under the Graph',
        text: 'This topic follows Chapter 2 of the course notes.',
        source: src('ch2-title'),
      },
      {
        type: 'paragraph',
        text: 'In this section, we now consider the other viewpoint of integration, that of the area under the graph of a function. This idea leads to the concept of definite integration. We shall see that the concept of definite integration gives us a method of evaluating limits of sequences whose terms are made up of sums.',
        source: src('ch2-intro-area'),
      },
      {
        type: 'paragraph',
        text: 'We shall then show that the two approaches of integration are indeed equivalent. This is done through the Fundamental Theorem of Calculus. Moreover, we shall examine other methods of evaluating definite integrals. Finally, we shall look at improper integrals. These integrals arise because in our definition of definite integrals, we assume that the integrand is bounded and the interval over which integration is done is bounded. Improper integrals have one or more of these assumptions not holding.',
        source: src('ch2-intro-plan'),
      },
      {
        type: 'definition',
        term: '2.1 Area Under a Graph',
        text: 'As the derivative is motivated by the geometric problem of constructing a tangent to a curve, the historical problem leading to the definition of a definite integral is the problem of finding area. Specifically, we are interested in finding the area $A$ of a region bounded between the $x$-axis, the graph of a non-negative function $y = f(x)$ defined on some interval $[a, b]$ and (i) the vertical lines $x = a$ and $x = b$; (ii) the $x$-intercepts of the graph.',
        source: src('ch2-2.1-area-problem'),
      },
      figure('ch2-2.1-figure'),
    ]),
    step(
      'see-it',
      'Riemann sums',
      [
        {
          type: 'paragraph',
          text: 'Thinking integral as area, you can approximate the value of an integral by approximating the area. A Riemann Sum is a sum of areas of rectangles. To estimate $\\int_{a}^{b} f(x)\\,dx$, where $a < b$:',
          source: src('ch2-2.2-riemann-sum'),
        },
        figure('ch2-fig-2.1'),
        {
          type: 'paragraph',
          text: 'First, divide the interval $[a, b]$ into $n$ subintervals, using $x_{0}, x_{1}, x_{2}, \\ldots, x_{n}$ as endpoints for the subintervals (as shown in Figure 2.2),',
          source: src('ch2-2.2-partition'),
        },
        {
          type: 'math',
          tex: 'a = x_{0} < x_{1} < \\cdots < x_{n-1} < x_{n} = b.',
          source: src('ch2-2.2-partition-formula'),
        },
        figure('ch2-fig-2.2'),
        {
          type: 'paragraph',
          text: 'The subintervals are then $[x_{0}, x_{1}], [x_{1}, x_{2}], \\cdots, [x_{n-1}, x_{n}]$.',
          source: src('ch2-2.2-subintervals'),
        },
        {
          type: 'formula',
          title: 'Equal subintervals',
          tex: '\\Delta x = \\frac{b-a}{n}, \\qquad x_{i} = a + i\\Delta x',
          note: 'For simplicity, let the subintervals have the same length Δx.',
          source: src('ch2-2.2-dx'),
        },
        {
          type: 'paragraph',
          text: 'We give three forms of area estimation depending on the choice of the heights of rectangles.',
          source: src('ch2-2.2-three-forms'),
        },
        {
          type: 'definition',
          term: 'CASE I: right endpoints',
          text: 'We first consider approximating the $i$th strip $S_{i}$ by a rectangle with width $\\Delta x$ and height $f(x_{i})$, which is the value of $f$ at the right endpoint (see Figure 2.3).',
          source: src('ch2-2.2-case1'),
        },
        figure('ch2-fig-2.3'),
        {
          type: 'paragraph',
          text: 'Then the area of the $i$th rectangle is $f(x_{i})\\Delta x$. Thus, for this case, the area of $S$ is approximated by the sum of the areas of these rectangles, which is',
          source: src('ch2-2.2-rn'),
        },
        {
          type: 'math',
          tex: 'R_{n} = f(x_{1})\\Delta x + f(x_{2})\\Delta x + \\cdots + f(x_{n})\\Delta x.',
          source: src('ch2-2.2-rn'),
        },
        {
          type: 'definition',
          term: 'Definition 2.2.1',
          text: 'The area $A_{R}$ of the region $S$ that lies under the graph of the continuous function $f$ is the limit of the sum of the areas of approximating rectangles:',
          tex: 'A_{R} = \\lim_{n \\to \\infty} R_{n} = \\lim_{n \\to \\infty} \\left[f(x_{1})\\Delta x + f(x_{2})\\Delta x + \\cdots + f(x_{n})\\Delta x\\right].',
          source: src('ch2-def-2.2.1'),
        },
        {
          type: 'definition',
          term: 'CASE II: left endpoints',
          text: 'Next, we consider approximating the $i$th strip $S_{i}$ by a rectangle with width $\\Delta x$ and height $f(x_{i})$, which is the value of $f$ at the left endpoint. Then the area of the $i$th rectangle is $f(x_{i})\\Delta x$. Thus, for this case, the area of $S$ is approximated by the sum of the areas of these rectangles, which is',
          source: src('ch2-2.2-case2'),
          ...reviewOf('ch2-2.2-case2'),
        },
        {
          type: 'math',
          tex: 'L_{n} = f(x_{0})\\Delta x + f(x_{1})\\Delta x + \\cdots + f(x_{n-1})\\Delta x.',
          source: src('ch2-2.2-ln'),
        },
        illustration(APP_LEFT_ENDPOINTS),
        {
          type: 'definition',
          term: 'Definition 2.2.2',
          text: 'The area $A_{L}$ of the region $S$ that lies under the graph of the continuous function $f$ is the limit of the sum of the areas of approximating rectangles:',
          tex: 'A_{L} = \\lim_{n \\to \\infty} L_{n} = \\lim_{n \\to \\infty} \\left[f(x_{0})\\Delta x + f(x_{1})\\Delta x + \\cdots + f(x_{n-1})\\Delta x\\right].',
          source: src('ch2-def-2.2.2'),
        },
        {
          type: 'definition',
          term: 'CASE III: sample points',
          text: 'Lastly, instead of using left endpoints or right endpoints, we consider approximating the $i$th strip $S_{i}$ by a rectangle with width $\\Delta x$ and height $f(x_{i}^{\\ast})$, which is the value of $f$ at any number in the $i$th subinterval $[x_{i-1}, x_{i}]$.',
          source: src('ch2-2.2-case3'),
        },
        {
          type: 'definition',
          term: 'Sample points',
          text: 'We call the numbers $x_{1}^{\\ast}, x_{2}^{\\ast}, \\ldots, x_{n}^{\\ast}$ the sample points. Figure 2.4 shows approximating rectangles when the sample points are not chosen to be endpoints.',
          source: src('ch2-2.2-sample-points'),
        },
        figure('ch2-fig-2.4'),
        {
          type: 'paragraph',
          text: 'Then the area of the $i$th rectangle is $f(x_{i})\\Delta x$. Thus, for this case, the area of $S$ is approximated by the sum of the areas of these rectangles, which is',
          source: src('ch2-2.2-cn'),
          ...reviewOf('ch2-2.2-cn'),
        },
        {
          type: 'math',
          tex: 'C_{n} = f(x_{1}^{\\ast})\\Delta x + f(x_{2}^{\\ast})\\Delta x + \\cdots + f(x_{n}^{\\ast})\\Delta x.',
          source: src('ch2-2.2-cn'),
        },
        {
          type: 'definition',
          term: 'Definition 2.2.3',
          text: 'The area $A_{C}$ of the region $S$ that lies under the graph of the continuous function $f$ is the limit of the sum of the areas of approximating rectangles:',
          tex: 'A_{C} = \\lim_{n \\to \\infty} C_{n} = \\lim_{n \\to \\infty} \\left[f(x_{1}^{\\ast})\\Delta x + f(x_{2}^{\\ast})\\Delta x + \\cdots + f(x_{n}^{\\ast})\\Delta x\\right].',
          source: src('ch2-def-2.2.3'),
        },
        {
          type: 'summary',
          title: 'Where the heights come from',
          points: [
            'Right endpoints ($R_{n}$): the height of the $i$th rectangle is $f(x_{i})$; its top right corner is on the curve.',
            'Left endpoints ($L_{n}$): the height is $f(x_{i-1})$; its top left corner is on the curve.',
            'Sample points ($C_{n}$): the height is $f(x_{i}^{\\ast})$ for any $x_{i}^{\\ast}$ in $[x_{i-1}, x_{i}]$.',
            'Midpoints (the Mid-point Rule, in The Definite Integral): the height is $f(\\bar{x}_{i})$ at the middle of the subinterval.',
          ],
        },
      ],
      { key: 'see-it' },
    ),
    exploreStep(AREA_UNITS.riemann),
    practiseStep(AREA_UNITS.riemann),
    ...laterSteps(AREA_UNITS.riemann),
  ],
};
