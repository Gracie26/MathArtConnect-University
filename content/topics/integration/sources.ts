/**
 * Source traceability for Topic 1 (internal; never shown as learner labels).
 *
 * Primary sources (University of Namibia, S3512MC Calculus II, 2026):
 *   - Chapter 1 notes "Integration" (Dr J. Mushanyu), 22 printed pages
 *   - Tutorial 1 "Integration (Part 1)", 03 August 2026: questions only,
 *     no answer key
 */
import type { SourceRef } from '../../types';

import { INTEGRATION_UNITS, type IntegrationUnitId } from './ids';

export const CH1 = 'unam-s3512mc-ch1-notes-2026' as const;
export const TUT1 = 'unam-s3512mc-tut1-2026' as const;
/** Tutorial 2 "Integration (Part 2)": its Question 1 practises Chapter 1 methods (tutorial2.ts). */
export const TUT2 = 'unam-s3512mc-tut2-2026' as const;

export const SOURCE_DOCUMENTS = {
  [CH1]: {
    title: 'S3512MC Calculus II, Chapter 1 Notes: Integration (2026)',
    fileName: 'S3512MC___CALCULUS II_CHAPTER 1__NOTES_2026.pdf',
    institution: 'University of Namibia',
  },
  [TUT1]: {
    title: 'S3512MC Calculus II, Tutorial 1: Integration (Part 1) (2026)',
    fileName: 'S3512MC___CALCULUS II_TUT 1_2026.pdf',
    institution: 'University of Namibia',
  },
} as const;

/** Reference into the Chapter 1 notes (printed page numbers). */
export const ch1 = (section: string, page: number, item?: string): SourceRef => ({
  document: CH1,
  section,
  page,
  ...(item ? { item } : {}),
});

const U = INTEGRATION_UNITS;

/** Every Chapter 1 section and the subtopic that teaches it (approved Phase 0 map). */
export const CHAPTER1_SECTION_MAP: readonly {
  section: string;
  title: string;
  pages: string;
  unitId: IntegrationUnitId;
}[] = [
  { section: '1.1', title: 'Anti-derivatives', pages: '1–2', unitId: U.understanding },
  { section: '1.2', title: 'Indefinite Integral', pages: '2–3', unitId: U.understanding },
  { section: '1.3', title: 'The Indefinite Integral of a Power', pages: '3–4', unitId: U.basicRules },
  { section: '1.4', title: 'Some Anti-Differentiation Formulas', pages: '4–5', unitId: U.basicRules },
  { section: '1.5', title: 'u-Substitution', pages: '5–7', unitId: U.substitution },
  { section: '1.6', title: 'Partial Fractions', pages: '7–8', unitId: U.partialFractions },
  { section: '1.6.1', title: 'Integrating with Repeated Factors', pages: '8', unitId: U.partialFractions },
  { section: '1.6.2', title: 'Integrating an Improper Rational Function', pages: '9', unitId: U.partialFractions },
  { section: '1.6.3', title: 'Quadratic Factors', pages: '9–10', unitId: U.partialFractions },
  {
    section: '1.7',
    title: 'Integrals of the form (Ax+B)/(ax²+bx+c), b² < 4ac',
    pages: '10–11',
    unitId: U.partialFractions,
  },
  {
    section: '1.8',
    title: 'Algebraic Functions: substitution and rationalisation',
    pages: '12–13',
    unitId: U.algebraicTrig,
  },
  { section: '1.8.1', title: 'Integrals of the form (Ax+B)/√(ax²+2bx+c)', pages: '14–15', unitId: U.algebraicTrig },
  {
    section: '1.9',
    title: 'Integration of Rational Functions of Sine and Cosine',
    pages: '15–16',
    unitId: U.algebraicTrig,
  },
  { section: '1.10', title: 'Integration by Parts', pages: '16–18', unitId: U.byParts },
  { section: '1.11', title: 'Using Integration by Parts Repeatedly', pages: '18', unitId: U.byParts },
  { section: '1.12', title: 'Reduction Formulas', pages: '18–19', unitId: U.advancedPatterns },
  {
    section: '1.13',
    title: 'Integration of Powers of Trigonometric Functions',
    pages: '19–22',
    unitId: U.advancedPatterns,
  },
  // Decision 5: special quotient form treated as advanced pattern recognition.
  {
    section: '1.14',
    title: 'Integrals of the form (a cos x + b sin x + c)/(A cos x + B sin x + C)',
    pages: '22',
    unitId: U.advancedPatterns,
  },
];

