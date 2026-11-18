import type { LearningUnitDefinition } from '../../../types';
import { INTEGRATION_UNITS } from '../ids';
import { ch1 } from '../sources';
import { activityStep, practiseStep, reflectAndReview, src, step, tryItStep } from '../steps';

/** Source: Chapter 1, §1.6, 1.6.1–1.6.3 and §1.7 (all items in the inventory for these sections). */
export const partialFractions: LearningUnitDefinition = {
  id: INTEGRATION_UNITS.partialFractions,
  slug: 'partial-fractions',
  title: 'Partial Fractions',
  summary: 'Split rational functions into simpler fractions: recognise the form first, then find the coefficients.',
  glyph: 'limits',
  tone: 'blue',
  source: [ch1('1.6', 7), ch1('1.6.1', 8), ch1('1.6.2', 9), ch1('1.6.3', 9), ch1('1.7', 10)],
  steps: [
    step(
      'concept',
      'Splitting a rational function',
      [
        {
          type: 'paragraph',
          text: 'This technique decomposes a rational function (a quotient of polynomials) into a sum of two or more simpler rational functions, each of which integrates easily.',
          source: src('ch1-1.6-intro'),
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'Check the degrees first',
          text: 'The method is for fractions whose numerator has a lower degree than the denominator. If this is not the case, first carry out long division, dividing the denominator into the numerator, until the remaining fraction has a numerator of lower degree than its denominator.',
          source: src('ch1-1.6-intro'),
        },
        {
          type: 'paragraph',
          text: 'Consider a rational function, where $P$ and $Q$ are polynomials. Four cases of partial fractions can arise, depending on the factors of $Q(x)$.',
          source: src('ch1-1.6-rational'),
        },
        { type: 'math', tex: 'f(x) = \\frac{P(x)}{Q(x)}', source: src('ch1-1.6-rational') },
        {
          type: 'formula',
          title: 'Case I: distinct linear factors',
          tex: '\\frac{P(x)}{Q(x)} = \\frac{A_{1}}{a_{1}x+b_{1}} + \\frac{A_{2}}{a_{2}x+b_{2}} + \\cdots + \\frac{A_{k}}{a_{k}x+b_{k}}',
          note: 'Here Q(x) = (a₁x + b₁)(a₂x + b₂)⋯(aₖx + bₖ), where no factor is repeated and no factor is a constant multiple of another. A₁, A₂, …, Aₖ are constants to be determined.',
          source: src('ch1-1.6-case-1'),
        },
        {
          type: 'formula',
          title: 'Case II: repeated linear factors',
          tex: '\\frac{A_{1}}{a_{1}x+b_{1}} + \\frac{A_{2}}{(a_{1}x+b_{1})^{2}} + \\cdots + \\frac{A_{k}}{(a_{1}x+b_{1})^{k}}',
          note: 'If the factor (a₁x + b₁) is repeated k times, that is (a₁x + b₁)ᵏ, f(x) has these terms: one for every power up to k.',
          source: src('ch1-1.6-case-2'),
        },
        {
          type: 'formula',
          title: 'Case III: irreducible quadratic factors, none repeated',
          tex: '\\frac{Ax+B}{ax^{2}+bx+c}',
          note: 'For a factor ax² + bx + c with b² < 4ac, f(x) has a term of this form, where A and B are constants to be determined.',
          source: src('ch1-1.6-case-3'),
        },
        {
          type: 'formula',
          title: 'Case IV: a repeated irreducible quadratic factor',
          tex: '\\frac{A_{1}x+B_{1}}{ax^{2}+bx+c} + \\frac{A_{2}x+B_{2}}{(ax^{2}+bx+c)^{2}} + \\cdots + \\frac{A_{k}x+B_{k}}{(ax^{2}+bx+c)^{k}}',
          note: 'For a factor (ax² + bx + c)ᵏ with b² < 4ac. Each of these terms can be integrated by first completing the square.',
          source: src('ch1-1.6-case-4'),
        },
        {
          type: 'paragraph',
          text: 'When $b^{2} < 4ac$, the quadratic $ax^{2} + bx + c$ cannot be factorised as $(x - \\alpha)(x - \\beta)$ with $\\alpha$ and $\\beta$ real, so $\\frac{Ax+B}{ax^{2}+bx+c}$ cannot be reduced further to a sum of real partial fractions. Two known integrals handle it:',
          source: src('ch1-1.7-intro'),
        },
        {
          type: 'formulaList',
          title: 'Two integrals for quadratic denominators',
          items: [
            {
              tex: '\\int \\frac{\\lambda(2ax+b)}{ax^{2}+bx+c}\\,dx = \\lambda\\ln|ax^{2}+bx+c| + K',
              source: src('ch1-1.7-known'),
            },
            {
              tex: '\\int \\frac{\\mu}{\\beta^{2} + (x+\\alpha)^{2}}\\,dx = \\frac{\\mu}{\\beta}\\tan^{-1}\\left(\\frac{x+\\alpha}{\\beta}\\right)',
              source: src('ch1-1.7-known'),
              reviewIds: ['MR-10'],
            },
          ],
        },
        {
          type: 'derivation',
          title: 'Integrals of the form (Ax + B)/(ax² + bx + c) with b² < 4ac',
          intro: 'Express the integral as a sum of the two integrals above.',
          source: src('ch1-1.7-derivation'),
          steps: [
            {
              explanation: 'Write the numerator using the derivative of the denominator.',
              tex: 'Ax + B = \\frac{A}{2a}(2ax+b) + \\left(B - \\frac{bA}{2a}\\right) = \\lambda(2ax+b) + \\gamma',
            },
            { explanation: 'where', tex: '\\lambda = \\frac{A}{2a}, \\quad \\gamma = \\frac{2aB - bA}{2a}' },
            {
              explanation: 'Complete the square in the denominator.',
              tex: 'ax^{2}+bx+c = a\\left(x^{2} + \\frac{b}{a}x + \\frac{c}{a}\\right) = a\\left(\\left(x + \\frac{b}{2a}\\right)^{2} + \\frac{c}{a} - \\frac{b^{2}}{4a^{2}}\\right)',
            },
            {
              explanation: 'So',
              tex: 'ax^{2}+bx+c = a\\left[\\left(x + \\frac{b}{2a}\\right)^{2} + \\frac{4ac - b^{2}}{4a^{2}}\\right] = a[(x+\\alpha)^{2} + \\beta^{2}]',
            },
            {
              explanation: 'where $\\sqrt{4ac - b^{2}}$ is real only if $b^{2} < 4ac$, and',
              tex: '\\alpha = \\frac{b}{2a}, \\quad \\beta = \\frac{\\sqrt{4ac - b^{2}}}{2a}',
            },
            {
              explanation: 'Split the integral.',
              tex: '\\int \\frac{Ax+B}{ax^{2}+bx+c}\\,dx = \\int \\frac{\\lambda(2ax+b)}{ax^{2}+bx+c}\\,dx + \\int \\frac{\\gamma}{a((x+\\alpha)^{2}+\\beta^{2})}\\,dx',
            },
            {
              explanation: 'With $\\mu = \\frac{\\gamma}{a}$:',
              tex: '= \\lambda\\ln|ax^{2}+bx+c| + \\int \\frac{\\mu}{\\beta^{2} + (x+\\alpha)^{2}}\\,dx',
            },
          ],
          resultTex:
            '\\lambda\\ln|ax^{2}+bx+c| + \\frac{\\mu}{\\beta}\\tan^{-1}\\left(\\frac{x+\\alpha}{\\beta}\\right)',
        },
        {
          type: 'summary',
          title: 'Key points',
          points: [
            'If the fraction is improper, divide first.',
            'Factorise the denominator and choose the form from its factors: one term per linear factor, every power for a repeated factor, a linear numerator over each irreducible quadratic.',
            'Integrate quadratic terms by completing the square.',
          ],
        },
      ],
      { source: [ch1('1.6', 7), ch1('1.6', 8), ch1('1.7', 10), ch1('1.7', 11)] },
    ),
    step(
      'see-it',
      'Distinct linear factors',
      [
        {
          type: 'workedExample',
          title: 'Two distinct linear factors',
          problemTex: '\\int \\frac{x+7}{x^{2}-x-6}\\,dx',
          method: 'Partial fractions, Case I',
          steps: [
            {
              explanation: 'The fraction splits into two simpler fractions.',
              tex: '\\frac{x+7}{x^{2}-x-6} = \\frac{2}{x-3} - \\frac{1}{x+2}',
              why: 'The denominator factorises as $(x-3)(x+2)$, two distinct linear factors.',
            },
            {
              explanation: 'Integrate each fraction separately.',
              tex: '\\int \\left(\\frac{2}{x-3} - \\frac{1}{x+2}\\right)dx = 2\\int \\frac{1}{x-3}\\,dx - \\int \\frac{1}{x+2}\\,dx',
            },
          ],
          resultTex: '2\\ln|x-3| - \\ln|x+2| + C',
          source: src('ch1-1.6-ex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.6', 8)] },
    ),
    activityStep('explore', INTEGRATION_UNITS.partialFractions),
    tryItStep(
      INTEGRATION_UNITS.partialFractions,
      'Your turn',
      'Decide which case applies, write the decomposition, then integrate.',
    ),
    step(
      'worked-example',
      'Worked examples',
      [
        {
          type: 'workedExample',
          title: 'A repeated linear factor',
          problemTex: '\\int \\frac{5x^{2}+20x+6}{x^{3}+2x^{2}+x}\\,dx',
          method: 'Partial fractions, Case II',
          steps: [
            { explanation: 'Factorise the denominator.', tex: 'x^{3}+2x^{2}+x = x(x+1)^{2}' },
            {
              explanation: 'The factor $x+1$ is repeated, so both of its powers appear.',
              tex: '\\frac{5x^{2}+20x+6}{x(x+1)^{2}} = \\frac{A}{x} + \\frac{B}{x+1} + \\frac{C}{(x+1)^{2}}',
            },
            { explanation: 'Substituting, we get', tex: 'A = 6, \\quad B = -1, \\quad C = 9', reviewIds: ['MR-11'] },
            {
              explanation: 'Integrate each term.',
              tex: '\\int \\frac{6}{x}\\,dx - \\int \\frac{1}{x+1}\\,dx + \\int \\frac{9}{(x+1)^{2}}\\,dx',
            },
            {
              explanation: 'This gives',
              tex: '6\\ln|x| - \\ln|x+1| + \\frac{9(x+1)^{-1}}{-1} + C',
              reviewIds: ['MR-11'],
            },
          ],
          resultTex: '\\ln\\left|\\frac{x^{6}}{x+1}\\right| - \\frac{9}{x+1} + C',
          source: src('ch1-1.6.1-ex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'An improper rational function',
          problemTex: '\\int \\frac{x^{5}+x-1}{x^{4}-x^{3}}\\,dx',
          method: 'Long division, then partial fractions',
          steps: [
            {
              explanation: 'The numerator has a higher degree than the denominator, so carry out long division.',
              tex: '\\frac{x^{5}+x-1}{x^{4}-x^{3}} = x + 1 + \\frac{x^{3}+x-1}{x^{4}-x^{3}}',
            },
            {
              explanation: 'Apply the partial fraction decomposition to the remaining fraction.',
              tex: '\\frac{x^{3}+x-1}{x^{3}(x-1)} = \\frac{A}{x} + \\frac{B}{x^{2}} + \\frac{C}{x^{3}} + \\frac{D}{x-1}',
              why: 'The factor $x$ appears three times, so it needs the powers $x$, $x^{2}$ and $x^{3}$.',
            },
            { explanation: 'We see that', tex: 'A = 0, \\quad B = 0, \\quad C = 1, \\quad D = 1' },
            {
              explanation: 'Now integrate.',
              tex: '\\int \\left(x + 1 + \\frac{1}{x^{3}} + \\frac{1}{x-1}\\right)dx',
            },
          ],
          resultTex: '\\frac{x^{2}}{2} + x - \\frac{1}{2x^{2}} + \\ln|x-1| + C',
          source: src('ch1-1.6.2-ex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Completing the square',
          problemTex: '\\int \\frac{dx}{x^{2}-4x+5}',
          method: 'Completing the square',
          steps: [
            {
              explanation: 'There are no real factors, but we can complete the square.',
              tex: 'x^{2}-4x+5 = (x-2)^{2} + 1',
            },
            { explanation: 'Therefore', tex: '\\int \\frac{dx}{x^{2}-4x+5} = \\int \\frac{dx}{(x-2)^{2}+1}' },
          ],
          resultTex: '\\tan^{-1}(x-2) + C',
          source: src('ch1-1.6.3-ex-square'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A linear numerator over a quadratic',
          problemTex: '\\int \\frac{(x+3)\\,dx}{x^{2}-4x+5}',
          method: 'Completing the square',
          steps: [
            { explanation: 'Complete the square.', tex: '\\frac{x+3}{x^{2}-4x+5} = \\frac{x+3}{(x-2)^{2}+1}' },
            {
              explanation: 'Since $x + 3 = x - 2 + 5$,',
              tex: '\\int \\frac{(x-2)\\,dx}{(x-2)^{2}+1} + \\int \\frac{5\\,dx}{(x-2)^{2}+1}',
              why: 'Writing the numerator as $x - 2$ plus a constant matches the first integral to a logarithm and the second to an inverse tangent.',
            },
          ],
          resultTex: '\\frac{1}{2}\\ln((x-2)^{2}+1) + 5\\tan^{-1}(x-2) + C',
          source: src('ch1-1.6.3-ex-linear-num'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A linear and a quadratic factor',
          problemTex: '\\int \\frac{(x+1)\\,dx}{x(x^{2}+1)}',
          method: 'Partial fractions, Case III',
          steps: [
            {
              explanation: 'Decompose into partial fractions.',
              tex: '\\frac{x+1}{x(x^{2}+1)} = \\frac{A}{x} + \\frac{B+Cx}{x^{2}+1}',
            },
            { explanation: 'Then', tex: 'A = 1, \\quad B = 1, \\quad C = -1' },
            {
              explanation: 'So the integral is',
              tex: '\\int \\frac{1}{x}\\,dx + \\int \\frac{dx}{x^{2}+1} - \\int \\frac{x\\,dx}{x^{2}+1}',
            },
          ],
          resultTex: '\\ln|x| + \\tan^{-1}x - \\frac{1}{2}\\ln(x^{2}+1) + C',
          source: src('ch1-1.6.3-ex-mixed'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Using λ and γ',
          problemTex: '\\int \\frac{2x-3}{x^{2}-2x+5}\\,dx',
          method: 'Numerator as λ(derivative of denominator) + γ',
          steps: [
            {
              explanation: 'Let',
              tex: '\\int \\frac{2x-3}{x^{2}-2x+5}\\,dx = \\int \\frac{\\lambda(2x-2) + \\gamma}{x^{2}-2x+5}\\,dx',
            },
            { explanation: 'This gives', tex: '\\lambda = 1, \\quad \\gamma = -1' },
            {
              explanation: 'Thus',
              tex: '\\int \\frac{2x-2}{x^{2}-2x+5}\\,dx - \\int \\frac{1}{x^{2}-2x+5}\\,dx',
            },
            {
              explanation: 'The first integral is a logarithm; complete the square in the second.',
              tex: '\\ln|x^{2}-2x+5| - \\int \\frac{1}{(x-1)^{2}+4}\\,dx',
            },
          ],
          resultTex: '\\ln|x^{2}-2x+5| - \\frac{1}{2}\\tan^{-1}\\left(\\frac{x-1}{2}\\right) + C',
          source: src('ch1-1.7-ex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.6.1', 8), ch1('1.6.2', 9), ch1('1.6.3', 9), ch1('1.6.3', 10), ch1('1.7', 11)] },
    ),
    practiseStep(INTEGRATION_UNITS.partialFractions),
    activityStep('play', INTEGRATION_UNITS.partialFractions),
    activityStep('create', INTEGRATION_UNITS.partialFractions),
    ...reflectAndReview(INTEGRATION_UNITS.partialFractions, 'How do repeated factors change the decomposition?', [
      'Factorising the denominator',
      'Choosing the right form for each factor',
      'Finding the constants',
      'Long division for improper fractions',
      'Completing the square',
    ]),
  ],
};
