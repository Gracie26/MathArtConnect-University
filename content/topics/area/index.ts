/**
 * Topic 2: Integration as a Process of Finding the Area Under the Graph
 * (UNAM S3512MC Calculus II, Chapter 2 and Tutorial 2).
 *
 * Eight learner-facing subtopics (approved audit); the notes' own sections
 * 2.1 to 2.5.3 stay openable inside them. See sources.ts for traceability.
 */
import type { PracticeMode, TopicDefinition } from '../../types';

import { AREA_ACTIVITIES, AREA_STUDIOS } from './activities';
import { CHAPTER2_PRACTICE } from './chapterPractice';
import { AREA_TOPIC_ID } from './ids';
import { AREA_RETRIEVAL } from './review';
import { buildAreaSections } from './sections';
import { TUTORIAL2_ITEMS } from './tutorial2';
import { comparisonTest } from './units/comparison';
import { theDefiniteIntegral } from './units/definite';
import { fundamentalTheorem } from './units/ftc';
import { meanValueTheorem } from './units/mvt';
import { propertiesOfTheDefiniteIntegral } from './units/properties';
import { areaAndRiemannSums } from './units/riemann';
import { improperInfiniteIntervals } from './units/typeOne';
import { improperDiscontinuous } from './units/typeTwo';

const available = { status: 'available' as const };

const practiceModes: PracticeMode[] = [
  {
    id: 'guided',
    title: 'Guided Practice',
    summary: 'Easiest questions first, with step checks, hints and a full walkthrough when you need it.',
    availability: available,
  },
  {
    id: 'independent',
    title: 'Independent Practice',
    summary: 'Every question in course order. Work it out yourself; hints and checks are there if you ask.',
    availability: available,
  },
  {
    id: 'challenge',
    title: 'Challenge Mode',
    summary: 'Hardest questions first. Hints unlock after your first answer check. No penalties for mistakes.',
    availability: available,
  },
];

const units = [
  areaAndRiemannSums,
  theDefiniteIntegral,
  propertiesOfTheDefiniteIntegral,
  fundamentalTheorem,
  meanValueTheorem,
  improperInfiniteIntervals,
  improperDiscontinuous,
  comparisonTest,
];

export const areaTopic: TopicDefinition = {
  id: AREA_TOPIC_ID,
  family: 'integration',
  title: 'Integration as a Process of Finding the Area Under the Graph',
  shortTitle: 'Area Under the Graph',
  subtitle: 'Calculus II',
  description:
    'Definite integrals as limits of Riemann sums, their properties, the Fundamental Theorem of Calculus, the Mean Value Theorem for Integrals and improper integrals.',
  course: { code: 'S3512MC', title: 'Calculus II', institution: 'University of Namibia' },
  contentVersion: '1.0.0',
  isDemo: false,
  units,
  practiceModes,
  activities: AREA_ACTIVITIES,
  areaStudios: AREA_STUDIOS,
  questions: [],
  practiceItems: [...CHAPTER2_PRACTICE, ...TUTORIAL2_ITEMS],
  retrievalItems: [...AREA_RETRIEVAL],
  sections: buildAreaSections(units),
  practiceSources: { chapter: 'Chapter practice', tutorial: 'Tutorial 2 practice' },
};

export { AREA_TOPIC_ID, AREA_UNITS } from './ids';
