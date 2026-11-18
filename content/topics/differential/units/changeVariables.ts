import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { laterSteps, src, step } from '../steps';

/**
 * Source: §3.4 (printed pages 52–53): Examples 3.4.5 and 3.4.6, exactly as
 * printed. Example 3.4.6's solution also derives ∂u/∂x (internal flag
 * MR3-05), and its verification line is printed with denominators
 * (u² + v²) (internal flag MR3-06); both are kept as printed.
 */
export const changingVariables: LearningUnitDefinition = {
  id: RN_UNITS.changeVariables,
  slug: 'changing-variables-with-differentials',
  title: 'Changing Variables with Differentials',
  summary: 'Find partial derivatives of x and y with respect to new variables by solving equations in differentials.',
  glyph: 'wave',
  tone: 'coral',
  source: [ch3('3.4', 52)],
  steps: [
    step('worked-example', 'Example 3.4.5', [
      {
        type: 'workedExample',
        title: 'Example 3.4.5',
        prompt:
          'If $u = x + y$ and $v = xy$, find $\\frac{\\partial x}{\\partial u}, \\frac{\\partial x}{\\partial v}, \\frac{\\partial y}{\\partial u}, \\frac{\\partial y}{\\partial v}$.',
        problemTex: 'u = x + y, \\quad v = xy',
        method: 'Solve the equations in differentials for dx and dy',
        steps: [
          {
            explanation:
              'Clearly $du = dx + dy$ and $dv = ydx + xdy$, and hence $-ydx = xdy - dv$ and $xdx = xdu - xdy$. Adding these two equations, yield $(x - y)dx = xdu - dv$. Also, $xdy = dv - ydx$ and $-ydy = ydx - ydu$, hence $(x - y)dy = dv - ydu$. Thus',
            tex: 'dx = \\frac{x}{x - y}du - \\frac{1}{x - y}dv',
          },
          { explanation: 'and', tex: 'dy = \\frac{1}{x - y}dv - \\frac{y}{x - y}du.' },
          {
            explanation: 'Consequently, we have',
            tex: '\\frac{\\partial x}{\\partial u} = \\frac{x}{x - y}, \\quad \\frac{\\partial x}{\\partial v} = \\frac{-1}{x - y}, \\quad \\frac{\\partial y}{\\partial u} = \\frac{-y}{x - y}, \\quad \\frac{\\partial y}{\\partial v} = \\frac{1}{x - y}.',
          },
        ],
        resultTex:
          '\\frac{\\partial x}{\\partial u} = \\frac{x}{x - y}, \\quad \\frac{\\partial x}{\\partial v} = \\frac{-1}{x - y}, \\quad \\frac{\\partial y}{\\partial u} = \\frac{-y}{x - y}, \\quad \\frac{\\partial y}{\\partial v} = \\frac{1}{x - y}',
        source: src('ch3-ex-3.4.5'),
        covers: ['ch3-sol-3.4.5'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    step(
      'worked-example',
      'Example 3.4.6',
      [
        {
          type: 'workedExample',
          title: 'Example 3.4.6',
          prompt:
            'Parabolic co-ordinates $(u, v)$ are defined implicitly in terms of the Cartesian co-ordinates $(x, y)$ by the pair of equations $x = \\frac{u^{2} - v^{2}}{2}, y = uv$. Obtain expressions for $\\frac{\\partial u}{\\partial y}, \\frac{\\partial v}{\\partial x}$ and $\\frac{\\partial v}{\\partial y}$ in terms of $u$ and $v$ and verify that $\\frac{\\partial u}{\\partial x}\\frac{\\partial v}{\\partial x} + \\frac{\\partial u}{\\partial y}\\frac{\\partial v}{\\partial y} = 0$. Given that $f(x, y) = \\phi(u, v)$, obtain expressions for $\\frac{\\partial f}{\\partial x}$ and $\\frac{\\partial f}{\\partial y}$ in terms of $\\frac{\\partial \\phi}{\\partial u}, \\frac{\\partial \\phi}{\\partial v}, u$ and $v$, and deduce that',
          problemTex:
            '\\left(\\frac{\\partial f}{\\partial x}\\right)^{2} + \\left(\\frac{\\partial f}{\\partial y}\\right)^{2} = \\frac{1}{u^{2} + v^{2}}\\left[\\left(\\frac{\\partial \\phi}{\\partial u}\\right)^{2} + \\left(\\frac{\\partial \\phi}{\\partial v}\\right)^{2}\\right].',
          method: 'Differentials, then the Chain Rule',
          steps: [
            {
              explanation:
                'Since $x = \\frac{u^{2} - v^{2}}{2}, y = uv$, then $dx = udu - vdv$ and $dy = vdu + udv$. Multiplying the first by $u$ and the second by $v$, we have',
              tex: 'udx = u^{2}du - uvdv, \\quad vdy = v^{2}du + uvdv.',
            },
            { explanation: 'On adding them, we obtain', tex: '(u^{2} + v^{2})du = udx + vdy. \\qquad (3.1)' },
            {
              explanation: 'Also multiplying the first by $v$ and the second by $u$, we get',
              tex: 'vdx = uvdu - v^{2}dv, \\quad udy = uvdu + u^{2}dv.',
            },
            { explanation: 'Subtracting them, we obtain', tex: '(u^{2} + v^{2})dv = udy - vdx. \\qquad (3.2)' },
            {
              explanation: 'From (3.1) and (3.2), we have',
              tex: 'du = \\frac{u}{u^{2} + v^{2}}dx + \\frac{v}{u^{2} + v^{2}}dy,',
            },
            { explanation: 'and', tex: 'dv = \\frac{u}{u^{2} + v^{2}}dy - \\frac{v}{u^{2} + v^{2}}dx.' },
            {
              explanation:
                'Comparing these equations with $du = \\frac{\\partial u}{\\partial x}dx + \\frac{\\partial u}{\\partial y}dy$ and $dv = \\frac{\\partial v}{\\partial x}dx + \\frac{\\partial v}{\\partial y}dy$, we get',
              tex: '\\frac{\\partial u}{\\partial x} = \\frac{u}{u^{2} + v^{2}}, \\quad \\frac{\\partial u}{\\partial y} = \\frac{v}{u^{2} + v^{2}}, \\quad \\frac{\\partial v}{\\partial y} = \\frac{u}{u^{2} + v^{2}}, \\quad \\frac{\\partial v}{\\partial x} = -\\frac{v}{u^{2} + v^{2}}.',
            },
            {
              explanation: 'Now',
              tex: '\\frac{\\partial u}{\\partial x}\\frac{\\partial v}{\\partial x} + \\frac{\\partial u}{\\partial y}\\frac{\\partial v}{\\partial y} = \\frac{-uv}{u^{2} + v^{2}} + \\frac{uv}{u^{2} + v^{2}} = 0.',
            },
            {
              explanation:
                'Given that $f(x, y) = \\phi(u, v)$, it follows that $u$ and $v$ are implicit functions of $x$ and $y$ and so',
              tex: '\\frac{\\partial f}{\\partial x} = \\frac{\\partial \\phi}{\\partial u}\\frac{\\partial u}{\\partial x} + \\frac{\\partial \\phi}{\\partial v}\\frac{\\partial v}{\\partial x} = \\frac{u}{u^{2} + v^{2}}\\frac{\\partial \\phi}{\\partial u} - \\frac{v}{u^{2} + v^{2}}\\frac{\\partial \\phi}{\\partial v}',
            },
            {
              explanation: 'and',
              tex: '\\frac{\\partial f}{\\partial y} = \\frac{\\partial \\phi}{\\partial u}\\frac{\\partial u}{\\partial y} + \\frac{\\partial \\phi}{\\partial v}\\frac{\\partial v}{\\partial y} = \\frac{v}{u^{2} + v^{2}}\\frac{\\partial \\phi}{\\partial u} + \\frac{u}{u^{2} + v^{2}}\\frac{\\partial \\phi}{\\partial v}.',
            },
            {
              explanation: 'Now',
              tex: '\\left(\\frac{\\partial f}{\\partial x}\\right)^{2} = \\frac{u^{2}}{(u^{2} + v^{2})^{2}}\\left(\\frac{\\partial \\phi}{\\partial u}\\right)^{2} - \\frac{2uv}{(u^{2} + v^{2})^{2}}\\frac{\\partial \\phi}{\\partial u}\\frac{\\partial \\phi}{\\partial v} + \\frac{v^{2}}{(u^{2} + v^{2})^{2}}\\left(\\frac{\\partial \\phi}{\\partial v}\\right)^{2}',
            },
            {
              explanation: '',
              tex: '\\left(\\frac{\\partial f}{\\partial y}\\right)^{2} = \\frac{v^{2}}{(u^{2} + v^{2})^{2}}\\left(\\frac{\\partial \\phi}{\\partial u}\\right)^{2} + \\frac{2uv}{(u^{2} + v^{2})^{2}}\\frac{\\partial \\phi}{\\partial u}\\frac{\\partial \\phi}{\\partial v} + \\frac{u^{2}}{(u^{2} + v^{2})^{2}}\\left(\\frac{\\partial \\phi}{\\partial v}\\right)^{2}.',
            },
            {
              explanation: 'Hence',
              tex: '\\left(\\frac{\\partial f}{\\partial x}\\right)^{2} + \\left(\\frac{\\partial f}{\\partial y}\\right)^{2} = \\frac{1}{u^{2} + v^{2}}\\left[\\left(\\frac{\\partial \\phi}{\\partial u}\\right)^{2} + \\left(\\frac{\\partial \\phi}{\\partial v}\\right)^{2}\\right].',
            },
          ],
          resultTex:
            '\\left(\\frac{\\partial f}{\\partial x}\\right)^{2} + \\left(\\frac{\\partial f}{\\partial y}\\right)^{2} = \\frac{1}{u^{2} + v^{2}}\\left[\\left(\\frac{\\partial \\phi}{\\partial u}\\right)^{2} + \\left(\\frac{\\partial \\phi}{\\partial v}\\right)^{2}\\right]',
          source: src('ch3-ex-3.4.6'),
          covers: ['ch3-sol-3.4.6'],
          origin: 'unamSource',
          solutionStatus: 'unamSource',
        },
      ],
      { key: 'parabolic-coordinates' },
    ),
    ...laterSteps(RN_UNITS.changeVariables),
  ],
};
