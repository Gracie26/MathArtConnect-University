/**
 * Complete inventory of the Chapter 3 notes (internal; approved audit).
 *
 * Every teaching item on printed pages 43–54 is listed with its section,
 * page, type and the subtopic that teaches it: 14 numbered worked examples
 * (each with its printed solution), 2 printed figures (Figures 3.1 and 3.2),
 * the definitions, theorems, notation, remarks and explanatory paragraphs.
 * Lesson blocks link back through `source.inventoryId` (or `covers`), and the
 * source-to-screen audit fails if any item has no learner destination.
 *
 * §3.4 is one printed section taught in four subtopics; its items keep the
 * printed section "3.4" (no 3.4.x numbers are invented).
 *
 * Tutorials 3 and 4 are inventoried as practice data (tutorial3.ts, tutorial4.ts).
 */
import type { SourceItemType } from '../../types';

import { RN_UNITS as U, type RnUnitId } from './ids';

export interface RnInventoryItem {
  id: string;
  /** Section as printed; "3" is the chapter introduction (shown with 3.1). */
  section: string;
  page: number;
  type: SourceItemType;
  description: string;
  unitId: RnUnitId;
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
  unitId: RnUnitId,
  reviewIds?: string[],
): RnInventoryItem => ({
  id,
  section,
  page,
  type,
  description,
  unitId,
  navSection: section === '3' ? '3-1' : section.replace(/\./g, '-'),
  ...(reviewIds ? { reviewIds } : {}),
});

