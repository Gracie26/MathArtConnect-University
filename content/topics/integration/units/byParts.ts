import type { LearningUnitDefinition } from '../../../types';
import { INTEGRATION_UNITS } from '../ids';
import { ch1 } from '../sources';
import { activityStep, practiseStep, reflectAndReview, src, step, tryItStep } from '../steps';

/** Source: Chapter 1, §1.10–1.11 (all items in the inventory for these sections). */
export const integrationByParts: LearningUnitDefinition = {
  id: INTEGRATION_UNITS.byParts,
  slug: 'integration-by-parts',
  title: 'Integration by Parts',
  summary: 'Reverse the product rule, choose u and dv well, and repeat the method when needed.',
  glyph: 'tangent',
  tone: 'coral',
  source: [ch1('1.10', 16), ch1('1.11', 18)],
  steps: [
    step(
      'concept',
      'Reversing the product rule',
      [
        {
          type: 'paragraph',
          text: 'Integration by parts is useful for integrands involving products of algebraic and exponential or logarithmic functions, such as $\\int x^{2}e^{x}\\,dx$ and $\\int x\\ln x\\,dx$. It is the inverse operation of differentiating a product. If $u$ and $v$ are functions of $x$, then',
          source: src('ch1-1.10-intro'),
        },
        { type: 'math', tex: '\\frac{d}{dx}(uv) = u\\frac{dv}{dx} + v\\frac{du}{dx}', source: src('ch1-1.10-intro') },
        {
          type: 'paragraph',
          text: 'Integrate both sides. If $\\frac{du}{dx}$ and $\\frac{dv}{dx}$ are continuous, then',
          source: src('ch1-1.10-derivation'),
        },
        {
          type: 'math',
          tex: 'uv = \\int u\\frac{dv}{dx}\\,dx + \\int v\\frac{du}{dx}\\,dx',
          source: src('ch1-1.10-derivation'),
        },
        { type: 'paragraph', text: 'Rearrange:', source: src('ch1-1.10-derivation') },
        {
          type: 'math',
          tex: '\\int u\\frac{dv}{dx}\\,dx = uv - \\int v\\frac{du}{dx}\\,dx',
          source: src('ch1-1.10-derivation'),
        },
        {
          type: 'formula',
          title: 'Integration by parts',
          tex: '\\int u\\,dv = uv - \\int v\\,du',
          note: 'Valid when du/dx and dv/dx are continuous.',
          source: src('ch1-1.10-derivation'),
        },
        {
          type: 'summary',
          title: 'Choosing u and dv',
          points: [
            'Choose $dv$ as a part you can integrate, and $u$ as a part that becomes simpler when differentiated.',
            'A logarithm is usually $u$, because it is easier to differentiate than to integrate.',
            'If the new integral still contains a product, apply the method again.',
          ],
        },
      ],
      { source: [ch1('1.10', 16), ch1('1.10', 17)] },
    ),
    step(
      'see-it',
      'Choosing u and dv',
      [
        {
          type: 'workedExample',
          title: 'A polynomial times an exponential',
          problemTex: '\\int xe^{x}\\,dx',
          method: 'Integration by parts',
          steps: [
            {
              explanation: 'Let $u = x$, so $du = dx$.',
              tex: 'u = x, \\quad du = dx',
              why: 'Differentiating $x$ gives $1$, so the new integral will be simpler.',
            },
            {
              explanation: 'Let $dv = e^{x}\\,dx$, so',
              tex: 'v = \\int dv = \\int e^{x}\\,dx = e^{x}',
            },
            { explanation: 'Then', tex: '\\int xe^{x}\\,dx = xe^{x} - \\int e^{x}\\,dx' },
          ],
          resultTex: 'xe^{x} - e^{x} + C',
          source: src('ch1-1.10-ex-xex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.10', 17)] },
    ),
    activityStep('explore', INTEGRATION_UNITS.byParts),
    tryItStep(INTEGRATION_UNITS.byParts, 'Your turn', 'Choose $u$ and $dv$, then apply the formula.'),
    step(
      'worked-example',
      'Worked examples',
      [
        {
          type: 'workedExample',
          title: 'When the logarithm should be u',
          problemTex: '\\int x^{2}\\ln x\\,dx',
          method: 'Integration by parts',
          steps: [
            {
              explanation: '$x^{2}$ is more easily integrated than $\\ln x$, so choose $dv = x^{2}\\,dx$. Then',
              tex: 'v = \\int dv = \\int x^{2}\\,dx = \\frac{x^{3}}{3}',
            },
            { explanation: 'and', tex: 'u = \\ln x \\;\\Rightarrow\\; du = \\frac{1}{x}\\,dx' },
            {
              explanation: 'Therefore',
              tex: '\\int x^{2}\\ln x\\,dx = \\frac{x^{3}}{3}\\ln x - \\int \\left(\\frac{x^{3}}{3}\\right)\\left(\\frac{1}{x}\\right)dx',
            },
            {
              explanation: 'Simplify the remaining integral.',
              tex: '\\frac{x^{3}}{3}\\ln x - \\frac{1}{3}\\int x^{2}\\,dx',
            },
          ],
          resultTex: '\\frac{x^{3}}{3}\\ln x - \\frac{x^{3}}{9} + C',
          source: src('ch1-1.10-ex-x2lnx'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'A logarithm on its own',
          problemTex: '\\int \\ln x\\,dx',
          method: 'Integration by parts with dv = dx',
          steps: [
            {
              explanation: 'Choose $dv = dx$, so',
              tex: 'v = \\int dv = \\int dx = x',
              why: 'There is no second factor, so take $dv = dx$ and let $u$ be the logarithm.',
            },
            { explanation: 'and', tex: 'u = \\ln x \\;\\Rightarrow\\; du = \\frac{1}{x}\\,dx' },
            {
              explanation: 'Therefore',
              tex: '\\int \\ln x\\,dx = x\\ln x - \\int x \\cdot \\frac{1}{x}\\,dx = x\\ln x - \\int dx',
            },
          ],
          resultTex: 'x\\ln x - x + C',
          source: src('ch1-1.10-ex-lnx'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'Using integration by parts twice',
          problemTex: '\\int x^{2}e^{x}\\,dx',
          method: 'Integration by parts, repeated',
          steps: [
            {
              explanation:
                'The derivative of $x^{2}$ becomes simpler, whereas the derivative of $e^{x}$ does not. So let $u = x^{2}$ and $dv = e^{x}\\,dx$.',
              tex: 'v = \\int e^{x}\\,dx = e^{x}, \\quad du = 2x\\,dx',
            },
            {
              explanation: 'Integrating by parts one time:',
              tex: '\\int x^{2}e^{x}\\,dx = x^{2}e^{x} - \\int 2xe^{x}\\,dx',
            },
            {
              explanation: 'Apply integration by parts a second time, with',
              tex: 'u = 2x \\;\\Rightarrow\\; du = 2\\,dx, \\quad dv = e^{x}\\,dx \\;\\Rightarrow\\; v = e^{x}',
            },
            {
              explanation: 'Then',
              tex: 'x^{2}e^{x} - \\left(2xe^{x} - \\int 2e^{x}\\,dx\\right) = x^{2}e^{x} - 2xe^{x} + 2e^{x} + C',
            },
          ],
          resultTex: 'e^{x}(x^{2} - 2x + 2) + C',
          source: src('ch1-1.11-ex'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.10', 17), ch1('1.11', 18)] },
    ),
    practiseStep(INTEGRATION_UNITS.byParts),
    activityStep('play', INTEGRATION_UNITS.byParts),
    activityStep('create', INTEGRATION_UNITS.byParts),
    ...reflectAndReview(INTEGRATION_UNITS.byParts, 'What made your choice of u useful?', [
      'Choosing u and dv',
      'Finding v by integrating dv',
      'Applying the formula without sign errors',
      'Knowing when to apply it again',
    ]),
  ],
};
