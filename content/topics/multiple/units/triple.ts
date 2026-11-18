import type { LearningUnitDefinition } from '../../../types';
import { MI_UNITS } from '../ids';
import { ch5 } from '../sources';
import { laterSteps, readingNote, src, step } from '../steps';

/** Source: §5.3 (printed pages 68–69). Practice: Tutorial 6 Q19. */
export const triple: LearningUnitDefinition = {
  id: MI_UNITS.triple,
  slug: 'triple-integrals',
  title: 'Triple Integrals',
  summary: 'Integrate the innermost variable first, holding the others constant, then the next, then the last.',
  glyph: 'practice',
  tone: 'coral',
  source: [ch5('5.3', 68)],
  steps: [
    step('concept', 'Triple integrals', [
      {
        type: 'definition',
        term: 'Definition of Triple Integral',
        text: 'If $f$ is continuous over a bounded solid region $Q$, then the triple integral of $f$ over $Q$ is defined as',
        tex: '\\iiint_{Q} f(x, y, z)\\,dV = \\lim_{|\\Delta| \\to 0}\\sum_{i=1}^{n} f(x_{i}, y_{i}, z_{i})\\,\\Delta V_{i}',
        source: src('ch5-def-triple'),
      },
      {
        type: 'formula',
        title: 'provided the limit exists. The volume of the solid region Q is given by',
        tex: '\\text{Volume of Q} = \\iiint_{Q} dV.',
        source: src('ch5-def-triple'),
      },
      {
        type: 'paragraph',
        text: 'Evaluation by Iterated Integrals. Let $f$ be continuous on a solid region $Q$ defined by $a \\le x \\le b$, $h_{1}(x) \\le y \\le h_{2}(x)$, $g_{1}(x, y) \\le z \\le g_{2}(x, y)$ where $h_{1}$, $h_{2}$, $g_{1}$ and $g_{2}$ are continuous functions. Then',
        source: src('ch5-5.3-evaluation'),
      },
      {
        type: 'math',
        tex: '\\iiint_{Q} f(x, y, z)\\,dV = \\int_{a}^{b}\\int_{h_{1}(x)}^{h_{2}(x)}\\int_{g_{1}(x, y)}^{g_{2}(x, y)} f(x, y, z)\\,dV.',
        source: src('ch5-5.3-evaluation'),
      },
      readingNote(
        'On the right the differential is printed $dV$; for the iterated integral with these limits it is $dz\\,dy\\,dx$ (innermost first), as in Example 5.3.1.',
      ),
    ]),
    step('worked-example', 'Examples 5.3.1 and 5.3.2', [
      {
        type: 'workedExample',
        title: 'Example 5.3.1',
        prompt:
          'Evaluate the triple iterated integral $\\int_{0}^{2}\\int_{0}^{x}\\int_{0}^{x+y} e^{x}(y + 2z)\\,dz\\,dy\\,dx$.',
        problemTex: '\\int_{0}^{2}\\int_{0}^{x}\\int_{0}^{x+y} e^{x}(y + 2z)\\,dz\\,dy\\,dx',
        method: 'Triple iterated integral',
        steps: [
          {
            explanation: 'For the first integration, hold $x$ and $y$ constant and integrate with respect to $z$.',
            tex: '\\int_{0}^{2}\\int_{0}^{x}\\int_{0}^{x+y} e^{x}(y + 2z)\\,dz\\,dy\\,dx = \\int_{0}^{2}\\int_{0}^{x} e^{x}(yz + z^{2})\\Big]_{0}^{x+y} dy\\,dx = \\int_{0}^{2}\\int_{0}^{x} e^{x}(x^{2} + 3xy + 2y^{2})\\,dy\\,dx.',
          },
          {
            explanation: 'For the second integration, hold $x$ constant and integrate with respect to $y$.',
            tex: '\\int_{0}^{2}\\int_{0}^{x} e^{x}(x^{2} + 3xy + 2y^{2})\\,dy\\,dx = \\int_{0}^{2}\\left[e^{x}\\left(x^{2}y + \\frac{3xy^{2}}{2} + \\frac{2y^{3}}{3}\\right)\\right]_{0}^{x} dx = \\frac{19}{6}\\int_{0}^{2} x^{3}e^{x}\\,dx',
          },
          {
            explanation: '',
            tex: '= \\frac{19}{6}\\left[e^{x}(x^{3} - 3x^{2} + 6x - 6)\\right]_{0}^{2} = \\frac{19}{6}\\left(\\frac{e^{2}}{3} + 1\\right).',
          },
        ],
        resultTex: '\\frac{19}{6}\\left(\\frac{e^{2}}{3} + 1\\right)',
        source: src('ch5-ex-5.3.1'),
        covers: ['ch5-sol-5.3.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      readingNote(
        'Checking the last step: $\\left[e^{x}(x^{3} - 3x^{2} + 6x - 6)\\right]_{0}^{2} = 2e^{2} - (-6) = 2e^{2} + 6$, so the line before the printed answer gives $\\frac{19}{6}(2e^{2} + 6) = 19\\left(\\frac{e^{2}}{3} + 1\\right) \\approx 65.80$. The printed final answer $\\frac{19}{6}\\left(\\frac{e^{2}}{3} + 1\\right) \\approx 10.97$ is a different number. This has been sent to the lecturer for review; the working up to the last line is correct.',
      ),
      {
        type: 'workedExample',
        title: 'Example 5.3.2',
        prompt:
          'If $f(x, y, z) = xy + yz$ and $T$ consists of those points $(x, y, z)$ in space satisfying the inequalities $-1 \\le x \\le 1$, $2 \\le y \\le 3$ and $0 \\le z \\le 1$, then',
        problemTex: '\\iint_{T} f(x, y, z)\\,dV',
        method: 'Triple integral over a box',
        steps: [
          {
            explanation: '',
            tex: '\\iint_{T} f(x, y, z)\\,dV = \\int_{-1}^{1}\\int_{2}^{3}\\int_{0}^{1}(xy + yz)\\,dz\\,dy\\,dx = \\int_{-1}^{1}\\int_{2}^{3}\\left[xyz + \\frac{1}{2}yz^{2}\\right]_{z=0}^{1} dy\\,dx',
          },
          {
            explanation: '',
            tex: '= \\int_{-1}^{1}\\int_{2}^{3}\\left(xy + \\frac{1}{2}y\\right)dy\\,dx = \\int_{-1}^{1}\\left[\\frac{1}{2}xy^{2} + \\frac{1}{4}y^{2}\\right]_{y=2}^{3} dx',
          },
          {
            explanation: '',
            tex: '= = \\int_{-1}^{1}\\left(\\frac{5}{2}x + \\frac{5}{4}\\right)dx = \\left[\\frac{5}{4}x^{2} + \\frac{5}{4}x\\right]_{-1}^{1} = \\frac{5}{2}.',
          },
        ],
        resultTex: '\\frac{5}{2}',
        source: src('ch5-ex-5.3.2'),
        covers: ['ch5-sol-5.3.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    ...laterSteps(MI_UNITS.triple),
  ],
};
