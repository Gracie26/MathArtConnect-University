/**
 * Chapter 1 "You Try It" items and exercises (13 items), shown in each
 * subtopic's Try it step. The notes give no solutions for these, so every
 * solution is app-authored and `pendingLecturerReview` (MR-14).
 */
import type { PracticeItem } from '../../types';

import { INTEGRATION_UNITS as U, type IntegrationUnitId } from './ids';
import { buildPracticeItem, type PracticeSpec } from './practice';
import { CH1, sectionId } from './sources';

function chapterItem(
  inventoryId: string,
  sourceType: 'you-try-it' | 'chapter-exercise',
  section: string,
  page: number,
  label: string,
  unitId: IntegrationUnitId,
  spec: PracticeSpec,
): PracticeItem {
  return buildPracticeItem(
    {
      id: inventoryId,
      sourceType,
      source: { document: CH1, section, page, item: label, inventoryId },
      sourceSection: sectionId(section),
      unitId,
    },
    spec,
  );
}

export const CHAPTER1_PRACTICE: readonly PracticeItem[] = [
  chapterItem('ch1-1.5-yti-root', 'you-try-it', '1.5', 6, 'You Try It', U.substitution, {
    problem: '\\int \\sqrt[3]{(7-2x^{3})^{4}}\\,x^{2}\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = 7 − 2x³.',
    steps: [
      ['Let $u = 7 - 2x^{3}$, so $du = -6x^{2}\\,dx$.', '-\\frac{1}{6}\\int u^{\\frac{4}{3}}\\,du'],
      ['Use the power rule.', '-\\frac{1}{6} \\cdot \\frac{3}{7}u^{\\frac{7}{3}} + C'],
    ],
    answer: '-\\frac{1}{14}(7-2x^{3})^{\\frac{7}{3}} + C',
  }),
  chapterItem('ch1-1.5-yti-sec', 'you-try-it', '1.5', 7, 'You Try It', U.substitution, {
    problem: '\\int \\sec^{2}(1-4x)\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = 1 − 4x.',
    steps: [['Let $u = 1 - 4x$, so $du = -4\\,dx$.', '-\\frac{1}{4}\\int \\sec^{2}u\\,du = -\\frac{1}{4}\\tan u + C']],
    answer: '-\\frac{1}{4}\\tan(1-4x) + C',
  }),
  chapterItem('ch1-1.6-yti', 'you-try-it', '1.6', 8, 'You Try It', U.partialFractions, {
    problem: '\\int \\frac{2x+1}{(x-1)(x+3)}\\,dx',
    technique: 'partial-fractions-linear',
    difficulty: 1,
    method: 'Partial fractions with distinct linear factors.',
    steps: [['Decompose.', '\\frac{2x+1}{(x-1)(x+3)} = \\frac{3}{4(x-1)} + \\frac{5}{4(x+3)}']],
    answer: '\\frac{3}{4}\\ln|x-1| + \\frac{5}{4}\\ln|x+3| + C',
  }),
  chapterItem('ch1-1.6.1-yti', 'you-try-it', '1.6.1', 8, 'You Try It', U.partialFractions, {
    problem: '\\int \\frac{6x-1}{x^{3}(2x-1)}\\,dx',
    technique: 'partial-fractions-repeated',
    difficulty: 2,
    method: 'Partial fractions with the factor x repeated three times.',
    steps: [['Decompose.', '-\\frac{8}{x} - \\frac{4}{x^{2}} + \\frac{1}{x^{3}} + \\frac{16}{2x-1}']],
    answer: '-8\\ln|x| + \\frac{4}{x} - \\frac{1}{2x^{2}} + 8\\ln|2x-1| + C',
  }),
  chapterItem('ch1-1.6.2-yti', 'you-try-it', '1.6.2', 9, 'You Try It', U.partialFractions, {
    problem: '\\int \\frac{x^{3}-2x}{x^{2}+3x+2}\\,dx',
    technique: 'improper-rational',
    difficulty: 2,
    method: 'Long division first, then partial fractions.',
    steps: [
      ['Divide.', 'x - 3 + \\frac{5x+6}{(x+1)(x+2)}'],
      ['Decompose.', '\\frac{1}{x+1} + \\frac{4}{x+2}'],
    ],
    answer: '\\frac{x^{2}}{2} - 3x + \\ln|x+1| + 4\\ln|x+2| + C',
  }),
  chapterItem('ch1-1.6.3-yti', 'you-try-it', '1.6.3', 10, 'You Try It', U.partialFractions, {
    problem: '\\int \\frac{4x}{(x^{2}+1)(x^{2}+2x+3)}\\,dx',
    technique: 'partial-fractions-quadratic',
    difficulty: 3,
    method: 'Partial fractions with two irreducible quadratic factors, then complete the square.',
    steps: [
      ['Decompose.', '\\frac{x+1}{x^{2}+1} - \\frac{x+3}{x^{2}+2x+3}'],
      ['Complete the square in the second denominator.', 'x^{2}+2x+3 = (x+1)^{2} + 2'],
    ],
    answer:
      '\\frac{1}{2}\\ln(x^{2}+1) + \\tan^{-1}x - \\frac{1}{2}\\ln(x^{2}+2x+3) - \\sqrt{2}\\tan^{-1}\\left(\\frac{x+1}{\\sqrt{2}}\\right) + C',
  }),
  chapterItem('ch1-1.8-exercise-1', 'chapter-exercise', '1.8', 13, 'Exercise 1.8.1', U.algebraicTrig, {
    problem: '\\int \\frac{dx}{x^{2}\\sqrt{x^{2}+2x-1}}\\,dx',
    technique: 'algebraic-substitution',
    difficulty: 3,
    method: 'Read with a single dx (pending review): substitute x = 1/t, then complete the square.',
    steps: [
      [
        'For $x > 0$, let $x = \\frac{1}{t}$, so $dx = -\\frac{1}{t^{2}}\\,dt$.',
        '-\\int \\frac{t\\,dt}{\\sqrt{1+2t-t^{2}}} = -\\int \\frac{t\\,dt}{\\sqrt{2-(t-1)^{2}}}',
      ],
      ['Integrate and return to $x$.', '\\sqrt{1+2t-t^{2}} - \\sin^{-1}\\left(\\frac{t-1}{\\sqrt{2}}\\right) + C'],
    ],
    answer: '\\frac{\\sqrt{x^{2}+2x-1}}{x} - \\sin^{-1}\\left(\\frac{1-x}{\\sqrt{2}x}\\right) + C',
    reviewIds: ['MR-02'],
  }),
  chapterItem('ch1-1.9-yti', 'you-try-it', '1.9', 16, 'Exercise 1.9.1', U.algebraicTrig, {
    problem: '\\int \\frac{dx}{5+4\\cos x}',
    technique: 'tan-half-angle',
    difficulty: 2,
    method: 'Substitute t = tan(x/2).',
    steps: [
      [
        'With $t = \\tan\\frac{x}{2}$:',
        '\\int \\frac{2\\,dt}{9+t^{2}} = \\frac{2}{3}\\tan^{-1}\\left(\\frac{t}{3}\\right) + C',
      ],
    ],
    answer: '\\frac{2}{3}\\tan^{-1}\\left(\\frac{1}{3}\\tan\\frac{x}{2}\\right) + C',
  }),
  chapterItem('ch1-1.10-yti', 'you-try-it', '1.10', 18, 'You Try It', U.byParts, {
    problem: '\\int x\\tan^{-1}x\\,dx',
    technique: 'integration-by-parts',
    difficulty: 2,
    method: 'Parts with u = tan⁻¹x, dv = x dx.',
    steps: [
      [
        'Let $u = \\tan^{-1}x$ and $dv = x\\,dx$, so $v = \\frac{x^{2}}{2}$.',
        '\\frac{x^{2}}{2}\\tan^{-1}x - \\frac{1}{2}\\int \\frac{x^{2}}{1+x^{2}}\\,dx',
      ],
      [
        'Write $\\frac{x^{2}}{1+x^{2}} = 1 - \\frac{1}{1+x^{2}}$.',
        '\\frac{x^{2}}{2}\\tan^{-1}x - \\frac{x}{2} + \\frac{1}{2}\\tan^{-1}x + C',
      ],
    ],
    answer: '\\frac{1}{2}(x^{2}+1)\\tan^{-1}x - \\frac{x}{2} + C',
  }),
  chapterItem('ch1-1.13-yti-sin2cos3', 'you-try-it', '1.13', 21, 'You Try It', U.advancedPatterns, {
    problem: '\\int \\sin^{2}x\\cos^{3}x\\,dx',
    technique: 'odd-trig-powers',
    difficulty: 2,
    method: 'The power of cosine is odd: keep one cos x.',
    steps: [['Rewrite with $\\cos^{2}x = 1 - \\sin^{2}x$.', '\\int \\sin^{2}x(1-\\sin^{2}x)\\cos x\\,dx']],
    answer: '\\frac{1}{3}\\sin^{3}x - \\frac{1}{5}\\sin^{5}x + C',
  }),
  chapterItem('ch1-1.13-yti-sin2cos2', 'you-try-it', '1.13', 21, 'You Try It', U.advancedPatterns, {
    problem: '\\int \\sin^{2}x\\cos^{2}x\\,dx',
    technique: 'even-trig-powers',
    difficulty: 2,
    method: 'Both powers are even: use sin x cos x = ½ sin 2x.',
    steps: [['Use the identity.', '\\int \\frac{1}{4}\\sin^{2}2x\\,dx = \\frac{1}{4}\\int \\frac{1-\\cos 4x}{2}\\,dx']],
    answer: '\\frac{x}{8} - \\frac{1}{32}\\sin 4x + C',
  }),
  chapterItem('ch1-1.13-yti-sin2xsin4x', 'you-try-it', '1.13', 22, 'You Try It', U.advancedPatterns, {
    problem: '\\int \\sin 2x\\sin 4x\\,dx',
    technique: 'product-to-sum',
    difficulty: 1,
    method: 'Use sin px sin qx = −½ cos(p + q)x + ½ cos(p − q)x.',
    steps: [['Use the identity.', '\\frac{1}{2}\\int (\\cos 2x - \\cos 6x)\\,dx']],
    answer: '\\frac{1}{4}\\sin 2x - \\frac{1}{12}\\sin 6x + C',
  }),
  chapterItem('ch1-1.14-yti', 'you-try-it', '1.14', 22, 'You Try It', U.advancedPatterns, {
    instruction: 'Find',
    problem: '\\int \\frac{1+\\cos x-3\\sin x}{2+2\\cos x-\\sin x}\\,dx',
    technique: 'trig-quotient',
    difficulty: 3,
    method: 'Write the numerator as p(D) + q D′ + r, then use t = tan(x/2) for the remaining term.',
    steps: [
      ['With $D = 2 + 2\\cos x - \\sin x$, compare coefficients.', 'p = 1, \\quad q = 1, \\quad r = -1'],
      [
        'The remaining integral, with $t = \\tan\\frac{x}{2}$:',
        '-\\int \\frac{dx}{2+2\\cos x-\\sin x} = -\\int \\frac{dt}{2-t} = \\ln|2-t| + C',
      ],
    ],
    answer: 'x + \\ln|2+2\\cos x-\\sin x| + \\ln\\left|2-\\tan\\frac{x}{2}\\right| + C',
  }),
];
