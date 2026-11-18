import type { LearningUnitDefinition } from '../../../types';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { laterSteps, src, step } from '../steps';

/** Source: §3.2.2 (printed page 46). */
export const threeVariables: LearningUnitDefinition = {
  id: RN_UNITS.threeVariables,
  slug: 'partial-derivatives-three-or-more-variables',
  title: 'Partial Derivatives of Three or More Variables',
  summary: 'Partial derivatives of w = f(x, y, z) and beyond: hold every other variable constant.',
  glyph: 'tangent',
  tone: 'amber',
  source: [ch3('3.2.2', 46)],
  steps: [
    step('concept', 'Three or more variables', [
      {
        type: 'paragraph',
        text: 'The concept of a partial derivative can be extended naturally to functions of three or more variables. For instance, if $w = f(x, y, z)$, then there are three partial derivatives, each of which is formed by holding two of three variables constant.',
        source: src('ch3-3.2.2-intro'),
      },
      {
        type: 'math',
        tex: '\\frac{\\partial w}{\\partial x} = f_{x}(x, y, z) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x, y, z) - f(x, y, z)}{\\Delta x}',
        source: src('ch3-3.2.2-definitions'),
      },
      {
        type: 'math',
        tex: '\\frac{\\partial w}{\\partial y} = f_{y}(x, y, z) = \\lim_{\\Delta y \\to 0} \\frac{f(x, y + \\Delta y, z) - f(x, y, z)}{\\Delta y}',
        source: src('ch3-3.2.2-definitions'),
      },
      {
        type: 'math',
        tex: '\\frac{\\partial w}{\\partial z} = f_{z}(x, y, z) = \\lim_{\\Delta z \\to 0} \\frac{f(x, y, z + \\Delta z) - f(x, y, z)}{\\Delta z}.',
        source: src('ch3-3.2.2-definitions'),
      },
    ]),
    step('worked-example', 'Example 3.2.3', [
      {
        type: 'workedExample',
        title: 'Example 3.2.3',
        problemTex:
          '\\text{(i)}\\; xy + yz^{2} + xz \\qquad \\text{(ii)}\\; z\\sin(xy^{2} + 2z) \\qquad \\text{(iii)}\\; \\frac{x + y + z}{w}',
        method: 'Hold every other variable constant',
        steps: [
          {
            explanation:
              '(i) To find the partial derivative of $f(x, y, z) = xy + yz^{2} + xz$ with respect to $z$, consider $x$ and $y$ to be constant and obtain',
            tex: '\\frac{\\partial}{\\partial z}\\left[xy + yz^{2} + xz\\right] = 2yz + x.',
          },
          {
            explanation:
              '(ii) to find the partial derivative of $f(x, y, z) = z\\sin(xy^{2} + 2z)$ with respect to $z$, consider $x$ and $y$ to be constant. Then, using the Product rule, we obtain',
            tex: '\\frac{\\partial}{\\partial z}\\left[z\\sin(xy^{2} + 2z)\\right] = (z)\\frac{\\partial}{\\partial z}\\left[\\sin(xy^{2} + 2z)\\right] + \\sin(xy^{2} + 2z)\\frac{\\partial}{\\partial z}[z]',
          },
          { explanation: '', tex: '= (z)\\left[\\cos(xy^{2} + 2z)\\right](2) + \\sin(xy^{2} + 2z)' },
          { explanation: '', tex: '= 2z\\cos(xy^{2} + 2z) + \\sin(xy^{2} + 2z).' },
          {
            explanation:
              '(iii) To find the partial derivative of $f(x, y, z, w) = \\frac{x + y + z}{w}$ with respect to $w$, consider $x, y$ and $z$ to be constant and obtain',
            tex: '\\frac{\\partial}{\\partial w}\\left[\\frac{x + y + z}{w}\\right] = -\\frac{x + y + z}{w^{2}}.',
          },
        ],
        resultTex:
          '\\text{(i)}\\; 2yz + x \\qquad \\text{(ii)}\\; 2z\\cos(xy^{2} + 2z) + \\sin(xy^{2} + 2z) \\qquad \\text{(iii)}\\; -\\frac{x + y + z}{w^{2}}',
        source: src('ch3-ex-3.2.3'),
        covers: ['ch3-sol-3.2.3'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    ...laterSteps(RN_UNITS.threeVariables),
  ],
};
