/**
 * Topic 2 games. Every round is a mathematical decision on a graph: build,
 * place, adjust, predict, combine or compare. Functions come from the
 * Chapter 2 notes and Tutorial 2. Equal-Area Height is App practice: §2.4 has
 * no source exercise. Design informed by prior research (evidence.ts); these
 * games have not been evaluated.
 */
import { MVT, notesCurve } from '@/lib/explore/area';
import type { GameDefinition, Round } from '@/lib/games/engine';
import { type GameFunction, smallestN } from '@/lib/games/areaWidgets';

import { AREA_TOPIC_ID, AREA_UNITS as U } from './ids';

const PI = Math.PI;
const E = Math.E;

// -----------------------------------------------------------------------------
// Functions from the notes and Tutorial 2
// -----------------------------------------------------------------------------

const COS: GameFunction = { f: Math.cos, tex: '\\cos x', a: 0, b: PI / 2, bLabel: 'π/2' };
const EXP: GameFunction = { f: Math.exp, tex: 'e^{x}', a: 0, b: 2 };
const TWO_X: GameFunction = { f: (x) => 2 * x, tex: '2x', a: 0, b: 1 };
const PARABOLA: GameFunction = { f: (x) => (x - 1) ** 2 + 2, tex: '(x-1)^{2} + 2', a: -1, b: 2 };
const DECAY: GameFunction = { f: (x) => Math.exp(-2 * x + 3), tex: 'e^{-2x+3}', a: 0, b: 4 };
const NOTES: GameFunction = { f: notesCurve, tex: 'f(x)', a: 1, b: 8, aLabel: 'a', bLabel: 'b' };

const widgetRound = (
  level: number,
  prompt: string,
  hint: string,
  widget: Extract<Round, { kind: 'widget' }>['widget'],
  explanation?: string,
): Round => ({
  kind: 'widget',
  level,
  prompt,
  hint,
  widget,
  ...(explanation ? { explanation } : {}),
});

// =============================================================================
// 1. Riemann Builder (Area Under a Graph and Riemann Sums)
// =============================================================================

const RIEMANN_BUILDER: GameDefinition = {
  id: 'riemann-builder',
  title: 'Riemann Builder',
  unitId: U.riemann,
  topicId: AREA_TOPIC_ID,
  summary: 'Choose where each height is read and how many rectangles, to meet each challenge.',
  tutorial: {
    goal: 'Build rectangle approximations that meet each challenge: an underestimate, an overestimate, a given accuracy, or an exact sum.',
    interaction:
      'Choose Left, Right, Midpoint or Sample point, set n with the slider, drag sample points where asked, then press Check. Some rounds ask you to predict before anything changes.',
    skill: 'How the choice of height and the number of rectangles control a Riemann sum (§2.2, §2.2.1).',
    scoring: '10 points for a challenge met first time, 5 after a retry; a hint costs 3. Mistakes never cost points.',
  },
  rounds: [
    widgetRound(
      1,
      'Build an underestimate of the area under $y = \\cos x$ on $[0, \\frac{\\pi}{2}]$.',
      'cos x decreases on this interval. Which end of each subinterval is lower?',
      { type: 'riemann', fn: COS, goal: { type: 'underestimate' } },
      'For a decreasing function, the right endpoint is the lowest point of each subinterval, so every right-endpoint rectangle fits under the curve.',
    ),
    widgetRound(
      1,
      'Build an overestimate of the area under $y = e^{x}$ on $[0, 2]$ (Example 2.2.3).',
      'eˣ increases. Which end of each subinterval is higher?',
      { type: 'riemann', fn: EXP, goal: { type: 'overestimate' } },
      'For an increasing function, right endpoints read the highest value of each subinterval, so the rectangles reach above the curve.',
    ),
    widgetRound(
      2,
      'Predict: with right endpoints on $y = \\cos x$, what happens to $R_{n}$ when n goes from 4 to 12?',
      'Right endpoints underestimate here. Does using thinner rectangles waste more or less area?',
      { type: 'riemann', fn: COS, goal: { type: 'predict', rule: 'right', fromN: 4, toN: 12 } },
    ),
    widgetRound(
      2,
      'Build $R_{4}$ for $y = 2x$ on $[0, 1]$ (Example 2.2.1), then work out its value.',
      'Right endpoints with n = 4; Δx = 1/4 and the heights are f(1/4), f(2/4), f(3/4), f(1).',
      { type: 'riemann', fn: TWO_X, goal: { type: 'compute', rule: 'right', n: 4 } },
      'Example 2.2.1 showed Rₙ = 1 + 1/n; with n = 4 that is 1.25.',
    ),
    widgetRound(
      2,
      'Drag the three sample points so the rectangles have exactly the area under $y = (x-1)^{2} + 2$ on $[-1, 2]$ (Example 2.2.2).',
      'In each subinterval, find the height that balances the part of the rectangle above the curve against the part below it.',
      { type: 'riemann', fn: PARABOLA, goal: { type: 'sampleMatch', n: 3, tolerance: 0.05 } },
      'Definition 2.2.4 allows any sample point xᵢ* in each subinterval; with good choices even three rectangles can match the area.',
    ),
    widgetRound(
      3,
      'Predict: with right endpoints on $y = e^{x}$, what happens to $R_{n}$ when n goes from 4 to 16?',
      'Do right endpoints sit above or below an increasing curve? Thinner rectangles have less overhang.',
      { type: 'riemann', fn: EXP, goal: { type: 'predict', rule: 'right', fromN: 4, toN: 16 } },
    ),
    widgetRound(
      3,
      `Get within 0.01 of the area under $y = e^{x}$ on $[0, 2]$ using at most ${(smallestN(EXP, 'midpoint', 0.01) ?? 10) + 1} rectangles.`,
      'Compare the error for the different rules at the same n. Which rule balances above and below the curve?',
      {
        type: 'riemann',
        fn: EXP,
        goal: { type: 'tolerance', tolerance: 0.01, maxN: (smallestN(EXP, 'midpoint', 0.01) ?? 10) + 1 },
      },
      'The Mid-point Rule is usually much more accurate than endpoints for the same n (§2.2.1).',
    ),
    widgetRound(
      3,
      `Get within 0.005 of the area under $y = e^{-2x+3}$ on $[0, 4]$ (Tutorial 2) using at most ${(smallestN(DECAY, 'midpoint', 0.005) ?? 20) + 2} rectangles.`,
      'The curve is steep near x = 0. Increase n and choose the rule with the smallest error.',
      {
        type: 'riemann',
        fn: DECAY,
        goal: { type: 'tolerance', tolerance: 0.005, maxN: (smallestN(DECAY, 'midpoint', 0.005) ?? 20) + 2 },
      },
    ),
  ],
};

