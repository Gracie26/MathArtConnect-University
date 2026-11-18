import { useState } from 'react';
import { View } from 'react-native';

import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { LiveScene, Readout } from '@/components/explore/area/AreaParts';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type FigureItem, type RiemannRule } from '@/lib/figures/scene';
import {
  type ChangePrediction,
  evaluateRiemannBuild,
  evaluateRiemannPrediction,
  evaluateRiemannValue,
  evaluateSampleMatch,
  exactIntegral,
  type RiemannChoice,
  riemannValue,
  type RiemannWidget,
} from '@/lib/games/areaWidgets';

import type { WidgetProps } from './WidgetRound';
import { functionScene, show } from './scenes';

const RULES: { rule: RiemannRule; label: string }[] = [
  { rule: 'left', label: 'Left' },
  { rule: 'right', label: 'Right' },
  { rule: 'midpoint', label: 'Midpoint' },
  { rule: 'sample', label: 'Sample point' },
];

const HEIGHT_WORDS: Record<RiemannRule, string> = {
  left: 'left endpoint',
  right: 'right endpoint',
  midpoint: 'midpoint',
  sample: 'sample point',
};

/** The rectangles of a choice, with the point each height is read at marked on the curve. */
function rectangles(widget: RiemannWidget, choice: RiemannChoice): FigureItem[] {
  const { fn } = widget;
  const dx = (fn.b - fn.a) / choice.n;
  const items: FigureItem[] = [];
  for (let i = 1; i <= choice.n; i++) {
    const offset =
      choice.rule === 'right'
        ? 1
        : choice.rule === 'left'
          ? 0
          : choice.rule === 'midpoint'
            ? 0.5
            : (choice.fractions[i - 1] ?? 0.5);
    const x = fn.a + (i - 1 + offset) * dx;
    const h = fn.f(x);
    items.push({ k: 'rect', x0: fn.a + (i - 1) * dx, x1: fn.a + i * dx, height: h, tone: 'fill' });
    if (choice.n <= 24) {
      items.push({ k: 'segment', x1: x, y1: 0, x2: x, y2: h, tone: 'asymptote', dashed: true, width: 1 });
      items.push({ k: 'point', x, y: h, tone: 'asymptote' });
    }
  }
  return items;
}

