import { useMemo, useState } from 'react';
import { View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';
import { expReductionChain, sinReductionChain } from '@/lib/explore/patterns';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';
import { StageStepper } from './ExploreParts';

type Family = 'exp' | 'sin';

const FORMULAS: Record<Family, { label: string; tex: string; values: number[] }> = {
  exp: { label: '∫ xⁿ eˣ dx', tex: 'I_{n} = \\int x^{n}e^{x}\\,dx = x^{n}e^{x} - n\\,I_{n-1}', values: [1, 2, 3, 4] },
  sin: {
    label: '∫ sinⁿx dx',
    tex: 'I_{n} = \\int \\sin^{n}x\\,dx = -\\frac{1}{n}\\sin^{n-1}x\\cos x + \\frac{n-1}{n}I_{n-2}',
    values: [2, 3, 4, 5, 6],
  },
};

/** Follow a reduction formula down the chain, one application at a time, to an integral you can do directly. */
export function ReductionFlow({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [family, setFamily] = useState<Family>('exp');
  const [n, setN] = useState(2);
  const [finished, setFinished] = useState<string[]>([]);
  const formula = FORMULAS[family];

  const stages = useMemo(() => {
    const chain = family === 'exp' ? expReductionChain(n) : sinReductionChain(n);
    const step = family === 'exp' ? 1 : 2;
    return [
      ...chain.steps.map((s) => ({
        label: `Reduce I${subscript(s.n)} → I${subscript(s.n - step)}`,
        tex: s.tex,
        note: family === 'exp' ? 'The power of $x$ drops by one.' : 'The power of $\\sin x$ drops by two.',
      })),
      { label: `Stop at I${subscript(chain.end.n)}`, tex: chain.end.tex, note: 'This one is a standard integral.' },
      {
        label: 'Work back up',
        tex: '\\text{Substitute each result into the line above it.}',
        note: `${chain.applications} application${chain.applications === 1 ? '' : 's'} of the formula in total.`,
      },
    ];
  }, [family, n]);

  const select = (f: Family, value: number) => {
    setFamily(f);
    setN(value);
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="A reduction formula writes $I_n$ in terms of a simpler integral of the same kind. Apply it again and again until you reach one you can integrate directly."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {(Object.keys(FORMULAS) as Family[]).map((f) => (
          <ChipButton
            key={f}
            label={FORMULAS[f].label}
            selected={f === family}
            onPress={() => select(f, FORMULAS[f].values[1]!)}
          />
        ))}
      </ChipRow>
      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
        <MathExpression tex={formula.tex} display />
        <AppText variant="small" color="textSecondary">{`Start from n = ${n}`}</AppText>
        <ChipRow>
          {formula.values.map((v) => (
            <ChipButton key={v} label={`n = ${v}`} selected={v === n} onPress={() => setN(v)} />
          ))}
        </ChipRow>
      </View>
      <StageStepper
        key={`${family}-${n}`}
        stages={stages}
        onFinished={() => {
          const key = `${family}-${n}`;
          const next = finished.includes(key) ? finished : [...finished, key];
          setFinished(next);
          if (next.length >= 2) void complete({ chains: next.length });
        }}
      />
    </ExploreScaffold>
  );
}

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
function subscript(k: number): string {
  return k
    .toString()
    .split('')
    .map((d) => SUBSCRIPTS[Number(d)] ?? d)
    .join('');
}
