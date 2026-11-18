import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { laterSteps, src, step } from '../steps';

/** Source: §3.4 (printed pages 53–54): Example 3.4.7, where Chapter 3 ends. */
export const secondOrderChainRule: LearningUnitDefinition = {
  id: RN_UNITS.secondOrder,
  slug: 'second-order-chain-rule',
  title: 'Second-Order Chain Rule and Coordinate Changes',
  summary: 'Second derivatives through the Chain Rule, as in polar coordinates x = r cos θ, y = r sin θ.',
  glyph: 'tangent',
  tone: 'blue',
  source: [ch3('3.4', 53)],
  steps: [
    step('worked-example', 'Example 3.4.7', [
      {
        type: 'workedExample',
        title: 'Example 3.4.7',
        prompt:
          'Let $w = f(x, y)$, where $x$ and $y$ are given in polar coordinates by the equations $x = r\\cos\\theta$ and $y = r\\sin\\theta$. Calculate $\\frac{\\partial w}{\\partial r}, \\frac{\\partial w}{\\partial \\theta}$ and $\\frac{\\partial^{2} w}{\\partial r^{2}}$ in terms of $r$ and $\\theta$ and the partial derivatives of $w$ with respect to $x$ and $y$.',
        problemTex: 'w = f(x, y), \\quad x = r\\cos\\theta, \\quad y = r\\sin\\theta',
        method: 'Chain Rule, applied twice',
        steps: [
          {
            explanation:
              'Here $x$ and $y$ are intermediate values, while the independent variables are $r$ and $\\theta$. First note that',
            tex: '\\frac{\\partial x}{\\partial r} = \\cos\\theta, \\quad \\frac{\\partial y}{\\partial r} = \\sin\\theta, \\quad \\frac{\\partial x}{\\partial \\theta} = -r\\sin\\theta \\quad\\text{and}\\quad \\frac{\\partial y}{\\partial \\theta} = r\\cos\\theta.',
          },
          {
            explanation: 'Then',
            tex: '\\frac{\\partial w}{\\partial r} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial r} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial r} = \\frac{\\partial w}{\\partial x}\\cos\\theta + \\frac{\\partial w}{\\partial y}\\sin\\theta',
          },
          {
            explanation: 'and',
            tex: '\\frac{\\partial w}{\\partial \\theta} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial \\theta} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial \\theta} = -r\\frac{\\partial w}{\\partial x}\\sin\\theta + r\\frac{\\partial w}{\\partial y}\\cos\\theta.',
          },
          {
            explanation: 'Next,',
            tex: '\\frac{\\partial^{2} w}{\\partial r^{2}} = \\frac{\\partial}{\\partial r}\\left(\\frac{\\partial w}{\\partial r}\\right) = \\frac{\\partial}{\\partial r}\\left(\\frac{\\partial w}{\\partial x}\\cos\\theta + \\frac{\\partial w}{\\partial y}\\sin\\theta\\right) = \\frac{\\partial w_{x}}{\\partial r}\\cos\\theta + \\frac{\\partial w_{y}}{\\partial r}\\sin\\theta,',
          },
          {
            explanation:
              'where $w_{x} = \\frac{\\partial w}{\\partial x}$ and $w_{y} = \\frac{\\partial w}{\\partial y}$. Therefore',
            tex: '\\frac{\\partial^{2} w}{\\partial r^{2}} = \\left(\\frac{\\partial w_{x}}{\\partial x}\\frac{\\partial x}{\\partial r} + \\frac{\\partial w_{x}}{\\partial y}\\frac{\\partial y}{\\partial r}\\right)\\cos\\theta + \\left(\\frac{\\partial w_{y}}{\\partial x}\\frac{\\partial x}{\\partial r} + \\frac{\\partial w_{y}}{\\partial y}\\frac{\\partial y}{\\partial r}\\right)\\sin\\theta',
          },
          {
            explanation: '',
            tex: '= \\left(\\frac{\\partial^{2} w}{\\partial x^{2}}\\cos\\theta + \\frac{\\partial^{2} w}{\\partial y\\partial x}\\sin\\theta\\right)\\cos\\theta + \\left(\\frac{\\partial^{2} w}{\\partial x\\partial y}\\cos\\theta + \\frac{\\partial^{2} w}{\\partial y^{2}}\\sin\\theta\\right)\\sin\\theta.',
          },
          {
            explanation: 'Finally, because $w_{yx} = w_{xy}$, we get',
            tex: '\\frac{\\partial^{2} w}{\\partial r^{2}} = \\frac{\\partial^{2} w}{\\partial x^{2}}\\cos^{2}\\theta + 2\\frac{\\partial^{2} w}{\\partial x\\partial y}\\cos\\theta\\sin\\theta + \\frac{\\partial^{2} w}{\\partial y^{2}}\\sin^{2}\\theta.',
          },
        ],
        resultTex:
          '\\frac{\\partial^{2} w}{\\partial r^{2}} = \\frac{\\partial^{2} w}{\\partial x^{2}}\\cos^{2}\\theta + 2\\frac{\\partial^{2} w}{\\partial x\\partial y}\\cos\\theta\\sin\\theta + \\frac{\\partial^{2} w}{\\partial y^{2}}\\sin^{2}\\theta',
        source: src('ch3-ex-3.4.7'),
        covers: ['ch3-sol-3.4.7'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    ...laterSteps(RN_UNITS.secondOrder),
  ],
};
