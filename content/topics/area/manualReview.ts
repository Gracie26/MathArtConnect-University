/**
 * Manual-review register for Topic 2 source material (approved audit).
 *
 * Source issues are never corrected silently. Lesson material under review
 * is shown exactly as printed with an "awaiting lecturer review" note;
 * practice items whose question itself is in doubt are withheld from
 * learners (`blocksLearnerUse`) until the lecturer resolves them.
 */
import type { ManualReviewItem } from '../integration/manualReview';
import type { SourceRef } from '../../types';

import { CH2, TUT2 } from './sources';

const ch = (section: string, item: string, page: number): SourceRef => ({ document: CH2, section, item, page });
const tut = (item: string, page: number): SourceRef => ({ document: TUT2, item, page });
const SHOWN_AS_PRINTED = 'Shown exactly as printed, with a visible note that it is awaiting lecturer review.';

export const AREA_MANUAL_REVIEW: readonly ManualReviewItem[] = [
  {
    id: 'MR2-01',
    category: 'sourceTypo',
    location: ch('2.2', 'CASE II', 26),
    issue:
      'Case II (left endpoint) gives the height as f(xᵢ) and the area of the ith rectangle as f(xᵢ)Δx, but Lₙ = f(x₀)Δx + … + f(xₙ₋₁)Δx uses the left endpoints xᵢ₋₁.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-02',
    category: 'sourceTypo',
    location: ch('2.2', 'CASE III', 27),
    issue: 'Case III says "the area of the ith rectangle is f(xᵢ)Δx", but Cₙ uses the sample points, f(xᵢ*)Δx.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-03',
    category: 'sourceTypo',
    location: ch('2.2.2', 'Introduction', 30),
    issue: '"The following two definitions" introduces items labelled Theorem 2.2.2 and Theorem 2.2.3.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-04',
    category: 'scope',
    location: ch('2.2.2', 'Example', 31),
    issue:
      'The unlabelled "Example: By definition ∫₁¹(x³ + 3x)dx = 0" illustrates Theorem 2.2.2 but is printed after Theorem 2.2.3.',
    handling: 'Kept in its printed position, with a review note.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-05',
    category: 'sourceTypo',
    location: ch('2.4', 'Definition 2.4.1', 34),
    issue: 'Printed as "If is integrable on the closed interval [a, b]": the function f is missing.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-06',
    category: 'sourceTypo',
    location: ch('2.5.1', 'Area interpretation', 36),
    issue:
      '"Any of the improper integrals in the Definition 2.5.3" refers to the Type I cases, which are Definition 2.5.1 (Definition 2.5.3 is a Type II definition).',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-07',
    category: 'ambiguousNotation',
    location: ch('2.3', 'Solution 2.3.3', 33),
    issue: 'Writes d/du[∫_{π/3}^{x³} cos t dt] before replacing x³ by u.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-08',
    category: 'sourceTypo',
    location: ch('2.3', 'Remark 2.3.3', 33),
    issue: 'Repeated word: "points out that that if we first integrate f".',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR2-T1',
    category: 'uncertainExpression',
    location: tut('Q3', 1),
    issue:
      'The integrand is written in x but the differential is dt. If intentional, the integrand is constant in t and the answer is 3 times it; read as a dx integral it is undefined on [1, 4] (x³ − 4x² + 5 = 0 at x = (5 ± √5)/2, and tan x, sec x are unbounded at x = π/2).',
    handling:
      'Stored exactly as printed; withheld from learner practice until the lecturer confirms the intended question.',
    blocksLearnerUse: true,
    status: 'open',
  },
  {
    id: 'MR2-T2',
    category: 'scope',
    location: tut('Q8(d)', 2),
    issue:
      '∫₀¹ ln x dx is unbounded at x = 0, so it is an improper integral, while Question 8 asks for limits of Riemann sums (which the chapter defines for a bounded integrand).',
    handling:
      'Stored exactly as printed; withheld from learner practice until the lecturer confirms the intended exercise.',
    blocksLearnerUse: true,
    status: 'open',
  },
  {
    id: 'MR2-SOL',
    category: 'noAnswerKey',
    location: [tut('Q2', 1), { document: CH2, section: '2.2.1', item: 'Exercise 2.2.1', page: 30 }],
    issue: 'Tutorial 2 and Exercise 2.2.1 have no printed answers. Every hint and walkthrough is app-authored.',
    handling:
      'All app-authored solutions are stored with solutionStatus "pendingLecturerReview" and shown only as clearly labelled app guidance.',
    blocksLearnerUse: false,
    status: 'open',
  },
];

/** True when any of the given review items currently blocks learner use. */
export function blocksLearnerUse(reviewIds: readonly string[]): boolean {
  return reviewIds.some((id) => {
    const entry = AREA_MANUAL_REVIEW.find((m) => m.id === id);
    return entry !== undefined && entry.status === 'open' && entry.blocksLearnerUse;
  });
}
