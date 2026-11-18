import type { LearningUnitDefinition } from '../../../types';
import { PDA_UNITS } from '../ids';
import { ch4 } from '../sources';
import { appGuidance, laterSteps, src, step } from '../steps';

/** Source: §4.2 and §4.2.1 (printed pages 56–58). Practice: Tutorial 5 Q3 and Q4. */
export const tangentPlanes: LearningUnitDefinition = {
  id: PDA_UNITS.tangentPlanes,
  slug: 'tangent-planes-normal-lines',
  title: 'Tangent Planes and Normal Lines',
  summary: 'The tangent plane and normal line to a surface F(x, y, z) = 0, both found from ∇F at the point.',
  glyph: 'function-art',
  tone: 'teal',
  source: [ch4('4.2', 56), ch4('4.2.1', 56)],
  steps: [
    step('concept', 'Tangent plane and normal line to a surface', [
      {
        type: 'paragraph',
        text: 'So far we have represented surfaces in space primarily by the equations of the form $z = f(x, y)$. In general, the representation is $F(x, y, z) = 0$. For a surface $S$ given by $z = f(x, y)$, we can convert to the general form by defining $F$ as $F(x, y, z) = f(x, y) - z$. Then, because $f(x, y) - z = 0$, we can consider $S$ to be the level surface of $F$ given by $F(x, y, z) = 0$.',
        source: src('ch4-4.2.1-general-form'),
      },
      {
        type: 'paragraph',
        text: 'In the process of finding a normal line to a surface, we are also able to solve the problem of finding a tangent plane to the surface. Let $S$ be a surface given by $F(x, y, z) = 0$, and $p = (x_{0}, y_{0}, z_{0})$ be the point on $S$. Let $C$ be a curve on $S$ through $P$ that is defined by the vector-valued function $\\mathbf{r}(t) = x(t)\\mathbf{i} + y(t)\\mathbf{j} + z(t)\\mathbf{k}$. Then, for all $t$',
        source: src('ch4-4.2.1-curve'),
      },
      { type: 'math', tex: 'F(x(t), y(t), z(t)) = 0.', source: src('ch4-4.2.1-curve') },
      {
        type: 'paragraph',
        text: "If $F$ is differentiable and $x'(t)$, $y'(t)$ and $z'(t)$ all exist, it follows from the Chain Rule that",
        source: src('ch4-4.2.1-curve'),
      },
      {
        type: 'math',
        tex: "0 = F'(t) = F_{x}(x, y, z)x'(t) + F_{y}(x, y, z)y'(t) + F_{z}(x, y, z)z'(t).",
        source: src('ch4-4.2.1-curve'),
      },
      {
        type: 'paragraph',
        text: 'At $(x_{0}, y_{0}, z_{0})$, the equivalent vector form is',
        source: src('ch4-4.2.1-curve'),
      },
      {
        type: 'math',
        tex: "0 = \\underbrace{\\nabla F(x_{0}, y_{0}, z_{0})}_{\\text{Gradient}} \\cdot \\underbrace{\\mathbf{r}'(t)}_{\\text{Tangent Vector}}.",
        source: src('ch4-4.2.1-curve'),
      },
      {
        type: 'paragraph',
        text: 'This result means that the gradient at $P$ is orthogonal to the tangent vector of every curve on $S$ through $P$.',
        source: src('ch4-4.2.1-orthogonal'),
      },
      {
        type: 'theorem',
        label: 'Theorem 4.2.1',
        title: 'Definition of Tangent Plane and Normal Line',
        text: 'Let $F$ be differentiable at the point $P = (x_{0}, y_{0}, z_{0})$ on the surface $S$ given by $F(x, y, z) = 0$ such that $\\nabla F(x_{0}, y_{0}, z_{0}) \\neq 0$.\n1. The plane through $P$ that is normal to $\\nabla F(x_{0}, y_{0}, z_{0})$ is called the tangent plane to $S$ at $P$.\n2. The line through $P$ having the same direction of $\\nabla F(x_{0}, y_{0}, z_{0})$ is called the normal line to $S$ at $P$.',
        source: src('ch4-thm-4.2.1'),
      },
      {
        type: 'theorem',
        label: 'Theorem 4.2.2',
        title: 'Equation of Tangent Plane',
        text: 'If $F$ is differentiable at $(x_{0}, y_{0}, z_{0})$ then an equation of the tangent plane to the surface given by $F(x, y, z) = 0$ at $(x_{0}, y_{0}, z_{0})$ is',
        tex: 'F_{x}(x_{0}, y_{0}, z_{0})(x - x_{0}) + F_{y}(x_{0}, y_{0}, z_{0})(y - y_{0}) + F_{z}(x_{0}, y_{0}, z_{0})(z - z_{0}) = 0.',
        source: src('ch4-thm-4.2.2'),
      },
    ]),
    step('worked-example', 'Examples 4.2.1 to 4.2.3', [
      {
        type: 'workedExample',
        title: 'Example 4.2.1',
        prompt:
          'Find an equation of the tangent plane to the hyperboloid given by $z^{2} - 2x^{2} - 2y^{2} = 12$ at the point $(1, -1, 4)$.',
        problemTex: 'z^{2} - 2x^{2} - 2y^{2} = 12, \\quad (1, -1, 4)',
        method: 'Tangent plane (Theorem 4.2.2)',
        steps: [
          { explanation: 'Begin by writing the equation of the surface as', tex: 'z^{2} - 2x^{2} - 2y^{2} - 12 = 0.' },
          {
            explanation: 'Then, considering $F(x, y, z) = z^{2} - 2x^{2} - 2y^{2} - 12$ we have',
            tex: 'F_{x}(x, y, z) = -4x, \\quad F_{y}(x, y, z) = -4y, \\quad F_{z}(x, y, z) = 2z.',
          },
          {
            explanation: 'At the point $(1, -1, 4)$, the partial derivatives are',
            tex: 'F_{x}(1, -1, 4) = -4, \\quad F_{y}(1, -1, 4) = 4, \\quad F_{z}(1, -1, 4) = 8.',
          },
          {
            explanation: 'Therefore, an equation of the tangent plane at $(1, -1, 4)$ is',
            tex: '-4(x - 1) + 4(y + 1) + 8(z - 4) = 0',
          },
          { explanation: '', tex: '-4x + 4 + 4y + 4 + 8z - 32 = 0' },
          { explanation: '', tex: '-4x + 4y + 8z - 24 = 0' },
          { explanation: '', tex: 'x - y - 2z + 6 = 0.' },
        ],
        resultTex: 'x - y - 2z + 6 = 0',
        source: src('ch4-ex-4.2.1'),
        covers: ['ch4-sol-4.2.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'paragraph',
        text: 'To find the equation of the tangent plane at a point on a surface given by $z = f(x, y)$, we can define the function $F$ by $F(x, y, z) = f(x, y) - z$. Then $S$ is given by the level surface $F(x, y, z) = 0$ and an equation of the tangent plane to $S$ at the point $(x_{0}, y_{0}, z_{0})$ is',
        source: src('ch4-4.2.1-z-form'),
      },
      {
        type: 'math',
        tex: 'f_{x}(x_{0}, y_{0})(x - x_{0}) + f_{y}(x_{0}, y_{0})(y - y_{0}) - (z - z_{0}) = 0.',
        source: src('ch4-4.2.1-z-form'),
      },
      {
        type: 'workedExample',
        title: 'Example 4.2.2',
        prompt:
          'Find the equation of the tangent plane to the paraboloid $z = 1 - \\frac{1}{10}(x^{2} + 4y^{2})$ at the point $\\left(1, 1, \\frac{1}{2}\\right)$.',
        problemTex: 'z = 1 - \\frac{1}{10}(x^{2} + 4y^{2}), \\quad \\left(1, 1, \\frac{1}{2}\\right)',
        method: 'Tangent plane to z = f(x, y)',
        steps: [
          {
            explanation: 'From $z = 1 - \\frac{1}{10}(x^{2} + 4y^{2})$, we obtain',
            tex: 'f_{x}(x, y) = -\\frac{x}{5} \\implies f_{x}(1, 1) = -\\frac{1}{5} \\quad \\text{and} \\quad f_{y}(x, y) = -\\frac{4y}{5} \\implies f_{y}(1, 1) = -\\frac{4}{5}.',
          },
          {
            explanation: 'Therefore, an equation of the tangent plane at $\\left(1, 1, \\frac{1}{2}\\right)$ is',
            tex: 'f_{x}(1, 1)(x - 1) + f_{y}(1, 1)(y - 1) - \\left(z - \\frac{1}{2}\\right) = 0',
          },
          { explanation: '', tex: '-\\frac{1}{5}(x - 1) - \\frac{4}{5}(y - 1) - \\left(z - \\frac{1}{2}\\right) = 0' },
          { explanation: '', tex: '-\\frac{1}{5}x - \\frac{4}{5}y - z + \\frac{3}{2} = 0.' },
        ],
        resultTex: '-\\frac{1}{5}x - \\frac{4}{5}y - z + \\frac{3}{2} = 0',
        source: src('ch4-ex-4.2.2'),
        covers: ['ch4-sol-4.2.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'paragraph',
        text: 'The gradient $\\nabla F(x, y, z)$ gives a convenient way to find equations of normal lines.',
        source: src('ch4-4.2.1-normal-note'),
      },
      {
        type: 'workedExample',
        title: 'Example 4.2.3',
        prompt:
          'Find a set of symmetric equations for the normal line to the surface given by $xyz = 6$ at the point $(2, 3, 1)$.',
        problemTex: 'xyz = 6, \\quad (2, 3, 1)',
        method: 'Normal line (Theorem 4.2.1)',
        steps: [
          {
            explanation: 'Begin by writing $F(x, y, z) = xyz - 6$. Then, the gradient is given by',
            tex: '\\nabla F(x, y, z) = F_{x}(x, y, z)\\mathbf{i} + F_{y}(x, y, z)\\mathbf{j} + F_{z}(x, y, z)\\mathbf{k} = yz\\mathbf{i} + xz\\mathbf{j} + xy\\mathbf{k}',
          },
          {
            explanation: 'and at point $(2, 3, 1)$ we have',
            tex: '\\nabla F(2, 3, 1) = (3)(1)\\mathbf{i} + (2)(1)\\mathbf{j} + (2)(3)\\mathbf{k} = 3\\mathbf{i} + 2\\mathbf{j} + 6\\mathbf{k}.',
          },
          {
            explanation:
              'The normal line at $(2, 3, 1)$ has direction numbers $3$, $2$ and $6$, and the corresponding set of symmetric equations is',
            tex: '\\frac{x - 2}{3} = \\frac{y - 3}{2} = \\frac{z - 1}{6}.',
          },
        ],
        resultTex: '\\frac{x - 2}{3} = \\frac{y - 3}{2} = \\frac{z - 1}{6}',
        source: src('ch4-ex-4.2.3'),
        covers: ['ch4-sol-4.2.3'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      appGuidance(
        'Example 4.2.3 uses the components of $\\nabla F$ as direction numbers. In general, when $F_{x}$, $F_{y}$ and $F_{z}$ at $(x_{0}, y_{0}, z_{0})$ are all nonzero, the normal line has symmetric equations $\\frac{x - x_{0}}{F_{x}} = \\frac{y - y_{0}}{F_{y}} = \\frac{z - z_{0}}{F_{z}}$. Any nonzero multiple of the direction numbers gives the same line.',
      ),
    ]),
    ...laterSteps(PDA_UNITS.tangentPlanes),
  ],
};
