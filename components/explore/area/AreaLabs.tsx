/**
 * Explore tools for Topic 2 (other than the Riemann Sum Explorer): limits of
 * sums, properties as areas, accumulation (SFTC), the mean value rectangle,
 * and improper integrals of both types with the Comparison Theorem. Each one
 * supplements a figure or an example of the notes; the notes' explanation
 * stays in the lesson.
 */
import { useRef, useState } from 'react';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  ACCUMULATION,
  approximation,
  areaUpTo,
  COMPARISON_CASES,
  type ComparisonCase,
  type ImproperCase,
  LIMIT_EXAMPLES,
  type LimitExample,
  logScale,
  MVT,
  mvtArea,
  mvtAverage,
  mvtPoint,
  notesCurve,
  TYPE_ONE_CASES,
  TYPE_TWO_CASES,
} from '@/lib/explore/area';
import { type FigureItem, type FigureScene, riemannRects, simpson } from '@/lib/figures/scene';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from '../ExploreScaffold';
import { Insight, LabCard, LiveScene, Readout, show } from './AreaParts';

/** Records the visit as explored once the learner has made `needed` distinct changes. */
function useChanges(complete: (detail: Record<string, string | number | boolean>) => Promise<void>, needed = 3) {
  const seen = useRef(new Set<string>());
  return (key: string) => {
    seen.current.add(key);
    if (seen.current.size >= needed) void complete({ changes: seen.current.size });
  };
}

const maxOf = (f: (x: number) => number, a: number, b: number) => {
  let top = -Infinity;
  for (let k = 0; k <= 200; k++) top = Math.max(top, f(a + ((b - a) * k) / 200));
  return top;
};

// -----------------------------------------------------------------------------
// From sums to the integral (§2.2.1, Examples 2.2.1 and 2.2.2)
// -----------------------------------------------------------------------------

