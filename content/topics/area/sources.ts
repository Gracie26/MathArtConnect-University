/**
 * Source traceability for Topic 2 (internal; never shown as the main learner label).
 *
 * Primary sources (University of Namibia, S3512MC Calculus II, 2026):
 *   - Chapter 2 notes "Integration as a Process of Finding the Area Under the
 *     Graph", printed pages 23–42
 *   - Tutorial 2 "Integration (Part 2)", 10 August 2026 (Dr J. Mushanyu):
 *     questions only, no answer key
 *
 * Tutorial 2 Question 1(a)–(g) practises Chapter 1 methods (integration by
 * parts and reduction formulas) and is placed in Topic 1
 * (content/topics/integration/tutorial2.ts), not here.
 */
import type { SourceRef } from '../../types';

import { AREA_UNITS as U, type AreaUnitId } from './ids';

export const CH2 = 'unam-s3512mc-ch2-notes-2026' as const;
export const TUT2 = 'unam-s3512mc-tut2-2026' as const;

export const SOURCE_DOCUMENTS = {
  [CH2]: {
    title: 'S3512MC Calculus II, Chapter 2 Notes: Integration as a Process of Finding the Area Under the Graph (2026)',
    fileName: 'S3512MC___CALCULUS II_CHAPTER 2__NOTES_2026.pdf',
    institution: 'University of Namibia',
  },
  [TUT2]: {
    title: 'S3512MC Calculus II, Tutorial 2: Integration (Part 2) (2026)',
    fileName: 'S3512MC___CALCULUS II_TUT 2_2026.pdf',
    institution: 'University of Namibia',
  },
} as const;

/** Reference into the Chapter 2 notes (printed page numbers). */
export const ch2 = (section: string, page: number, item?: string): SourceRef => ({
  document: CH2,
  section,
  page,
  ...(item ? { item } : {}),
});

/** URL-safe id of a source section: "2.5.1" → "2-5-1". */
export const sectionId = (section: string): string => section.replace(/\./g, '-');

/** Every Chapter 2 section and the subtopic that teaches it (approved audit). */
export const CHAPTER2_SECTION_MAP: readonly { section: string; title: string; pages: string; unitId: AreaUnitId }[] = [
  { section: '2.1', title: 'Area Under a Graph', pages: '23–24', unitId: U.riemann },
  { section: '2.2', title: 'Riemann Sums', pages: '24–27', unitId: U.riemann },
  { section: '2.2.1', title: 'The Definite Integral', pages: '27–30', unitId: U.definite },
  { section: '2.2.2', title: 'Properties of the Definite Integral', pages: '30–31', unitId: U.properties },
  { section: '2.3', title: 'The Fundamental Theorem of Calculus', pages: '32–33', unitId: U.ftc },
  { section: '2.4', title: 'The Mean Value Theorem for Integrals', pages: '33–34', unitId: U.mvt },
  { section: '2.5', title: 'Improper Integrals', pages: '34', unitId: U.typeOne },
  { section: '2.5.1', title: 'TYPE I: Integrals over infinite intervals', pages: '34–37', unitId: U.typeOne },
  { section: '2.5.2', title: 'TYPE II: Discontinuous Integrands', pages: '37–40', unitId: U.typeTwo },
  { section: '2.5.3', title: 'A Comparison Test for Improper Integrals', pages: '40–42', unitId: U.comparison },
];

function parts<T>(question: string, labels: string[], value: T): Record<string, T> {
  return Object.fromEntries(labels.map((label) => [`${question}(${label})`, value]));
}

/** Tutorial 2: subtopic of every Topic 2 part (69 parts; Q1 is in Topic 1). */
export const TUTORIAL2_PART_MAP: Readonly<Record<string, AreaUnitId>> = {
  Q2: U.properties,
  Q3: U.properties,
  ...parts('Q5', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], U.properties),
  Q4: U.ftc,
  ...parts('Q6', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'], U.ftc),
  ...parts('Q7', ['a', 'b', 'c', 'd', 'e', 'f', 'g'], U.definite),
  ...parts('Q8', ['a', 'b', 'c', 'd'], U.definite),
  ...parts('Q9', ['a', 'b'], U.riemann),
  ...parts('Q10', ['a', 'b', 'c'], U.definite),
  ...parts('Q11', ['a', 'b', 'c'], U.riemann),
  ...parts('Q12', ['a', 'b', 'c'], U.definite),
  ...parts('Q13', ['f', 'g', 'j', 'k', 'm', 'n', 'o'], U.typeOne),
  ...parts('Q13', ['a', 'b', 'c', 'd', 'e', 'h', 'i', 'l', 'p'], U.typeTwo),
  ...parts('Q14', ['a', 'b', 'c', 'd'], U.comparison),
};

/** Tutorial 2: the Chapter 2 section whose method each part practises (navigator id). */
export const TUTORIAL2_SECTION_MAP: Readonly<Record<string, string>> = {
  Q2: '2-2-2',
  Q3: '2-2-2',
  ...parts('Q5', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], '2-2-2'),
  Q4: '2-3',
  ...parts('Q6', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'], '2-3'),
  ...parts('Q7', ['a', 'b', 'c', 'd', 'e', 'f', 'g'], '2-2-1'),
  ...parts('Q8', ['a', 'b', 'c', 'd'], '2-2-1'),
  ...parts('Q9', ['a', 'b'], '2-2'),
  ...parts('Q10', ['a', 'b', 'c'], '2-2-1'),
  ...parts('Q11', ['a', 'b', 'c'], '2-2'),
  ...parts('Q12', ['a', 'b', 'c'], '2-2-1'),
  ...parts('Q13', ['f', 'g', 'j', 'k', 'm', 'n', 'o'], '2-5-1'),
  ...parts('Q13', ['a', 'b', 'c', 'd', 'e', 'h', 'i', 'l', 'p'], '2-5-2'),
  ...parts('Q14', ['a', 'b', 'c', 'd'], '2-5-3'),
};
