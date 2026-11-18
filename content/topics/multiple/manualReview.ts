/**
 * Lecturer-review register for Topic 5 source material (approved audit,
 * flags MR5-01 to MR5-23, and MR5-24 found during implementation).
 *
 * Every entry is INTERNAL metadata. The official text and figures are shown
 * exactly as printed and are never silently corrected. Where a learner would
 * otherwise be misled, a separate block labelled APP GUIDANCE (written for
 * this app, pending lecturer review) explains the point next to the printed
 * text; the printed text itself is unchanged. Tutorial 6 has no answer key, so
 * every app solution is an APP-GENERATED SOLUTION, pending lecturer review.
 */
import type { ManualReviewItem } from '../integration/manualReview';
import type { SourceRef } from '../../types';

import { CH5, TUT6 } from './sources';

const ch = (section: string, item: string, page: number): SourceRef => ({ document: CH5, section, item, page });
const t6 = (item: string, page: number): SourceRef => ({ document: TUT6, item, page });
const AS_PRINTED = 'Shown exactly as printed. Internal flag only; the printed text is not changed.';
const WITH_GUIDANCE =
  'Shown exactly as printed, followed by a short APP GUIDANCE note (written for the app, pending lecturer review). The printed text is not changed.';

export const MI_MANUAL_REVIEW: readonly ManualReviewItem[] = [
  {
    id: 'MR5-01',
    category: 'sourceTypo',
    location: ch('5.1', 'Opening calculation of f(x, y) from fx = 2xy', 62),
    issue:
      'The line "= y(x²) + C(y)" is followed by "= x² + C(y)": the factor y is dropped. The calculation just below uses x²y (∫₁^{2y} 2xy dx = x²y |₁^{2y}).',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-02',
    category: 'ambiguousNotation',
    location: ch('5.1.1', 'Figure 5.2', 64),
    issue:
      'On the y-axis of Figure 5.2 the mark at the top of the region is labelled "y²" where the height y = 2 appears to be meant; the boundary curve x = y² is not labelled.',
    handling:
      'Figure 5.2 is redrawn with its labels as printed. A separate Math View drawing made for the app (labelled as such) shows the region with numbered axes and labelled boundaries.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-03',
    category: 'sourceTypo',
    location: [ch('5.1.1', 'Figure 5.2 caption', 64), ch('5.1.1', 'Figure 5.3 caption', 65)],
    issue:
      'Figures 5.2 and 5.3 are captioned "Fig 1" and "Fig 2" (placeholder captions); Figure 5.3 has no mark at x = 4.',
    handling: 'Captions shown as printed. The app-made Math View drawing marks x = 4.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-04',
    category: 'sourceTypo',
    location: ch('5.1.1', 'Example 5.1.5, solution, second line', 66),
    issue:
      'The second line reads "[½y²]₀² x e^{x³}" where [½y²]₀^{2x} e^{x³} appears to be meant. The next line (2x²e^{x³}) and the final answer (2/3)(e − 1) are correct.',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-05',
    category: 'sourceTypo',
    location: ch('5.2.1', 'Example 5.2.1, solution, first integral on page 68', 68),
    issue:
      'The integral is printed with limits ∫₁⁰ (reversed); the rest of the working uses ∫₀¹ and the value (e − 1)/(2e) is for ∫₀¹.',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-06',
    category: 'ambiguousNotation',
    location: ch('5.2.1', 'Example 5.2.1', 67),
    issue:
      '"The solid region R" reuses R, which names the plane base region in the definitions above. The final value is printed as 0.316 (rounded; exactly (e − 1)/(2e) ≈ 0.31606).',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-07',
    category: 'ambiguousNotation',
    location: ch('5.3', 'Evaluation by Iterated Integrals', 68),
    issue: 'The iterated integral on the right ends with "f(x, y, z) dV" instead of dz dy dx.',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-08',
    category: 'sourceTypo',
    location: ch('5.3', 'Example 5.3.1, final line', 69),
    issue:
      'The printed final answer (19/6)(e²/3 + 1) ≈ 10.97 does not follow from the line before it: (19/6)[eˣ(x³ − 3x² + 6x − 6)]₀² = (19/6)(2e² + 6) = 19(e²/3 + 1) ≈ 65.80 (confirmed numerically by the app). The working up to that line is correct.',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-09',
    category: 'sourceTypo',
    location: ch('5.3', 'Example 5.3.2', 69),
    issue: 'The triple integral over T is written with a double-integral sign ∬_T, and one line begins "= =".',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-10',
    category: 'sourceTypo',
    location: ch('5.4.1', 'Transformation T', 71),
    issue: 'T(u, v) = (x, y) = (g(u, x), h(u, v)): "g(u, x)" appears to mean g(u, v).',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-11',
    category: 'needsAssumptions',
    location: ch('5.4.1', 'Example 5.4.3', 72),
    issue:
      '"R is the plane bounded by …": the hyperbolas xy = 1, xy = 3, x² − y² = 1, x² − y² = 4 bound two congruent regions (first and third quadrants); the answer 3 is the integral over one of them. The Jacobian found is negative and its absolute value is used without saying so.',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-12',
    category: 'needsAssumptions',
    location: ch('5.4.1', 'Example 5.4.4', 73),
    issue: 'The quadrant is not stated; xy^1.4 needs y > 0, so the first-quadrant region is implied.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-13',
    category: 'ambiguousNotation',
    location: [
      ch('5.4.1', 'Double integral with the Jacobian factor', 70),
      ch('5.4.1', 'Definition of the Jacobian', 70),
    ],
    issue:
      'The display on page 70 labels the absolute value |∂x/∂u ∂y/∂v − ∂y/∂u ∂x/∂v| "Jacobian", while the Definition of the Jacobian defines it without absolute value (and Theorem 5.4.1 uses its absolute value).',
    handling: WITH_GUIDANCE,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-14',
    category: 'beyondNotes',
    location: [ch('5.4.1', 'Polar change of variables', 71), t6('Q18, Q21, Q25, Q28', 2)],
    issue:
      'Polar coordinates appear only through Example 5.4.1 and the polar formula; the notes have no example of describing a region with polar limits (r and θ), which Tutorial 6 Q18, Q21, Q25 and Q28 need. Q28 does not name a method and is placed with the polar questions.',
    handling:
      'Describing regions in polar coordinates is taught as APP GUIDANCE (written for this app, pending lecturer review). Please confirm, and confirm the placement of Q28.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-15',
    category: 'beyondNotes',
    location: [t6('Q25', 3), t6('Q29', 3)],
    issue:
      'Q25 is an improper double integral over the first quadrant, and the integrand of Q29 is unbounded at (a, 0) and (0, a). Chapter 5 does not treat improper multiple integrals.',
    handling:
      'Both questions stay in practice (Q25 is partly graded); their APP-GENERATED SOLUTIONS say where the reasoning goes beyond the notes. Pending lecturer guidance.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-16',
    category: 'needsAssumptions',
    location: t6('Q12', 2),
    issue:
      'The answer form (a/b) ln b is not unique: (a, b) = (1, 3), (3/2, 9) and (3, 27) all give (1/3) ln 3. The intended answer is probably a = 1, b = 3.',
    handling: 'Every pair that gives the correct value is accepted. Please confirm the intended answer.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-17',
    category: 'needsAssumptions',
    location: [t6('Q4', 1), t6('Q5', 1), t6('Q13', 2), t6('Q17', 2)],
    issue:
      'The constants are presumably integers (or a fraction in lowest terms) but this is not stated; in Q4 the value of b is negative (b = −3).',
    handling: 'Answers are graded by the value they give in the printed form, so every valid choice is accepted.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-18',
    category: 'ambiguousNotation',
    location: t6('Q26', 3),
    issue: 'Q26 writes "log(y + a)"; the natural logarithm is assumed, with a > 0.',
    handling: 'Graded with the natural logarithm; the APP-GENERATED SOLUTION states the assumption.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-19',
    category: 'needsAssumptions',
    location: t6('Q1(iii)', 1),
    issue:
      'The lower limit e^y is greater than the upper limit y for every y, and ln needs y > 0. The integral is valid but please confirm it is intended.',
    handling: 'Graded as printed (for y > 0).',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-20',
    category: 'scope',
    location: [t6('Q15(vii)', 2), ch('5.2.1', 'Example 5.2.1', 67)],
    issue:
      'Q15(vii) is the integral of Example 5.2.1 in the order dx dy, which is worked in the notes. Keep it as practice?',
    handling: 'Kept as practice; the app solution points to Example 5.2.1.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-21',
    category: 'beyondNotes',
    location: [t6('Q3', 1), t6('Q4', 1), ch('5.1', 'Order of integration', 64)],
    issue:
      'Q3 and Q4 are easiest after switching the order over a rectangle. The notes state only that "the order of integration affects the ease of integration, but not the value" (no theorem for rectangles). Is that enough justification?',
    handling: 'The app solutions cite that statement (§5.1).',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-22',
    category: 'scope',
    location: ch('5.1.1', 'Comparing Different Orders of Integration', 64),
    issue:
      'The notes never split a region into pieces to reverse an order. No Tutorial 6 item needs a split (checked), and the app generates no split-region problems.',
    handling: 'Practice, games and the Strip Region Studio use only regions with a single description in each order.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-23',
    category: 'noAnswerKey',
    location: t6('All questions', 1),
    issue: 'Tutorial 6 has no answer key.',
    handling:
      'Hints and step-by-step help are APP GUIDANCE; full worked answers are APP-GENERATED SOLUTIONS, pending lecturer review. Every answer is verified numerically by the app.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR5-24',
    category: 'needsAssumptions',
    location: [t6('Q24', 3), t6('Q32', 4)],
    issue:
      'Found during implementation. The quadrant is not stated: in Q24 the curves x² − y² = 1, 2 and the lines 2y = x, 5y = x bound two congruent regions (x > 0 and x < 0), and because x(x² − y²)^½ is odd the two integrals cancel; in Q32, xy = 4, 8 and xy³ = 5, 15 also bound a region in each of the first and third quadrants. As in Example 5.4.4 (MR5-12), the first-quadrant region appears intended.',
    handling: 'Graded for the first-quadrant region; the APP-GENERATED SOLUTIONS state the assumption. Please confirm.',
    blocksLearnerUse: false,
    status: 'open',
  },
];
