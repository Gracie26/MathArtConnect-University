import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { plotExpressions } from '@/components/graph/plot';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { activityHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  fractionTex,
  powerStrategy,
  type ProductKind,
  productToSum,
  sinReductionChain,
  solveStructure,
} from '@/lib/explore/patterns';
import type { GraphView } from '@/lib/graph/sample';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';
import { StageStepper } from './ExploreParts';

type Mode = 'powers' | 'products' | 'reduction' | 'structure';

const MODES: { id: Mode; label: string }[] = [
  { id: 'powers', label: 'sinᵐx cosⁿx' },
  { id: 'products', label: 'Product to sum' },
  { id: 'reduction', label: 'Reduction' },
  { id: 'structure', label: '§1.14 structure' },
];

const VIEW: GraphView = { xMin: -0.2, xMax: 6.5, yMin: -1.3, yMax: 1.3, axes: true, grid: true };

const STRUCTURES = [
  {
    id: 'course',
    label: 'You Try It (§1.14)',
    numerator: { a: 1, b: -3, c: 1 },
    denominator: { A: 2, B: -1, C: 2 },
    tex: '\\int \\frac{1 + \\cos x - 3\\sin x}{2 + 2\\cos x - \\sin x}\\,dx',
    D: '2\\cos x - \\sin x + 2',
    dD: '-2\\sin x - \\cos x',
  },
  {
    id: 'simple',
    label: 'cos x / (cos x + sin x)',
    numerator: { a: 1, b: 0, c: 0 },
    denominator: { A: 1, B: 1, C: 0 },
    tex: '\\int \\frac{\\cos x}{\\cos x + \\sin x}\\,dx',
    D: '\\cos x + \\sin x',
    dD: '\\cos x - \\sin x',
  },
];

/**
 * Advanced patterns side by side: the parity strategy for sinᵐx cosⁿx, the
 * product-to-sum identities, the reduction I_n → I_(n−2), and the §1.14
 * numerator structure p·D + q·D′ + r.
 */
