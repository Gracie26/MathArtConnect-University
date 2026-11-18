import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { laterSteps, src, step } from '../steps';

/**
 * Source: §3.2.3 (printed pages 47–48), in printed order: the four second
 * partials, Example 3.2.4, Theorem 3.2.1, Example 3.2.5. The notation of
 * cases 3 and 4 (fxy = ∂²f/∂y∂x, fyx = ∂²f/∂x∂y) is kept exactly as printed
 * (internal review flag MR3-03); Theorem 3.2.1 keeps its printed hypothesis
 * (internal review flag MR3-02).
 */
export const higherOrder: LearningUnitDefinition = {
  id: RN_UNITS.higherOrder,
  slug: 'higher-order-partial-derivatives',
  title: 'Higher-Order Partial Derivatives and Clairaut’s Theorem',
  summary: 'Second and higher partial derivatives, mixed partials and when their order does not matter.',
  glyph: 'match',
  tone: 'coral',
  source: [ch3('3.2.3', 47)],
  steps: [
    step('concept', 'Higher-order partial derivatives', [
      {
        type: 'paragraph',
        text: 'It is possible to take second, third and higher partial derivatives of a function of several variables, provided such derivatives exist. Higher-order derivatives are denoted by the order in which the differentiation occurs. For instance, the function $z = f(x, y)$ has the following second partial derivatives.',
        source: src('ch3-3.2.3-intro'),
      },
      {
        type: 'formulaList',
        title: 'Second partial derivatives',
        items: [
          {
            tex: '\\frac{\\partial}{\\partial x}\\left(\\frac{\\partial f}{\\partial x}\\right) = \\frac{\\partial^{2} f}{\\partial x^{2}} = f_{xx}.',
            note: '1. Differentiate twice with respect to $x$:',
            source: src('ch3-3.2.3-four-cases'),
          },
          {
            tex: '\\frac{\\partial}{\\partial y}\\left(\\frac{\\partial f}{\\partial y}\\right) = \\frac{\\partial^{2} f}{\\partial y^{2}} = f_{yy}.',
            note: '2. Differentiate twice with respect to $y$:',
            source: src('ch3-3.2.3-four-cases'),
          },
          {
            tex: '\\frac{\\partial}{\\partial y}\\left(\\frac{\\partial f}{\\partial x}\\right) = \\frac{\\partial^{2} f}{\\partial y\\partial x} = f_{xy}.',
            note: '3. Differentiate first with respect to $x$ and then with respect to $y$:',
            source: src('ch3-3.2.3-four-cases'),
          },
          {
            tex: '\\frac{\\partial}{\\partial x}\\left(\\frac{\\partial f}{\\partial y}\\right) = \\frac{\\partial^{2} f}{\\partial x\\partial y} = f_{yx}.',
            note: '4. Differentiate first with respect to $y$ and then with respect to $x$:',
            source: src('ch3-3.2.3-four-cases'),
          },
        ],
        source: src('ch3-3.2.3-four-cases'),
      },
      {
        type: 'definition',
        term: 'Mixed partial derivatives',
        text: 'The third and fourth cases are called mixed partial derivatives.',
        source: src('ch3-3.2.3-mixed'),
      },
    ]),
    step('worked-example', 'Example 3.2.4', [
      {
        type: 'workedExample',
        title: 'Example 3.2.4',
        prompt:
          'Find the second partial derivatives of $f(x, y) = 3xy^{2} - 2y + 5x^{2}y^{2}$ and determine the value of $f_{xy}(-1, 2)$.',
        problemTex: 'f(x, y) = 3xy^{2} - 2y + 5x^{2}y^{2}',
        method: 'First partials, then differentiate each again',
        steps: [
          {
            explanation: 'Begin by finding the first partial derivatives with respect to $x$ and $y$.',
            tex: 'f_{x}(x, y) = 3y^{2} + 10xy^{2} \\quad\\text{and}\\quad f_{y}(x, y) = 6xy - 2 + 10x^{2}y.',
          },
          {
            explanation: 'Then, differentiate each of these with respect to $x$ and $y$.',
            tex: 'f_{xx}(x, y) = 10y^{2}, \\quad f_{yy}(x, y) = 6x + 10x^{2},',
          },
          { explanation: '', tex: 'f_{xy}(x, y) = 6y + 20xy \\quad\\text{and}\\quad f_{yx}(x, y) = 6y + 20xy.' },
          { explanation: 'At $(-1, 2)$, the value of $f_{xy}$ is', tex: 'f_{xy}(-1, 2) = 12 - 40 = -28.' },
        ],
        resultTex: 'f_{xy}(-1, 2) = -28',
        source: src('ch3-ex-3.2.4'),
        covers: ['ch3-sol-3.2.4'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'paragraph',
        text: 'Notice that the two mixed partials are equal. Sufficient conditions for this occurrence are given in the next theorem.',
        source: src('ch3-3.2.3-notice'),
      },
    ]),
    step(
      'concept',
      'Clairaut’s Theorem',
      [
        {
          type: 'theorem',
          label: 'Theorem 3.2.1',
          title: 'Clairaut’s Theorem or Schwarz’s Theorem',
          text: 'If $f$ is a function of $x$ and $y$ such that $f_{x}$ and $f_{y}$ are continuous on an open disc $R$, then for every $(x, y)$ in $R$,',
          tex: 'f_{xy}(x, y) = f_{yx}(x, y).',
          source: src('ch3-thm-3.2.1'),
        },
        {
          type: 'paragraph',
          text: 'The order of differentiation of the mixed partial derivatives is irrelevant.',
          source: src('ch3-3.2.3-order'),
        },
      ],
      { key: 'clairaut' },
    ),
    step(
      'worked-example',
      'Example 3.2.5',
      [
        {
          type: 'workedExample',
          title: 'Example 3.2.5',
          prompt:
            'Show that $f_{xz} = f_{zx}$ and $f_{xzz} = f_{zxz} = f_{zzx}$ for the function given by $f(x, y, z) = ye^{x} + x\\ln z$.',
          problemTex: 'f(x, y, z) = ye^{x} + x\\ln z',
          method: 'First, second and third partials',
          steps: [
            {
              explanation: 'First partials:',
              tex: 'f_{x}(x, y, z) = ye^{x} + \\ln z, \\quad f_{z}(x, y, z) = \\frac{x}{z}.',
            },
            {
              explanation: 'Second partials: (Note the first two are equal)',
              tex: 'f_{xz}(x, y, z) = \\frac{1}{z}, \\quad f_{zx}(x, y, z) = \\frac{1}{z}, \\quad f_{zz}(x, y, z) = -\\frac{x}{z^{2}}.',
            },
            {
              explanation: 'Third partials: (Note that all three are equal)',
              tex: 'f_{xzz}(x, y, z) = -\\frac{1}{z^{2}}, \\quad f_{zxz}(x, y, z) = -\\frac{1}{z^{2}}, \\quad f_{zzx}(x, y, z) = -\\frac{1}{z^{2}}.',
            },
          ],
          resultTex: 'f_{xz} = f_{zx} = \\frac{1}{z}, \\quad f_{xzz} = f_{zxz} = f_{zzx} = -\\frac{1}{z^{2}}',
          source: src('ch3-ex-3.2.5'),
          covers: ['ch3-sol-3.2.5'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
      ],
      { key: 'third-order' },
    ),
    ...laterSteps(RN_UNITS.higherOrder),
  ],
};
