/**
 * Complete inventory of the Chapter 5 notes (internal; approved audit).
 *
 * Every teaching item on printed pages 62–73 is listed with its section,
 * page, type, the one subtopic that teaches it and the internal review flags
 * that apply: 12 numbered worked examples (each with its printed solution),
 * 4 headed definitions, Theorem 5.4.1, Figures 5.1–5.3, the unnumbered
 * results and formulas, two unnumbered worked illustrations and the notes and
 * remarks. Lesson blocks link back through `source.inventoryId` (or
 * `covers`); the completeness test fails if an item has no destination.
 *
 * Tutorial 6 is inventoried as practice data (tutorial6.ts).
 */
import type { SourceItemType } from '../../types';

import { MI_UNITS as U, type MiUnitId } from './ids';

export interface MiInventoryItem {
  id: string;
  /** Section as printed; "5" is the chapter title (shown with 5.1). */
  section: string;
  page: number;
  type: SourceItemType;
  description: string;
  unitId: MiUnitId;
  /** Navigator section (URL id) where the item is shown. */
  navSection: string;
  /** Internal review items that apply. */
  reviewIds?: string[];
}

const UNIT_OF: Record<string, MiUnitId> = {
  '5': U.iterated,
  '5.1': U.iterated,
  '5.1.1': U.orders,
  '5.2.1': U.doubleVolume,
  '5.3': U.triple,
  '5.4.1': U.jacobians,
};

const item = (
  id: string,
  section: string,
  page: number,
  type: SourceItemType,
  description: string,
  reviewIds?: string[],
): MiInventoryItem => ({
  id,
  section,
  page,
  type,
  description,
  unitId: UNIT_OF[section]!,
  navSection: section === '5' ? '5-1' : section.replace(/\./g, '-'),
  ...(reviewIds ? { reviewIds } : {}),
});

