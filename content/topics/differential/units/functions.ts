import type { LearningUnitDefinition } from '../../../types';
import { APP_DOMAIN_3_1_1 } from '../figures';
import { RN_UNITS } from '../ids';
import { ch3 } from '../sources';
import { laterSteps, src, step } from '../steps';

/** Source: chapter introduction and §3.1 (printed pages 43–44). */
export const functionsOfSeveralVariables: LearningUnitDefinition = {
  id: RN_UNITS.functions,
  slug: 'functions-of-several-variables',
  title: 'Functions of Several Variables',
  summary: 'Functions of two or more variables, their domain and range, and how such functions are combined.',
  glyph: 'function-art',
  tone: 'blue',
  source: [ch3('3.1', 43)],
  steps: [
    step('concept', 'Functions of two or more variables', [
      {
        type: 'callout',
        tone: 'insight',
        title: 'Chapter 3: Differential Calculus in ℝⁿ',
        text: 'This topic follows Chapter 3 of the course notes.',
        source: src('ch3-title'),
      },
      {
        type: 'paragraph',
        text: 'So far we have dealt only with functions of single (independent) variables. Many familiar quantities, however, are functions of two or more variables. For instance, the work done by a force ($W = FD$) and the volume of a right circular cylinder ($V = \\pi r^{2}h$) are both functions of two variables. The volume of a rectangular solid ($V = lwh$) is a function of three variables. The notation for a function of two or three variables is as follows',
        source: src('ch3-intro-several'),
      },
      {
        type: 'math',
        tex: 'z = f\\underbrace{(x, y)}_{\\text{2 variables}} = x^{2} + xy',
        source: src('ch3-intro-notation'),
      },
      { type: 'paragraph', text: 'and', source: src('ch3-intro-notation') },
      {
        type: 'math',
        tex: 'w = f\\underbrace{(x, y, z)}_{\\text{3 variables}} = x + 2y - 3z.',
        source: src('ch3-intro-notation'),
      },
      {
        type: 'definition',
        term: '3.1 Definition of a Function of Two Variables',
        text: 'Let $D$ be a set of ordered pairs of real numbers. If to each ordered pair $(x, y)$ in $D$ there corresponds a unique real number $f(x, y)$, then $f$ is called a function of $x$ and $y$. The set $D$ is the domain of $f$ and the corresponding set of values for $f(x, y)$ is the range of $f$. For the function given by $z = f(x, y)$, we call $x$ and $y$ the independent variables and $z$ the dependent variable.',
        source: src('ch3-3.1-definition'),
      },
      {
        type: 'paragraph',
        text: 'As with functions of one variable, the most common way to describe a function of several variables is with an equation, and unless otherwise restricted, we can assume that the domain is the set of all points for which the equation is defined. for example, the domain of the function given by',
        source: src('ch3-3.1-domain'),
      },
      { type: 'math', tex: 'f(x, y) = x^{2} + y^{2}', source: src('ch3-3.1-domain') },
      { type: 'paragraph', text: 'is assumed to be the entire $xy$-plane.', source: src('ch3-3.1-domain') },
    ]),
    step('worked-example', 'Example 3.1.1', [
      {
        type: 'workedExample',
        title: 'Example 3.1.1',
        prompt: 'Find the domains of the following functions.',
        problemTex:
          '\\text{(i)}\\quad f(x, y) = \\frac{\\sqrt{x^{2} + y^{2} - 9}}{x} \\qquad \\text{(ii)}\\quad g(x, y, z) = \\frac{x}{\\sqrt{9 - x^{2} - y^{2} - z^{2}}}.',
        method: 'Find the points where each formula is defined',
        figure: APP_DOMAIN_3_1_1,
        steps: [
          {
            explanation:
              '(i) The function $f$ is defined for all points $(x, y)$ such that $x \\neq 0$ and $x^{2} + y^{2} \\geq 9$. Thus, the domain is the set of all points lying on or outside the circle $x^{2} + y^{2} = 9$.',
          },
          {
            explanation:
              '(ii) The function $g$ is defined for all points $(x, y, z)$ such that $x^{2} + y^{2} + z^{2} < 9$. Consequently, the domain is the set of all points $(x, y, z)$ lying inside a sphere of radius $3$ that is centred at the origin.',
          },
        ],
        resultTex:
          '\\text{(i)}\\; x \\neq 0,\\; x^{2} + y^{2} \\geq 9 \\qquad \\text{(ii)}\\; x^{2} + y^{2} + z^{2} < 9',
        source: src('ch3-ex-3.1.1'),
        covers: ['ch3-sol-3.1.1'],
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
      {
        type: 'paragraph',
        text: 'Functions of several variables can be combined in the same ways as functions of single variables. For instance, we can form the sum, difference, product and quotients of two functions of two variables as follows',
        source: src('ch3-3.1-combining'),
      },
      {
        type: 'formulaList',
        title: 'Combining functions of two variables',
        items: [
          {
            tex: '(f \\pm g)(x, y) = f(x, y) \\pm g(x, y)',
            note: '1. Sum or Difference.',
            source: src('ch3-3.1-combining-rules'),
          },
          { tex: '(fg)(x, y) = f(x, y)g(x, y)', note: '2. Product.', source: src('ch3-3.1-combining-rules') },
          {
            tex: '\\frac{f}{g}(x, y) = \\frac{f(x, y)}{g(x, y)}, \\quad g(x, y) \\neq 0',
            note: '3. Quotient.',
            source: src('ch3-3.1-combining-rules'),
          },
        ],
        source: src('ch3-3.1-combining-rules'),
      },
    ]),
    ...laterSteps(RN_UNITS.functions),
  ],
};
