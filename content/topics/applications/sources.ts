/**
 * Source traceability for Topic 4 (internal; never shown as the main learner label).
 *
 * Primary sources (University of Namibia, S3512MC Calculus II, 2026):
 *   - Chapter 4 notes "Applications of the Partial Derivative", printed
 *     pages 55–61 (7 pages; the chapter ends after Example 4.3.3; there are
 *     no figures, exercises or "You Try It" items)
 *   - Tutorial 5 "Gradient and Extrema of Functions of Two Variables",
 *     21 September 2026 (Dr J. Mushanyu): 5 questions, 35 printed parts,
 *     no answer key
 *
 * Tutorial 5 Q1 (total differential) practises Chapter 3 §3.3. It stays in
 * Topic 4 as a labelled review activity ("Review from §3.3: Total
 * Differential and Gradient Components"); Topic 3 is not changed.
 * Tutorial 6 (Multiple Integration) belongs to Chapter 5 and is not used.
 */
import type { SourceRef } from '../../types';

import { PDA_UNITS as U, type PdaUnitId } from './ids';

export const CH4 = 'unam-s3512mc-ch4-notes-2026' as const;
export const TUT5 = 'unam-s3512mc-tut5-2026' as const;

export const SOURCE_DOCUMENTS = {
  [CH4]: {
    title: 'S3512MC Calculus II, Chapter 4 Notes: Applications of the Partial Derivative (2026)',
    fileName: 'S3512MC___CALCULUS II_CHAPTER 4__NOTES_2026.pdf',
    institution: 'University of Namibia',
  },
  [TUT5]: {
    title: 'S3512MC Calculus II, Tutorial 5: Gradient and Extrema of Functions of Two Variables (2026)',
    fileName: 'S3512MC___CALCULUS II_TUT 5_2026.pdf',
    institution: 'University of Namibia',
  },
} as const;

/** Reference into the Chapter 4 notes (printed page numbers). */
export const ch4 = (section: string, page: number, item?: string): SourceRef => ({
  document: CH4,
  section,
  page,
  ...(item ? { item } : {}),
});

/**
 * Every printed Chapter 4 heading and the subtopic(s) that teach it. §4.3.1 is
 * taught in two subtopics: its opening (extrema, critical points) in
 * Subtopic 3 and its "The Second Partials Test" block in Subtopic 4. No new
 * section numbers are invented.
 */
export const CHAPTER4_SECTION_MAP: readonly { section: string; title: string; pages: string; unitIds: PdaUnitId[] }[] =
  [
    { section: '4.1', title: 'The Gradient of a Function of Two Variables', pages: '55', unitIds: [U.gradient] },
    { section: '4.2', title: 'Tangent Planes and Normal Lines', pages: '56', unitIds: [U.tangentPlanes] },
    {
      section: '4.2.1',
      title: 'Tangent Plane and Normal Line to a Surface',
      pages: '56–58',
      unitIds: [U.tangentPlanes],
    },
    { section: '4.3', title: 'Extrema of Functions of Two Variables', pages: '58', unitIds: [U.criticalPoints] },
    {
      section: '4.3.1',
      title: 'Absolute Extrema and Relative Extrema',
      pages: '58–61',
      unitIds: [U.criticalPoints, U.secondPartials],
    },
  ];
