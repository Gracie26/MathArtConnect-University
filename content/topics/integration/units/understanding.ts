import type { LearningUnitDefinition } from '../../../types';
import { INTEGRATION_UNITS } from '../ids';
import { ch1 } from '../sources';
import { UNDERSTANDING_TRY_IT } from '../appPractice';
import { activityStep, reflectAndReview, src, step } from '../steps';

/** Source: Chapter 1, §1.1–1.2 (all items in the inventory for these sections). */
export const understandingIntegration: LearningUnitDefinition = {
  id: INTEGRATION_UNITS.understanding,
  slug: 'understanding-integration',
  title: 'Understanding Integration',
  summary: 'Integration as reversing differentiation, and why every answer carries a constant C.',
  glyph: 'wave',
  tone: 'blue',
  source: [ch1('1.1', 1), ch1('1.2', 2)],
  steps: [
    step(
      'concept',
      'What does integration undo?',
      [
        {
          type: 'paragraph',
          text: 'Integration is a process of joining, or building up, functions. It can be viewed in two ways. First, as reversing differentiation: finding a function whose derivative is the given function. Second, as finding the area under the graph of a given function. By the end of the chapter you should see that these two viewpoints are equivalent.',
          source: src('ch1-1.1-views'),
        },
        {
          type: 'paragraph',
          text: 'The first viewpoint leads to useful methods for finding the integrals of many kinds of functions: substitution and integration by parts.',
          source: src('ch1-1.1-views'),
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The central question',
          text: "Given a function $f$, find a function whose derivative is the same as $f$. That is, find a function $F$ for which $F'(x) = f(x)$ for all $x$ on some interval.",
          source: src('ch1-1.1-problem'),
        },
        {
          type: 'definition',
          term: 'Anti-derivative',
          text: 'A function $F$ is said to be an anti-derivative of a function $f$ if',
          tex: "F'(x) = f(x) \\text{ on some interval.}",
          source: src('ch1-def-1.1.1'),
        },
        {
          type: 'theorem',
          label: 'Theorem',
          title: 'Equal derivatives differ by a constant',
          text: "If $G'(x) = F'(x)$ for all $x$ in some interval $[a, b]$, then for all $x$ in the interval",
          tex: 'G(x) = F(x) + C',
          source: src('ch1-thm-1.1.1'),
        },
        {
          type: 'definition',
          term: 'Indefinite integral',
          text: "If $F'(x) = f(x)$, the most general anti-derivative of $f$ is written",
          tex: '\\int f(x)\\,dx = F(x) + C',
          source: src('ch1-1.2-notation'),
        },
        {
          type: 'definition',
          term: 'The words we use',
          text: 'The symbol $\\int$ is called an integral sign, and $\\int f(x)\\,dx$ is called the indefinite integral of $f(x)$ with respect to $x$. The function $f(x)$ is called the integrand. Finding an anti-derivative is called anti-differentiation or integration. The number $C$ is called a constant of integration. Just as $\\frac{d}{dx}(\\,)$ denotes differentiation with respect to $x$, the symbol $\\int (\\,)\\,dx$ denotes integration with respect to $x$.',
          source: src('ch1-1.2-terms'),
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Does every function have an anti-derivative?',
          text: 'Recall that some functions are differentiable everywhere, some are differentiable at some points but not at others, and some are differentiable nowhere. A similar situation holds for integrals. Indeed, every continuous function $f$ has an anti-derivative, or integral, $F$.',
          source: src('ch1-1.2-existence'),
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Is the anti-derivative unique?',
          text: "This is best answered with the mean value theorem for derivatives. If $F'(x) = G'(x)$, then $F(x) = G(x) + C$ where $C$ is a constant. So the anti-derivative of a function is not unique: anti-derivatives of a function differ by a constant. This is why the anti-derivative of a function is often called the indefinite integral.",
          source: src('ch1-1.2-uniqueness'),
        },
        {
          type: 'summary',
          title: 'Key points',
          points: [
            "An anti-derivative of $f$ is any $F$ with $F'(x) = f(x)$.",
            'Anti-derivatives of the same function differ only by a constant.',
            'The indefinite integral $\\int f(x)\\,dx = F(x) + C$ describes the whole family.',
          ],
        },
      ],
      { source: [ch1('1.1', 1), ch1('1.1', 2), ch1('1.2', 2), ch1('1.2', 3)] },
    ),
    step(
      'see-it',
      'One derivative, many functions',
      [
        {
          type: 'paragraph',
          text: 'There is always more than one anti-derivative of a function. Each of these has derivative $2x$, so each is an anti-derivative of $f(x) = 2x$:',
          source: src('ch1-1.1-many'),
        },
        {
          type: 'math',
          tex: 'F(x) = x^{2}, \\quad F_{1}(x) = x^{2} - 1, \\quad F_{2}(x) = x^{2} + 10',
          source: src('ch1-1.1-many'),
        },
        { type: 'math', tex: "F'(x) = F_{1}'(x) = F_{2}'(x) = 2x = f(x)", source: src('ch1-1.1-many') },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Why +C appears',
          text: 'If $F$ is an anti-derivative of $f$, then so is $G(x) = F(x) + C$ for any constant $C$, because',
          tex: "G'(x) = \\frac{d}{dx}(F(x) + C) = F'(x) + 0 = F'(x) = f(x)",
          source: src('ch1-1.1-plus-c'),
        },
        {
          type: 'paragraph',
          text: 'So $F(x) + C$ stands for a set of functions, each with a derivative equal to $f(x)$.',
          source: src('ch1-1.1-plus-c'),
        },
      ],
      { source: [ch1('1.1', 1), ch1('1.1', 2)] },
    ),
    activityStep('explore', INTEGRATION_UNITS.understanding),
    // §1.1–1.2 contain no "You Try It" items, so Try it is App practice (labelled as such) and optional.
    step('try-it', 'Try it: recognise and reverse', UNDERSTANDING_TRY_IT, {
      required: false,
      source: [ch1('1.1', 1), ch1('1.2', 2)],
    }),
    step(
      'worked-example',
      'Worked examples',
      [
        {
          type: 'workedExample',
          title: 'An anti-derivative of 2x',
          problemTex: 'f(x) = 2x',
          method: 'Reverse differentiation',
          steps: [
            {
              explanation: 'Look for a function whose derivative is $2x$.',
              tex: 'F(x) = x^{2}',
              why: 'Differentiating $x^{2}$ gives $2x$, so $x^{2}$ answers the central question.',
            },
            { explanation: 'Check by differentiating.', tex: "F'(x) = 2x" },
          ],
          resultTex: 'F(x) = x^{2}',
          source: src('ch1-1.1-ex-2x'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'The anti-derivative of 2x',
          problemTex: 'f(x) = 2x',
          method: 'Reverse differentiation, with the constant',
          steps: [
            {
              explanation: 'Every anti-derivative of $2x$ differs from $x^{2}$ by a constant.',
              tex: 'G(x) = x^{2} + C',
              why: 'By the theorem, any two anti-derivatives of the same function differ by a constant.',
            },
          ],
          resultTex: 'G(x) = x^{2} + C',
          source: src('ch1-1.1-ex-a'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
        {
          type: 'workedExample',
          title: 'The anti-derivative of 2x + 5',
          problemTex: 'f(x) = 2x + 5',
          method: 'Reverse differentiation, with the constant',
          steps: [
            {
              explanation: 'The term $x^{2}$ differentiates to $2x$ and $5x$ differentiates to $5$.',
              tex: 'G(x) = x^{2} + 5x + C',
            },
            { explanation: 'Check by differentiating.', tex: "G'(x) = 2x + 5" },
          ],
          resultTex: 'G(x) = x^{2} + 5x + C',
          source: src('ch1-1.1-ex-b'),
          origin: 'unamSourceAdapted',
          solutionStatus: 'unamSource',
        },
      ],
      { source: [ch1('1.1', 1), ch1('1.1', 2)] },
    ),
    activityStep('play', INTEGRATION_UNITS.understanding),
    activityStep('create', INTEGRATION_UNITS.understanding),
    ...reflectAndReview(INTEGRATION_UNITS.understanding, 'Why does changing C not change the derivative?', [
      'Seeing why there is more than one anti-derivative',
      'Remembering to add + C',
      'Reading the integral notation',
      'Nothing in particular',
    ]),
  ],
};
