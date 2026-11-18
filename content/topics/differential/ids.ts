/**
 * Stable identifiers for Topic 3. Topic and unit ids are database keys
 * (learning_topics.id / learning_units.id, migration
 * 20261015000000_differential_rn_topic.sql) and must never change once
 * learners have progress stored against them.
 */
export const RN_TOPIC_ID = 'differential-calculus-rn';

export const RN_UNITS = {
  functions: 'rn-functions-of-several-variables',
  partials: 'rn-partial-derivatives',
  threeVariables: 'rn-partial-derivatives-three-variables',
  higherOrder: 'rn-higher-order-partials',
  totalDifferential: 'rn-total-differential',
  chainOne: 'rn-chain-rule-one-variable',
  chainTwo: 'rn-chain-rule-two-variables',
  changeVariables: 'rn-changing-variables',
  secondOrder: 'rn-second-order-chain-rule',
} as const;

export type RnUnitId = (typeof RN_UNITS)[keyof typeof RN_UNITS];