export function PatternExplorer({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [mode, setMode] = useState<Mode>('powers');
  const [visited, setVisited] = useState<Mode[]>(['powers']);
  const [m, setM] = useState(3);
  const [n, setN] = useState(2);
  const [kind, setKind] = useState<ProductKind>('sincos');
  const [p, setP] = useState(8);
  const [q, setQ] = useState(6);
  const [rn, setRn] = useState(4);
  const [structureId, setStructureId] = useState(STRUCTURES[0]!.id);

  const strategy = useMemo(() => powerStrategy(m, n), [m, n]);
  const product = useMemo(() => productToSum(kind, p, q), [kind, p, q]);
  const chain = useMemo(() => sinReductionChain(rn), [rn]);
  const structure = STRUCTURES.find((s) => s.id === structureId) ?? STRUCTURES[0]!;
  const solved = solveStructure(structure.numerator, structure.denominator);

  const curves = useMemo(() => {
    if (mode === 'powers') {
      return plotExpressions([{ id: 'f', expression: `sin(x)^${m} * cos(x)^${n}`, color: 0 }], {}, VIEW, theme);
    }
    if (mode === 'products') {
      return plotExpressions(
        [
          { id: 'product', expression: product.productPlain, color: 0 },
          { id: 'sum', expression: product.sumPlain, color: 1, dashed: true },
        ],
        {},
        VIEW,
        theme,
      );
    }
    return [];
  }, [mode, m, n, product, theme]);

  const go = (next: Mode) => {
    setMode(next);
    const v = visited.includes(next) ? visited : [...visited, next];
    setVisited(v);
    if (v.length >= 3) void complete({ modes: v.length });
  };

  const numberChips = (values: number[], value: number, set: (v: number) => void, name: string) => (
    <ChipRow>
      {values.map((v) => (
        <ChipButton
          key={v}
          label={v.toString()}
          selected={v === value}
          onPress={() => set(v)}
          accessibilityLabel={`${name} = ${v}`}
        />
      ))}
    </ChipRow>
  );

  return (
    <ExploreScaffold
      activity={activity}
      intro="Change the powers and frequencies and watch which strategy the integral needs. Explore at least three of the four patterns."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {MODES.map((md) => (
          <ChipButton key={md.id} label={md.label} selected={md.id === mode} onPress={() => go(md.id)} />
        ))}
      </ChipRow>

      {mode === 'powers' ? (
        <>
          <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
            <AppText variant="small" color="textSecondary">{`Power of sine, m = ${m}`}</AppText>
            {numberChips([0, 1, 2, 3, 4, 5], m, setM, 'm')}
            <AppText variant="small" color="textSecondary">{`Power of cosine, n = ${n}`}</AppText>
            {numberChips([0, 1, 2, 3, 4, 5], n, setN, 'n')}
            <MathExpression tex={strategy.integralTex} display />
            <AppText
              variant="caption"
              color="primary"
              style={{ fontFamily: theme.fontFamilies.semibold }}
              accessibilityLiveRegion="polite"
            >
              {strategy.title}
            </AppText>
            {m % 2 === 1 && n % 2 === 1 ? (
              <AppText variant="small" color="textSecondary">
                Both powers are odd, so either saving works. This shows saving a sine.
              </AppText>
            ) : null}
          </View>
          <StageStepper key={`${m}-${n}`} stages={strategy.steps} />
        </>
      ) : null}

      {mode === 'products' ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
          <ChipRow>
            <ChipButton label="sin px cos qx" selected={kind === 'sincos'} onPress={() => setKind('sincos')} />
            <ChipButton label="sin px sin qx" selected={kind === 'sinsin'} onPress={() => setKind('sinsin')} />
            <ChipButton label="cos px cos qx" selected={kind === 'coscos'} onPress={() => setKind('coscos')} />
          </ChipRow>
          <AppText variant="small" color="textSecondary">{`p = ${p}`}</AppText>
          {numberChips([1, 2, 3, 4, 6, 8], p, setP, 'p')}
          <AppText variant="small" color="textSecondary">{`q = ${q}`}</AppText>
          {numberChips([1, 2, 3, 4, 6, 8], q, setQ, 'q')}
          <MathExpression tex={product.identity} display />
          <MathExpression tex={product.result} display />
          <MathText
            text="A product of two waves is a sum of two simpler waves, and each one integrates directly. Over a full period $0$ to $2\pi$, each $\sin kx$ and $\cos kx$ with $k \neq 0$ integrates to $0$."
            variant="small"
            color="textSecondary"
          />
        </View>
      ) : null}

      {mode === 'reduction' ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
          <MathExpression
            tex="I_{n} = \int \sin^{n}x\,dx = -\frac{1}{n}\sin^{n-1}x\cos x + \frac{n-1}{n}I_{n-2}"
            display
          />
          <AppText variant="small" color="textSecondary">{`n = ${rn}`}</AppText>
          {numberChips([2, 3, 4, 5, 6], rn, setRn, 'n')}
          {chain.steps.map((st) => (
            <MathExpression key={st.n} tex={st.tex} display />
          ))}
          <MathExpression tex={chain.end.tex} display />
          <AppText variant="small" color="textSecondary">
            {`${chain.applications} application${chain.applications === 1 ? '' : 's'} of the formula reach I${chain.end.n === 0 ? '₀' : '₁'}, which is integrated directly.`}
          </AppText>
          <LoadingButton
            variant="secondary"
            label="Open Reduction Flow"
            onPress={() => router.push(activityHref(activity.topicId, 'reduction-flow'))}
          />
        </View>
      ) : null}

      {mode === 'structure' ? (
        <>
          <ChipRow>
            {STRUCTURES.map((st) => (
              <ChipButton
                key={st.id}
                label={st.label}
                selected={st.id === structure.id}
                onPress={() => setStructureId(st.id)}
              />
            ))}
          </ChipRow>
          {solved ? (
            <StageStepper
              key={structure.id}
              stages={[
                {
                  label: 'Integral',
                  tex: structure.tex,
                  note: 'Numerator and denominator are both of the form $a\\cos x + b\\sin x + c$.',
                },
                {
                  label: 'Name D and D′',
                  tex: `D = ${structure.D}, \\quad D' = ${structure.dD}`,
                  note: 'The denominator and its derivative.',
                },
                {
                  label: 'Structure',
                  tex: "\\text{numerator} = p\\,D + q\\,D' + r",
                  note: 'Equate coefficients of $\\cos x$, $\\sin x$ and the constants.',
                },
                {
                  label: 'Solve',
                  tex: `p = ${fractionTex(solved.p)}, \\quad q = ${fractionTex(solved.q)}, \\quad r = ${fractionTex(solved.r)}`,
                  note: 'Three equations, three unknowns.',
                },
                {
                  label: 'Integrate',
                  tex: `${fractionTex(solved.p)}\\,x + ${fractionTex(solved.q)}\\ln|D|${solved.r === 0 ? '' : ` + (${fractionTex(solved.r)})\\int \\frac{dx}{D}`} + C`,
                  note:
                    solved.r === 0 ? 'No remainder: done.' : 'The last integral uses $t = \\tan\\frac{x}{2}$ (§1.9).',
                },
              ]}
            />
          ) : null}
        </>
      ) : null}

      {curves.length > 0 ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
          <AppText variant="small" color="textSecondary">
            {mode === 'powers'
              ? `The integrand sin^${m}x cos^${n}x from 0 to about 2π.`
              : 'Solid: the product. Dashed: the sum of two waves. They lie exactly on top of each other.'}
          </AppText>
          <GraphCanvas
            view={VIEW}
            curves={curves}
            summary={
              mode === 'powers'
                ? `Graph of sine to the ${m} times cosine to the ${n}.`
                : 'Graph of the product and the equal sum of two waves.'
            }
          />
        </View>
      ) : null}
    </ExploreScaffold>
  );
}
