import { useState } from 'react';
import { View } from 'react-native';

import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { LiveScene, Readout } from '@/components/explore/area/AreaParts';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureItem, FigureScene } from '@/lib/figures/scene';
import {
  type ConvergencePrediction,
  evaluateImproperPrediction,
  evaluateImproperReason,
  evaluateSplit,
  type ImproperWidget,
} from '@/lib/games/areaWidgets';

import { GameCard } from '../GameParts';
import type { WidgetProps } from './WidgetRound';
import { show } from './scenes';

/** t on a logarithmic scale between the fixed end and the improper end (s ∈ [0, 1]). */
export function tAt(widget: ImproperWidget, s: number): number {
  // Infinite end: from 0.5 beyond the fixed end out to a million beyond it.
  if (!Number.isFinite(widget.approaches)) return widget.fixed + Math.sign(widget.approaches) * 0.5 * 2e6 ** s;
  const gap = Math.abs(widget.fixed - widget.approaches) * 0.9;
  const distance = gap * (1e-6 / gap) ** s;
  return widget.approaches + Math.sign(widget.fixed - widget.approaches) * distance;
}

function scene(widget: ImproperWidget, t: number): FigureScene {
  const { view } = widget;
  const lo = Math.min(widget.fixed, t);
  const hi = Math.max(widget.fixed, t);
  const clampedLo = Math.max(lo, view.xMin);
  const clampedHi = Math.min(hi, view.xMax);
  const items: FigureItem[] = [
    { k: 'area', f: widget.f, from: clampedLo, to: clampedHi, tone: 'fill' },
    { k: 'curve', f: widget.f, from: view.xMin, to: view.xMax },
    ...(Number.isFinite(widget.approaches)
      ? [
          {
            k: 'segment',
            x1: widget.approaches,
            y1: view.yMin,
            x2: widget.approaches,
            y2: view.yMax,
            tone: 'asymptote',
            width: 2,
          } as FigureItem,
        ]
      : []),
    ...(widget.split
      ? [
          {
            k: 'segment',
            x1: widget.split.at,
            y1: view.yMin,
            x2: widget.split.at,
            y2: view.yMax,
            tone: 'asymptote',
            width: 2,
          } as FigureItem,
        ]
      : []),
    ...(t >= view.xMin && t <= view.xMax
      ? [
          {
            k: 'segment',
            x1: t,
            y1: 0,
            x2: t,
            y2: Math.max(Math.min(widget.f(t), view.yMax), view.yMin),
            tone: 'edge',
          } as FigureItem,
        ]
      : [
          {
            k: 'label',
            x: view.xMax - 0.02 * (view.xMax - view.xMin),
            y: view.yMax * 0.4,
            text: 't is off the screen →',
            anchor: 'end',
            size: 'small',
          } as FigureItem,
        ]),
  ];
  return { view, aspect: 0.62, axes: { x: true, y: true, xLabel: 'x', yLabel: 'y', origin: true }, items };
}

/**
 * Converge or Diverge / Approach the Asymptote: split at an interior
 * asymptote where needed, predict, then move t towards the improper end and
 * watch A(t), then explain.
 */
export function ImproperRound({ widget, locked, onResult }: WidgetProps<ImproperWidget>) {
  const theme = useAppTheme();
  const [stage, setStage] = useState<'split' | 'predict' | 'explore'>(widget.split ? 'split' : 'predict');
  const [prediction, setPrediction] = useState<ConvergencePrediction | null>(null);
  const [s, setS] = useState(0);
  const [reached, setReached] = useState(0);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const t = tAt(widget, s);
  const value = widget.partial(t);
  const milestones = [0, 0.25, 0.5, 0.75, 1].filter((m) => m <= reached + 1e-9);
  const endWords = Number.isFinite(widget.approaches)
    ? `t → ${widget.approaches}${widget.fixed < widget.approaches ? '⁻' : '⁺'}`
    : `t → ${widget.approaches > 0 ? '∞' : '−∞'}`;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <LiveScene
        scene={scene(widget, t)}
        description={`The graph with the area from ${show(Math.min(widget.fixed, t))} to ${show(Math.max(widget.fixed, t))} shaded${
          stage === 'explore' ? `; A(t) = ${show(value)}` : ''
        }.`}
      />

      {stage === 'split' && widget.split ? (
        <View style={{ gap: theme.spacing.sm }}>
          <MathText
            text={`A careless calculation gives $${widget.split.naiveTex}$. Before trusting it: where must this integral be split?`}
          />
          <ChipRow>
            {widget.split.options.map((at) => (
              <ChipButton
                key={at}
                label={`Split at x = ${at}`}
                onPress={() => {
                  if (locked || !widget.split) return;
                  const result = evaluateSplit(widget, at);
                  if (result.correct) {
                    setStage('predict');
                    onResult({ ...result, cannotCheck: true });
                  } else onResult(result);
                }}
              />
            ))}
          </ChipRow>
        </View>
      ) : null}

      {stage === 'predict' ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="small" color="textSecondary">
            {`Predict first: as ${endWords}, does the area A(t) settle down to a finite number?`}
          </AppText>
          <ChipRow>
            {(['converges', 'diverges'] as const).map((p) => (
              <ChipButton
                key={p}
                label={p === 'converges' ? 'Converges (finite area)' : 'Diverges (no finite area)'}
                selected={prediction === p}
                onPress={() => {
                  if (locked) return;
                  setPrediction(p);
                  const result = evaluateImproperPrediction(widget, p);
                  setStage('explore');
                  onResult(result.correct ? { ...result, cannotCheck: true } : result);
                }}
              />
            ))}
          </ChipRow>
        </View>
      ) : null}

      {stage === 'explore' ? (
        <View style={{ gap: theme.spacing.md }}>
          <Slider
            label={`Move t (${endWords}, logarithmic scale)`}
            value={s}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => {
              setS(v);
              setReached((r) => Math.max(r, v));
            }}
            valueText={`t = ${show(t)}`}
          />
          <Readout
            rows={[
              ['Area so far', `${widget.partialTex} = ${show(value)}`],
              ...milestones.map((m): [string, string] => [
                `At t = ${show(tAt(widget, m))}`,
                `A(t) = ${show(widget.partial(tAt(widget, m)))}`,
              ]),
            ]}
          />
          {reached >= 0.75 ? (
            <View style={{ gap: theme.spacing.sm }}>
              <AppText variant="small" color="textSecondary">
                Why does it behave like this?
              </AppText>
              {widget.reasons.map((r) => (
                <GameCard
                  key={r.id}
                  item={{ text: r.text }}
                  selected={reasonId === r.id}
                  disabled={locked}
                  label={r.text.replace(/\$/g, '')}
                  onPress={() => {
                    setReasonId(r.id);
                    onResult(evaluateImproperReason(widget, r.id));
                  }}
                />
              ))}
            </View>
          ) : (
            <AppText variant="small" color="textSecondary">
              Move t most of the way to the end to watch what A(t) does, then explain it.
            </AppText>
          )}
        </View>
      ) : null}
    </View>
  );
}
