/**
 * Every Topic 5 course practice item: Tutorial 6 (66 items; approved, locked
 * count). The App practice retrieval questions in Review are separate
 * (`retrievalItems`) and are not counted here.
 */
import type { PracticeItem, PracticeSourceOption } from '../../types';

import { TUT6 } from './sources';
import { TUTORIAL6_ITEMS } from './tutorial6';

export const MI_PRACTICE_ITEMS: PracticeItem[] = [...TUTORIAL6_ITEMS];

/** The practice-source filter of Topic 5 (Practice screens). */
export const MI_PRACTICE_SOURCES: PracticeSourceOption[] = [
  {
    id: 'tutorial-6',
    label: 'Tutorial 6',
    description: 'Every Tutorial 6 question (Multiple Integration), by subtopic and method',
    documents: [TUT6],
  },
];
