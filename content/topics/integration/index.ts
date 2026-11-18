/**
 * Topic 1: Integration (UNAM S3512MC Calculus II).
 *
 * Mathematics follows the UNAM Chapter 1 notes and Tutorial 1 (see
 * sources.ts and docs/source-material/README.md). Source numbering is kept
 * internally for traceability and never used as a learner-facing label.
 */
import type { PracticeMode, TopicDefinition } from '../../types';

import { INTEGRATION_ACTIVITIES } from './activities';
import { INTEGRATION_APP_PRACTICE } from './appPractice';
import { CHAPTER1_PRACTICE } from './chapterPractice';
import { FLOW_CONFIGS, STUDIO_CONFIGS } from './create';
import { INTEGRATION_TOPIC_ID } from './ids';
import { buildSections } from './sections';
import { TUTORIAL1_ITEMS } from './tutorial1';
import { TUTORIAL2_CHAPTER1_ITEMS } from './tutorial2';
import { advancedPatterns } from './units/advancedPatterns';
import { algebraicTrigSubstitution } from './units/algebraicTrig';
import { basicIntegrationRules } from './units/basicRules';
import { integrationByParts } from './units/byParts';
import { partialFractions } from './units/partialFractions';
import { substitution } from './units/substitution';
import { understandingIntegration } from './units/understanding';

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
  understandingIntegration,
  basicIntegrationRules,
  substitution,
  partialFractions,
  algebraicTrigSubstitution,
  integrationByParts,
  advancedPatterns,
];

export const integrationTopic: TopicDefinition = {
  id: INTEGRATION_TOPIC_ID,
  family: 'integration',
  title: 'Integration',
  subtitle: 'Calculus II',
  description:
    'Understand integration as reversing differentiation and learn how to recognise and apply appropriate integration techniques.',
  course: { code: 'S3512MC', title: 'Calculus II', institution: 'University of Namibia' },
  contentVersion: '1.1.0',
  isDemo: false,
  units,
  practiceModes,
  activities: INTEGRATION_ACTIVITIES,
  questions: [],
  practiceItems: [...CHAPTER1_PRACTICE, ...TUTORIAL1_ITEMS, ...TUTORIAL2_CHAPTER1_ITEMS],
  // App practice from the Try it steps of the first two subtopics: kept out of course counts, still in history.
  retrievalItems: [...INTEGRATION_APP_PRACTICE],
  sections: buildSections(units),
  studios: STUDIO_CONFIGS,
  flows: FLOW_CONFIGS,
};

export { INTEGRATION_TOPIC_ID, INTEGRATION_UNITS } from './ids';
