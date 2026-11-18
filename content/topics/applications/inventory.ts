/**
 * Complete inventory of the Chapter 4 notes (internal; approved audit).
 *
 * Every teaching item on printed pages 55–61 is listed with its section,
 * page, type, the subtopic that teaches it and the internal review flags that
 * apply: 8 numbered worked examples (each with its printed solution), 5
 * numbered theorems, 3 unnumbered definitions, and the notes, formulas,
 * derivation and explanatory paragraphs. There are no figures, exercises or
 * "You Try It" items. Lesson blocks link back through `source.inventoryId`
 * (or `covers`); the completeness test fails if an item has no destination.
 *
 * §4.3.1 is taught in two subtopics: its opening in Critical Points and
 * Relative Extrema, and its "The Second Partials Test" block in The Second
 * Partials Test. Both keep the printed section "4.3.1".
 *
 * Tutorial 5 is inventoried as practice data (tutorial5.ts).
 */
import type { SourceItemType } from '../../types';

import { PDA_UNITS as U, type PdaUnitId } from './ids';

export interface PdaInventoryItem {
  id: string;
  /** Section as printed; "4" is the chapter title (shown with 4.1). */
  section: string;
  page: number;
  type: SourceItemType;
  description: string;
  unitId: PdaUnitId;
  /** Navigator section (URL id) where the item is shown. */
  navSection: string;
  /** Internal review items that apply. */
  reviewIds?: string[];
}

const item = (
  id: string,
  section: string,
  page: number,
  type: SourceItemType,
  description: string,
  unitId: PdaUnitId,
  reviewIds?: string[],
): PdaInventoryItem => ({
  id,
  section,
  page,
  type,
  description,
  unitId,
  navSection: section === '4' ? '4-1' : section.replace(/\./g, '-'),
  ...(reviewIds ? { reviewIds } : {}),
});

