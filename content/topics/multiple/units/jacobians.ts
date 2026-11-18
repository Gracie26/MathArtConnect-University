import type { LearningUnitDefinition } from '../../../types';
import { REGIONS_5_4_2_MATH } from '../figures';
import { MI_UNITS } from '../ids';
import { ch5 } from '../sources';
import { appGuidance, laterSteps, readingNote, src, step } from '../steps';

/** Source: §5.4 and §5.4.1 (printed pages 69–73). Practice: Tutorial 6 Q18, Q20–Q25 and Q28–Q34. */
export const jacobians: LearningUnitDefinition = {
  id: MI_UNITS.jacobians,
  slug: 'jacobians',
  title: 'Change of Variables: Jacobians',
  summary: 'Change variables in a double integral: the Jacobian is the factor by which areas change.',
  glyph: 'tangent',
  tone: 'blue',
  source: [ch5('5.4.1', 69)],
  steps: [
    step('concept', 'The Jacobian', [
      {
        type: 'paragraph',
        text: 'The Jacobian is named after the German mathematician Carl Gustav Jacobi (1804-1851). For the single integral $\\int_{a}^{b} f(x)\\,dx$',
        source: src('ch5-5.4.1-jacobi'),
      },
      {
        type: 'formula',
        title: 'you can change variables by letting x = g(u), so that dx = g′(u)du, and obtain',
        tex: "\\int_{a}^{b} f(x)\\,dx = \\int_{c}^{d} f(g(u))g'(u)\\,du",
        note: 'where a = g(c) and b = g(d). (Prior knowledge: substitution in a single integral.)',
        source: src('ch5-5.4.1-single'),
      },
      {
        type: 'paragraph',
        text: "Note that the change of variable introduces an additional factor $g'(u)$ into the integrand. This also occurs in the case of double integrals.",
        source: src('ch5-5.4.1-single'),
      },
      {
        type: 'math',
        tex: '\\iint_{R} f(x, y)\\,dA = \\iint_{S} f(g(u, v), h(u, v))\\underbrace{\\left|\\frac{\\partial x}{\\partial u}\\frac{\\partial y}{\\partial v} - \\frac{\\partial y}{\\partial u}\\frac{\\partial x}{\\partial v}\\right|}_{\\text{Jacobian}}\\,du\\,dv',
        source: src('ch5-5.4.1-double'),
      },
      {
        type: 'paragraph',
        text: 'where the change of variables $x = g(u, v)$ and $y = h(u, v)$ introduces a factor called the Jacobian of $x$ and $y$ with respect to $u$ and $v$.',
        source: src('ch5-5.4.1-double'),
      },
      {
        type: 'definition',
        term: 'Definition of the Jacobian',
        text: 'If $x = g(u, v)$ and $y = h(u, v)$, then the Jacobian of $x$ and $y$ with respect to $u$ and $v$, denoted by $\\frac{\\partial(x, y)}{\\partial(u, v)}$ is',
        tex: '\\frac{\\partial(x, y)}{\\partial(u, v)} = \\begin{vmatrix} \\frac{\\partial x}{\\partial u} & \\frac{\\partial x}{\\partial v} \\\\ \\frac{\\partial y}{\\partial u} & \\frac{\\partial y}{\\partial v} \\end{vmatrix} = \\frac{\\partial x}{\\partial u}\\frac{\\partial y}{\\partial v} - \\frac{\\partial y}{\\partial u}\\frac{\\partial x}{\\partial v}.',
        source: src('ch5-def-jacobian'),
      },
      readingNote(
        'The display above the definition labels the absolute value $\\left|\\ldots\\right|$ "Jacobian", while the Definition of the Jacobian has no absolute value: the Jacobian itself can be negative, and Theorem 5.4.1 uses its absolute value $\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right|$.',
      ),
      {
        type: 'formula',
        title:
          'In cases it is more convenient to express u and v in terms of x and y, we can first compute ∂(u, v)/∂(x, y) explicitly and then find the needed Jacobian ∂(x, y)/∂(u, v) from the formula',
        tex: '\\frac{\\partial(x, y)}{\\partial(u, v)} \\cdot \\frac{\\partial(u, v)}{\\partial(x, y)} = 1.',
        source: src('ch5-5.4.1-reciprocal'),
      },
      appGuidance(
        'What the Jacobian measures: a small rectangle of sides $\\Delta u$ and $\\Delta v$ in the $uv$-plane is carried to a small region of area about $\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right|\\Delta u\\,\\Delta v$ in the $xy$-plane. Transformation Lab in Explore lets you compare the two areas cell by cell.',
      ),
    ]),
    step(
      'see-it',
      'See it',
      [
        { type: 'figure', figure: REGIONS_5_4_2_MATH },
        appGuidance(
          'The notes print no figure for §5.4. This drawing shows Example 5.4.2: the change of variables $u = x + y$, $v = x - 2y$ turns the parallelogram $R$ into the rectangle $S$, whose limits are constants. Matching cells are shaded in both planes; each cell of $R$ has $\\frac{1}{3}$ of the area of its cell in $S$, because $\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| = \\frac{1}{3}$.',
        ),
      ],
      { required: false },
    ),
    step('worked-example', 'Examples 5.4.1 to 5.4.4 and Theorem 5.4.1', [
      {
        type: 'workedExample',
        title: 'Example 5.4.1',
        prompt: 'Find the Jacobian for the change of variables defined by $x = r\\cos\\theta$ and $y = r\\sin\\theta$.',
        problemTex: 'x = r\\cos\\theta, \\quad y = r\\sin\\theta',
        method: 'Definition of the Jacobian',
        steps: [
          {
            explanation: 'From the definition of a Jacobian, we obtain',
            tex: '\\frac{\\partial(x, y)}{\\partial(r, \\theta)} = \\begin{vmatrix} \\frac{\\partial x}{\\partial r} & \\frac{\\partial x}{\\partial\\theta} \\\\ \\frac{\\partial y}{\\partial r} & \\frac{\\partial y}{\\partial\\theta} \\end{vmatrix} = \\begin{vmatrix} \\cos\\theta & -r\\sin\\theta \\\\ \\sin\\theta & r\\cos\\theta \\end{vmatrix} = r\\cos^{2}\\theta + r\\sin^{2}\\theta = r.',
          },
        ],
        resultTex: '\\frac{\\partial(x, y)}{\\partial(r, \\theta)} = r',
        source: src('ch5-ex-5.4.1'),
        covers: ['ch5-sol-5.4.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'formula',
        title:
          'The above example points out that the change of variables from rectangular to polar coordinates for a double integral can be written as',
        tex: '\\iint_{R} f(x, y)\\,dA = \\iint_{S} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta, \\; r > 0 = \\iint_{S} f(r\\cos\\theta, r\\sin\\theta)\\left|\\frac{\\partial(x, y)}{\\partial(r, \\theta)}\\right| dr\\,d\\theta',
        note: 'where S is the region in the rθ-plane that corresponds to the region R in the xy-plane.',
        source: src('ch5-5.4.1-polar'),
      },
      appGuidance(
        'The notes give no example of describing a region in polar coordinates. From a sketch: a disc of radius $a$ centred at the origin is $0 \\le r \\le a$, $0 \\le \\theta \\le 2\\pi$; a ring between radii $a$ and $b$ is $a \\le r \\le b$; the part in the first quadrant has $0 \\le \\theta \\le \\frac{\\pi}{2}$. For example, $0 \\le y \\le \\sqrt{1 - x^{2}}$, $0 \\le x \\le 1$ is the quarter disc $0 \\le r \\le 1$, $0 \\le \\theta \\le \\frac{\\pi}{2}$.',
      ),
      {
        type: 'paragraph',
        text: 'In general, a change of variables is given by a one-to-one transformation $T$ from a region $S$ in the $uv$-plane to a region $R$ in the $xy$-plane, to be given by $T(u, v) = (x, y) = (g(u, x), h(u, v))$ where $g$ and $h$ have continuous first partial derivatives in the region $S$. Note that the point $(u, v)$ lies in $S$ and the point $(x, y)$ lies in $R$. In most cases, we are hunting for a transformation for which the region $S$ is simpler than the region $R$.',
        source: src('ch5-5.4.1-transformation'),
      },
      readingNote(
        'In $T(u, v) = (g(u, x), h(u, v))$ the first component is presumably $g(u, v)$, as in $x = g(u, v)$.',
      ),
      {
        type: 'theorem',
        label: 'Theorem 5.4.1',
        title: 'Change of Variables for Double Integrals',
        text: 'Let $R$ and $S$ be regions in the $xy$- and $uv$-planes that are related by the equations $x = g(u, v)$ and $y = h(u, v)$ such that each point in $R$ is the image of a unique point in $S$. If $f$ is continuous on $R$, $g$ and $h$ have continuous partial derivatives on $S$, and $\\frac{\\partial(x, y)}{\\partial(u, v)}$ is non-zero on $S$, then',
        tex: '\\iint_{R} f(x, y)\\,dA = \\iint_{S} f(g(u, v), h(u, v))\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| du\\,dv.',
        source: src('ch5-thm-5.4.1'),
      },
      {
        type: 'workedExample',
        title: 'Example 5.4.2',
        prompt:
          'Let $R$ be the region bounded by the lines $x - 2y = 0$, $x - 2y = -4$, $x + y = 4$, and $x + y = 1$. Evaluate the double integral $\\iint_{R} 3xy\\,dA$.',
        problemTex: '\\iint_{R} 3xy\\,dA',
        method: 'Change of variables (Theorem 5.4.1)',
        steps: [
          {
            explanation:
              'to begin, let $u = x + y$ and $v = x - 2y$. Solving this system of equations for $x$ and $y$ produces $x = \\frac{1}{3}(2u + v)$ and $y = \\frac{1}{3}(u - v)$. The partial derivatives of $x$ and $y$ are',
            tex: '\\frac{\\partial x}{\\partial u} = \\frac{2}{3}, \\quad \\frac{\\partial x}{\\partial v} = \\frac{1}{3}, \\quad \\frac{\\partial y}{\\partial u} = \\frac{1}{3} \\quad \\text{and} \\quad \\frac{\\partial y}{\\partial v} = -\\frac{1}{3}',
          },
          {
            explanation: 'which implies that the Jacobian is',
            tex: '\\frac{\\partial(x, y)}{\\partial(u, v)} = \\begin{vmatrix} \\frac{\\partial x}{\\partial u} & \\frac{\\partial x}{\\partial v} \\\\ \\frac{\\partial y}{\\partial u} & \\frac{\\partial y}{\\partial v} \\end{vmatrix} = \\begin{vmatrix} \\frac{2}{3} & \\frac{1}{3} \\\\ \\frac{1}{3} & -\\frac{1}{3} \\end{vmatrix} = -\\frac{2}{9} - \\frac{1}{9} = -\\frac{1}{3}.',
          },
          {
            explanation: 'Therefore, we obtain',
            tex: '\\iint_{R} 3xy\\,dA = \\iint_{S} 3\\left[\\frac{1}{3}(2u + v)\\frac{1}{3}(u - v)\\right]\\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| dv\\,du = \\int_{1}^{4}\\int_{-4}^{0}\\frac{1}{9}(2u^{2} - uv - v^{2})\\,dv\\,du',
          },
          {
            explanation: '',
            tex: '= \\frac{1}{9}\\int_{1}^{4}\\left[2u^{2}v - \\frac{uv^{2}}{2} - \\frac{v^{3}}{3}\\right]_{-4}^{0} du = \\frac{1}{9}\\int_{1}^{4}\\left(8u^{2} + 8u - \\frac{64}{3}\\right)du = \\frac{1}{9}\\left[\\frac{8u^{3}}{3} + 4u^{2} - \\frac{64}{3}u\\right]_{1}^{4} = \\frac{164}{9}.',
          },
        ],
        resultTex: '\\frac{164}{9}',
        source: src('ch5-ex-5.4.2'),
        covers: ['ch5-sol-5.4.2'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'workedExample',
        title: 'Example 5.4.3',
        prompt:
          'Suppose $R$ is the plane bounded by the hyperbolas $xy = 1$, $xy = 3$ and $x^{2} - y^{2} = 1$, $x^{2} - y^{2} = 4$. Find $\\iint_{R}(x^{2} + y^{2})\\,dx\\,dy$.',
        problemTex: '\\iint_{R}(x^{2} + y^{2})\\,dx\\,dy',
        method: 'Change of variables with the reciprocal Jacobian',
        steps: [
          {
            explanation:
              'The hyperbolas bounding $R$ are $u$−curves and $v$−curves if $u = xy$ and $v = x^{2} - y^{2}$. We can most easily write $x^{2} + y^{2}$ in terms of $u$ and $v$ by first noting that',
            tex: '4u^{2} + v^{2} = 4x^{2}y^{2} + (x^{2} - y^{2})^{2} = (x^{2} + y^{2})^{2},',
          },
          {
            explanation: 'so that $x^{2} + y^{2} = \\sqrt{4u^{2} + v^{2}}$. Now',
            tex: '\\frac{\\partial(u, v)}{\\partial(x, y)} = \\begin{vmatrix} y & x \\\\ 2x & -2y \\end{vmatrix} = -2(x^{2} + y^{2}).',
          },
          {
            explanation: 'Hence we have',
            tex: '\\frac{\\partial(x, y)}{\\partial(u, v)} = -\\frac{1}{2(x^{2} + y^{2})} = -\\frac{1}{2\\sqrt{4u^{2} + v^{2}}}.',
          },
          {
            explanation: 'Therefore',
            tex: '\\iint_{R}(x^{2} + y^{2})\\,dx\\,dy = \\int_{1}^{4}\\int_{1}^{3}\\sqrt{4u^{2} + v^{2}}\\frac{1}{2\\sqrt{4u^{2} + v^{2}}}\\,du\\,dv = \\int_{1}^{4}\\int_{1}^{3}\\frac{1}{2}\\,du\\,dv = 3.',
          },
        ],
        resultTex: '3',
        source: src('ch5-ex-5.4.3'),
        covers: ['ch5-sol-5.4.3'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      readingNote(
        'The four hyperbolas bound two separate regions, one in the first quadrant and one in the third; the value $3$ is the integral over one of them. The Jacobian found is negative, and the next line uses its absolute value $\\frac{1}{2\\sqrt{4u^{2} + v^{2}}}$, as Theorem 5.4.1 requires.',
      ),
      {
        type: 'workedExample',
        title: 'Example 5.4.4',
        prompt:
          'Find the area of the region $R$ bounded by the curves $xy = 1$, $xy = 3$ and $xy^{1.4} = 1$, $xy^{1.4} = 2$.',
        problemTex: '\\text{Area of } R = \\iint_{R} dx\\,dy',
        method: 'Area by a change of variables',
        steps: [
          {
            explanation: 'Define change of variables transformation by $u = xy$ and $v = xy^{1.4}$. Then',
            tex: '\\frac{\\partial(u, v)}{\\partial(x, y)} = \\begin{vmatrix} y & x \\\\ y^{1.4} & (1.4)xy^{0.4} \\end{vmatrix} = (0.4)xy^{1.4} = (0.4)v.',
          },
          {
            explanation: 'So',
            tex: '\\frac{\\partial(x, y)}{\\partial(u, v)} = \\frac{1}{\\frac{\\partial(u, v)}{\\partial(x, y)}} = \\frac{2.5}{v}.',
          },
          {
            explanation: 'Consequently,',
            tex: '\\iint_{R} dx\\,dy = \\int_{1}^{2}\\int_{1}^{3}\\frac{2.5}{v}\\,du\\,dv = 5\\ln 2.',
          },
        ],
        resultTex: '5\\ln 2',
        source: src('ch5-ex-5.4.4'),
        covers: ['ch5-sol-5.4.4'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    ...laterSteps(MI_UNITS.jacobians),
  ],
};
