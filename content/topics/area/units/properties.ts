import type { LearningUnitDefinition } from '../../../types';
import { APP_ADDITIVITY, APP_COMPARE_INTEGRALS } from '../figures';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, illustration, laterSteps, practiseStep, reviewOf, src, step } from '../steps';

/** Source: §2.2.2 Properties of the Definite Integral (printed pages 30–31). */
export const propertiesOfTheDefiniteIntegral: LearningUnitDefinition = {
  id: AREA_UNITS.properties,
  slug: 'properties-of-the-definite-integral',
  title: 'Properties of the Definite Integral',
  summary:
    'Equal limits, reversed limits, constant multiples, sums, splitting the interval, the dummy variable and comparisons.',
  glyph: 'match',
  tone: 'amber',
  source: [ch2('2.2.2', 30), ch2('2.2.2', 31)],
  steps: [
    step('concept', 'Properties of the definite integral', [
      {
        type: 'paragraph',
        text: 'The following two definitions prove to be useful when working with definite integrals.',
        source: src('ch2-2.2.2-intro'),
        ...reviewOf('ch2-2.2.2-intro'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.2.2',
        text: 'If $f(a)$ exists, then',
        tex: '\\int_{a}^{a} f(x)dx = 0.',
        source: src('ch2-thm-2.2.2'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.2.3',
        text: 'If $f$ is integrable on $[a, b]$, then',
        tex: '\\int_{b}^{a} f(x)dx = -\\int_{a}^{b} f(x)dx.',
        source: src('ch2-thm-2.2.3'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.2.4',
        text: 'Let $f$ and $g$ be integrable functions on $[a, b]$. Then, parts (i) to (iii) below hold.',
        source: src('ch2-thm-2.2.4'),
      },
      {
        type: 'formulaList',
        title: 'Theorem 2.2.4 (i)–(iii)',
        items: [
          {
            tex: '\\text{(i)}\\quad \\int_{a}^{b} kf(x)\\,dx = k\\int_{a}^{b} f(x)\\,dx',
            note: 'where k is any constant.',
          },
          {
            tex: '\\text{(ii)}\\quad \\int_{a}^{b} [f(x) \\pm g(x)]\\,dx = \\int_{a}^{b} f(x)\\,dx \\pm \\int_{a}^{b} g(x)\\,dx',
          },
          {
            tex: '\\text{(iii)}\\quad \\int_{a}^{b} f(x)\\,dx = \\int_{a}^{c} f(x)\\,dx + \\int_{c}^{b} f(x)\\,dx',
            note: 'where c is any number in [a, b].',
          },
        ],
        source: src('ch2-thm-2.2.4'),
      },
      {
        type: 'definition',
        term: 'Dummy variable',
        text: 'The independent variable $x$ in a definite integral is called a dummy variable of integration. The value of the integral does not depend on the symbol used. In other words,',
        tex: '\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(r)\\,dr = \\int_{a}^{b} f(s)\\,ds = \\int_{a}^{b} f(t)\\,dt \\text{ and so on.}',
        source: src('ch2-2.2.2-dummy'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.2.5',
        text: 'For any constant $k$,',
        tex: '\\int_{a}^{b} k\\,dx = k\\int_{a}^{b} dx = k(b-a).',
        source: src('ch2-thm-2.2.5'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.2.6',
        text: 'Let $f$ be integrable on $[a, b]$ and $f(x) \\ge 0$ for all $x$ in $[a, b]$, then',
        tex: '\\int_{a}^{b} f(x)\\,dx \\ge 0.',
        source: src('ch2-thm-2.2.6'),
      },
      {
        type: 'theorem',
        label: 'Theorem 2.2.7',
        text: 'If $f$ and $g$ are integrable on the closed interval $[a, b]$ and $f(x) \\le g(x)$ for every $x$ in $[a, b]$, then',
        tex: '\\int_{a}^{b} f(x)\\,dx \\le \\int_{a}^{b} g(x)\\,dx.',
        source: src('ch2-thm-2.2.7'),
      },
    ]),
    step('see-it', 'The properties as areas', [illustration(APP_ADDITIVITY), illustration(APP_COMPARE_INTEGRALS)]),
    step('worked-example', 'Worked example', [
      {
        type: 'workedExample',
        title: 'Example',
        problemTex: '\\int_{1}^{1} (x^{3} + 3x)dx',
        method: 'Equal limits (Theorem 2.2.2)',
        steps: [{ explanation: 'By definition', tex: '\\int_{1}^{1} (x^{3} + 3x)dx = 0.' }],
        resultTex: '\\int_{1}^{1} (x^{3} + 3x)dx = 0',
        source: src('ch2-2.2.2-example'),
        ...reviewOf('ch2-2.2.2-example'),
        origin: 'unamSource',
        solutionStatus: 'unamSource',
      },
    ]),
    exploreStep(AREA_UNITS.properties),
    practiseStep(AREA_UNITS.properties),
    ...laterSteps(AREA_UNITS.properties),
  ],
};
