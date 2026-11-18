import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { laterSteps, src, step } from '../steps';

/** Source: §3.2 and §3.2.1 (printed pages 44–46). */
export const partialDerivatives: LearningUnitDefinition = {
  id: RN_UNITS.partials,
  slug: 'partial-derivatives',
  title: 'Partial Derivatives',
  summary: 'The partial derivatives fx and fy as limits, their notation, and their values at a point.',
  glyph: 'tangent',
  tone: 'teal',
  source: [ch3('3.2', 44), ch3('3.2.1', 44)],
  steps: [
    step('concept', 'Partial derivatives', [
      {
        type: 'callout',
        tone: 'insight',
        title: '3.2 Partial Derivatives',
        text: '3.2.1 Partial Derivatives of a Function of Two Variables',
        source: src('ch3-3.2-heading'),
      },
      {
        type: 'paragraph',
        text: 'In the application of functions of several variables, the question often arises, “How will a function be affected by a change in one of its independent variables?”. You can answer by considering the independent variables one at a time. The process is called partial differentiation, and the result is referred to as the partial derivative of $f$ with respect to the chosen independent variable¹.',
        source: src('ch3-3.2.1-intro'),
      },
      {
        type: 'callout',
        tone: 'insight',
        title: 'Footnote 1',
        text: 'The introduction of partial derivatives followed Newton’s and Leibniz’s work in calculus by several years. Between 1760, Leonhard Euler and Jean Le Rond d’Alembert (1717-1783) separately published several papers on dynamics, in which they established much of the theory of partial derivatives',
        source: src('ch3-footnote-1'),
      },
      {
        type: 'definition',
        term: 'Definition of Partial Derivatives of a Function of Two Variables',
        text: 'If $z = f(x, y)$, then the first partial derivatives of $f$ with respect to $x$ and $y$ are the functions $f_{x}$ and $f_{y}$ defined by',
        source: src('ch3-def-partials'),
      },
      {
        type: 'math',
        tex: 'f_{x}(x, y) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x, y) - f(x, y)}{\\Delta x}',
        source: src('ch3-def-partials'),
      },
      {
        type: 'math',
        tex: 'f_{y}(x, y) = \\lim_{\\Delta y \\to 0} \\frac{f(x, y + \\Delta y) - f(x, y)}{\\Delta y}',
        source: src('ch3-def-partials'),
      },
      {
        type: 'paragraph',
        text: 'provided the limits exist. This definition indicates that if $z = f(x, y)$, then to find $f_{x}$ we consider $y$ constant and differentiate with respect to $x$. Similarly, to find $f_{y}$, we consider $x$ constant and differentiate with respect to $y$.',
        source: src('ch3-def-partials'),
      },
    ]),
    step('worked-example', 'Example 3.2.1', [
      {
        type: 'workedExample',
        title: 'Example 3.2.1',
        prompt: 'Find $f_{x}$ and $f_{y}$ for $f(x, y) = 3x - x^{2}y^{2} + 2x^{3}y$.',
        problemTex: 'f(x, y) = 3x - x^{2}y^{2} + 2x^{3}y',
        method: 'Hold one variable constant',
        steps: [
          {
            explanation: 'Considering $y$ to be constant and differentiating with respect to $x$ produces',
            tex: 'f_{x}(x, y) = 3 - 2xy^{2} + 6x^{2}y.',
          },
          {
            explanation: 'Considering $x$ to be constant and differentiating with respect to $y$ produces',
            tex: 'f_{y}(x, y) = -2x^{2}y + 2x^{3}.',
          },
        ],
        resultTex: 'f_{x} = 3 - 2xy^{2} + 6x^{2}y, \\quad f_{y} = -2x^{2}y + 2x^{3}',
        source: src('ch3-ex-3.2.1'),
        covers: ['ch3-sol-3.2.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    step(
      'concept',
      'Notation for Partial Derivatives',
      [
        {
          type: 'paragraph',
          text: 'For $z = f(x, y)$, the partial derivatives $f_{x}$ and $f_{y}$ are denoted by',
          source: src('ch3-3.2.1-notation'),
        },
        {
          type: 'math',
          tex: '\\frac{\\partial}{\\partial x}f(x, y) = f_{x}(x, y) = z_{x} = \\frac{\\partial z}{\\partial x}',
          source: src('ch3-3.2.1-notation'),
        },
        { type: 'paragraph', text: 'and', source: src('ch3-3.2.1-notation') },
        {
          type: 'math',
          tex: '\\frac{\\partial}{\\partial y}f(x, y) = f_{y}(x, y) = z_{y} = \\frac{\\partial z}{\\partial y}.',
          source: src('ch3-3.2.1-notation'),
        },
        {
          type: 'paragraph',
          text: 'The first partials evaluated at the point $(a, b)$ are denoted by',
          source: src('ch3-3.2.1-evaluation'),
        },
        {
          type: 'math',
          tex: '\\left.\\frac{\\partial z}{\\partial x}\\right|_{(a,b)} = f_{x}(a, b)',
          source: src('ch3-3.2.1-evaluation'),
        },
        { type: 'paragraph', text: 'and', source: src('ch3-3.2.1-evaluation') },
        {
          type: 'math',
          tex: '\\left.\\frac{\\partial z}{\\partial y}\\right|_{(a,b)} = f_{y}(a, b).',
          source: src('ch3-3.2.1-evaluation'),
        },
      ],
      { key: 'notation' },
    ),
    step(
      'worked-example',
      'Example 3.2.2',
      [
        {
          type: 'workedExample',
          title: 'Example 3.2.2',
          prompt: 'For $f(x, y) = xe^{x^{2}y}$, find $f_{x}$ and $f_{y}$ and evaluate each at the point $(1, \\ln 2)$.',
          problemTex: 'f(x, y) = xe^{x^{2}y}',
          method: 'Product rule, then substitute the point',
          steps: [
            { explanation: 'Because', tex: 'f_{x}(x, y) = xe^{x^{2}y}(2xy) + e^{x^{2}y}' },
            {
              explanation: 'the partial derivative of $f$ with respect to $x$ at $(1, \\ln 2)$ is',
              tex: 'f_{x}(1, \\ln 2) = e^{\\ln 2}(2\\ln 2) + e^{\\ln 2} = 4\\ln 2 + 2.',
            },
            { explanation: 'Because', tex: 'f_{y}(x, y) = xe^{x^{2}y}(x^{2}) = x^{3}e^{x^{2}y}' },
            {
              explanation: 'the partial derivative of $f$ with respect to $y$ at $(1, \\ln 2)$ is',
              tex: 'f_{y}(1, \\ln 2) = e^{\\ln 2} = 2.',
            },
          ],
          resultTex: 'f_{x}(1, \\ln 2) = 4\\ln 2 + 2, \\quad f_{y}(1, \\ln 2) = 2',
          source: src('ch3-ex-3.2.2'),
          covers: ['ch3-sol-3.2.2'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
      ],
      { key: 'evaluating' },
    ),
    ...laterSteps(RN_UNITS.partials),
  ],
};