// =============================================================================
// 2. Sum to Integral (The Definite Integral)
// =============================================================================

const SUM_TO_INTEGRAL: GameDefinition = {
  id: 'sum-to-integral',
  title: 'Sum to Integral',
  unitId: U.definite,
  topicId: AREA_TOPIC_ID,
  summary: 'Build the chain from rectangles to Σ to a limit to the definite integral, one link at a time.',
  tutorial: {
    goal: 'Rebuild Theorem 2.2.1 for a definite integral: Δx, xᵢ, the ith term, the closed form of the sum, and its limit.',
    interaction:
      'For each link, tap the card that belongs there. The picture follows every link you place; the last one thins the rectangles into the integral.',
    skill: 'Evaluating a definite integral as the limit of Riemann sums (§2.2.1, Theorem 2.2.1).',
    scoring: '10 points per integral built without a wrong card, 5 after a retry; a hint costs 3.',
  },
  rounds: [
    widgetRound(
      1,
      'Build $\\int_{-2}^{3} x\\,dx$ (Tutorial 2) as the limit of Riemann sums.',
      'Start with the width: the interval runs from −2 to 3.',
      {
        type: 'chain',
        fn: { f: (x) => x, tex: 'x', a: -2, b: 3 },
        integralTex: '\\int_{-2}^{3} x\\,dx',
        value: 2.5,
        slots: [
          {
            id: 'dx',
            label: 'Width Δx',
            cards: [
              {
                id: 'a',
                tex: '\\Delta x = \\frac{5}{n}',
                correct: true,
                why: 'Correct: Δx = (b − a)/n = (3 − (−2))/n = 5/n.',
              },
              {
                id: 'b',
                tex: '\\Delta x = \\frac{1}{n}',
                correct: false,
                why: 'The interval has length 3 − (−2) = 5, not 1.',
              },
              {
                id: 'c',
                tex: '\\Delta x = \\frac{3}{n}',
                correct: false,
                why: 'b − a = 3 − (−2) = 5: subtracting a negative number adds.',
              },
            ],
          },
          {
            id: 'xi',
            label: 'Right endpoint xᵢ',
            cards: [
              {
                id: 'a',
                tex: 'x_{i} = -2 + \\frac{5i}{n}',
                correct: true,
                why: 'Correct: xᵢ = a + iΔx, starting at a = −2.',
              },
              {
                id: 'b',
                tex: 'x_{i} = \\frac{5i}{n}',
                correct: false,
                why: 'This starts at 0. The interval starts at a = −2, so xᵢ = a + iΔx.',
              },
              {
                id: 'c',
                tex: 'x_{i} = -2 + \\frac{5(i-1)}{n}',
                correct: false,
                why: 'That is the left endpoint xᵢ₋₁. Theorem 2.2.1 uses right endpoints.',
              },
            ],
          },
          {
            id: 'term',
            label: 'ith term f(xᵢ)Δx',
            cards: [
              {
                id: 'a',
                tex: '\\left(-2 + \\frac{5i}{n}\\right)\\frac{5}{n}',
                correct: true,
                why: 'Correct: the height f(xᵢ) = xᵢ times the width Δx.',
              },
              {
                id: 'b',
                tex: '-2 + \\frac{5i}{n}',
                correct: false,
                why: 'That is only the height f(xᵢ). The area of a rectangle needs the width Δx too.',
              },
              { id: 'c', tex: '(-2)\\frac{5}{n}', correct: false, why: 'The height must be read at xᵢ, not at a.' },
            ],
          },
          {
            id: 'sum',
            label: 'Rₙ in closed form',
            cards: [
              {
                id: 'a',
                tex: 'R_{n} = -10 + \\frac{25(n+1)}{2n}',
                correct: true,
                why: 'Correct: Σ(−10/n) = −10, and (25/n²)Σi = (25/n²)·n(n+1)/2.',
              },
              {
                id: 'b',
                tex: 'R_{n} = -2 + \\frac{25(n+1)}{2n}',
                correct: false,
                why: 'Adding −10/n for each of the n terms gives −10, not −2.',
              },
              {
                id: 'c',
                tex: 'R_{n} = -10 + \\frac{25n}{2}',
                correct: false,
                why: 'Formula (1) gives Σi = n(n+1)/2, and the factor 25/n² must multiply it.',
              },
            ],
          },
          {
            id: 'limit',
            label: 'Limit as n → ∞',
            cards: [
              {
                id: 'a',
                tex: '\\lim_{n \\to \\infty} R_{n} = \\frac{5}{2}',
                correct: true,
                why: 'Correct: 25(n+1)/(2n) → 25/2, and −10 + 25/2 = 5/2.',
              },
              {
                id: 'b',
                tex: '\\lim_{n \\to \\infty} R_{n} = -10',
                correct: false,
                why: '25(n+1)/(2n) tends to 25/2, not to 0.',
              },
              {
                id: 'c',
                tex: '\\lim_{n \\to \\infty} R_{n} = \\infty',
                correct: false,
                why: 'Both parts stay bounded: the n in the numerator and the denominator cancel.',
              },
            ],
          },
        ],
      },
    ),
    widgetRound(
      1,
      'Build $\\int_{1}^{2} (x^{2} + 1)\\,dx$ (Tutorial 2) as the limit of Riemann sums.',
      'Δx = (2 − 1)/n, and the right endpoints start at 1.',
      {
        type: 'chain',
        fn: { f: (x) => x * x + 1, tex: 'x^{2}+1', a: 1, b: 2 },
        integralTex: '\\int_{1}^{2} (x^{2}+1)\\,dx',
        value: 10 / 3,
        slots: [
          {
            id: 'dx',
            label: 'Width Δx',
            cards: [
              { id: 'a', tex: '\\Delta x = \\frac{1}{n}', correct: true, why: 'Correct: (2 − 1)/n = 1/n.' },
              { id: 'b', tex: '\\Delta x = \\frac{2}{n}', correct: false, why: 'The width uses b − a = 2 − 1, not b.' },
              { id: 'c', tex: '\\Delta x = \\frac{3}{n}', correct: false, why: 'The width is b − a, not a + b.' },
            ],
          },
          {
            id: 'xi',
            label: 'Right endpoint xᵢ',
            cards: [
              { id: 'a', tex: 'x_{i} = 1 + \\frac{i}{n}', correct: true, why: 'Correct: xᵢ = a + iΔx = 1 + i/n.' },
              {
                id: 'b',
                tex: 'x_{i} = \\frac{i}{n}',
                correct: false,
                why: 'This starts at 0; the interval starts at 1.',
              },
              {
                id: 'c',
                tex: 'x_{i} = 2 + \\frac{i}{n}',
                correct: false,
                why: 'This starts at the upper limit; xᵢ must run from a to b.',
              },
            ],
          },
          {
            id: 'term',
            label: 'ith term f(xᵢ)Δx',
            cards: [
              {
                id: 'a',
                tex: '\\left[\\left(1 + \\frac{i}{n}\\right)^{2} + 1\\right]\\frac{1}{n}',
                correct: true,
                why: 'Correct: f(xᵢ) times Δx.',
              },
              {
                id: 'b',
                tex: '\\left(1 + \\frac{i}{n}\\right)^{2}\\frac{1}{n}',
                correct: false,
                why: 'The +1 in f(x) = x² + 1 is missing from the height.',
              },
              {
                id: 'c',
                tex: '\\left[\\left(\\frac{i}{n}\\right)^{2} + 1\\right]\\frac{1}{n}',
                correct: false,
                why: 'The height must be read at xᵢ = 1 + i/n.',
              },
            ],
          },
          {
            id: 'sum',
            label: 'Rₙ in closed form',
            cards: [
              {
                id: 'a',
                tex: 'R_{n} = 2 + \\frac{n+1}{n} + \\frac{(n+1)(2n+1)}{6n^{2}}',
                correct: true,
                why: 'Correct: expand (1 + i/n)² + 1 = 2 + 2i/n + i²/n² and use formulas (1) and (2).',
              },
              {
                id: 'b',
                tex: 'R_{n} = 1 + \\frac{n+1}{n} + \\frac{(n+1)(2n+1)}{6n^{2}}',
                correct: false,
                why: 'The constant part is 2/n for each of the n terms: 1 from the square and 1 from the +1.',
              },
              {
                id: 'c',
                tex: 'R_{n} = 2 + \\frac{n+1}{2n} + \\frac{(n+1)(2n+1)}{6n^{2}}',
                correct: false,
                why: 'The middle term is (2/n²)Σi = (2/n²)·n(n+1)/2 = (n+1)/n.',
              },
            ],
          },
          {
            id: 'limit',
            label: 'Limit as n → ∞',
            cards: [
              {
                id: 'a',
                tex: '\\lim_{n \\to \\infty} R_{n} = \\frac{10}{3}',
                correct: true,
                why: 'Correct: 2 + 1 + 1/3.',
              },
              {
                id: 'b',
                tex: '\\lim_{n \\to \\infty} R_{n} = 3',
                correct: false,
                why: '(n+1)(2n+1)/(6n²) tends to 2/6 = 1/3, not 0.',
              },
              {
                id: 'c',
                tex: '\\lim_{n \\to \\infty} R_{n} = \\frac{7}{3}',
                correct: false,
                why: 'The constant 2 stays: 2 + 1 + 1/3 = 10/3.',
              },
            ],
          },
        ],
      },
    ),
    widgetRound(
      2,
      'Build $\\int_{1}^{4} 4x^{2}\\,dx$ (Tutorial 2) as the limit of Riemann sums.',
      'Δx = 3/n; expand 4(1 + 3i/n)².',
      {
        type: 'chain',
        fn: { f: (x) => 4 * x * x, tex: '4x^{2}', a: 1, b: 4 },
        integralTex: '\\int_{1}^{4} 4x^{2}\\,dx',
        value: 84,
        slots: [
          {
            id: 'dx',
            label: 'Width Δx',
            cards: [
              { id: 'a', tex: '\\Delta x = \\frac{3}{n}', correct: true, why: 'Correct: (4 − 1)/n.' },
              { id: 'b', tex: '\\Delta x = \\frac{4}{n}', correct: false, why: 'Use b − a = 4 − 1 = 3.' },
              { id: 'c', tex: '\\Delta x = \\frac{5}{n}', correct: false, why: 'The width is b − a, not a + b.' },
            ],
          },
          {
            id: 'xi',
            label: 'Right endpoint xᵢ',
            cards: [
              { id: 'a', tex: 'x_{i} = 1 + \\frac{3i}{n}', correct: true, why: 'Correct: a + iΔx.' },
              {
                id: 'b',
                tex: 'x_{i} = \\frac{3i}{n}',
                correct: false,
                why: 'This starts at 0; the interval starts at 1.',
              },
              {
                id: 'c',
                tex: 'x_{i} = 1 + \\frac{i}{n}',
                correct: false,
                why: 'Each step is Δx = 3/n, so xᵢ = 1 + 3i/n.',
              },
            ],
          },
          {
            id: 'term',
            label: 'ith term f(xᵢ)Δx',
            cards: [
              {
                id: 'a',
                tex: '\\frac{12}{n} + \\frac{72i}{n^{2}} + \\frac{108i^{2}}{n^{3}}',
                correct: true,
                why: 'Correct: 4(1 + 3i/n)² · 3/n, expanded.',
              },
              {
                id: 'b',
                tex: '\\frac{12}{n} + \\frac{24i}{n^{2}} + \\frac{36i^{2}}{n^{3}}',
                correct: false,
                why: '(1 + 3i/n)² = 1 + 6i/n + 9i²/n²; multiply every term by 4 · 3/n = 12/n.',
              },
              {
                id: 'c',
                tex: '4\\left(1 + \\frac{3i}{n}\\right)^{2}',
                correct: false,
                why: 'That is the height only; multiply by Δx = 3/n.',
              },
            ],
          },
          {
            id: 'sum',
            label: 'Rₙ in closed form',
            cards: [
              {
                id: 'a',
                tex: 'R_{n} = 12 + \\frac{36(n+1)}{n} + \\frac{18(n+1)(2n+1)}{n^{2}}',
                correct: true,
                why: 'Correct: formulas (1) and (2) applied term by term.',
              },
              {
                id: 'b',
                tex: 'R_{n} = 12 + \\frac{72(n+1)}{n} + \\frac{18(n+1)(2n+1)}{n^{2}}',
                correct: false,
                why: '(72/n²)Σi = (72/n²)·n(n+1)/2 = 36(n+1)/n.',
              },
              {
                id: 'c',
                tex: 'R_{n} = 12n + \\frac{36(n+1)}{n} + \\frac{18(n+1)(2n+1)}{n^{2}}',
                correct: false,
                why: 'Σ(12/n) over n terms is 12, not 12n.',
              },
            ],
          },
          {
            id: 'limit',
            label: 'Limit as n → ∞',
            cards: [
              { id: 'a', tex: '\\lim_{n \\to \\infty} R_{n} = 84', correct: true, why: 'Correct: 12 + 36 + 36 = 84.' },
              {
                id: 'b',
                tex: '\\lim_{n \\to \\infty} R_{n} = 66',
                correct: false,
                why: '18(n+1)(2n+1)/n² tends to 36, not 18.',
              },
              {
                id: 'c',
                tex: '\\lim_{n \\to \\infty} R_{n} = 48',
                correct: false,
                why: 'The constant 12 and both limits must be added: 12 + 36 + 36.',
              },
            ],
          },
        ],
      },
    ),
    widgetRound(
      3,
      'Build $\\int_{0}^{4} (x^{3} - 2x)\\,dx$ (Tutorial 2) as the limit of Riemann sums.',
      'Δx = 4/n and xᵢ = 4i/n; you will need formulas (1) and (3).',
      {
        type: 'chain',
        fn: { f: (x) => x ** 3 - 2 * x, tex: 'x^{3}-2x', a: 0, b: 4 },
        integralTex: '\\int_{0}^{4} (x^{3} - 2x)\\,dx',
        value: 48,
        slots: [
          {
            id: 'dx',
            label: 'Width Δx',
            cards: [
              { id: 'a', tex: '\\Delta x = \\frac{4}{n}', correct: true, why: 'Correct: (4 − 0)/n.' },
              { id: 'b', tex: '\\Delta x = \\frac{1}{n}', correct: false, why: 'The interval [0, 4] has length 4.' },
              { id: 'c', tex: '\\Delta x = 4n', correct: false, why: 'Δx is the length divided by n.' },
            ],
          },
          {
            id: 'xi',
            label: 'Right endpoint xᵢ',
            cards: [
              { id: 'a', tex: 'x_{i} = \\frac{4i}{n}', correct: true, why: 'Correct: a + iΔx with a = 0.' },
              {
                id: 'b',
                tex: 'x_{i} = \\frac{4(i-1)}{n}',
                correct: false,
                why: 'That is the left endpoint; Theorem 2.2.1 uses right endpoints.',
              },
              { id: 'c', tex: 'x_{i} = 4 + \\frac{4i}{n}', correct: false, why: 'The interval starts at 0, not 4.' },
            ],
          },
          {
            id: 'term',
            label: 'ith term f(xᵢ)Δx',
            cards: [
              {
                id: 'a',
                tex: '\\frac{256i^{3}}{n^{4}} - \\frac{32i}{n^{2}}',
                correct: true,
                why: 'Correct: (64i³/n³ − 8i/n) · 4/n.',
              },
              {
                id: 'b',
                tex: '\\frac{64i^{3}}{n^{3}} - \\frac{8i}{n}',
                correct: false,
                why: 'That is the height; multiply by Δx = 4/n.',
              },
              {
                id: 'c',
                tex: '\\frac{256i^{3}}{n^{4}} - \\frac{8i}{n^{2}}',
                correct: false,
                why: '2xᵢ · Δx = 2(4i/n)(4/n) = 32i/n².',
              },
            ],
          },
          {
            id: 'sum',
            label: 'Rₙ in closed form',
            cards: [
              {
                id: 'a',
                tex: 'R_{n} = \\frac{64(n+1)^{2}}{n^{2}} - \\frac{16(n+1)}{n}',
                correct: true,
                why: 'Correct: formula (3) gives Σi³ = [n(n+1)/2]², formula (1) gives Σi.',
              },
              {
                id: 'b',
                tex: 'R_{n} = \\frac{256(n+1)^{2}}{n^{2}} - \\frac{16(n+1)}{n}',
                correct: false,
                why: '(256/n⁴)[n(n+1)/2]² = 64(n+1)²/n²: the square of 1/2 is 1/4.',
              },
              {
                id: 'c',
                tex: 'R_{n} = \\frac{64(n+1)^{2}}{n^{2}} - \\frac{32(n+1)}{n}',
                correct: false,
                why: '(32/n²)Σi = (32/n²)·n(n+1)/2 = 16(n+1)/n.',
              },
            ],
          },
          {
            id: 'limit',
            label: 'Limit as n → ∞',
            cards: [
              { id: 'a', tex: '\\lim_{n \\to \\infty} R_{n} = 48', correct: true, why: 'Correct: 64 − 16 = 48.' },
              {
                id: 'b',
                tex: '\\lim_{n \\to \\infty} R_{n} = 64',
                correct: false,
                why: 'The second part tends to 16, which must be subtracted.',
              },
              {
                id: 'c',
                tex: '\\lim_{n \\to \\infty} R_{n} = 80',
                correct: false,
                why: 'The two parts are subtracted, not added.',
              },
            ],
          },
        ],
      },
    ),
  ],
};

