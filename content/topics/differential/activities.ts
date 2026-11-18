/**
 * Explore tools for Topic 3: one interactive lab for each subtopic, each
 * built on that subtopic's worked examples (and, for Chain Rule subtopics,
 * interactive versions of Figures 3.1 and 3.2). They supplement the notes and
 * never replace the source explanation. Functions that are not in the notes
 * are labelled "Illustration made for the app" inside the lab.
 */
import type { RnStudioConfig } from '@/lib/art/rnArt';

import type { TopicActivity } from '../../types';

import { RN_ACTIVITY_EVIDENCE } from './evidence';
import { RN_GAMES } from './games';
import { RN_TOPIC_ID, RN_UNITS as U, type RnUnitId } from './ids';

const lab = (a: Omit<TopicActivity, 'topicId' | 'availability' | 'kind'>): TopicActivity => ({
  ...a,
  kind: 'lab',
  topicId: RN_TOPIC_ID,
  availability: { status: 'available' },
  alignment: 'course',
});

export const RN_LABS: TopicActivity[] = [
  lab({
    id: 'rn-domain-explorer',
    title: 'Domain and Surface Explorer',
    summary: 'See where a function of two variables is defined, and the surface z = f(x, y) above that domain.',
    unitId: U.functions,
    sections: ['3-1'],
  }),
  lab({
    id: 'rn-slice-lab',
    title: 'Slices and Partial Derivatives',
    summary:
      'Hold one variable constant, slice the surface, and read the partial derivative as the slope of the slice.',
    unitId: U.partials,
    sections: ['3-2-1'],
  }),
  lab({
    id: 'rn-one-variable-at-a-time',
    title: 'One Variable at a Time',
    summary: 'For a function of three variables, let one variable move while the other two stay fixed.',
    unitId: U.threeVariables,
    sections: ['3-2-2'],
  }),
  lab({
    id: 'rn-mixed-partials-lab',
    title: 'Mixed Partials and Clairaut’s Theorem',
    summary: 'Watch both mixed partial derivatives emerge from the same four points, and see when the order matters.',
    unitId: U.higherOrder,
    sections: ['3-2-3'],
  }),
  lab({
    id: 'rn-total-differential-lab',
    title: 'Building the Total Differential',
    summary: 'See each term of dz = f_x dx + f_y dy, and add them up, for both parts of Example 3.3.1.',
    unitId: U.totalDifferential,
    sections: ['3-3'],
  }),
  lab({
    id: 'rn-chain-tree-one',
    title: 'Interactive Figure 3.1',
    summary: 'Follow each path of the tree diagram from w to t and add the products, for Example 3.4.1.',
    unitId: U.chainOne,
    sections: ['3-4'],
  }),
  lab({
    id: 'rn-chain-tree-two',
    title: 'Interactive Figure 3.2',
    summary: 'Choose s or t, follow every path to it, and build ∂w/∂s and ∂w/∂t for Example 3.4.3.',
    unitId: U.chainTwo,
    sections: ['3-4'],
  }),
  lab({
    id: 'rn-coordinate-grid-lab',
    title: 'New Coordinates and Differentials',
    summary: 'See the grid of a change of variables and solve the differentials for the inverse partial derivatives.',
    unitId: U.changeVariables,
    sections: ['3-4'],
  }),
  lab({
    id: 'rn-polar-second-order-lab',
    title: 'Polar Coordinates, Second Order',
    summary: 'Check the second-order Chain Rule of Example 3.4.7 numerically at any point (r, θ).',
    unitId: U.secondOrder,
    sections: ['3-4'],
  }),
];

function sectionOf(unitId: string): string {
  return RN_LABS.find((l) => l.unitId === unitId)?.sections[0] ?? '3-4';
}

