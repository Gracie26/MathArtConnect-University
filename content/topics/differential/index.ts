/**
 * Topic 3: Differential Calculus in ℝⁿ (UNAM S3512MC Calculus II, Chapter 3,
 * Tutorial 3 and Tutorial 4).
 *
 * Nine learner-facing subtopics (approved audit and specification); the
 * notes' own sections 3.1 to 3.4 stay openable inside them. Subtopics 6–9
 * all come from printed §3.4. See sources.ts for traceability.
 */
import type { PracticeMode, TopicDefinition } from '../../types';

import { RN_ACTIVITIES, RN_STUDIOS } from './activities';
import { RN_PRACTICE_ITEMS, RN_PRACTICE_SOURCES } from './allPractice';
import { RN_TOPIC_ID } from './ids';
import { RN_RETRIEVAL } from './review';
import { buildRnSections } from './sections';
import { chainRuleOne } from './units/chainOne';
import { chainRuleTwo } from './units/chainTwo';
import { changingVariables } from './units/changeVariables';
import { functionsOfSeveralVariables } from './units/functions';
import { higherOrder } from './units/higherOrder';
import { partialDerivatives } from './units/partials';
import { secondOrderChainRule } from './units/secondOrder';
import { threeVariables } from './units/threeVariables';
import { totalDifferential } from './units/totalDifferential';

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
  functionsOfSeveralVariables,
  partialDerivatives,
  threeVariables,
  higherOrder,
  totalDifferential,
  chainRuleOne,
  chainRuleTwo,
  changingVariables,
  secondOrderChainRule,
];

export const differentialTopic: TopicDefinition = {
  id: RN_TOPIC_ID,
  family: 'derivatives',
  title: 'Differential Calculus in ℝⁿ',
  shortTitle: 'Calculus in ℝⁿ',
  subtitle: 'Calculus II',
  description:
    'Functions of several variables, partial derivatives, higher-order partial derivatives, the total differential and chain rules for functions of several variables.',
  course: { code: 'S3512MC', title: 'Calculus II', institution: 'University of Namibia' },
  contentVersion: '1.0.0',
  isDemo: false,
  units,
  practiceModes,
  activities: RN_ACTIVITIES,
  questions: [],
  practiceItems: RN_PRACTICE_ITEMS,
  practiceSourceList: RN_PRACTICE_SOURCES,
  retrievalItems: [...RN_RETRIEVAL],
  rnStudios: RN_STUDIOS,
  sections: buildRnSections(units, RN_PRACTICE_ITEMS),
};

export { RN_TOPIC_ID, RN_UNITS } from './ids';