/** Riemann Builder: choose where heights are read and how many rectangles, to meet the round's goal. */
export function RiemannRound({ widget, locked, onResult }: WidgetProps<RiemannWidget>) {
  const theme = useAppTheme();
  const goal = widget.goal;
  const fixedN = goal.type === 'sampleMatch' ? goal.n : goal.type === 'predict' ? goal.fromN : null;
  const [rule, setRule] = useState<RiemannRule>(
    goal.type === 'sampleMatch' ? 'sample' : goal.type === 'predict' ? goal.rule : 'right',
  );
  const [n, setN] = useState(fixedN ?? 4);
  const [fractions, setFractions] = useState<number[]>(() => Array.from({ length: 12 }, () => 0.5));
  const [built, setBuilt] = useState(false);
  const [typed, setTyped] = useState('');
  const [prediction, setPrediction] = useState<ChangePrediction | null>(null);

  const choice: RiemannChoice = { rule, n, fractions };
  const exact = exactIntegral(widget.fn);
  const value = riemannValue(widget.fn, choice);
  // In a prediction round, the new rectangles appear only after the prediction.
  const showN = goal.type === 'predict' && prediction ? goal.toN : n;
  const scene = functionScene(widget.fn, rectangles(widget, { ...choice, n: showN }));
  const hideValue = goal.type === 'compute' || (goal.type === 'predict' && !prediction);

  const description = `${showN} rectangles under y = ${widget.fn.tex}, heights read at the ${HEIGHT_WORDS[rule]}${
    hideValue ? '' : `; their total area is ${show(riemannValue(widget.fn, { ...choice, n: showN }))}`
  }.`;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <LiveScene scene={scene} description={description} />

      {goal.type === 'predict' ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="small" color="textSecondary">
            {`Before you change n: when n goes from ${goal.fromN} to ${goal.toN}, will the sum increase or decrease?`}
          </AppText>
          <ChipRow>
            {(['increase', 'decrease'] as const).map((p) => (
              <ChipButton
                key={p}
                label={p === 'increase' ? 'It will increase' : 'It will decrease'}
                selected={prediction === p}
                onPress={() => {
                  if (locked) return;
                  setPrediction(p);
                  onResult(evaluateRiemannPrediction(widget, p));
                }}
              />
            ))}
          </ChipRow>
        </View>
      ) : null}

      {goal.type !== 'predict' && goal.type !== 'sampleMatch' ? (
        <ChipRow>
          {RULES.map(({ rule: r, label }) => (
            <ChipButton
              key={r}
              label={label}
              selected={rule === r}
              accessibilityLabel={`Heights at the ${HEIGHT_WORDS[r]}`}
              onPress={() => {
                if (locked) return;
                setRule(r);
                setBuilt(false);
              }}
            />
          ))}
        </ChipRow>
      ) : null}

      {fixedN === null ? (
        <Slider
          label="Number of rectangles n"
          value={n}
          min={1}
          max={30}
          step={1}
          onChange={(v) => {
            if (locked) return;
            setN(v);
            setBuilt(false);
          }}
          valueText={`n = ${n}`}
        />
      ) : null}

      {rule === 'sample' && goal.type !== 'sampleMatch' ? (
        <Slider
          label="Sample point position in each subinterval"
          value={fractions[0] ?? 0.5}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => !locked && setFractions((f) => f.map(() => v))}
          valueText={`${Math.round((fractions[0] ?? 0.5) * 100)}% across`}
        />
      ) : null}

      {goal.type === 'sampleMatch'
        ? Array.from({ length: goal.n }, (_, i) => (
            <Slider
              key={i}
              label={`Sample point x${i + 1}* in subinterval ${i + 1}`}
              value={fractions[i] ?? 0.5}
              min={0}
              max={1}
              step={0.02}
              onChange={(v) => !locked && setFractions((f) => f.map((old, k) => (k === i ? v : old)))}
              valueText={`${Math.round((fractions[i] ?? 0.5) * 100)}% across`}
            />
          ))
        : null}

      <Readout
        rows={[
          ['Width', `\\Delta x = ${show((widget.fn.b - widget.fn.a) / showN)}`],
          ...(hideValue
            ? []
            : ([['Your sum', show(riemannValue(widget.fn, { ...choice, n: showN }))]] as [string, string][])),
          ...(goal.type === 'tolerance' || goal.type === 'sampleMatch'
            ? ([
                ['Area under the curve', `\\approx ${show(exact)}`],
                ['Error', show(Math.abs(value - exact))],
              ] as [string, string][])
            : []),
          ...(goal.type === 'compute'
            ? ([
                [
                  'Heights',
                  Array.from({ length: n }, (_, k) => {
                    const off = rule === 'right' ? 1 : rule === 'left' ? 0 : 0.5;
                    return show(widget.fn.f(widget.fn.a + (k + off) * ((widget.fn.b - widget.fn.a) / n)));
                  }).join(',\\;'),
                ],
              ] as [string, string][])
            : []),
        ]}
      />

      {goal.type === 'compute' && built ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AuthTextField
            label="Value of the sum"
            value={typed}
            onChangeText={setTyped}
            keyboardType="numbers-and-punctuation"
            placeholder="e.g. 1.75"
          />
          <LoadingButton
            label="Check value"
            disabled={locked || typed.trim().length === 0}
            onPress={() => onResult(evaluateRiemannValue(widget, Number(typed.replace(',', '.'))))}
          />
        </View>
      ) : null}

      {goal.type !== 'predict' && !(goal.type === 'compute' && built) ? (
        <LoadingButton
          label={goal.type === 'compute' ? 'Check my rectangles' : 'Check'}
          disabled={locked}
          onPress={() => {
            if (goal.type === 'sampleMatch') {
              onResult(evaluateSampleMatch(widget, fractions.slice(0, goal.n)));
              return;
            }
            const result = evaluateRiemannBuild(widget, choice);
            if (goal.type === 'compute' && result.correct) {
              setBuilt(true);
              onResult({ ...result, cannotCheck: true });
              return;
            }
            onResult(result);
          }}
        />
      ) : null}
    </View>
  );
}
