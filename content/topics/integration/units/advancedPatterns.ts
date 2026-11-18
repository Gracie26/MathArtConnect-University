import type { LearningUnitDefinition } from '../../../types';
import { INTEGRATION_UNITS } from '../ids';
import { ch1 } from '../sources';
import { activityStep, practiseStep, reflectAndReview, src, step, tryItStep } from '../steps';

/**
 * Source: Chapter 1, §1.12–1.14 (§1.14 placed here per Decision 5; all items in
 * the inventory for these sections). Lines under review (MR-03, MR-04, MR-05,
 * MR-08) are shown as printed with a review note.
 */
export const advancedPatterns: LearningUnitDefinition = {
  id: INTEGRATION_UNITS.advancedPatterns,
  slug: 'advanced-integration-patterns',
  title: 'Advanced Integration Patterns',
  summary: 'Reduction formulas, powers of sine and cosine, and choosing a strategy before calculating.',
  glyph: 'wave',
  tone: 'amber',
  source: [ch1('1.12', 18), ch1('1.13', 19), ch1('1.14', 22)],
  steps: [
    step(
      'concept',
      'Recognise the pattern first',
      [
        {
          type: 'definition',
          term: 'Reduction formula',
          text: 'A formula in which a given integral is expressed in terms of similar integrals of simpler form. Applied repeatedly, it reduces an integral step by step.',
          source: src('ch1-1.12-definition'),
        },
        {
          type: 'formulaList',
          title: 'Two reduction formulas',
          items: [
            {
              tex: '\\int x^{n}e^{x}\\,dx = x^{n}e^{x} - n\\int x^{n-1}e^{x}\\,dx + C',
              note: 'For a positive integer n.',
              source: src('ch1-1.12-ex-xnex'),
              reviewIds: ['MR-03'],
            },
            {
              tex: '\\int \\sin^{n}x\\,dx = -\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n-1}{n}\\int \\sin^{n-2}x\\,dx',
              source: src('ch1-1.12-ex-sinn'),
            },
          ],
        },
        {
          type: 'paragraph',
          text: 'With the aid of trigonometric identities, it is possible to evaluate integrals of the type below. We distinguish two cases.',
          source: src('ch1-1.13-intro'),
        },
        { type: 'math', tex: '\\int \\sin^{m}x\\cos^{n}x\\,dx', source: src('ch1-1.13-intro') },
        {
          type: 'formula',
          title: 'Case 1: m or n is an odd positive integer',
          tex: '\\sin^{m}x = \\sin^{m-1}x\\sin x, \\quad \\sin^{2}x = 1 - \\cos^{2}x',
          note: 'If m is odd, m − 1 is even, and the integrand becomes a sum of powers of cos x times sin x.',
          source: src('ch1-1.13-case-1'),
        },
        {
          type: 'paragraph',
          text: 'If $n$ is an odd positive integer, the procedure is the same, except that we seek an integrand that is a sum of powers of $\\sin x$ times $\\cos x$.',
          source: src('ch1-1.13-n-odd'),
        },
        {
          type: 'formulaList',
          title: 'Case 2: m and n are both even non-negative integers',
          items: [
            { tex: '\\sin x\\cos x = \\frac{1}{2}\\sin 2x', source: src('ch1-1.13-case-2') },
            { tex: '\\sin^{2}x = \\frac{1-\\cos 2x}{2}', source: src('ch1-1.13-case-2') },
            { tex: '\\cos^{2}x = \\frac{1+\\cos 2x}{2}', source: src('ch1-1.13-case-2') },
          ],
        },
        {
          type: 'paragraph',
          text: 'Instead of $\\sin^{8}x\\cos^{6}x$, suppose you have $\\sin 8x\\cos 6x$: a product of sines and cosines of different multiples of $x$. The product formulas separate it into single sines or cosines.',
          source: src('ch1-1.13-products-intro'),
        },
        {
          type: 'formula',
          title: 'A sine times a cosine',
          tex: '\\sin px\\cos qx = \\frac{1}{2}\\sin(p+q)x + \\frac{1}{2}\\sin(p-q)x',
          source: src('ch1-1.13-sin-cos-identity'),
        },
        {
          type: 'formulaList',
          title: 'Two sines or two cosines',
          items: [
            {
              tex: '\\sin px\\sin qx = -\\frac{1}{2}\\cos(p+q)x + \\frac{1}{2}\\cos(p-q)x',
              note: 'Derived from the addition formulas.',
              source: src('ch1-1.13-sin-sin-cos-cos'),
            },
            {
              tex: '\\cos px\\cos qx = \\frac{1}{2}\\cos(p+q)x + \\frac{1}{2}\\cos(p-q)x',
              source: src('ch1-1.13-sin-sin-cos-cos'),
            },
          ],
        },
        {
          type: 'formula',
          title: 'Quotients of sine and cosine expressions',
          tex: '\\int \\frac{a\\cos x + b\\sin x + c}{A\\cos x + B\\sin x + C}\\,dx',
          note: 'Write the numerator as p(A cos x + B sin x + C) + q · d/dx(A cos x + B sin x + C) + r, where p, q and r are constants.',
          source: src('ch1-1.14-method'),
        },
        {
          type: 'summary',
          title: 'Choosing a strategy',
          points: [
            'An odd power of sine or cosine: keep one factor aside and use $\\sin^{2}x + \\cos^{2}x = 1$.',
            'Even powers of both: use the double-angle identities.',
            'Products such as $\\sin 8x\\cos 6x$: use the product formulas.',
            'A quotient of $\\cos x$, $\\sin x$ and constants: split the numerator into $p$, $q$ and $r$ parts.',
          ],
        },
      ],
      {
        source: [
          ch1('1.12', 18),
          ch1('1.12', 19),
          ch1('1.13', 19),
          ch1('1.13', 20),
          ch1('1.13', 21),
          ch1('1.13', 22),
          ch1('1.14', 22),
        ],
      },
    ),
    step(
      'see-it',
      'An odd power of sine',
      [
        {
          type: 'workedExample',
          title: 'Save one sine',
          problemTex: '\\int \\sin^{3}x\\,dx',
          method: 'Odd power of sine',
          steps: [
            { explanation: 'The power of sine is odd: keep one $\\sin x$ aside.', tex: '\\int \\sin^{2}x\\sin x\\,dx' },
            {
              explanation: 'Replace $\\sin^{2}x$ using $\\sin^{2}x = 1 - \\cos^{2}x$.',
              tex: '\\int (1 - \\cos^{2}x)\\sin x\\,dx',
            },
            {
              explanation: 'Split the integral.',
              tex: '\\int \\sin x\\,dx + \\int \\cos^{2}x(-\\sin x)\\,dx',
              why: 'In the second integral, $-\\sin x$ is the derivative of $\\cos x$, so it integrates like a power of $\\cos x$.',
            },
          ],
          resultTex: '-\\cos x + \\frac{1}{3}\\cos^{3}x + C',
          source: src('ch1-1.13-ex-sin3'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.13', 20)] },
    ),
    activityStep('explore', INTEGRATION_UNITS.advancedPatterns),
    tryItStep(INTEGRATION_UNITS.advancedPatterns, 'Your turn', 'Decide which pattern applies before you calculate.'),
    step(
      'worked-example',
      'Worked examples',
      [
        {
          type: 'workedExample',
          title: 'Deriving a reduction formula',
          problemTex: '\\int x^{n}e^{x}\\,dx = x^{n}e^{x} - n\\int x^{n-1}e^{x}\\,dx + C',
          method: 'Integration by parts, for a positive integer n',
          reviewIds: ['MR-03'],
          steps: [
            {
              explanation: 'Let $u = x^{n}$ and $dv = e^{x}\\,dx$. Then',
              tex: 'du = nx^{n-1}, \\quad v = \\int dv = \\int e^{x}\\,dx = e^{x}',
              reviewIds: ['MR-03'],
            },
            { explanation: 'So', tex: '\\int x^{n}e^{x}\\,dx = x^{n}e^{x} - \\int e^{x}(nx^{n-1})\\,dx' },
          ],
          resultTex: 'x^{n}e^{x} - n\\int x^{n-1}e^{x}\\,dx + C',
          source: src('ch1-1.12-ex-xnex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Using the reduction formula',
          problemTex: '\\int x^{n}e^{x}\\,dx \\text{ for } n = 1, 2',
          method: 'Reduction formula',
          steps: [
            { explanation: 'For $n = 1$:', tex: '\\int xe^{x}\\,dx = xe^{x} - \\int e^{x}\\,dx = xe^{x} - e^{x} + C' },
            {
              explanation: 'For $n = 2$, the formula reduces to the case $n = 1$:',
              tex: '\\int x^{2}e^{x}\\,dx = x^{2}e^{x} - 2\\int xe^{x}\\,dx',
            },
          ],
          resultTex: '\\int x^{2}e^{x}\\,dx = x^{2}e^{x} - 2xe^{x} + 2e^{x} + C',
          source: src('ch1-1.12-ex-n12'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A reduction formula for powers of sine',
          problemTex: '\\int \\sin^{n}x\\,dx',
          method: 'Integration by parts, then solve for the integral',
          reviewIds: ['MR-04'],
          steps: [
            { explanation: 'Rewrite as', tex: '\\int \\sin^{n}x\\,dx = \\int \\sin^{n-1}x\\sin x\\,dx' },
            {
              explanation: 'Then',
              tex: 'u = \\sin^{n-1}x \\;\\Rightarrow\\; du = (n-1)\\sin^{n-2}x\\cos x\\,dx',
            },
            {
              explanation: 'and',
              tex: 'dv = \\sin x \\;\\Rightarrow\\; v = \\int dv = \\int \\sin x\\,dx = -\\cos x',
              reviewIds: ['MR-04'],
            },
            {
              explanation: 'Then',
              tex: '\\int \\sin^{n}x\\,dx = -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\cos x\\cos x\\,dx',
            },
            {
              explanation: 'Collect the cosines.',
              tex: '= -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\cos^{2}x\\,dx',
            },
            {
              explanation: 'Use $\\cos^{2}x = 1 - \\sin^{2}x$.',
              tex: '= -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x(1 - \\sin^{2}x)\\,dx',
            },
            {
              explanation: 'Split the integral.',
              tex: '= -\\sin^{n-1}x\\cos x + (n-1)\\left[\\int \\sin^{n-2}x\\,dx - \\sin^{n}x\\,dx\\right]',
              reviewIds: ['MR-04'],
            },
            {
              explanation: 'Move the $\\int \\sin^{n}x\\,dx$ term to the left-hand side.',
              tex: '\\int \\sin^{n}x\\,dx + (n-1)\\int \\sin^{n}x\\,dx = -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\,dx',
              why: 'The original integral appears on both sides, so we can solve for it like an unknown.',
            },
            {
              explanation: 'Combine.',
              tex: 'n\\int \\sin^{n}x\\,dx = -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\,dx',
            },
          ],
          resultTex: '\\int \\sin^{n}x\\,dx = -\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n-1}{n}\\int \\sin^{n-2}x\\,dx',
          source: src('ch1-1.12-ex-sinn'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'An odd power of sine with a cosine',
          problemTex: '\\int \\sin^{5}x\\cos^{2}x\\,dx',
          method: 'Odd power of sine',
          steps: [
            {
              explanation: 'Keep one $\\sin x$ aside.',
              tex: '\\int \\cos^{2}x\\sin^{4}x\\sin x\\,dx = \\int \\cos^{2}x(\\sin^{2}x)^{2}\\sin x\\,dx',
            },
            {
              explanation: 'Use $\\sin^{2}x = 1 - \\cos^{2}x$.',
              tex: '\\int \\cos^{2}x(1-\\cos^{2}x)^{2}\\sin x\\,dx',
            },
            { explanation: 'Expand.', tex: '\\int \\cos^{2}x(1 - 2\\cos^{2}x + \\cos^{4}x)\\sin x\\,dx' },
            {
              explanation: 'Write each term as a power of $\\cos x$ times $-\\sin x$.',
              tex: '-\\int \\cos^{2}x(-\\sin x)\\,dx + 2\\int \\cos^{4}x(-\\sin x)\\,dx - \\int \\cos^{6}x(-\\sin x)\\,dx',
            },
          ],
          resultTex: '-\\frac{1}{3}\\cos^{3}x + \\frac{2}{5}\\cos^{5}x - \\frac{1}{7}\\cos^{7}x + C',
          source: src('ch1-1.13-ex-sin5cos2'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'An odd power of cosine',
          problemTex: '\\int \\sin^{4}x\\cos^{3}x\\,dx',
          method: 'Odd power of cosine',
          reviewIds: ['MR-05'],
          steps: [
            { explanation: 'Keep one $\\cos x$ aside.', tex: '\\int \\sin^{4}x\\cos^{2}x\\cos x\\,dx' },
            { explanation: 'Use $\\cos^{2}x = 1 - \\sin^{2}x$.', tex: '\\int \\sin^{4}x(1 - \\sin^{2}x)\\cos x\\,dx' },
            {
              explanation: 'Split into powers of $\\sin x$ times $\\cos x$.',
              tex: '\\int \\sin^{4}x(\\cos x)\\,dx - \\sin^{6}x(\\cos x)\\,dx',
              reviewIds: ['MR-05'],
            },
          ],
          resultTex: '\\frac{1}{5}\\sin^{5}x - \\frac{1}{7}\\sin^{7}x + C',
          source: src('ch1-1.13-ex-sin4cos3'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Even powers: use the double-angle identities',
          problemTex: '\\int \\cos^{4}x\\,dx',
          method: 'Even powers',
          steps: [
            {
              explanation: 'Write $\\cos^{4}x$ as $(\\cos^{2}x)^{2}$ and use the identity for $\\cos^{2}x$.',
              tex: '\\int (\\cos^{2}x)^{2}\\,dx = \\int \\left(\\frac{1+\\cos 2x}{2}\\right)^{2}dx',
            },
            { explanation: 'Expand.', tex: '\\frac{1}{4}\\int (1 + 2\\cos 2x + \\cos^{2}2x)\\,dx' },
            {
              explanation: 'Use the identity again for $\\cos^{2}2x$.',
              tex: '\\frac{1}{4}\\int \\left(1 + 2\\cos 2x + \\frac{1+\\cos 4x}{2}\\right)dx',
            },
            {
              explanation: 'Collect terms.',
              tex: '\\frac{1}{4}\\int \\left(\\frac{3}{2} + 2\\cos 2x + \\frac{1}{2}\\cos 4x\\right)dx',
            },
          ],
          resultTex: '\\frac{3}{8}x + \\frac{1}{4}\\sin 2x + \\frac{1}{32}\\sin 4x + C',
          source: src('ch1-1.13-ex-cos4'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A product of a sine and a cosine',
          problemTex: '\\int_{0}^{2\\pi} \\sin 8x\\cos 6x\\,dx',
          method: 'Product formula',
          reviewIds: ['MR-08'],
          steps: [
            {
              explanation: 'More generally, for $\\int_{0}^{2\\pi} \\sin px\\cos qx\\,dx$ use the identity',
              tex: '\\sin px\\cos qx = \\frac{1}{2}\\sin(p+q)x + \\frac{1}{2}\\sin(p-q)x',
            },
            { explanation: 'Thus', tex: '\\sin 8x\\cos 6x = \\frac{1}{2}\\sin 14x + \\frac{1}{2}\\sin 2x' },
            {
              explanation: 'Separated like this, the sines are easy to integrate.',
              tex: '\\int_{0}^{2\\pi} \\sin 8x\\cos 6x\\,dx = \\left[-\\frac{1}{2} \\cdot \\frac{\\cos 14x}{14} - \\frac{\\cos 2x}{4}\\right]_{0}^{2\\pi}',
            },
          ],
          resultTex: '0',
          source: src('ch1-1.13-ex-definite'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.12', 18), ch1('1.12', 19), ch1('1.13', 20), ch1('1.13', 21), ch1('1.13', 22)] },
    ),
    practiseStep(INTEGRATION_UNITS.advancedPatterns),
    activityStep('play', INTEGRATION_UNITS.advancedPatterns),
    activityStep('create', INTEGRATION_UNITS.advancedPatterns),
    ...reflectAndReview(INTEGRATION_UNITS.advancedPatterns, 'How did odd and even powers affect your strategy?', [
      'Odd powers: which factor to keep aside',
      'Even powers: the double-angle identities',
      'Product-to-sum formulas',
      'Reduction formulas',
      'Quotients of sine and cosine expressions',
    ]),
  ],
};
