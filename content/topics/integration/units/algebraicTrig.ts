import type { LearningUnitDefinition } from '../../../types';
import { INTEGRATION_UNITS } from '../ids';
import { ch1 } from '../sources';
import { activityStep, practiseStep, reflectAndReview, src, step, tryItStep } from '../steps';

/**
 * Source: Chapter 1, §1.8, §1.8.1 and §1.9 (all items in the inventory for
 * these sections). Lines under review (MR-06, MR-07, MR-09, MR-16) are shown
 * as printed with a review note; Exercise 1.8.1 (MR-02) is withheld from
 * learners until confirmed.
 */
export const algebraicTrigSubstitution: LearningUnitDefinition = {
  id: INTEGRATION_UNITS.algebraicTrig,
  slug: 'algebraic-and-trigonometric-substitution',
  title: 'Algebraic and Trigonometric Substitution',
  summary: 'Substitutions that remove roots and turn sines and cosines into rational functions.',
  glyph: 'function-art',
  tone: 'teal',
  source: [ch1('1.8', 12), ch1('1.8.1', 14), ch1('1.9', 15)],
  steps: [
    step(
      'concept',
      'Transform into a rational function',
      [
        {
          type: 'paragraph',
          text: 'To integrate algebraic functions we normally need an appropriate substitution that reduces the integrand to a rational function. Once the integrand is a rational function of the new variable, one of the earlier methods integrates it. It is convenient to regard one part of the algebraic function as $y$, giving a rational function of $x$ and $y$.',
          source: src('ch1-1.8-intro'),
        },
        {
          type: 'paragraph',
          text: 'The next step is to connect $x$ and $y$ through a third variable $t$. Let $x = r_{1}(t)$ and $y = r_{2}(t)$, where $r_{1}$ and $r_{2}$ are rational functions of $t$. Then the integral becomes the integral of a rational function $R(t)$, which we can integrate.',
          source: src('ch1-1.8-framework'),
        },
        {
          type: 'math',
          tex: "\\int \\frac{2x+3+2y}{5x-7-y}\\,dx = \\int \\frac{2x+3+2r_{2}(t)}{5x-7-r_{2}(t)} \\cdot r_{1}'(t)\\,dt = \\int R(t)\\,dt",
          source: src('ch1-1.8-framework'),
        },
        {
          type: 'paragraph',
          text: 'This method is called integration by substitution and rationalisation. Many cases are known in which $x$ and $y$ are connected to a third variable $t$ by rational functions of $t$. Rather than investigate them in detail, the table below gives suitable substitutions for given integrands.',
          source: src('ch1-1.8-name'),
        },
        {
          type: 'table',
          title: 'Suggested substitutions',
          columns: ['Type of integrand', 'Suggested substitution'],
          note: 'In each case the restriction on θ is imposed to ensure that the function that defines the substitution is one-to-one.',
          source: src('ch1-1.8-table-note'),
          rows: [
            {
              left: '$\\sqrt{a^{2}-x^{2}}$',
              right: '$x = a\\sin\\theta$ or $a\\tanh\\theta$',
              source: src('ch1-1.8-table-1'),
            },
            {
              left: '$\\sqrt{a^{2}+x^{2}}$',
              right: '$x = a\\tan\\theta$ or $a\\sinh\\theta$',
              source: src('ch1-1.8-table-2'),
            },
            {
              left: '$\\sqrt{x^{2}-a^{2}}$',
              right: '$x = a\\sec\\theta$ or $a\\cosh\\theta$',
              source: src('ch1-1.8-table-3'),
            },
            { left: '$\\frac{1}{x(ax^{m}+b)}$', right: '$x^{m} = \\frac{1}{t}$', source: src('ch1-1.8-table-4') },
            {
              left: '$\\frac{1}{(x+p)\\sqrt{ax^{2}+b^{2}}}$',
              right: '$x + p = \\frac{1}{t}$',
              source: src('ch1-1.8-table-5'),
              reviewIds: ['MR-07'],
            },
            { left: 'Functions of $x$ and $\\sqrt{ax+b}$', right: '$ax + b = u^{2}$', source: src('ch1-1.8-table-6') },
            {
              left: 'Functions of $x$ and $\\sqrt{(x-a)(x-b)}$',
              right: '$x - b = (x-a)u^{2}$',
              source: src('ch1-1.8-table-7'),
            },
            {
              left: 'Functions of $x$ and $\\sqrt{(x-a)(b-x)}$',
              right: '$b - x = (x-a)u^{2}$ or $x = a\\cos^{2}\\theta + b\\sin^{2}\\theta$',
              source: src('ch1-1.8-table-8'),
            },
            {
              left: 'Functions of $x$ and $\\sqrt{x^{2}+bx+c}$, where $\\sqrt{x^{2}+bx+c}$ is irreducible to linear real factors',
              right: '$x + \\sqrt{x^{2}+bx+c} = u$',
              source: src('ch1-1.8-table-9'),
            },
            {
              left: 'Expressions containing fractional powers of $x$',
              right: '$x = u^{n}$, where $n$ is the LCM of the denominators of the fractional indices',
              source: src('ch1-1.8-table-10'),
            },
          ],
        },
        {
          type: 'derivation',
          title: 'Integrals of the form (Ax + B)/√(ax² + 2bx + c)',
          intro:
            'For real constants $A$, $B$, $a$, $b$, $c$, this integral can be found by methods already described, for instance by the substitution $y + \\sqrt{a}x = t$. However, there is a more convenient method.',
          source: src('ch1-1.8.1-method'),
          reviewIds: ['MR-06'],
          steps: [
            {
              explanation: 'First note that',
              tex: '\\frac{d}{dx}\\left(\\sqrt{ax^{2}+2bx+c}\\right) = \\frac{ax+b}{\\sqrt{ax^{2}+2bx+c}}',
            },
            { explanation: 'and so', tex: '\\int \\frac{ax+b}{\\sqrt{ax^{2}+2bx+c}}\\,dx = \\sqrt{ax^{2}+2bx+c}' },
            {
              explanation: 'Secondly, $\\frac{1}{\\sqrt{ax^{2}+2bx+c}}$ can be expressed in the form',
              tex: '\\frac{1}{\\sqrt{a}} \\cdot \\frac{1}{\\sqrt{x^{2} \\pm a^{2}}} \\text{ if } a > 0 \\quad\\text{or}\\quad \\frac{1}{\\sqrt{-a}} \\cdot \\frac{1}{\\sqrt{a^{2}-x^{2}}} \\text{ if } a < 0',
              reviewIds: ['MR-06'],
            },
            {
              explanation: 'Hence $\\int \\frac{1}{\\sqrt{ax^{2}+2bx+c}}\\,dx$ can be found using one of the integrals',
              tex: '\\int \\frac{1}{\\sqrt{x^{2} \\pm a^{2}}}\\,dx, \\qquad \\int \\frac{1}{\\sqrt{a^{2}-x^{2}}}\\,dx',
            },
            {
              explanation: 'Now',
              tex: 'Ax + B = \\frac{A}{a}(ax+b) + B - \\frac{Ab}{a} = \\lambda(ax+b) + \\mu',
            },
            { explanation: 'where', tex: '\\lambda = \\frac{A}{a}, \\quad \\mu = B - \\frac{Ab}{a}' },
            {
              explanation: 'Hence',
              tex: '\\int \\frac{Ax+B}{\\sqrt{ax^{2}+2bx+c}}\\,dx = \\int \\frac{\\lambda(ax+b)}{\\sqrt{ax^{2}+2bx+c}}\\,dx + \\int \\frac{\\mu}{\\sqrt{ax^{2}+2bx+c}}\\,dx',
            },
            {
              explanation:
                'The remaining integral can now be evaluated with the substitutions in the table of suggested substitutions.',
            },
          ],
          resultTex: '\\lambda\\sqrt{ax^{2}+2bx+c} + \\mu\\int \\frac{1}{\\sqrt{ax^{2}+2bx+c}}\\,dx',
        },
        {
          type: 'paragraph',
          text: 'Integrals of rational expressions in $\\sin x$ and $\\cos x$ can be reduced to integrals of quotients of polynomials by one substitution.',
          source: src('ch1-1.9-substitution'),
        },
        {
          type: 'formulaList',
          title: 'Rational functions of sine and cosine',
          items: [
            { tex: 't = \\tan\\left(\\frac{x}{2}\\right)', source: src('ch1-1.9-substitution') },
            { tex: '\\cos x = \\frac{1-t^{2}}{1+t^{2}}', source: src('ch1-1.9-substitution') },
            { tex: '\\sin x = \\frac{2t}{1+t^{2}}', source: src('ch1-1.9-substitution') },
            { tex: '\\frac{dx}{dt} = \\frac{2}{1+t^{2}}', source: src('ch1-1.9-substitution') },
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'Note',
          text: 'For rational functions of $\\cos 2x$, $\\sin 2x$, $\\cos^{2}x$ and $\\sin^{2}x$, the appropriate substitution is $t = \\tan x$.',
          source: src('ch1-1.9-note'),
        },
        {
          type: 'summary',
          title: 'Key points',
          points: [
            'Choose a substitution that turns the integrand into a rational function of a new variable.',
            'Use the table to match the root or power in the integrand to a substitution.',
            'For rational functions of $\\sin x$ and $\\cos x$, use $t = \\tan\\frac{x}{2}$.',
          ],
        },
      ],
      { source: [ch1('1.8', 12), ch1('1.8', 13), ch1('1.8.1', 14), ch1('1.9', 15)] },
    ),
    step(
      'see-it',
      'Removing a root',
      [
        {
          type: 'workedExample',
          title: 'Rationalising with t = √(4x + 1)',
          problemTex: '\\int \\frac{2x + 3 + 2\\sqrt{4x+1}}{5x - 7 - \\sqrt{4x+1}}\\,dx',
          method: 'Substitution and rationalisation',
          steps: [
            {
              explanation: 'With $y = \\sqrt{4x+1}$, the integrand becomes a rational function of $x$ and $y$.',
              tex: '\\int \\frac{2x+3+2y}{5x-7-y}\\,dx',
            },
            {
              explanation: 'A suitable substitution is $t = \\sqrt{4x+1}$, that is,',
              tex: 't^{2} = 4x + 1',
            },
            {
              explanation: 'Thus',
              tex: '2t = 4\\,dx \\quad\\text{and so}\\quad dx = \\frac{1}{2}t\\,dt',
              reviewIds: ['MR-09'],
            },
            { explanation: 'Now', tex: 'y = t, \\quad x = \\frac{t^{2}-1}{4}' },
            {
              explanation: 'Substitute everywhere.',
              tex: '\\int \\frac{2\\left(\\frac{t^{2}-1}{4}\\right) + 3 + 2t}{5\\left(\\frac{t^{2}-1}{4}\\right) - 7 - t} \\cdot \\frac{t}{2}\\,dt',
            },
            {
              explanation: 'Clear the inner fractions.',
              tex: '\\int \\frac{2(t^{2}-1) + 12 + 8t}{5(t^{2}-1) - 28 - 4t} \\cdot \\frac{t}{2}\\,dt',
              why: 'Multiplying the numerator and denominator by 4 removes the quarters without changing the fraction.',
            },
          ],
          resultTex: '\\int \\frac{t(t^{2}+4t+5)}{5t^{2}-4t-33}\\,dt',
          source: src('ch1-1.8-ex-rationalise'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'paragraph',
          text: 'The integral is now a rational function of the new variable $t$, and the earlier methods can be used to evaluate it.',
          source: src('ch1-1.8-ex-rationalise'),
        },
      ],
      { source: [ch1('1.8', 12)] },
    ),
    activityStep('explore', INTEGRATION_UNITS.algebraicTrig),
    tryItStep(
      INTEGRATION_UNITS.algebraicTrig,
      'Your turn',
      'Pick a substitution from the table or use $t = \\tan\\frac{x}{2}$, then integrate.',
    ),
    step(
      'worked-example',
      'Worked examples',
      [
        {
          type: 'workedExample',
          title: 'A trigonometric substitution',
          problemTex: '\\int \\frac{1}{\\sqrt{x^{2}+a^{2}}}\\,dx',
          method: 'Substitution x = a tan θ',
          steps: [
            {
              explanation: 'Use the substitution $x = a\\tan\\theta$. Thus',
              tex: '\\frac{dx}{d\\theta} = a\\sec^{2}\\theta',
              why: 'The integrand contains $\\sqrt{x^{2}+a^{2}}$, which the table pairs with $x = a\\tan\\theta$.',
            },
            {
              explanation: 'and so',
              tex: '\\int \\frac{1}{\\sqrt{a^{2}\\tan^{2}\\theta + a^{2}}} \\cdot a\\sec^{2}\\theta\\,d\\theta = \\int \\frac{1}{\\sqrt{a^{2}\\sec^{2}\\theta}} \\cdot a\\sec^{2}\\theta\\,d\\theta',
            },
            {
              explanation: 'Simplify and integrate.',
              tex: '\\int \\sec\\theta\\,d\\theta = \\ln|\\sec\\theta + \\tan\\theta| + K',
            },
            {
              explanation: 'Return to $x$.',
              tex: '\\ln\\left|\\sec\\left(\\tan^{-1}\\left(\\frac{x}{a}\\right)\\right) + \\frac{x}{a}\\right| + K',
            },
          ],
          resultTex: '\\ln\\left(\\frac{x}{a} + \\sqrt{\\left(\\frac{x}{a}\\right)^{2} + 1}\\right) + K',
          source: src('ch1-1.8-ex-1'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A linear numerator over a root',
          problemTex: '\\int \\frac{x\\,dx}{\\sqrt{x^{2}+x+1}}',
          method: 'Split the numerator, then substitute',
          steps: [
            {
              explanation: 'Write the numerator using the derivative of $x^{2} + x + 1$.',
              tex: '\\int \\frac{\\left(x+\\frac{1}{2}\\right) - \\frac{1}{2}}{\\sqrt{x^{2}+x+1}}\\,dx = \\int \\frac{x+\\frac{1}{2}}{\\sqrt{x^{2}+x+1}}\\,dx - \\frac{1}{2}\\int \\frac{1}{\\sqrt{x^{2}+x+1}}\\,dx',
            },
            {
              explanation: 'The first integral is a square root; complete the square in the second.',
              tex: '\\sqrt{x^{2}+x+1} - \\frac{1}{2}\\int \\frac{1}{\\sqrt{\\left(x+\\frac{1}{2}\\right)^{2} + \\left(\\frac{\\sqrt{3}}{2}\\right)^{2}}}\\,dx',
            },
            {
              explanation: 'For the remaining integral, let $u = x + \\frac{1}{2}$, so $du = dx$.',
              tex: '\\int \\frac{1}{\\sqrt{u^{2} + \\left(\\frac{\\sqrt{3}}{2}\\right)^{2}}}\\,du',
            },
            {
              explanation:
                'Introduce $u = \\frac{\\sqrt{3}}{2}\\tan\\theta$, so $du = \\frac{\\sqrt{3}}{2}\\sec^{2}\\theta\\,d\\theta$.',
              tex: '\\int \\frac{1}{\\sqrt{\\left(\\frac{\\sqrt{3}}{2}\\right)^{2}(\\tan\\theta)^{2} + \\left(\\frac{\\sqrt{3}}{2}\\right)^{2}}} \\cdot \\frac{\\sqrt{3}}{2}\\sec^{2}\\theta\\,d\\theta = \\int \\sec\\theta\\,d\\theta',
            },
            { explanation: 'Integrate.', tex: '\\ln|\\sec\\theta + \\tan\\theta| + K' },
            {
              explanation: 'Thus',
              tex: '\\int \\frac{1}{\\sqrt{\\left(x+\\frac{1}{2}\\right)^{2} + \\left(\\frac{\\sqrt{3}}{2}\\right)^{2}}}\\,dx = \\ln\\left|\\sec\\left(\\tan^{-1}\\left(x+\\frac{1}{2}\\right)\\right) + \\frac{2}{\\sqrt{3}}\\left(x+\\frac{1}{2}\\right)\\right| + K',
              reviewIds: ['MR-16'],
            },
            {
              explanation: 'which simplifies to',
              tex: '\\ln\\left(\\frac{2\\left(x+\\frac{1}{2}\\right)}{\\sqrt{3}} + \\sqrt{\\frac{4\\left(x+\\frac{1}{2}\\right)^{2}}{3} + 1}\\right) + K',
            },
          ],
          resultTex:
            '\\sqrt{x^{2}+x+1} - \\frac{1}{2}\\ln\\left(\\frac{2\\left(x+\\frac{1}{2}\\right)}{\\sqrt{3}} + \\sqrt{\\frac{4\\left(x+\\frac{1}{2}\\right)^{2}}{3} + 1}\\right) + K',
          source: src('ch1-1.8.1-ex-2'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Half-angle substitution with partial fractions',
          problemTex: '\\int \\frac{dx}{2 + 2\\sin x + \\cos x}',
          method: 'Substitution t = tan(x/2)',
          steps: [
            {
              explanation: 'With $t = \\tan\\frac{x}{2}$, the integral becomes',
              tex: '\\int \\frac{dx}{2+2\\sin x+\\cos x} = \\int \\frac{2\\,dt}{t^{2}+4t+3}',
              why: 'Substituting $\\sin x = \\frac{2t}{1+t^{2}}$, $\\cos x = \\frac{1-t^{2}}{1+t^{2}}$ and $dx = \\frac{2\\,dt}{1+t^{2}}$, the factors $1 + t^{2}$ cancel.',
            },
            {
              explanation: 'Since $t^{2} + 4t + 3 = (t+1)(t+3)$, use partial fractions.',
              tex: '\\int \\left(\\frac{1}{t+1} - \\frac{1}{t+3}\\right)dt',
            },
            { explanation: 'Integrate.', tex: '\\ln|t+1| - \\ln|t+3| + C = \\ln\\left|\\frac{t+1}{t+3}\\right| + C' },
          ],
          resultTex: '\\ln\\left|\\frac{1+\\tan\\frac{x}{2}}{3+\\tan\\frac{x}{2}}\\right| + C',
          source: src('ch1-1.9-ex-1'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Half-angle substitution with an inverse tangent',
          problemTex: '\\int \\frac{dx}{5 + 3\\cos x}',
          method: 'Substitution t = tan(x/2)',
          steps: [
            {
              explanation: 'Substitute $t = \\tan\\frac{x}{2}$.',
              tex: '\\int \\frac{dx}{5+3\\cos x} = \\int \\frac{\\frac{2\\,dt}{1+t^{2}}}{5 + 3\\left(\\frac{1-t^{2}}{1+t^{2}}\\right)}',
            },
            {
              explanation: 'Combine over the common denominator $1 + t^{2}$.',
              tex: '\\int \\frac{\\frac{2\\,dt}{1+t^{2}}}{\\frac{5(1+t^{2}) + 3(1-t^{2})}{1+t^{2}}} = \\int \\frac{2\\,dt}{8 + 2t^{2}}',
            },
            {
              explanation: 'Simplify and integrate.',
              tex: '\\int \\frac{dt}{t^{2}+4} = \\frac{1}{2}\\tan^{-1}\\left(\\frac{t}{2}\\right) + C',
            },
          ],
          resultTex: '\\frac{1}{2}\\tan^{-1}\\left(\\frac{1}{2}\\tan\\frac{x}{2}\\right) + C',
          source: src('ch1-1.9-ex-2'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.8', 13), ch1('1.8.1', 14), ch1('1.9', 15), ch1('1.9', 16)] },
    ),
    practiseStep(INTEGRATION_UNITS.algebraicTrig),
    activityStep('play', INTEGRATION_UNITS.algebraicTrig),
    activityStep('create', INTEGRATION_UNITS.algebraicTrig),
    ...reflectAndReview(
      INTEGRATION_UNITS.algebraicTrig,
      'Which substitution pattern was hardest to recognise, and what helps you spot it?',
      [
        'Choosing a substitution from the table',
        'Trigonometric substitutions for roots',
        'The t = tan(x/2) substitution',
        'Rewriting back in terms of x',
      ],
    ),
  ],
};