/** Play: one game per subtopic (content in games.ts). */
export const RN_GAME_ACTIVITIES: TopicActivity[] = RN_GAMES.map((g) => ({
  id: g.id,
  topicId: RN_TOPIC_ID,
  kind: 'game',
  title: g.title,
  summary: g.summary,
  unitId: g.unitId,
  sections: [sectionOf(g.unitId)],
  availability: { status: 'available' },
  evidenceBasis: RN_ACTIVITY_EVIDENCE[g.id] ?? [],
  alignment: 'course',
}));

const studio = (
  a: Omit<TopicActivity, 'topicId' | 'availability' | 'kind' | 'createType' | 'sections'>,
): TopicActivity => ({
  ...a,
  kind: 'studio',
  createType: 'rnArt',
  topicId: RN_TOPIC_ID,
  sections: [sectionOf(a.unitId)],
  availability: { status: 'available' },
  evidenceBasis: RN_ACTIVITY_EVIDENCE[a.id] ?? [],
  alignment: 'creative',
});

/** Create: four studios (Domain Region, Surface Slice, Chain Network, Coordinate Grid), opened from each subtopic. */
export const RN_STUDIO_ACTIVITIES: TopicActivity[] = [
  studio({
    id: 'rn-domain-region-studio',
    title: 'Domain Region Studio',
    summary: 'Colour the domain of a function by its level bands: only points where the formula is defined are drawn.',
    unitId: U.functions,
  }),
  studio({
    id: 'rn-surface-slice-studio',
    title: 'Surface Slice Studio',
    summary: 'Draw a surface as the slices you get by holding one variable constant.',
    unitId: U.partials,
  }),
  studio({
    id: 'rn-three-variable-slices',
    title: 'Surface Slice Studio: Hold z',
    summary: 'Hold the third variable at a value c and slice the surface that remains (Example 3.2.3(ii)).',
    unitId: U.threeVariables,
  }),
  studio({
    id: 'rn-cross-hatch-studio',
    title: 'Surface Slice Studio: Cross-hatch',
    summary: 'Slice in both directions at once: every crossing shows the slopes of both slices.',
    unitId: U.higherOrder,
  }),
  studio({
    id: 'rn-differential-slices-studio',
    title: 'Surface Slice Studio: Example 3.3.1',
    summary: 'Slice the surface of Example 3.3.1, whose total differential you found in the notes.',
    unitId: U.totalDifferential,
  }),
  studio({
    id: 'rn-chain-network-studio',
    title: 'Chain Network Studio',
    summary: 'Turn the tree diagram of Figure 3.1 into a network artwork with its chain-rule paths lit.',
    unitId: U.chainOne,
  }),
  studio({
    id: 'rn-chain-network-two',
    title: 'Chain Network Studio: Two Variables',
    summary: 'Light the paths of Figure 3.2 or Example 3.4.4 that end at s or at t.',
    unitId: U.chainTwo,
  }),
  studio({
    id: 'rn-coordinate-grid-studio',
    title: 'Coordinate Grid Studio',
    summary: 'Draw the grid of new coordinates: parabolic, polar or exponential polar.',
    unitId: U.changeVariables,
  }),
  studio({
    id: 'rn-polar-grid-studio',
    title: 'Coordinate Grid Studio: Polar',
    summary: 'The polar grid of Example 3.4.7: circles r = constant and rays θ = constant.',
    unitId: U.secondOrder,
  }),
];

