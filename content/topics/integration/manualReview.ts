/**
 * Manual-review register for Topic 1 source material.
 *
 * Every ambiguity found when reading the source (Phase 0 audit and the
 * complete re-read for the completeness pass) is recorded here and stays open
 * until a lecturer resolves it. Source typos are never corrected silently.
 * The app either shows the item exactly as printed, with a visible "awaiting
 * lecturer review" note, or withholds it from learner practice
 * (`blocksLearnerUse: true`) until resolved.
 */
import type { SourceRef } from '../../types';

import { CH1, TUT1 } from './sources';

export type ReviewCategory =
  | 'sourceTypo'
  | 'ambiguousNotation'
  | 'uncertainExpression'
  | 'beyondNotes'
  | 'needsAssumptions'
  | 'noAnswerKey'
  | 'scope';

export interface ManualReviewItem {
  id: string;
  category: ReviewCategory;
  location: SourceRef | SourceRef[];
  issue: string;
  /** How the app currently handles it. */
  handling: string;
  /** True while the item must not appear in learner practice. */
  blocksLearnerUse: boolean;
  status: 'open' | 'resolved';
}

const tut = (item: string, page: number): SourceRef => ({ document: TUT1, item, page });
const SHOWN_AS_PRINTED = 'Shown exactly as printed, with a visible note that it is awaiting lecturer review.';

