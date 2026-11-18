/**
 * Research traceability for Topic 3 Play and Create (internal; never shown in
 * the learner interface). The sources are the verified Topic 2 sources
 * (content/topics/area/evidence.ts); none of them evaluated MathArt Connect,
 * and none studied multivariable calculus specifically. The cited literature
 * supports the design principle; it does not establish the effectiveness of
 * this specific MathArt Connect activity. See docs/topic3-phase-d-evidence.md.
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
  'The mathematics is the game mechanic: each scored action is a decision about domains, partial derivatives, differentials or chain-rule paths, not points attached to a quiz.',
);
const DYNAMIC_VISUAL = basis(
  'visualisation',
  'schonherr2024',
  'Dynamic external visualisation that the learner manipulates (surfaces, slices, grids and tree diagrams), linked to the symbolic representation.',
);
const ART_INTEGRATION = basis(
  'art-integration',
  'sylviani2024',
  'Creating visual art from mathematical structure (domains, slices, chain-rule trees and coordinate grids) to support interest and creative investigation of the mathematics.',
);

/** Evidence metadata per Topic 3 Play / Create activity id. */
export const RN_ACTIVITY_EVIDENCE: Readonly<Record<string, EvidenceBasis[]>> = {
  'rn-domain-detective': [GAME_REASONING],
  'rn-slice-slopes': [GAME_REASONING],
  'rn-hold-two-relay': [GAME_REASONING],
  'rn-order-matters': [GAME_REASONING],
  'rn-differential-builder': [GAME_REASONING],
  'rn-path-finder': [GAME_REASONING],
  'rn-tree-builder': [GAME_REASONING],
  'rn-differential-solver': [GAME_REASONING],
  'rn-polar-converter': [GAME_REASONING],
  'rn-domain-region-studio': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-surface-slice-studio': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-three-variable-slices': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-cross-hatch-studio': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-differential-slices-studio': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-chain-network-studio': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-chain-network-two': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-coordinate-grid-studio': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'rn-polar-grid-studio': [ART_INTEGRATION, DYNAMIC_VISUAL],
};

export { EVIDENCE_LIMITATION };
