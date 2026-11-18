/**
 * Every Topic 3 practice item: Tutorial 3 (125 parts), Tutorial 4 (41 parts)
 * and §3.3 APP PRACTICE (3 items); 169 in all (approved, locked counts).
 */
import type { PracticeItem, PracticeSourceOption } from '../../types';

import { APP_PRACTICE_ITEMS } from './appPractice';
import { TUT3, TUT4 } from './sources';
import { TUTORIAL3_ITEMS } from './tutorial3';
import { TUTORIAL4_ITEMS } from './tutorial4';

export const RN_PRACTICE_ITEMS: PracticeItem[] = [...TUTORIAL3_ITEMS, ...TUTORIAL4_ITEMS, ...APP_PRACTICE_ITEMS];

/** The practice-source filters of Topic 3 (Practice screens). */
export const RN_PRACTICE_SOURCES: PracticeSourceOption[] = [
  {
    id: 'tutorial-3',
    label: 'Tutorial 3',
    description: 'Every Tutorial 3 question (Differential Calculus in ℝⁿ Part 1), by subtopic and method',
    documents: [TUT3],
  },
  {
    id: 'tutorial-4',
    label: 'Tutorial 4',
    description: 'Every Tutorial 4 question (Differential Calculus in ℝⁿ Part 2), by subtopic and method',
    documents: [TUT4],
  },
  {
    id: 'app-practice',
    label: 'App practice',
    description: 'Written for this app on the total differential (§3.3), which the tutorials do not cover',
    sourceTypes: ['app-practice'],
  },
];
