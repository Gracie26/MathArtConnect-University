import { useState } from 'react';
import { View } from 'react-native';

import { LiveScene, Readout } from '@/components/explore/area/AreaParts';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureItem, FigureScene } from '@/lib/figures/scene';
import {
  accumulated,
  type AccumulationWidget,
  accumulationTargets,
  evaluateAccumulationPlacement,
} from '@/lib/games/areaWidgets';

import type { WidgetProps } from './WidgetRound';
import { functionScene, rangeOf, show } from './scenes';

const TASK_WORDS: Record<AccumulationWidget['task']['type'], string> = {
  maximum: 'where A(x) is largest',
  minimum: 'where A(x) is smallest',
  steepest: 'where A(x) increases fastest',
  flat: 'a place where A(x) has a horizontal tangent',
};

/** The graph of A with the learner's point, the correct place(s) and the tangent at x. */
function accumulationScene(widget: AccumulationWidget, x: number): FigureScene {
  const { fn } = widget;
  const values = Array.from({ length: 121 }, (_, k) => accumulated(fn, fn.a + ((fn.b - fn.a) * k) / 120));
  const top = Math.max(0, ...values);
  const bottom = Math.min(0, ...values);
  const pad = (top - bottom || 1) * 0.2;
  const ax = accumulated(fn, x);
  const slope = fn.f(x);
  const half = (fn.b - fn.a) * 0.09;
  const targets = accumulationTargets(widget);
  return {
    view: { xMin: fn.a - 0.12 * (fn.b - fn.a), xMax: fn.b + 0.08 * (fn.b - fn.a), yMin: bottom - pad, yMax: top + pad },
    aspect: 0.5,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'A', xTicks: [{ at: x, label: 'x' }] },
    items: [
      { k: 'curve', f: (t) => accumulated(fn, t), from: fn.a, to: fn.b, tone: 'curve2' },
      ...targets.map((t): FigureItem => ({
        k: 'segment',
        x1: t,
        y1: bottom - pad,
        x2: t,
        y2: top + pad,
        tone: 'guide',
        dashed: true,
      })),
      {
        k: 'segment',
        x1: x - half,
        y1: ax - half * slope,
        x2: x + half,
        y2: ax + half * slope,
        tone: 'curve',
        width: 2,
      },
      { k: 'point', x, y: ax, tone: 'curve' },
    ],
  };
}

/**
 * Area–Derivative Link: place x on the graph of f where A(x) = ∫ₐˣ f(t) dt
 * has the asked-for feature, lock in the prediction, then see A revealed with
 * its tangent (slope f(x)).
 */
export function AccumulationRound({ widget, locked, onResult }: WidgetProps<AccumulationWidget>) {
  const theme = useAppTheme();
  const { fn } = widget;
  const [x, setX] = useState((fn.a + fn.b) / 2);
  const [revealed, setRevealed] = useState(false);
  const { low, high } = rangeOf(fn);
  const positive = (t: number) => Math.max(fn.f(t), 0);
  const negative = (t: number) => Math.min(fn.f(t), 0);
  const top = functionScene(fn, [
    { k: 'area', f: positive, from: fn.a, to: x, tone: 'fill' },
    { k: 'area', f: negative, from: fn.a, to: x, tone: 'fill2' },
    { k: 'segment', x1: x, y1: Math.min(low, 0), x2: x, y2: Math.max(high, 0), tone: 'edge', width: 1.5 },
    { k: 'point', x, y: fn.f(x), tone: 'curve' },
  ]);

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="small" color="textSecondary">
        {`Move x to ${TASK_WORDS[widget.task.type]}, where A(x) = ∫ from a to x of f(t) dt. Area below the axis counts as negative.`}
      </AppText>
      <LiveScene
        scene={top}
        description={`The graph of f(x) = ${fn.tex} with the area from a to x = ${show(x)} shaded (above the axis in one colour, below in another).`}
      />
      <Slider
        label="Move x"
        value={x}
        min={fn.a}
        max={fn.b}
        step={(fn.b - fn.a) / 200}
        onChange={(v) => !locked && setX(v)}
        valueText={`x = ${show(x)}`}
      />
      {revealed ? (
        <>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            Revealed: the graph of A(x), with its tangent at your x
          </AppText>
          <LiveScene
            scene={accumulationScene(widget, x)}
            description={`The graph of A. At x = ${show(x)}, A(x) = ${show(accumulated(fn, x))} and the slope of its tangent is ${show(fn.f(x))}, which equals f(x).`}
          />
          <Readout
            rows={[
              ['Accumulated area', `A(${show(x)}) = ${show(accumulated(fn, x))}`],
              ['Slope of A at x', `A'(${show(x)}) = ${show(fn.f(x))}`],
              ['Height of f at x', `f(${show(x)}) = ${show(fn.f(x))}`],
            ]}
          />
        </>
      ) : null}
      <LoadingButton
        label={revealed ? 'Check again' : 'Lock in my prediction'}
        disabled={locked}
        onPress={() => {
          setRevealed(true);
          onResult(evaluateAccumulationPlacement(widget, x));
        }}
      />
    </View>
  );
}