// =============================================================================
// 3. Property Builder (Properties of the Definite Integral)
// =============================================================================

const KNOWN = [
  { id: 'cube', tex: '\\int_{2}^{4} x^{3}\\,dx = 60', short: '\\int_{2}^{4} x^{3}\\,dx', value: 60 },
  { id: 'lin', tex: '\\int_{2}^{4} x\\,dx = 6', short: '\\int_{2}^{4} x\\,dx', value: 6 },
  { id: 'one', tex: '\\int_{2}^{4} dx = 2', short: '\\int_{2}^{4} dx', value: 2 },
];
const LINE: GameFunction = { f: (x) => 2 * x, tex: '2x', a: 0, b: 6 };
const PIECES = [
  { id: 'p1', from: 0, to: 2, value: 4 },
  { id: 'p2', from: 2, to: 5, value: 21 },
  { id: 'p3', from: 5, to: 6, value: 11 },
];

const PROPERTY_BUILDER: GameDefinition = {
  id: 'property-builder',
  title: 'Property Builder',
  unitId: U.properties,
  topicId: AREA_TOPIC_ID,
  summary: 'Combine known integrals with constant multiples, sums, reversed limits and split intervals.',
  tutorial: {
    goal: 'Build each target integral from integrals you already know, using only the properties of §2.2.2.',
    interaction:
      'Set how many of each known integral you need and reverse the limits if the target runs backwards; or join interval pieces end to end, reversing a piece when needed. The value and the picture update as you build.',
    skill:
      'Theorems 2.2.2 to 2.2.5: equal limits, reversed limits, constant multiples, sums and differences, and splitting at c.',
    scoring: '10 points for a correct build first time, 5 after a retry; a hint costs 3.',
  },
  rounds: [
    widgetRound(
      1,
      'Build $\\int_{2}^{4} (2x^{3} + 5x)\\,dx$ from the known integrals.',
      'Theorem 2.2.4 (i) and (ii): 2 of one tile, 5 of another.',
      {
        type: 'property',
        mode: 'combination',
        known: KNOWN,
        targetTex: '\\int_{2}^{4} (2x^{3} + 5x)\\,dx',
        reversed: false,
        coefficients: { cube: 2, lin: 5, one: 0 },
      },
    ),
    widgetRound(
      1,
      'Join pieces to build $\\int_{0}^{5} 2x\\,dx$.',
      'Theorem 2.2.4 (iii): go from 0 to 2, then from 2 to 5.',
      {
        type: 'property',
        mode: 'intervals',
        fn: LINE,
        pieces: PIECES,
        target: { from: 0, to: 5 },
        targetTex: '\\int_{0}^{5} 2x\\,dx',
      },
    ),
    widgetRound(
      2,
      'Build $\\int_{4}^{2} (x^{3} - x)\\,dx$ from the known integrals.',
      'The limits run from 4 down to 2. Which theorem deals with that?',
      {
        type: 'property',
        mode: 'combination',
        known: KNOWN,
        targetTex: '\\int_{4}^{2} (x^{3} - x)\\,dx',
        reversed: true,
        coefficients: { cube: 1, lin: -1, one: 0 },
      },
    ),
    widgetRound(
      2,
      'Join pieces to build $\\int_{6}^{2} 2x\\,dx$.',
      'You need to run backwards from 6 to 2: use pieces reversed.',
      {
        type: 'property',
        mode: 'intervals',
        fn: LINE,
        pieces: PIECES,
        target: { from: 6, to: 2 },
        targetTex: '\\int_{6}^{2} 2x\\,dx',
      },
    ),
    widgetRound(
      3,
      'Build $\\int_{4}^{2} (6x + 1)\\,dx$ from the known integrals.',
      'Reverse the limits, then 6 of one tile and 1 of the constant tile (Theorem 2.2.5).',
      {
        type: 'property',
        mode: 'combination',
        known: KNOWN,
        targetTex: '\\int_{4}^{2} (6x + 1)\\,dx',
        reversed: true,
        coefficients: { cube: 0, lin: 6, one: 1 },
      },
    ),
  ],
};

