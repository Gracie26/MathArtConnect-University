/**
 * Topic 4: Applications of Partial Derivatives (UNAM S3512MC Calculus II,
 * Chapter 4 "Applications of the Partial Derivative" and Tutorial 5).
 *
 * Four learner-facing subtopics (approved audit and specification); the
 * notes' own sections 4.1 to 4.3.1 stay openable inside them. §4.3.1 is taught
 * in Subtopics 3 and 4. See sources.ts for traceability and manualReview.ts
 * for the lecturer-review flags MR4-01 to MR4-12.
 */
import type { PracticeMode, TopicDefinition } from '../../types';

import { PDA_ACTIVITIES, PDA_STUDIOS } from './activities';
import { PDA_PRACTICE_ITEMS, PDA_PRACTICE_SOURCES } from './allPractice';
import { PDA_TOPIC_ID } from './ids';
import { PDA_RETRIEVAL } from './review';
import { buildPdaSections } from './sections';
import { criticalPoints } from './units/criticalPoints';
import { gradient } from './units/gradient';
import { secondPartials } from './units/secondPartials';
import { tangentPlanes } from './units/tangentPlanes';

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

const units = [gradient, tangentPlanes, criticalPoints, secondPartials];

export const applicationsTopic: TopicDefinition = {
  id: PDA_TOPIC_ID,
  family: 'applications-of-derivatives',
  title: 'Applications of Partial Derivatives',
  shortTitle: 'Partial derivatives applied',
  subtitle: 'Calculus II',
  description:
    'The gradient, tangent planes and normal lines to surfaces, critical points and relative extrema, and the Second Partials Test.',
  course: { code: 'S3512MC', title: 'Calculus II', institution: 'University of Namibia' },
  contentVersion: '1.0.0',
  isDemo: false,
  units,
  practiceModes,
  activities: PDA_ACTIVITIES,
  questions: [],
  practiceItems: PDA_PRACTICE_ITEMS,
  practiceSourceList: PDA_PRACTICE_SOURCES,
  retrievalItems: [...PDA_RETRIEVAL],
  paStudios: PDA_STUDIOS,
  sections: buildPdaSections(units, PDA_PRACTICE_ITEMS),
};

export { PDA_TOPIC_ID, PDA_UNITS } from './ids';
