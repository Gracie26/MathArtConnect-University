import { useRef, useState } from 'react';
import { View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  approximation,
  exactArea,
  RIEMANN_FUNCTIONS,
  type RiemannFunction,
  RULE_HEIGHT,
  RULE_LABELS,
} from '@/lib/explore/area';
import { type FigureItem, type FigureScene, type RiemannRule, riemannRects } from '@/lib/figures/scene';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from '../ExploreScaffold';
import { Insight, LabCard, LiveScene, Readout, show } from './AreaParts';

const RULES: RiemannRule[] = ['right', 'left', 'sample', 'midpoint'];

function sceneFor(fn: RiemannFunction, n: number, rule: RiemannRule, fraction: number): FigureScene {
  const span = fn.b - fn.a;
  let top = 0;
  for (let k = 0; k <= 200; k++) top = Math.max(top, fn.f(fn.a + (span * k) / 200));
  const { rects, points } = riemannRects(fn.f, fn.a, fn.b, n, rule, { fractions: [fraction] });
  const markers: FigureItem[] =
    n <= 40
      ? points.flatMap((x): FigureItem[] => [
          { k: 'segment', x1: x, y1: 0, x2: x, y2: fn.f(x), tone: 'asymptote', dashed: true, width: 1.1 },
          { k: 'point', x, y: fn.f(x), tone: 'asymptote' },
        ])
      : [];
  return {
    view: { xMin: fn.a - 0.12 * span, xMax: fn.b + 0.08 * span, yMin: -0.16 * top, yMax: 1.18 * top },
    aspect: 0.62,
    axes: {
      x: true,
      y: true,
      xLabel: 'x',
      yLabel: 'y',
      xTicks: [
        { at: fn.a, label: 'a' },
        { at: fn.b, label: 'b' },
      ],
    },
    items: [...rects, { k: 'curve', f: fn.f, from: fn.a - 0.05 * span, to: fn.b + 0.05 * span }, ...markers],
  };
}

function Explorer({
  activity,
  initial,
}: ActivityProps & { initial: { fn: string; rule: RiemannRule; n: number; midpointTable: boolean } }) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [fnId, setFnId] = useState(initial.fn);
  const [rule, setRule] = useState<RiemannRule>(initial.rule);
  const [n, setN] = useState(initial.n);
  const [fraction, setFraction] = useState(0.3);
  const tried = useRef({ rules: new Set<RiemannRule>([initial.rule]), ns: new Set<number>([initial.n]) });
  const fn = RIEMANN_FUNCTIONS.find((f) => f.id === fnId) ?? (RIEMANN_FUNCTIONS[0] as RiemannFunction);

  const note = (nextRule: RiemannRule, nextN: number) => {
    tried.current.rules.add(nextRule);
    tried.current.ns.add(nextN);
    if (tried.current.rules.size >= 3 && tried.current.ns.size >= 2)
      void complete({ rules: tried.current.rules.size, function: fn.id });
  };

  const scene = (() => sceneFor(fn, n, rule, fraction))();
  const exact = (() => exactArea(fn))();
  const value = approximation(fn, n, rule, fraction);
  const dx = (fn.b - fn.a) / n;
  const all = RULES.map((r) => [r, approximation(fn, n, r, fraction)] as const);

  return (
    <ExploreScaffold
      activity={activity}
      intro="Approximate the area under a curve with $n$ rectangles of width $\Delta x = \frac{b-a}{n}$. Choose where each rectangle's height is read, and watch the approximation change."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {RIEMANN_FUNCTIONS.map((f) => (
          <ChipButton key={f.id} label={f.label} selected={f.id === fn.id} onPress={() => setFnId(f.id)} />
        ))}
      </ChipRow>
      <ChipRow>
        {RULES.map((r) => (
          <ChipButton
            key={r}
            label={RULE_LABELS[r]}
            selected={r === rule}
            onPress={() => {
              setRule(r);
              note(r, n);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        <LiveScene
          scene={scene}
          description={`${n} rectangles under ${fn.label}, heights read ${RULE_HEIGHT[rule].words}. Their total area is ${show(value)}; the area under the curve is about ${show(exact)}.`}
        />
        <AppText variant="small" color="textSecondary">
          {fn.source}
        </AppText>
        <Slider
          label="Number of rectangles n"
          value={n}
          min={1}
          max={50}
          step={1}
          onChange={(v) => {
            setN(v);
            note(rule, v);
          }}
          valueText={`n = ${n}`}
        />
        {rule === 'sample' ? (
          <Slider
            label="Where the sample point sits in each subinterval"
            value={fraction}
            min={0}
            max={1}
            step={0.05}
            onChange={setFraction}
            valueText={`${Math.round(fraction * 100)}% of the way across`}
          />
        ) : null}
        <Readout
          rows={[
            ['Width', `\\Delta x = \\frac{b-a}{n} = ${show(dx)}`],
            ['Height of the ith rectangle', `${RULE_HEIGHT[rule].tex}`],
            ['Approximation', `${RULE_HEIGHT[rule].sum} = ${show(value)}`],
            ['Area under the curve', `\\approx ${show(exact)}`],
            ['Difference', `${show(value - exact)}`],
          ]}
        />
      </LabCard>

      {initial.midpointTable && rule === 'midpoint' && n <= 8 ? (
        <LabCard>
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            Midpoints and heights
          </AppText>
          {Array.from({ length: n }, (_, k) => {
            const xBar = fn.a + (k + 0.5) * dx;
            return (
              <MathExpression
                key={k}
                tex={`\\bar{x}_{${k + 1}} = ${show(xBar)}, \\quad f(\\bar{x}_{${k + 1}}) = ${show(fn.f(xBar))}`}
                size={15}
              />
            );
          })}
          <MathExpression tex={`M_{${n}} = \\Delta x\\,[\\,\\text{sum of heights}\\,] = ${show(value)}`} size={15} />
        </LabCard>
      ) : null}

      <LabCard>
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          {`All four rules with n = ${n}`}
        </AppText>
        <View style={{ gap: theme.spacing.xs }}>
          {all.map(([r, v]) => (
            <MathExpression key={r} tex={`\\text{${RULE_LABELS[r]}: } ${RULE_HEIGHT[r].sum} = ${show(v)}`} size={15} />
          ))}
        </View>
      </LabCard>

      <Insight
        title="What to notice"
        text="Right endpoints put each rectangle's top right corner on the curve; left endpoints its top left corner; a sample point can be anywhere in the subinterval; a midpoint is in the middle. For a decreasing curve the right rule underestimates and the left rule overestimates. As $n$ grows, every rule approaches the same area: the definite integral (Definition 2.2.4)."
      />
    </ExploreScaffold>
  );
}

/** Riemann Sum Explorer (§2.2): the four ways of choosing the heights. */
export function RiemannExplorer(props: ActivityProps) {
  return <Explorer {...props} initial={{ fn: 'notes', rule: 'right', n: 9, midpointTable: false }} />;
}

/** Mid-point Rule Lab (§2.2.1): starts from Example 2.2.3 (n = 4, eˣ on [0, 2]). */
export function MidpointRuleLab(props: ActivityProps) {
  return <Explorer {...props} initial={{ fn: 'ex223', rule: 'midpoint', n: 4, midpointTable: true }} />;
}