export const CHAPTER4_INVENTORY: readonly PdaInventoryItem[] = [
  // Chapter title (p. 55), shown with §4.1
  item('ch4-title', '4', 55, 'note', 'Chapter title: Applications of the Partial Derivative', U.gradient),

  // §4.1 The Gradient of a Function of Two Variables (p. 55)
  item(
    'ch4-4.1-intro',
    '4.1',
    55,
    'explanation',
    'The gradient of a function of two variables is a vector-valued function of two variables',
    U.gradient,
  ),
  item(
    'ch4-4.1-definition',
    '4.1',
    55,
    'definition',
    'Gradient of z = f(x, y) (fx and fy exist): ∇f(x, y) = fx(x, y)i + fy(x, y)j',
    U.gradient,
    ['MR4-02'],
  ),
  item('ch4-4.1-notation', '4.1', 55, 'note', 'Read ∇f as "del f"; another notation is grad f(x, y)', U.gradient),
  item('ch4-ex-4.1.1', '4.1', 55, 'worked-example', 'Gradient of y ln x + xy² at (1, 2)', U.gradient),
  item('ch4-sol-4.1.1', '4.1', 55, 'worked-solution', 'Solution of Example 4.1.1: 6i + 4j', U.gradient, ['MR4-01']),
  item('ch4-ex-4.1.2', '4.1', 55, 'worked-example', '∇f(x, y, z) for f = x² + y² − 4z', U.gradient, ['MR4-02']),
  item('ch4-sol-4.1.2', '4.1', 55, 'worked-solution', 'Solution of Example 4.1.2: 2xi + 2yj − 4k', U.gradient),

  // §4.2.1 Tangent Plane and Normal Line to a Surface (pp. 56–58)
  item(
    'ch4-4.2.1-general-form',
    '4.2.1',
    56,
    'explanation',
    'Surfaces z = f(x, y) and the general form F(x, y, z) = 0; F = f(x, y) − z; S as a level surface',
    U.tangentPlanes,
  ),
  item(
    'ch4-4.2.1-curve',
    '4.2.1',
    56,
    'derivation',
    'A curve r(t) on S through P; Chain Rule gives 0 = ∇F(x₀, y₀, z₀) · r′(t)',
    U.tangentPlanes,
    ['MR4-03'],
  ),
  item(
    'ch4-4.2.1-orthogonal',
    '4.2.1',
    56,
    'explanation',
    'The gradient at P is orthogonal to the tangent vector of every curve on S through P',
    U.tangentPlanes,
  ),
  item(
    'ch4-thm-4.2.1',
    '4.2.1',
    56,
    'theorem',
    'Theorem 4.2.1 (Definition of Tangent Plane and Normal Line), ∇F(x₀, y₀, z₀) ≠ 0',
    U.tangentPlanes,
    ['MR4-04'],
  ),
  item(
    'ch4-thm-4.2.2',
    '4.2.1',
    56,
    'theorem',
    'Theorem 4.2.2 (Equation of Tangent Plane): Fx(x − x₀) + Fy(y − y₀) + Fz(z − z₀) = 0',
    U.tangentPlanes,
    ['MR4-05'],
  ),
  item(
    'ch4-ex-4.2.1',
    '4.2.1',
    57,
    'worked-example',
    'Tangent plane to z² − 2x² − 2y² = 12 at (1, −1, 4)',
    U.tangentPlanes,
  ),
  item(
    'ch4-sol-4.2.1',
    '4.2.1',
    57,
    'worked-solution',
    'Solution of Example 4.2.1: x − y − 2z + 6 = 0',
    U.tangentPlanes,
  ),
  item(
    'ch4-4.2.1-z-form',
    '4.2.1',
    57,
    'formula',
    'Tangent plane to z = f(x, y): fx(x₀, y₀)(x − x₀) + fy(x₀, y₀)(y − y₀) − (z − z₀) = 0',
    U.tangentPlanes,
  ),
  item(
    'ch4-ex-4.2.2',
    '4.2.1',
    57,
    'worked-example',
    'Tangent plane to z = 1 − (x² + 4y²)/10 at (1, 1, ½)',
    U.tangentPlanes,
  ),
  item(
    'ch4-sol-4.2.2',
    '4.2.1',
    58,
    'worked-solution',
    'Solution of Example 4.2.2: −x/5 − 4y/5 − z + 3/2 = 0',
    U.tangentPlanes,
  ),
  item(
    'ch4-4.2.1-normal-note',
    '4.2.1',
    58,
    'note',
    'The gradient ∇F(x, y, z) gives a convenient way to find equations of normal lines',
    U.tangentPlanes,
  ),
  item('ch4-ex-4.2.3', '4.2.1', 58, 'worked-example', 'Normal line to xyz = 6 at (2, 3, 1)', U.tangentPlanes),
  item(
    'ch4-sol-4.2.3',
    '4.2.1',
    58,
    'worked-solution',
    'Solution of Example 4.2.3: (x − 2)/3 = (y − 3)/2 = (z − 1)/6',
    U.tangentPlanes,
  ),

  // §4.3.1 Absolute Extrema and Relative Extrema: opening (pp. 58–60)
  item(
    'ch4-thm-4.3.1',
    '4.3.1',
    58,
    'theorem',
    'Theorem 4.3.1 (Extreme Value Theorem) on a closed bounded region R',
    U.criticalPoints,
    ['MR4-09'],
  ),
  item(
    'ch4-4.3.1-absolute',
    '4.3.1',
    58,
    'note',
    'A minimum (maximum) value is also called an absolute minimum (maximum)',
    U.criticalPoints,
  ),
  item(
    'ch4-4.3.1-relative',
    '4.3.1',
    59,
    'definition',
    'Definition of Relative Extrema: f(x, y) ≥ (≤) f(x₀, y₀) on an open disc',
    U.criticalPoints,
  ),
  item(
    'ch4-4.3.1-critical-intro',
    '4.3.1',
    59,
    'explanation',
    'Relative extrema are located at points where the gradient of f is 0, called critical points',
    U.criticalPoints,
    ['MR4-07'],
  ),
  item(
    'ch4-4.3.1-critical',
    '4.3.1',
    59,
    'definition',
    'Definition of Critical Point: (1) fx = 0 and fy = 0; (2) fx and fy does not exist',
    U.criticalPoints,
    ['MR4-06'],
  ),
  item(
    'ch4-thm-4.3.2',
    '4.3.1',
    59,
    'theorem',
    'Theorem 4.3.2: a relative extremum on an open region is at a critical point',
    U.criticalPoints,
  ),
  item('ch4-ex-4.3.1', '4.3.1', 59, 'worked-example', 'Relative extrema of 2x² + y² + 8x − 6y + 20', U.criticalPoints),
  item(
    'ch4-sol-4.3.1',
    '4.3.1',
    59,
    'worked-solution',
    'Solution of Example 4.3.1: relative minimum f(−2, 3) = 3',
    U.criticalPoints,
  ),
  item(
    'ch4-4.3.1-two-types',
    '4.3.1',
    60,
    'explanation',
    'Two types of critical point: both partial derivatives 0, or a partial derivative undefined',
    U.criticalPoints,
    ['MR4-06'],
  ),
  item('ch4-ex-4.3.2', '4.3.1', 60, 'worked-example', 'Relative extrema of 1 − (x² + y²)^(1/3)', U.criticalPoints),
  item(
    'ch4-sol-4.3.2',
    '4.3.1',
    60,
    'worked-solution',
    'Solution of Example 4.3.2: relative maximum at (0, 0)',
    U.criticalPoints,
  ),

  // §4.3.1, "The Second Partials Test" (pp. 60–61)
  item(
    'ch4-4.3.1-saddle',
    '4.3.1',
    60,
    'explanation',
    'Some critical points yield saddle points, which are neither relative maxima nor relative minima',
    U.secondPartials,
  ),
  item(
    'ch4-thm-4.3.3',
    '4.3.1',
    60,
    'theorem',
    'Theorem 4.3.3 (Second Partials Test): d = fxx fyy − fxy²',
    U.secondPartials,
  ),
  item(
    'ch4-4.3.1-determinant',
    '4.3.1',
    60,
    'formula',
    'd as the 2 × 2 determinant of fxx, fxy, fyx, fyy, with fxy = fyx',
    U.secondPartials,
  ),
  item('ch4-ex-4.3.3', '4.3.1', 61, 'worked-example', 'Relative extrema of −x³ + 4xy − 2y² + 1', U.secondPartials),
  item(
    'ch4-sol-4.3.3',
    '4.3.1',
    61,
    'worked-solution',
    'Solution of Example 4.3.3: saddle point at (0, 0), relative maximum at (4/3, 4/3)',
    U.secondPartials,
  ),
];
