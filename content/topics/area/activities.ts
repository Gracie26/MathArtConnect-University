/**
 * Explore activities for Topic 2: interactive versions of the figures in the
 * notes, each placed under the subtopic that teaches its mathematics. They
 * supplement the notes and never replace the source explanation. Play games
 * (games.ts) and Create studios are listed under the same subtopics.
 */
import type { AreaStudioConfig } from '@/lib/art/areaArt';

import type { TopicActivity } from '../../types';

import { ACTIVITY_EVIDENCE } from './evidence';
import { AREA_TOPIC_ID, AREA_UNITS as U, type AreaUnitId } from './ids';

const lab = (a: Omit<TopicActivity, 'topicId' | 'availability' | 'kind'>): TopicActivity => ({
  ...a,
  kind: 'lab',
  topicId: AREA_TOPIC_ID,
  availability: { status: 'available' },
});

const game = (a: Omit<TopicActivity, 'topicId' | 'availability' | 'kind'>): TopicActivity => ({
  ...a,
  kind: 'game',
  topicId: AREA_TOPIC_ID,
  availability: { status: 'available' },
  evidenceBasis: ACTIVITY_EVIDENCE[a.id] ?? [],
  alignment: 'course',
});

/** Art built on course mathematics, with clearly labelled creative-extension styling. */
const studio = (a: Omit<TopicActivity, 'topicId' | 'availability' | 'kind'>): TopicActivity => ({
  ...a,
  kind: 'studio',
  createType: 'areaArt',
  topicId: AREA_TOPIC_ID,
  availability: { status: 'available' },
  evidenceBasis: ACTIVITY_EVIDENCE[a.id] ?? [],
  alignment: 'creative',
});

export const AREA_ACTIVITIES: TopicActivity[] = [
  lab({
    id: 'riemann-sum-explorer',
    title: 'Riemann Sum Explorer',
    summary: 'Change n and switch between right endpoints, left endpoints, sample points and midpoints.',
    unitId: U.riemann,
    sections: ['2-2'],
  }),
  lab({
    id: 'limit-of-riemann-sums',
    title: 'From Sums to the Integral',
    summary: 'Watch the Riemann sums of the worked examples approach the definite integral as n grows.',
    unitId: U.definite,
    sections: ['2-2-1'],
  }),
  lab({
    id: 'midpoint-rule-lab',
    title: 'Mid-point Rule Lab',
    summary: 'Build the Mid-point Rule rectangles for Example 2.2.3 and compare them with the endpoint rules.',
    unitId: U.definite,
    sections: ['2-2-1'],
  }),
  lab({
    id: 'integral-properties-lab',
    title: 'Properties as Areas',
    summary: 'Move the split point c, reverse the limits and compare two functions.',
    unitId: U.properties,
    sections: ['2-2-2'],
  }),
  lab({
    id: 'accumulation-lab',
    title: 'Area Accumulation',
    summary: 'Move x and see that the accumulated area g(x) changes at the rate f(x).',
    unitId: U.ftc,
    sections: ['2-3'],
  }),
  lab({
    id: 'mean-value-lab',
    title: 'Mean Value Rectangle',
    summary: 'Raise or lower a rectangle between f(m) and f(M) until its area equals the area under the curve.',
    unitId: U.mvt,
    sections: ['2-4'],
  }),
  lab({
    id: 'infinite-interval-lab',
    title: 'Area to Infinity',
    summary: 'Move t further out and compare the areas under 1/x² and 1/x.',
    unitId: U.typeOne,
    sections: ['2-5', '2-5-1'],
  }),
  lab({
    id: 'asymptote-lab',
    title: 'Area Next to an Asymptote',
    summary: 'Move t towards the vertical asymptote and see whether the area settles or grows without bound.',
    unitId: U.typeTwo,
    sections: ['2-5-2'],
  }),
  lab({
    id: 'comparison-lab',
    title: 'Comparison Lab',
    summary: 'Compare an integrand with a simpler function and watch both areas as t grows.',
    unitId: U.comparison,
    sections: ['2-5-3'],
  }),
  game({
    id: 'riemann-builder',
    title: 'Riemann Builder',
    summary: 'Choose the rule and the number of rectangles to meet each challenge.',
    unitId: U.riemann,
    sections: ['2-2'],
  }),
  game({
    id: 'sum-to-integral',
    title: 'Sum to Integral',
    summary: 'Build Δx, xᵢ, the ith term, the sum and its limit, one link at a time.',
    unitId: U.definite,
    sections: ['2-2-1'],
  }),
  game({
    id: 'property-builder',
    title: 'Property Builder',
    summary: 'Build target integrals from known ones with the properties of the definite integral.',
    unitId: U.properties,
    sections: ['2-2-2'],
  }),
  game({
    id: 'area-derivative-link',
    title: 'Area–Derivative Link',
    summary: 'Predict where the accumulated area rises fastest, levels off or peaks.',
    unitId: U.ftc,
    sections: ['2-3'],
  }),
  game({
    id: 'equal-area-height',
    title: 'Equal-Area Height',
    summary: 'App practice: find the rectangle height with exactly the area under the curve, then find c.',
    unitId: U.mvt,
    sections: ['2-4'],
  }),
  game({
    id: 'converge-or-diverge',
    title: 'Converge or Diverge',
    summary: 'Predict whether an area to infinity is finite, test it, and explain why.',
    unitId: U.typeOne,
    sections: ['2-5', '2-5-1'],
  }),
  game({
    id: 'approach-the-asymptote',
    title: 'Approach the Asymptote',
    summary: 'Move towards a vertical asymptote and decide whether the area is finite.',
    unitId: U.typeTwo,
    sections: ['2-5-2'],
  }),
  game({
    id: 'compare-and-decide',
    title: 'Compare & Decide',
    summary: 'Choose a comparison function and decide what the Comparison Theorem allows.',
    unitId: U.comparison,
    sections: ['2-5-3'],
  }),
  studio({
    id: 'riemann-mosaic',
    title: 'Riemann Mosaic Studio',
    summary: 'Turn Riemann sums into mosaics: choose f, [a, b], n and the rule, then arrange and style the tiles.',
    unitId: U.riemann,
    sections: ['2-2'],
  }),
  studio({
    id: 'midpoint-mosaic',
    title: 'Midpoint Mosaic',
    summary: 'Layer midpoint sums at growing n into a mosaic that closes in on the definite integral.',
    unitId: U.definite,
    sections: ['2-2-1'],
  }),
  studio({
    id: 'split-mosaic',
    title: 'Integral City',
    summary: 'Split one interval into districts of rectangles whose integrals add up to the whole.',
    unitId: U.properties,
    sections: ['2-2-2'],
  }),
  studio({
    id: 'accumulation-art',
    title: 'Accumulation Art Studio',
    summary: 'Draw f and its accumulated area A(x) as linked layers, move x and repeat the accumulation curves.',
    unitId: U.ftc,
    sections: ['2-3'],
  }),
  studio({
    id: 'mean-value-bands',
    title: 'Mean Value Bands',
    summary: 'Build bands at the average value of f, each with exactly the area under its piece of the curve.',
    unitId: U.mvt,
    sections: ['2-4'],
  }),
  studio({
    id: 'convergence-trail',
    title: 'Convergence Trail',
    summary: 'Draw trails of A(t) as t heads to infinity: some settle on a limit, some keep climbing.',
    unitId: U.typeOne,
    sections: ['2-5', '2-5-1'],
  }),
  studio({
    id: 'asymptote-trail',
    title: 'Asymptote Trail',
    summary: 'Draw trails of A(t) as t closes in on a vertical asymptote.',
    unitId: U.typeTwo,
    sections: ['2-5-2'],
  }),
  studio({
    id: 'twin-comparison-trails',
    title: 'Twin Comparison Trails',
    summary: 'Draw the trails of a function and a larger one, and see the Comparison Theorem at work.',
    unitId: U.comparison,
    sections: ['2-5-3'],
  }),
];

