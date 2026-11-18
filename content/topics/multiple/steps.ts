import type { ContentBlock, LessonStepDefinition, LessonStepKind, PracticeItem, SourceRef } from '../../types';

import { miActivitiesFor } from './activities';
import { MI_PRACTICE_ITEMS } from './allPractice';
import { MI_TOPIC_ID, MI_UNITS as U, type MiUnitId } from './ids';
import { CHAPTER5_INVENTORY } from './inventory';
import { MI_TECHNIQUES } from './practice';
import { MI_REVIEW, miReviewRecap } from './review';
import { CH5 } from './sources';

/** Source reference for a Chapter 5 inventory item (section and page from the inventory). */
export function src(inventoryId: string): SourceRef {
  const entry = CHAPTER5_INVENTORY.find((i) => i.id === inventoryId);
  if (!entry) throw new Error(`Unknown Chapter 5 inventory item ${inventoryId}`);
  return { document: CH5, ...(entry.section === '5' ? {} : { section: entry.section }), page: entry.page, inventoryId };
}

/** App guidance shown with the notes: written for the app, never presented as UNAM material. */
export const appGuidance = (text: string, tex?: string): ContentBlock => ({
  type: 'callout',
  tone: 'insight',
  title: 'APP GUIDANCE (written for this app, not in the course notes)',
  text,
  ...(tex ? { tex } : {}),
});

/**
 * A reading note next to printed text that may mislead (MR5 flags): the printed text stays exactly as it is,
 * and this separate note says what the app found, pending lecturer review.
 */
export const readingNote = (text: string, tex?: string): ContentBlock => ({
  type: 'callout',
  tone: 'caution',
  title: 'APP GUIDANCE: reading note (pending lecturer review)',
  text,
  ...(tex ? { tex } : {}),
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

/** One practice group per method, in the order of MI_TECHNIQUES. */
function groups(items: readonly PracticeItem[]): ContentBlock[] {
  const order = Object.keys(MI_TECHNIQUES);
  const byTechnique = new Map<string, PracticeItem[]>();
  for (const item of items) byTechnique.set(item.technique, [...(byTechnique.get(item.technique) ?? []), item]);
  return [...byTechnique.entries()]
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([technique, list]) => ({
      type: 'practiceGroup' as const,
      title: `Tutorial 6: ${MI_TECHNIQUES[technique as keyof typeof MI_TECHNIQUES]}`,
      ...(technique === 'mi-polar'
        ? {
            text: 'APP GUIDANCE: the notes give the polar formula (Example 5.4.1 and §5.4.1) but no example of describing a region with limits for $r$ and $\\theta$. Sketch the region first: a disc centred at the origin is $0 \\le r \\le R$, a ring is $R_{1} \\le r \\le R_{2}$, and a quarter in the first quadrant is $0 \\le \\theta \\le \\frac{\\pi}{2}$.',
          }
        : technique === 'mi-sketch-switch'
          ? {
              text: 'The sketch is a self-check (compare it with the region the app draws); the new limits are checked automatically.',
            }
          : {}),
      items: list,
    }));
}

/** Practise: every Tutorial 6 item for this subtopic, by method. */
export function practiseStep(unitId: MiUnitId): LessonStepDefinition {
  const items = MI_PRACTICE_ITEMS.filter((item) => item.unitId === unitId);
  const intro: ContentBlock = {
    type: 'paragraph',
    text: 'Tutorial 6 questions for this subtopic, grouped by method. Each question shows where it comes from. Open a question to write your working step by step, check each step and your final answer, and ask for hints when you need them. Equivalent forms (other limits for the same region, another order, another form of the answer) are accepted. Hints and step-by-step help are APP GUIDANCE; full worked answers are APP-GENERATED SOLUTIONS, pending lecturer review. Tutorial 6 has no official answer key.',
  };
  const elsewhere: ContentBlock[] =
    unitId === U.orders
      ? [
          {
            type: 'paragraph',
            text: 'Tutorial 6 Questions 5 to 9 (double integrals over regions) are in Double Integrals and Volume, and the polar questions are in Change of Variables: Jacobians.',
          },
        ]
      : [];
  return step('practise', 'Practise', [intro, ...groups(items), ...elsewhere]);
}

/**
 * Explore, Practise, Play, Create (only where a Create activity is mathematically meaningful), Reflect and
 * Review for a subtopic. Practise is required; the others are optional.
 */
export function laterSteps(unitId: MiUnitId): LessonStepDefinition[] {
  const studios = miActivitiesFor(unitId, 'studio');
  return [
    step(
      'explore',
      'Explore',
      [
        {
          type: 'paragraph',
          text: 'An interactive lab built on this subtopic’s worked examples. Change the values and watch the mathematics respond. Every region, solid and grid in it is an app-created visualisation, not an official UNAM figure. It supplements the notes; it does not replace them.',
        },
        { type: 'activities', activities: miActivitiesFor(unitId, 'lab') },
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
        { type: 'activities', activities: miActivitiesFor(unitId, 'game') },
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
                text: 'Make art from the mathematics of this subtopic. Course-aligned settings decide the mathematics; creative-extension settings only arrange and colour it. Math View shows the coordinates; Art View is the clean artwork. The artwork is an app-created visualisation. Explain the mathematics behind your art to complete it.',
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
          topicId: MI_TOPIC_ID,
          unitId,
          question: MI_REVIEW[unitId].reflect,
          difficulties: MI_REVIEW[unitId].difficulties,
        },
      ],
      { required: false },
    ),
    step('review', 'Review', [...miReviewRecap(unitId), { type: 'review', topicId: MI_TOPIC_ID, unitId }], {
      required: false,
    }),
  ];
}
