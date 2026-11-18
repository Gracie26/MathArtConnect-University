import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { GameFeedback } from '@/components/games/GameParts';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { HIGHLIGHT_EXAMPLES, type HighlightPart } from '@/content/topics/integration/explore';
import { useAppTheme } from '@/hooks/useAppTheme';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';
import { OptionQuestion, StageStepper } from './ExploreParts';

const ROLE_WORDS: Record<HighlightPart['role'], string> = {
  u: 'contains the inner function u',
  du: 'is part of du',
  none: 'is the integral sign',
};

/**
 * Tap the parts of an integral to see which part holds the inner function and
 * which part becomes du, then follow the substitution stage by stage.
 */
export function SubstitutionHighlighter({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [exampleId, setExampleId] = useState(HIGHLIGHT_EXAMPLES[0]!.id);
  const [tapped, setTapped] = useState<number[]>([]);
  const [step, setStep] = useState<'tap' | 'inner' | 'du' | 'stages'>('tap');
  const [finished, setFinished] = useState<string[]>([]);
  const example = HIGHLIGHT_EXAMPLES.find((e) => e.id === exampleId) ?? HIGHLIGHT_EXAMPLES[0]!;

  const choose = (id: string) => {
    setExampleId(id);
    setTapped([]);
    setStep('tap');
  };
  const lastTapped = tapped.length > 0 ? example.parts[tapped[tapped.length - 1]!] : null;

  return (
    <ExploreScaffold
      activity={activity}
      intro="Tap each part of the integral to see its role. Then choose $u$ and $du$, and watch the integral transform: original, substitution, transformed, integrated, back in $x$."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {HIGHLIGHT_EXAMPLES.map((e) => (
          <ChipButton key={e.id} label={e.title} selected={e.id === example.id} onPress={() => choose(e.id)} />
        ))}
      </ChipRow>

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          1. Tap the parts of the integral
        </AppText>
        <View style={[styles.row, { gap: theme.spacing.xs }]}>
          {example.parts.map((part, i) => {
            const on = tapped.includes(i);
            const highlight =
              part.role === 'u'
                ? theme.colors.primarySoft
                : part.role === 'du'
                  ? theme.colors.achievementSoft
                  : theme.colors.surfaceMuted;
            const border =
              part.role === 'u'
                ? theme.colors.primary
                : part.role === 'du'
                  ? theme.colors.achievementStrong
                  : theme.colors.border;
            return (
              <Pressable
                key={`${part.tex}-${i}`}
                onPress={() => setTapped((t) => (t.includes(i) ? t : [...t, i]))}
                accessibilityRole="button"
                accessibilityLabel={on ? `Part ${i + 1}: ${ROLE_WORDS[part.role]}` : `Part ${i + 1} of the integral`}
                style={[
                  styles.part,
                  {
                    minHeight: theme.touchTarget.min,
                    borderRadius: theme.radius.sm,
                    borderWidth: on ? 2 : 1,
                    borderStyle: on && part.role === 'du' ? 'dashed' : 'solid',
                    borderColor: on ? border : theme.colors.border,
                    backgroundColor: on ? highlight : theme.colors.surface,
                  },
                ]}
              >
                <MathExpression tex={part.tex} size={18} />
              </Pressable>
            );
          })}
        </View>
        {lastTapped ? (
          <AppText variant="small" color="textSecondary" accessibilityLiveRegion="polite">
            {`This part ${ROLE_WORDS[lastTapped.role]}.`}
          </AppText>
        ) : null}
        <AppText variant="small" color="textSecondary">
          Solid outline: holds the inner function. Dashed outline: becomes du.
        </AppText>
        {step === 'tap' && tapped.length >= example.parts.length - 1 ? (
          <GameFeedback correct text="Now choose the substitution." />
        ) : null}
        {step === 'tap' ? (
          <ChipRow>
            <ChipButton label="Choose u" onPress={() => setStep('inner')} />
          </ChipRow>
        ) : null}
      </View>

      {step !== 'tap' ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            2. Identify u and du
          </AppText>
          <OptionQuestion
            key={`${example.id}-inner`}
            question="Which is the inner function $u$?"
            options={example.inner}
            onCorrect={() => setStep((s) => (s === 'inner' ? 'du' : s))}
          />
          {step === 'du' || step === 'stages' ? (
            <OptionQuestion
              key={`${example.id}-du`}
              question="What is $du$?"
              options={example.du}
              onCorrect={() => setStep('stages')}
            />
          ) : null}
        </View>
      ) : null}

      {step === 'stages' ? (
        <>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            3. Watch the integral transform
          </AppText>
          <StageStepper
            key={example.id}
            stages={example.stages}
            onFinished={() => {
              const next = finished.includes(example.id) ? finished : [...finished, example.id];
              setFinished(next);
              if (next.length >= 2) void complete({ examples: next.length });
            }}
          />
        </>
      ) : null}
    </ExploreScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  part: { paddingHorizontal: 10, justifyContent: 'center' },
});
