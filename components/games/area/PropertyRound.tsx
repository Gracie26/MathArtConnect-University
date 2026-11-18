import { Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { LiveScene } from '@/components/explore/area/AreaParts';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureItem } from '@/lib/figures/scene';
import {
  combinationValue,
  evaluateCombination,
  evaluateIntervalPath,
  type PathStep,
  type PropertyWidget,
} from '@/lib/games/areaWidgets';

import type { WidgetProps } from './WidgetRound';
import { functionScene, show } from './scenes';

function Stepper({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const theme = useAppTheme();
  const button = (delta: number, Icon: typeof Plus, name: string) => (
    <Pressable
      onPress={() => onChange(value + delta)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${name} the multiple of ${label}`}
      style={[
        styles.step,
        {
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          minHeight: theme.touchTarget.min,
          minWidth: theme.touchTarget.min,
        },
      ]}
    >
      <Icon size={16} color={theme.colors.primary} />
    </Pressable>
  );
  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      {button(-1, Minus, 'Decrease')}
      <AppText variant="title" style={styles.value} accessibilityLabel={`${value} times ${label}`}>
        {String(value)}
      </AppText>
      {button(1, Plus, 'Increase')}
    </View>
  );
}

/** Coefficient tiles: combine the given integrals with constant multiples, sums and a reversal. */
function CombinationRound({ widget, locked, onResult }: WidgetProps<Extract<PropertyWidget, { mode: 'combination' }>>) {
  const theme = useAppTheme();
  const [reversed, setReversed] = useState(false);
  const [coefficients, setCoefficients] = useState<Record<string, number>>(() =>
    Object.fromEntries(widget.known.map((k) => [k.id, 0])),
  );
  const terms = widget.known
    .filter((k) => (coefficients[k.id] ?? 0) !== 0)
    .map((k, i) => {
      const c = coefficients[k.id] ?? 0;
      const sign = c < 0 ? '-' : i === 0 ? '' : '+';
      const size = Math.abs(c) === 1 ? '' : String(Math.abs(c));
      return `${sign} ${size}${k.short}`;
    })
    .join(' ');
  const built = terms.length === 0 ? '0' : reversed ? `-\\left[${terms}\\right]` : terms;
  const value = combinationValue(widget, { reversed, coefficients });

  return (
    <View style={{ gap: theme.spacing.md }}>
      <MathExpression tex={widget.targetTex} display />
      <AppText variant="small" color="textSecondary">
        Known integrals (tiles). Set how many of each you need, and reverse the limits if the target runs backwards.
      </AppText>
      {widget.known.map((k) => (
        <View
          key={k.id}
          style={[
            styles.tile,
            { borderColor: theme.colors.border, borderRadius: theme.radius.md, gap: theme.spacing.sm },
          ]}
        >
          <View style={styles.flex}>
            <MathExpression tex={k.tex} size={15} />
          </View>
          <Stepper
            label={k.short}
            value={coefficients[k.id] ?? 0}
            disabled={locked}
            onChange={(v) => setCoefficients((c) => ({ ...c, [k.id]: Math.max(-20, Math.min(20, v)) }))}
          />
        </View>
      ))}
      <ChipRow>
        <ChipButton
          label={reversed ? 'Limits reversed (× −1)' : 'Reverse the limits (× −1)'}
          selected={reversed}
          onPress={() => !locked && setReversed((r) => !r)}
        />
      </ChipRow>
      <View style={[styles.result, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
        <AppText variant="caption" color="textSecondary">
          Your combination
        </AppText>
        <MathExpression tex={`${built} = ${show(value)}`} display size={17} />
      </View>
      <LoadingButton
        label="Check"
        disabled={locked}
        onPress={() => onResult(evaluateCombination(widget, { reversed, coefficients }))}
      />
    </View>
  );
}

/** Interval pieces: join known integrals end to end, reversing where needed, to reach the target interval. */
function IntervalsRound({ widget, locked, onResult }: WidgetProps<Extract<PropertyWidget, { mode: 'intervals' }>>) {
  const theme = useAppTheme();
  const [path, setPath] = useState<PathStep[]>([]);
  const { fn } = widget;
  const shading: FigureItem[] = path.flatMap((step, i) => {
    const piece = widget.pieces.find((p) => p.id === step.pieceId);
    if (!piece) return [];
    const lo = Math.min(piece.from, piece.to);
    const hi = Math.max(piece.from, piece.to);
    const [from, to] = step.reversed ? [piece.to, piece.from] : [piece.from, piece.to];
    const y = -0.12 * (i + 1);
    return [
      { k: 'area', f: fn.f, from: lo, to: hi, tone: step.reversed ? 'fill3' : 'fill' } as FigureItem,
      { k: 'segment', x1: from, y1: y, x2: to, y2: y, tone: 'asymptote', arrow: 'end', width: 2 } as FigureItem,
    ];
  });
  const scene = functionScene(fn, shading, {
    yPad: 0.35,
    ticks: [...new Set(widget.pieces.flatMap((p) => [p.from, p.to]))].map((at) => ({ at, label: String(at) })),
  });
  const pathTex =
    path.length === 0
      ? '0'
      : path
          .map((step, i) => {
            const piece = widget.pieces.find((p) => p.id === step.pieceId);
            if (!piece) return '';
            const [from, to] = step.reversed ? [piece.to, piece.from] : [piece.from, piece.to];
            return `${i === 0 ? '' : '+ '}\\int_{${from}}^{${to}} f`;
          })
          .join(' ');
  const running = evaluateIntervalPath(widget, path).value;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <MathExpression tex={widget.targetTex} display />
      <LiveScene
        scene={scene}
        description={`The area under f with ${path.length} piece${path.length === 1 ? '' : 's'} chosen; arrows below the axis show the direction of each piece.`}
      />
      <AppText variant="small" color="textSecondary">
        Add pieces so that they join end to end from the lower limit to the upper limit of the target. Use a piece
        backwards when you need to run against its direction.
      </AppText>
      {widget.pieces.map((p) => (
        <View
          key={p.id}
          style={[
            styles.tile,
            { borderColor: theme.colors.border, borderRadius: theme.radius.md, gap: theme.spacing.sm },
          ]}
        >
          <View style={styles.flex}>
            <MathExpression tex={`\\int_{${p.from}}^{${p.to}} f(x)\\,dx = ${p.value}`} size={15} />
          </View>
          <ChipButton
            label="Add"
            onPress={() => !locked && setPath((s) => [...s, { pieceId: p.id, reversed: false }])}
            accessibilityLabel={`Add the piece from ${p.from} to ${p.to}`}
          />
          <ChipButton
            label="Add reversed"
            onPress={() => !locked && setPath((s) => [...s, { pieceId: p.id, reversed: true }])}
            accessibilityLabel={`Add the piece from ${p.to} to ${p.from}`}
          />
        </View>
      ))}
      <View style={[styles.result, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
        <AppText variant="caption" color="textSecondary">
          Your path
        </AppText>
        <MathExpression tex={`${pathTex} = ${show(running)}`} display size={17} />
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          <ChipButton
            label="Undo last"
            onPress={() => !locked && setPath((s) => s.slice(0, -1))}
            accessibilityLabel="Remove the last piece"
          />
          <ChipButton label="Clear" onPress={() => !locked && setPath([])} accessibilityLabel="Remove every piece" />
        </View>
      </View>
      <LoadingButton
        label="Check"
        disabled={locked || path.length === 0}
        onPress={() => onResult(evaluateIntervalPath(widget, path))}
      />
    </View>
  );
}

export function PropertyRound(props: WidgetProps<PropertyWidget>) {
  return props.widget.mode === 'combination' ? (
    <CombinationRound {...props} widget={props.widget} />
  ) : (
    <IntervalsRound {...props} widget={props.widget} />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  tile: { borderWidth: 1, padding: 10, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  flex: { flexGrow: 1, flexShrink: 1, minWidth: 140 },
  step: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 28, textAlign: 'center' },
  result: { padding: 10, gap: 4 },
});