// =============================================================================
// 4. Area–Derivative Link (The Fundamental Theorem of Calculus)
// =============================================================================

const WAVE: GameFunction = { f: (t) => 1.2 * Math.sin(t) + 0.6, tex: '1.2\\sin t + 0.6', a: 0, b: 6 };
const RAMP: GameFunction = { f: (t) => 2 - t, tex: '2 - t', a: 0, b: 4 };
const BOWL: GameFunction = { f: (t) => t * t - 2 * t, tex: 't^{2} - 2t', a: 0, b: 3 };

const AREA_DERIVATIVE_LINK: GameDefinition = {
  id: 'area-derivative-link',
  title: 'Area–Derivative Link',
  unitId: U.ftc,
  topicId: AREA_TOPIC_ID,
  summary: 'Predict features of the accumulated area A(x) from the graph of f, then see A revealed.',
  tutorial: {
    goal: 'Use the graph of f to find where the accumulated area A(x) = ∫ₐˣ f(t) dt has a given feature.',
    interaction:
      'Move x along the graph of f and lock in your prediction. Then the graph of A appears with its tangent at x, so you can see that its slope is f(x).',
    skill: "The Second Fundamental Theorem: A'(x) = f(x) (§2.3).",
    scoring: '10 points for a correct first prediction, 5 after a retry; a hint costs 3.',
  },
  rounds: [
    widgetRound(
      1,
      'Where does $A(x) = \\int_{0}^{x} (2 - t)\\,dt$ reach its largest value?',
      'A grows while f(t) = 2 − t is positive. Where does f stop being positive?',
      { type: 'accumulation', fn: RAMP, task: { type: 'maximum' }, tolerance: 0.15 },
    ),
    widgetRound(
      1,
      'Where does $A(x) = \\int_{0}^{x} (1.2\\sin t + 0.6)\\,dt$ increase fastest?',
      "A'(x) = f(x). Where is f largest?",
      { type: 'accumulation', fn: WAVE, task: { type: 'steepest' }, tolerance: 0.15 },
    ),
    widgetRound(
      2,
      'Find a place where $A(x) = \\int_{0}^{x} (1.2\\sin t + 0.6)\\,dt$ has a horizontal tangent.',
      "A'(x) = f(x) = 0 there.",
      { type: 'accumulation', fn: WAVE, task: { type: 'flat' }, tolerance: 0.15 },
    ),
    widgetRound(
      2,
      'Where does $A(x) = \\int_{0}^{x} (t^{2} - 2t)\\,dt$ reach its smallest value?',
      'A falls while f is negative. Where does f change from negative to positive?',
      { type: 'accumulation', fn: BOWL, task: { type: 'minimum' }, tolerance: 0.15 },
    ),
    widgetRound(
      3,
      'Where does $A(x) = \\int_{0}^{x} (1.2\\sin t + 0.6)\\,dt$ reach its largest value on $[0, 6]$?',
      'Look for where f changes from positive to negative.',
      { type: 'accumulation', fn: WAVE, task: { type: 'maximum' }, tolerance: 0.15 },
    ),
  ],
};

