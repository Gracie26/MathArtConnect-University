import type { LearningUnitDefinition } from '../../../types';
import { AREA_UNITS } from '../ids';
import { ch2 } from '../sources';
import { exploreStep, figure, laterSteps, reviewOf, src, step } from '../steps';

/**
 * Source: §2.4 The Mean Value Theorem for Integrals (printed pages 33–34).
 * The notes give no worked example, "You Try It" or tutorial question for
 * this section; none is invented.
 */
export const meanValueTheorem: LearningUnitDefinition = {
  id: AREA_UNITS.mvt,
  slug: 'mean-value-theorem-for-integrals',
  title: 'The Mean Value Theorem for Integrals',
  summary:
    'A rectangle between the inscribed and circumscribed ones has exactly the area under the curve: the average value.',
  glyph: 'limits',
  tone: 'blue',
  source: [ch2('2.4', 33), ch2('2.4', 34)],
  steps: [
    step('concept', 'The Mean Value Theorem for Integrals', [
      {
        type: 'paragraph',
        text: 'The area of a region under a curve is underestimated when approximated with an inscribed (lying inside) rectangle and overestimated when approximated with a circumscribed (lying outside) rectangle. The Mean Value Theorem for integrals states that somewhere “between” the inscribed and circumscribed rectangles there is a rectangle whose area is precisely equal to the area of the region under the curve, as shown in Figure 2.5.',
        source: src('ch2-2.4-rectangles'),
      },
      figure('ch2-fig-2.5'),
      {
        type: 'theorem',
        label: 'Theorem 2.4.1',
        title: 'Mean Value Theorem for Integrals',
        text: 'If $f$ is continuous on the closed interval $[a, b]$, then there exists a number $c$ in the closed interval $[a, b]$ such that',
        tex: '\\int_{a}^{b} f(x)\\,dx = f(c)(b-a).',
        source: src('ch2-thm-2.4.1'),
      },
      {
        type: 'paragraph',
        text: 'The value of $f(c)$ given in the Mean Value Theorem for Integrals is called the average value of $f$ on the interval $[a, b]$',
        source: src('ch2-2.4-average'),
      },
      {
        type: 'definition',
        term: 'Definition 2.4.1',
        text: 'If is integrable on the closed interval $[a, b]$, then the average value of $f$ on the interval is',
        tex: 'f(c) = \\frac{1}{b-a}\\int_{a}^{b} f(x)\\,dx.',
        source: src('ch2-def-2.4.1'),
        ...reviewOf('ch2-def-2.4.1'),
      },
      {
        type: 'callout',
        tone: 'insight',
        title: 'Reading Figure 2.5',
        text: 'The rectangle of height $f(c)$ on $[a, b]$ has area $f(c)(b - a)$. In the middle drawing the part of the region above the rectangle exactly balances the part of the rectangle above the curve, so the two areas are equal. Since $f(m) \\le f(c) \\le f(M)$, the mean value rectangle lies between the inscribed and circumscribed rectangles.',
      },
      {
        type: 'paragraph',
        text: 'The course notes give no worked example and Tutorial 2 has no question for this section. Use the Explore tool to find the mean value rectangle for yourself.',
      },
    ]),
    exploreStep(AREA_UNITS.mvt),
    ...laterSteps(AREA_UNITS.mvt),
  ],
};
