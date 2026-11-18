/**
 * Research traceability for Topic 4 Explore, Play and Create (internal; never
 * shown in the learner interface). The sources are the verified Topic 2
 * sources (content/topics/area/evidence.ts); none of them evaluated MathArt
 * Connect, and none studied gradients, tangent planes or extrema specifically.
 * The cited literature supports the design principle; it does not establish
 * the effectiveness of this specific MathArt Connect activity. See
 * docs/source-material/topic4.md.
 */
import type { EvidenceBasis } from '../../types';
import { EVIDENCE_LIMITATION, SOURCES } from '../area/evidence';

const basis = (type: EvidenceBasis['type'], source: keyof typeof SOURCES, principle: string): EvidenceBasis => ({
  type,
  sourceId: source,
  citation: SOURCES[source].citation,
  principle,
});

const GAME_REASONING = basis(
  'game-based-learning',
  'thomas2025',
  'The mathematics is the game mechanic: each scored action is a decision about gradient components, tangent planes, normal lines, critical points or the sign of d, not points attached to a quiz.',
);
const DYNAMIC_VISUAL = basis(
  'visualisation',
  'schonherr2024',
  'Dynamic external visualisation that the learner manipulates (contour maps, surfaces, planes, vectors), linked to the symbolic representation (fx, fy, ∇F, d).',
);
const ART_INTEGRATION = basis(
  'art-integration',
  'sylviani2024',
  'Creating visual art from mathematical structure (gradient fields, tangent-plane facets, critical-point landscapes) to support interest and creative investigation of the mathematics.',
);

/** Evidence metadata per Topic 4 activity id. */
export const PDA_ACTIVITY_EVIDENCE: Readonly<Record<string, EvidenceBasis[]>> = {
  'pda-gradient-probe': [DYNAMIC_VISUAL],
  'pda-tangent-plane-lab': [DYNAMIC_VISUAL],
  'pda-critical-point-finder': [DYNAMIC_VISUAL],
  'pda-saddle-or-not': [DYNAMIC_VISUAL],
  'pda-gradient-builder': [GAME_REASONING],
  'pda-plane-builder': [GAME_REASONING],
  'pda-is-it-critical': [GAME_REASONING],
  'pda-classify-it': [GAME_REASONING],
  'pda-gradient-field-art': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'pda-faceted-surface': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'pda-landscape-designer': [ART_INTEGRATION, DYNAMIC_VISUAL],
};

export { EVIDENCE_LIMITATION };
