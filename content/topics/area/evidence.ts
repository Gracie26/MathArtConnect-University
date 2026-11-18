/**
 * Research traceability for Topic 2 Play and Create (internal; never shown in
 * the learner interface). Each activity's design is informed by published
 * work; none of these sources evaluated MathArt Connect, and the cited
 * literature supports the design principle; it does not establish the
 * effectiveness of this specific MathArt Connect activity.
 * See docs/topic2-phase-d-evidence.md.
 */
import type { EvidenceBasis, EvidenceSource } from '../../types';

/** Sources verified for the Phase D design (citations as published). */
export const SOURCES = {
  thomas2025: {
    id: 'thomas2025',
    citation:
      'Thomas, A., Young, J., Rugh, M., Ramadan, H., & Weng, W. (2025). Pushing the Limits of Game-Based Instruction in Calculus: Assessing the Effects of Variant Limits. International Journal of Game-Based Learning, 15(1), 1–23.',
    doi: '10.4018/IJGBL.385391',
    supports:
      'Purpose-designed calculus games in which mathematical reasoning is part of the game mechanic (111 propensity-score-matched pairs of introductory engineering calculus students; game group had significantly better learning outcomes than traditional homework).',
  },
  schonherr2024: {
    id: 'schonherr2024',
    citation:
      'Schönherr, J., Strohmaier, A. R., & Schukajlow, S. (2024). Learning with visualizations helps: A meta-analysis of visualization interventions in mathematics education. Educational Research Review, 45, 100639.',
    doi: '10.1016/j.edurev.2024.100639',
    supports:
      'External mathematical visualisations, dynamic representations and visual manipulation (41 studies, 10,562 learners, medium overall effect g = 0.504, with significant heterogeneity).',
  },
  tatarZengin2016: {
    id: 'tatarZengin2016',
    citation:
      'Tatar, E., & Zengin, Y. (2016). Conceptual Understanding of Definite Integral with GeoGebra. Computers in the Schools, 33(2), 120–132.',
    doi: '10.1080/07380569.2016.1177480',
    supports:
      'Dynamic visualisation of lower, upper and Riemann sums for the definite integral (35 prospective secondary mathematics teachers; GeoGebra-based instruction contributed positively to achievement).',
  },
  sylviani2024: {
    id: 'sylviani2024',
    citation:
      'Sylviani, S., Permana, F. C., & Azizan, A. T. (2024). Enhancing Mathematical Interest through Visual Arts Integration: A Systematic Literature Review. International Journal of Education in Mathematics, Science and Technology, 12(5), 1217–1235.',
    doi: '10.46328/ijemst.4118',
    supports:
      'Visual-art integration in mathematics supporting interest, motivation and creative investigation of mathematical ideas.',
  },
} as const satisfies Record<string, EvidenceSource>;

const basis = (type: EvidenceBasis['type'], source: keyof typeof SOURCES, principle: string): EvidenceBasis => ({
  type,
  sourceId: source,
  citation: SOURCES[source].citation,
  principle,
});

const GAME_REASONING = basis(
  'game-based-learning',
  'thomas2025',
  'The mathematics is the game mechanic: each scored action is a calculus decision, not points attached to a quiz.',
);
const DYNAMIC_VISUAL = basis(
  'visualisation',
  'schonherr2024',
  'Dynamic external visualisation that the learner manipulates, linked to the symbolic representation.',
);
const RIEMANN_VISUAL = basis(
  'visualisation',
  'tatarZengin2016',
  'Dynamic visualisation of Riemann (lower, upper, sample-point) sums approaching the definite integral.',
);
const ART_INTEGRATION = basis(
  'art-integration',
  'sylviani2024',
  'Creating visual art from mathematical structure to support interest and creative investigation of the mathematics.',
);

/** Evidence metadata per Play / Create activity id. */
export const ACTIVITY_EVIDENCE: Readonly<Record<string, EvidenceBasis[]>> = {
  'riemann-builder': [GAME_REASONING, RIEMANN_VISUAL, DYNAMIC_VISUAL],
  'sum-to-integral': [GAME_REASONING, RIEMANN_VISUAL, DYNAMIC_VISUAL],
  'property-builder': [GAME_REASONING, DYNAMIC_VISUAL],
  'area-derivative-link': [GAME_REASONING, DYNAMIC_VISUAL],
  'equal-area-height': [GAME_REASONING, DYNAMIC_VISUAL],
  'converge-or-diverge': [GAME_REASONING, DYNAMIC_VISUAL],
  'approach-the-asymptote': [GAME_REASONING, DYNAMIC_VISUAL],
  'compare-and-decide': [GAME_REASONING, DYNAMIC_VISUAL],
  'riemann-mosaic': [ART_INTEGRATION, RIEMANN_VISUAL, DYNAMIC_VISUAL],
  'midpoint-mosaic': [ART_INTEGRATION, RIEMANN_VISUAL, DYNAMIC_VISUAL],
  'split-mosaic': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'accumulation-art': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'mean-value-bands': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'convergence-trail': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'asymptote-trail': [ART_INTEGRATION, DYNAMIC_VISUAL],
  'twin-comparison-trails': [ART_INTEGRATION, DYNAMIC_VISUAL],
};

/** The sentence used wherever evidence is cited for an activity. */
export const EVIDENCE_LIMITATION =
  'The cited literature supports the design principle; it does not establish the effectiveness of this specific MathArt Connect activity.';
