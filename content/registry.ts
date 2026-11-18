import { applicationsTopic } from './topics/applications';
import { areaTopic } from './topics/area';
import { demoTopic } from './topics/demo';
import { differentialTopic } from './topics/differential';
import { integrationTopic } from './topics/integration';
import type { PracticeItem, TopicDefinition } from './types';

/**
 * All topics bundled with the app, in the order shown on Learn. Demo content
 * stays registered as test infrastructure but is never listed for learners.
 */
export const topicRegistry: Readonly<Record<string, TopicDefinition>> = {
  [integrationTopic.id]: integrationTopic,
  [areaTopic.id]: areaTopic,
  [differentialTopic.id]: differentialTopic,
  [applicationsTopic.id]: applicationsTopic,
  [demoTopic.id]: demoTopic,
};

/** The first real topic. Matches the active learning_topics row. */
export const DEFAULT_TOPIC_ID = integrationTopic.id;

export function getTopic(id: string): TopicDefinition | undefined {
  return topicRegistry[id];
}

/**
 * Every question a learner can answer in a topic: the course practice items and the App practice
 * retrieval items in Review. Use for looking up attempts; course counts use `practiceItems` only.
 */
export function answerableItems(topic: TopicDefinition): PracticeItem[] {
  return [...(topic.practiceItems ?? []), ...(topic.retrievalItems ?? [])];
}

/** Topics learners can see (demo content excluded). */
export function listLearnerTopics(): TopicDefinition[] {
  return Object.values(topicRegistry).filter((topic) => !topic.isDemo);
}