// =============================================================================
// 5. Equal-Area Height (The Mean Value Theorem for Integrals) — App practice
// =============================================================================

const EQUAL_AREA_HEIGHT: GameDefinition = {
  id: 'equal-area-height',
  title: 'Equal-Area Height',
  unitId: U.mvt,
  topicId: AREA_TOPIC_ID,
  summary: 'App practice: raise or lower a rectangle until its area equals the area under the curve, then find c.',
  tutorial: {
    goal: 'App practice (the notes have no exercise for §2.4): find the height f(c) at which a rectangle on [a, b] has exactly the area under the curve, then find c.',
    interaction:
      'Drag the height. The region above the rectangle and the part of the rectangle above the curve are coloured differently; press Check. Then move c to where the curve meets the rectangle.',
    skill: 'The Mean Value Theorem for Integrals and the average value f(c) = (1/(b − a))∫ₐᵇ f(x) dx (§2.4).',
    scoring: '10 points for a round with no wrong check, 5 after a retry; a hint costs 3.',
  },
  rounds: [
    widgetRound(
      1,
      'Find the mean value rectangle for the curve of Figure 2.5.',
      'Balance the coloured region above the rectangle against the part of the rectangle above the curve.',
      {
        type: 'equalArea',
        fn: { f: MVT.f, tex: 'f(x)', a: MVT.a, b: MVT.b, aLabel: 'a', bLabel: 'b' },
        tolerance: 0.01,
      },
    ),
    widgetRound(
      2,
      'Find the mean value rectangle for $f(x) = x^{2}$ on $[0, 2]$.',
      'The area under x² on [0, 2] is 8/3; the rectangle has width 2.',
      {
        type: 'equalArea',
        fn: { f: (x) => x * x, tex: 'x^{2}', a: 0, b: 2 },
        tolerance: 0.01,
      },
    ),
    widgetRound(
      3,
      'Find the mean value rectangle for $f(x) = \\sqrt{x}$ on $[0, 4]$.',
      'The area under √x on [0, 4] is 16/3; the rectangle has width 4.',
      {
        type: 'equalArea',
        fn: { f: Math.sqrt, tex: '\\sqrt{x}', a: 0, b: 4 },
        tolerance: 0.01,
      },
    ),
  ],
};

