/**
 * The Chapter 2 sections as learners open them, nested in the eight
 * subtopics, with headings exactly as printed. Each section page collects
 * every lesson block taken from it (through the source inventory), app
 * illustrations shown alongside those blocks, its "You Try It" and the
 * Tutorial 2 questions that practise its method.
 */
import type { ContentBlock, LearningUnitDefinition, LessonStepKind, PracticeItem, SourceSection } from '../../types';

import { CHAPTER2_PRACTICE } from './chapterPractice';
import { AREA_UNITS as U, type AreaUnitId } from './ids';
import { CHAPTER2_INVENTORY } from './inventory';
import { TUTORIAL2_ITEMS } from './tutorial2';

interface SectionHeading {
  id: string;
  label: string;
  heading: string;
  unitId: AreaUnitId;
}

/** Every numbered section of Chapter 2, in the order of the notes. */
export const AREA_SECTION_HEADINGS: readonly SectionHeading[] = [
  { id: '2-1', label: '2.1', heading: 'Area Under a Graph', unitId: U.riemann },
  { id: '2-2', label: '2.2', heading: 'Riemann Sums', unitId: U.riemann },
  { id: '2-2-1', label: '2.2.1', heading: 'The Definite Integral', unitId: U.definite },
  { id: '2-2-2', label: '2.2.2', heading: 'Properties of the Definite Integral', unitId: U.properties },
  { id: '2-3', label: '2.3', heading: 'The Fundamental Theorem of Calculus', unitId: U.ftc },
  { id: '2-4', label: '2.4', heading: 'The Mean Value Theorem for Integrals', unitId: U.mvt },
  { id: '2-5', label: '2.5', heading: 'Improper Integrals', unitId: U.typeOne },
  { id: '2-5-1', label: '2.5.1', heading: 'TYPE I: Integrals over infinite intervals', unitId: U.typeOne },
  { id: '2-5-2', label: '2.5.2', heading: 'TYPE II: Discontinuous Integrands', unitId: U.typeTwo },
  { id: '2-5-3', label: '2.5.3', heading: 'A Comparison Test for Improper Integrals', unitId: U.comparison },
];

const navSectionOf = new Map(CHAPTER2_INVENTORY.map((item) => [item.id, item.navSection]));

/** The navigator section a lesson block comes from (undefined for app-written blocks). */
export function areaSectionOfBlock(block: ContentBlock): string | undefined {
  const ids = [
    block.source?.inventoryId,
    ...(block.type === 'formulaList' ? block.items.map((i) => i.source?.inventoryId) : []),
  ];
  for (const id of ids) {
    const section = id ? navSectionOf.get(id) : undefined;
    if (section) return section;
  }
  return undefined;
}

/** Steps whose blocks are the notes' teaching content (practice and activities are collected separately). */
const NOTE_STEPS = new Set<LessonStepKind>(['concept', 'see-it', 'worked-example']);

export function buildAreaSections(units: readonly LearningUnitDefinition[]): SourceSection[] {
  const practice: PracticeItem[] = [...CHAPTER2_PRACTICE, ...TUTORIAL2_ITEMS];
  const blocksBySection = new Map<string, ContentBlock[]>();
  for (const unit of units) {
    for (const step of unit.steps.filter((s) => NOTE_STEPS.has(s.kind))) {
      // App illustrations and summaries go with the section of the source block before them.
      let current: string | undefined;
      for (const block of step.blocks) {
        current = areaSectionOfBlock(block) ?? current;
        if (!current) continue;
        blocksBySection.set(current, [...(blocksBySection.get(current) ?? []), block]);
      }
    }
  }
  return AREA_SECTION_HEADINGS.map((heading) => ({
    ...heading,
    blocks: blocksBySection.get(heading.id) ?? [],
    tryIt: practice.filter((item) => item.sourceType !== 'tutorial-question' && item.sourceSection === heading.id),
    tutorial: practice.filter((item) => item.sourceType === 'tutorial-question' && item.sourceSection === heading.id),
  }));
}
