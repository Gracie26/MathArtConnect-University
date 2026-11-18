import { DEFAULT_TOPIC_ID, getTopic, topicRegistry } from './registry';
import type { TopicDefinition } from './types';

export interface ActiveTopicSources {
  /** learning_topics row with is_active = true (backend), if available. */
  remoteActiveTopicId?: string | null;
  /** EXPO_PUBLIC_ACTIVE_TOPIC_ID, for local development. */
  envOverride?: string | null;
}

/**
 * Resolves which topic the app teaches.
 * Priority: env override → database active topic → bundled default.
 * Unknown ids (e.g. a database topic not yet shipped in this app version)
 * fall through to the next source instead of breaking the app.
 */
export function resolveActiveTopic({ remoteActiveTopicId, envOverride }: ActiveTopicSources = {}): TopicDefinition {
  for (const candidate of [envOverride, remoteActiveTopicId]) {
    if (candidate) {
      const topic = getTopic(candidate);
      if (topic) return topic;
    }
  }
  const fallback = topicRegistry[DEFAULT_TOPIC_ID];
  if (!fallback) {
    throw new Error(`Default topic "${DEFAULT_TOPIC_ID}" is not registered`);
  }
  return fallback;
}
