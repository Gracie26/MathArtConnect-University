import type { ContentBlock, LessonStepDefinition, LessonStepKind, PracticeItem, SourceRef } from '../../types';

import { pdaActivitiesFor } from './activities';
import { PDA_PRACTICE_ITEMS } from './allPractice';
import { PDA_TOPIC_ID, PDA_UNITS as U, type PdaUnitId } from './ids';
import { CHAPTER4_INVENTORY } from './inventory';
import { PDA_TECHNIQUES } from './practice';
import { PDA_REVIEW, pdaReviewRecap } from './review';
import { CH4 } from './sources';

/** Source reference for a Chapter 4 inventory item (section and page from the inventory). */
export function src(inventoryId: string): SourceRef {
  const entry = CHAPTER4_INVENTORY.find((i) => i.id === inventoryId);
  if (!entry) throw new Error(`Unknown Chapter 4 inventory item ${inventoryId}`);
  return { document: CH4, ...(entry.section === '4' ? {} : { section: entry.section }), page: entry.page, inventoryId };
}

/** App guidance shown with the notes: written for the app, never presented as UNAM material. */
export const appGuidance = (text: string): ContentBlock => ({
  type: 'callout',
  tone: 'insight',
  title: 'APP GUIDANCE (written for this app, not in the course notes)',
  text,
});

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

/** One practice group per method, in the order of PDA_TECHNIQUES. */
function groups(source: string, text: string | undefined, items: readonly PracticeItem[]): ContentBlock[] {
  const order = Object.keys(PDA_TECHNIQUES);
  const byTechnique = new Map<string, PracticeItem[]>();
  for (const item of items) byTechnique.set(item.technique, [...(byTechnique.get(item.technique) ?? []), item]);
  return [...byTechnique.entries()]
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([technique, list], index) => ({
      type: 'practiceGroup',
      title:
        technique === 'pda-total-differential'
          ? PDA_TECHNIQUES['pda-total-differential']
          : `${source}: ${PDA_TECHNIQUES[technique as keyof typeof PDA_TECHNIQUES]}`,
      ...(technique === 'pda-total-differential'
        ? {
            text: 'Tutorial 5 Question 1. This is prior knowledge from Chapter 3 §3.3 (Topic 3, The Total Differential), revisited here because the coefficients of $dx$, $dy$ (and $dz$) in a total differential are exactly the first partial derivatives: the components of the gradient in §4.1.',
          }
        : index === 0 && text
          ? { text }
          : {}),
      items: list,
    }));
}

/** Practise: every Tutorial 5 part for this subtopic (and §4.3.1 App practice), by source and method. */
export function practiseStep(unitId: PdaUnitId): LessonStepDefinition {
  const items = PDA_PRACTICE_ITEMS.filter((item) => item.unitId === unitId);
  const tutorial = items.filter((i) => i.sourceType === 'tutorial-question');
  const app = items.filter((i) => i.sourceType === 'app-practice');
  const intro: ContentBlock = {
    type: 'paragraph',
    text: 'Practice for this subtopic, grouped by source and method. Each question shows where it comes from. Open a question to write your working step by step, check each step and your final answer, and ask for hints when you need them. Hints and step-by-step help are APP GUIDANCE; full worked answers are APP-GENERATED SOLUTIONS, pending lecturer review. Tutorial 5 has no official answer key.',
  };
  const toSubtopic4: ContentBlock[] =
    unitId === U.criticalPoints
      ? [
          {
            type: 'paragraph',
            text: 'Tutorial 5 Question 5 asks you to find and classify stationary points, so its 13 parts are in the next subtopic, The Second Partials Test. Finding the critical points is the first half of every one of them.',
          },
        ]
      : [];
  return step('practise', 'Practise', [
    intro,
    ...groups('Tutorial 5', undefined, tutorial),
    ...groups(
      'APP PRACTICE',
      'Written for this app: Tutorial 5 has no question that asks only for critical points. These are not tutorial questions.',
      app,
    ),
    ...toSubtopic4,
  ]);
}

/**
 * Explore, Practise, Play, Create (only where a Create activity is mathematically
 * meaningful), Reflect and Review for a subtopic. Practise is required; the others
 * are optional.
 */
export function laterSteps(unitId: PdaUnitId): LessonStepDefinition[] {
  const studios = pdaActivitiesFor(unitId, 'studio');
  return [
    step(
      'explore',
      'Explore',
      [
        {
          type: 'paragraph',
          text: 'An interactive lab built on this subtopic’s worked examples. Change the values and watch the mathematics respond. Every graph, surface and vector in it is an app-created visualisation, not an official UNAM figure (Chapter 4 has no figures). It supplements the notes; it does not replace them.',
        },
        { type: 'activities', activities: pdaActivitiesFor(unitId, 'lab') },
      ],
      { required: false },
    ),
    practiseStep(unitId),
    step(
      'play',
      'Play',
      [
        {
          type: 'paragraph',
          text: 'A game built on this subtopic’s mathematics. Every point comes from a mathematical decision, and each answer explains why.',
        },
        { type: 'activities', activities: pdaActivitiesFor(unitId, 'game') },
      ],
      { required: false },
    ),
    ...(studios.length > 0
      ? [
          step(
            'create',
            'Create',
            [
              {
                type: 'paragraph',
                text: 'Make art from the mathematics of this subtopic. Course-aligned settings decide the mathematics; creative-extension settings only arrange and colour it. The artwork is an app-created visualisation. Explain the mathematics behind your art to complete it.',
              },
              { type: 'activities', activities: studios },
            ],
            { required: false },
          ),
        ]
      : []),
    step(
      'reflect',
      'Reflect',
      [
        {
          type: 'reflect',
          topicId: PDA_TOPIC_ID,
          unitId,
          question: PDA_REVIEW[unitId].reflect,
          difficulties: PDA_REVIEW[unitId].difficulties,
        },
      ],
      { required: false },
    ),
    step('review', 'Review', [...pdaReviewRecap(unitId), { type: 'review', topicId: PDA_TOPIC_ID, unitId }], {
      required: false,
    }),
  ];
}
