import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { CURVE_COLOR_NAMES, curvePalette, plotExpressions, type PlotSpec } from '@/components/graph/plot';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fmt, type GraphView } from '@/lib/graph/sample';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';

/** Families from the notes: each derivative with an anti-derivative F (C added by the slider). */
const FAMILIES = [
  {
    id: '2x',
    label: 'f(x) = 2x',
    f: '2x',
    F: 'x^2',
    fTex: 'f(x) = 2x',
    FTex: 'x^{2}',
    source: 'The notes’ first example',
  },
  {
    id: '2x+5',
    label: 'f(x) = 2x + 5',
    f: '2x + 5',
    F: 'x^2 + 5x',
    fTex: 'f(x) = 2x + 5',
    FTex: 'x^{2} + 5x',
    source: 'Examples (b) in the notes',
  },
  {
    id: 'cos',
    label: 'f(x) = cos x',
    f: 'cos(x)',
    F: 'sin(x)',
    fTex: 'f(x) = \\cos x',
    FTex: '\\sin x',
    source: 'A standard formula',
  },
] as const;

const VIEW: GraphView = { xMin: -5, xMax: 5, yMin: -8, yMax: 12, axes: true, grid: true };
const SLOPE_AT = 1;

/** A short tangent segment of slope m through (x0, y0). */
const tangent = (x0: number, y0: number, m: number) => `${fmt(m)}(x - ${x0}) + ${y0}`;

export function FamilyOfCurves({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const colors = curvePalette(theme);
  const { explored, error, complete } = useExploreCompletion(activity);
  const [familyId, setFamilyId] = useState<(typeof FAMILIES)[number]['id']>('2x');
  const [c, setC] = useState(0);
  const [kept, setKept] = useState<number[]>([]);
  const [showDerivative, setShowDerivative] = useState(false);
  const family = FAMILIES.find((f) => f.id === familyId) ?? FAMILIES[0];

  // Slope of every curve at x = 1 is f(1): the tangents are parallel.
  const slope = familyId === 'cos' ? Math.cos(SLOPE_AT) : familyId === '2x' ? 2 : 7;
  const base = familyId === 'cos' ? Math.sin(SLOPE_AT) : familyId === '2x' ? 1 : 6;

  const curves = useMemo(() => {
    const specs: PlotSpec[] = kept.map((value, i) => ({
      id: `kept-${value}`,
      expression: `${family.F} + ${value}`,
      color: (i + 1) % 6,
      width: 2,
    }));
    specs.push({ id: 'current', expression: `${family.F} + C`, color: 0, width: 3.5 });
    for (const value of [...kept, c]) {
      specs.push({
        id: `tangent-${value}`,
        expression: tangent(SLOPE_AT, base + value, slope),
        color: 2,
        width: 1.5,
        dashed: true,
        domain: { start: SLOPE_AT - 0.8, end: SLOPE_AT + 0.8 },
      });
    }
    if (showDerivative) specs.push({ id: 'derivative', expression: family.f, color: 4, width: 2.5, dashed: true });
    return plotExpressions(specs, { C: c }, VIEW, theme);
  }, [kept, c, family, showDerivative, slope, base, theme]);

  const keep = () => {
    if (kept.includes(c) || kept.length >= 6) return;
    const next = [...kept, c];
    setKept(next);
    if (next.length >= 3) void complete({ family: family.id, curves: next.length });
  };

  const cText = c >= 0 ? `+ ${fmt(c)}` : `- ${fmt(-c)}`;
  const summary = `Graph of F(x) = ${family.F.replace('^2', ' squared')} ${cText}${kept.length ? ` and ${kept.length} kept curves with other values of C` : ''}. Each has slope ${fmt(slope)} at x = 1.${showDerivative ? ` The derivative ${family.label} is also shown.` : ''}`;

  return (
    <ExploreScaffold
      activity={activity}
      intro="Every function in $F(x) + C$ has the same derivative. Move $C$, keep a few curves, and compare their slopes."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {FAMILIES.map((f) => (
          <ChipButton
            key={f.id}
            label={f.label}
            selected={f.id === familyId}
            onPress={() => {
              setFamilyId(f.id);
              setKept([]);
            }}
          />
        ))}
      </ChipRow>

      <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
        <MathExpression tex={`${family.fTex}, \\quad F(x) = ${family.FTex} ${cText.replace('-', '-')}`} display />
        <GraphCanvas view={VIEW} curves={curves} summary={summary} />
        <Slider label="Constant C" value={c} min={-6} max={6} step={0.5} onChange={setC} valueText={`C = ${fmt(c)}`} />
      </View>

      <View
        style={[
          cardStyle(theme),
          { padding: theme.spacing.lg, gap: theme.spacing.sm, backgroundColor: theme.colors.primarySoft },
        ]}
      >
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          What you see
        </AppText>
        <MathText
          text={`Changing $C$ to ${fmt(c)} moves $F(x)$ ${c === 0 ? 'nowhere' : `${c > 0 ? 'up' : 'down'} by ${fmt(Math.abs(c))}`}, but does not change its derivative: $F'(x) = ${family.f.replace('cos(x)', '\\cos x')}$ for every value of $C$.`}
        />
        <MathText
          text={`The dashed tangents at $x = 1$ are parallel: every curve has slope $f(1) = ${fmt(slope)}$ there. That is why the anti-derivatives of a function differ only by a constant.`}
        />
      </View>

      <View style={[styles.actions, { gap: theme.spacing.sm }]}>
        <LoadingButton
          label="Add current curve"
          onPress={keep}
          disabled={kept.includes(c) || kept.length >= 6}
          style={styles.grow}
        />
        <LoadingButton
          variant="secondary"
          label={showDerivative ? 'Hide derivative' : 'Show derivative'}
          onPress={() => setShowDerivative((v) => !v)}
          style={styles.grow}
        />
        <LoadingButton
          variant="secondary"
          label="Reset"
          onPress={() => {
            setKept([]);
            setC(0);
            setShowDerivative(false);
          }}
          style={styles.grow}
        />
      </View>

      {kept.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            Kept curves
          </AppText>
          {kept.map((value, i) => (
            <View key={value} style={[styles.row, { gap: theme.spacing.sm }]}>
              <View style={[styles.swatch, { backgroundColor: colors[(i + 1) % 6] }]} />
              <AppText variant="body" style={styles.grow}>
                {`F(x) = ${family.F.replace('^2', '²')} ${value >= 0 ? '+' : '−'} ${fmt(Math.abs(value))} (${CURVE_COLOR_NAMES[(i + 1) % 6]})`}
              </AppText>
              <Pressable
                onPress={() => setKept(kept.filter((k) => k !== value))}
                accessibilityRole="button"
                accessibilityLabel={`Remove the curve with C = ${fmt(value)}`}
                style={{
                  minWidth: theme.touchTarget.min,
                  minHeight: theme.touchTarget.min,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <AppText variant="small" color="textSecondary">
          Keep at least three curves to compare them. ({family.source})
        </AppText>
      )}
    </ExploreScaffold>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap' },
  grow: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 14, height: 14, borderRadius: 7 },
});