/** Create activities on the two area studios: which studio, starter template and question. */
export const AREA_STUDIOS: Readonly<Record<string, AreaStudioConfig>> = {
  'riemann-mosaic': {
    studio: 'mosaic',
    starter: 'staircase-wave',
    layerKinds: ['mosaic'],
    question:
      'How do n and the choice of left, right or midpoint heights change your sum compared with the area? Use the numbers from your artwork.',
  },
  'midpoint-mosaic': {
    studio: 'mosaic',
    starter: 'midpoint-mosaic',
    layerKinds: ['mosaic'],
    question:
      'What happens to your midpoint sum as n grows, and why does the definite integral appear as the limit of these sums?',
  },
  'split-mosaic': {
    studio: 'mosaic',
    starter: 'integral-city',
    layerKinds: ['mosaic'],
    question:
      'Your artwork splits one interval into pieces. Explain why the integrals of the pieces add up to the integral over the whole interval.',
  },
  'accumulation-art': {
    studio: 'accumulation',
    starter: 'accumulation-flow',
    layerKinds: ['accumulation', 'mosaic'],
    question: 'Where is A(x) increasing, decreasing or flat in your artwork, and how can you tell from the graph of f?',
  },
  'mean-value-bands': {
    studio: 'accumulation',
    starter: 'mean-value-bands',
    layerKinds: ['mosaic', 'accumulation'],
    question:
      'Why does each mean value band have exactly the area under its piece of the curve? Where does the curve meet the top of a band?',
  },
  'convergence-trail': {
    studio: 'accumulation',
    starter: 'convergence-trail',
    layerKinds: ['trail'],
    question:
      'Which of your trails level off and which keep climbing? Explain what that says about the limit of A(t) and the improper integral.',
  },
  'asymptote-trail': {
    studio: 'accumulation',
    starter: 'asymptote-trail',
    layerKinds: ['trail'],
    question:
      'Which trails settle and which escape as t approaches the asymptote? What does that say about each integral?',
  },
  'twin-comparison-trails': {
    studio: 'accumulation',
    starter: 'twin-comparison-trails',
    layerKinds: ['trail'],
    question:
      'One trail stays below the other. Explain how the Comparison Theorem uses this to decide whether the smaller integral converges.',
  },
};

export const areaActivitiesFor = (unitId: AreaUnitId, kind?: TopicActivity['kind']): TopicActivity[] =>
  AREA_ACTIVITIES.filter((a) => a.unitId === unitId && (!kind || a.kind === kind));
