import type { ContentBlock, LessonStepDefinition, LessonStepKind, PracticeItem, SourceRef } from '../../types';

import { activitiesFor } from './activities';
import { CHAPTER1_PRACTICE } from './chapterPractice';
import { INTEGRATION_TOPIC_ID, type IntegrationUnitId } from './ids';
import { CHAPTER1_INVENTORY } from './inventory';
import { groupByTechnique } from './practice';
import { CH1 } from './sources';
import { TUTORIAL1_ITEMS } from './tutorial1';
import { TUTORIAL2_CHAPTER1_ITEMS } from './tutorial2';

/** Source reference for a Chapter 1 inventory item (section and page filled in from the inventory). */
export function src(inventoryId: string): SourceRef {
  const entry = CHAPTER1_INVENTORY.find((i) => i.id === inventoryId);
  return entry
    ? { document: CH1, section: entry.section, page: entry.page, inventoryId }
    : { document: CH1, inventoryId };
}

/** An available step with content. */
export function step(
  kind: LessonStepKind,
  title: string,
  blocks: ContentBlock[],
  options: { required?: boolean; source?: SourceRef[]; key?: string } = {},
): LessonStepDefinition {
  return {
    key: options.key ?? kind,
    kind,
    title,
    required: options.required ?? true,
    availability: { status: 'available' },
    blocks,
    ...(options.source ? { source: options.source } : {}),
  };
}

/** A step delivered in a later phase. Shown, but honestly marked as not yet available. */
export function planned(
  kind: LessonStepKind,
  title: string,
  phase: number,
  preview: string,
  options: { required?: boolean; activityIds?: string[]; key?: string } = {},
): LessonStepDefinition {
  return {
    key: options.key ?? kind,
    kind,
    title,
    required: options.required ?? false,
    availability: { status: 'planned', phase, preview },
    blocks: [],
    ...(options.activityIds ? { activityIds: options.activityIds } : {}),
  };
}

const sourcesOf = (items: readonly PracticeItem[]): SourceRef[] => items.map((item) => item.source);

/** Try it: the chapter's "You Try It" items and exercises for this subtopic. */
export function tryItStep(unitId: IntegrationUnitId, title: string, text: string): LessonStepDefinition {
  const items = CHAPTER1_PRACTICE.filter((item) => item.unitId === unitId);
  return step('try-it', title, [{ type: 'practiceGroup', title: 'Try these', text, items }], {
    source: sourcesOf(items),
  });
}

/** Practise: every Tutorial 1 question (and Tutorial 2 Question 1 part) for this subtopic, grouped by technique. */
export function practiseStep(unitId: IntegrationUnitId): LessonStepDefinition {
  const items = [...TUTORIAL1_ITEMS, ...TUTORIAL2_CHAPTER1_ITEMS].filter((item) => item.unitId === unitId);
  return step(
    'practise',
    'Practise',
    [
      {
        type: 'paragraph',
        text: 'Practice questions for this subtopic, grouped by method. Open a question to write your working step by step, check each step and your final answer, and ask for hints when you need them.',
      },
      ...groupByTechnique(items).map((group): ContentBlock => ({
        type: 'practiceGroup',
        title: group.label,
        items: group.items,
      })),
    ],
    { source: sourcesOf(items) },
  );
}

const STEP_TITLES = { explore: 'Explore', play: 'Play', create: 'Create' } as const;
const STEP_TEXT = {
  explore: 'Interactive tools for this idea. Change things and watch what happens.',
  play: 'A game that practises this technique. Each reasoning step scores.',
  create: 'Make something with the mathematics of this subtopic, and explain the mathematics behind it.',
} as const;

/** Explore, Play or Create: the subtopic's activities of that kind (optional steps). */
export function activityStep(kind: 'explore' | 'play' | 'create', unitId: IntegrationUnitId): LessonStepDefinition {
  const activityKind = kind === 'explore' ? 'lab' : kind === 'play' ? 'game' : 'studio';
  return step(
    kind,
    STEP_TITLES[kind],
    [
      { type: 'paragraph', text: STEP_TEXT[kind] },
      { type: 'activities', activities: activitiesFor(unitId, activityKind) },
    ],
    { required: false },
  );
}

/**
 * Reflect and Review close every subtopic. Reflect is a short reflection,
 * never a test; Review shows the learner's own history. Both are optional.
 */
export const reflectAndReview = (
  unitId: IntegrationUnitId,
  question: string,
  difficulties: string[],
): LessonStepDefinition[] => [
  step('reflect', 'Reflect', [{ type: 'reflect', topicId: INTEGRATION_TOPIC_ID, unitId, question, difficulties }], {
    required: false,
  }),
  step('review', 'Review', [{ type: 'review', topicId: INTEGRATION_TOPIC_ID, unitId }], { required: false }),
];
