import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { figure, laterSteps, src, step } from '../steps';

/** Source: §3.4 (printed page 49): Theorem 3.4.1, Figure 3.1, Example 3.4.1 and the n-variable rule. */
export const chainRuleOne: LearningUnitDefinition = {
  id: RN_UNITS.chainOne,
  slug: 'chain-rule-one-independent-variable',
  title: 'Chain Rule: One Independent Variable',
  summary: 'dw/dt when w = f(x, y) and x, y are functions of t, with the tree diagram of Figure 3.1.',
  glyph: 'limits',
  tone: 'blue',
  source: [ch3('3.4', 49)],
  steps: [
    step('concept', 'Chain Rules for Functions of Several Variables', [
      {
        type: 'theorem',
        label: 'Theorem 3.4.1',
        text: 'Let $w = f(x, y)$, where $f$ is a differentiable function of $x$ and $y$. If $x = g(t)$ and $y = h(t)$, where $g$ and $h$ are differentiable functions of $t$, then $w$ is a differentiable function of $t$, and',
        tex: '\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial w}{\\partial y}\\frac{dy}{dt}.',
        source: src('ch3-thm-3.4.1'),
      },
      figure('ch3-fig-3.1'),
    ]),
    step('worked-example', 'Example 3.4.1', [
      {
        type: 'workedExample',
        title: 'Example 3.4.1',
        prompt: 'Let $w = x^{2}y - y^{2}$, where $x = \\sin t$ and $y = e^{t}$. Find $\\frac{dw}{dt}$ at $t = 0$.',
        problemTex: 'w = x^{2}y - y^{2}, \\quad x = \\sin t, \\quad y = e^{t}',
        method: 'Chain Rule for one independent variable',
        steps: [
          {
            explanation: 'By the Chain Rule for one independent variable, we have',
            tex: '\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial w}{\\partial y}\\frac{dy}{dt}',
          },
          { explanation: '', tex: '= 2xy(\\cos t) + (x^{2} - 2y)e^{t}.' },
          { explanation: 'When $t = 0, x = 0$, and $y = 1$, it follows that', tex: '\\frac{dw}{dt} = 0 - 2 = -2.' },
        ],
        resultTex: '\\left.\\frac{dw}{dt}\\right|_{t=0} = -2',
        source: src('ch3-ex-3.4.1'),
        covers: ['ch3-sol-3.4.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    step(
      'concept',
      'Any number of variables',
      [
        {
          type: 'paragraph',
          text: 'The Chain Rule can be extended to any number of variables. for example, if each $x_{i}$ is a differentiable function of a single variable $t$, then for $w = f(x_{1}, x_{2}, \\ldots, x_{n})$, we have',
          source: src('ch3-3.4-n-variables'),
        },
        {
          type: 'math',
          tex: '\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x_{1}}\\frac{dx_{1}}{dt} + \\frac{\\partial w}{\\partial x_{2}}\\frac{dx_{2}}{dt} + \\cdots + \\frac{\\partial w}{\\partial x_{n}}\\frac{dx_{n}}{dt}.',
          source: src('ch3-3.4-n-variables'),
        },
      ],
      { key: 'more-variables' },
    ),
    ...laterSteps(RN_UNITS.chainOne),
  ],
};
