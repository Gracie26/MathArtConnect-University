/**
 * Explore, Play and Create for Topic 4 (approved placement):
 *
 *   Subtopic 1 The Gradient            Gradient Probe · Gradient Builder · Gradient Field Art
 *   Subtopic 2 Tangent Planes …        Tangent Plane Lab · Plane Builder · Faceted Surface
 *   Subtopic 3 Critical Points …       Critical Point Finder · Is It Critical? · (no Create)
 *   Subtopic 4 The Second Partials Test Saddle or Not · Classify It · Landscape Designer
 *
 * Explore labs let the learner manipulate the mathematics; Create studios
 * make art whose every mark keeps its mathematical meaning. Subtopic 3 has no
 * Create activity: nothing there could be made into art without forcing it
 * (finding critical points is a calculation, and making critical-point
 * landscapes is Landscape Designer in Subtopic 4). Chapter 4 has no figures:
 * every graph, surface and vector is an app-created visualisation.
 */
import type { PaStudioConfig } from '@/lib/art/paArt';

import type { TopicActivity } from '../../types';

import { PDA_ACTIVITY_EVIDENCE } from './evidence';
import { PDA_GAMES } from './games';
import { PDA_TOPIC_ID, PDA_UNITS as U, type PdaUnitId } from './ids';

const SECTION: Record<PdaUnitId, string> = {
  [U.gradient]: '4-1',
  [U.tangentPlanes]: '4-2-1',
  [U.criticalPoints]: '4-3-1',
  [U.secondPartials]: '4-3-1',
};

const lab = (a: Omit<TopicActivity, 'topicId' | 'availability' | 'kind' | 'sections'>): TopicActivity => ({
  ...a,
  kind: 'lab',
  topicId: PDA_TOPIC_ID,
  sections: [SECTION[a.unitId as PdaUnitId]],
  availability: { status: 'available' },
  evidenceBasis: PDA_ACTIVITY_EVIDENCE[a.id] ?? [],
  alignment: 'course',
});

export const PDA_LABS: TopicActivity[] = [
  lab({
    id: 'pda-gradient-probe',
    title: 'Gradient Probe',
    summary: 'Move a point over a contour map and see f_x, f_y and the vector ∇f = f_x i + f_y j there.',
    unitId: U.gradient,
  }),
  lab({
    id: 'pda-tangent-plane-lab',
    title: 'Tangent Plane Lab',
    summary: 'Move P on the surfaces of Examples 4.2.1 to 4.2.3 and watch ∇F, the tangent plane and the normal line.',
    unitId: U.tangentPlanes,
  }),
  lab({
    id: 'pda-critical-point-finder',
    title: 'Critical Point Finder',
    summary:
      'See the curves f_x = 0 and f_y = 0: critical points are where they meet, or where a partial does not exist.',
    unitId: U.criticalPoints,
  }),
  lab({
    id: 'pda-saddle-or-not',
    title: 'Saddle or Not',
    summary: 'Set f_xx, f_yy and f_xy and watch d, the classification and the shape of the surface change together.',
    unitId: U.secondPartials,
  }),
];

/** Play: one game per subtopic (content in games.ts). */
export const PDA_GAME_ACTIVITIES: TopicActivity[] = PDA_GAMES.map((g) => ({
  id: g.id,
  topicId: PDA_TOPIC_ID,
  kind: 'game',
  title: g.title,
  summary: g.summary,
  unitId: g.unitId,
  sections: [SECTION[g.unitId as PdaUnitId]],
  availability: { status: 'available' },
  evidenceBasis: PDA_ACTIVITY_EVIDENCE[g.id] ?? [],
  alignment: 'course',
}));

const studio = (
  a: Omit<TopicActivity, 'topicId' | 'availability' | 'kind' | 'createType' | 'sections'>,
): TopicActivity => ({
  ...a,
  kind: 'studio',
  createType: 'paArt',
  topicId: PDA_TOPIC_ID,
  sections: [SECTION[a.unitId as PdaUnitId]],
  availability: { status: 'available' },
  evidenceBasis: PDA_ACTIVITY_EVIDENCE[a.id] ?? [],
  alignment: 'creative',
});

/** Create: three studios; Subtopic 3 has none (see above). */
export const PDA_STUDIO_ACTIVITIES: TopicActivity[] = [
  studio({
    id: 'pda-gradient-field-art',
    title: 'Gradient Field Art',
    summary: 'Draw the gradient vectors of a function across the plane: every arrow is (f_x, f_y) at its point.',
    unitId: U.gradient,
  }),
  studio({
    id: 'pda-faceted-surface',
    title: 'Faceted Surface',
    summary: 'Build a low-poly sculpture of a surface in which every facet is a tangent plane.',
    unitId: U.tangentPlanes,
  }),
  studio({
    id: 'pda-landscape-designer',
    title: 'Landscape Designer',
    summary: 'Sculpt a terrain from peaks, pits and saddles; the Second Partials Test labels every feature.',
    unitId: U.secondPartials,
  }),
];

/** Studio settings for each Create activity. */
export const PDA_STUDIOS: Readonly<Record<string, PaStudioConfig>> = {
  'pda-gradient-field-art': {
    studio: 'gradientField',
    starter: 'saddle',
    question:
      'What do the two components of each arrow in your artwork represent? Choose one arrow and say what f_x and f_y are there.',
  },
  'pda-faceted-surface': {
    studio: 'facetedSurface',
    starter: 'paraboloid',
    question:
      'Each facet of your sculpture is part of a tangent plane. Which vector is each facet normal to, and how do you find its equation (Theorem 4.2.2)?',
  },
  'pda-landscape-designer': {
    studio: 'landscape',
    starter: 'twoPeaks',
    question:
      'Choose one labelled feature of your landscape. What are d and f_xx there, and how does Theorem 4.3.3 classify it?',
  },
};

export const PDA_ACTIVITIES: TopicActivity[] = [...PDA_LABS, ...PDA_GAME_ACTIVITIES, ...PDA_STUDIO_ACTIVITIES];

export const pdaActivitiesFor = (unitId: PdaUnitId, kind?: TopicActivity['kind']): TopicActivity[] =>
  PDA_ACTIVITIES.filter((a) => a.unitId === unitId && (!kind || a.kind === kind));
