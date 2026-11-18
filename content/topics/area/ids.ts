/**
 * Stable identifiers for Topic 2. Topic and unit ids are database keys
 * (learning_topics.id / learning_units.id, migration
 * 20261014000000_integration_area_topic.sql) and must never change once
 * learners have progress stored against them.
 */
export const AREA_TOPIC_ID = 'integration-area';

export const AREA_UNITS = {
  riemann: 'area-riemann-sums',
  definite: 'area-definite-integral',
  properties: 'area-properties',
  ftc: 'area-fundamental-theorem',
  mvt: 'area-mean-value-theorem',
  typeOne: 'area-improper-infinite-intervals',
  typeTwo: 'area-improper-discontinuous',
  comparison: 'area-comparison-test',
} as const;

export type AreaUnitId = (typeof AREA_UNITS)[keyof typeof AREA_UNITS];