export const CHAPTER5_INVENTORY: readonly MiInventoryItem[] = [
  // Chapter title (p. 62), shown with §5.1
  item('ch5-title', '5', 62, 'note', 'Chapter title: Multiple Integration'),

  // §5.1 Iterated Integrals (pp. 62–64)
  item(
    'ch5-5.1-intro',
    '5.1',
    62,
    'explanation',
    'Integrating a function of several variables with respect to one variable',
  ),
  item(
    'ch5-5.1-w1',
    '5.1',
    62,
    'derivation',
    'Recovering f(x, y) from fx(x, y) = 2xy by integrating with respect to x',
    ['MR5-01'],
  ),
  item(
    'ch5-5.1-cy',
    '5.1',
    62,
    'note',
    'The constant of integration C(y) is a function of y; f is recovered only partially',
  ),
  item('ch5-5.1-w2', '5.1', 62, 'derivation', '∫₁^{2y} 2xy dx = 4y³ − y by the Fundamental Theorem of Calculus'),
  item(
    'ch5-5.1-limits-note',
    '5.1',
    62,
    'note',
    'The variable of integration cannot appear in either limit (∫₀ˣ y dx makes no sense)',
  ),
  item('ch5-ex-5.1.1', '5.1', 62, 'worked-example', '∫₁ˣ (2x²y⁻² + 2y) dy'),
  item('ch5-sol-5.1.1', '5.1', 63, 'worked-solution', 'Solution of Example 5.1.1: 3x² − 2x − 1'),
  item('ch5-5.1-remark', '5.1', 63, 'remark', 'The integral defines a function of x and can itself be integrated'),
  item('ch5-ex-5.1.2', '5.1', 63, 'worked-example', '∫₁²[∫₁ˣ (2x²y⁻² + 2y) dy] dx'),
  item('ch5-sol-5.1.2', '5.1', 63, 'worked-solution', 'Solution of Example 5.1.2: 3'),
  item('ch5-fig-5.1', '5.1', 63, 'figure', 'Figure 5.1: The region of integration (1 ≤ x ≤ 2, 1 ≤ y ≤ x)'),
  item(
    'ch5-5.1-iterated',
    '5.1',
    64,
    'formula',
    'Iterated integrals ∫ₐᵇ∫_{g₁(x)}^{g₂(x)} f dy dx and ∫꜀ᵈ∫_{h₁(y)}^{h₂(y)} f dx dy',
  ),
  item(
    'ch5-5.1-limits',
    '5.1',
    64,
    'note',
    'Inside limits may vary with the outer variable; outside limits must be constant',
  ),
  item(
    'ch5-5.1-order',
    '5.1',
    64,
    'remark',
    'The order of integration affects the ease of integration, but not the value',
  ),

  // §5.1.1 Comparing Different Orders of Integration (pp. 64–66)
  item('ch5-ex-5.1.3', '5.1.1', 64, 'worked-example', 'The area ∫₀²∫_{y²}⁴ dx dy in both orders'),
  item('ch5-sol-5.1.3', '5.1.1', 64, 'worked-solution', 'Solution of Example 5.1.3: 16/3 in both orders'),
  item('ch5-fig-5.2', '5.1.1', 64, 'figure', 'Figure 5.2 ("Fig 1"): a horizontal strip Δy between x = y² and x = 4', [
    'MR5-02',
    'MR5-03',
  ]),
  item('ch5-fig-5.3', '5.1.1', 65, 'figure', 'Figure 5.3 ("Fig 2"): a vertical strip Δx under y = √x', ['MR5-03']),
  item('ch5-ex-5.1.4', '5.1.1', 66, 'worked-example', 'Reverse the order of ∫₀⁴∫_{x/2}² e^{y²} dy dx and evaluate'),
  item('ch5-sol-5.1.4', '5.1.1', 66, 'worked-solution', 'Solution of Example 5.1.4: e⁴ − 1'),
  item('ch5-ex-5.1.5', '5.1.1', 66, 'worked-example', '∫₀²∫_{y/2}¹ y e^{x³} dx dy by reversing the order'),
  item('ch5-sol-5.1.5', '5.1.1', 66, 'worked-solution', 'Solution of Example 5.1.5: (2/3)(e − 1)', ['MR5-04']),

  // §5.2 / §5.2.1 Double Integrals and Volume of a Solid Region (pp. 67–68)
  item('ch5-def-double', '5.2.1', 67, 'definition', 'Definition of Double Integral (and integrable)'),
  item(
    'ch5-5.2.1-volume-intro',
    '5.2.1',
    67,
    'explanation',
    'A double integral can find the volume between the xy-plane and z = f(x, y)',
  ),
  item('ch5-def-volume', '5.2.1', 67, 'definition', 'Volume of a Solid Region: V = ∬_R f(x, y) dA when f ≥ 0 on R'),
  item(
    'ch5-ex-5.2.1',
    '5.2.1',
    67,
    'worked-example',
    'Volume under f(x, y) = e^{−x²} bounded by y = 0, y = x and x = 1',
    ['MR5-06'],
  ),
  item('ch5-sol-5.2.1', '5.2.1', 67, 'worked-solution', 'Solution of Example 5.2.1: (e − 1)/(2e) = 0.316', [
    'MR5-05',
    'MR5-06',
  ]),

  // §5.3 Triple Integrals (pp. 68–69)
  item('ch5-def-triple', '5.3', 68, 'definition', 'Definition of Triple Integral, and the volume of Q'),
  item('ch5-5.3-evaluation', '5.3', 68, 'formula', 'Evaluation by Iterated Integrals', ['MR5-07']),
  item('ch5-ex-5.3.1', '5.3', 68, 'worked-example', '∫₀²∫₀ˣ∫₀^{x+y} eˣ(y + 2z) dz dy dx'),
  item(
    'ch5-sol-5.3.1',
    '5.3',
    69,
    'worked-solution',
    'Solution of Example 5.3.1 (printed final answer (19/6)(e²/3 + 1))',
    ['MR5-08'],
  ),
  item('ch5-ex-5.3.2', '5.3', 69, 'worked-example', 'f(x, y, z) = xy + yz over −1 ≤ x ≤ 1, 2 ≤ y ≤ 3, 0 ≤ z ≤ 1', [
    'MR5-09',
  ]),
  item('ch5-sol-5.3.2', '5.3', 69, 'worked-solution', 'Solution of Example 5.3.2: 5/2', ['MR5-09']),

  // §5.4 / §5.4.1 Change of Variables: Jacobians (pp. 69–73)
  item('ch5-5.4.1-jacobi', '5.4.1', 69, 'note', 'The Jacobian is named after Carl Gustav Jacobi (1804–1851)'),
  item(
    'ch5-5.4.1-single',
    '5.4.1',
    70,
    'formula',
    'Change of variable in a single integral: ∫ₐᵇ f(x) dx = ∫꜀ᵈ f(g(u))g′(u) du (prior knowledge)',
  ),
  item('ch5-5.4.1-double', '5.4.1', 70, 'formula', 'The double integral with the Jacobian factor', ['MR5-13']),
  item('ch5-def-jacobian', '5.4.1', 70, 'definition', 'Definition of the Jacobian ∂(x, y)/∂(u, v)', ['MR5-13']),
  item('ch5-5.4.1-reciprocal', '5.4.1', 70, 'formula', '∂(x, y)/∂(u, v) · ∂(u, v)/∂(x, y) = 1'),
  item('ch5-ex-5.4.1', '5.4.1', 70, 'worked-example', 'The Jacobian of x = r cos θ, y = r sin θ'),
  item('ch5-sol-5.4.1', '5.4.1', 70, 'worked-solution', 'Solution of Example 5.4.1: r'),
  item('ch5-5.4.1-polar', '5.4.1', 71, 'formula', 'Change of variables from rectangular to polar coordinates'),
  item(
    'ch5-5.4.1-transformation',
    '5.4.1',
    71,
    'explanation',
    'A one-to-one transformation T from S in the uv-plane to R in the xy-plane',
    ['MR5-10'],
  ),
  item('ch5-thm-5.4.1', '5.4.1', 71, 'theorem', 'Theorem 5.4.1 (Change of Variables for Double Integrals)'),
  item(
    'ch5-ex-5.4.2',
    '5.4.1',
    71,
    'worked-example',
    '∬_R 3xy dA over the region bounded by x − 2y = 0, −4 and x + y = 4, 1',
  ),
  item('ch5-sol-5.4.2', '5.4.1', 71, 'worked-solution', 'Solution of Example 5.4.2: 164/9'),
  item(
    'ch5-ex-5.4.3',
    '5.4.1',
    72,
    'worked-example',
    '∬_R (x² + y²) dx dy over the region bounded by xy = 1, 3 and x² − y² = 1, 4',
    ['MR5-11'],
  ),
  item('ch5-sol-5.4.3', '5.4.1', 72, 'worked-solution', 'Solution of Example 5.4.3: 3', ['MR5-11']),
  item('ch5-ex-5.4.4', '5.4.1', 73, 'worked-example', 'The area of the region bounded by xy = 1, 3 and xy^1.4 = 1, 2', [
    'MR5-12',
  ]),
  item('ch5-sol-5.4.4', '5.4.1', 73, 'worked-solution', 'Solution of Example 5.4.4: 5 ln 2'),
];
