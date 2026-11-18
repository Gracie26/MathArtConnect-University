/**
 * Stable identifiers for Topic 5. Topic and unit ids are database keys
 * (learning_topics.id / learning_units.id, migration
 * 20261019000000_multiple_integration_topic.sql) and must never change once
 * learners have progress stored against them.
 */
export const MI_TOPIC_ID = 'multiple-integration';

export const MI_UNITS = {
  iterated: 'mi-iterated-integrals',
  orders: 'mi-orders-of-integration',
  doubleVolume: 'mi-double-integrals-volume',
  triple: 'mi-triple-integrals',
  jacobians: 'mi-change-of-variables-jacobians',
} as const;

export type MiUnitId = (typeof MI_UNITS)[keyof typeof MI_UNITS];
