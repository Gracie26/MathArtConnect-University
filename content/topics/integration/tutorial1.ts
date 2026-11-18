/**
 * Tutorial 1 "Integration (Part 1)" — all 84 parts as structured practice data.
 *
 * Questions are transcribed from the tutorial exactly (checked against the
 * page images). The tutorial has no answer key, so every solution below is
 * app-authored and `pendingLecturerReview` (MR-14): hidden from learners and
 * never presented as an official UNAM answer. Each answer is checked by
 * differentiation in __tests__/integration-solutions.test.ts.
 */
import type { PracticeItem } from '../../types';

import { INTEGRATION_UNITS as U, type IntegrationUnitId } from './ids';
import { buildPracticeItem, type PracticeSpec } from './practice';
import { TUT1, TUTORIAL1_SECTION_MAP } from './sources';

function part(
  question: string,
  sub: string | null,
  page: number,
  unitId: IntegrationUnitId,
  spec: PracticeSpec,
): PracticeItem {
  const item = sub ? `${question}(${sub})` : question;
  return buildPracticeItem(
    {
      id: `tut1-${question.toLowerCase()}${sub ? `-${sub}` : ''}`,
      sourceType: 'tutorial-question',
      source: { document: TUT1, item, page },
      sourceQuestion: question,
      ...(sub ? { sourceSubquestion: sub } : {}),
      sourceSection: TUTORIAL1_SECTION_MAP[item] ?? '',
      unitId,
    },
    spec,
  );
}

