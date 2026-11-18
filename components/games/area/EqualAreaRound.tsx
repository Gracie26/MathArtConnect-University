import { useState } from 'react';
import { View } from 'react-native';

import { LiveScene } from '@/components/explore/area/AreaParts';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureItem } from '@/lib/figures/scene';
import {
  averageValue,
  type EqualAreaWidget,
  evaluateEqualHeight,
  evaluateMeanPoint,
  excessAndDeficit,
  exactIntegral,
} from '@/lib/games/areaWidgets';

import type { WidgetProps } from './WidgetRound';
import { functionScene, rangeOf, show } from './scenes';

/**
 * Equal-Area Height (App practice, §2.4): raise or lower a rectangle on
 * [a, b] until its area equals the area under the curve, then find c where
 * f(c) is that height.
 */
export function EqualAreaRound({ widget, locked, onResult }: WidgetProps<EqualAreaWidget>) {
  const theme = useAppTheme();
  const { fn } = widget;
  const { low, high } = rangeOf(fn);
  const [height, setHeight] = useState(Number(low.toFixed(2)));
  const [stage, setStage] = useState<'height' | 'point'>('height');
  const [c, setC] = useState((fn.a + fn.b) / 2);
  const avg = averageValue(fn);
  const h = stage === 'point' ? avg : height;
  const above = (x: number) => Math.max(fn.f(x), h);
  const below = (x: number) => Math.min(fn.f(x), h);
  const items: FigureItem[] = [
    { k: 'area', f: below, from: fn.a, to: fn.b, tone: 'fill3' },
    { k: 'area', f: above, base: () => h, from: fn.a, to: fn.b, tone: 'fill' },
    { k: 'area', f: () => h, base: below, from: fn.a, to: fn.b, tone: 'fill2' },
    { k: 'rect', x0: fn.a, x1: fn.b, height: h, outlineOnly: true },
    ...(stage === 'point'
      ? ([
          { k: 'segment', x1: c, y1: 0, x2: c, y2: fn.f(c), tone: 'asymptote', dashed: true },
          { k: 'point', x: c, y: fn.f(c), tone: 'asymptote' },
        ] as FigureItem[])
      : []),
  ];
  const { excess, deficit } = excessAndDeficit(fn, h);

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        App practice · the notes have no exercise for §2.4
      </AppText>
      <MathExpression tex={`f(x) = ${fn.tex}, \\quad ${fn.aLabel ?? fn.a} \\le x \\le ${fn.bLabel ?? fn.b}`} display />
      <LiveScene
        scene={functionScene(fn, items)}
        description={`A rectangle of height ${show(h)} on the interval. The region above the rectangle has area ${show(excess)}; the part of the rectangle above the curve has area ${show(deficit)}.`}
      />
      {stage === 'height' ? (
        <>
          <Slider
            label="Height of the rectangle"
            value={height}
            min={Number(low.toFixed(2))}
            max={Number(high.toFixed(2))}
            step={0.01}
            onChange={(v) => !locked && setHeight(v)}
            valueText={`height = ${show(height)}`}
          />
          <MathExpression
            tex={`\\text{rectangle } = ${show(height)}(b-a) = ${show(height * (fn.b - fn.a))}, \\quad \\int_{a}^{b} f(x)\\,dx = ${show(exactIntegral(fn))}`}
            size={15}
          />
          <LoadingButton
            label="Check the areas"
            disabled={locked}
            onPress={() => {
              const result = evaluateEqualHeight(widget, height);
              if (result.correct) {
                setStage('point');
                onResult({ ...result, cannotCheck: true });
              } else onResult(result);
            }}
          />
        </>
      ) : (
        <>
          <MathExpression tex={`f(c) = \\frac{1}{b-a}\\int_{a}^{b} f(x)\\,dx = ${show(avg)}`} display />
          <AppText variant="small" color="textSecondary">
            Now find c: a point of the interval where the curve reaches the rectangle’s top edge.
          </AppText>
          <Slider
            label="Move c"
            value={c}
            min={fn.a}
            max={fn.b}
            step={(fn.b - fn.a) / 200}
            onChange={(v) => !locked && setC(v)}
            valueText={`c = ${show(c)}, f(c) = ${show(fn.f(c))}`}
          />
          <LoadingButton label="Check c" disabled={locked} onPress={() => onResult(evaluateMeanPoint(widget, c))} />
        </>
      )}
    </View>
  );
}
