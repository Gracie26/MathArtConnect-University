/**
 * Source traceability for Topic 3 (internal; never shown as the main learner label).
 *
 * Primary sources (University of Namibia, S3512MC Calculus II, 2026):
 *   - Chapter 3 notes "Differential Calculus in ℝⁿ", printed pages 43–54
 *     (the chapter ends after Example 3.4.7; there are no exercises or
 *     "You Try It" items)
 *   - Tutorial 3 "Differential Calculus in ℝⁿ Part 1", 24 August 2026
 *     (Dr J. Mushanyu): 19 questions, 125 printed parts, no answer key
 *   - Tutorial 4 "Differential Calculus in ℝⁿ Part 2", 07 September 2026
 *     (Dr J. Mushanyu): 37 questions, 41 printed parts, no answer key
 *
 * Every Tutorial 3 and Tutorial 4 item belongs to Topic 3 (approved audit):
 * none uses tangent planes, gradients, directional derivatives, extrema or
 * Lagrange multipliers, which belong to Topic 4.
 */
import type { SourceRef } from '../../types';

import { RN_UNITS as U, type RnUnitId } from './ids';

export const CH3 = 'unam-s3512mc-ch3-notes-2026' as const;
export const TUT3 = 'unam-s3512mc-tut3-2026' as const;
export const TUT4 = 'unam-s3512mc-tut4-2026' as const;

export const SOURCE_DOCUMENTS = {
  [CH3]: {
    title: 'S3512MC Calculus II, Chapter 3 Notes: Differential Calculus in ℝⁿ (2026)',
    fileName: 'S3512MC___CALCULUS II_CHAPTER 3__NOTES_2026.pdf',
    institution: 'University of Namibia',
  },
  [TUT3]: {
    title: 'S3512MC Calculus II, Tutorial 3: Differential Calculus in ℝⁿ Part 1 (2026)',
    fileName: 'S3512MC___CALCULUS II_TUT 3_2026.pdf',
    institution: 'University of Namibia',
  },
  [TUT4]: {
    title: 'S3512MC Calculus II, Tutorial 4: Differential Calculus in ℝⁿ Part 2 (2026)',
    fileName: 'S3512MC___CALCULUS II_TUT 4_2026.pdf',
    institution: 'University of Namibia',
  },
} as const;

/** Reference into the Chapter 3 notes (printed page numbers). */
export const ch3 = (section: string, page: number, item?: string): SourceRef => ({
  document: CH3,
  section,
  page,
  ...(item ? { item } : {}),
});

/** URL-safe id of a source section: "3.2.1" → "3-2-1". */
export const sectionId = (section: string): string => section.replace(/\./g, '-');

/**
 * Every printed Chapter 3 heading and the subtopic(s) that teach it. §3.4 is
 * one printed section taught in four subtopics; no 3.4.x numbers are invented.
 */
export const CHAPTER3_SECTION_MAP: readonly { section: string; title: string; pages: string; unitIds: RnUnitId[] }[] = [
  { section: '3.1', title: 'Definition of a Function of Two Variables', pages: '43–44', unitIds: [U.functions] },
  { section: '3.2', title: 'Partial Derivatives', pages: '44', unitIds: [U.partials] },
  {
    section: '3.2.1',
    title: 'Partial Derivatives of a Function of Two Variables',
    pages: '44–46',
    unitIds: [U.partials],
  },
  {
    section: '3.2.2',
    title: 'Partial Derivatives of a function of Three or More Variables',
    pages: '46',
    unitIds: [U.threeVariables],
  },
  { section: '3.2.3', title: 'Higher-Order Partial Derivatives', pages: '47–48', unitIds: [U.higherOrder] },
  { section: '3.3', title: 'Total Differential', pages: '48', unitIds: [U.totalDifferential] },
  {
    section: '3.4',
    title: 'Chain Rules for Functions of Several Variables',
    pages: '49–54',
    unitIds: [U.chainOne, U.chainTwo, U.changeVariables, U.secondOrder],
  },
];
