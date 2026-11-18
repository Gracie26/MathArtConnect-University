/**
 * Complete inventory of the Chapter 1 notes (internal).
 *
 * Built by reading every page of the notes, with the page images used where
 * text extraction was garbled. Every readable teaching item is listed here
 * with its printed page, its type and the subtopic that teaches it. Lesson
 * content links back to these ids through `source.inventoryId`, and the
 * source-audit test fails if any item has no mapped content, so nothing can
 * disappear silently.
 *
 * Tutorial 1 is inventoried separately as structured practice data
 * (tutorial1.ts).
 */
import type { SourceItemType } from '../../types';

import { INTEGRATION_UNITS as U, type IntegrationUnitId } from './ids';
import { CH1, TABLE_1_1 } from './sources';

export interface InventoryItem {
  id: string;
  section: string;
  /** Printed page number. */
  page: number;
  type: SourceItemType;
  /** What the item is (internal description, not shown to learners). */
  description: string;
  unitId: IntegrationUnitId;
  /** Navigator section when it differs from `section` (Table 1.1 has its own entry). */
  navSection?: string;
}

const item = (
  id: string,
  section: string,
  page: number,
  type: SourceItemType,
  description: string,
  unitId: IntegrationUnitId,
): InventoryItem => ({
  id,
  section,
  page,
  type,
  description,
  unitId,
  ...(id.startsWith('ch1-1.8-table-') ? { navSection: TABLE_1_1 } : {}),
});

