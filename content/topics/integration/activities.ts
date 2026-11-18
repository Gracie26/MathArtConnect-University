/**
 * Explore, Play and Create activities for Topic 1, each placed under the
 * mathematics it teaches (the approved subtopic-by-subtopic mapping). Graph
 * art is used only where graphs carry the concept: anti-derivative families,
 * power functions, trigonometric and algebraic substitution, and trigonometric
 * patterns. Partial fractions and integration by parts use structure and
 * solution-flow creations instead.
 */
import type { TopicActivity } from '../../types';

import { INTEGRATION_TOPIC_ID, INTEGRATION_UNITS as U } from './ids';
import { TABLE_1_1 } from './sources';

const available = { status: 'available' as const };
const activity = (a: Omit<TopicActivity, 'topicId' | 'availability'>): TopicActivity => ({
  ...a,
  topicId: INTEGRATION_TOPIC_ID,
  availability: available,
});

export const INTEGRATION_ACTIVITIES: TopicActivity[] = [
  // 1. Understanding Integration
  activity({
    id: 'family-of-curves',
    kind: 'lab',
    title: 'Family of Curves',
    summary: 'Move C and see why every anti-derivative in the family has the same derivative.',
    unitId: U.understanding,
    sections: ['1-1', '1-2'],
  }),
  activity({
    id: 'reverse-the-derivative',
    kind: 'game',
    title: 'Reverse the Derivative',
    summary: 'Find every function whose derivative is shown, including those that differ by a constant.',
    unitId: U.understanding,
    sections: ['1-1', '1-2'],
  }),
  activity({
    id: 'antiderivative-curve-art',
    kind: 'studio',
    createType: 'graphArt',
    title: 'Antiderivative Curve Art',
    summary: 'Stack the curves F(x) + C into a ribbon or a vase: move C and keep each copy.',
    unitId: U.understanding,
    sections: ['1-1', '1-2'],
  }),
  // 2. Basic Integration Rules
  activity({
    id: 'power-rule-machine',
    kind: 'lab',
    title: 'Power Rule Machine',
    summary: 'Change the exponent and watch the power rule, including the special case n = −1.',
    unitId: U.basicRules,
    sections: ['1-3', '1-4'],
  }),
  activity({
    id: 'rule-builder',
    kind: 'game',
    title: 'Rule Builder',
    summary: 'Put the steps of an integration in the right order.',
    unitId: U.basicRules,
    sections: ['1-3', '1-4'],
  }),
  activity({
    id: 'function-curve-composer',
    kind: 'studio',
    createType: 'graphArt',
    title: 'Function Curve Composer',
    summary: 'Integrate powers of x and compose their curves into a design, from a fan to a butterfly.',
    unitId: U.basicRules,
    sections: ['1-3', '1-4'],
  }),
  // 3. Substitution
  activity({
    id: 'substitution-highlighter',
    kind: 'lab',
    title: 'Substitution Highlighter',
    summary: 'Tap the inner function, find du, and watch the integral transform.',
    unitId: U.substitution,
    sections: ['1-5'],
  }),
  activity({
    id: 'transformation-lab',
    kind: 'lab',
    title: 'Transformation Lab',
    summary: 'Step forwards and back through a substitution, with a history of each change.',
    unitId: U.substitution,
    sections: ['1-5'],
  }),
  activity({
    id: 'spot-the-substitution',
    kind: 'game',
    title: 'Spot the Substitution',
    summary: 'Choose u, find du, rewrite, integrate and substitute back. Each reasoning step scores.',
    unitId: U.substitution,
    sections: ['1-5'],
  }),
  activity({
    id: 'transformation-art',
    kind: 'studio',
    createType: 'graphArt',
    title: 'Transformation Art',
    summary: 'Substitute u = ax + b into a curve and watch it move and squeeze: before and after, layered into art.',
    unitId: U.substitution,
    sections: ['1-5'],
  }),
  // 4. Partial Fractions
  activity({
    id: 'fraction-decomposer',
    kind: 'lab',
    title: 'Fraction Decomposer',
    summary: 'Classify the denominator and build the decomposition template, dividing first if needed.',
    unitId: U.partialFractions,
    sections: ['1-6', '1-6-1', '1-6-2', '1-6-3', '1-7'],
  }),
  activity({
    id: 'build-the-decomposition',
    kind: 'game',
    title: 'Build the Decomposition',
    summary: 'Classify, factorise, choose the form, find the constants and integrate.',
    unitId: U.partialFractions,
    sections: ['1-6', '1-6-1', '1-6-2', '1-6-3'],
  }),
  activity({
    id: 'decomposition-map',
    kind: 'studio',
    createType: 'structure',
    title: 'Decomposition Map',
    summary: 'Map a rational function from factorisation to anti-derivatives.',
    unitId: U.partialFractions,
    sections: ['1-6', '1-6-1', '1-6-2', '1-6-3'],
  }),
  // 5. Algebraic and Trigonometric Substitution
  activity({
    id: 'trig-transformation-lab',
    kind: 'lab',
    title: 'Trig/Algebraic Transformation Lab',
    summary: 'Browse the table of suggested substitutions, choose one and watch the expression transform.',
    unitId: U.algebraicTrig,
    sections: ['1-8', TABLE_1_1, '1-8-1', '1-9'],
  }),
  activity({
    id: 'transformation-challenge',
    kind: 'game',
    title: 'Transformation Challenge',
    summary: 'Match each expression to its substitution and its transformed form.',
    unitId: U.algebraicTrig,
    sections: ['1-8', TABLE_1_1, '1-9'],
  }),
  activity({
    id: 'equation-art-studio',
    kind: 'studio',
    createType: 'graphArt',
    title: 'Equation Art Studio',
    summary:
      'Make pictures from many equations: a flower, a heart, waves. Layers, restrictions, sliders, zoom and pan.',
    unitId: U.algebraicTrig,
    sections: [TABLE_1_1, '1-8'],
  }),
  activity({
    id: 'trig-pattern-studio',
    kind: 'studio',
    createType: 'graphArt',
    title: 'Trig Pattern Studio',
    summary: 'Morph sine and cosine patterns live with parameter sliders.',
    unitId: U.algebraicTrig,
    sections: ['1-9'],
  }),
  // 6. Integration by Parts
  activity({
    id: 'choose-u-lab',
    kind: 'lab',
    title: 'Choose U Lab',
    summary: 'Pick u and dv and see what each choice does to the remaining integral.',
    unitId: U.byParts,
    sections: ['1-10'],
  }),
  activity({
    id: 'repeated-parts-flow',
    kind: 'lab',
    title: 'Repeated-Parts Flow',
    summary: 'Follow integration by parts applied again and again, step by step.',
    unitId: U.byParts,
    sections: ['1-11'],
  }),
  activity({
    id: 'choose-u',
    kind: 'game',
    title: 'Choose U',
    summary: 'Choose a useful u and dv, then build du, v and the remaining integral.',
    unitId: U.byParts,
    sections: ['1-10', '1-11'],
  }),
  activity({
    id: 'solution-flow-builder',
    kind: 'studio',
    createType: 'flow',
    title: 'Solution Flow Builder',
    summary: 'Build the flow of an integration by parts, from u and dv to the final answer.',
    unitId: U.byParts,
    sections: ['1-10', '1-11'],
  }),
  // 7. Advanced Integration Patterns
  activity({
    id: 'pattern-explorer',
    kind: 'lab',
    title: 'Pattern Explorer',
    summary: 'Change the powers m and n and see which strategy each pattern calls for.',
    unitId: U.advancedPatterns,
    sections: ['1-12', '1-13', '1-14'],
  }),
  activity({
    id: 'reduction-flow',
    kind: 'lab',
    title: 'Reduction Flow',
    summary: 'Follow a reduction formula from Iₙ down to an integral you can do directly.',
    unitId: U.advancedPatterns,
    sections: ['1-12'],
  }),
  activity({
    id: 'pattern-detective',
    kind: 'game',
    title: 'Pattern Detective',
    summary: 'Choose the right strategy before calculating.',
    unitId: U.advancedPatterns,
    sections: ['1-12', '1-13', '1-14'],
  }),
  activity({
    id: 'dynamic-pattern-studio',
    kind: 'studio',
    createType: 'graphArt',
    title: 'Dynamic Pattern Studio',
    summary: 'Mandalas and roses from sine and cosine that change live as you move a slider or press play.',
    unitId: U.advancedPatterns,
    sections: ['1-13'],
  }),
];

export const activitiesFor = (unitId: string, kind: TopicActivity['kind']): TopicActivity[] =>
  INTEGRATION_ACTIVITIES.filter((a) => a.unitId === unitId && a.kind === kind);
