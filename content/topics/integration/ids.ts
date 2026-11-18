/**
 * Stable identifiers. Topic and unit ids are database keys
 * (learning_topics.id / learning_units.id, migration
 * 20261012000000_integration_topic.sql) and must never change once learners
 * have progress stored against them.
 */
export const INTEGRATION_TOPIC_ID = 'integration';

export const INTEGRATION_UNITS = {
  understanding: 'integration-understanding',
  basicRules: 'integration-basic-rules',
  substitution: 'integration-substitution',
  partialFractions: 'integration-partial-fractions',
  algebraicTrig: 'integration-algebraic-trig-substitution',
  byParts: 'integration-by-parts',
  advancedPatterns: 'integration-advanced-patterns',
} as const;

export type IntegrationUnitId = (typeof INTEGRATION_UNITS)[keyof typeof INTEGRATION_UNITS];