export const CHAPTER1_INVENTORY: readonly InventoryItem[] = [
  // §1.1 Anti-derivatives
  item(
    'ch1-1.1-views',
    '1.1',
    1,
    'explanation',
    'Integration as building up; two viewpoints (reverse differentiation, area); their equivalence; methods: substitution and parts',
    U.understanding,
  ),
  item(
    'ch1-1.1-problem',
    '1.1',
    1,
    'explanation',
    'The basic problem: given f, find F with F′(x) = f(x) on an interval',
    U.understanding,
  ),
  item('ch1-def-1.1.1', '1.1', 1, 'definition', 'Definition 1.1.1: anti-derivative', U.understanding),
  item('ch1-1.1-ex-2x', '1.1', 1, 'worked-example', 'Example: an anti-derivative of 2x is x²', U.understanding),
  item('ch1-1.1-many', '1.1', 1, 'explanation', 'More than one anti-derivative: x² − 1 and x² + 10', U.understanding),
  item(
    'ch1-1.1-plus-c',
    '1.1',
    2,
    'derivation',
    'If F is an anti-derivative then so is F + C; G′ computation; F + C is a set of functions',
    U.understanding,
  ),
  item(
    'ch1-thm-1.1.1',
    '1.1',
    2,
    'theorem',
    'Theorem 1.1.1: equal derivatives on [a, b] differ by a constant',
    U.understanding,
  ),
  item('ch1-1.1-ex-a', '1.1', 2, 'worked-example', 'Examples (a): anti-derivative of 2x is x² + C', U.understanding),
  item(
    'ch1-1.1-ex-b',
    '1.1',
    2,
    'worked-example',
    'Examples (b): anti-derivative of 2x + 5 is x² + 5x + C',
    U.understanding,
  ),
  // §1.2 Indefinite Integral
  item(
    'ch1-1.2-notation',
    '1.2',
    2,
    'definition',
    'Notation ∫ f(x) dx = F(x) + C for the most general anti-derivative',
    U.understanding,
  ),
  item(
    'ch1-1.2-terms',
    '1.2',
    2,
    'definition',
    'Integral sign, indefinite integral, integrand, anti-differentiation/integration, constant of integration, ∫( )dx notation',
    U.understanding,
  ),
  item(
    'ch1-1.2-existence',
    '1.2',
    2,
    'explanation',
    'Question 1: does every function have an anti-derivative? Every continuous function does',
    U.understanding,
  ),
  item(
    'ch1-1.2-uniqueness',
    '1.2',
    3,
    'explanation',
    'Question 2: uniqueness; mean value theorem; anti-derivatives differ by a constant; hence "indefinite integral"',
    U.understanding,
  ),
  // §1.3 The Indefinite Integral of a Power
  item(
    'ch1-1.3-reverse',
    '1.3',
    3,
    'explanation',
    'Reversing the power rule: increase the exponent by 1 and divide by the new exponent',
    U.basicRules,
  ),
  item('ch1-1.3-power-rule', '1.3', 3, 'formula', 'Power rule for rational n ≠ −1', U.basicRules),
  item('ch1-1.3-proof', '1.3', 3, 'proof', 'Proof of the power rule by differentiation', U.basicRules),
  item('ch1-1.3-ex-x6', '1.3', 3, 'worked-example', 'Example (a): ∫ x⁶ dx', U.basicRules),
  item('ch1-1.3-ex-x-5', '1.3', 3, 'worked-example', 'Example (b): ∫ 1/x⁵ dx', U.basicRules),
  item('ch1-1.3-ex-sqrt', '1.3', 3, 'worked-example', 'Example: ∫ √x dx', U.basicRules),
  item(
    'ch1-1.3-sum-reason',
    '1.3',
    3,
    'explanation',
    'Sum property follows from the derivative of a sum',
    U.basicRules,
  ),
  item('ch1-thm-1.3.1', '1.3', 4, 'theorem', 'Theorem 1.3.1: integral of a sum or difference', U.basicRules),
  item('ch1-1.3-ex-sum', '1.3', 4, 'worked-example', 'Example: ∫ (x^(−1/2) + x⁴) dx', U.basicRules),
  item('ch1-thm-1.3.2', '1.3', 4, 'theorem', 'Theorem 1.3.2: constant multiple', U.basicRules),
  item('ch1-1.3-finite-sum', '1.3', 4, 'explanation', 'Any finite sum is integrated term by term', U.basicRules),
  item('ch1-1.3-ex-three-terms', '1.3', 4, 'worked-example', 'Example: ∫ (4x − 2x^(−1/3) + 5/x²) dx', U.basicRules),
  // §1.4 Some Anti-Differentiation Formulas (each formula listed)
  item('ch1-1.4-f1', '1.4', 4, 'formula', 'Formula 1: ∫ c f(x) dx = c ∫ f(x) dx', U.basicRules),
  item(
    'ch1-1.4-f2',
    '1.4',
    4,
    'formula',
    'Formula 2: ∫ [f(x) ± g(x)] = ∫ f dx ± ∫ g dx (printed without dx on the left)',
    U.basicRules,
  ),
  item('ch1-1.4-f3', '1.4', 4, 'formula', 'Formula 3: power rule, n ≠ −1', U.basicRules),
  item('ch1-1.4-f4', '1.4', 4, 'formula', 'Formula 4: ∫ a dx = ax + C', U.basicRules),
  item('ch1-1.4-f5', '1.4', 5, 'formula', 'Formula 5: ∫ cos x dx', U.basicRules),
  item('ch1-1.4-f6', '1.4', 5, 'formula', 'Formula 6: ∫ sin x dx', U.basicRules),
  item('ch1-1.4-f7', '1.4', 5, 'formula', 'Formula 7: ∫ sec²x dx', U.basicRules),
  item('ch1-1.4-f8', '1.4', 5, 'formula', 'Formula 8: ∫ eˣ dx', U.basicRules),
  item('ch1-1.4-f9', '1.4', 5, 'formula', 'Formula 9: ∫ 1/x dx = ln|x| + C', U.basicRules),
  item('ch1-1.4-f10', '1.4', 5, 'formula', 'Formula 10: ∫ 1/√(1 − x²) dx = sin⁻¹x + C', U.basicRules),
  item('ch1-1.4-f11', '1.4', 5, 'formula', 'Formula 11: ∫ 1/(1 + x²) dx = tan⁻¹x + C', U.basicRules),
  item('ch1-1.4-ex', '1.4', 5, 'worked-example', 'Example: ∫ (5/x − 2∛(x²)) dx', U.basicRules),
  // §1.5 u-Substitution
  item(
    'ch1-thm-1.5.1',
    '1.5',
    5,
    'theorem',
    'Theorem 1.5.1 (the indefinite integral of a power of a function / substitution)',
    U.substitution,
  ),
  item('ch1-1.5-ex-neg-power', '1.5', 5, 'worked-example', 'Example: ∫ x/(4x² + 3)⁶ dx', U.substitution),
  item('ch1-1.5-ex-cube', '1.5', 6, 'worked-example', 'Example: ∫ x(x² + 2)³ dx', U.substitution),
  item('ch1-1.5-yti-root', '1.5', 6, 'you-try-it', 'You Try It: ∫ ∛((7 − 2x³)⁴) x² dx', U.substitution),
  item('ch1-1.5-ex-sin10x', '1.5', 6, 'worked-example', 'Example: ∫ sin 10x dx', U.substitution),
  item('ch1-1.5-yti-sec', '1.5', 7, 'you-try-it', 'You Try It: ∫ sec²(1 − 4x) dx', U.substitution),
  // §1.6 Partial Fractions
  item(
    'ch1-1.6-intro',
    '1.6',
    7,
    'explanation',
    'Decomposition into simpler fractions; proper fractions; long division first when improper',
    U.partialFractions,
  ),
  item('ch1-1.6-rational', '1.6', 7, 'explanation', 'f(x) = P(x)/Q(x); four cases', U.partialFractions),
  item(
    'ch1-1.6-case-1',
    '1.6',
    7,
    'formula',
    'Case I: distinct linear factors (no factor repeated or a constant multiple of another)',
    U.partialFractions,
  ),
  item('ch1-1.6-case-2', '1.6', 7, 'formula', 'Case II: repeated linear factors', U.partialFractions),
  item(
    'ch1-1.6-case-3',
    '1.6',
    7,
    'formula',
    'Case III: irreducible quadratic factors, none repeated',
    U.partialFractions,
  ),
  item(
    'ch1-1.6-case-4',
    '1.6',
    8,
    'formula',
    'Case IV: repeated irreducible quadratic factor; terms integrated by completing the square',
    U.partialFractions,
  ),
  item('ch1-1.6-ex', '1.6', 8, 'worked-example', 'Example: ∫ (x + 7)/(x² − x − 6) dx', U.partialFractions),
  item('ch1-1.6-yti', '1.6', 8, 'you-try-it', 'You Try It: ∫ (2x + 1)/((x − 1)(x + 3)) dx', U.partialFractions),
  // §1.6.1 Integrating with Repeated Factors
  item(
    'ch1-1.6.1-ex',
    '1.6.1',
    8,
    'worked-example',
    'Example: ∫ (5x² + 20x + 6)/(x³ + 2x² + x) dx',
    U.partialFractions,
  ),
  item('ch1-1.6.1-yti', '1.6.1', 8, 'you-try-it', 'You Try It: ∫ (6x − 1)/(x³(2x − 1)) dx', U.partialFractions),
  // §1.6.2 Integrating an Improper Rational Function
  item('ch1-1.6.2-ex', '1.6.2', 9, 'worked-example', 'Example: ∫ (x⁵ + x − 1)/(x⁴ − x³) dx', U.partialFractions),
  item('ch1-1.6.2-yti', '1.6.2', 9, 'you-try-it', 'You Try It: ∫ (x³ − 2x)/(x² + 3x + 2) dx', U.partialFractions),
  // §1.6.3 Quadratic Factors
  item('ch1-1.6.3-ex-square', '1.6.3', 9, 'worked-example', 'Example: ∫ dx/(x² − 4x + 5)', U.partialFractions),
  item(
    'ch1-1.6.3-ex-linear-num',
    '1.6.3',
    9,
    'worked-example',
    'Example: ∫ (x + 3) dx/(x² − 4x + 5)',
    U.partialFractions,
  ),
  item('ch1-1.6.3-ex-mixed', '1.6.3', 10, 'worked-example', 'Example: ∫ (x + 1) dx/(x(x² + 1))', U.partialFractions),
  item('ch1-1.6.3-yti', '1.6.3', 10, 'you-try-it', 'You Try It: ∫ 4x/((x² + 1)(x² + 2x + 3)) dx', U.partialFractions),
  // §1.7 (Ax + B)/(ax² + bx + c), b² < 4ac
  item('ch1-1.7-intro', '1.7', 10, 'explanation', 'Why b² < 4ac means no real partial fractions', U.partialFractions),
  item(
    'ch1-1.7-known',
    '1.7',
    10,
    'formula',
    'The two known integrals: λ(2ax + b)/(ax² + bx + c) and μ/(β² + (x + α)²)',
    U.partialFractions,
  ),
  item(
    'ch1-1.7-derivation',
    '1.7',
    11,
    'derivation',
    'Ax + B = λ(2ax + b) + γ; completing the square; α, β; general result',
    U.partialFractions,
  ),
  item('ch1-1.7-ex', '1.7', 11, 'worked-example', 'Example 1.7.1: ∫ (2x − 3)/(x² − 2x + 5) dx', U.partialFractions),
  // §1.8 Algebraic Functions: substitution and rationalisation
  item(
    'ch1-1.8-intro',
    '1.8',
    12,
    'explanation',
    'Substitution reducing an algebraic integrand to a rational function; regarding part of it as y',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-ex-rationalise',
    '1.8',
    12,
    'worked-example',
    'Illustrative example ∫ (2x + 3 + 2√(4x + 1))/(5x − 7 − √(4x + 1)) dx with t = √(4x + 1)',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-framework',
    '1.8',
    12,
    'explanation',
    'Connect x and y through t: x = r₁(t), y = r₂(t), giving ∫ R(t) dt',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-name',
    '1.8',
    12,
    'explanation',
    'The method is called integration by substitution and rationalisation; table of suggested substitutions',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-table-note',
    '1.8',
    13,
    'note',
    'Table 1.1 note: θ restricted so the substitution is one-to-one',
    U.algebraicTrig,
  ),
  item('ch1-1.8-table-1', '1.8', 13, 'table-row', 'Table row: √(a² − x²) → x = a sin θ or a tanh θ', U.algebraicTrig),
  item('ch1-1.8-table-2', '1.8', 13, 'table-row', 'Table row: √(a² + x²) → x = a tan θ or a sinh θ', U.algebraicTrig),
  item('ch1-1.8-table-3', '1.8', 13, 'table-row', 'Table row: √(x² − a²) → x = a sec θ or a cosh θ', U.algebraicTrig),
  item('ch1-1.8-table-4', '1.8', 13, 'table-row', 'Table row: 1/(x(axᵐ + b)) → xᵐ = 1/t', U.algebraicTrig),
  item('ch1-1.8-table-5', '1.8', 13, 'table-row', 'Table row: 1/((x + p)√(ax² + b²)) → x + p = 1/t', U.algebraicTrig),
  item(
    'ch1-1.8-table-6',
    '1.8',
    13,
    'table-row',
    'Table row: functions of x and √(ax + b) → ax + b = u²',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-table-7',
    '1.8',
    13,
    'table-row',
    'Table row: functions of x and √((x − a)(x − b)) → x − b = (x − a)u²',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-table-8',
    '1.8',
    13,
    'table-row',
    'Table row: functions of x and √((x − a)(b − x)) → b − x = (x − a)u² or x = a cos²θ + b sin²θ',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-table-9',
    '1.8',
    13,
    'table-row',
    'Table row: functions of x and √(x² + bx + c), irreducible → x + √(x² + bx + c) = u',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.8-table-10',
    '1.8',
    13,
    'table-row',
    'Table row: fractional powers of x → x = uⁿ, n the LCM of the denominators',
    U.algebraicTrig,
  ),
  item('ch1-1.8-ex-1', '1.8', 13, 'worked-example', 'Example 1.8.1: ∫ 1/√(x² + a²) dx', U.algebraicTrig),
  item(
    'ch1-1.8-exercise-1',
    '1.8',
    13,
    'chapter-exercise',
    'Exercise 1.8.1: ∫ dx/(x²√(x² + 2x − 1)) (printed with dx twice)',
    U.algebraicTrig,
  ),
  // §1.8.1 (Ax + B)/√(ax² + 2bx + c)
  item(
    'ch1-1.8.1-method',
    '1.8.1',
    14,
    'derivation',
    'Method: d/dx √(ax² + 2bx + c); reduction to ∫ 1/√(x² ± a²) or ∫ 1/√(a² − x²); Ax + B = λ(ax + b) + μ',
    U.algebraicTrig,
  ),
  item('ch1-1.8.1-ex-2', '1.8.1', 14, 'worked-example', 'Example 1.8.2: ∫ x dx/√(x² + x + 1)', U.algebraicTrig),
  // §1.9 Rational Functions of Sine and Cosine
  item(
    'ch1-1.9-substitution',
    '1.9',
    15,
    'formula',
    't = tan(x/2); cos x, sin x and dx/dt in terms of t',
    U.algebraicTrig,
  ),
  item(
    'ch1-1.9-note',
    '1.9',
    15,
    'note',
    'NOTE: for rational functions of cos 2x, sin 2x, cos²x, sin²x use t = tan x',
    U.algebraicTrig,
  ),
  item('ch1-1.9-ex-1', '1.9', 15, 'worked-example', 'Example 1.9.1: ∫ dx/(2 + 2 sin x + cos x)', U.algebraicTrig),
  item('ch1-1.9-ex-2', '1.9', 16, 'worked-example', 'Example 1.9.2: ∫ dx/(5 + 3 cos x)', U.algebraicTrig),
  item('ch1-1.9-yti', '1.9', 16, 'you-try-it', 'You Try It, Exercise 1.9.1: ∫ dx/(5 + 4 cos x)', U.algebraicTrig),
  // §1.10 Integration by Parts
  item(
    'ch1-1.10-intro',
    '1.10',
    16,
    'explanation',
    'Use for products of algebraic and exponential/logarithmic functions; inverse of the product rule',
    U.byParts,
  ),
  item('ch1-1.10-derivation', '1.10', 17, 'derivation', 'From the product rule to ∫ u dv = uv − ∫ v du', U.byParts),
  item('ch1-1.10-ex-xex', '1.10', 17, 'worked-example', 'Example: ∫ x eˣ dx', U.byParts),
  item('ch1-1.10-ex-x2lnx', '1.10', 17, 'worked-example', 'Example: ∫ x² ln x dx', U.byParts),
  item('ch1-1.10-ex-lnx', '1.10', 17, 'worked-example', 'Example: ∫ ln x dx', U.byParts),
  item('ch1-1.10-yti', '1.10', 18, 'you-try-it', 'You Try It: ∫ x tan⁻¹x dx', U.byParts),
  // §1.11 Using Integration by Parts Repeatedly
  item('ch1-1.11-ex', '1.11', 18, 'worked-example', 'Example: ∫ x² eˣ dx (parts twice)', U.byParts),
  // §1.12 Reduction Formulas
  item(
    'ch1-1.12-definition',
    '1.12',
    18,
    'definition',
    'Reduction formulas express an integral through similar, simpler integrals',
    U.advancedPatterns,
  ),
  item(
    'ch1-1.12-ex-xnex',
    '1.12',
    18,
    'worked-example',
    'Example: derive ∫ xⁿeˣ dx = xⁿeˣ − n ∫ xⁿ⁻¹eˣ dx + C',
    U.advancedPatterns,
  ),
  item('ch1-1.12-ex-n12', '1.12', 19, 'worked-example', 'Using the reduction formula for n = 1, 2', U.advancedPatterns),
  item(
    'ch1-1.12-ex-sinn',
    '1.12',
    19,
    'worked-example',
    'Example: reduction formula for ∫ sinⁿx dx',
    U.advancedPatterns,
  ),
  // §1.13 Integration of Powers of Trigonometric Functions
  item(
    'ch1-1.13-intro',
    '1.13',
    19,
    'explanation',
    'Integrals of sinᵐx cosⁿx with trigonometric identities; two cases',
    U.advancedPatterns,
  ),
  item(
    'ch1-1.13-case-1',
    '1.13',
    20,
    'explanation',
    'Case 1: m odd — sinᵐx = sinᵐ⁻¹x sin x and sin²x = 1 − cos²x',
    U.advancedPatterns,
  ),
  item('ch1-1.13-ex-sin3', '1.13', 20, 'worked-example', 'Example: ∫ sin³x dx', U.advancedPatterns),
  item('ch1-1.13-ex-sin5cos2', '1.13', 20, 'worked-example', 'Example: ∫ sin⁵x cos²x dx', U.advancedPatterns),
  item(
    'ch1-1.13-n-odd',
    '1.13',
    20,
    'explanation',
    'n odd: same procedure, giving powers of sin x times cos x',
    U.advancedPatterns,
  ),
  item('ch1-1.13-ex-sin4cos3', '1.13', 20, 'worked-example', 'Example: ∫ sin⁴x cos³x dx', U.advancedPatterns),
  item('ch1-1.13-yti-sin2cos3', '1.13', 21, 'you-try-it', 'You Try It: ∫ sin²x cos³x dx', U.advancedPatterns),
  item(
    'ch1-1.13-case-2',
    '1.13',
    21,
    'explanation',
    'Case II: m and n even — identities sin x cos x = ½ sin 2x, sin²x, cos²x',
    U.advancedPatterns,
  ),
  item('ch1-1.13-ex-cos4', '1.13', 21, 'worked-example', 'Example: ∫ cos⁴x dx', U.advancedPatterns),
  item('ch1-1.13-yti-sin2cos2', '1.13', 21, 'you-try-it', 'You Try It: ∫ sin²x cos²x dx', U.advancedPatterns),
  item(
    'ch1-1.13-products-intro',
    '1.13',
    21,
    'explanation',
    'Instead of sin⁸x cos⁶x, suppose sin 8x cos 6x',
    U.advancedPatterns,
  ),
  item('ch1-1.13-ex-definite', '1.13', 21, 'worked-example', 'Example: ∫₀^2π sin 8x cos 6x dx', U.advancedPatterns),
  item(
    'ch1-1.13-sin-cos-identity',
    '1.13',
    22,
    'formula',
    'sin px cos qx = ½ sin(p + q)x + ½ sin(p − q)x',
    U.advancedPatterns,
  ),
  item(
    'ch1-1.13-sin-sin-cos-cos',
    '1.13',
    22,
    'formula',
    'sin px sin qx and cos px cos qx product formulas',
    U.advancedPatterns,
  ),
  item('ch1-1.13-yti-sin2xsin4x', '1.13', 22, 'you-try-it', 'You Try It: ∫ sin 2x sin 4x dx', U.advancedPatterns),
  // §1.14 (a cos x + b sin x + c)/(A cos x + B sin x + C)
  item('ch1-1.14-method', '1.14', 22, 'explanation', 'Write the numerator as p(D) + q D′ + r', U.advancedPatterns),
  item(
    'ch1-1.14-yti',
    '1.14',
    22,
    'you-try-it',
    'You Try It: ∫ (1 + cos x − 3 sin x)/(2 + 2 cos x − sin x) dx',
    U.advancedPatterns,
  ),
];

export const CHAPTER1_DOCUMENT = CH1;