// =============================================================================
// 6–7. Converge or Diverge / Approach the Asymptote (one engine)
// =============================================================================

const decayReasons = (fast: boolean) => [
  {
    id: 'fast',
    text: 'The function approaches 0 fast enough that the extra area keeps shrinking towards a finite total.',
    correct: fast,
    why: fast
      ? 'Correct: A(t) is bounded and settles to its limit, so the integral converges (Remark 2.5.1).'
      : 'Not this time: this function does not decrease fast enough; A(t) keeps growing without bound.',
  },
  {
    id: 'slow',
    text: 'The function approaches 0 too slowly, so the area keeps growing without bound.',
    correct: !fast,
    why: !fast
      ? 'Correct: like 1/x in Example 2.5.1, the function does not decrease fast enough for its integral to be finite.'
      : 'Not this time: A(t) stays below a fixed number and settles down.',
  },
  {
    id: 'zero',
    text: 'The function approaches 0 as x → ∞, so the integral must converge.',
    correct: false,
    why: 'Approaching 0 is not enough: 1/x approaches 0 too, but its integral diverges (Example 2.5.1, Figure 2.10).',
  },
];

const CONVERGE_OR_DIVERGE: GameDefinition = {
  id: 'converge-or-diverge',
  title: 'Converge or Diverge',
  unitId: U.typeOne,
  topicId: AREA_TOPIC_ID,
  summary: 'Predict whether an area to infinity is finite, move t outwards to test it, then explain why.',
  tutorial: {
    goal: 'Decide whether each improper integral over an infinite interval converges.',
    interaction: 'Predict first. Then move t outwards and watch A(t), the area so far. Finally choose the reason.',
    skill:
      'Definition 2.5.1 and Remark 2.5.1: an improper integral converges when the limit of A(t) exists as a finite number.',
    scoring: '10 points when the prediction and the reason are both right first time, 5 otherwise; a hint costs 3.',
  },
  rounds: [
    widgetRound(
      1,
      'Does $\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx$ converge? (Figures 2.6, 2.7)',
      'A(t) = 1 − 1/t. What happens to 1/t as t grows?',
      {
        type: 'improper',
        mode: 'infinite',
        f: (x) => 1 / (x * x),
        integralTex: '\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx',
        fixed: 1,
        approaches: Infinity,
        partial: (t) => 1 - 1 / t,
        partialTex: 'A(t) = 1 - \\frac{1}{t}',
        converges: true,
        limit: 1,
        limitTex: '1',
        reasons: decayReasons(true),
        view: { xMin: -0.4, xMax: 10, yMin: -0.12, yMax: 1.2 },
      },
    ),
    widgetRound(
      1,
      'Does $\\int_{1}^{\\infty} \\frac{1}{x}\\,dx$ converge? (Example 2.5.1)',
      'A(t) = ln t. Does ln t level off?',
      {
        type: 'improper',
        mode: 'infinite',
        f: (x) => 1 / x,
        integralTex: '\\int_{1}^{\\infty} \\frac{1}{x}\\,dx',
        fixed: 1,
        approaches: Infinity,
        partial: (t) => Math.log(t),
        partialTex: 'A(t) = \\ln t',
        converges: false,
        reasons: decayReasons(false),
        view: { xMin: -0.4, xMax: 10, yMin: -0.12, yMax: 1.2 },
      },
    ),
    widgetRound(
      2,
      'Does $\\int_{1}^{\\infty} \\frac{1}{x^{3}}\\,dx$ converge? (Tutorial 2)',
      'Compare with 1/x², which converges.',
      {
        type: 'improper',
        mode: 'infinite',
        f: (x) => 1 / x ** 3,
        integralTex: '\\int_{1}^{\\infty} \\frac{1}{x^{3}}\\,dx',
        fixed: 1,
        approaches: Infinity,
        partial: (t) => 0.5 - 1 / (2 * t * t),
        partialTex: 'A(t) = \\frac{1}{2} - \\frac{1}{2t^{2}}',
        converges: true,
        limit: 0.5,
        limitTex: '\\frac{1}{2}',
        reasons: decayReasons(true),
        view: { xMin: -0.4, xMax: 10, yMin: -0.12, yMax: 1.2 },
      },
    ),
    widgetRound(
      2,
      'Does $\\int_{1}^{\\infty} \\frac{1}{\\sqrt{x}}\\,dx$ converge?',
      '1/√x approaches 0 even more slowly than 1/x.',
      {
        type: 'improper',
        mode: 'infinite',
        f: (x) => 1 / Math.sqrt(x),
        integralTex: '\\int_{1}^{\\infty} \\frac{1}{\\sqrt{x}}\\,dx',
        fixed: 1,
        approaches: Infinity,
        partial: (t) => 2 * Math.sqrt(t) - 2,
        partialTex: 'A(t) = 2\\sqrt{t} - 2',
        converges: false,
        reasons: decayReasons(false),
        view: { xMin: -0.4, xMax: 10, yMin: -0.12, yMax: 1.2 },
      },
    ),
    widgetRound(3, 'Does $\\int_{1}^{\\infty} e^{-x}\\,dx$ converge? (Example 2.5.3)', 'A(t) = 1/e − e^(−t).', {
      type: 'improper',
      mode: 'infinite',
      f: (x) => Math.exp(-x),
      integralTex: '\\int_{1}^{\\infty} e^{-x}\\,dx',
      fixed: 1,
      approaches: Infinity,
      partial: (t) => 1 / E - Math.exp(-t),
      partialTex: 'A(t) = \\frac{1}{e} - e^{-t}',
      converges: true,
      limit: 1 / E,
      limitTex: '\\frac{1}{e}',
      reasons: decayReasons(true),
      view: { xMin: -0.4, xMax: 8, yMin: -0.05, yMax: 0.45 },
    }),
  ],
};

