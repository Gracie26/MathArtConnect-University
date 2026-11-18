import type { LearningUnitDefinition } from '../../../types';
import { PDA_UNITS } from '../ids';
import { ch4 } from '../sources';
import { appGuidance, laterSteps, src, step } from '../steps';

/** Source: §4.3.1, "The Second Partials Test" (printed pages 60–61). Practice: Tutorial 5 Q5. */
export const secondPartials: LearningUnitDefinition = {
  id: PDA_UNITS.secondPartials,
  slug: 'second-partials-test',
  title: 'The Second Partials Test',
  summary: 'Classify a critical point as a relative minimum, relative maximum or saddle point using d.',
  glyph: 'wave',
  tone: 'coral',
  source: [ch4('4.3.1', 60)],
  steps: [
    step('concept', 'The Second Partials Test', [
      {
        type: 'paragraph',
        text: 'Some critical points yield saddle points, which are neither relative maxima nor relative minima.',
        source: src('ch4-4.3.1-saddle'),
      },
      {
        type: 'theorem',
        label: 'Theorem 4.3.3',
        text: 'Let $f$ have continuous second partial derivatives on an open region containing a point $(a, b)$ for which $f_{x}(a, b) = 0$ and $f_{y}(a, b) = 0$. To test for relative extrema of $f$, we define the quantity',
        tex: 'd = f_{xx}(a, b)f_{yy}(a, b) - [f_{xy}(a, b)]^{2}.',
        textAfter:
          '1. If $d > 0$ and $f_{xx}(a, b) > 0$, then $f$ has a relative minimum at $(a, b)$.\n2. If $d > 0$ and $f_{xx}(a, b) < 0$, then $f$ has a relative maximum at $(a, b)$.\n3. If $d < 0$, then $(a, b, f(a, b))$ is a saddle point.\n4. The test is inconclusive if $d = 0$.',
        source: src('ch4-thm-4.3.3'),
      },
      {
        type: 'paragraph',
        text: 'A convenient device for remembering the formula for $d$ in the Second Partials Test is given by the $2 \\times 2$ determinant',
        source: src('ch4-4.3.1-determinant'),
      },
      {
        type: 'math',
        tex: 'd = \\begin{vmatrix} f_{xx}(a, b) & f_{xy}(a, b) \\\\ f_{yx}(a, b) & f_{yy}(a, b) \\end{vmatrix}',
        source: src('ch4-4.3.1-determinant'),
      },
      { type: 'paragraph', text: 'where $f_{xy}(a, b) = f_{yx}(a, b)$.', source: src('ch4-4.3.1-determinant') },
    ]),
    step('worked-example', 'Example 4.3.3', [
      {
        type: 'workedExample',
        title: 'Example 4.3.3',
        prompt: 'Find the relative extrema of $f(x, y) = -x^{3} + 4xy - 2y^{2} + 1$.',
        problemTex: 'f(x, y) = -x^{3} + 4xy - 2y^{2} + 1',
        method: 'Second Partials Test (Theorem 4.3.3)',
        steps: [
          {
            explanation: 'Begin by finding the critical points of $f$. Because',
            tex: 'f_{x}(x, y) = -3x^{2} + 4y \\quad \\text{and} \\quad f_{y}(x, y) = 4x - 4y',
          },
          {
            explanation:
              'are defined for all $x$ and $y$, the only critical points are those for which both first partial derivatives are $0$. Solving the equations $-3x^{2} + 4y = 0$ and $4x - 4y = 0$, we see that from the second equation that $x = y$, and by substitution into the first equation, we obtain two solutions, $y = x = 0$ and $y = x = \\frac{4}{3}$. Because',
            tex: 'f_{xx}(x, y) = -6x, \\quad f_{yy}(x, y) = -4, \\quad f_{xy}(x, y) = 4',
          },
          {
            explanation: 'it follows that, for the critical point $(0, 0)$,',
            tex: 'd = f_{xx}(0, 0)f_{yy}(0, 0) - [f_{xy}(0, 0)]^{2} = 0 - 16 < 0',
          },
          {
            explanation:
              'and, by the Second Partials Test, we can conclude that $(0, 0)$ is a saddle point of $f$. Furthermore, for the critical point $\\left(\\frac{4}{3}, \\frac{4}{3}\\right)$,',
            tex: 'd = f_{xx}\\left(\\frac{4}{3}, \\frac{4}{3}\\right)f_{yy}\\left(\\frac{4}{3}, \\frac{4}{3}\\right) - \\left[f_{xy}\\left(\\frac{4}{3}, \\frac{4}{3}\\right)\\right]^{2} = -8(-4) - 16 > 0',
          },
          {
            explanation:
              'and because $f_{xx}\\left(\\frac{4}{3}, \\frac{4}{3}\\right) = -8 < 0$ we can conclude that $f$ has a relative maximum at $\\left(\\frac{4}{3}, \\frac{4}{3}\\right)$.',
          },
        ],
        resultTex:
          '(0, 0)\\; \\text{saddle point}, \\quad \\left(\\frac{4}{3}, \\frac{4}{3}\\right)\\; \\text{relative maximum}',
        source: src('ch4-ex-4.3.3'),
        covers: ['ch4-sol-4.3.3'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      appGuidance(
        'The notes do not state the value of the relative maximum in Example 4.3.3. Substituting gives $f\\left(\\frac{4}{3}, \\frac{4}{3}\\right) = -\\frac{64}{27} + \\frac{64}{9} - \\frac{32}{9} + 1 = \\frac{59}{27}$.',
      ),
    ]),
    ...laterSteps(PDA_UNITS.secondPartials),
  ],
};