/** Studio settings for each Create activity. */
export const RN_STUDIOS: Readonly<Record<string, RnStudioConfig>> = {
  'rn-domain-region-studio': {
    studio: 'domainRegion',
    starter: { source: 'ex311', count: 1, direction: 'x', value: 0 },
    starterLayers: [
      { name: 'Example 3.1.1(i) bands' },
      { name: 'Ring bands', course: { source: 'ring', count: 1.5 }, creative: { scheme: 'warm' }, opacity: 0.6 },
    ],
    question: 'Which points of the plane are coloured, and why? What do the boundaries between colours show?',
  },
  'rn-surface-slice-studio': {
    studio: 'surfaceSlice',
    starter: { source: 'ex321', count: 7, direction: 'x', value: 0 },
    starterLayers: [
      { name: 'Slices with y held constant' },
      { name: 'Slices with x held constant', course: { direction: 'y' }, creative: { scheme: 'warm', surface: false } },
    ],
    question:
      'Which variable is held constant along each line of your artwork, and what does the slope of a line tell you?',
  },
  'rn-three-variable-slices': {
    studio: 'surfaceSlice',
    starter: { source: 'ex323', count: 6, direction: 'x', value: 1 },
    starterLayers: [
      { name: 'z held at c = 1' },
      {
        name: 'z held at c = 1.8',
        course: { value: 1.8 },
        creative: { scheme: 'warm', surface: false },
        opacity: 0.85,
      },
    ],
    question:
      'Your surface holds z = c. How does changing c change the surface, and which partial derivative does each slice show?',
  },
  'rn-cross-hatch-studio': {
    studio: 'surfaceSlice',
    starter: { source: 'ex324', count: 6, direction: 'both', value: 0 },
    starterLayers: [{ name: 'Cross-hatched slices' }],
    question:
      'At a crossing of two slices, which two partial derivatives can you read? How does this connect with the mixed partials?',
  },
  'rn-differential-slices-studio': {
    studio: 'surfaceSlice',
    starter: { source: 'ex331', count: 8, direction: 'y', value: 0 },
    starterLayers: [
      { name: 'Slices with x held constant' },
      {
        name: 'Slices with y held constant',
        course: { direction: 'x', count: 5 },
        creative: { scheme: 'secondary', surface: false },
        opacity: 0.8,
      },
    ],
    question: 'How do the slopes of your slices appear in the total differential dz = f_x dx + f_y dy?',
  },
  'rn-chain-network-studio': {
    studio: 'chainNetwork',
    starter: { source: 'ex341', count: 1, direction: 'y', value: 0 },
    starterLayers: [{ name: 'Figure 3.1, six-fold', creative: { copies: 6 } }],
    question: 'How many paths are lit, and how does each one become a term of dw/dt?',
  },
  'rn-chain-network-two': {
    studio: 'chainNetwork',
    starter: { source: 'ex343', count: 1, direction: 'x', value: 0 },
    starterLayers: [
      { name: 'Paths to s', creative: { copies: 4 } },
      { name: 'Paths to t', course: { direction: 'y' }, creative: { copies: 4, scheme: 'warm' }, opacity: 0.75 },
    ],
    question: 'Which paths are lit for the variable you chose, and what product does each give?',
  },
  'rn-coordinate-grid-studio': {
    studio: 'coordinateGrid',
    starter: { source: 'parabolic', count: 8, direction: 'x', value: 0 },
    starterLayers: [
      { name: 'Parabolic grid' },
      { name: 'Polar grid', course: { source: 'polar', count: 6 }, creative: { scheme: 'warm' }, opacity: 0.45 },
    ],
    question: 'What does each family of curves in your grid represent, and how do the curves meet?',
  },
  'rn-polar-grid-studio': {
    studio: 'coordinateGrid',
    starter: { source: 'polar', count: 8, direction: 'x', value: 0 },
    starterLayers: [
      { name: 'Polar grid' },
      {
        name: 'Exponential polar grid',
        course: { source: 'exponential' },
        creative: { scheme: 'secondary' },
        opacity: 0.5,
      },
    ],
    question:
      'What are the circles and the rays of your grid, and why does the polar form of w_xx + w_yy need a 1/r term?',
  },
};

export const RN_ACTIVITIES: TopicActivity[] = [...RN_LABS, ...RN_GAME_ACTIVITIES, ...RN_STUDIO_ACTIVITIES];

export const rnActivitiesFor = (unitId: RnUnitId, kind?: TopicActivity['kind']): TopicActivity[] =>
  RN_ACTIVITIES.filter((a) => a.unitId === unitId && (!kind || a.kind === kind));