const asymptoteReasons = (finite: boolean) => [
  {
    id: 'slow',
    text: 'Near the asymptote the function grows slowly enough that the extra area shrinks towards a finite total.',
    correct: finite,
    why: finite
      ? 'Correct: A(t) settles to a finite limit, so the integral converges (Definitions 2.5.2, 2.5.3).'
      : 'Not this time: near the asymptote the function grows so fast that A(t) has no finite limit.',
  },
  {
    id: 'fast',
    text: 'Near the asymptote the function grows so fast that the area has no finite limit.',
    correct: !finite,
    why: !finite
      ? 'Correct: the limit of A(t) is infinite, so the integral diverges (Remark 2.5.3).'
      : 'Not this time: A(t) stays bounded and settles down.',
  },
  {
    id: 'never',
    text: 'An unbounded function can never have a finite area beneath it.',
    correct: false,
    why: 'Not so: 1/√(x − 2) is unbounded at 2, yet its area on (2, 5] is 2√3 (Example 2.5.2, Figure 2.14).',
  },
];

const APPROACH_THE_ASYMPTOTE: GameDefinition = {
  id: 'approach-the-asymptote',
  title: 'Approach the Asymptote',
  unitId: U.typeTwo,
  topicId: AREA_TOPIC_ID,
  summary:
    'Move t towards a vertical asymptote, predict whether the area is finite, and split at an interior asymptote.',
  tutorial: {
    goal: 'Decide whether each improper integral with an unbounded integrand converges, splitting it where the asymptote is inside the interval.',
    interaction:
      'Where needed, choose where to split first. Predict, then move t towards the asymptote and watch A(t); finally choose the reason.',
    skill: 'Definitions 2.5.2 to 2.5.4 and Remark 2.5.3.',
    scoring: '10 points when every step of a round is right first time, 5 otherwise; a hint costs 3.',
  },
  rounds: [
    widgetRound(
      1,
      'Does $\\int_{2}^{5} \\frac{1}{\\sqrt{x-2}}\\,dx$ converge? (Example 2.5.2)',
      'A(t) = 2√3 − 2√(t − 2). What happens as t → 2⁺?',
      {
        type: 'improper',
        mode: 'asymptote',
        f: (x) => 1 / Math.sqrt(x - 2),
        integralTex: '\\int_{2}^{5} \\frac{1}{\\sqrt{x-2}}\\,dx',
        fixed: 5,
        approaches: 2,
        partial: (t) => 2 * Math.sqrt(3) - 2 * Math.sqrt(t - 2),
        partialTex: 'A(t) = 2\\sqrt{3} - 2\\sqrt{t-2}',
        converges: true,
        limit: 2 * Math.sqrt(3),
        limitTex: '2\\sqrt{3}',
        reasons: asymptoteReasons(true),
        view: { xMin: -0.3, xMax: 6, yMin: -0.4, yMax: 4 },
      },
    ),
    widgetRound(
      1,
      'Does $\\int_{0}^{2} \\frac{dx}{x^{3}}$ converge? (Tutorial 2)',
      'A(t) = −1/8 + 1/(2t²). What happens as t → 0⁺?',
      {
        type: 'improper',
        mode: 'asymptote',
        f: (x) => 1 / x ** 3,
        integralTex: '\\int_{0}^{2} \\frac{dx}{x^{3}}',
        fixed: 2,
        approaches: 0,
        partial: (t) => -1 / 8 + 1 / (2 * t * t),
        partialTex: 'A(t) = -\\frac{1}{8} + \\frac{1}{2t^{2}}',
        converges: false,
        reasons: asymptoteReasons(false),
        view: { xMin: -0.3, xMax: 2.6, yMin: -0.6, yMax: 6 },
      },
    ),
    widgetRound(2, 'Does $\\int_{0}^{8} x^{-\\frac{2}{3}}\\,dx$ converge? (Tutorial 2)', 'A(t) = 6 − 3t^(1/3).', {
      type: 'improper',
      mode: 'asymptote',
      f: (x) => Math.cbrt(x) ** -2,
      integralTex: '\\int_{0}^{8} x^{-\\frac{2}{3}}\\,dx',
      fixed: 8,
      approaches: 0,
      partial: (t) => 6 - 3 * Math.cbrt(t),
      partialTex: 'A(t) = 6 - 3t^{\\frac{1}{3}}',
      converges: true,
      limit: 6,
      limitTex: '6',
      reasons: asymptoteReasons(true),
      view: { xMin: -0.5, xMax: 9, yMin: -0.3, yMax: 3 },
    }),
    widgetRound(
      3,
      'Does $\\int_{-1}^{2} \\frac{dx}{x^{3}}$ converge? (Tutorial 2)',
      'f is unbounded at x = 0, inside [−1, 2]. Definition 2.5.4 needs both pieces to converge.',
      {
        type: 'improper',
        mode: 'asymptote',
        f: (x) => 1 / x ** 3,
        integralTex: '\\int_{-1}^{2} \\frac{dx}{x^{3}}',
        fixed: -1,
        approaches: 0,
        partial: (t) => 0.5 - 1 / (2 * t * t),
        partialTex: '\\int_{-1}^{t} \\frac{dx}{x^{3}} = \\frac{1}{2} - \\frac{1}{2t^{2}}',
        converges: false,
        reasons: asymptoteReasons(false),
        split: {
          at: 0,
          options: [-1, 0, 1, 2],
          naiveTex: '\\left[-\\frac{1}{2x^{2}}\\right]_{-1}^{2} = -\\frac{1}{8} + \\frac{1}{2} = \\frac{3}{8}',
        },
        view: { xMin: -1.3, xMax: 2.3, yMin: -6, yMax: 6 },
      },
    ),
  ],
};