/**
 * Tutorial 1: subtopic of every question part (84 parts). The full practice
 * inventory (technique, difficulty, interaction, solutions) is Phase 5.
 */
export const TUTORIAL1_PART_MAP: Readonly<Record<string, IntegrationUnitId>> = {
  ...parts('Q1', ['i', 'ii', 'iii', 'iv', 'vi', 'vii', 'viii', 'ix', 'x'], U.substitution),
  'Q1(v)': U.basicRules,
  ...parts('Q2', ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'], U.substitution),
  ...parts('Q3', ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'], U.partialFractions),
  ...parts('Q4', ['a', 'b'], U.partialFractions),
  ...parts('Q5', ['a', 'b'], U.partialFractions),
  Q6: U.partialFractions,
  ...parts('Q7', ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'ix', 'x', 'xi', 'xviii'], U.algebraicTrig),
  ...parts('Q7', ['viii', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii'], U.partialFractions),
  ...parts(
    'Q8',
    ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi'],
    U.advancedPatterns,
  ),
  ...parts('Q9', ['i', 'iii', 'iv', 'v'], U.algebraicTrig),
  'Q9(ii)': U.substitution,
  Q10: U.algebraicTrig,
  ...parts('Q11', ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'], U.byParts),
  // §1.14 form (Decision 5): advanced pattern recognition.
  ...parts('Q12', ['i', 'ii', 'iii'], U.advancedPatterns),
};

function parts<T>(question: string, labels: string[], value: T): Record<string, T> {
  return Object.fromEntries(labels.map((label) => [`${question}(${label})`, value]));
}

/** URL-safe id of a source section in the learner navigator, e.g. "1.6.1" → "1-6-1". */
export const sectionId = (section: string): string => section.replace(/\./g, '-');
export const TABLE_1_1 = 'table-1-1';

/**
 * Tutorial 1: the Chapter 1 section whose method each part practises, so the
 * part is listed under that section in the learner navigator.
 */
export const TUTORIAL1_SECTION_MAP: Readonly<Record<string, string>> = {
  'Q1(v)': '1-3',
  ...parts('Q1', ['i', 'ii', 'iii', 'iv', 'vi', 'vii', 'viii', 'ix', 'x'], '1-5'),
  ...parts('Q2', ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'], '1-5'),
  'Q9(ii)': '1-5',
  ...parts('Q3', ['ii', 'iv'], '1-6'),
  'Q4(a)': '1-6',
  'Q7(xvi)': '1-6',
  'Q5(a)': '1-6-1',
  ...parts('Q7', ['xiv', 'xv'], '1-6-1'),
  'Q3(v)': '1-6-2',
  'Q4(b)': '1-6-2',
  'Q5(b)': '1-6-2',
  ...parts('Q7', ['xii', 'xiii', 'xvii'], '1-6-2'),
  ...parts('Q3', ['i', 'iii', 'vi', 'vii', 'viii'], '1-6-3'),
  Q6: '1-7',
  'Q7(viii)': '1-7',
  ...parts('Q7', ['i', 'ii', 'iii', 'iv'], '1-8'),
  ...parts('Q7', ['v', 'vi', 'vii', 'xviii'], TABLE_1_1),
  ...parts('Q7', ['ix', 'x', 'xi'], '1-8-1'),
  ...parts('Q9', ['i', 'iii', 'iv', 'v'], '1-9'),
  Q10: '1-9',
  ...parts('Q11', ['i', 'iii', 'vi', 'viii'], '1-10'),
  ...parts('Q11', ['ii', 'iv', 'v', 'vii'], '1-11'),
  ...parts(
    'Q8',
    ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi'],
    '1-13',
  ),
  ...parts('Q12', ['i', 'ii', 'iii'], '1-14'),
};