export function LimitOfSumsLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [exampleId, setExampleId] = useState('ex221');
  const [n, setN] = useState(4);
  const example = LIMIT_EXAMPLES.find((e) => e.id === exampleId) ?? (LIMIT_EXAMPLES[0] as LimitExample);
  const { fn } = example;

  const scene = ((): FigureScene => {
    const top = maxOf(fn.f, fn.a, fn.b);
    const span = fn.b - fn.a;
    return {
      view: { xMin: fn.a - 0.15 * span, xMax: fn.b + 0.1 * span, yMin: -0.15 * top, yMax: 1.15 * top },
      aspect: 0.6,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [
          { at: fn.a, label: String(fn.a) },
          { at: fn.b, label: String(fn.b) },
        ],
      },
      items: [...riemannRects(fn.f, fn.a, fn.b, n, 'right').rects, { k: 'curve', f: fn.f, from: fn.a, to: fn.b }],
    };
  })();

  // Rₙ against n: the dots approach the dashed line at the limit.
  const trend = ((): FigureScene => {
    const values = Array.from({ length: 40 }, (_, k) => example.closedForm(k + 1));
    const top = Math.max(...values, example.limit) * 1.1;
    const bottom = Math.min(0, ...values);
    return {
      view: { xMin: -2, xMax: 42, yMin: bottom - 0.12 * top, yMax: top },
      aspect: 0.45,
      axes: { x: true, y: true, xLabel: 'n', xTicks: [10, 20, 30, 40].map((at) => ({ at, label: String(at) })) },
      items: [
        { k: 'segment', x1: 0, y1: example.limit, x2: 41, y2: example.limit, tone: 'guide', dashed: true },
        {
          k: 'label',
          x: 41,
          y: example.limit + 0.06 * top,
          text: `limit = ${example.limit}`,
          anchor: 'end',
          size: 'small',
        },
        ...values.map((v, k): FigureItem => ({
          k: 'point',
          x: k + 1,
          y: v,
          tone: k + 1 === n ? 'curve' : 'asymptote',
        })),
      ],
    };
  })();

  return (
    <ExploreScaffold
      activity={activity}
      intro="The definite integral is the limit of the Riemann sums (Theorem 2.2.1). Increase $n$ and watch the sum from the worked example approach its limit."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {LIMIT_EXAMPLES.map((e) => (
          <ChipButton
            key={e.id}
            label={e.label}
            selected={e.id === exampleId}
            onPress={() => {
              setExampleId(e.id);
              changed(`example-${e.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={fn.tex} display />
        <LiveScene scene={scene} description={`${n} right-endpoint rectangles under ${fn.label}.`} />
        <Slider
          label="Number of rectangles n"
          value={n}
          min={1}
          max={40}
          step={1}
          onChange={(v) => {
            setN(v);
            changed(`n-${v}`);
          }}
          valueText={`n = ${n}`}
        />
        <Readout
          rows={[
            ['From the worked example', example.closedFormTex],
            [`With n = ${n}`, `R_{${n}} = ${show(example.closedForm(n))}`],
            ['Adding the rectangles', `\\sum_{i=1}^{${n}} f(x_{i})\\Delta x = ${show(approximation(fn, n, 'right'))}`],
            ['Limit as n → ∞', `${example.limit}`],
          ]}
        />
      </LabCard>
      <LabCard>
        <AppText variant="caption" color="textSecondary">
          The Riemann sum for n = 1 to 40
        </AppText>
        <LiveScene
          scene={trend}
          description={`The values of the Riemann sum for n from 1 to 40 approach ${example.limit}.`}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text="The closed form from the worked example and the sum of the rectangles agree for every $n$. As $n \to \infty$ the extra area above the curve shrinks to nothing, so the sums approach the definite integral."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// Properties as areas (§2.2.2)
// -----------------------------------------------------------------------------

type PropertyMode = 'split' | 'reverse' | 'compare';
const PA = 1;
const PB = 8;
const lower = (x: number) => 0.9 + 0.5 * Math.sin(0.9 * x) + 0.08 * x;
const upper = (x: number) => lower(x) + 1.1 + 0.25 * Math.cos(1.3 * x);

export function PropertiesLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [mode, setMode] = useState<PropertyMode>('split');
  const [c, setC] = useState(4.5);
  const [reversed, setReversed] = useState(false);
  const total = simpson(notesCurve, PA, PB);
  const left = simpson(notesCurve, PA, c);
  const right = simpson(notesCurve, c, PB);
  const intF = simpson(lower, PA, PB);
  const intG = simpson(upper, PA, PB);

  const scene = ((): FigureScene => {
    const base: FigureScene = {
      view: { xMin: -0.6, xMax: 9.1, yMin: -0.85, yMax: 5.1 },
      aspect: 0.6,
      axes: {
        x: true,
        y: true,
        xLabel: 'x',
        yLabel: 'y',
        xTicks: [
          { at: PA, label: 'a' },
          { at: PB, label: 'b' },
        ],
      },
      items: [],
    };
    if (mode === 'split') {
      return {
        ...base,
        axes: { ...base.axes, xTicks: [...(base.axes.xTicks ?? []), { at: c, label: 'c' }] },
        items: [
          { k: 'area', f: notesCurve, from: PA, to: c, tone: 'fill' },
          { k: 'area', f: notesCurve, from: c, to: PB, tone: 'fill2' },
          { k: 'curve', f: notesCurve, from: PA, to: PB },
          { k: 'segment', x1: c, y1: 0, x2: c, y2: notesCurve(c), dashed: true },
        ],
      };
    }
    if (mode === 'reverse') {
      const [from, to] = reversed ? [PB, PA] : [PA, PB];
      return {
        ...base,
        items: [
          { k: 'area', f: notesCurve, from: PA, to: PB, tone: reversed ? 'fill2' : 'fill' },
          { k: 'curve', f: notesCurve, from: PA, to: PB },
          { k: 'segment', x1: from, y1: -0.45, x2: to, y2: -0.45, tone: 'asymptote', arrow: 'end', width: 2 },
        ],
      };
    }
    return {
      ...base,
      view: { ...base.view, yMax: 4.4 },
      items: [
        { k: 'area', f: upper, from: PA, to: PB, tone: 'fill2' },
        { k: 'area', f: lower, from: PA, to: PB, tone: 'fill' },
        { k: 'curve', f: upper, from: PA, to: PB, tone: 'curve2' },
        { k: 'curve', f: lower, from: PA, to: PB },
        { k: 'label', x: 8.2, y: upper(8), text: 'g', anchor: 'start', italic: true, tone: 'curve2' },
        { k: 'label', x: 8.2, y: lower(8), text: 'f', anchor: 'start', italic: true },
      ],
    };
  })();

  return (
    <ExploreScaffold
      activity={activity}
      intro="See the properties of §2.2.2 as statements about areas: splitting the interval, reversing the limits and comparing two functions."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {(
          [
            ['split', 'Split at c (Theorem 2.2.4 (iii))'],
            ['reverse', 'Reverse the limits (Theorem 2.2.3)'],
            ['compare', 'Compare f ≤ g (Theorem 2.2.7)'],
          ] as const
        ).map(([id, label]) => (
          <ChipButton
            key={id}
            label={label}
            selected={mode === id}
            onPress={() => {
              setMode(id);
              changed(`mode-${id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <LiveScene
          scene={scene}
          description="The region under a curve from a to b, illustrating the chosen property."
        />
        {mode === 'split' ? (
          <>
            <Slider
              label="Split point c"
              value={c}
              min={PA}
              max={PB}
              step={0.1}
              onChange={(v) => {
                setC(v);
                changed(`c-${Math.round(v)}`);
              }}
              valueText={`c = ${show(c)}`}
            />
            <Readout
              rows={[
                ['From a to c', `\\int_{a}^{c} f = ${show(left)}`],
                ['From c to b', `\\int_{c}^{b} f = ${show(right)}`],
                ['Sum', `${show(left)} + ${show(right)} = ${show(left + right)}`],
                ['From a to b', `\\int_{a}^{b} f = ${show(total)}`],
              ]}
            />
          </>
        ) : null}
        {mode === 'reverse' ? (
          <>
            <LoadingButton
              variant="secondary"
              label={reversed ? 'Integrate from a to b' : 'Integrate from b to a'}
              onPress={() => {
                setReversed((r) => !r);
                changed(`reverse-${!reversed}`);
              }}
            />
            <Readout
              rows={[
                ['Direction', reversed ? '\\text{from } b \\text{ to } a' : '\\text{from } a \\text{ to } b'],
                ['Value', reversed ? `\\int_{b}^{a} f = ${show(-total)}` : `\\int_{a}^{b} f = ${show(total)}`],
              ]}
            />
          </>
        ) : null}
        {mode === 'compare' ? (
          <Readout
            rows={[
              ['Under f', `\\int_{a}^{b} f = ${show(intF)}`],
              ['Under g', `\\int_{a}^{b} g = ${show(intG)}`],
              ['Since f ≤ g', `${show(intF)} \\le ${show(intG)}`],
            ]}
          />
        ) : null}
      </LabCard>
      <Insight
        title="What to notice"
        text="Splitting at any $c$ in $[a, b]$ never changes the total. Reversing the limits keeps the same region but changes the sign. When $f(x) \le g(x)$ on $[a, b]$, the region under $f$ fits inside the region under $g$, so its integral is smaller."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// Area accumulation (§2.3, SFTC)
// -----------------------------------------------------------------------------

export function AccumulationLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [x, setX] = useState(2);
  const { a, b, f, g } = ACCUMULATION;
  const positive = (t: number) => Math.max(f(t), 0);
  const negative = (t: number) => Math.min(f(t), 0);

  const top: FigureScene = {
    view: { xMin: -0.5, xMax: 6.4, yMin: -1.1, yMax: 2.2 },
    aspect: 0.5,
    axes: { x: true, y: true, xLabel: 't', yLabel: 'y', xTicks: [{ at: x, label: 'x' }] },
    items: [
      { k: 'area', f: positive, from: a, to: x, tone: 'fill' },
      { k: 'area', f: negative, from: a, to: x, tone: 'fill2' },
      { k: 'curve', f, from: a, to: b },
      { k: 'segment', x1: x, y1: 0, x2: x, y2: f(x), tone: 'edge' },
      { k: 'label', x: 5.9, y: 1.85, text: 'y = f(t)', anchor: 'end', italic: true },
    ],
  };
  const slope = f(x);
  const bottom: FigureScene = {
    view: { xMin: -0.5, xMax: 6.4, yMin: -0.6, yMax: 6.6 },
    aspect: 0.5,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'g', xTicks: [{ at: x, label: 'x' }] },
    items: [
      { k: 'curve', f: g, from: a, to: b, tone: 'curve2' },
      {
        k: 'segment',
        x1: x - 0.8,
        y1: g(x) - 0.8 * slope,
        x2: x + 0.8,
        y2: g(x) + 0.8 * slope,
        tone: 'curve',
        width: 2,
      },
      { k: 'point', x, y: g(x), tone: 'curve' },
      { k: 'label', x: 5.9, y: 6.1, text: 'y = g(x)', anchor: 'end', italic: true, tone: 'curve2' },
    ],
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Let $g(x) = \int_{0}^{x} f(t)\,dt$ be the area accumulated from $0$ up to $x$ (area below the axis counts as negative). The Second Fundamental Theorem says $g'(x) = f(x)$."
      explored={explored}
      error={error}
    >
      <LabCard>
        <MathExpression tex={`${ACCUMULATION.fTex}, \\quad g(x) = \\int_{0}^{x} f(t)\\,dt`} display />
        <LiveScene
          scene={top}
          description={`The area under f from 0 to x = ${show(x)} is shaded; it equals g(x) = ${show(g(x))}.`}
        />
        <LiveScene
          scene={bottom}
          description={`The graph of g with its tangent at x = ${show(x)}; the tangent's slope is ${show(slope)}, which equals f(x).`}
        />
        <Slider
          label="Upper limit x"
          value={x}
          min={0}
          max={6}
          step={0.1}
          onChange={(v) => {
            setX(v);
            changed(`x-${Math.round(v)}`);
          }}
          valueText={`x = ${show(x)}`}
        />
        <Readout
          rows={[
            ['Accumulated area', `g(${show(x)}) = ${show(g(x))}`],
            ['Height of f at x', `f(${show(x)}) = ${show(slope)}`],
            ['Slope of g at x', `g'(${show(x)}) = ${show(slope)}`],
          ]}
        />
      </LabCard>
      <Insight
        title="What to notice"
        text="Where $f$ is positive, $g$ increases; where $f$ is negative, $g$ decreases; where $f(x) = 0$, $g$ has a flat tangent. Moving $x$ a little adds a thin strip of height about $f(x)$, so $g$ changes at the rate $f(x)$. Integrating and then differentiating gives back $f$ (Remark 2.3.3)."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// The mean value rectangle (§2.4, Figure 2.5)
// -----------------------------------------------------------------------------

export function MeanValueLab({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const fm = MVT.f(MVT.a);
  const fM = MVT.f(MVT.b);
  const [h, setH] = useState(fm);
  const [shown, setShown] = useState(false);
  const area = mvtArea();
  const average = mvtAverage();
  const c = mvtPoint();
  const rectangle = h * (MVT.b - MVT.a);
  const close = Math.abs(rectangle - area) <= 0.01 * area;
  const above = (x: number) => Math.max(MVT.f(x), h);
  const below = (x: number) => Math.min(MVT.f(x), h);

  const scene: FigureScene = {
    view: { xMin: -0.4, xMax: 4.3, yMin: -0.35, yMax: 2.05 },
    aspect: 0.62,
    axes: {
      x: true,
      y: false,
      xTicks: [{ at: MVT.a, label: 'a' }, { at: MVT.b, label: 'b' }, ...(shown ? [{ at: c, label: 'c' }] : [])],
    },
    items: [
      { k: 'area', f: below, from: MVT.a, to: MVT.b, tone: 'fill3' },
      { k: 'area', f: above, base: () => h, from: MVT.a, to: MVT.b, tone: 'fill' },
      { k: 'area', f: () => h, base: below, from: MVT.a, to: MVT.b, tone: 'fill2' },
      { k: 'rect', x0: MVT.a, x1: MVT.b, height: h, outlineOnly: true },
      { k: 'curve', f: MVT.f, from: MVT.a - 0.3, to: MVT.b },
      { k: 'segment', x1: -0.3, y1: fm, x2: MVT.a, y2: fm, tone: 'guide', dashed: true },
      { k: 'label', x: -0.32, y: fm + 0.08, text: 'f(m)', anchor: 'start', size: 'small' },
      { k: 'segment', x1: MVT.b, y1: fM, x2: 4.2, y2: fM, tone: 'guide', dashed: true },
      { k: 'label', x: 4.2, y: fM + 0.08, text: 'f(M)', anchor: 'end', size: 'small' },
      ...(shown
        ? [{ k: 'segment', x1: c, y1: 0, x2: c, y2: average, tone: 'asymptote', dashed: true } as FigureItem]
        : []),
    ],
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Raise or lower the rectangle on $[a, b]$ between the inscribed height $f(m)$ and the circumscribed height $f(M)$. At one height its area equals the area under the curve: that height is the average value $f(c)$."
      explored={explored}
      error={error}
    >
      <LabCard>
        <LiveScene
          scene={scene}
          description={`A rectangle of height ${show(h)} on [a, b] and the curve of Figure 2.5. Rectangle area ${show(rectangle)}; area under the curve ${show(area)}.`}
        />
        <Slider
          label="Height of the rectangle"
          value={h}
          min={Number(fm.toFixed(2))}
          max={Number(fM.toFixed(2))}
          step={0.01}
          onChange={(v) => {
            setH(v);
            if (Math.abs(v * (MVT.b - MVT.a) - area) <= 0.01 * area) void complete({ found: true });
          }}
          valueText={`height = ${show(h)}`}
        />
        <Readout
          rows={[
            ['Rectangle', `h(b - a) = ${show(rectangle)}`],
            ['Under the curve', `\\int_{a}^{b} f(x)\\,dx = ${show(area)}`],
          ]}
        />
        <AppText
          variant="small"
          color={close ? 'success' : 'textSecondary'}
          style={{ fontFamily: theme.fontFamilies.semibold }}
        >
          {close
            ? 'Equal (to within 1%): the shaded part above the rectangle balances the part of the rectangle above the curve.'
            : rectangle < area
              ? 'The rectangle is too small: more of the region sticks out above it.'
              : 'The rectangle is too big: more of it lies above the curve.'}
        </AppText>
        <LoadingButton
          variant="secondary"
          label={shown ? 'Hide f(c)' : 'Show the average value f(c)'}
          onPress={() => {
            setShown((s) => !s);
            setH(Number(average.toFixed(2)));
          }}
        />
        {shown ? (
          <Readout
            rows={[
              ['Average value', `f(c) = \\frac{1}{b-a}\\int_{a}^{b} f(x)\\,dx = ${show(average)}`],
              ['Where it is reached', `c \\approx ${show(c)}`],
            ]}
          />
        ) : null}
      </LabCard>
      <Insight
        title="What to notice"
        text="The rectangle of height $f(m)$ is too small and the one of height $f(M)$ too big; because $f$ is continuous, some height between them gives exactly $\int_{a}^{b} f(x)\,dx$, and $f$ takes that value at some $c$ in $[a, b]$ (Theorem 2.4.1)."
      />
    </ExploreScaffold>
  );
}

// -----------------------------------------------------------------------------
// Improper integrals: Type I, Type II and the Comparison Theorem (§2.5)
// -----------------------------------------------------------------------------

export function InfiniteIntervalLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [caseId, setCaseId] = useState('inverse-square');
  const [s, setS] = useState(0.3);
  const item = TYPE_ONE_CASES.find((c) => c.id === caseId) ?? (TYPE_ONE_CASES[0] as ImproperCase);
  const t = logScale(s, 1.5, 1e6);
  const shownTo = Math.min(t, 9.6);

  const scene: FigureScene = {
    view: { xMin: -0.5, xMax: 9.8, yMin: -0.3, yMax: 2.3 },
    aspect: 0.6,
    axes: {
      x: true,
      y: true,
      xLabel: 'x',
      yLabel: 'y',
      origin: true,
      xTicks: [{ at: 1, label: '1' }, ...(t <= 9.6 ? [{ at: t, label: 't' }] : [])],
    },
    items: [
      { k: 'area', f: item.f, from: 1, to: shownTo },
      { k: 'curve', f: item.f, from: 0.44, to: 9.8 },
      { k: 'segment', x1: 1, y1: 0, x2: 1, y2: 1 },
      ...(t <= 9.6 ? [{ k: 'segment', x1: t, y1: 0, x2: t, y2: item.f(t) } as FigureItem] : []),
      ...(t > 9.6
        ? [{ k: 'label', x: 9.6, y: 0.5, text: 't is further right →', anchor: 'end', size: 'small' } as FigureItem]
        : []),
      { k: 'label', x: 1.2, y: 2.05, text: item.label, anchor: 'start', italic: true },
    ],
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Move $t$ further and further to the right. Does the area from $x = 1$ to $x = t$ settle down to a number, or keep growing?"
      explored={explored}
      error={error}
    >
      <ChipRow>
        {TYPE_ONE_CASES.map((c) => (
          <ChipButton
            key={c.id}
            label={c.label}
            selected={c.id === caseId}
            onPress={() => {
              setCaseId(c.id);
              changed(`case-${c.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={`${item.tex}, \\qquad ${item.partialTex}`} display />
        <LiveScene
          scene={scene}
          description={`The area under ${item.label} from 1 to t = ${show(t)} is ${show(item.partial(t))}.`}
        />
        <Slider
          label="Upper limit t (logarithmic scale)"
          value={s}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => {
            setS(v);
            changed(`t-${Math.round(v * 5)}`);
          }}
          valueText={`t = ${show(t)}`}
        />
        <Readout
          rows={[
            ['Upper limit', `t = ${show(t)}`],
            ['Area up to t', `A(t) = ${show(item.partial(t))}`],
            [
              'As t → ∞',
              item.limit === null
                ? 'A(t) \\to \\infty \\text{ (divergent)}'
                : `A(t) \\to ${item.limit} \\text{ (convergent)}`,
            ],
          ]}
        />
        <AppText variant="small" color="textSecondary">
          {item.source}
        </AppText>
      </LabCard>
      <Insight
        title="What to notice"
        text="Both curves approach 0, but $1/x^{2}$ approaches 0 faster than $1/x$. The area under $1/x^{2}$ never passes 1, however large $t$ is; the area under $1/x$ is $\ln t$, which grows without bound."
      />
    </ExploreScaffold>
  );
}

export function AsymptoteLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [caseId, setCaseId] = useState('root');
  const [s, setS] = useState(0.2);
  const item = TYPE_TWO_CASES.find((c) => c.id === caseId) ?? (TYPE_TWO_CASES[0] as ImproperCase);
  // t − 2 from 2 down to 10⁻⁶ (logarithmic).
  const t = 2 + logScale(s, 2, 1e-6);

  const scene: FigureScene = {
    view: { xMin: -0.35, xMax: 6.4, yMin: -0.55, yMax: 4.2 },
    aspect: 0.62,
    axes: {
      x: true,
      y: true,
      xLabel: 'x',
      yLabel: 'y',
      origin: true,
      xTicks: [1, 2, 3, 4, 5].map((at) => ({ at, label: String(at) })),
    },
    items: [
      { k: 'area', f: item.f, from: Math.max(t, 2.0004), to: 5 },
      { k: 'curve', f: item.f, from: 2.02, to: 6.3 },
      { k: 'segment', x1: 5, y1: 0, x2: 5, y2: item.f(5) },
      ...(t - 2 > 0.06 ? [{ k: 'segment', x1: t, y1: 0, x2: t, y2: Math.min(item.f(t), 4.2) } as FigureItem] : []),
      { k: 'segment', x1: 2, y1: 0, x2: 2, y2: 4.2, tone: 'asymptote', width: 2 },
      { k: 'label', x: 2.4, y: 3.7, text: item.label, anchor: 'start', italic: true },
    ],
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="The line $x = 2$ is a vertical asymptote. Move $t$ towards 2 from the right and watch the area from $t$ to 5."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {TYPE_TWO_CASES.map((c) => (
          <ChipButton
            key={c.id}
            label={c.label}
            selected={c.id === caseId}
            onPress={() => {
              setCaseId(c.id);
              changed(`case-${c.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression tex={`${item.tex}, \\qquad ${item.partialTex}`} display />
        <LiveScene
          scene={scene}
          description={`The area under ${item.label} from t = ${show(t)} to 5 is ${show(item.partial(t))}.`}
        />
        <Slider
          label="How close t is to 2 (logarithmic scale)"
          value={s}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => {
            setS(v);
            changed(`t-${Math.round(v * 5)}`);
          }}
          valueText={`t = 2 + ${show(t - 2)}`}
        />
        <Readout
          rows={[
            ['Lower limit', `t = ${show(t)}`],
            ['Area from t to 5', `A(t) = ${show(item.partial(t))}`],
            [
              'As t → 2⁺',
              item.limit === null
                ? 'A(t) \\to \\infty \\text{ (divergent)}'
                : `A(t) \\to 2\\sqrt{3} \\approx ${show(item.limit)} \\text{ (convergent)}`,
            ],
          ]}
        />
        <AppText variant="small" color="textSecondary">
          {item.source}
        </AppText>
      </LabCard>
      <Insight
        title="What to notice"
        text="Both regions are unbounded vertically. Next to the asymptote, $1/\sqrt{x-2}$ grows slowly enough for the area to stay finite ($2\sqrt{3}$, Example 2.5.2); $1/(x-2)^{2}$ grows so fast that the area is infinite."
      />
    </ExploreScaffold>
  );
}

export function ComparisonLab({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const changed = useChanges(complete);
  const [caseId, setCaseId] = useState('ex253');
  const [s, setS] = useState(0.3);
  const item = COMPARISON_CASES.find((c) => c.id === caseId) ?? (COMPARISON_CASES[0] as ComparisonCase);
  const t = logScale(s, 1.5, 1e5);
  const shownTo = Math.min(t, 7.8);
  const areaF = areaUpTo(item.f, item.a, t);
  const areaG = areaUpTo(item.g, item.a, t);
  const top = Math.max(item.f(item.a), item.g(item.a)) * 1.25;

  const scene: FigureScene = {
    view: { xMin: -0.4, xMax: 8, yMin: -0.12 * top, yMax: top },
    aspect: 0.6,
    axes: { x: true, y: true, xLabel: 'x', yLabel: 'y', origin: true, xTicks: [{ at: item.a, label: 'a' }] },
    items: [
      { k: 'area', f: item.f, base: item.g, from: item.a, to: shownTo, tone: 'fill2' },
      { k: 'area', f: item.g, from: item.a, to: shownTo, tone: 'fill' },
      { k: 'curve', f: item.f, from: 0.6, to: 8, tone: 'curve2' },
      { k: 'curve', f: item.g, from: 0.6, to: 8 },
      { k: 'segment', x1: item.a, y1: 0, x2: item.a, y2: item.f(item.a) },
      {
        k: 'label',
        x: 7.8,
        y: item.f(7.8) + 0.08 * top,
        text: 'f (larger)',
        anchor: 'end',
        size: 'small',
        tone: 'curve2',
      },
      {
        k: 'label',
        x: 2.2,
        y: item.g(2.2) + 0.05 * top,
        text: 'g (smaller)',
        anchor: 'start',
        size: 'small',
        tone: 'curve',
      },
    ],
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Theorem 2.5.1: if $f(x) \ge g(x) \ge 0$ for $x \ge a$, a finite area under $f$ forces a finite area under $g$, and an infinite area under $g$ forces an infinite area under $f$."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {COMPARISON_CASES.map((c) => (
          <ChipButton
            key={c.id}
            label={c.label}
            selected={c.id === caseId}
            onPress={() => {
              setCaseId(c.id);
              changed(`case-${c.id}`);
            }}
          />
        ))}
      </ChipRow>
      <LabCard>
        <MathExpression
          tex={`f(x) = ${item.fTex} \\;\\ge\\; g(x) = ${item.gTex} \\;\\ge 0 \\quad (x \\ge ${item.a})`}
          display
        />
        <LiveScene
          scene={scene}
          description={`The larger function f and the smaller g from x = ${item.a}. Up to t = ${show(t)} the area under f is ${show(areaF)} and under g is ${show(areaG)}.`}
        />
        <Slider
          label="Upper limit t (logarithmic scale)"
          value={s}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => {
            setS(v);
            changed(`t-${Math.round(v * 5)}`);
          }}
          valueText={`t = ${show(t)}`}
        />
        <Readout
          rows={[
            ['Under f up to t', `\\int_{${item.a}}^{t} f = ${show(areaF)}`],
            ['Under g up to t', `\\int_{${item.a}}^{t} g = ${show(areaG)}`],
          ]}
        />
        <AppText variant="small" color="textSecondary">
          {`${item.conclusion} ${item.source}`}
        </AppText>
      </LabCard>
      <Insight
        title="What to notice"
        text="The area under $g$ is never more than the area under $f$. So if the area under $f$ levels off, so must the area under $g$; if the area under $g$ grows without bound, so must the area under $f$. The converse statements need not hold (Remark 2.5.4)."
      />
    </ExploreScaffold>
  );
}
