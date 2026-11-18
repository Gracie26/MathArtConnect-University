import { type ComponentType, createElement } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { TopicActivity } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';

/** Every activity screen receives the activity, and Create activities an optional saved project. */
export interface ActivityProps {
  activity: TopicActivity;
  projectId?: string;
}

type Loader = () => ComponentType<ActivityProps>;

// Each activity module is evaluated only when it is first opened (graph and art modules are the
// heaviest), through a deferred require(). Not import() with React.lazy: on web, Metro's
// development async chunks and the lazy retry did not reliably commit, leaving activities on a
// loading state. A synchronous deferred require needs no Suspense.
const named =
  <K extends string>(load: () => Record<K, ComponentType<ActivityProps>>, name: K): Loader =>
  () =>
    load()[name];

/* eslint-disable @typescript-eslint/no-require-imports -- deferred module evaluation, explained above */
const LOADERS: Record<string, Loader> = {
  'family-of-curves': named(
    () => require('@/components/explore/FamilyOfCurves') as typeof import('@/components/explore/FamilyOfCurves'),
    'FamilyOfCurves',
  ),
  'power-rule-machine': named(
    () => require('@/components/explore/PowerRuleMachine') as typeof import('@/components/explore/PowerRuleMachine'),
    'PowerRuleMachine',
  ),
  'substitution-highlighter': named(
    () =>
      require('@/components/explore/SubstitutionHighlighter') as typeof import('@/components/explore/SubstitutionHighlighter'),
    'SubstitutionHighlighter',
  ),
  'transformation-lab': named(
    () => require('@/components/explore/TransformationLab') as typeof import('@/components/explore/TransformationLab'),
    'SubstitutionTransformationLab',
  ),
  'fraction-decomposer': named(
    () =>
      require('@/components/explore/FractionDecomposer') as typeof import('@/components/explore/FractionDecomposer'),
    'FractionDecomposer',
  ),
  'trig-transformation-lab': named(
    () => require('@/components/explore/TransformationLab') as typeof import('@/components/explore/TransformationLab'),
    'TrigTransformationLab',
  ),
  'choose-u-lab': named(
    () => require('@/components/explore/ChooseULab') as typeof import('@/components/explore/ChooseULab'),
    'ChooseULab',
  ),
  'repeated-parts-flow': named(
    () => require('@/components/explore/RepeatedPartsFlow') as typeof import('@/components/explore/RepeatedPartsFlow'),
    'RepeatedPartsFlow',
  ),
  'pattern-explorer': named(
    () => require('@/components/explore/PatternExplorer') as typeof import('@/components/explore/PatternExplorer'),
    'PatternExplorer',
  ),
  'reduction-flow': named(
    () => require('@/components/explore/ReductionFlow') as typeof import('@/components/explore/ReductionFlow'),
    'ReductionFlow',
  ),
  'reverse-the-derivative': named(
    () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
    'GameActivity',
  ),
  'rule-builder': named(
    () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
    'GameActivity',
  ),
  'spot-the-substitution': named(
    () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
    'GameActivity',
  ),
  'build-the-decomposition': named(
    () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
    'GameActivity',
  ),
  'transformation-challenge': named(
    () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
    'GameActivity',
  ),
  'choose-u': named(
    () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
    'GameActivity',
  ),
  'pattern-detective': named(
    () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
    'GameActivity',
  ),
  'antiderivative-curve-art': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  'function-curve-composer': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  'equation-art-studio': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  'trig-pattern-studio': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  'dynamic-pattern-studio': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  'transformation-art': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  'decomposition-map': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  'solution-flow-builder': named(
    () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
    'CreateActivity',
  ),
  // Topic 2: interactive versions of the figures in the notes.
  'riemann-sum-explorer': named(
    () =>
      require('@/components/explore/area/RiemannExplorer') as typeof import('@/components/explore/area/RiemannExplorer'),
    'RiemannExplorer',
  ),
  'midpoint-rule-lab': named(
    () =>
      require('@/components/explore/area/RiemannExplorer') as typeof import('@/components/explore/area/RiemannExplorer'),
    'MidpointRuleLab',
  ),
  'limit-of-riemann-sums': named(
    () => require('@/components/explore/area/AreaLabs') as typeof import('@/components/explore/area/AreaLabs'),
    'LimitOfSumsLab',
  ),
  'integral-properties-lab': named(
    () => require('@/components/explore/area/AreaLabs') as typeof import('@/components/explore/area/AreaLabs'),
    'PropertiesLab',
  ),
  'accumulation-lab': named(
    () => require('@/components/explore/area/AreaLabs') as typeof import('@/components/explore/area/AreaLabs'),
    'AccumulationLab',
  ),
  'mean-value-lab': named(
    () => require('@/components/explore/area/AreaLabs') as typeof import('@/components/explore/area/AreaLabs'),
    'MeanValueLab',
  ),
  'infinite-interval-lab': named(
    () => require('@/components/explore/area/AreaLabs') as typeof import('@/components/explore/area/AreaLabs'),
    'InfiniteIntervalLab',
  ),
  'asymptote-lab': named(
    () => require('@/components/explore/area/AreaLabs') as typeof import('@/components/explore/area/AreaLabs'),
    'AsymptoteLab',
  ),
  'comparison-lab': named(
    () => require('@/components/explore/area/AreaLabs') as typeof import('@/components/explore/area/AreaLabs'),
    'ComparisonLab',
  ),
  // Topic 3: one Explore lab per subtopic.
  ...Object.fromEntries(
    (
      [
        ['rn-domain-explorer', 'DomainExplorer'],
        ['rn-slice-lab', 'SliceLab'],
        ['rn-one-variable-at-a-time', 'OneVariableLab'],
        ['rn-mixed-partials-lab', 'MixedPartialsLab'],
        ['rn-total-differential-lab', 'TotalDifferentialLab'],
        ['rn-chain-tree-one', 'ChainTreeOne'],
        ['rn-chain-tree-two', 'ChainTreeTwo'],
        ['rn-coordinate-grid-lab', 'CoordinateGridLab'],
        ['rn-polar-second-order-lab', 'PolarSecondOrderLab'],
      ] as const
    ).map(([id, name]) => [
      id,
      named(() => require('@/components/explore/rn/RnLabs') as typeof import('@/components/explore/rn/RnLabs'), name),
    ]),
  ),
  // Topic 3 games share the game shell; Topic 3 Create activities open the Topic 3 studios.
  ...Object.fromEntries(
    [
      'rn-domain-detective',
      'rn-slice-slopes',
      'rn-hold-two-relay',
      'rn-order-matters',
      'rn-differential-builder',
      'rn-path-finder',
      'rn-tree-builder',
      'rn-differential-solver',
      'rn-polar-converter',
    ].map((id) => [
      id,
      named(
        () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
        'GameActivity',
      ),
    ]),
  ),
  ...Object.fromEntries(
    [
      'rn-domain-region-studio',
      'rn-surface-slice-studio',
      'rn-three-variable-slices',
      'rn-cross-hatch-studio',
      'rn-differential-slices-studio',
      'rn-chain-network-studio',
      'rn-chain-network-two',
      'rn-coordinate-grid-studio',
      'rn-polar-grid-studio',
    ].map((id) => [
      id,
      named(
        () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
        'CreateActivity',
      ),
    ]),
  ),
  // Topic 4: one Explore lab per subtopic; games share the game shell; Create opens the Topic 4 studios.
  ...Object.fromEntries(
    (
      [
        ['pda-gradient-probe', 'GradientProbe'],
        ['pda-tangent-plane-lab', 'TangentPlaneLab'],
        ['pda-critical-point-finder', 'CriticalPointFinder'],
        ['pda-saddle-or-not', 'SaddleOrNot'],
      ] as const
    ).map(([id, name]) => [
      id,
      named(() => require('@/components/explore/pa/PaLabs') as typeof import('@/components/explore/pa/PaLabs'), name),
    ]),
  ),
  ...Object.fromEntries(
    ['pda-gradient-builder', 'pda-plane-builder', 'pda-is-it-critical', 'pda-classify-it'].map((id) => [
      id,
      named(
        () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
        'GameActivity',
      ),
    ]),
  ),
  ...Object.fromEntries(
    ['pda-gradient-field-art', 'pda-faceted-surface', 'pda-landscape-designer'].map((id) => [
      id,
      named(
        () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
        'CreateActivity',
      ),
    ]),
  ),
  // Topic 2 games share the game shell.
  ...Object.fromEntries(
    [
      'riemann-builder',
      'sum-to-integral',
      'property-builder',
      'area-derivative-link',
      'equal-area-height',
      'converge-or-diverge',
      'approach-the-asymptote',
      'compare-and-decide',
    ].map((id) => [
      id,
      named(
        () => require('@/components/games/GameActivity') as typeof import('@/components/games/GameActivity'),
        'GameActivity',
      ),
    ]),
  ),
  // Topic 2 Create activities open the Riemann Mosaic or Accumulation Art studio.
  ...Object.fromEntries(
    [
      'riemann-mosaic',
      'midpoint-mosaic',
      'split-mosaic',
      'accumulation-art',
      'mean-value-bands',
      'convergence-trail',
      'asymptote-trail',
      'twin-comparison-trails',
    ].map((id) => [
      id,
      named(
        () => require('@/components/art/CreateActivity') as typeof import('@/components/art/CreateActivity'),
        'CreateActivity',
      ),
    ]),
  ),
};
/* eslint-enable @typescript-eslint/no-require-imports */

const loaded = new Map<string, ComponentType<ActivityProps>>();
/** The activity's component; its module is evaluated the first time it is needed. */
function screenFor(id: string): ComponentType<ActivityProps> | null {
  const loader = LOADERS[id];
  if (!loader) return null;
  const cached = loaded.get(id);
  if (cached) return cached;
  const component = loader();
  loaded.set(id, component);
  return component;
}

export const hasActivityScreen = (id: string): boolean => id in LOADERS;

/** Renders the screen for any registered activity, loading its module on demand. */
export function ActivityHost({ activity, projectId }: ActivityProps) {
  const theme = useAppTheme();
  const screen = screenFor(activity.id);
  if (!screen) {
    return (
      <View style={{ padding: theme.layout.screenGutter }}>
        <AppText variant="h2">This activity is not available.</AppText>
      </View>
    );
  }
  return createElement(screen, { activity, projectId });
}
