import type { LearningUnitDefinition } from '../../../types';
import { PDA_UNITS } from '../ids';
import { ch4 } from '../sources';
import { appGuidance, laterSteps, src, step } from '../steps';

/** Source: §4.1 (printed page 55). Practice: Tutorial 5 Q2, and Q1 as the §3.3 review. */
export const gradient: LearningUnitDefinition = {
  id: PDA_UNITS.gradient,
  slug: 'gradient',
  title: 'The Gradient',
  summary: 'The gradient ∇f(x, y) = fx i + fy j: a vector built from the first partial derivatives.',
  glyph: 'tangent',
  tone: 'blue',
  source: [ch4('4.1', 55)],
  steps: [
    step('concept', 'The gradient', [
      { type: 'paragraph', text: 'Chapter 4: Applications of the Partial Derivative', source: src('ch4-title') },
      {
        type: 'paragraph',
        text: 'The gradient of a function of two variables is a vector-valued function of two variables.',
        source: src('ch4-4.1-intro'),
      },
      {
        type: 'definition',
        term: '4.1 The Gradient of a Function of Two Variables',
        text: 'Let $z = f(x, y)$ be a function of $x$ and $y$ such that $f_{x}$ and $f_{y}$ exist. The gradient of $f$, denoted by $\\nabla f(x, y)$, is the vector',
        tex: '\\nabla f(x, y) = f_{x}(x, y)\\mathbf{i} + f_{y}(x, y)\\mathbf{j}.',
        source: src('ch4-4.1-definition'),
      },
      {
        type: 'paragraph',
        text: 'We read ‘$\\nabla f$’ as “del $f$”. Another notation for the gradient is grad $f(x, y)$.',
        source: src('ch4-4.1-notation'),
      },
    ]),
    step('worked-example', 'Examples 4.1.1 and 4.1.2', [
      {
        type: 'workedExample',
        title: 'Example 4.1.1',
        prompt: 'Find the gradient of $f(x, y) = y\\ln x + xy^{2}$ at the point $(1, 2)$.',
        problemTex: 'f(x, y) = y\\ln x + xy^{2}, \\quad (1, 2)',
        method: 'Gradient at a point',
        steps: [
          {
            explanation: 'Using $f_{x}(x, y) = \\frac{y}{x} + y^{2}$ and $f_{y}(x, y) = \\ln x + 2xy$, we have',
            tex: '\\nabla f(x, y) = \\left(\\frac{y}{x} + y^{2}\\right)\\mathbf{i} + (\\ln x + 2xy)\\mathbf{j}.',
          },
          {
            explanation: 'At the point $(1, 2)$, the gradient is',
            tex: '\\nabla f(1, 2) = \\left(\\frac{2}{1} + 2^{2}\\right)\\mathbf{i} + (\\ln 1 + 2(1)(2))\\mathbf{i} = 6\\mathbf{i} + 4\\mathbf{j}.',
          },
        ],
        resultTex: '\\nabla f(1, 2) = 6\\mathbf{i} + 4\\mathbf{j}',
        source: src('ch4-ex-4.1.1'),
        covers: ['ch4-sol-4.1.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'workedExample',
        title: 'Example 4.1.2',
        prompt: 'Find $\\nabla f(x, y, z)$ for the function given by $f(x, y, z) = x^{2} + y^{2} - 4z$.',
        problemTex: 'f(x, y, z) = x^{2} + y^{2} - 4z',
        method: 'Gradient',
        steps: [
          {
            explanation: 'The gradient vector is given by',
            tex: '\\nabla f(x, y, z) = f_{x}(x, y, z)\\mathbf{i} + f_{y}(x, y, z)\\mathbf{j} + f_{z}(x, y, z)\\mathbf{k} = 2x\\mathbf{i} + 2y\\mathbf{j} - 4\\mathbf{k}.',
          },
        ],
        resultTex: '\\nabla f(x, y, z) = 2x\\mathbf{i} + 2y\\mathbf{j} - 4\\mathbf{k}',
        source: src('ch4-ex-4.1.2'),
        covers: ['ch4-sol-4.1.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      appGuidance(
        'Example 4.1.2 uses the gradient of a function of three variables, $\\nabla f(x, y, z) = f_{x}\\mathbf{i} + f_{y}\\mathbf{j} + f_{z}\\mathbf{k}$: one component for each variable, in the same way as the two-variable definition.',
      ),
    ]),
    ...laterSteps(PDA_UNITS.gradient),
  ],
};
