/**
 * Lecturer-review register for Topic 4 source material (approved audit,
 * flags MR4-01 to MR4-12).
 *
 * Every entry is INTERNAL metadata: the source is shown exactly as printed,
 * no correction is made, and learners are not shown a note disputing the
 * source (Topic 4 lesson blocks never carry `reviewIds`; the completeness
 * test checks this). Tutorial 5 has no answer key, so every app solution is
 * an APP-GENERATED SOLUTION, pending lecturer review. Tutorial 5 Q5(m)
 * (MR4-10) is a self-check written question with its app solution withheld.
 */
import type { ManualReviewItem } from '../integration/manualReview';
import type { SourceRef } from '../../types';

import { CH4, TUT5 } from './sources';

const ch = (section: string, item: string, page: number): SourceRef => ({ document: CH4, section, item, page });
const t5 = (item: string, page: number): SourceRef => ({ document: TUT5, item, page });
const AS_PRINTED = 'Shown exactly as printed. Internal flag only; no correction and no learner-facing dispute.';

export const PDA_MANUAL_REVIEW: readonly ManualReviewItem[] = [
  {
    id: 'MR4-01',
    category: 'sourceTypo',
    location: ch('4.1', 'Example 4.1.1, solution', 55),
    issue:
      'The evaluated gradient is printed "(2/1 + 2²)i + (ln 1 + 2(1)(2))i": the second unit vector should be j. The final answer 6i + 4j is correct.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-02',
    category: 'beyondNotes',
    location: [ch('4.1', 'Definition of the gradient', 55), ch('4.1', 'Example 4.1.2', 55), t5('Q2(iv)', 1)],
    issue:
      '§4.1 defines the gradient for functions of two variables only, but Example 4.1.2 and Tutorial 5 Q2(iv) use ∇f(x, y, z) = fx i + fy j + fz k without defining it.',
    handling:
      'The three-variable gradient is used as Example 4.1.2 uses it and is labelled as such in app guidance; no definition is added to the notes.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-03',
    category: 'sourceTypo',
    location: ch('4.2.1', 'Paragraph before Theorem 4.2.1', 56),
    issue: 'The point is introduced as "p = (x0, y0, z0)" (lower case) and then referred to as P.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-04',
    category: 'ambiguousNotation',
    location: ch('4.2.1', 'Theorem 4.2.1', 56),
    issue:
      'Theorem 4.2.1 is labelled a Theorem but titled "(Definition of Tangent Plane and Normal Line)" and states definitions.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-05',
    category: 'needsAssumptions',
    location: ch('4.2.1', 'Theorem 4.2.2', 56),
    issue:
      'Theorem 4.2.2 (Equation of Tangent Plane) does not restate the condition ∇F(x0, y0, z0) ≠ 0 given in Theorem 4.2.1.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-06',
    category: 'ambiguousNotation',
    location: [
      ch('4.3.1', 'Definition of Critical Point, item 2', 59),
      ch('4.3.1', 'Paragraph before Example 4.3.2', 60),
    ],
    issue:
      'The definition says "fx(x0, y0) and fy(x0, y0) does not exist", while the next page says "either fx(x, y) or fy(x, y) is undefined". "And" and "or" give different sets of critical points.',
    handling:
      'Shown exactly as printed. App practice on critical points uses only functions where both partial derivatives fail to exist together, so either reading gives the same answer.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-07',
    category: 'sourceTypo',
    location: ch('4.3.1', 'Sentence after Definition of Relative Extrema', 59),
    issue:
      '"To locate relative extreme of f" should read "extrema"; the same sentence calls only points where the gradient is 0 critical points, while the definition also includes points where the partial derivatives do not exist.',
    handling: AS_PRINTED,
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-08',
    category: 'ambiguousNotation',
    location: t5('Q5', 1),
    issue:
      'Tutorial 5 Q5 asks for "stationary points", while the notes define "critical points". For the Q5 functions (all differentiable everywhere) the two sets are the same.',
    handling:
      'The question is shown as printed ("stationary points"); app guidance refers to the critical points of §4.3.1. Internal flag only.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-09',
    category: 'scope',
    location: ch('4.3.1', 'Theorem 4.3.1 (Extreme Value Theorem)', 58),
    issue:
      'The Extreme Value Theorem and absolute extrema are stated, but no method, worked example or tutorial question for absolute extrema on a closed region is given. Are they examinable?',
    handling: 'The theorem is shown as printed. The app teaches no method for absolute extrema.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-10',
    category: 'scope',
    location: t5('Q5(m)', 2),
    issue:
      'For f = (x² − 2x + 4y² − 8y)², every point of the ellipse (x − 1)² + 4(y − 1)² = 5 is a critical point with d = 0 (the Second Partials Test is inconclusive there), and (1, 1) is a relative maximum. The notes give no method beyond "inconclusive". What answer is expected?',
    handling:
      'Q5(m) is shown as printed as a written, self-check question: no automatic marking, and its app solution is withheld until the lecturer gives guidance.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-11',
    category: 'noAnswerKey',
    location: t5('Q5(i)', 1),
    issue:
      'Q5(i) has six critical points, two of them with irrational coordinates (0, (−8 ± 2√61)/9). Please confirm this is intended.',
    handling:
      'Answers are checked numerically (exact forms are accepted). The APP-GENERATED SOLUTION is pending lecturer review.',
    blocksLearnerUse: false,
    status: 'open',
  },
  {
    id: 'MR4-12',
    category: 'beyondNotes',
    location: ch('4.1', 'The gradient', 55),
    issue:
      'The notes do not state that the gradient points in the direction of steepest ascent or that it is perpendicular to level curves (only that ∇F is orthogonal to curves on a surface, §4.2.1). May Explore show and say this as app guidance?',
    handling:
      'Until approved, Explore and Create describe the gradient only by its definition (its components fx and fy) and make no steepest-ascent or level-curve claims.',
    blocksLearnerUse: false,
    status: 'open',
  },
];
