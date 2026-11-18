/**
 * Tutorial 2 "Integration (Part 2)", Question 1(a)–(g): seven parts that
 * practise Chapter 1 methods (integration by parts, §1.10, and reduction
 * formulas, §1.12), so they belong to Topic 1 (approved Topic 2 audit). The
 * other 69 parts of Tutorial 2 are in Topic 2 (content/topics/area).
 *
 * Transcribed from the tutorial exactly. There is no answer key: every
 * walkthrough is app-authored and pendingLecturerReview.
 */
import type { PracticeItem } from '../../types';

import { INTEGRATION_UNITS as U, type IntegrationUnitId } from './ids';
import { buildPracticeItem, type PracticeSpec } from './practice';
import { TUT2 } from './sources';

function part(sub: string, unitId: IntegrationUnitId, section: string, spec: PracticeSpec): PracticeItem {
  return buildPracticeItem(
    {
      id: `tut2-q1-${sub}`,
      sourceType: 'tutorial-question',
      source: { document: TUT2, item: `Q1(${sub})`, page: 1 },
      sourceQuestion: 'Q1',
      sourceSubquestion: sub,
      sourceSection: section,
      unitId,
    },
    spec,
  );
}

const SHOW = 'Show that';

export const TUTORIAL2_CHAPTER1_ITEMS: readonly PracticeItem[] = [
  part('a', U.byParts, '1-10', {
    instruction: SHOW,
    problem: '\\int x^{m}\\ln x\\,dx = x^{m+1}\\left(\\frac{\\ln x}{m+1} - \\frac{1}{(m+1)^{2}}\\right)',
    condition: 'where $m \\neq -1$.',
    technique: 'integration-by-parts',
    difficulty: 2,
    method: 'Integration by parts with u = ln x and dv = xᵐ dx.',
    steps: [
      [
        'Let $u = \\ln x$ and $dv = x^{m}\\,dx$, so $du = \\frac{1}{x}\\,dx$ and $v = \\frac{x^{m+1}}{m+1}$ (since $m \\neq -1$).',
      ],
      ['Integrate by parts:', '\\int x^{m}\\ln x\\,dx = \\frac{x^{m+1}\\ln x}{m+1} - \\int \\frac{x^{m}}{m+1}\\,dx'],
      [
        'Integrate the last term and factor out $x^{m+1}$:',
        '= \\frac{x^{m+1}\\ln x}{m+1} - \\frac{x^{m+1}}{(m+1)^{2}} + C = x^{m+1}\\left(\\frac{\\ln x}{m+1} - \\frac{1}{(m+1)^{2}}\\right) + C',
      ],
    ],
    answer: 'x^{m+1}\\left(\\frac{\\ln x}{m+1} - \\frac{1}{(m+1)^{2}}\\right) + C',
  }),
  part('b', U.advancedPatterns, '1-12', {
    instruction: SHOW,
    problem: '\\int \\sin^{n}x\\,dx = \\frac{-\\sin^{n-1}x\\cos x}{n} + \\frac{n-1}{n}\\int \\sin^{n-2}x\\,dx',
    condition: 'where $n \\neq 0$.',
    technique: 'reduction-formula',
    difficulty: 3,
    method: 'Integration by parts with u = sinⁿ⁻¹x and dv = sin x dx, then cos²x = 1 − sin²x.',
    steps: [
      ['Let $u = \\sin^{n-1}x$ and $dv = \\sin x\\,dx$, so $du = (n-1)\\sin^{n-2}x\\cos x\\,dx$ and $v = -\\cos x$.'],
      ['Integrate by parts:', '\\int \\sin^{n}x\\,dx = -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\cos^{2}x\\,dx'],
      [
        'Write $\\cos^{2}x = 1 - \\sin^{2}x$:',
        '\\int \\sin^{n}x\\,dx = -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\,dx - (n-1)\\int \\sin^{n}x\\,dx',
      ],
      [
        'Collect the $\\int \\sin^{n}x\\,dx$ terms on the left and divide by $n$:',
        'n\\int \\sin^{n}x\\,dx = -\\sin^{n-1}x\\cos x + (n-1)\\int \\sin^{n-2}x\\,dx',
      ],
    ],
    answer: '\\frac{-\\sin^{n-1}x\\cos x}{n} + \\frac{n-1}{n}\\int \\sin^{n-2}x\\,dx',
  }),
  part('c', U.advancedPatterns, '1-12', {
    instruction: SHOW,
    problem: '\\int x^{n}e^{ax}\\,dx = \\frac{x^{n}e^{ax}}{a} - \\frac{n}{a}\\int x^{n-1}e^{ax}\\,dx',
    condition: 'where $n > 0$.',
    technique: 'reduction-formula',
    difficulty: 2,
    method: 'Integration by parts with u = xⁿ and dv = e^(ax) dx.',
    steps: [
      ['Let $u = x^{n}$ and $dv = e^{ax}\\,dx$, so $du = nx^{n-1}\\,dx$ and $v = \\frac{e^{ax}}{a}$.'],
      ['Integrate by parts:', '\\int x^{n}e^{ax}\\,dx = \\frac{x^{n}e^{ax}}{a} - \\frac{n}{a}\\int x^{n-1}e^{ax}\\,dx'],
    ],
    answer: '\\frac{x^{n}e^{ax}}{a} - \\frac{n}{a}\\int x^{n-1}e^{ax}\\,dx',
  }),
  part('d', U.advancedPatterns, '1-12', {
    instruction: 'Show that the reduction formula holds, and so find the integral below',
    problem:
      '\\int \\sin^{m}x\\cos^{n}x\\,dx = -\\frac{\\sin^{m-1}x\\cos^{n+1}x}{m+n} + \\frac{m-1}{m+n}\\int \\sin^{m-2}x\\cos^{n}x\\,dx',
    condition: 'and so find $\\int \\sin^{6}x\\cos^{5}x\\,dx$.',
    technique: 'reduction-formula',
    difficulty: 3,
    method:
      'By parts with u = sinᵐ⁻¹x and dv = cosⁿx sin x dx; then apply the formula (or use the odd power of cosine).',
    steps: [
      [
        'Let $u = \\sin^{m-1}x$, $dv = \\cos^{n}x\\sin x\\,dx$, so $v = -\\frac{\\cos^{n+1}x}{n+1}$. After integrating by parts, write $\\cos^{2}x = 1 - \\sin^{2}x$ and collect the $\\int \\sin^{m}x\\cos^{n}x\\,dx$ terms, as in part (b).',
      ],
      [
        'To find the integral, the odd power of cosine is quickest: $\\cos^{5}x = (1 - \\sin^{2}x)^{2}\\cos x$ and $u = \\sin x$:',
        '\\int u^{6}(1 - u^{2})^{2}\\,du = \\frac{u^{7}}{7} - \\frac{2u^{9}}{9} + \\frac{u^{11}}{11} + C',
      ],
    ],
    answer: '\\frac{\\sin^{7}x}{7} - \\frac{2\\sin^{9}x}{9} + \\frac{\\sin^{11}x}{11} + C',
  }),
  part('e', U.advancedPatterns, '1-12', {
    instruction: SHOW,
    problem: 'I_{n} = \\frac{\\sec^{n-2}x\\tan x}{n-1} + \\frac{n-2}{n-1}I_{n-2}',
    condition:
      'where $I_{n} = \\int \\sec^{n}x\\,dx$, $n = 2, 3, \\ldots$. Write $I_{n-2}$ as $\\int \\sec^{n-2}x\\,dx$ in your answer.',
    technique: 'reduction-formula',
    difficulty: 3,
    method: 'By parts with u = secⁿ⁻²x and dv = sec²x dx, then tan²x = sec²x − 1.',
    steps: [
      ['Let $u = \\sec^{n-2}x$, $dv = \\sec^{2}x\\,dx$, so $du = (n-2)\\sec^{n-2}x\\tan x\\,dx$ and $v = \\tan x$.'],
      ['Integrate by parts:', 'I_{n} = \\sec^{n-2}x\\tan x - (n-2)\\int \\sec^{n-2}x\\tan^{2}x\\,dx'],
      ['Write $\\tan^{2}x = \\sec^{2}x - 1$:', 'I_{n} = \\sec^{n-2}x\\tan x - (n-2)I_{n} + (n-2)I_{n-2}'],
      ['Collect the $I_{n}$ terms and divide by $n - 1$.'],
    ],
    answer: '\\frac{\\sec^{n-2}x\\tan x}{n-1} + \\frac{n-2}{n-1}\\int \\sec^{n-2}x\\,dx',
  }),
  part('f', U.advancedPatterns, '1-12', {
    instruction: SHOW,
    problem: 'I_{n} = x(\\ln x)^{n} - nI_{n-1}',
    condition:
      'where $I_{n} = \\int (\\ln x)^{n}\\,dx$, $n = 1, 2, \\ldots$. Write $I_{n-1}$ as $\\int (\\ln x)^{n-1}\\,dx$ in your answer.',
    technique: 'reduction-formula',
    difficulty: 2,
    method: 'By parts with u = (ln x)ⁿ and dv = dx.',
    steps: [
      ['Let $u = (\\ln x)^{n}$, $dv = dx$, so $du = n(\\ln x)^{n-1}\\frac{1}{x}\\,dx$ and $v = x$.'],
      ['Integrate by parts:', 'I_{n} = x(\\ln x)^{n} - n\\int (\\ln x)^{n-1}\\,dx = x(\\ln x)^{n} - nI_{n-1}'],
    ],
    answer: 'x(\\ln x)^{n} - n\\int (\\ln x)^{n-1}\\,dx',
  }),
  part('g', U.advancedPatterns, '1-12', {
    instruction: 'Show that the reduction formula holds, then find the integral below',
    problem: 'I_{n} = x^{n}e^{x} - nI_{n-1}',
    condition: 'where $I_{n} = \\int x^{n}e^{x}\\,dx$, $n = 1, 2, 3, \\ldots$. Find $\\int x^{3}e^{x}\\,dx$.',
    technique: 'reduction-formula',
    difficulty: 2,
    method: 'By parts with u = xⁿ and dv = eˣ dx; then apply the formula three times.',
    steps: [
      ['Let $u = x^{n}$, $dv = e^{x}\\,dx$: $I_{n} = x^{n}e^{x} - n\\int x^{n-1}e^{x}\\,dx = x^{n}e^{x} - nI_{n-1}$.'],
      [
        'Apply it with $n = 3, 2, 1$ and $I_{0} = e^{x} + C$:',
        'I_{3} = x^{3}e^{x} - 3\\left(x^{2}e^{x} - 2\\left(xe^{x} - e^{x}\\right)\\right) + C',
      ],
    ],
    answer: 'e^{x}\\left(x^{3} - 3x^{2} + 6x - 6\\right) + C',
  }),
];
