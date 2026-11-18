import type { ContentBlock, LessonStepDefinition, LessonStepKind, PracticeItem, SourceRef } from '../../types';
import type { FigureSpec } from '@/lib/figures/scene';

import { rnActivitiesFor } from './activities';
import { RN_PRACTICE_ITEMS } from './allPractice';
import { CHAPTER3_FIGURES } from './figures';
import type { RnUnitId } from './ids';
import { CH3 } from './sources';
import { CHAPTER3_INVENTORY } from './inventory';
import { RN_TOPIC_ID } from './ids';
import { RN_TECHNIQUES } from './practice';
import { RN_REVIEW, rnReviewRecap } from './review';

/** Source reference for a Chapter 3 inventory item (section and page from the inventory). */
export function src(inventoryId: string): SourceRef {
  const entry = CHAPTER3_INVENTORY.find((i) => i.id === inventoryId);
  if (!entry) throw new Error(`Unknown Chapter 3 inventory item ${inventoryId}`);
  return { document: CH3, ...(entry.section === '3' ? {} : { section: entry.section }), page: entry.page, inventoryId };
}

/** A printed Chapter 3 figure (by inventory id), drawn as in the notes. */
export function figure(inventoryId: string): ContentBlock {
  const spec = CHAPTER3_FIGURES[inventoryId];
  if (!spec) throw new Error(`No figure for ${inventoryId}`);
  return { type: 'figure', figure: spec, source: src(inventoryId) };
}

/** A figure made for the app (always labelled "Illustration made for the app"); not part of the source inventory. */
export const illustration = (spec: FigureSpec): ContentBlock => ({ type: 'figure', figure: spec });

export function step(
  kind: LessonStepKind,
  title: string,
  blocks: ContentBlock[],
  options: { required?: boolean; key?: string } = {},
): LessonStepDefinition {
  const sources = blocks.flatMap((b) => (b.source ? [b.source] : []));
  return {
    key: options.key ?? kind,
    kind,
    title,
    required: options.required ?? true,
    availability: { status: 'available' },
    blocks,
    ...(sources.length > 0 ? { source: sources } : {}),
  };
}

/** The practice groups of one source (Tutorial 3, Tutorial 4 or App practice), one per method. */
function groups(source: string, text: string | undefined, items: readonly PracticeItem[]): ContentBlock[] {
  const order = Object.keys(RN_TECHNIQUES);
  const byTechnique = new Map<string, PracticeItem[]>();
  for (const item of items) byTechnique.set(item.technique, [...(byTechnique.get(item.technique) ?? []), item]);
  return [...byTechnique.entries()]
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([technique, list], index) => ({
      type: 'practiceGroup',
      title: `${source}: ${RN_TECHNIQUES[technique as keyof typeof RN_TECHNIQUES]}`,
      ...(index === 0 && text ? { text } : {}),
      items: list,
    }));
}

/** Practise: every Tutorial 3 and Tutorial 4 part for this subtopic (and §3.3 App practice), by source and method. */
export function practiseStep(unitId: RnUnitId): LessonStepDefinition {
  const items = RN_PRACTICE_ITEMS.filter((item) => item.unitId === unitId);
  const tutorial = (n: 3 | 4) =>
    items.filter((i) => i.sourceType === 'tutorial-question' && i.id.startsWith(`tut${n}-`));
  const app = items.filter((i) => i.sourceType === 'app-practice');
  return step('practise', 'Practise', [
    {
      type: 'paragraph',
      text: 'Tutorial practice for this subtopic, grouped by source and method. Each question shows where it comes from. Open a question to write your working step by step, check each step and your final answer, and ask for hints when you need them. Hints and walkthroughs are app guidance, not official solutions.',
    },
    ...groups('Tutorial 3', undefined, tutorial(3)),
    ...groups('Tutorial 4', undefined, tutorial(4)),
    ...groups(
      'APP PRACTICE',
      'Written for this app: neither tutorial has a question on this section. These are not tutorial questions.',
      app,
    ),
  ]);
}

/** Explore: the subtopic's interactive lab, built on its worked examples (optional). */
export function exploreStep(unitId: RnUnitId): LessonStepDefinition {
  return step(
    'explore',
    'Explore',
    [
      {
        type: 'paragraph',
        text: 'An interactive lab built on this subtopic’s worked examples. Change the values and watch the mathematics respond. It supplements the notes; it does not replace them.',
      },
      { type: 'activities', activities: rnActivitiesFor(unitId, 'lab') },
    ],
    { required: false },
  );
}

/**
 * Explore, Practise, Play, Create, Reflect and Review for a subtopic.
 * Practise is required (a subtopic is not complete without its practice); the
 * others are optional. Play: a game whose every scored action is a mathematical
 * decision. Create: art built from the subtopic's mathematics. Reflect: one
 * mathematical reflection, saved, never graded. Review: a recap from the notes,
 * App practice retrieval and the learner's own history with a next action.
 */
export const laterSteps = (unitId: RnUnitId): LessonStepDefinition[] => [
  exploreStep(unitId),
  practiseStep(unitId),
  step(
    'play',
    'Play',
    [
      {
        type: 'paragraph',
        text: 'A game built on this subtopic’s mathematics. Every point comes from a mathematical decision, and each answer explains why.',
      },
      { type: 'activities', activities: rnActivitiesFor(unitId, 'game') },
    ],
    { required: false },
  ),
  step(
    'create',
    'Create',
    [
      {
        type: 'paragraph',
        text: 'Make art from the mathematics of this subtopic. Course-aligned settings decide the mathematics; creative-extension settings only arrange and colour it. Explain the mathematics behind your art to complete it.',
      },
      { type: 'activities', activities: rnActivitiesFor(unitId, 'studio') },
    ],
    { required: false },
  ),
  step(
    'reflect',
    'Reflect',
    [
      {
        type: 'reflect',
        topicId: RN_TOPIC_ID,
        unitId,
        question: RN_REVIEW[unitId].reflect,
        difficulties: RN_REVIEW[unitId].difficulties,
      },
    ],
    { required: false },
  ),
  step('review', 'Review', [...rnReviewRecap(unitId), { type: 'review', topicId: RN_TOPIC_ID, unitId }], {
    required: false,
  }),
];
