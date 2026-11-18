/**
 * The Chapter 3 sections as learners open them, with headings exactly as
 * printed. Each section page collects every lesson block taken from it
 * (through the source inventory) and the tutorial questions that practise it.
 * §3.4 is a single printed section taught in four subtopics, so its page
 * gathers the blocks of all four; no 3.4.x numbers are invented.
 */
import type { ContentBlock, LearningUnitDefinition, LessonStepKind, PracticeItem, SourceSection } from '../../types';

import { RN_UNITS as U, type RnUnitId } from './ids';
import { CHAPTER3_INVENTORY } from './inventory';

interface SectionHeading {
  id: string;
  label: string;
  heading: string;
  /** The subtopic the section page belongs to (for §3.4, the first of its four subtopics). */
  unitId: RnUnitId;
}

/** Every numbered section of Chapter 3, in the order of the notes. */
export const RN_SECTION_HEADINGS: readonly SectionHeading[] = [
  { id: '3-1', label: '3.1', heading: 'Definition of a Function of Two Variables', unitId: U.functions },
  { id: '3-2', label: '3.2', heading: 'Partial Derivatives', unitId: U.partials },
  { id: '3-2-1', label: '3.2.1', heading: 'Partial Derivatives of a Function of Two Variables', unitId: U.partials },
  {
    id: '3-2-2',
    label: '3.2.2',
    heading: 'Partial Derivatives of a function of Three or More Variables',
    unitId: U.threeVariables,
  },
  { id: '3-2-3', label: '3.2.3', heading: 'Higher-Order Partial Derivatives', unitId: U.higherOrder },
  { id: '3-3', label: '3.3', heading: 'Total Differential', unitId: U.totalDifferential },
  { id: '3-4', label: '3.4', heading: 'Chain Rules for Functions of Several Variables', unitId: U.chainOne },
];

const navSectionOf = new Map(CHAPTER3_INVENTORY.map((item) => [item.id, item.navSection]));

/** The navigator section a lesson block comes from (undefined for app-written blocks). */
export function rnSectionOfBlock(block: ContentBlock): string | undefined {
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

export function buildRnSections(
  units: readonly LearningUnitDefinition[],
  practice: readonly PracticeItem[],
): SourceSection[] {
  const blocksBySection = new Map<string, ContentBlock[]>();
  for (const unit of units) {
    for (const step of unit.steps.filter((s) => NOTE_STEPS.has(s.kind))) {
      // App illustrations go with the section of the source block before them.
      let current: string | undefined;
      for (const block of step.blocks) {
        current = rnSectionOfBlock(block) ?? current;
        if (!current) continue;
        blocksBySection.set(current, [...(blocksBySection.get(current) ?? []), block]);
      }
    }
  }
  return RN_SECTION_HEADINGS.map((heading) => ({
    ...heading,
    blocks: blocksBySection.get(heading.id) ?? [],
    tryIt: practice.filter((item) => item.sourceType === 'app-practice' && item.sourceSection === heading.id),
    tutorial: practice.filter((item) => item.sourceType === 'tutorial-question' && item.sourceSection === heading.id),
  }));
}
