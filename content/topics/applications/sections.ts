/**
 * The Chapter 4 sections as learners open them, with headings exactly as
 * printed. Each section page collects every lesson block taken from it
 * (through the source inventory) and the practice that belongs to it.
 *
 * §4.2 and §4.3 have no text of their own: each is printed only as a heading
 * followed by its subsection (§4.2.1, §4.3.1). Their pages say so and point
 * to the subsection; nothing is invented. §4.3.1 gathers the blocks of both
 * Subtopic 3 and Subtopic 4.
 */
import type { ContentBlock, LearningUnitDefinition, LessonStepKind, PracticeItem, SourceSection } from '../../types';

import { PDA_UNITS as U, type PdaUnitId } from './ids';
import { CHAPTER4_INVENTORY } from './inventory';

interface SectionHeading {
  id: string;
  label: string;
  heading: string;
  /** The subtopic the section page belongs to (for §4.3.1, the first of its two subtopics). */
  unitId: PdaUnitId;
}

/** Every numbered section of Chapter 4, in the order of the notes. */
export const PDA_SECTION_HEADINGS: readonly SectionHeading[] = [
  { id: '4-1', label: '4.1', heading: 'The Gradient of a Function of Two Variables', unitId: U.gradient },
  { id: '4-2', label: '4.2', heading: 'Tangent Planes and Normal Lines', unitId: U.tangentPlanes },
  { id: '4-2-1', label: '4.2.1', heading: 'Tangent Plane and Normal Line to a Surface', unitId: U.tangentPlanes },
  { id: '4-3', label: '4.3', heading: 'Extrema of Functions of Two Variables', unitId: U.criticalPoints },
  { id: '4-3-1', label: '4.3.1', heading: 'Absolute Extrema and Relative Extrema', unitId: U.criticalPoints },
];

/** Pages for headings printed with no text of their own. */
const HEADING_ONLY: Record<string, ContentBlock[]> = {
  '4-2': [
    {
      type: 'paragraph',
      text: 'In the notes, §4.2 is a heading followed directly by §4.2.1 Tangent Plane and Normal Line to a Surface, where all of its content is. Open §4.2.1 below.',
    },
  ],
  '4-3': [
    {
      type: 'paragraph',
      text: 'In the notes, §4.3 is a heading followed directly by §4.3.1 Absolute Extrema and Relative Extrema, where all of its content is, including the Second Partials Test. Open §4.3.1 below.',
    },
  ],
};

const navSectionOf = new Map(CHAPTER4_INVENTORY.map((item) => [item.id, item.navSection]));

/** The navigator section a lesson block comes from (undefined for app-written blocks). */
export function pdaSectionOfBlock(block: ContentBlock): string | undefined {
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

export function buildPdaSections(
  units: readonly LearningUnitDefinition[],
  practice: readonly PracticeItem[],
): SourceSection[] {
  const blocksBySection = new Map<string, ContentBlock[]>();
  for (const unit of units) {
    for (const step of unit.steps.filter((s) => NOTE_STEPS.has(s.kind))) {
      // App guidance goes with the section of the source block before it.
      let current: string | undefined;
      for (const block of step.blocks) {
        current = pdaSectionOfBlock(block) ?? current;
        if (!current) continue;
        blocksBySection.set(current, [...(blocksBySection.get(current) ?? []), block]);
      }
    }
  }
  return PDA_SECTION_HEADINGS.map((heading) => ({
    ...heading,
    blocks: HEADING_ONLY[heading.id] ?? blocksBySection.get(heading.id) ?? [],
    // Chapter 4 has no "You Try It" items. App practice stays in its subtopic's Practise step (labelled
    // APP PRACTICE) rather than appearing here under "From the course notes".
    tryIt: [],
    tutorial: practice.filter((item) => item.sourceType === 'tutorial-question' && item.sourceSection === heading.id),
  }));
}
