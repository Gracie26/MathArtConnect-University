/**
 * Complete inventory of the Chapter 2 notes (internal; approved audit).
 *
 * Every teaching item on printed pages 23–42 is listed with its section,
 * page, type and the subtopic that teaches it: 112 items, including 11
 * worked examples (9 numbered and 2 unlabelled), 1 "You Try It" exercise
 * and 17 figures (Figures 2.1–2.16 and one unnumbered pair). Lesson blocks
 * link back through `source.inventoryId` (or `covers`), and the
 * source-to-screen audit fails if any item has no learner destination.
 *
 * Tutorial 2 is inventoried as practice data (tutorial2.ts).
 */
import type { SourceItemType } from '../../types';

import { AREA_UNITS as U, type AreaUnitId } from './ids';

export interface AreaInventoryItem {
  id: string;
  /** Section as printed; "2" is the chapter introduction (shown with 2.1). */
  section: string;
  page: number;
  type: SourceItemType;
  description: string;
  unitId: AreaUnitId;
  /** Navigator section (URL id) where the item is shown. */
  navSection: string;
  /** Review items that apply (shown as printed with a note). */
  reviewIds?: string[];
}

const item = (
  id: string,
  section: string,
  page: number,
  type: SourceItemType,
  description: string,
  unitId: AreaUnitId,
  reviewIds?: string[],
): AreaInventoryItem => ({
  id,
  section,
  page,
  type,
  description,
  unitId,
  navSection: section === '2' ? '2-1' : section.replace(/\./g, '-'),
  ...(reviewIds ? { reviewIds } : {}),
});