export const TUTORIAL1_ITEMS: readonly PracticeItem[] = [
  // ---------------------------------------------------------------------------
  // Question 1: Evaluate the following.
  // ---------------------------------------------------------------------------
  part('Q1', 'i', 1, U.substitution, {
    problem: '\\int (3x+5)^{5}\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = 3x + 5.',
    steps: [
      ['Let $u = 3x + 5$, so $du = 3\\,dx$.', '\\int (3x+5)^{5}\\,dx = \\frac{1}{3}\\int u^{5}\\,du'],
      ['Use the power rule and return to $x$.', '\\frac{1}{3} \\cdot \\frac{u^{6}}{6} + C'],
    ],
    answer: '\\frac{(3x+5)^{6}}{18} + C',
  }),
  part('Q1', 'ii', 1, U.substitution, {
    problem: '\\int \\cos(6-7x)\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = 6 − 7x.',
    steps: [
      ['Let $u = 6 - 7x$, so $du = -7\\,dx$.', '\\int \\cos(6-7x)\\,dx = -\\frac{1}{7}\\int \\cos u\\,du'],
      ['Integrate and return to $x$.', '-\\frac{1}{7}\\sin u + C'],
    ],
    answer: '-\\frac{1}{7}\\sin(6-7x) + C',
  }),
  part('Q1', 'iii', 1, U.substitution, {
    problem: '\\int \\frac{1}{1-x}\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = 1 − x.',
    steps: [['Let $u = 1 - x$, so $du = -dx$.', '\\int \\frac{1}{1-x}\\,dx = -\\int \\frac{1}{u}\\,du = -\\ln|u| + C']],
    answer: '-\\ln|1-x| + C',
  }),
  part('Q1', 'iv', 1, U.substitution, {
    problem: '\\int \\frac{1}{ax+b}\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = ax + b (assuming a ≠ 0).',
    steps: [
      [
        'Let $u = ax + b$, so $du = a\\,dx$ (with $a \\neq 0$).',
        '\\int \\frac{1}{ax+b}\\,dx = \\frac{1}{a}\\int \\frac{1}{u}\\,du',
      ],
    ],
    answer: '\\frac{1}{a}\\ln|ax+b| + C',
  }),
  part('Q1', 'v', 1, U.basicRules, {
    problem: '\\int \\left(x^{2} + x^{-2}\\right)dx',
    technique: 'standard-forms',
    difficulty: 1,
    method: 'Integrate term by term with the power rule.',
    steps: [
      ['Apply the power rule to each term.', '\\frac{x^{3}}{3} + \\frac{x^{-1}}{-1} + C'],
      ['Simplify.', '\\frac{x^{3}}{3} - \\frac{1}{x} + C'],
    ],
    answer: '\\frac{x^{3}}{3} - \\frac{1}{x} + C',
  }),
  part('Q1', 'vi', 1, U.substitution, {
    problem: '\\int x^{5}\\sqrt{1+x^{2}}\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = 1 + x² and write x⁴ = (u − 1)².',
    steps: [
      [
        'Let $u = 1 + x^{2}$, so $du = 2x\\,dx$ and $x^{4} = (u-1)^{2}$.',
        '\\int x^{5}\\sqrt{1+x^{2}}\\,dx = \\frac{1}{2}\\int (u-1)^{2}u^{\\frac{1}{2}}\\,du',
      ],
      [
        'Expand and integrate term by term.',
        '\\frac{1}{2}\\int \\left(u^{\\frac{5}{2}} - 2u^{\\frac{3}{2}} + u^{\\frac{1}{2}}\\right)du',
      ],
    ],
    answer:
      '\\frac{1}{7}(1+x^{2})^{\\frac{7}{2}} - \\frac{2}{5}(1+x^{2})^{\\frac{5}{2}} + \\frac{1}{3}(1+x^{2})^{\\frac{3}{2}} + C',
  }),
  part('Q1', 'vii', 1, U.substitution, {
    problem: '\\int \\frac{\\sec^{2}(1/x)}{x^{2}}\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = 1/x.',
    steps: [['Let $u = \\frac{1}{x}$, so $du = -\\frac{1}{x^{2}}\\,dx$.', '-\\int \\sec^{2}u\\,du = -\\tan u + C']],
    answer: '-\\tan\\left(\\frac{1}{x}\\right) + C',
  }),
  part('Q1', 'viii', 1, U.substitution, {
    problem: '\\int \\tan^{2}x\\sec^{2}x\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = tan x.',
    steps: [['Let $u = \\tan x$, so $du = \\sec^{2}x\\,dx$.', '\\int u^{2}\\,du = \\frac{u^{3}}{3} + C']],
    answer: '\\frac{1}{3}\\tan^{3}x + C',
  }),
  part('Q1', 'ix', 1, U.substitution, {
    problem: '\\int \\cos x\\sin(\\sin x)\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = sin x.',
    steps: [['Let $u = \\sin x$, so $du = \\cos x\\,dx$.', '\\int \\sin u\\,du = -\\cos u + C']],
    answer: '-\\cos(\\sin x) + C',
  }),
  part('Q1', 'x', 1, U.substitution, {
    problem: '\\int \\frac{\\cos\\theta}{\\sin^{2}\\theta}\\,d\\theta',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = sin θ.',
    steps: [['Let $u = \\sin\\theta$, so $du = \\cos\\theta\\,d\\theta$.', '\\int u^{-2}\\,du = -u^{-1} + C']],
    answer: '-\\frac{1}{\\sin\\theta} + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 2: Evaluate the following.
  // ---------------------------------------------------------------------------
  part('Q2', 'i', 1, U.substitution, {
    problem: '\\int \\frac{\\cos x - \\sin x}{\\cos x + \\sin x}\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'The numerator is the derivative of the denominator.',
    steps: [
      ['Let $u = \\cos x + \\sin x$, so $du = (\\cos x - \\sin x)\\,dx$.', '\\int \\frac{1}{u}\\,du = \\ln|u| + C'],
    ],
    answer: '\\ln|\\cos x + \\sin x| + C',
  }),
  part('Q2', 'ii', 1, U.substitution, {
    problem: '\\int (x+2)\\sin(x^{2}+4x-6)\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = x² + 4x − 6.',
    steps: [
      ['Let $u = x^{2} + 4x - 6$, so $du = 2(x+2)\\,dx$.', '\\frac{1}{2}\\int \\sin u\\,du = -\\frac{1}{2}\\cos u + C'],
    ],
    answer: '-\\frac{1}{2}\\cos(x^{2}+4x-6) + C',
  }),
  part('Q2', 'iii', 1, U.substitution, {
    problem: '\\int x^{2}e^{\\sin x^{3}}\\cos x^{3}\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = sin x³.',
    steps: [
      [
        'Let $u = \\sin x^{3}$, so $du = 3x^{2}\\cos x^{3}\\,dx$.',
        '\\frac{1}{3}\\int e^{u}\\,du = \\frac{1}{3}e^{u} + C',
      ],
    ],
    answer: '\\frac{1}{3}e^{\\sin x^{3}} + C',
  }),
  part('Q2', 'iv', 1, U.substitution, {
    problem: '\\int \\frac{\\tan^{-1}x}{1+x^{2}}\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = tan⁻¹x.',
    steps: [['Let $u = \\tan^{-1}x$, so $du = \\frac{1}{1+x^{2}}\\,dx$.', '\\int u\\,du = \\frac{u^{2}}{2} + C']],
    answer: '\\frac{1}{2}(\\tan^{-1}x)^{2} + C',
  }),
  part('Q2', 'v', 1, U.substitution, {
    problem: '\\int \\frac{dx}{x(\\ln x)^{4}}',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = ln x.',
    steps: [['Let $u = \\ln x$, so $du = \\frac{1}{x}\\,dx$.', '\\int u^{-4}\\,du = \\frac{u^{-3}}{-3} + C']],
    answer: '-\\frac{1}{3(\\ln x)^{3}} + C',
  }),
  part('Q2', 'vi', 1, U.substitution, {
    problem: '\\int x^{2}\\sqrt{2x^{3}-4}\\,dx',
    technique: 'u-substitution',
    difficulty: 1,
    method: 'Substitute u = 2x³ − 4.',
    steps: [
      [
        'Let $u = 2x^{3} - 4$, so $du = 6x^{2}\\,dx$.',
        '\\frac{1}{6}\\int u^{\\frac{1}{2}}\\,du = \\frac{1}{6} \\cdot \\frac{2}{3}u^{\\frac{3}{2}} + C',
      ],
    ],
    answer: '\\frac{1}{9}(2x^{3}-4)^{\\frac{3}{2}} + C',
  }),
  part('Q2', 'vii', 1, U.substitution, {
    problem: '\\int \\frac{3x}{\\sqrt[3]{2x^{2}+3}}\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = 2x² + 3.',
    steps: [
      [
        'Let $u = 2x^{2} + 3$, so $du = 4x\\,dx$.',
        '\\frac{3}{4}\\int u^{-\\frac{1}{3}}\\,du = \\frac{3}{4} \\cdot \\frac{3}{2}u^{\\frac{2}{3}} + C',
      ],
    ],
    answer: '\\frac{9}{8}(2x^{2}+3)^{\\frac{2}{3}} + C',
  }),
  part('Q2', 'viii', 1, U.substitution, {
    problem: '\\int \\frac{x\\sin^{-1}x^{2}}{\\sqrt{1-x^{4}}}\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = sin⁻¹x².',
    steps: [
      [
        'Let $u = \\sin^{-1}x^{2}$, so $du = \\frac{2x}{\\sqrt{1-x^{4}}}\\,dx$.',
        '\\frac{1}{2}\\int u\\,du = \\frac{u^{2}}{4} + C',
      ],
    ],
    answer: '\\frac{1}{4}(\\sin^{-1}x^{2})^{2} + C',
  }),
  part('Q2', 'ix', 1, U.substitution, {
    problem: '\\int \\tan x\\,e^{(\\tan x)^{2}}\\sec^{2}x\\,dx',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = (tan x)².',
    steps: [
      [
        'Let $u = (\\tan x)^{2}$, so $du = 2\\tan x\\sec^{2}x\\,dx$.',
        '\\frac{1}{2}\\int e^{u}\\,du = \\frac{1}{2}e^{u} + C',
      ],
    ],
    answer: '\\frac{1}{2}e^{(\\tan x)^{2}} + C',
  }),
  part('Q2', 'x', 1, U.substitution, {
    problem: '\\int \\frac{dx}{\\cos^{2}x\\sqrt{1+\\tan x}}',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Write 1/cos²x as sec²x and substitute u = 1 + tan x.',
    steps: [
      [
        'Since $\\frac{1}{\\cos^{2}x} = \\sec^{2}x$, let $u = 1 + \\tan x$, so $du = \\sec^{2}x\\,dx$.',
        '\\int u^{-\\frac{1}{2}}\\,du = 2u^{\\frac{1}{2}} + C',
      ],
    ],
    answer: '2\\sqrt{1+\\tan x} + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 3: Evaluate (partial fractions).
  // ---------------------------------------------------------------------------
  part('Q3', 'i', 1, U.partialFractions, {
    problem: '\\int \\frac{1}{(x^{2}+1)(x+1)}\\,dx',
    technique: 'partial-fractions-quadratic',
    difficulty: 2,
    method: 'Partial fractions with a linear and an irreducible quadratic factor.',
    steps: [
      ['Decompose.', '\\frac{1}{(x^{2}+1)(x+1)} = \\frac{1}{2(x+1)} + \\frac{-x+1}{2(x^{2}+1)}'],
      ['Integrate each term.', '\\frac{1}{2}\\ln|x+1| - \\frac{1}{4}\\ln(x^{2}+1) + \\frac{1}{2}\\tan^{-1}x + C'],
    ],
    answer: '\\frac{1}{2}\\ln|x+1| - \\frac{1}{4}\\ln(x^{2}+1) + \\frac{1}{2}\\tan^{-1}x + C',
  }),
  part('Q3', 'ii', 1, U.partialFractions, {
    problem: '\\int \\frac{x+5}{(2x-1)(x+3)}\\,dx',
    technique: 'partial-fractions-linear',
    difficulty: 1,
    method: 'Partial fractions with distinct linear factors.',
    steps: [
      ['Decompose.', '\\frac{x+5}{(2x-1)(x+3)} = \\frac{11}{7(2x-1)} - \\frac{2}{7(x+3)}'],
      ['Integrate each term.', '\\frac{11}{14}\\ln|2x-1| - \\frac{2}{7}\\ln|x+3| + C'],
    ],
    answer: '\\frac{11}{14}\\ln|2x-1| - \\frac{2}{7}\\ln|x+3| + C',
  }),
  part('Q3', 'iii', 1, U.partialFractions, {
    problem: '\\int \\frac{2x-5}{(x^{2}+4)(x+6)}\\,dx',
    technique: 'partial-fractions-quadratic',
    difficulty: 2,
    method: 'Partial fractions with a linear and an irreducible quadratic factor.',
    steps: [
      ['Decompose.', '\\frac{2x-5}{(x^{2}+4)(x+6)} = -\\frac{17}{40(x+6)} + \\frac{17x - 22}{40(x^{2}+4)}'],
      [
        'Integrate each term.',
        '-\\frac{17}{40}\\ln|x+6| + \\frac{17}{80}\\ln(x^{2}+4) - \\frac{11}{40}\\tan^{-1}\\left(\\frac{x}{2}\\right) + C',
      ],
    ],
    answer:
      '-\\frac{17}{40}\\ln|x+6| + \\frac{17}{80}\\ln(x^{2}+4) - \\frac{11}{40}\\tan^{-1}\\left(\\frac{x}{2}\\right) + C',
  }),
  part('Q3', 'iv', 1, U.partialFractions, {
    problem: '\\int \\frac{x^{2}+2x-1}{2x^{3}+3x^{2}-2x}\\,dx',
    technique: 'partial-fractions-linear',
    difficulty: 2,
    method: 'Factorise the denominator as x(2x − 1)(x + 2), then use partial fractions.',
    steps: [
      ['Factorise the denominator.', '2x^{3}+3x^{2}-2x = x(2x-1)(x+2)'],
      ['Decompose.', '\\frac{1}{2x} + \\frac{1}{5(2x-1)} - \\frac{1}{10(x+2)}'],
    ],
    answer: '\\frac{1}{2}\\ln|x| + \\frac{1}{10}\\ln|2x-1| - \\frac{1}{10}\\ln|x+2| + C',
  }),
  part('Q3', 'v', 1, U.partialFractions, {
    problem: '\\int \\frac{x^{4}-2x^{2}+4x+1}{x^{3}-x^{2}-x+1}\\,dx',
    technique: 'improper-rational',
    difficulty: 3,
    method: 'Long division first, then partial fractions with a repeated factor.',
    steps: [
      [
        'Divide, and factorise the denominator as $(x-1)^{2}(x+1)$.',
        '\\frac{x^{4}-2x^{2}+4x+1}{x^{3}-x^{2}-x+1} = x + 1 + \\frac{4x}{(x-1)^{2}(x+1)}',
      ],
      [
        'Decompose the proper fraction.',
        '\\frac{4x}{(x-1)^{2}(x+1)} = \\frac{1}{x-1} + \\frac{2}{(x-1)^{2}} - \\frac{1}{x+1}',
      ],
    ],
    answer: '\\frac{x^{2}}{2} + x + \\ln|x-1| - \\frac{2}{x-1} - \\ln|x+1| + C',
  }),
  part('Q3', 'vi', 1, U.partialFractions, {
    problem: '\\int \\frac{x}{(x-2)(x^{2}+1)(x^{2}+4)}\\,dx',
    technique: 'partial-fractions-quadratic',
    difficulty: 3,
    method: 'Partial fractions with one linear and two irreducible quadratic factors.',
    steps: [
      ['Decompose.', '\\frac{1}{20(x-2)} + \\frac{-2x+1}{15(x^{2}+1)} + \\frac{x-2}{12(x^{2}+4)}'],
      [
        'Integrate each term; the quadratic terms give logarithms and inverse tangents.',
        '\\frac{1}{20}\\ln|x-2| - \\frac{1}{15}\\ln(x^{2}+1) + \\frac{1}{15}\\tan^{-1}x + \\frac{1}{24}\\ln(x^{2}+4) - \\frac{1}{12}\\tan^{-1}\\left(\\frac{x}{2}\\right) + C',
      ],
    ],
    answer:
      '\\frac{1}{20}\\ln|x-2| - \\frac{1}{15}\\ln(x^{2}+1) + \\frac{1}{15}\\tan^{-1}x + \\frac{1}{24}\\ln(x^{2}+4) - \\frac{1}{12}\\tan^{-1}\\left(\\frac{x}{2}\\right) + C',
  }),
  part('Q3', 'vii', 1, U.partialFractions, {
    problem: '\\int \\frac{1-x+2x^{2}-x^{3}}{x(x^{2}+1)^{2}}\\,dx',
    technique: 'partial-fractions-quadratic',
    difficulty: 3,
    method: 'Partial fractions with a repeated irreducible quadratic factor.',
    steps: [
      ['Decompose.', '\\frac{1}{x} - \\frac{x+1}{x^{2}+1} + \\frac{x}{(x^{2}+1)^{2}}'],
      ['Integrate each term.', '\\ln|x| - \\frac{1}{2}\\ln(x^{2}+1) - \\tan^{-1}x - \\frac{1}{2(x^{2}+1)} + C'],
    ],
    answer: '\\ln|x| - \\frac{1}{2}\\ln(x^{2}+1) - \\tan^{-1}x - \\frac{1}{2(x^{2}+1)} + C',
  }),
  part('Q3', 'viii', 1, U.partialFractions, {
    problem: '\\int \\frac{2x+1}{(x+1)^{3}(x^{2}+4)^{2}}\\,dx',
    technique: 'partial-fractions-quadratic',
    difficulty: 3,
    method: 'Partial fractions with a repeated linear and a repeated quadratic factor.',
    steps: [
      [
        'Decompose.',
        '\\frac{38}{625(x+1)} + \\frac{6}{125(x+1)^{2}} - \\frac{1}{25(x+1)^{3}} + \\frac{-38x+8}{625(x^{2}+4)} - \\frac{21x+19}{125(x^{2}+4)^{2}}',
      ],
      [
        'The last term needs',
        '\\int \\frac{dx}{(x^{2}+4)^{2}} = \\frac{x}{8(x^{2}+4)} + \\frac{1}{16}\\tan^{-1}\\left(\\frac{x}{2}\\right)',
      ],
    ],
    answer:
      '\\frac{38}{625}\\ln|x+1| - \\frac{6}{125(x+1)} + \\frac{1}{50(x+1)^{2}} - \\frac{19}{625}\\ln(x^{2}+4) + \\frac{84-19x}{1000(x^{2}+4)} - \\frac{31}{10000}\\tan^{-1}\\left(\\frac{x}{2}\\right) + C',
  }),

  // ---------------------------------------------------------------------------
  // Questions 4 and 5: find, and hence find.
  // ---------------------------------------------------------------------------
  part('Q4', 'a', 1, U.partialFractions, {
    instruction: 'Find',
    problem: '\\int \\frac{11x+5}{3x^{2}+2x-5}\\,dx',
    technique: 'partial-fractions-linear',
    difficulty: 2,
    method: 'Factorise as (3x + 5)(x − 1), then use partial fractions.',
    steps: [['Decompose.', '\\frac{11x+5}{(3x+5)(x-1)} = \\frac{5}{3x+5} + \\frac{2}{x-1}']],
    answer: '\\frac{5}{3}\\ln|3x+5| + 2\\ln|x-1| + C',
  }),
  part('Q4', 'b', 1, U.partialFractions, {
    instruction: 'Hence find',
    problem: '\\int \\frac{6x^{3}+13x^{2}+7x-10}{3x^{2}+2x-5}\\,dx',
    technique: 'improper-rational',
    difficulty: 2,
    method: 'Long division leaves the fraction from the previous part.',
    steps: [
      ['Divide.', '\\frac{6x^{3}+13x^{2}+7x-10}{3x^{2}+2x-5} = 2x + 3 + \\frac{11x+5}{3x^{2}+2x-5}'],
      ['Use the previous result for the remaining fraction.'],
    ],
    answer: 'x^{2} + 3x + \\frac{5}{3}\\ln|3x+5| + 2\\ln|x-1| + C',
  }),
  part('Q5', 'a', 1, U.partialFractions, {
    instruction: 'Find',
    problem: '\\int \\frac{3x^{3}+11x^{2}+3x+2}{x(x+1)^{3}}\\,dx',
    technique: 'partial-fractions-repeated',
    difficulty: 2,
    method: 'Partial fractions with a linear factor repeated three times.',
    steps: [
      ['Decompose.', '\\frac{2}{x} + \\frac{1}{x+1} + \\frac{3}{(x+1)^{2}} - \\frac{7}{(x+1)^{3}}'],
      ['Integrate each term.'],
    ],
    answer: '2\\ln|x| + \\ln|x+1| - \\frac{3}{x+1} + \\frac{7}{2(x+1)^{2}} + C',
  }),
  part('Q5', 'b', 1, U.partialFractions, {
    instruction: 'Hence find',
    problem: '\\int \\frac{4x^{5}+19x^{4}+36x^{3}+36x^{2}+10x+2}{x(x+1)^{3}}\\,dx',
    technique: 'improper-rational',
    difficulty: 2,
    method: 'Long division leaves the fraction from the previous part.',
    steps: [
      ['Divide.', '4x + 7 + \\frac{3x^{3}+11x^{2}+3x+2}{x(x+1)^{3}}'],
      ['Use the previous result for the remaining fraction.'],
    ],
    answer: '2x^{2} + 7x + 2\\ln|x| + \\ln|x+1| - \\frac{3}{x+1} + \\frac{7}{2(x+1)^{2}} + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 6
  // ---------------------------------------------------------------------------
  part('Q6', null, 1, U.partialFractions, {
    problem: '\\int \\frac{\\mu}{\\beta^{2}+(x+\\alpha)^{2}}\\,dx',
    condition: 'where $\\mu$, $\\alpha$ and $\\beta$ are constants.',
    technique: 'completing-square',
    difficulty: 1,
    method: 'Substitute u = x + α and use the inverse-tangent form (assuming β ≠ 0).',
    steps: [
      [
        'Let $u = x + \\alpha$ (with $\\beta \\neq 0$).',
        '\\mu\\int \\frac{du}{\\beta^{2}+u^{2}} = \\frac{\\mu}{\\beta}\\tan^{-1}\\left(\\frac{u}{\\beta}\\right) + C',
      ],
    ],
    answer: '\\frac{\\mu}{\\beta}\\tan^{-1}\\left(\\frac{x+\\alpha}{\\beta}\\right) + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 7: Evaluate by using an appropriate substitution.
  // ---------------------------------------------------------------------------
  part('Q7', 'i', 2, U.algebraicTrig, {
    problem: '\\int \\frac{x^{5}\\,dx}{\\sqrt{x^{3}+1}}',
    technique: 'algebraic-substitution',
    difficulty: 2,
    method: 'Substitute u = x³ + 1.',
    steps: [
      [
        'Let $u = x^{3} + 1$, so $du = 3x^{2}\\,dx$ and $x^{3} = u - 1$.',
        '\\frac{1}{3}\\int (u-1)u^{-\\frac{1}{2}}\\,du = \\frac{1}{3}\\left(\\frac{2}{3}u^{\\frac{3}{2}} - 2u^{\\frac{1}{2}}\\right) + C',
      ],
    ],
    answer: '\\frac{2}{9}(x^{3}+1)^{\\frac{3}{2}} - \\frac{2}{3}(x^{3}+1)^{\\frac{1}{2}} + C',
  }),
  part('Q7', 'ii', 2, U.algebraicTrig, {
    problem: '\\int x^{7}\\sqrt{x^{4}+1}\\,dx',
    technique: 'algebraic-substitution',
    difficulty: 2,
    method: 'Substitute u = x⁴ + 1.',
    steps: [
      [
        'Let $u = x^{4} + 1$, so $du = 4x^{3}\\,dx$ and $x^{4} = u - 1$.',
        '\\frac{1}{4}\\int (u-1)u^{\\frac{1}{2}}\\,du = \\frac{1}{4}\\left(\\frac{2}{5}u^{\\frac{5}{2}} - \\frac{2}{3}u^{\\frac{3}{2}}\\right) + C',
      ],
    ],
    answer: '\\frac{1}{10}(x^{4}+1)^{\\frac{5}{2}} - \\frac{1}{6}(x^{4}+1)^{\\frac{3}{2}} + C',
  }),
  part('Q7', 'iii', 2, U.algebraicTrig, {
    problem: '\\int \\sqrt{\\frac{1+x}{1-x}}\\,dx',
    technique: 'algebraic-substitution',
    difficulty: 2,
    method: 'Multiply inside the root by (1 + x)/(1 + x) to get standard forms.',
    steps: [
      [
        'For $-1 < x < 1$:',
        '\\sqrt{\\frac{1+x}{1-x}} = \\frac{1+x}{\\sqrt{1-x^{2}}} = \\frac{1}{\\sqrt{1-x^{2}}} + \\frac{x}{\\sqrt{1-x^{2}}}',
      ],
      ['Integrate each term.', '\\sin^{-1}x - \\sqrt{1-x^{2}} + C'],
    ],
    answer: '\\sin^{-1}x - \\sqrt{1-x^{2}} + C',
  }),
  part('Q7', 'iv', 2, U.algebraicTrig, {
    problem: '\\int \\frac{x}{2+\\sqrt{x+1}}\\,dx',
    technique: 'algebraic-substitution',
    difficulty: 2,
    method: 'Substitute u = √(x + 1), giving a rational function of u.',
    steps: [
      [
        'Let $u = \\sqrt{x+1}$, so $x = u^{2} - 1$ and $dx = 2u\\,du$.',
        '2\\int \\frac{u^{3}-u}{u+2}\\,du = 2\\int \\left(u^{2} - 2u + 3 - \\frac{6}{u+2}\\right)du',
      ],
      ['Integrate and return to $x$.', '\\frac{2}{3}u^{3} - 2u^{2} + 6u - 12\\ln|u+2| + C'],
    ],
    answer: '\\frac{2}{3}(x+1)^{\\frac{3}{2}} - 2(x+1) + 6\\sqrt{x+1} - 12\\ln(2+\\sqrt{x+1}) + C',
  }),
  part('Q7', 'v', 2, U.algebraicTrig, {
    problem: '\\int \\frac{x^{\\frac{2}{3}}}{1+x^{\\frac{1}{2}}}\\,dx',
    technique: 'fractional-powers',
    difficulty: 3,
    method: 'Substitute x = u⁶ (6 is the LCM of 3 and 2).',
    steps: [
      [
        'Let $x = u^{6}$, so $dx = 6u^{5}\\,du$.',
        '6\\int \\frac{u^{9}}{1+u^{3}}\\,du = 6\\int \\left(u^{6} - u^{3} + 1 - \\frac{1}{1+u^{3}}\\right)du',
      ],
      [
        'Use partial fractions for the last term.',
        '\\frac{1}{1+u^{3}} = \\frac{1}{3(u+1)} + \\frac{-u+2}{3(u^{2}-u+1)}',
      ],
    ],
    answer:
      '\\frac{6}{7}x^{\\frac{7}{6}} - \\frac{3}{2}x^{\\frac{2}{3}} + 6x^{\\frac{1}{6}} - 2\\ln(1+x^{\\frac{1}{6}}) + \\ln(x^{\\frac{1}{3}} - x^{\\frac{1}{6}} + 1) - 2\\sqrt{3}\\tan^{-1}\\left(\\frac{2x^{\\frac{1}{6}}-1}{\\sqrt{3}}\\right) + C',
  }),
  part('Q7', 'vi', 2, U.algebraicTrig, {
    problem: '\\int \\frac{1}{x^{\\frac{1}{2}}+x^{\\frac{1}{4}}}\\,dx',
    technique: 'fractional-powers',
    difficulty: 2,
    method: 'Substitute x = u⁴ (4 is the LCM of 2 and 4).',
    steps: [
      [
        'Let $x = u^{4}$, so $dx = 4u^{3}\\,du$.',
        '4\\int \\frac{u^{2}}{u+1}\\,du = 4\\int \\left(u - 1 + \\frac{1}{u+1}\\right)du',
      ],
    ],
    answer: '2x^{\\frac{1}{2}} - 4x^{\\frac{1}{4}} + 4\\ln(1+x^{\\frac{1}{4}}) + C',
  }),
  part('Q7', 'vii', 2, U.algebraicTrig, {
    problem: '\\int \\frac{\\sqrt[3]{x}}{1+\\sqrt{x}}\\,dx',
    technique: 'fractional-powers',
    difficulty: 3,
    method: 'Substitute x = u⁶ (6 is the LCM of 3 and 2).',
    steps: [
      [
        'Let $x = u^{6}$, so $dx = 6u^{5}\\,du$.',
        '6\\int \\frac{u^{7}}{1+u^{3}}\\,du = 6\\int \\left(u^{4} - u + \\frac{u}{1+u^{3}}\\right)du',
      ],
      [
        'Use partial fractions for the last term.',
        '\\frac{u}{1+u^{3}} = -\\frac{1}{3(u+1)} + \\frac{u+1}{3(u^{2}-u+1)}',
      ],
    ],
    answer:
      '\\frac{6}{5}x^{\\frac{5}{6}} - 3x^{\\frac{1}{3}} - 2\\ln(1+x^{\\frac{1}{6}}) + \\ln(x^{\\frac{1}{3}} - x^{\\frac{1}{6}} + 1) + 2\\sqrt{3}\\tan^{-1}\\left(\\frac{2x^{\\frac{1}{6}}-1}{\\sqrt{3}}\\right) + C',
  }),
  part('Q7', 'viii', 2, U.partialFractions, {
    problem: '\\int \\frac{dx}{3x^{2}+4}',
    technique: 'completing-square',
    difficulty: 1,
    method: 'Write as (1/3) ∫ dx/(x² + 4/3) and use the inverse-tangent form.',
    steps: [
      [
        'Take out the factor 3.',
        '\\frac{1}{3}\\int \\frac{dx}{x^{2} + \\left(\\frac{2}{\\sqrt{3}}\\right)^{2}} = \\frac{1}{3} \\cdot \\frac{\\sqrt{3}}{2}\\tan^{-1}\\left(\\frac{\\sqrt{3}x}{2}\\right) + C',
      ],
    ],
    answer: '\\frac{1}{2\\sqrt{3}}\\tan^{-1}\\left(\\frac{\\sqrt{3}x}{2}\\right) + C',
  }),
  part('Q7', 'ix', 2, U.algebraicTrig, {
    problem: '\\int \\frac{dx}{\\sqrt{1+2x^{2}}}',
    technique: 'trig-substitution',
    difficulty: 2,
    method: 'Substitute √2 x = tan θ (the √(a² + x²) row of the table).',
    steps: [
      [
        'Let $\\sqrt{2}x = \\tan\\theta$, so $dx = \\frac{1}{\\sqrt{2}}\\sec^{2}\\theta\\,d\\theta$.',
        '\\frac{1}{\\sqrt{2}}\\int \\sec\\theta\\,d\\theta = \\frac{1}{\\sqrt{2}}\\ln|\\sec\\theta + \\tan\\theta| + C',
      ],
    ],
    answer: '\\frac{1}{\\sqrt{2}}\\ln\\left(\\sqrt{2}x + \\sqrt{1+2x^{2}}\\right) + C',
  }),
  part('Q7', 'x', 2, U.algebraicTrig, {
    problem: '\\int \\frac{dx}{\\sqrt{4-3x^{2}}}',
    technique: 'trig-substitution',
    difficulty: 2,
    method: 'Substitute √3 x = 2 sin θ (the √(a² − x²) row of the table).',
    steps: [
      [
        'Let $\\sqrt{3}x = 2\\sin\\theta$, so $dx = \\frac{2}{\\sqrt{3}}\\cos\\theta\\,d\\theta$.',
        '\\frac{1}{\\sqrt{3}}\\int d\\theta = \\frac{\\theta}{\\sqrt{3}} + C',
      ],
    ],
    answer: '\\frac{1}{\\sqrt{3}}\\sin^{-1}\\left(\\frac{\\sqrt{3}x}{2}\\right) + C',
  }),
  part('Q7', 'xi', 2, U.algebraicTrig, {
    problem: '\\int \\frac{dx}{\\sqrt{4x^{2}-1}}',
    technique: 'trig-substitution',
    difficulty: 2,
    method: 'Substitute 2x = sec θ (the √(x² − a²) row of the table).',
    steps: [
      [
        'Let $2x = \\sec\\theta$, so $dx = \\frac{1}{2}\\sec\\theta\\tan\\theta\\,d\\theta$.',
        '\\frac{1}{2}\\int \\sec\\theta\\,d\\theta = \\frac{1}{2}\\ln|\\sec\\theta + \\tan\\theta| + C',
      ],
    ],
    answer: '\\frac{1}{2}\\ln\\left|2x + \\sqrt{4x^{2}-1}\\right| + C',
  }),
  part('Q7', 'xii', 2, U.partialFractions, {
    problem: '\\int \\frac{x^{4}}{(x-1)^{2}(x+1)}\\,dx',
    technique: 'improper-rational',
    difficulty: 2,
    method: 'Long division, then partial fractions with a repeated factor.',
    steps: [
      ['Divide by $(x-1)^{2}(x+1) = x^{3} - x^{2} - x + 1$.', 'x + 1 + \\frac{2x^{2}-1}{(x-1)^{2}(x+1)}'],
      ['Decompose.', '\\frac{7}{4(x-1)} + \\frac{1}{2(x-1)^{2}} + \\frac{1}{4(x+1)}'],
    ],
    answer: '\\frac{x^{2}}{2} + x + \\frac{7}{4}\\ln|x-1| - \\frac{1}{2(x-1)} + \\frac{1}{4}\\ln|x+1| + C',
  }),
  part('Q7', 'xiii', 2, U.partialFractions, {
    problem: '\\int \\frac{x^{3}+1}{(x^{2}+1)(x-1)}\\,dx',
    technique: 'improper-rational',
    difficulty: 2,
    method: 'Long division, then partial fractions.',
    steps: [
      ['Divide.', '1 + \\frac{x^{2}-x+2}{(x^{2}+1)(x-1)}'],
      ['Decompose.', '\\frac{1}{x-1} - \\frac{1}{x^{2}+1}'],
    ],
    answer: 'x + \\ln|x-1| - \\tan^{-1}x + C',
  }),
  part('Q7', 'xiv', 2, U.partialFractions, {
    problem: '\\int \\frac{3x+5}{(x+1)(x-1)^{2}}\\,dx',
    technique: 'partial-fractions-repeated',
    difficulty: 2,
    method: 'Partial fractions with a repeated linear factor.',
    steps: [['Decompose.', '\\frac{1}{2(x+1)} - \\frac{1}{2(x-1)} + \\frac{4}{(x-1)^{2}}']],
    answer: '\\frac{1}{2}\\ln|x+1| - \\frac{1}{2}\\ln|x-1| - \\frac{4}{x-1} + C',
  }),
  part('Q7', 'xv', 2, U.partialFractions, {
    problem: '\\int \\frac{x+1}{x^{2}(x-1)}\\,dx',
    technique: 'partial-fractions-repeated',
    difficulty: 1,
    method: 'Partial fractions with a repeated linear factor.',
    steps: [['Decompose.', '-\\frac{2}{x} - \\frac{1}{x^{2}} + \\frac{2}{x-1}']],
    answer: '-2\\ln|x| + \\frac{1}{x} + 2\\ln|x-1| + C',
  }),
  part('Q7', 'xvi', 2, U.partialFractions, {
    problem: '\\int \\frac{x+2}{x^{2}+6x+8}\\,dx',
    technique: 'partial-fractions-linear',
    difficulty: 1,
    method: 'Factorise the denominator; a factor cancels.',
    steps: [['Factorise: for $x \\neq -2$,', '\\frac{x+2}{(x+2)(x+4)} = \\frac{1}{x+4}']],
    answer: '\\ln|x+4| + C',
  }),
  part('Q7', 'xvii', 2, U.partialFractions, {
    problem: '\\int \\frac{3x^{3}+7x^{2}+10}{x^{3}+2x^{2}+10x}\\,dx',
    technique: 'improper-rational',
    difficulty: 2,
    method: 'Long division, partial fractions, then complete the square.',
    steps: [
      ['Divide.', '3 + \\frac{x^{2}-30x+10}{x(x^{2}+2x+10)}'],
      ['Decompose.', '\\frac{1}{x} - \\frac{32}{x^{2}+2x+10}'],
      ['Complete the square.', 'x^{2}+2x+10 = (x+1)^{2} + 9'],
    ],
    answer: '3x + \\ln|x| - \\frac{32}{3}\\tan^{-1}\\left(\\frac{x+1}{3}\\right) + C',
  }),
  part('Q7', 'xviii', 2, U.algebraicTrig, {
    problem: '\\int \\frac{x}{\\sqrt{a+bx}}\\,dx',
    technique: 'algebraic-substitution',
    difficulty: 2,
    method: 'Substitute a + bx = u² (assuming b ≠ 0).',
    steps: [
      [
        'Let $a + bx = u^{2}$, so $x = \\frac{u^{2}-a}{b}$ and $dx = \\frac{2u}{b}\\,du$.',
        '\\frac{2}{b^{2}}\\int (u^{2} - a)\\,du = \\frac{2}{b^{2}}\\left(\\frac{u^{3}}{3} - au\\right) + C',
      ],
    ],
    answer: '\\frac{2}{3b^{2}}(a+bx)^{\\frac{3}{2}} - \\frac{2a}{b^{2}}(a+bx)^{\\frac{1}{2}} + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 8: Evaluate (powers and products of trigonometric functions).
  // ---------------------------------------------------------------------------
  part('Q8', 'i', 2, U.advancedPatterns, {
    problem: '\\int \\cos^{2}x\\,dx',
    technique: 'even-trig-powers',
    difficulty: 1,
    method: 'Use cos²x = (1 + cos 2x)/2.',
    steps: [['Use the identity.', '\\int \\frac{1+\\cos 2x}{2}\\,dx']],
    answer: '\\frac{x}{2} + \\frac{1}{4}\\sin 2x + C',
  }),
  part('Q8', 'ii', 2, U.advancedPatterns, {
    problem: '\\int \\sin^{3}x\\,dx',
    technique: 'odd-trig-powers',
    difficulty: 1,
    method: 'Keep one sin x and use sin²x = 1 − cos²x.',
    steps: [['Rewrite.', '\\int (1-\\cos^{2}x)\\sin x\\,dx']],
    answer: '-\\cos x + \\frac{1}{3}\\cos^{3}x + C',
  }),
  part('Q8', 'iii', 2, U.advancedPatterns, {
    problem: '\\int \\sin^{4}x\\,dx',
    technique: 'even-trig-powers',
    difficulty: 2,
    method: 'Use sin²x = (1 − cos 2x)/2 twice.',
    steps: [
      [
        'Square the identity.',
        '\\int \\left(\\frac{1-\\cos 2x}{2}\\right)^{2}dx = \\frac{1}{4}\\int \\left(1 - 2\\cos 2x + \\cos^{2}2x\\right)dx',
      ],
      [
        'Use the identity again for $\\cos^{2}2x$.',
        '\\frac{1}{4}\\int \\left(\\frac{3}{2} - 2\\cos 2x + \\frac{1}{2}\\cos 4x\\right)dx',
      ],
    ],
    answer: '\\frac{3}{8}x - \\frac{1}{4}\\sin 2x + \\frac{1}{32}\\sin 4x + C',
  }),
  part('Q8', 'iv', 2, U.advancedPatterns, {
    problem: '\\int \\sin x\\cos x\\,dx',
    technique: 'odd-trig-powers',
    difficulty: 1,
    method: 'Substitute u = sin x.',
    steps: [['Let $u = \\sin x$, so $du = \\cos x\\,dx$.', '\\int u\\,du = \\frac{u^{2}}{2} + C']],
    answer: '\\frac{1}{2}\\sin^{2}x + C',
  }),
  part('Q8', 'v', 2, U.advancedPatterns, {
    problem: '\\int \\sin^{3}x\\cos^{3}x\\,dx',
    technique: 'odd-trig-powers',
    difficulty: 2,
    method: 'Keep one cos x and use cos²x = 1 − sin²x.',
    steps: [['Rewrite.', '\\int \\sin^{3}x(1-\\sin^{2}x)\\cos x\\,dx']],
    answer: '\\frac{1}{4}\\sin^{4}x - \\frac{1}{6}\\sin^{6}x + C',
  }),
  part('Q8', 'vi', 2, U.advancedPatterns, {
    problem: '\\int \\sin 6x\\cos 3x\\,dx',
    technique: 'product-to-sum',
    difficulty: 1,
    method: 'Use sin px cos qx = ½ sin(p + q)x + ½ sin(p − q)x.',
    steps: [['Use the identity.', '\\frac{1}{2}\\int (\\sin 9x + \\sin 3x)\\,dx']],
    answer: '-\\frac{1}{18}\\cos 9x - \\frac{1}{6}\\cos 3x + C',
  }),
  part('Q8', 'vii', 2, U.advancedPatterns, {
    problem: '\\int \\cos x\\cos 4x\\,dx',
    technique: 'product-to-sum',
    difficulty: 1,
    method: 'Use cos px cos qx = ½ cos(p + q)x + ½ cos(p − q)x.',
    steps: [['Use the identity.', '\\frac{1}{2}\\int (\\cos 5x + \\cos 3x)\\,dx']],
    answer: '\\frac{1}{10}\\sin 5x + \\frac{1}{6}\\sin 3x + C',
  }),
  part('Q8', 'viii', 2, U.advancedPatterns, {
    problem: '\\int \\sin 2x\\sin 4x\\,dx',
    technique: 'product-to-sum',
    difficulty: 1,
    method: 'Use sin px sin qx = −½ cos(p + q)x + ½ cos(p − q)x.',
    steps: [['Use the identity.', '\\frac{1}{2}\\int (\\cos 2x - \\cos 6x)\\,dx']],
    answer: '\\frac{1}{4}\\sin 2x - \\frac{1}{12}\\sin 6x + C',
  }),
  part('Q8', 'ix', 2, U.advancedPatterns, {
    problem: '\\int \\sin\\frac{3}{2}x\\cos\\frac{1}{2}x\\,dx',
    technique: 'product-to-sum',
    difficulty: 1,
    method: 'Use sin px cos qx = ½ sin(p + q)x + ½ sin(p − q)x.',
    steps: [['Use the identity.', '\\frac{1}{2}\\int (\\sin 2x + \\sin x)\\,dx']],
    answer: '-\\frac{1}{4}\\cos 2x - \\frac{1}{2}\\cos x + C',
  }),
  part('Q8', 'x', 2, U.advancedPatterns, {
    problem: '\\int \\sin^{2}2x\\cos^{3}x\\,dx',
    technique: 'odd-trig-powers',
    difficulty: 3,
    method: 'Write sin 2x = 2 sin x cos x, then keep one cos x.',
    steps: [
      [
        'Use $\\sin 2x = 2\\sin x\\cos x$.',
        '4\\int \\sin^{2}x\\cos^{5}x\\,dx = 4\\int \\sin^{2}x(1-\\sin^{2}x)^{2}\\cos x\\,dx',
      ],
      ['Let $u = \\sin x$.', '4\\int (u^{2} - 2u^{4} + u^{6})\\,du'],
    ],
    answer: '\\frac{4}{3}\\sin^{3}x - \\frac{8}{5}\\sin^{5}x + \\frac{4}{7}\\sin^{7}x + C',
  }),
  part('Q8', 'xi', 2, U.advancedPatterns, {
    problem: '\\int \\sin x\\sin 3x\\sin 5x\\,dx',
    technique: 'product-to-sum',
    difficulty: 3,
    method: 'Apply the product formulas twice.',
    steps: [
      ['First pair.', '\\sin x\\sin 3x = \\frac{1}{2}(\\cos 2x - \\cos 4x)'],
      ['Multiply by $\\sin 5x$ and use the identity again.', '\\frac{1}{4}(\\sin 7x + \\sin 3x - \\sin 9x - \\sin x)'],
    ],
    answer: '-\\frac{1}{28}\\cos 7x - \\frac{1}{12}\\cos 3x + \\frac{1}{36}\\cos 9x + \\frac{1}{4}\\cos x + C',
  }),
  part('Q8', 'xii', 2, U.advancedPatterns, {
    problem: '\\int \\tan^{3}x\\,dx',
    technique: 'tan-sec-powers',
    difficulty: 2,
    method: 'Use tan²x = sec²x − 1.',
    steps: [
      ['Rewrite.', '\\int \\tan x\\sec^{2}x\\,dx - \\int \\tan x\\,dx'],
      ['Integrate each part.', '\\frac{1}{2}\\tan^{2}x + \\ln|\\cos x| + C'],
    ],
    answer: '\\frac{1}{2}\\tan^{2}x + \\ln|\\cos x| + C',
  }),
  part('Q8', 'xiii', 2, U.advancedPatterns, {
    problem: '\\int \\frac{\\sin^{3}(\\sqrt{x})}{\\sqrt{x}}\\,dx',
    technique: 'odd-trig-powers',
    difficulty: 2,
    method: 'Substitute u = √x, then integrate an odd power of sine.',
    steps: [
      ['Let $u = \\sqrt{x}$, so $du = \\frac{1}{2\\sqrt{x}}\\,dx$.', '2\\int \\sin^{3}u\\,du'],
      ['Odd power of sine.', '2\\left(-\\cos u + \\frac{1}{3}\\cos^{3}u\\right) + C'],
    ],
    answer: '-2\\cos(\\sqrt{x}) + \\frac{2}{3}\\cos^{3}(\\sqrt{x}) + C',
  }),
  part('Q8', 'xiv', 2, U.advancedPatterns, {
    problem: '\\int \\tan^{6}x\\sec^{4}x\\,dx',
    technique: 'tan-sec-powers',
    difficulty: 2,
    method: 'Keep sec²x and write the other sec²x = 1 + tan²x.',
    steps: [['Let $u = \\tan x$, so $du = \\sec^{2}x\\,dx$.', '\\int u^{6}(1+u^{2})\\,du']],
    answer: '\\frac{1}{7}\\tan^{7}x + \\frac{1}{9}\\tan^{9}x + C',
  }),
  part('Q8', 'xv', 2, U.advancedPatterns, {
    problem: '\\int \\tan^{5}x\\sec^{7}x\\,dx',
    technique: 'tan-sec-powers',
    difficulty: 3,
    method: 'Keep sec x tan x and write tan²x = sec²x − 1.',
    steps: [
      [
        'Let $u = \\sec x$, so $du = \\sec x\\tan x\\,dx$.',
        '\\int (u^{2}-1)^{2}u^{6}\\,du = \\int (u^{10} - 2u^{8} + u^{6})\\,du',
      ],
    ],
    answer: '\\frac{1}{11}\\sec^{11}x - \\frac{2}{9}\\sec^{9}x + \\frac{1}{7}\\sec^{7}x + C',
  }),
  part('Q8', 'xvi', 2, U.advancedPatterns, {
    problem: '\\int \\cos x\\cos^{5}(\\sin x)\\,dx',
    technique: 'odd-trig-powers',
    difficulty: 2,
    method: 'Substitute u = sin x, then integrate an odd power of cosine.',
    steps: [
      ['Let $u = \\sin x$.', '\\int \\cos^{5}u\\,du = \\int (1-\\sin^{2}u)^{2}\\cos u\\,du'],
      ['Integrate.', '\\sin u - \\frac{2}{3}\\sin^{3}u + \\frac{1}{5}\\sin^{5}u + C'],
    ],
    answer: '\\sin(\\sin x) - \\frac{2}{3}\\sin^{3}(\\sin x) + \\frac{1}{5}\\sin^{5}(\\sin x) + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 9: Use a suitable substitution.
  // ---------------------------------------------------------------------------
  part('Q9', 'i', 2, U.algebraicTrig, {
    problem: '\\int \\sec\\theta\\,d\\theta',
    technique: 'secant-integral',
    difficulty: 2,
    method: 'Multiply by (sec θ + tan θ)/(sec θ + tan θ) and substitute u = sec θ + tan θ.',
    steps: [
      [
        'Let $u = \\sec\\theta + \\tan\\theta$, so $du = (\\sec\\theta\\tan\\theta + \\sec^{2}\\theta)\\,d\\theta$.',
        '\\int \\frac{\\sec^{2}\\theta + \\sec\\theta\\tan\\theta}{\\sec\\theta + \\tan\\theta}\\,d\\theta = \\int \\frac{du}{u}',
      ],
    ],
    answer: '\\ln|\\sec\\theta + \\tan\\theta| + C',
  }),
  part('Q9', 'ii', 2, U.substitution, {
    problem: '\\int \\sec\\theta\\tan\\theta\\sec(\\sec\\theta)\\,d\\theta',
    technique: 'u-substitution',
    difficulty: 2,
    method: 'Substitute u = sec θ.',
    steps: [
      [
        'Let $u = \\sec\\theta$, so $du = \\sec\\theta\\tan\\theta\\,d\\theta$.',
        '\\int \\sec u\\,du = \\ln|\\sec u + \\tan u| + C',
      ],
    ],
    answer: '\\ln|\\sec(\\sec\\theta) + \\tan(\\sec\\theta)| + C',
  }),
  part('Q9', 'iii', 2, U.algebraicTrig, {
    problem: '\\int \\frac{d\\theta}{1+\\sin\\theta}',
    technique: 'tan-half-angle',
    difficulty: 2,
    method: 'Substitute t = tan(θ/2).',
    steps: [['With $t = \\tan\\frac{\\theta}{2}$:', '\\int \\frac{2\\,dt}{(1+t)^{2}} = -\\frac{2}{1+t} + C']],
    answer: '-\\frac{2}{1+\\tan\\frac{\\theta}{2}} + C',
  }),
  part('Q9', 'iv', 2, U.algebraicTrig, {
    problem: '\\int \\frac{\\sin\\theta}{2+\\sin\\theta}\\,d\\theta',
    technique: 'tan-half-angle',
    difficulty: 3,
    method: 'Write the integrand as 1 − 2/(2 + sin θ), then substitute t = tan(θ/2).',
    steps: [
      ['Rewrite.', '\\int \\left(1 - \\frac{2}{2+\\sin\\theta}\\right)d\\theta'],
      [
        'With $t = \\tan\\frac{\\theta}{2}$:',
        '\\int \\frac{d\\theta}{2+\\sin\\theta} = \\int \\frac{dt}{t^{2}+t+1} = \\frac{2}{\\sqrt{3}}\\tan^{-1}\\left(\\frac{2t+1}{\\sqrt{3}}\\right) + C',
      ],
    ],
    answer: '\\theta - \\frac{4}{\\sqrt{3}}\\tan^{-1}\\left(\\frac{2\\tan\\frac{\\theta}{2}+1}{\\sqrt{3}}\\right) + C',
  }),
  part('Q9', 'v', 2, U.algebraicTrig, {
    problem: '\\int \\frac{d\\theta}{a+b\\cos\\theta}',
    condition: 'if $a > b > 0$.',
    technique: 'tan-half-angle',
    difficulty: 3,
    method: 'Substitute t = tan(θ/2).',
    steps: [
      ['With $t = \\tan\\frac{\\theta}{2}$:', '\\int \\frac{2\\,dt}{(a+b) + (a-b)t^{2}}'],
      [
        'Since $a > b > 0$, both coefficients are positive.',
        '\\frac{2}{\\sqrt{a^{2}-b^{2}}}\\tan^{-1}\\left(\\sqrt{\\frac{a-b}{a+b}}\\,t\\right) + C',
      ],
    ],
    answer:
      '\\frac{2}{\\sqrt{a^{2}-b^{2}}}\\tan^{-1}\\left(\\sqrt{\\frac{a-b}{a+b}}\\tan\\frac{\\theta}{2}\\right) + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 10 (printed with "In" for ln: MR-01)
  // ---------------------------------------------------------------------------
  part('Q10', null, 2, U.algebraicTrig, {
    instruction: 'Show that',
    problem:
      '\\int \\sec x\\,dx = \\text{In}|\\sec x + \\tan x| = \\text{In}\\left|\\tan\\left(\\frac{1}{4}\\pi + \\frac{1}{2}x\\right)\\right|',
    technique: 'secant-integral',
    difficulty: 3,
    method:
      'Integrate as in the previous question, then rewrite with half-angle identities (reading "In" as ln, pending review).',
    steps: [
      [
        'Multiply by $\\frac{\\sec x + \\tan x}{\\sec x + \\tan x}$ and let $u = \\sec x + \\tan x$.',
        '\\int \\sec x\\,dx = \\ln|\\sec x + \\tan x| + C',
      ],
      [
        'With $t = \\tan\\frac{x}{2}$, $\\sec x + \\tan x = \\frac{1+t}{1-t}$, which equals $\\tan\\left(\\frac{\\pi}{4} + \\frac{x}{2}\\right)$.',
      ],
    ],
    answer: '\\ln|\\sec x + \\tan x| + C = \\ln\\left|\\tan\\left(\\frac{1}{4}\\pi + \\frac{1}{2}x\\right)\\right| + C',
    stepValidation: false,
  }),

  // ---------------------------------------------------------------------------
  // Question 11: Evaluate (integration by parts).
  // ---------------------------------------------------------------------------
  part('Q11', 'i', 2, U.byParts, {
    problem: '\\int xe^{3x}\\,dx',
    technique: 'integration-by-parts',
    difficulty: 1,
    method: 'Parts with u = x, dv = e³ˣ dx.',
    steps: [
      [
        'Let $u = x$ and $dv = e^{3x}\\,dx$, so $v = \\frac{1}{3}e^{3x}$.',
        '\\frac{1}{3}xe^{3x} - \\frac{1}{3}\\int e^{3x}\\,dx',
      ],
    ],
    answer: '\\frac{1}{3}xe^{3x} - \\frac{1}{9}e^{3x} + C',
  }),
  part('Q11', 'ii', 2, U.byParts, {
    problem: '\\int e^{x}\\sin x\\,dx',
    technique: 'repeated-parts',
    difficulty: 3,
    method: 'Parts twice; the original integral reappears and is solved for.',
    steps: [
      [
        'Parts with $u = \\sin x$, $dv = e^{x}\\,dx$, then again with $u = \\cos x$.',
        'I = e^{x}\\sin x - \\left(e^{x}\\cos x + I\\right)',
      ],
      ['Solve for $I$.', '2I = e^{x}(\\sin x - \\cos x)'],
    ],
    answer: '\\frac{1}{2}e^{x}(\\sin x - \\cos x) + C',
  }),
  part('Q11', 'iii', 2, U.byParts, {
    problem: '\\int \\sin^{-1}x\\,dx',
    technique: 'integration-by-parts',
    difficulty: 2,
    method: 'Parts with u = sin⁻¹x, dv = dx.',
    steps: [['Let $u = \\sin^{-1}x$ and $dv = dx$.', 'x\\sin^{-1}x - \\int \\frac{x}{\\sqrt{1-x^{2}}}\\,dx']],
    answer: 'x\\sin^{-1}x + \\sqrt{1-x^{2}} + C',
  }),
  part('Q11', 'iv', 2, U.byParts, {
    problem: '\\int e^{ax}\\cos px\\,dx',
    technique: 'repeated-parts',
    difficulty: 3,
    method: 'Parts twice and solve for the integral (assuming a² + p² ≠ 0).',
    steps: [
      [
        'Parts twice with $dv = e^{ax}\\,dx$.',
        'I = \\frac{1}{a}e^{ax}\\cos px + \\frac{p}{a^{2}}e^{ax}\\sin px - \\frac{p^{2}}{a^{2}}I',
      ],
      ['Solve for $I$.'],
    ],
    answer: '\\frac{e^{ax}(a\\cos px + p\\sin px)}{a^{2}+p^{2}} + C',
  }),
  part('Q11', 'v', 2, U.byParts, {
    problem: '\\int x^{3}\\cos x\\,dx',
    technique: 'repeated-parts',
    difficulty: 2,
    method: 'Parts three times, lowering the power of x each time.',
    steps: [['Each application lowers the power of $x$ by one.', 'x^{3}\\sin x - 3\\int x^{2}\\sin x\\,dx']],
    answer: 'x^{3}\\sin x + 3x^{2}\\cos x - 6x\\sin x - 6\\cos x + C',
  }),
  part('Q11', 'vi', 2, U.byParts, {
    problem: '\\int \\cos x\\ln(\\sin x)\\,dx',
    technique: 'integration-by-parts',
    difficulty: 2,
    method: 'Substitute u = sin x, then integrate ln u by parts.',
    steps: [['Let $u = \\sin x$, so $du = \\cos x\\,dx$.', '\\int \\ln u\\,du = u\\ln u - u + C']],
    answer: '\\sin x\\ln(\\sin x) - \\sin x + C',
  }),
  part('Q11', 'vii', 2, U.byParts, {
    problem: '\\int x^{4}(\\ln x)^{2}\\,dx',
    technique: 'repeated-parts',
    difficulty: 2,
    method: 'Parts twice, differentiating the logarithm each time.',
    steps: [
      [
        'Let $u = (\\ln x)^{2}$, $dv = x^{4}\\,dx$.',
        '\\frac{x^{5}}{5}(\\ln x)^{2} - \\frac{2}{5}\\int x^{4}\\ln x\\,dx',
      ],
      ['Parts again with $u = \\ln x$.', '\\int x^{4}\\ln x\\,dx = \\frac{x^{5}}{5}\\ln x - \\frac{x^{5}}{25}'],
    ],
    answer: '\\frac{x^{5}}{5}(\\ln x)^{2} - \\frac{2}{25}x^{5}\\ln x + \\frac{2}{125}x^{5} + C',
  }),
  part('Q11', 'viii', 2, U.byParts, {
    problem: '\\int \\sec^{3}x\\,dx',
    technique: 'integration-by-parts',
    difficulty: 3,
    method: 'Parts with u = sec x, dv = sec²x dx, then use tan²x = sec²x − 1.',
    steps: [
      ['Parts.', 'I = \\sec x\\tan x - \\int \\sec x\\tan^{2}x\\,dx = \\sec x\\tan x - I + \\int \\sec x\\,dx'],
      ['Solve for $I$.', '2I = \\sec x\\tan x + \\ln|\\sec x + \\tan x|'],
    ],
    answer: '\\frac{1}{2}\\left(\\sec x\\tan x + \\ln|\\sec x + \\tan x|\\right) + C',
  }),

  // ---------------------------------------------------------------------------
  // Question 12: quotients of sine and cosine expressions.
  // ---------------------------------------------------------------------------
  part('Q12', 'i', 2, U.advancedPatterns, {
    problem: '\\int \\frac{2+4\\cos x+7\\sin x}{10-4\\cos x+3\\sin x}\\,dx',
    technique: 'trig-quotient',
    difficulty: 3,
    method: 'Write the numerator as p(denominator) + q(derivative of denominator) + r.',
    steps: [
      [
        'Compare coefficients of $\\cos x$, $\\sin x$ and the constant.',
        'p = \\frac{1}{5}, \\quad q = \\frac{8}{5}, \\quad r = 0',
      ],
      ['Integrate.', '\\frac{1}{5}x + \\frac{8}{5}\\ln|10-4\\cos x+3\\sin x| + C'],
    ],
    answer: '\\frac{1}{5}x + \\frac{8}{5}\\ln|10-4\\cos x+3\\sin x| + C',
  }),
  part('Q12', 'ii', 2, U.advancedPatterns, {
    problem: '\\int \\frac{9\\cos x+2\\sin x}{2\\cos x+\\sin x}\\,dx',
    technique: 'trig-quotient',
    difficulty: 3,
    method: 'Write the numerator as p(denominator) + q(derivative of denominator) + r.',
    steps: [['Compare coefficients.', 'p = 4, \\quad q = 1, \\quad r = 0']],
    answer: '4x + \\ln|2\\cos x+\\sin x| + C',
  }),
  part('Q12', 'iii', 2, U.advancedPatterns, {
    problem: '\\int \\frac{-2+\\cos x+8\\sin x}{2\\cos x+3\\sin x-1}\\,dx',
    technique: 'trig-quotient',
    difficulty: 3,
    method: 'Write the numerator as p(denominator) + q(derivative of denominator) + r.',
    steps: [['Compare coefficients.', 'p = 2, \\quad q = -1, \\quad r = 0']],
    answer: '2x - \\ln|2\\cos x+3\\sin x-1| + C',
  }),
];
