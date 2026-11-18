/**
 * The Chapter 1 sections as learners open them, nested in the seven
 * subtopics. Headings follow the notes exactly. Each section collects every
 * lesson block taken from it (through the source inventory), its "You Try It"
 * items and exercises, and the tutorial questions that practise its method.
 */
import type { ContentBlock, LearningUnitDefinition, PracticeItem, SourceSection } from '../../types';

import { CHAPTER1_PRACTICE } from './chapterPractice';
import { INTEGRATION_UNITS as U, type IntegrationUnitId } from './ids';
import { CHAPTER1_INVENTORY } from './inventory';
import { TABLE_1_1 } from './sources';
import { TUTORIAL1_ITEMS } from './tutorial1';
import { TUTORIAL2_CHAPTER1_ITEMS } from './tutorial2';

interface SectionHeading {
  id: string;
  label: string;
  heading: string;
  headingTex?: string;
  headingPlain?: string;
  headingCondition?: string;
  unitId: IntegrationUnitId;
}

/** Every section of Chapter 1, plus Table 1.1, in the order of the notes. */
export const SECTION_HEADINGS: readonly SectionHeading[] = [
  { id: '1-1', label: '1.1', heading: 'Anti-derivatives', unitId: U.understanding },
  { id: '1-2', label: '1.2', heading: 'Indefinite Integral', unitId: U.understanding },
  { id: '1-3', label: '1.3', heading: 'The Indefinite Integral of a Power', unitId: U.basicRules },
  { id: '1-4', label: '1.4', heading: 'Some Anti-Differentiation Formulas', unitId: U.basicRules },
  { id: '1-5', label: '1.5', heading: 'u-Substitution', unitId: U.substitution },
  { id: '1-6', label: '1.6', heading: 'Partial Fractions', unitId: U.partialFractions },
  { id: '1-6-1', label: '1.6.1', heading: 'Integrating with Repeated Factors', unitId: U.partialFractions },
  { id: '1-6-2', label: '1.6.2', heading: 'Integrating an Improper Rational Function', unitId: U.partialFractions },
  { id: '1-6-3', label: '1.6.3', heading: 'Quadratic Factors', unitId: U.partialFractions },
  {
    id: '1-7',
    label: '1.7',
    heading: 'Integrals of the form',
    headingTex: '\\int \\frac{Ax+B}{ax^{2}+bx+c}\\,dx',
    headingPlain: '∫ (Ax + B)/(ax² + bx + c) dx',
    headingCondition: 'where $a$, $b$, $c$, $A$, $B$ are constants and $b^{2} < 4ac$',
    unitId: U.partialFractions,
  },
  {
    id: '1-8',
    label: '1.8',
    heading: 'Algebraic Functions: Integration by Substitution and Rationalisation',
    unitId: U.algebraicTrig,
  },
  { id: TABLE_1_1, label: 'Table 1.1', heading: 'Suggested substitutions', unitId: U.algebraicTrig },
  {
    id: '1-8-1',
    label: '1.8.1',
    heading: 'Integrals of the form',
    headingTex: '\\int \\frac{Ax+B}{\\sqrt{ax^{2}+2bx+c}}\\,dx',
    headingPlain: '∫ (Ax + B)/√(ax² + 2bx + c) dx',
    headingCondition: 'where $A$, $B$, $a$, $b$, $c$ are real constants',
    unitId: U.algebraicTrig,
  },
  { id: '1-9', label: '1.9', heading: 'Integration of Rational Functions of Sine and Cosine', unitId: U.algebraicTrig },
  { id: '1-10', label: '1.10', heading: 'Integration by Parts', unitId: U.byParts },
  { id: '1-11', label: '1.11', heading: 'Using Integration by Parts Repeatedly', unitId: U.byParts },
  { id: '1-12', label: '1.12', heading: 'Reduction Formulas', unitId: U.advancedPatterns },
  {
    id: '1-13',
    label: '1.13',
    heading: 'Integration of Powers of Trigonometric Functions',
    unitId: U.advancedPatterns,
  },
  {
    id: '1-14',
    label: '1.14',
    heading: 'Integrals of the form',
    headingTex: '\\int \\frac{a\\cos x + b\\sin x + c}{A\\cos x + B\\sin x + C}\\,dx',
    headingPlain: '∫ (a cos x + b sin x + c)/(A cos x + B sin x + C) dx',
    unitId: U.advancedPatterns,
  },
];

const navSectionOf = new Map(
  CHAPTER1_INVENTORY.map((item) => [item.id, item.navSection ?? item.section.replace(/\./g, '-')]),
);

/** The navigator section a lesson block comes from (undefined for app-written blocks). */
export function sectionOfBlock(block: ContentBlock): string | undefined {
  const ids = [
    block.source?.inventoryId,
    ...(block.type === 'formulaList' ? block.items.map((i) => i.source?.inventoryId) : []),
    ...(block.type === 'table' ? block.rows.map((r) => r.source?.inventoryId) : []),
  ];
  for (const id of ids) {
    const section = id ? navSectionOf.get(id) : undefined;
    if (section) return section;
  }
  return undefined;
}

export function buildSections(units: readonly LearningUnitDefinition[]): SourceSection[] {
  const practice: PracticeItem[] = [...CHAPTER1_PRACTICE, ...TUTORIAL1_ITEMS, ...TUTORIAL2_CHAPTER1_ITEMS];
  return SECTION_HEADINGS.map((heading) => {
    const unit = units.find((u) => u.id === heading.unitId);
    const blocks = (unit?.steps ?? [])
      .flatMap((step) => step.blocks)
      .filter((block) => block.type !== 'practiceGroup' && sectionOfBlock(block) === heading.id);
    return {
      ...heading,
      blocks,
      tryIt: practice.filter((item) => item.sourceType !== 'tutorial-question' && item.sourceSection === heading.id),
      tutorial: practice.filter((item) => item.sourceType === 'tutorial-question' && item.sourceSection === heading.id),
    };
  });
}