export const CHAPTER2_INVENTORY: readonly AreaInventoryItem[] = [
  // Chapter introduction and §2.1 Area Under a Graph
  item('ch2-title', '2', 23, 'note', 'Chapter title', U.riemann),
  item('ch2-intro-area', '2', 23, 'explanation', 'Area viewpoint → definite integration; limits of sums', U.riemann),
  item(
    'ch2-intro-plan',
    '2',
    23,
    'explanation',
    'FTC equivalence, other methods, improper integrals (bounded assumptions)',
    U.riemann,
  ),
  item(
    'ch2-2.1-area-problem',
    '2.1',
    23,
    'explanation',
    'Area A bounded by the x-axis, y = f(x) ≥ 0 on [a, b], and (i)/(ii)',
    U.riemann,
  ),
  item('ch2-2.1-figure', '2.1', 24, 'figure', 'Unnumbered two-panel figure: cases (i) and (ii)', U.riemann),
  // §2.2 Riemann Sums
  item('ch2-2.2-riemann-sum', '2.2', 24, 'explanation', 'A Riemann sum is a sum of areas of rectangles', U.riemann),
  item('ch2-fig-2.1', '2.2', 24, 'figure', 'Figure 2.1: region S', U.riemann),
  item('ch2-2.2-partition', '2.2', 24, 'explanation', 'Divide [a, b] into n subintervals', U.riemann),
  item('ch2-2.2-partition-formula', '2.2', 25, 'formula', 'a = x₀ < x₁ < … < xₙ = b', U.riemann),
  item('ch2-fig-2.2', '2.2', 25, 'figure', 'Figure 2.2: strips S₁ … Sₙ', U.riemann),
  item('ch2-2.2-subintervals', '2.2', 25, 'formula', 'The subintervals [x₀, x₁], …, [xₙ₋₁, xₙ]', U.riemann),
  item('ch2-2.2-dx', '2.2', 25, 'formula', 'Δx = (b − a)/n, xᵢ = a + iΔx', U.riemann),
  item('ch2-2.2-three-forms', '2.2', 25, 'explanation', 'Three forms of area estimation', U.riemann),
  item('ch2-2.2-case1', '2.2', 25, 'explanation', 'CASE I: right endpoint', U.riemann),
  item('ch2-fig-2.3', '2.2', 26, 'figure', 'Figure 2.3: right-endpoint rectangles', U.riemann),
  item('ch2-2.2-rn', '2.2', 26, 'formula', 'Rₙ', U.riemann),
  item('ch2-def-2.2.1', '2.2', 26, 'definition', 'Definition 2.2.1: A_R', U.riemann),
  item('ch2-2.2-case2', '2.2', 26, 'explanation', 'CASE II: left endpoint', U.riemann, ['MR2-01']),
  item('ch2-2.2-ln', '2.2', 26, 'formula', 'Lₙ', U.riemann),
  item('ch2-def-2.2.2', '2.2', 26, 'definition', 'Definition 2.2.2: A_L', U.riemann),
  item('ch2-2.2-case3', '2.2', 26, 'explanation', 'CASE III: any number in the ith subinterval', U.riemann),
  item('ch2-2.2-sample-points', '2.2', 27, 'definition', 'Sample points x₁*, …, xₙ*', U.riemann),
  item('ch2-fig-2.4', '2.2', 27, 'figure', 'Figure 2.4: sample-point rectangles', U.riemann),
  item('ch2-2.2-cn', '2.2', 27, 'formula', 'Cₙ', U.riemann, ['MR2-02']),
  item('ch2-def-2.2.3', '2.2', 27, 'definition', 'Definition 2.2.3: A_C', U.riemann),
  // §2.2.1 The Definite Integral
  item(
    'ch2-2.2.1-history',
    '2.2.1',
    27,
    'explanation',
    'History: Northern Africa, Eudoxus, Archimedes, Barrow, Newton, Leibniz',
    U.definite,
  ),
  item('ch2-def-2.2.4', '2.2.1', 27, 'definition', 'Definition 2.2.4: the definite integral', U.definite),
  item(
    'ch2-2.2.1-terms',
    '2.2.1',
    28,
    'definition',
    'Riemann integrable; lower and upper limits; sample point',
    U.definite,
  ),
  item(
    'ch2-2.2.1-sample-choice',
    '2.2.1',
    28,
    'explanation',
    'The limit does not depend on the sample points',
    U.definite,
  ),
  item('ch2-thm-2.2.1', '2.2.1', 28, 'theorem', 'Theorem 2.2.1: right endpoints', U.definite),
  item('ch2-2.2.1-power-sums', '2.2.1', 28, 'formula', 'Sums of i, i², i³', U.definite),
  item('ch2-ex-2.2.1', '2.2.1', 28, 'worked-example', 'Example 2.2.1: ∫₀¹ 2x dx by Riemann sums', U.definite),
  item('ch2-sol-2.2.1', '2.2.1', 28, 'worked-solution', 'Solution 2.2.1', U.definite),
  item('ch2-ex-2.2.2', '2.2.1', 29, 'worked-example', 'Example 2.2.2: ∫₋₁²[(x − 1)² + 2]dx', U.definite),
  item('ch2-sol-2.2.2', '2.2.1', 29, 'worked-solution', 'Solution 2.2.2', U.definite),
  item('ch2-ex-2.2.1-yti', '2.2.1', 30, 'you-try-it', 'You Try It: Exercise 2.2.1, ∫₁²(x − 1)dx', U.definite),
  item('ch2-2.2.1-midpoint-better', '2.2.1', 30, 'explanation', 'Midpoints are better for approximation', U.definite),
  item('ch2-midpoint-rule', '2.2.1', 30, 'formula', 'Mid-point Rule', U.definite),
  item('ch2-ex-2.2.3', '2.2.1', 30, 'worked-example', 'Example 2.2.3: Midpoint Rule, n = 4, ∫₀² eˣ dx', U.definite),
  item('ch2-sol-2.2.3', '2.2.1', 30, 'worked-solution', 'Solution 2.2.3', U.definite),
  // §2.2.2 Properties of the Definite Integral
  item('ch2-2.2.2-intro', '2.2.2', 30, 'explanation', '"The following two definitions…"', U.properties, ['MR2-03']),
  item('ch2-thm-2.2.2', '2.2.2', 30, 'theorem', 'Theorem 2.2.2: ∫ₐᵃ f = 0', U.properties),
  item('ch2-thm-2.2.3', '2.2.2', 31, 'theorem', 'Theorem 2.2.3: reversing the limits', U.properties),
  item('ch2-2.2.2-example', '2.2.2', 31, 'worked-example', 'Example: by definition ∫₁¹(x³ + 3x)dx = 0', U.properties, [
    'MR2-04',
  ]),
  item('ch2-thm-2.2.4', '2.2.2', 31, 'theorem', 'Theorem 2.2.4 (i)–(iii)', U.properties),
  item('ch2-2.2.2-dummy', '2.2.2', 31, 'definition', 'Dummy variable of integration', U.properties),
  item('ch2-thm-2.2.5', '2.2.2', 31, 'theorem', 'Theorem 2.2.5: ∫ₐᵇ k dx = k(b − a)', U.properties),
  item('ch2-thm-2.2.6', '2.2.2', 31, 'theorem', 'Theorem 2.2.6: f ≥ 0 ⇒ ∫ ≥ 0', U.properties),
  item('ch2-thm-2.2.7', '2.2.2', 31, 'theorem', 'Theorem 2.2.7: f ≤ g ⇒ ∫f ≤ ∫g', U.properties),
  // §2.3 The Fundamental Theorem of Calculus
  item('ch2-2.3-connection', '2.3', 32, 'explanation', 'Differential and integral calculus connected', U.ftc),
  item('ch2-2.3-integrable', '2.3', 32, 'explanation', 'Which functions are integrable; inverse operations', U.ftc),
  item('ch2-thm-2.3.1', '2.3', 32, 'theorem', 'Theorem 2.3.1: FTC', U.ftc),
  item('ch2-rem-2.3.1', '2.3', 32, 'remark', 'Remark 2.3.1: notation', U.ftc),
  item('ch2-rem-2.3.2', '2.3', 32, 'remark', 'Remark 2.3.2: no constant C', U.ftc),
  item('ch2-ex-2.3.1', '2.3', 32, 'worked-example', 'Example 2.3.1: ∫₁³ x dx', U.ftc),
  item('ch2-sol-2.3.1', '2.3', 32, 'worked-solution', 'Solution 2.3.1', U.ftc),
  item('ch2-thm-2.3.2', '2.3', 32, 'theorem', 'Theorem 2.3.2: SFTC', U.ftc),
  item('ch2-2.3-leibniz', '2.3', 33, 'explanation', 'Leibniz notation lead-in', U.ftc),
  item('ch2-thm-2.3.3', '2.3', 33, 'theorem', 'Theorem 2.3.3: alternative form of the SFTC', U.ftc),
  item('ch2-rem-2.3.3', '2.3', 33, 'remark', 'Remark 2.3.3', U.ftc, ['MR2-08']),
  item('ch2-ex-2.3.2', '2.3', 33, 'worked-example', 'Example 2.3.2: d/dx ∫ₐˣ √(t² + 1) dt', U.ftc),
  item('ch2-sol-2.3.2', '2.3', 33, 'worked-solution', 'Solution 2.3.2', U.ftc),
  item('ch2-ex-2.3.3', '2.3', 33, 'worked-example', 'Example 2.3.3: F(x) = ∫_{π/3}^{x³} cos t dt', U.ftc),
  item('ch2-sol-2.3.3', '2.3', 33, 'worked-solution', 'Solution 2.3.3', U.ftc, ['MR2-07']),
  // §2.4 The Mean Value Theorem for Integrals
  item('ch2-2.4-rectangles', '2.4', 33, 'explanation', 'Inscribed, circumscribed and mean-value rectangles', U.mvt),
  item('ch2-fig-2.5', '2.4', 34, 'figure', 'Figure 2.5: three rectangles', U.mvt),
  item('ch2-thm-2.4.1', '2.4', 34, 'theorem', 'Theorem 2.4.1: Mean Value Theorem for Integrals', U.mvt),
  item('ch2-2.4-average', '2.4', 34, 'explanation', 'f(c) is the average value', U.mvt),
  item('ch2-def-2.4.1', '2.4', 34, 'definition', 'Definition 2.4.1: average value', U.mvt, ['MR2-05']),
  // §2.5 Improper Integrals and §2.5.1 TYPE I
  item('ch2-2.5-intro', '2.5', 34, 'explanation', 'Infinite interval or infinite discontinuity', U.typeOne),
  item(
    'ch2-2.5.1-region',
    '2.5.1',
    34,
    'worked-example',
    'Region under 1/x² right of x = 1; A(t), eq. (2.1)',
    U.typeOne,
  ),
  item('ch2-2.5.1-bounded', '2.5.1', 35, 'explanation', 'A(t) < 1 for every t', U.typeOne),
  item('ch2-fig-2.6', '2.5.1', 35, 'figure', 'Figure 2.6: area = 1 − 1/t', U.typeOne),
  item('ch2-2.5.1-limit', '2.5.1', 35, 'worked-solution', 'lim A(t) = 1; eq. (2.2)', U.typeOne),
  item('ch2-fig-2.7', '2.5.1', 35, 'figure', 'Figure 2.7: four panels', U.typeOne),
  item('ch2-2.5.1-based', '2.5.1', 35, 'explanation', 'Defining the integral over an infinite interval', U.typeOne),
  item('ch2-def-2.5.1-1', '2.5.1', 35, 'definition', 'Definition 2.5.1 part 1, eq. (2.3)', U.typeOne),
  item('ch2-def-2.5.1-2', '2.5.1', 36, 'definition', 'Definition 2.5.1 part 2, eq. (2.4)', U.typeOne),
  item('ch2-rem-2.5.1', '2.5.1', 36, 'remark', 'Remark 2.5.1: convergent and divergent', U.typeOne),
  item('ch2-def-2.5.1-3', '2.5.1', 36, 'definition', 'Definition 2.5.1 part 3, eq. (2.5)', U.typeOne),
  item('ch2-rem-2.5.2', '2.5.1', 36, 'remark', 'Remark 2.5.2: any real a', U.typeOne),
  item('ch2-2.5.1-area', '2.5.1', 36, 'explanation', 'Area interpretation A(S)', U.typeOne, ['MR2-06']),
  item('ch2-fig-2.8', '2.5.1', 36, 'figure', 'Figure 2.8: infinite region S', U.typeOne),
  item('ch2-ex-2.5.1', '2.5.1', 36, 'worked-example', 'Example 2.5.1: ∫₁^∞ 1/x dx', U.typeOne),
  item('ch2-sol-2.5.1', '2.5.1', 37, 'worked-solution', 'Solution 2.5.1', U.typeOne),
  item('ch2-2.5.1-compare', '2.5.1', 37, 'explanation', '1/x² converges, 1/x diverges', U.typeOne),
  item('ch2-fig-2.9', '2.5.1', 37, 'figure', 'Figure 2.9: finite area', U.typeOne),
  item('ch2-fig-2.10', '2.5.1', 37, 'figure', 'Figure 2.10: infinite area', U.typeOne),
  item('ch2-2.5.1-decay', '2.5.1', 37, 'explanation', '1/x² approaches 0 faster than 1/x', U.typeOne),
  // §2.5.2 TYPE II
  item('ch2-2.5.2-setup', '2.5.2', 37, 'explanation', 'Vertical asymptote at b; A(t)', U.typeTwo),
  item('ch2-fig-2.11', '2.5.2', 38, 'figure', 'Figure 2.11: asymptote at b', U.typeTwo),
  item('ch2-2.5.2-limit', '2.5.2', 38, 'explanation', 'A(t) → A as t → b⁻', U.typeTwo),
  item('ch2-def-2.5.2', '2.5.2', 38, 'definition', 'Definition 2.5.2: discontinuous at b', U.typeTwo),
  item('ch2-def-2.5.3', '2.5.2', 38, 'definition', 'Definition 2.5.3: discontinuous at a', U.typeTwo),
  item('ch2-rem-2.5.3', '2.5.2', 38, 'remark', 'Remark 2.5.3: convergent and divergent', U.typeTwo),
  item('ch2-def-2.5.4', '2.5.2', 39, 'definition', 'Definition 2.5.4: discontinuity at c', U.typeTwo),
  item(
    'ch2-2.5.2-illustrated',
    '2.5.2',
    39,
    'explanation',
    'Figures 2.12 and 2.13 illustrate Definitions 2.5.3 and 2.5.4',
    U.typeTwo,
  ),
  item('ch2-fig-2.12', '2.5.2', 39, 'figure', 'Figure 2.12: asymptote at a', U.typeTwo),
  item('ch2-fig-2.13', '2.5.2', 39, 'figure', 'Figure 2.13: asymptote at c', U.typeTwo),
  item('ch2-ex-2.5.2', '2.5.2', 39, 'worked-example', 'Example 2.5.2: ∫₂⁵ 1/√(x − 2) dx', U.typeTwo),
  item('ch2-sol-2.5.2', '2.5.2', 39, 'worked-solution', 'Solution 2.5.2', U.typeTwo),
  item('ch2-fig-2.14', '2.5.2', 40, 'figure', 'Figure 2.14: area = 2√3', U.typeTwo),
  // §2.5.3 A Comparison Test
  item('ch2-2.5.3-intro', '2.5.3', 40, 'explanation', 'When the exact value cannot be found', U.comparison),
  item('ch2-thm-2.5.1', '2.5.3', 40, 'theorem', 'Theorem 2.5.1: Comparison Theorem', U.comparison),
  item(
    'ch2-2.5.3-proof-omitted',
    '2.5.3',
    40,
    'explanation',
    'Proof omitted; Figure 2.15 makes it plausible',
    U.comparison,
  ),
  item('ch2-fig-2.15', '2.5.3', 41, 'figure', 'Figure 2.15: f above g', U.comparison),
  item(
    'ch2-2.5.3-plausible',
    '2.5.3',
    41,
    'explanation',
    'Finite area under f ⇒ finite under g; and conversely for infinite',
    U.comparison,
  ),
  item('ch2-rem-2.5.4', '2.5.3', 41, 'remark', 'Remark 2.5.4: the converse need not hold', U.comparison),
  item('ch2-ex-2.5.3', '2.5.3', 41, 'worked-example', 'Example 2.5.3: ∫₀^∞ e^(−x²) dx converges', U.comparison),
  item(
    'ch2-sol-2.5.3-split',
    '2.5.3',
    41,
    'worked-solution',
    'Solution 2.5.3: split at 1; e^(−x²) ≤ e^(−x)',
    U.comparison,
  ),
  item('ch2-fig-2.16', '2.5.3', 42, 'figure', 'Figure 2.16: e^(−x²) and e^(−x)', U.comparison),
  item(
    'ch2-sol-2.5.3-end',
    '2.5.3',
    42,
    'worked-solution',
    'Solution 2.5.3: ∫₁^∞ e^(−x) dx = 1/e; conclusion',
    U.comparison,
  ),
];
