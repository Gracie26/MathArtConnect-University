/**
 * The Chapter 2 "You Try It" (Exercise 2.2.1, printed pages 29–30). The notes
 * give no answer, so the walkthrough is app-authored and
 * `pendingLecturerReview` (MR2-SOL).
 */
import type { PracticeItem } from '../../types';

import { AREA_UNITS as U } from './ids';
import { buildAreaItem } from './practice';
import { CH2 } from './sources';

export const CHAPTER2_PRACTICE: readonly PracticeItem[] = [
  buildAreaItem(
    {
      id: 'ch2-ex-2.2.1-yti',
      sourceType: 'you-try-it',
      source: { document: CH2, section: '2.2.1', page: 30, item: 'Exercise 2.2.1', inventoryId: 'ch2-ex-2.2.1-yti' },
      sourceSection: '2-2-1',
      unitId: U.definite,
    },
    {
      instruction: 'Evaluate by calculating the limit of the Riemann Sums',
      problem: '\\int_{1}^{2} (x - 1)\\,dx',
      technique: 'riemann-limit',
      difficulty: 1,
      method: 'As in Example 2.2.1: right endpoints, Δx = 1/n and xᵢ = 1 + i/n.',
      steps: [
        [
          'Divide $[1, 2]$ into $n$ subintervals of equal length:',
          '\\Delta x = \\frac{2 - 1}{n} = \\frac{1}{n}, \\quad x_{i} = 1 + \\frac{i}{n}',
        ],
        ['The height of the ith rectangle is $f(x_{i}) = x_{i} - 1$:', 'f(x_{i}) = \\frac{i}{n}'],
        [
          'The nth Riemann sum, with formula (1):',
          '\\sum_{i=1}^{n} \\frac{i}{n}\\cdot\\frac{1}{n} = \\frac{1}{n^{2}}\\cdot\\frac{n(n+1)}{2} = \\frac{n+1}{2n}',
        ],
        ['Take the limit:', '\\lim_{n \\to \\infty} \\frac{n+1}{2n} = \\frac{1}{2}'],
      ],
      answer: '\\frac{1}{2}',
      definite: { integrand: 'x - 1', variable: 'x', lower: 1, upper: 2, answer: { kind: 'value', value: 0.5 } },
    },
  ),
];
