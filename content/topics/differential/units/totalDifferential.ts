import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { laterSteps, src, step } from '../steps';

/** Source: §3.3 (printed page 48). No tutorial question practises §3.3 (MR3-T7). */
export const totalDifferential: LearningUnitDefinition = {
  id: RN_UNITS.totalDifferential,
  slug: 'total-differential',
  title: 'The Total Differential',
  summary: 'The differentials dx and dy, and the total differential dz = fx dx + fy dy.',
  glyph: 'wave',
  tone: 'teal',
  source: [ch3('3.3', 48)],
  steps: [
    step('concept', 'Total differential', [
      {
        type: 'definition',
        term: '3.3 Total Differential',
        text: 'If $z = f(x, y)$ and $\\Delta x$ and $\\Delta y$ are increments of $x$ and $y$, then the differentials of the independent variables $x$ and $y$ are',
        source: src('ch3-3.3-definition'),
      },
      { type: 'math', tex: 'dx = \\Delta x \\quad\\text{and}\\quad dy = \\Delta y', source: src('ch3-3.3-definition') },
      {
        type: 'paragraph',
        text: 'and the total differential of the dependent variable $z$ is',
        source: src('ch3-3.3-definition'),
      },
      {
        type: 'math',
        tex: 'dz = \\frac{\\partial z}{\\partial x}dx + \\frac{\\partial z}{\\partial y}dy = f_{x}(x, y)dx + f_{y}(x, y)dy.',
        source: src('ch3-3.3-definition'),
      },
      {
        type: 'paragraph',
        text: 'This definition can be extended to a function of three or more variables. for example, if $w = f(x, y, z, u)$, then $dx = \\Delta x, dy = \\Delta y, dz = \\Delta z, du = \\Delta u$, and the total differential of $w$ is',
        source: src('ch3-3.3-extension'),
      },
      {
        type: 'math',
        tex: 'dw = \\frac{\\partial w}{\\partial x}dx + \\frac{\\partial w}{\\partial y}dy + \\frac{\\partial w}{\\partial z}dz + \\frac{\\partial w}{\\partial u}du.',
        source: src('ch3-3.3-extension'),
      },
    ]),
    step('worked-example', 'Example 3.3.1', [
      {
        type: 'workedExample',
        title: 'Example 3.3.1',
        problemTex: '\\text{(i)}\\; z = 2x\\sin y - 3x^{2}y^{2} \\qquad \\text{(ii)}\\; w = x^{2} + y^{2} + z^{2}',
        method: 'Total differential',
        steps: [
          {
            explanation: '(i) The total differential $dz$ for $z = 2x\\sin y - 3x^{2}y^{2}$ is',
            tex: 'dz = \\frac{\\partial z}{\\partial x}dx + \\frac{\\partial z}{\\partial y}dy = (2\\sin y - 6xy^{2})dx + (2x\\cos y - 6x^{2}y)dy.',
          },
          {
            explanation: '(ii) The total differential $dw$ for $w = x^{2} + y^{2} + z^{2}$ is',
            tex: 'dw = \\frac{\\partial w}{\\partial x}dx + \\frac{\\partial w}{\\partial y}dy + \\frac{\\partial w}{\\partial z}dz = 2xdx + 2ydy + 2zdz.',
          },
        ],
        resultTex:
          '\\text{(i)}\\; dz = (2\\sin y - 6xy^{2})dx + (2x\\cos y - 6x^{2}y)dy \\qquad \\text{(ii)}\\; dw = 2xdx + 2ydy + 2zdz',
        source: src('ch3-ex-3.3.1'),
        covers: ['ch3-sol-3.3.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    ...laterSteps(RN_UNITS.totalDifferential),
  ],
};
