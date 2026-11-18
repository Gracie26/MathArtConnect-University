/**
 * Every Topic 4 practice item: Tutorial 5 (35 parts) and §4.3.1 APP PRACTICE
 * (4 items); 39 in all (approved, locked counts).
 */
import type { PracticeItem, PracticeSourceOption } from '../../types';

import { APP_PRACTICE_ITEMS } from './appPractice';
import { TUT5 } from './sources';
import { TUTORIAL5_ITEMS } from './tutorial5';

export const PDA_PRACTICE_ITEMS: PracticeItem[] = [...TUTORIAL5_ITEMS, ...APP_PRACTICE_ITEMS];

/** The practice-source filters of Topic 4 (Practice screens). */
export const PDA_PRACTICE_SOURCES: PracticeSourceOption[] = [
  {
    id: 'tutorial-5',
    label: 'Tutorial 5',
    description:
      'Every Tutorial 5 question (Gradient and Extrema of Functions of Two Variables), by subtopic and method',
    documents: [TUT5],
  },
  {
    id: 'app-practice',
    label: 'App practice',
    description: 'Written for this app on finding critical points (§4.3.1)',
    sourceTypes: ['app-practice'],
  },
];
