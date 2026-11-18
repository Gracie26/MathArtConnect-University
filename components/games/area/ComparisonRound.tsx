import { useState } from 'react';
import { View } from 'react-native';

import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { LiveScene } from '@/components/explore/area/AreaParts';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureItem, FigureScene } from '@/lib/figures/scene';
import { type ComparisonWidget, type Conclusion, evaluateComparison, relationOf } from '@/lib/games/areaWidgets';

import type { WidgetProps } from './WidgetRound';

const CONCLUSIONS: { id: Conclusion; label: string }[] = [
  { id: 'converges', label: 'It converges (Theorem 2.5.1 (a))' },
  { id: 'diverges', label: 'It diverges (Theorem 2.5.1 (b))' },
  { id: 'nothing', label: 'Nothing follows from this comparison' },
];

function comparisonScene(widget: ComparisonWidget, candidateId: string | null): FigureScene {
  const candidate = widget.candidates.find((c) => c.id === candidateId);
  const x1 = widget.a + 7;
  let top = 0;
  for (let k = 0; k <= 100; k++) {
    const x = widget.a + (7 * k) / 100;
    top = Math.max(
      top,
      widget.integrand.f(x),
      candidate ? Math.min(candidate.f(x), 4 * widget.integrand.f(widget.a) + 1) : 0,
    );
  }
  const items: FigureItem[] = [
    { k: 'area', f: widget.integrand.f, from: widget.a, to: x1, tone: 'fill' },
    ...(candidate ? [{ k: 'curve', f: candidate.f, from: widget.a, to: x1, tone: 'curve2' } as FigureItem] : []),
    { k: 'curve', f: widget.integrand.f, from: widget.a, to: x1 },
    { k: 'segment', x1: widget.a, y1: 0, x2: widget.a, y2: top * 1.05, tone: 'guide', dashed: true },
  ];
  return {
    view: { xMin: widget.a - 0.8, xMax: x1 + 0.3, yMin: -0.12 * top, yMax: top * 1.2 },
    aspect: 0.6,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y', xTicks: [{ at: widget.a, label: `a = ${widget.a}` }] },
    items,
  };
}

/**
 * Compare & Decide: choose a comparison function, see where it lies relative
 * to the integrand, and state what the Comparison Theorem allows you to
 * conclude.
 */
export function ComparisonRound({ widget, locked, onResult }: WidgetProps<ComparisonWidget>) {
  const theme = useAppTheme();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const candidate = widget.candidates.find((c) => c.id === candidateId);
  const relation = candidate ? relationOf(widget, candidate) : null;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <LiveScene
        scene={comparisonScene(widget, candidateId)}
        description={`The integrand (shaded) for x ≥ ${widget.a}${
          candidate
            ? ` and the comparison function, which ${relation === 'above' ? 'stays above it' : relation === 'below' ? 'stays below it' : 'crosses it'}`
            : ''
        }.`}
      />
      <AppText variant="small" color="textSecondary">
        1. Choose a comparison function to draw beside the integrand.
      </AppText>
      <ChipRow>
        {widget.candidates.map((c) => (
          <ChipButton
            key={c.id}
            label={c.label}
            selected={candidateId === c.id}
            accessibilityLabel={`Compare with ${c.label}`}
            onPress={() => !locked && setCandidateId(c.id)}
          />
        ))}
      </ChipRow>
      {candidate ? (
        <MathExpression
          tex={`g(x) = ${candidate.tex} \\text{ is ${relation === 'above' ? 'above' : relation === 'below' ? 'below' : 'on both sides of'} the integrand for } x \\ge ${widget.a}`}
          size={15}
        />
      ) : null}
      <AppText variant="small" color="textSecondary">
        2. What does the Comparison Theorem let you conclude about the integral?
      </AppText>
      <ChipRow>
        {CONCLUSIONS.map((c) => (
          <ChipButton
            key={c.id}
            label={c.label}
            selected={conclusion === c.id}
            onPress={() => !locked && setConclusion(c.id)}
          />
        ))}
      </ChipRow>
      <LoadingButton
        label="Check"
        disabled={locked || !candidate || !conclusion}
        onPress={() => candidate && conclusion && onResult(evaluateComparison(widget, candidate.id, conclusion))}
      />
    </View>
  );
}
