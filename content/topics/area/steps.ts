import type { ContentBlock, LessonStepDefinition, LessonStepKind, PracticeItem, SourceRef } from '../../types';
import type { FigureSpec } from '@/lib/figures/scene';

import { areaActivitiesFor } from './activities';
import { CHAPTER2_PRACTICE } from './chapterPractice';
import { CHAPTER2_FIGURES } from './figures';
import { AREA_TOPIC_ID, type AreaUnitId } from './ids';
import { CHAPTER2_INVENTORY } from './inventory';
import { AREA_TECHNIQUES } from './practice';
import { AREA_REVIEW, reviewRecap } from './review';
import { CH2 } from './sources';
import { TUTORIAL2_ITEMS } from './tutorial2';

/** Source reference for a Chapter 2 inventory item (section and page from the inventory). */
export function src(inventoryId: string): SourceRef {
  const entry = CHAPTER2_INVENTORY.find((i) => i.id === inventoryId);
  if (!entry) throw new Error(`Unknown Chapter 2 inventory item ${inventoryId}`);
  return { document: CH2, ...(entry.section === '2' ? {} : { section: entry.section }), page: entry.page, inventoryId };
}

/** Review ids recorded for an inventory item (shown as printed, with a note). */
export function reviewOf(inventoryId: string): { reviewIds?: string[] } {
  const ids = CHAPTER2_INVENTORY.find((i) => i.id === inventoryId)?.reviewIds;
  return ids ? { reviewIds: ids } : {};
}

/** A figure block for a figure of the notes (by inventory id). */
export function figure(inventoryId: string): ContentBlock {
  const spec = CHAPTER2_FIGURES[inventoryId];
  if (!spec) throw new Error(`No figure for ${inventoryId}`);
  return { type: 'figure', figure: spec, source: src(inventoryId) };
}

/** A figure made for the app (always labelled as such); not part of the source inventory. */
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

/** A step delivered after the content, practice and Explore phases (shown honestly as not yet available). */
export function planned(kind: LessonStepKind, title: string, preview: string): LessonStepDefinition {
  return {
    key: kind,
    kind,
    title,
    required: false,
    availability: { status: 'planned', phase: 4, preview },
    blocks: [],
  };
}

/** Try it: the chapter's "You Try It" for this subtopic, worked in My Working. */
export function tryItStep(unitId: AreaUnitId): LessonStepDefinition {
  const items = CHAPTER2_PRACTICE.filter((item) => item.unitId === unitId);
  return step('try-it', 'You Try It', [
    {
      type: 'practiceGroup',
      title: 'You Try It',
      text: 'From the course notes. Write your working one step at a time in My Working: check each step, ask for a hint or say you are stuck, then check your final answer.',
      items,
    },
  ]);
}

function groups(items: readonly PracticeItem[]): ContentBlock[] {
  const order = Object.keys(AREA_TECHNIQUES);
  const byTechnique = new Map<string, PracticeItem[]>();
  for (const item of items) byTechnique.set(item.technique, [...(byTechnique.get(item.technique) ?? []), item]);
  return [...byTechnique.entries()]
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([technique, list]) => ({
      type: 'practiceGroup',
      title: AREA_TECHNIQUES[technique as keyof typeof AREA_TECHNIQUES],
      items: list,
    }));
}

/** Practise: every Tutorial 2 part for this subtopic, grouped by method. */
export function practiseStep(unitId: AreaUnitId): LessonStepDefinition {
  const items = TUTORIAL2_ITEMS.filter((item) => item.unitId === unitId);
  return step(
    'practise',
    'Practise',
    [
      {
        type: 'paragraph',
        text: 'Tutorial 2 practice for this subtopic, grouped by method. Open a question to write your working step by step, check each step and your final answer, and ask for hints when you need them.',
      },
      ...groups(items),
    ],
    {},
  );
}

/** Explore: the subtopic's interactive tools (optional). */
export function exploreStep(unitId: AreaUnitId): LessonStepDefinition {
  return step(
    'explore',
    'Explore',
    [
      {
        type: 'paragraph',
        text: 'Interactive versions of the figures in the notes. Change the values and watch the mathematics respond.',
      },
      { type: 'activities', activities: areaActivitiesFor(unitId, 'lab') },
    ],
    { required: false },
  );
}

/**
 * Play, Create, Reflect and Review close every subtopic (all optional).
 * Play: a game whose every scored action is a mathematical decision. Create:
 * art built from the subtopic's mathematics. Reflect: one mathematical
 * reflection, saved. Review: a recap from the notes, App practice retrieval
 * and the learner's own history with a next action.
 */
export function laterSteps(unitId: AreaUnitId): LessonStepDefinition[] {
  const review = AREA_REVIEW[unitId];
  return [
    step(
      'play',
      'Play',
      [
        {
          type: 'paragraph',
          text: 'A game built on this subtopic’s mathematics. Every point comes from a mathematical decision, and each answer explains why.',
        },
        { type: 'activities', activities: areaActivitiesFor(unitId, 'game') },
      ],
      { required: false },
    ),
    step(
      'create',
      'Create',
      [
        {
          type: 'paragraph',
          text: 'Make art from the mathematics of this subtopic. Course-aligned settings decide the mathematics; creative-extension settings only arrange and style it. Explain the mathematics behind your art to complete it.',
        },
        { type: 'activities', activities: areaActivitiesFor(unitId, 'studio') },
      ],
      { required: false },
    ),
    step(
      'reflect',
      'Reflect',
      [
        {
          type: 'reflect',
          topicId: AREA_TOPIC_ID,
          unitId,
          question: review.reflect,
          difficulties: review.difficulties,
        },
      ],
      { required: false },
    ),
    step('review', 'Review', [...reviewRecap(unitId), { type: 'review', topicId: AREA_TOPIC_ID, unitId }], {
      required: false,
    }),
  ];
}
