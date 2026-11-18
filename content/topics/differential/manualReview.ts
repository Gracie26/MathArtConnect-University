/**
 * Manual-review register for Topic 3 source material (approved audit and
 * decisions 5–13).
 *
 * Every entry is INTERNAL metadata: the source is shown exactly as printed,
 * no correction is made, and learners are not shown a note disputing the
 * source (Topic 3 lesson blocks never carry `reviewIds`; the completeness
 * test checks this). No Topic 3 practice item is withheld: questions whose
 * intent is unclear are answered in written My Working instead of being
 * auto-graded. App-written walkthroughs are labelled as app guidance.
 */
import type { ManualReviewItem } from '../integration/manualReview';
import type { SourceRef } from '../../types';

import { CH3, TUT3, TUT4 } from './sources';

const ch = (section: string, item: string, page: number): SourceRef => ({ document: CH3, section, item, page });
const t3 = (item: string, page: number): SourceRef => ({ document: TUT3, item, page });
const t4 = (item: string, page: number): SourceRef => ({ document: TUT4, item, page });
const AS_PRINTED = 'Shown exactly as printed. Internal flag only; no correction and no learner-facing dispute.';

export const RN_MANUAL_REVIEW: readonly ManualReviewItem[] = [
  {
    id: 'MR3-01',
    category: 'sourceTypo',
    location: ch('3.2.1', 'Footnote 1', 44),
    issue:
      'Footnote 1 reads "Between 1760, Leonhard Euler and Jean Le Rond d’Alembert (1717-1783) separately published…": the year range is incomplete and Euler’s dates are not given.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-02',
    category: 'needsAssumptions',
    location: ch('3.2.3', 'Theorem 3.2.1', 48),
    issue:
      'Theorem 3.2.1 is stated with the hypothesis "fx and fy are continuous on an open disc R"; standard statements of Clairaut’s Theorem assume the mixed partials fxy and fyx are continuous.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-03',
    category: 'ambiguousNotation',
    location: ch('3.2.3', 'Higher-Order Partial Derivatives, cases 3 and 4', 47),
    issue:
      'The notes define fxy = ∂/∂y(∂f/∂x) = ∂²f/∂y∂x (differentiate with respect to x first) and fyx = ∂²f/∂x∂y. Tutorial items written with ∂²f/∂x∂y, and Tutorial 4 Q8(c), depend on this convention.',
    handling:
      'Notation preserved exactly. Any automatic checking uses the notes’ convention (recorded in the practice data). Internal flag only.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-04',
    category: 'sourceTypo',
    location: ch('3.4', 'Example 3.4.4', 51),
    issue: 'The working of ∂w/∂s contains a stray parenthesis: "= (y + z)(cos t)+)(x + z)(sin t) + (y + x)(0)".',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-05',
    category: 'scope',
    location: ch('3.4', 'Example 3.4.6', 52),
    issue:
      'The question asks for ∂u/∂y, ∂v/∂x and ∂v/∂y, but the printed solution also derives ∂u/∂x and uses it in the verification.',
    handling: 'Example and solution kept exactly as printed, including ∂u/∂x. Internal flag only.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-06',
    category: 'sourceTypo',
    location: ch('3.4', 'Example 3.4.6, verification', 53),
    issue:
      'The verification is printed as ∂u/∂x·∂v/∂x + ∂u/∂y·∂v/∂y = −uv/(u² + v²) + uv/(u² + v²) = 0; the products of the printed partial derivatives have denominator (u² + v²)². The conclusion (= 0) is unaffected.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T1',
    category: 'ambiguousNotation',
    location: t3('Q8', 1),
    issue: 'Q8 defines z = x² tan⁻¹(y/x) but parts (i) and (ii) ask for ∂f/∂x and ∂f/∂y.',
    handling:
      'Reproduced exactly as printed. Parts (i) and (ii) are not auto-graded (written My Working); part (iii) asks for ∂²z/∂x∂y and is checked.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T2',
    category: 'uncertainExpression',
    location: t3('Q19', 3),
    issue: 'Q19 asks for the function k(y, z), but part (i) is printed as ∂f/∂x = y^z x^{k(z,z)}.',
    handling:
      'Reproduced exactly as printed. Part (i) is not auto-graded (written My Working); parts (ii) and (iii) determine g and h unambiguously and are checked.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T3',
    category: 'beyondNotes',
    location: t3('Q18', 3),
    issue:
      'Q18 asks for second and mixed partial derivatives "using the definition of partial derivative"; Chapter 3 gives a limit definition only for first partial derivatives.',
    handling:
      'Question preserved. Final derivatives are checked; the method is written My Working. The app walkthrough says it applies the first-partial definition repeatedly and is app guidance.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T4',
    category: 'scope',
    location: t3('Q17', 3),
    issue:
      'Q17 differentiates integrals with variable limits, which uses the Fundamental Theorem of Calculus from Chapter 2 together with the chain rule.',
    handling:
      'Documented cross-topic dependency (not a blocker): kept in Topic 3 with a prerequisite note linking to Topic 2, The Fundamental Theorem of Calculus.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T5',
    category: 'beyondNotes',
    location: [t4('Q7', 1), t4('Q8', 1)],
    issue:
      'Q7 and Q8 use piecewise functions at (0, 0); Chapter 3 does not develop limits or continuity of functions of several variables.',
    handling:
      'Kept in Topic 3 as "Advanced tutorial practice", preserved exactly; values are checked and existence arguments are written. No new lesson on limits and continuity is added.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T6',
    category: 'ambiguousNotation',
    location: t4('Q8(c)', 2),
    issue:
      'The values of fxy(0, 0) and fyx(0, 0) depend on the mixed-partial convention (see MR3-03). With the notes’ convention, fxy(0, 0) = −1 and fyx(0, 0) = 1.',
    handling: 'Question preserved exactly; checked with the notes’ convention. Internal flag only.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T7',
    category: 'scope',
    location: ch('3.3', 'Total Differential', 48),
    issue: 'Neither Tutorial 3 nor Tutorial 4 has a question on the total differential (§3.3).',
    handling:
      'Three clearly labelled APP PRACTICE items (AP3-1, AP3-2, AP3-3) follow the formulas and Example 3.3.1; they are never presented as tutorial questions.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T8',
    category: 'noAnswerKey',
    location: [t3('Q1', 1), t4('Q1', 1)],
    issue: 'Tutorials 3 and 4 have no answer key. Every hint, walkthrough and suggested working is app-authored.',
    handling:
      'All app-authored solutions are stored with solutionStatus "pendingLecturerReview" and shown only as "App walkthrough" / "Suggested working", never as an official solution.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR3-T9',
    category: 'needsAssumptions',
    location: t3('Q17(v)', 3),
    issue:
      'Q17(v) defines f(x, y) = ∫ from 0 to e^y of (1 − ln t)/t dt, but the integrand is unbounded at t = 0 and this integral diverges, so f is not defined as printed. Formally applying the Fundamental Theorem gives fy = 1 − y.',
    handling:
      'Reproduced exactly as printed. Not auto-graded (written My Working); the suggested working notes the formal result. Internal flag only.',
    blocksLearnerUse: false,
    status: 'open',
  },
];

/** True when any of the given review items currently blocks learner use (none do in Topic 3). */
export function blocksLearnerUse(reviewIds: readonly string[]): boolean {
  return reviewIds.some((id) => {
    const entry = RN_MANUAL_REVIEW.find((m) => m.id === id);
    return entry !== undefined && entry.status === 'open' && entry.blocksLearnerUse;
  });
}