export const MANUAL_REVIEW_REGISTER: readonly ManualReviewItem[] = [
  {
    id: 'MR-01',
    category: 'sourceTypo',
    location: tut('Q10', 2),
    issue: 'Printed as "In|sec x + tan x| = In|tan(¼π + ½x)|"; "In" reads as the natural logarithm ln.',
    handling: 'Stored exactly as printed; withheld from learner practice until the intended notation is confirmed.',
    blocksLearnerUse: true,
    status: 'open',
  },
  {
    id: 'MR-02',
    category: 'sourceTypo',
    location: { document: CH1, section: '1.8', item: 'Exercise 1.8.1', page: 13 },
    issue: 'Integral printed with "dx" twice: ∫ dx / (x²√(x²+2x−1)) dx.',
    handling: 'Stored exactly as printed; withheld from learner practice until confirmed.',
    blocksLearnerUse: true,
    status: 'open',
  },
  {
    id: 'MR-03',
    category: 'sourceTypo',
    location: { document: CH1, section: '1.12', item: 'Reduction formula for xⁿeˣ', page: 19 },
    issue: 'States "du = nxⁿ⁻¹" without dx, and attaches "+ C" to the reduction formula itself.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-04',
    category: 'sourceTypo',
    location: { document: CH1, section: '1.12', item: 'Reduction formula for sinⁿx', page: 19 },
    issue:
      'Writes "dv = sin x" without dx, and the line "(n−1)[∫sinⁿ⁻²x dx − sinⁿx dx]" is missing the second integral sign. The final formula is printed correctly.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-05',
    category: 'sourceTypo',
    location: { document: CH1, section: '1.13', item: 'Example ∫sin⁴x cos³x dx', page: 21 },
    issue: 'Line "∫sin⁴x(cos x) dx − sin⁶x(cos x) dx" is missing the second integral sign.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-06',
    category: 'ambiguousNotation',
    location: { document: CH1, section: '1.8.1', page: 14 },
    issue:
      'The letter a is used both as the coefficient in ax²+2bx+c and as the constant in √(x² ± a²); "the substitution y + √a x = t" uses y, which is not defined in this section.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-07',
    category: 'uncertainExpression',
    location: { document: CH1, section: '1.8', item: 'Table 1.1, row 5', page: 13 },
    issue:
      'Row "1/((x+p)√(ax²+b²))" with substitution x + p = 1/t: the radicand form is unusual and the intended expression cannot be confirmed.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-08',
    category: 'scope',
    location: { document: CH1, section: '1.13', item: 'Example ∫₀^2π sin 8x cos 6x dx', page: 21 },
    issue: 'A definite integral is evaluated, but definite integrals are not defined in Chapter 1.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-09',
    category: 'sourceTypo',
    location: { document: CH1, section: '1.8', item: 'Worked example with t = √(4x+1)', page: 12 },
    issue: 'Printed as "2t = 4 dx" (missing dt) before the correct "dx = ½t dt".',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-10',
    category: 'ambiguousNotation',
    location: { document: CH1, section: '1.7', page: 10 },
    issue: 'Formula ∫μ/(β²+(x+α)²) dx = (μ/β) tan⁻¹((x+α)/β) is printed without a constant of integration.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-11',
    category: 'ambiguousNotation',
    location: { document: CH1, section: '1.6.1', item: 'Example with repeated factors', page: 8 },
    issue: 'C is used both as a partial-fraction coefficient (C = 9) and as the constant of integration.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-12',
    category: 'beyondNotes',
    location: [
      tut('Q3(viii)', 1),
      tut('Q8(xi)', 2),
      tut('Q8(xii)', 2),
      tut('Q8(xiv)', 2),
      tut('Q8(xv)', 2),
      tut('Q9(i)', 2),
      tut('Q10', 2),
      tut('Q11(ii)', 2),
      tut('Q11(iv)', 2),
      tut('Q11(viii)', 2),
    ],
    issue:
      'These questions need methods not developed in the Chapter 1 notes (∫dx/(x²+4)², triple products, powers of tan/sec, the derivation of ∫sec, cyclic integration by parts, ∫sec³x).',
    handling:
      'Kept under the closest subtopic and labelled "Extension" for learners. Any extra instruction will be labelled as app-supported extension material, not UNAM content.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-13',
    category: 'needsAssumptions',
    location: [tut('Q1(iv)', 1), tut('Q6', 1), tut('Q7(xviii)', 2), tut('Q11(iv)', 2)],
    issue:
      'Questions with general constants (a, b, μ, α, β, p) need stated assumptions (e.g. a ≠ 0, β ≠ 0) for solutions and automatic checking. (Q9(v) states its own assumption a > b > 0, so it is not listed.)',
    handling: 'Withheld from learner practice until the assumptions are confirmed.',
    blocksLearnerUse: true,
    status: 'open',
  },
  {
    id: 'MR-14',
    category: 'noAnswerKey',
    location: [{ document: TUT1 }, { document: CH1, item: 'You Try It and exercises' }],
    issue:
      'Tutorial 1 provides questions only, and the chapter "You Try It" items and exercises have no printed solutions. Every such solution in the app is app-authored.',
    handling:
      'All these solutions are stored with solutionStatus "pendingLecturerReview" and hidden from learners until approved, even when verified by differentiation.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-15',
    category: 'sourceTypo',
    location: { document: CH1, section: '1.4', item: 'Formula 2', page: 4 },
    issue: 'Printed as "∫[f(x) ± g(x)] = ∫f(x)dx ± ∫g(x)dx", without dx on the left-hand side.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR-16',
    category: 'sourceTypo',
    location: { document: CH1, section: '1.8.1', item: 'Solution 1.8.2', page: 15 },
    issue:
      'Intermediate line "ln|sec(tan⁻¹(x + ½)) + (2/√3)(x + ½)|": with u = (√3/2) tan θ the argument of tan⁻¹ should be (2/√3)(x + ½). The next line and the final answer are printed correctly.',
    handling: SHOWN_AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
];

/** True when any of the given review items currently blocks learner use. */
export function blocksLearnerUse(reviewIds: readonly string[]): boolean {
  return reviewIds.some((id) => {
    const entry = MANUAL_REVIEW_REGISTER.find((m) => m.id === id);
    return entry !== undefined && entry.status === 'open' && entry.blocksLearnerUse;
  });
}
