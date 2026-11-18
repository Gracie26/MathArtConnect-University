/**
 * Source traceability for Topic 5 (internal; never shown as the main learner label).
 *
 * Primary sources (University of Namibia, S3512MC Calculus II, 2026):
 *   - Chapter 5 notes "Multiple Integration", printed pages 62–73 (12 pages):
 *     4 numbered sections, 3 numbered subsections, 6 unnumbered headings,
 *     4 headed definitions, Theorem 5.4.1, 12 numbered worked examples (each
 *     with its printed solution) and Figures 5.1–5.3 (all in §5.1 and §5.1.1)
 *   - Tutorial 6 "Multiple Integration", 28 September 2026 (Dr J. Mushanyu):
 *     34 questions, 66 items (parts, or the question when it has no parts),
 *     no answer key
 *
 * Approved structure: one subtopic per official section or subsection, in
 * printed order (§5.1, §5.1.1, §5.2 with §5.2.1, §5.3, §5.4 with §5.4.1).
 */
import type { SourceRef } from '../../types';

import { MI_UNITS as U, type MiUnitId } from './ids';

export const CH5 = 'unam-s3512mc-ch5-notes-2026' as const;
export const TUT6 = 'unam-s3512mc-tut6-2026' as const;

export const SOURCE_DOCUMENTS = {
  [CH5]: {
    title: 'S3512MC Calculus II, Chapter 5 Notes: Multiple Integration (2026)',
    fileName: 'S3512MC___CALCULUS II_CHAPTER 5__NOTES_2026.pdf',
    institution: 'University of Namibia',
  },
  [TUT6]: {
    title: 'S3512MC Calculus II, Tutorial 6: Multiple Integration (2026)',
    fileName: 'S3512MC___CALCULUS II_TUT 6_2026.pdf',
    institution: 'University of Namibia',
  },
} as const;

/** Reference into the Chapter 5 notes (printed page numbers). */
export const ch5 = (section: string, page: number, item?: string): SourceRef => ({
  document: CH5,
  section,
  page,
  ...(item ? { item } : {}),
});

/** Every printed Chapter 5 heading and the one subtopic that teaches it. */
export const CHAPTER5_SECTION_MAP: readonly { section: string; title: string; pages: string; unitId: MiUnitId }[] = [
  { section: '5.1', title: 'Iterated Integrals', pages: '62–64', unitId: U.iterated },
  { section: '5.1.1', title: 'Comparing Different Orders of Integration', pages: '64–66', unitId: U.orders },
  { section: '5.2', title: 'Double Integrals and Volume', pages: '67', unitId: U.doubleVolume },
  {
    section: '5.2.1',
    title: 'Double Integrals and Volume of a Solid Region',
    pages: '67–68',
    unitId: U.doubleVolume,
  },
  { section: '5.3', title: 'Triple Integrals', pages: '68–69', unitId: U.triple },
  { section: '5.4', title: 'Change of Variables : Jacobians', pages: '69', unitId: U.jacobians },
  { section: '5.4.1', title: 'Jacobians', pages: '69–73', unitId: U.jacobians },
];

/** The six unnumbered bold headings, as printed, with their sections. */
export const CHAPTER5_UNNUMBERED_HEADINGS: readonly { heading: string; section: string; page: number }[] = [
  { heading: 'Definition of Double Integral', section: '5.2.1', page: 67 },
  { heading: 'Volume of a Solid Region', section: '5.2.1', page: 67 },
  { heading: 'Definition of Triple Integral', section: '5.3', page: 68 },
  { heading: 'Evaluation by Iterated Integrals', section: '5.3', page: 68 },
  { heading: 'Definition of the Jacobian', section: '5.4.1', page: 70 },
  { heading: 'Change of Variables for Double Integrals', section: '5.4.1', page: 71 },
];