// =============================================================================
// 8. Compare & Decide (the Comparison Theorem)
// =============================================================================

const CANDIDATES = {
  expDecay: {
    id: 'exp',
    tex: 'e^{-x}',
    label: 'e^(−x)',
    f: (x: number) => Math.exp(-x),
    converges: true,
    known: '$\\int_{1}^{\\infty} e^{-x}\\,dx = \\frac{1}{e}$ converges (Example 2.5.3).',
  },
  recip: {
    id: 'recip',
    tex: '\\frac{1}{x}',
    label: '1/x',
    f: (x: number) => 1 / x,
    converges: false,
    known: '$\\int_{1}^{\\infty} \\frac{1}{x}\\,dx$ diverges (Example 2.5.1).',
  },
  invSquare: {
    id: 'sq',
    tex: '\\frac{1}{x^{2}}',
    label: '1/x²',
    f: (x: number) => 1 / (x * x),
    converges: true,
    known: '$\\int_{1}^{\\infty} \\frac{1}{x^{2}}\\,dx = 1$ converges (equation (2.2)).',
  },
  invFifth: {
    id: 'fifth',
    tex: '\\frac{1}{x^{5}}',
    label: '1/x⁵',
    f: (x: number) => 1 / x ** 5,
    converges: true,
    known: '$\\int_{1}^{\\infty} \\frac{1}{x^{5}}\\,dx = \\frac{1}{4}$ converges.',
  },
  threeOverX: {
    id: 'three',
    tex: '\\frac{3}{x}',
    label: '3/x',
    f: (x: number) => 3 / x,
    converges: false,
    known: '$\\int_{1}^{\\infty} \\frac{3}{x}\\,dx$ diverges.',
  },
  halfInvSquare: {
    id: 'halfsq',
    tex: '\\frac{1}{2x^{2}}',
    label: '1/(2x²)',
    f: (x: number) => 1 / (2 * x * x),
    converges: true,
    known: '$\\int_{1}^{\\infty} \\frac{1}{2x^{2}}\\,dx = \\frac{1}{2}$ converges.',
  },
  doubleExp: {
    id: 'exp2',
    tex: 'e^{-2x}',
    label: 'e^(−2x)',
    f: (x: number) => Math.exp(-2 * x),
    converges: true,
    known: '$\\int_{1}^{\\infty} e^{-2x}\\,dx$ converges.',
  },
};

const COMPARE_AND_DECIDE: GameDefinition = {
  id: 'compare-and-decide',
  title: 'Compare & Decide',
  unitId: U.comparison,
  topicId: AREA_TOPIC_ID,
  summary:
    'Choose a comparison function, see which side of the integrand it lies on, and decide what can be concluded.',
  tutorial: {
    goal: 'Use the Comparison Theorem to decide whether each integral converges or diverges.',
    interaction:
      'Choose a comparison function and see it drawn beside the integrand for x ≥ a. Then choose what the theorem lets you conclude. A comparison that proves nothing is not a mistake, but it does not finish the round.',
    skill: 'Theorem 2.5.1 (a) and (b), and Remark 2.5.4: the converse statements need not hold.',
    scoring: '10 points for a correct conclusion first time, 5 after a retry; a hint costs 3.',
  },
  rounds: [
    widgetRound(
      1,
      'Decide whether $\\int_{1}^{\\infty} e^{-x^{2}}\\,dx$ converges (Example 2.5.3, Tutorial 2).',
      'For x ≥ 1, x² ≥ x, so e^(−x²) ≤ e^(−x) (Figure 2.16).',
      {
        type: 'comparison',
        integrand: { tex: 'e^{-x^{2}}', f: (x) => Math.exp(-x * x) },
        a: 1,
        candidates: [CANDIDATES.recip, CANDIDATES.expDecay, CANDIDATES.doubleExp],
        converges: true,
      },
    ),
    widgetRound(
      1,
      'Decide whether $\\int_{1}^{\\infty} \\frac{1}{x^{5}+1}\\,dx$ converges (Tutorial 2).',
      'Making the denominator smaller makes the fraction larger.',
      {
        type: 'comparison',
        integrand: { tex: '\\frac{1}{x^{5}+1}', f: (x) => 1 / (x ** 5 + 1) },
        a: 1,
        candidates: [CANDIDATES.recip, CANDIDATES.halfInvSquare, CANDIDATES.invFifth],
        converges: true,
      },
    ),
    widgetRound(
      2,
      'Decide whether $\\int_{1}^{\\infty} \\frac{2 + e^{-x}}{x}\\,dx$ converges (Tutorial 2).',
      'Since e^(−x) > 0, the integrand is larger than 2/x, which is larger than 1/x.',
      {
        type: 'comparison',
        integrand: { tex: '\\frac{2 + e^{-x}}{x}', f: (x) => (2 + Math.exp(-x)) / x },
        a: 1,
        candidates: [CANDIDATES.threeOverX, CANDIDATES.invSquare, CANDIDATES.recip],
        converges: false,
      },
    ),
    widgetRound(
      3,
      'Decide whether $\\int_{1}^{\\infty} \\frac{x}{x^{3}+1}\\,dx$ converges (Tutorial 2, for x ≥ 1).',
      'x/(x³ + 1) ≤ x/x³ = 1/x².',
      {
        type: 'comparison',
        integrand: { tex: '\\frac{x}{x^{3}+1}', f: (x) => x / (x ** 3 + 1) },
        a: 1,
        candidates: [CANDIDATES.halfInvSquare, CANDIDATES.recip, CANDIDATES.invSquare],
        converges: true,
      },
    ),
  ],
};

export const AREA_GAMES: readonly GameDefinition[] = [
  RIEMANN_BUILDER,
  SUM_TO_INTEGRAL,
  PROPERTY_BUILDER,
  AREA_DERIVATIVE_LINK,
  EQUAL_AREA_HEIGHT,
  CONVERGE_OR_DIVERGE,
  APPROACH_THE_ASYMPTOTE,
  COMPARE_AND_DECIDE,
];
