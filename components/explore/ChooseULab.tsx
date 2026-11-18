import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { GameFeedback } from '@/components/games/GameParts';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { FadeIn } from '@/components/ui/FadeIn';
import { PARTS_EXAMPLES, type PartsChoice } from '@/content/topics/integration/explore';
import { useAppTheme } from '@/hooks/useAppTheme';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';

const VERDICT_WORDS: Record<PartsChoice['verdict'], string> = {
  useful: 'Useful choice',
  harder: 'Valid, but harder',
  stuck: 'Goes in a circle',
};

/**
 * Try different choices of u and dv for the same integral and compare what is
 * left to integrate. Every valid choice is allowed; the feedback says which
 * one makes the remaining integral easier.
 */
export function ChooseULab({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [exampleId, setExampleId] = useState(PARTS_EXAMPLES[0]!.id);
  const [pick, setPick] = useState<number | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const example = PARTS_EXAMPLES.find((e) => e.id === exampleId) ?? PARTS_EXAMPLES[0]!;
  const choice = pick === null ? null : example.choices[pick];

  const choose = (i: number) => {
    setPick(i);
    const key = `${example.id}:${i}`;
    const next = seen.includes(key) ? seen : [...seen, key];
    setSeen(next);
    const examples = new Set(next.map((k) => k.split(':')[0]));
    if (next.length >= 4 && examples.size >= 2) void complete({ choices: next.length });
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Integration by parts: $\int u\,dv = uv - \int v\,du$. Choose $u$ and $dv$, and compare the integral that is left. Try both choices for each integral."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {PARTS_EXAMPLES.map((e) => (
          <ChipButton
            key={e.id}
            label={e.title}
            selected={e.id === example.id}
            onPress={() => {
              setExampleId(e.id);
              setPick(null);
            }}
          />
        ))}
      </ChipRow>

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <MathExpression tex={example.integralTex} display />
        <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Choose u
        </AppText>
        <ChipRow>
          {example.choices.map((c, i) => (
            <ChipButton
              key={c.label}
              label={c.label}
              selected={pick === i}
              onPress={() => choose(i)}
              accessibilityLabel={`${c.label}${seen.includes(`${example.id}:${i}`) ? ', tried' : ''}`}
            />
          ))}
        </ChipRow>
      </View>

      {choice ? (
        <FadeIn key={`${example.id}-${pick}`}>
          <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
            <View style={[styles.grid, { gap: theme.spacing.sm }]}>
              {[
                ['u', choice.u],
                ['dv', choice.dv],
                ['du', choice.du],
                ['v', choice.v],
              ].map(([name, tex]) => (
                <View
                  key={name}
                  style={[
                    styles.cell,
                    {
                      gap: 2,
                      padding: theme.spacing.sm,
                      borderRadius: theme.radius.sm,
                      backgroundColor: theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <AppText variant="small" color="textSecondary">
                    {name}
                  </AppText>
                  <MathExpression tex={tex!} size={16} />
                </View>
              ))}
            </View>
            <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              Integral left to do
            </AppText>
            <MathExpression
              tex={choice.remaining === '-' ? '\\text{(cannot start: } v \\text{ is unknown)}' : choice.remaining}
              display
            />
            <AppText variant="caption" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              {VERDICT_WORDS[choice.verdict]}
            </AppText>
            <GameFeedback correct={choice.verdict === 'useful'} text={choice.why} />
          </View>
        </FadeIn>
      ) : null}
    </ExploreScaffold>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { flexGrow: 1, flexBasis: '45%' },
});