export const CHAPTER3_INVENTORY: readonly RnInventoryItem[] = [
  // Chapter introduction (p. 43), shown with §3.1
  item('ch3-title', '3', 43, 'note', 'Chapter title: Differential Calculus in ℝⁿ', U.functions),
  item(
    'ch3-intro-several',
    '3',
    43,
    'explanation',
    'Functions of two or more variables: W = FD, V = πr²h, V = lwh',
    U.functions,
  ),
  item(
    'ch3-intro-notation',
    '3',
    43,
    'formula',
    'z = f(x, y) = x² + xy (2 variables) and w = f(x, y, z) = x + 2y − 3z (3 variables)',
    U.functions,
  ),
  // §3.1 Definition of a Function of Two Variables (pp. 43–44)
  item(
    'ch3-3.1-definition',
    '3.1',
    43,
    'definition',
    'Function of x and y; domain, range, independent and dependent variables',
    U.functions,
  ),
  item(
    'ch3-3.1-domain',
    '3.1',
    43,
    'explanation',
    'Default domain; f(x, y) = x² + y² has the entire xy-plane',
    U.functions,
  ),
  item('ch3-ex-3.1.1', '3.1', 44, 'worked-example', 'Example 3.1.1: domains of f and g', U.functions),
  item('ch3-sol-3.1.1', '3.1', 44, 'worked-solution', 'Solution to Example 3.1.1 (i) and (ii)', U.functions),
  item('ch3-3.1-combining', '3.1', 44, 'explanation', 'Functions of several variables can be combined', U.functions),
  item('ch3-3.1-combining-rules', '3.1', 44, 'formula', 'Sum or difference, product, quotient (g ≠ 0)', U.functions),
  // §3.2 Partial Derivatives (p. 44)
  item(
    'ch3-3.2-heading',
    '3.2',
    44,
    'note',
    'Section heading 3.2 Partial Derivatives (followed directly by 3.2.1)',
    U.partials,
  ),
  // §3.2.1 Partial Derivatives of a Function of Two Variables (pp. 44–46)
  item(
    'ch3-3.2.1-intro',
    '3.2.1',
    44,
    'explanation',
    'How will a function be affected by a change in one variable: partial differentiation',
    U.partials,
  ),
  item(
    'ch3-footnote-1',
    '3.2.1',
    44,
    'note',
    'Footnote 1: history of partial derivatives (Euler, d’Alembert)',
    U.partials,
    ['MR3-01'],
  ),
  item(
    'ch3-def-partials',
    '3.2.1',
    45,
    'definition',
    'Definition of the first partial derivatives fx and fy as limits',
    U.partials,
  ),
  item('ch3-ex-3.2.1', '3.2.1', 45, 'worked-example', 'Example 3.2.1: fx and fy for 3x − x²y² + 2x³y', U.partials),
  item('ch3-sol-3.2.1', '3.2.1', 45, 'worked-solution', 'Solution to Example 3.2.1', U.partials),
  item('ch3-3.2.1-notation', '3.2.1', 45, 'formula', 'Notation for partial derivatives', U.partials),
  item('ch3-3.2.1-evaluation', '3.2.1', 45, 'formula', 'First partials evaluated at the point (a, b)', U.partials),
  item('ch3-ex-3.2.2', '3.2.1', 45, 'worked-example', 'Example 3.2.2: f = xe^{x²y} at (1, ln 2)', U.partials),
  item('ch3-sol-3.2.2', '3.2.1', 46, 'worked-solution', 'Solution to Example 3.2.2', U.partials),
  // §3.2.2 Partial Derivatives of a function of Three or More Variables (p. 46)
  item('ch3-3.2.2-intro', '3.2.2', 46, 'explanation', 'Extension to three or more variables', U.threeVariables),
  item(
    'ch3-3.2.2-definitions',
    '3.2.2',
    46,
    'definition',
    'The three partial derivatives of w = f(x, y, z) as limits',
    U.threeVariables,
  ),
  item('ch3-ex-3.2.3', '3.2.2', 46, 'worked-example', 'Example 3.2.3 (i)–(iii)', U.threeVariables),
  item('ch3-sol-3.2.3', '3.2.2', 46, 'worked-solution', 'Working of Example 3.2.3 (i)–(iii)', U.threeVariables),
  // §3.2.3 Higher-Order Partial Derivatives (pp. 47–48)
  item('ch3-3.2.3-intro', '3.2.3', 47, 'explanation', 'Second, third and higher partial derivatives', U.higherOrder),
  item(
    'ch3-3.2.3-four-cases',
    '3.2.3',
    47,
    'definition',
    'The four second partial derivatives and their notation',
    U.higherOrder,
    ['MR3-03'],
  ),
  item(
    'ch3-3.2.3-mixed',
    '3.2.3',
    47,
    'definition',
    'The third and fourth cases are called mixed partial derivatives',
    U.higherOrder,
  ),
  item(
    'ch3-ex-3.2.4',
    '3.2.3',
    47,
    'worked-example',
    'Example 3.2.4: second partials of 3xy² − 2y + 5x²y²',
    U.higherOrder,
  ),
  item('ch3-sol-3.2.4', '3.2.3', 47, 'worked-solution', 'Solution to Example 3.2.4', U.higherOrder),
  item('ch3-3.2.3-notice', '3.2.3', 47, 'explanation', 'Notice that the two mixed partials are equal', U.higherOrder),
  item(
    'ch3-thm-3.2.1',
    '3.2.3',
    48,
    'theorem',
    'Theorem 3.2.1 (Clairaut’s Theorem or Schwarz’s Theorem)',
    U.higherOrder,
    ['MR3-02'],
  ),
  item(
    'ch3-3.2.3-order',
    '3.2.3',
    48,
    'remark',
    'The order of differentiation of the mixed partial derivatives is irrelevant',
    U.higherOrder,
  ),
  item('ch3-ex-3.2.5', '3.2.3', 48, 'worked-example', 'Example 3.2.5: f = yeˣ + x ln z', U.higherOrder),
  item('ch3-sol-3.2.5', '3.2.3', 48, 'worked-solution', 'Solution to Example 3.2.5', U.higherOrder),
  // §3.3 Total Differential (p. 48)
  item(
    'ch3-3.3-definition',
    '3.3',
    48,
    'definition',
    'Differentials dx = Δx, dy = Δy and the total differential dz',
    U.totalDifferential,
  ),
  item('ch3-3.3-extension', '3.3', 48, 'explanation', 'Extension to w = f(x, y, z, u)', U.totalDifferential),
  item('ch3-ex-3.3.1', '3.3', 48, 'worked-example', 'Example 3.3.1 (i) and (ii)', U.totalDifferential),
  item('ch3-sol-3.3.1', '3.3', 48, 'worked-solution', 'Working of Example 3.3.1 (i) and (ii)', U.totalDifferential),
  // §3.4 Chain Rules for Functions of Several Variables (pp. 49–54)
  item('ch3-thm-3.4.1', '3.4', 49, 'theorem', 'Theorem 3.4.1: chain rule with one independent variable', U.chainOne),
  item('ch3-fig-3.1', '3.4', 49, 'figure', 'Figure 3.1: Chain rule: one independent variable', U.chainOne),
  item('ch3-ex-3.4.1', '3.4', 49, 'worked-example', 'Example 3.4.1: dw/dt at t = 0', U.chainOne),
  item('ch3-sol-3.4.1', '3.4', 49, 'worked-solution', 'Solution to Example 3.4.1', U.chainOne),
  item('ch3-3.4-n-variables', '3.4', 49, 'explanation', 'The Chain Rule extended to w = f(x₁, …, xₙ)', U.chainOne),
  item(
    'ch3-3.4-intermediate',
    '3.4',
    49,
    'explanation',
    'Intermediate variables that are functions of more than one variable',
    U.chainTwo,
  ),
  item('ch3-ex-3.4.2', '3.4', 50, 'worked-example', 'Example 3.4.2: w = 2xy by substitution', U.chainTwo),
  item('ch3-sol-3.4.2', '3.4', 50, 'worked-solution', 'Solution to Example 3.4.2', U.chainTwo),
  item(
    'ch3-3.4-alternative',
    '3.4',
    50,
    'explanation',
    'An alternative method without writing w in terms of s and t',
    U.chainTwo,
  ),
  item('ch3-thm-3.4.2', '3.4', 50, 'theorem', 'Theorem 3.4.2 (Chain Rule: Two Independent Variables)', U.chainTwo),
  item('ch3-ex-3.4.3', '3.4', 50, 'worked-example', 'Example 3.4.3: w = 2xy by the Chain Rule', U.chainTwo),
  item('ch3-sol-3.4.3', '3.4', 50, 'worked-solution', 'Solution to Example 3.4.3', U.chainTwo),
  item('ch3-fig-3.2', '3.4', 51, 'figure', 'Figure 3.2: Chain Rule: Two independent variables', U.chainTwo),
  item('ch3-ex-3.4.4', '3.4', 51, 'worked-example', 'Example 3.4.4: w = xy + yz + xz at s = 1, t = 2π', U.chainTwo),
  item('ch3-sol-3.4.4', '3.4', 51, 'worked-solution', 'Solution to Example 3.4.4', U.chainTwo, ['MR3-04']),
  item('ch3-ex-3.4.5', '3.4', 52, 'worked-example', 'Example 3.4.5: u = x + y, v = xy', U.changeVariables),
  item('ch3-sol-3.4.5', '3.4', 52, 'worked-solution', 'Solution to Example 3.4.5', U.changeVariables),
  item('ch3-ex-3.4.6', '3.4', 52, 'worked-example', 'Example 3.4.6: parabolic co-ordinates', U.changeVariables, [
    'MR3-05',
  ]),
  item(
    'ch3-sol-3.4.6',
    '3.4',
    52,
    'worked-solution',
    'Solution to Example 3.4.6 with equations (3.1) and (3.2)',
    U.changeVariables,
    ['MR3-06'],
  ),
  item('ch3-ex-3.4.7', '3.4', 53, 'worked-example', 'Example 3.4.7: polar coordinates', U.secondOrder),
  item('ch3-sol-3.4.7', '3.4', 53, 'worked-solution', 'Solution to Example 3.4.7', U.secondOrder),
];
