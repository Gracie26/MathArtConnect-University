import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { figure, laterSteps, src, step } from '../steps';

/**
 * Source: §3.4 (printed pages 49–52). Figure 3.2 is printed at the top of
 * page 51, inside Example 3.4.3; it is shown directly after that example.
 * Example 3.4.4 keeps its printed stray parenthesis (internal flag MR3-04).
 */
export const chainRuleTwo: LearningUnitDefinition = {
  id: RN_UNITS.chainTwo,
  slug: 'chain-rule-two-or-more-independent-variables',
  title: 'Chain Rule: Two or More Independent Variables',
  summary: '∂w/∂s and ∂w/∂t when the intermediate variables depend on s and t, with the tree diagram of Figure 3.2.',
  glyph: 'limits',
  tone: 'amber',
  source: [ch3('3.4', 49)],
  steps: [
    step('concept', 'Intermediate variables of several variables', [
      {
        type: 'paragraph',
        text: 'Another type of composite function is one in which the intermediate variables are themselves functions of more than one variable. For example, if $w = f(x, y)$, where $x = g(s, t)$ and $y = h(s, t)$, then it follows that $w$ is a function of $s$ and $t$, and we consider the partial derivatives of $w$ with respect to $s$ and $t$. One way to find these partial derivatives is to write $w$ as a function of $s$ and $t$ explicitly by substituting the equations $x = g(s, t)$ and $y = h(s, t)$ into the equation $w = f(x, y)$, then find the partial derivatives in the usual way.',
        source: src('ch3-3.4-intermediate'),
      },
    ]),
    step('worked-example', 'Example 3.4.2', [
      {
        type: 'workedExample',
        title: 'Example 3.4.2',
        prompt:
          'Find $\\frac{\\partial w}{\\partial s}$ and $\\frac{\\partial w}{\\partial t}$ for $w = 2xy$, where $x = s^{2} + t^{2}$ and $y = \\frac{s}{t}$.',
        problemTex: 'w = 2xy, \\quad x = s^{2} + t^{2}, \\quad y = \\frac{s}{t}',
        method: 'Substitute, then differentiate',
        steps: [
          {
            explanation:
              'Begin by substituting $x = s^{2} + t^{2}$ and $y = \\frac{s}{t}$ into the equation $w = 2xy$ to obtain',
            tex: 'w = 2xy = 2(s^{2} + t^{2})\\left(\\frac{s}{t}\\right) = 2\\left(\\frac{s^{3}}{t} + st\\right).',
          },
          {
            explanation:
              'Then, to find $\\frac{\\partial w}{\\partial s}$, hold $t$ constant and differentiate with respect to $s$.',
            tex: '\\frac{\\partial w}{\\partial s} = 2\\left(\\frac{3s^{2}}{t} + t\\right) = \\frac{6s^{2} + 2t^{2}}{t}.',
          },
          {
            explanation:
              'Similarly, to find $\\frac{\\partial w}{\\partial t}$, hold $s$ constant and differentiate with respect to $t$ to obtain',
            tex: '\\frac{\\partial w}{\\partial t} = 2\\left(-\\frac{s^{3}}{t^{2}} + s\\right) = 2\\left(\\frac{-s^{3} + st^{2}}{t^{2}}\\right) = \\frac{2st^{2} - 2s^{3}}{t^{2}}.',
          },
        ],
        resultTex:
          '\\frac{\\partial w}{\\partial s} = \\frac{6s^{2} + 2t^{2}}{t}, \\quad \\frac{\\partial w}{\\partial t} = \\frac{2st^{2} - 2s^{3}}{t^{2}}',
        source: src('ch3-ex-3.4.2'),
        covers: ['ch3-sol-3.4.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    step(
      'concept',
      'Theorem 3.4.2',
      [
        {
          type: 'paragraph',
          text: 'The following theorem gives an alternative method for finding the partial derivatives without explicitly writing $w$ as a function of $s$ and $t$.',
          source: src('ch3-3.4-alternative'),
        },
        {
          type: 'theorem',
          label: 'Theorem 3.4.2',
          title: 'Chain Rule: Two Independent Variables',
          text: 'Let $w = f(x, y)$, where $f$ is a differentiable function of $x$ and $y$. If $x = g(s, t)$ and $y = h(s, t)$ such that the first partials $\\frac{\\partial x}{\\partial s}, \\frac{\\partial x}{\\partial t}, \\frac{\\partial y}{\\partial s}$ and $\\frac{\\partial y}{\\partial t}$ all exist, then $\\frac{\\partial w}{\\partial s}$ and $\\frac{\\partial w}{\\partial t}$ exist and are given by',
          tex: '\\frac{\\partial w}{\\partial s} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial s} \\quad\\text{and}\\quad \\frac{\\partial w}{\\partial t} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial t} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial t}.',
          source: src('ch3-thm-3.4.2'),
        },
      ],
      { key: 'theorem' },
    ),
    step(
      'worked-example',
      'Example 3.4.3',
      [
        {
          type: 'workedExample',
          title: 'Example 3.4.3',
          prompt:
            'Use the Chain rule to find $\\frac{\\partial w}{\\partial s}$ and $\\frac{\\partial w}{\\partial t}$ for $w = 2xy$ where $x = s^{2} + t^{2}$ and $y = \\frac{s}{t}$.',
          problemTex: 'w = 2xy, \\quad x = s^{2} + t^{2}, \\quad y = \\frac{s}{t}',
          method: 'Theorem 3.4.2',
          steps: [
            {
              explanation: 'We can hold $t$ constant and differentiate with respect to $s$ to obtain,',
              tex: '\\frac{\\partial w}{\\partial s} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial s}',
            },
            { explanation: '', tex: '= 2y(2s) + 2x\\left(\\frac{1}{t}\\right)' },
            { explanation: '', tex: '= 4\\left(\\frac{s^{2}}{t}\\right) + \\frac{2s^{2} + 2t^{2}}{t}' },
            { explanation: '', tex: '= \\frac{6s^{2} + 2t^{2}}{t}.' },
            {
              explanation: 'Similarly, holding $s$ fixed gives',
              tex: '\\frac{\\partial w}{\\partial t} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial t} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial t}',
            },
            { explanation: '', tex: '= 2y(2t) + 2x\\left(\\frac{-s}{t^{2}}\\right)' },
            {
              explanation: '',
              tex: '= 2\\left(\\frac{s}{t}\\right)(2t) + 2(s^{2} + t^{2})\\left(\\frac{-s}{t^{2}}\\right)',
            },
            { explanation: '', tex: '= 4s - \\frac{2s^{3} + 2st^{2}}{t^{2}}' },
            { explanation: '', tex: '= \\frac{4st^{2} - 2s^{3} - 2st^{2}}{t^{2}}' },
            { explanation: '', tex: '= \\frac{2st^{2} - 2s^{3}}{t^{2}}.' },
          ],
          resultTex:
            '\\frac{\\partial w}{\\partial s} = \\frac{6s^{2} + 2t^{2}}{t}, \\quad \\frac{\\partial w}{\\partial t} = \\frac{2st^{2} - 2s^{3}}{t^{2}}',
          source: src('ch3-ex-3.4.3'),
          covers: ['ch3-sol-3.4.3'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
        figure('ch3-fig-3.2'),
      ],
      { key: 'chain-rule-example' },
    ),
    step(
      'worked-example',
      'Example 3.4.4',
      [
        {
          type: 'workedExample',
          title: 'Example 3.4.4',
          prompt:
            'Find $\\frac{\\partial w}{\\partial s}$ and $\\frac{\\partial w}{\\partial t}$ when $s = 1$ and $t = 2\\pi$ for the function given by $w = xy + yz + xz$ where $x = s\\cos t, y = s\\sin t$ and $z = t$.',
          problemTex: 'w = xy + yz + xz, \\quad x = s\\cos t, \\quad y = s\\sin t, \\quad z = t',
          method: 'Theorem 3.4.2 extended to three intermediate variables',
          steps: [
            {
              explanation: 'By extending the theorem, we have',
              tex: '\\frac{\\partial w}{\\partial s} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial s} + \\frac{\\partial w}{\\partial z}\\frac{\\partial z}{\\partial s}',
            },
            { explanation: '', tex: '= (y + z)(\\cos t)+)(x + z)(\\sin t) + (y + x)(0)' },
            { explanation: '', tex: '= (y + z)(\\cos t) + (x + z)(\\sin t)' },
            {
              explanation: 'When $s = 1$ and $t = 2\\pi$, we have $x = 1, y = 0$ and $z = 2\\pi$. Therefore',
              tex: '\\frac{\\partial w}{\\partial s} = 2\\pi(1) + (1 + 2\\pi)(0) + 0 = 2\\pi.',
            },
            {
              explanation: 'Furthermore',
              tex: '\\frac{\\partial w}{\\partial t} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial t} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial t} + \\frac{\\partial w}{\\partial z}\\frac{\\partial z}{\\partial t}',
            },
            { explanation: '', tex: '= (y + z)(-s\\sin t) + (x + z)(s\\cos t) + (y + x)(1)' },
            {
              explanation: 'and for $s = 1$ and $t = 2\\pi$ it follows that',
              tex: '\\frac{\\partial w}{\\partial t} = (0 + 2\\pi)(0) + (1 + 2\\pi)(1) + (0 + 1)(1) = 2 + 2\\pi.',
            },
          ],
          resultTex: '\\frac{\\partial w}{\\partial s} = 2\\pi, \\quad \\frac{\\partial w}{\\partial t} = 2 + 2\\pi',
          source: src('ch3-ex-3.4.4'),
          covers: ['ch3-sol-3.4.4'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
      ],
      { key: 'three-variables' },
    ),
    ...laterSteps(RN_UNITS.chainTwo),
  ],
};
