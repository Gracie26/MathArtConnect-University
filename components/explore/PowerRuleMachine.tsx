import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { plotExpressions } from '@/components/graph/plot';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { FadeIn } from '@/components/ui/FadeIn';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { GraphView } from '@/lib/graph/sample';
import { add, isZero, labelOf, plainOf, type Rational, rational, reciprocal, texOf } from '@/lib/math/rational';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';

/** Exponents from the notes' examples (x⁶, 1/x⁵, √x, x^(−1/2), x^(−1/3), ∛x² …) and the special case −1. */
const EXPONENTS: Rational[] = [
  rational(6),
  rational(4),
  rational(1),
  rational(0),
  rational(1, 2),
  rational(2, 3),
  rational(-1, 2),
  rational(-1, 3),
  rational(-2),
  rational(-5),
  rational(-1),
];

const VIEW: GraphView = { xMin: -0.5, xMax: 3, yMin: -2, yMax: 4, axes: true, grid: true };

/** How the integrand is written in the notes before the power rule applies. */
function rewriteFor(n: Rational): string | null {
  if (n.num === 1 && n.den === 2) return '\\sqrt{x} = x^{\\frac{1}{2}}';
  if (n.num === 2 && n.den === 3) return '\\sqrt[3]{x^{2}} = x^{\\frac{2}{3}}';
  if (n.den === 1 && n.num < 0) return `\\frac{1}{x^{${-n.num}}} = x^{${n.num}}`;
  if (n.den !== 1 && n.num < 0) return `\\frac{1}{x^{${texOf(rational(-n.num, n.den))}}} = x^{${texOf(n)}}`;
  return null;
}

export function PowerRuleMachine({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [n, setN] = useState<Rational>(rational(6));
  const [shown, setShown] = useState(1);
  const [tried, setTried] = useState<string[]>(['6']);
  const special = n.num === -1 && n.den === 1;
  const m = add(n, rational(1));

  const steps = useMemo(() => {
    if (special) return [];
    const rewrite = rewriteFor(n);
    const coefficient = reciprocal(m);
    return [
      {
        title: 'Start with the power',
        text: rewrite ? 'Write the integrand as a power of $x$ first.' : 'The integrand is already a power of $x$.',
        tex: rewrite
          ? `\\int ${rewrite.split(' = ')[0]}\\,dx = \\int x^{${texOf(n)}}\\,dx`
          : `\\int x^{${texOf(n)}}\\,dx`,
      },
      {
        title: 'Increase the exponent by 1',
        text: `$${texOf(n)} + 1 = ${texOf(m)}$`,
        tex: `x^{${texOf(n)}} \\;\\to\\; x^{${texOf(m)}}`,
      },
      {
        title: 'Divide by the new exponent',
        text: `Divide by $${texOf(m)}$, which is the same as multiplying by $${texOf(coefficient)}$.`,
        tex: `\\frac{x^{${texOf(m)}}}{${texOf(m)}} = ${coefficient.num === 1 && coefficient.den === 1 ? '' : texOf(coefficient)}x^{${texOf(m)}}`,
      },
      {
        title: 'Add the constant of integration',
        text: 'Every anti-derivative differs by a constant, so add $C$.',
        tex: `\\int x^{${texOf(n)}}\\,dx = ${coefficient.num === 1 && coefficient.den === 1 ? '' : texOf(coefficient)}x^{${texOf(m)}} + C`,
      },
    ];
  }, [n, m, special]);

  const curves = useMemo(() => {
    const domain = n.den !== 1 || n.num < 0 ? { start: 0.02, end: null } : undefined;
    const specs = special
      ? [
          { id: 'f', expression: '1/x', color: 0, domain: { start: 0.05, end: null } },
          { id: 'F', expression: 'ln(x)', color: 1, domain: { start: 0.05, end: null } },
        ]
      : [
          { id: 'f', expression: `x^${plainOf(n)}`, color: 0, ...(domain ? { domain } : {}) },
          { id: 'F', expression: `x^${plainOf(m)} / ${plainOf(m)}`, color: 1, ...(domain ? { domain } : {}) },
        ];
    return plotExpressions(specs, {}, VIEW, theme);
  }, [n, m, special, theme]);

  const choose = (r: Rational) => {
    setN(r);
    setShown(1);
    const label = labelOf(r);
    const next = tried.includes(label) ? tried : [...tried, label];
    setTried(next);
    if (next.length >= 4 && next.includes('−1')) void complete({ exponents: next.length });
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Choose an exponent $n$ and run the machine: increase the exponent by 1, divide by the new exponent, add $C$. Try positive, negative and fractional powers, and $n = -1$."
      explored={explored}
      error={error}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Exponent n
        </AppText>
        <ChipRow>
          {EXPONENTS.map((r) => (
            <ChipButton
              key={labelOf(r)}
              label={`n = ${labelOf(r)}`}
              selected={r.num === n.num && r.den === n.den}
              onPress={() => choose(r)}
            />
          ))}
        </ChipRow>
      </View>

      {special ? (
        <View
          style={[
            cardStyle(theme),
            { padding: theme.spacing.lg, gap: theme.spacing.md, backgroundColor: theme.colors.achievementSoft },
          ]}
        >
          <AppText variant="caption" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            Special case: n = −1
          </AppText>
          <MathText text="The new exponent would be $-1 + 1 = 0$, and the power rule would divide by $0$. So the power rule does not apply here." />
          <MathText text="This case has its own standard formula:" />
          <MathExpression tex="\int \frac{1}{x}\,dx = \ln|x| + C" display />
        </View>
      ) : (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
          {steps.slice(0, shown).map((s, i) => (
            <FadeIn key={`${labelOf(n)}-${s.title}`}>
              <View style={{ gap: 4 }}>
                <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  {`${i + 1}. ${s.title}`}
                </AppText>
                <MathText text={s.text} />
                <MathExpression tex={s.tex} display />
              </View>
            </FadeIn>
          ))}
          {shown < steps.length ? (
            <View style={[styles.row, { gap: theme.spacing.sm }]}>
              <LoadingButton label="Next step" onPress={() => setShown((v) => v + 1)} style={styles.grow} />
              <LoadingButton
                variant="secondary"
                label="Show all"
                onPress={() => setShown(steps.length)}
                style={styles.grow}
              />
            </View>
          ) : null}
        </View>
      )}

      <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
        <AppText variant="small" color="textSecondary">
          {special
            ? 'Blue: 1/x. Teal: ln x, an anti-derivative of 1/x for x > 0.'
            : `Blue: x^${labelOf(n)}. Teal: its anti-derivative x^${labelOf(m)}/${labelOf(m)} (with C = 0).`}
        </AppText>
        <GraphCanvas
          view={VIEW}
          curves={curves}
          summary={
            special
              ? 'Graph of 1 over x and ln x for x greater than 0.'
              : `Graph of x to the power ${labelOf(n)} and its anti-derivative.`
          }
        />
        {isZero(n) ? (
          <AppText variant="small" color="textSecondary">
            With n = 0 the integrand is x⁰ = 1, and the anti-derivative is x + C.
          </AppText>
        ) : null}
      </View>
    </ExploreScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  grow: { flexGrow: 1 },
});
