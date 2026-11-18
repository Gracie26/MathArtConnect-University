/**
 * Stable identifiers for Topic 4. Topic and unit ids are database keys
 * (learning_topics.id / learning_units.id, migration
 * 20261018000000_partial_derivative_applications_topic.sql) and must never
 * change once learners have progress stored against them.
 */
export const PDA_TOPIC_ID = 'partial-derivative-applications';

export const PDA_UNITS = {
  gradient: 'pda-gradient',
  tangentPlanes: 'pda-tangent-planes-normal-lines',
  criticalPoints: 'pda-critical-points-relative-extrema',
  secondPartials: 'pda-second-partials-test',
} as const;

export type PdaUnitId = (typeof PDA_UNITS)[keyof typeof PDA_UNITS];
