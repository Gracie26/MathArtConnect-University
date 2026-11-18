import type { LearningUnitDefinition } from '../../../types';
import { FIGURE_5_1, REGION_5_1_2_MATH } from '../figures';
import { MI_UNITS } from '../ids';
import { ch5 } from '../sources';
import { appGuidance, laterSteps, readingNote, src, step } from '../steps';

/** Source: §5.1 (printed pages 62–64). Practice: Tutorial 6 Q1 and Q2. */
export const iterated: LearningUnitDefinition = {
  id: MI_UNITS.iterated,
  slug: 'iterated-integrals',
  title: 'Iterated Integrals',
  summary: 'Integrate with respect to one variable while holding the other constant, then integrate again.',
  glyph: 'function-art',
  tone: 'teal',
  source: [ch5('5.1', 62)],
  steps: [
    step('concept', 'Integrating with respect to one variable', [
      { type: 'paragraph', text: 'Chapter 5: Multiple Integration', source: src('ch5-title') },
      {
        type: 'paragraph',
        text: 'In the previous chapter, we saw that it is meaningful to differentiate functions of several variables with respect to one variable while holding the other variable constant, we can integrate functions of several variables by a similar procedure. For example, if we have the partial derivative $f_{x}(x, y) = 2xy$, then by considering $y$ constant, we can integrate with respect to $x$ to obtain',
        source: src('ch5-5.1-intro'),
      },
      {
        type: 'table',
        title: 'Integrating with respect to x',
        columns: ['', ''],
        rows: [
          { left: '$f(x, y) = \\int f_{x}(x, y)\\,dx$', right: 'Integrate with respect to $x$' },
          { left: '$= \\int 2xy\\,dx$', right: '$y$ is held constant' },
          { left: '$= y\\int 2x\\,dx$', right: 'Factor out constant $y$' },
          { left: '$= y(x^{2}) + C(y)$', right: 'Anti-derivative of $2x$ is $x^{2}$' },
          { left: '$= x^{2} + C(y)$.', right: '$C(y)$ is function of $y$' },
        ],
        source: src('ch5-5.1-w1'),
      },
      readingNote(
        'In the last line above the factor $y$ is not printed: $y(x^{2}) + C(y)$ is $x^{2}y + C(y)$. The calculation below uses $x^{2}y$.',
      ),
      {
        type: 'paragraph',
        text: 'Note that the constant of integration, $C(y)$ is a function of $y$. In other words, by integrating with respect to $x$, we are able to recover $f(x, y)$ only partially. For example, by considering $y$ constant, we can apply the Fundamental Theorem of calculus to evaluate',
        source: src('ch5-5.1-cy'),
      },
      {
        type: 'math',
        tex: '\\int_{1}^{2y} 2xy\\,dx = x^{2}y\\Big|_{1}^{2y} = (2y)^{2}y - (1)^{2}y = 4y^{3} - y.',
        source: src('ch5-5.1-w2'),
      },
      {
        type: 'paragraph',
        text: 'Note that the variable of integration cannot appear in either limit of integration. For example, it makes no sense to write $\\int_{0}^{x} y\\,dx$.',
        source: src('ch5-5.1-limits-note'),
      },
    ]),
    step(
      'see-it',
      'See it',
      [
        {
          type: 'figure',
          figure: REGION_5_1_2_MATH,
        },
        appGuidance(
          'This is the region of Example 5.1.2 (Figure 5.1) in Math View. At each fixed $x$ between $1$ and $2$, the inner integral runs along the vertical strip from $y = 1$ up to $y = x$: those are the inside limits, and they depend on $x$. Then $x$ runs from $1$ to $2$: the outside limits, which are constants.',
        ),
      ],
      { required: false },
    ),
    step('worked-example', 'Examples 5.1.1 and 5.1.2, and iterated integrals', [
      {
        type: 'workedExample',
        title: 'Example 5.1.1',
        prompt: 'Evaluate $\\int_{1}^{x}(2x^{2}y^{-2} + 2y)\\,dy$.',
        problemTex: '\\int_{1}^{x}(2x^{2}y^{-2} + 2y)\\,dy',
        method: 'Integrating with respect to y',
        steps: [
          {
            explanation: 'Considering $x$ to be constant and integrating with respect to $y$ produces',
            tex: '\\int_{1}^{x}(2x^{2}y^{-2} + 2y)\\,dy = \\left[\\frac{-2x^{2}}{y} + y^{2}\\right]_{1}^{x}',
          },
          {
            explanation: '',
            tex: '= \\left(\\frac{-2x^{2}}{x} + x^{2}\\right) - \\left(\\frac{-2x^{2}}{1} + 1\\right) = 3x^{2} - 2x - 1.',
          },
        ],
        resultTex: '3x^{2} - 2x - 1',
        source: src('ch5-ex-5.1.1'),
        covers: ['ch5-sol-5.1.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'paragraph',
        text: 'Notice that in the above example the integral defines a function of $x$ and can itself be integrated.',
        source: src('ch5-5.1-remark'),
      },
      {
        type: 'workedExample',
        title: 'Example 5.1.2',
        prompt: 'Evaluate $\\int_{1}^{2}\\left[\\int_{1}^{x}(2x^{2}y^{-2} + 2y)\\,dy\\right]dx$.',
        problemTex: '\\int_{1}^{2}\\left[\\int_{1}^{x}(2x^{2}y^{-2} + 2y)\\,dy\\right]dx',
        method: 'Iterated integral',
        steps: [
          {
            explanation: 'Using the result from the previous example, we have',
            tex: '\\int_{1}^{2}\\left[\\int_{1}^{x}(2x^{2}y^{-2} + 2y)\\,dy\\right]dx = \\int_{1}^{2}(3x^{2} - 2x - 1)\\,dx',
          },
          { explanation: '', tex: '= \\left[x^{3} - x^{2} - x\\right]_{1}^{2} = 2 - (-1) = 3.' },
        ],
        resultTex: '3',
        source: src('ch5-ex-5.1.2'),
        covers: ['ch5-sol-5.1.2', 'ch5-fig-5.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
        figure: FIGURE_5_1,
      },
      {
        type: 'formula',
        title:
          'The integral in the above example is an iterated integral. Iterated integrals are usually written simply as',
        tex: '\\int_{a}^{b}\\int_{g_{1}(x)}^{g_{2}(x)} f(x, y)\\,dy\\,dx \\quad \\text{and} \\quad \\int_{c}^{d}\\int_{h_{1}(y)}^{h_{2}(y)} f(x, y)\\,dx\\,dy.',
        source: src('ch5-5.1-iterated'),
      },
      {
        type: 'paragraph',
        text: 'The inside limits of integration can be variable with respect to the outer variable of integration. However, the outside limits of integration must be constant with respect to both variables of integration. After performing the inside integration, we obtain a definite integral, and the second integration produces a real number.',
        source: src('ch5-5.1-limits'),
      },
      {
        type: 'paragraph',
        text: 'One order of integration will often produce a simpler integration problem than the other order. The order of integration affects the ease of integration, but not the value of the integral.',
        source: src('ch5-5.1-order'),
      },
    ]),
    ...laterSteps(MI_UNITS.iterated),
  ],
};
