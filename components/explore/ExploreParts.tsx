import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GameCard, GameFeedback, GameHint } from '@/components/games/GameParts';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { FadeIn } from '@/components/ui/FadeIn';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { Option, Stage } from '@/content/topics/integration/explore';
import { useAppTheme } from '@/hooks/useAppTheme';

/** A single decision with immediate, explained feedback. Calls onCorrect the first time the right option is picked. */
export function OptionQuestion({
  question,
  options,
  onCorrect,
}: {
  question: string;
  options: Option[];
  onCorrect?: () => void;
}) {
  const theme = useAppTheme();
  const [picked, setPicked] = useState<number | null>(null);
  const chosen = picked === null ? null : options[picked];
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <MathText text={question} variant="title" />
      {options.map((o, i) => (
        <GameCard
          key={o.tex}
          item={{ tex: o.tex }}
          selected={picked === i}
          onPress={() => {
            setPicked(i);
            if (o.correct) onCorrect?.();
          }}
          label={`Option ${i + 1}`}
          badge={picked === i ? (o.correct ? 'Yes' : 'No') : undefined}
        />
      ))}
      {chosen ? <GameFeedback correct={chosen.correct} text={chosen.feedback} /> : null}
    </View>
  );
}

/**
 * Steps through a worked transformation with Back, Next, Reset and Hint,
 * keeping the earlier stages visible as a history.
 */
export function StageStepper({
  stages,
  onFinished,
  hints,
}: {
  stages: Stage[];
  onFinished?: () => void;
  /** Optional hint per stage, shown before the learner moves on. */
  hints?: string[];
}) {
  const theme = useAppTheme();
  const [at, setAt] = useState(0);
  const [hintAt, setHintAt] = useState<number | null>(null);
  const next = () => {
    const to = Math.min(at + 1, stages.length - 1);
    setAt(to);
    setHintAt(null);
    if (to === stages.length - 1) onFinished?.();
  };
  const nextHint = hints?.[at + 1];
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <AppText variant="small" color="textSecondary" accessibilityLiveRegion="polite">
        {`Stage ${at + 1} of ${stages.length}: ${stages[at]?.label ?? ''}`}
      </AppText>
      {stages.slice(0, at + 1).map((stage, i) => (
        <FadeIn key={`${stage.label}-${i}`}>
          <View
            style={[
              styles.stage,
              {
                gap: 4,
                borderLeftColor: i === at ? theme.colors.primary : theme.colors.border,
                paddingLeft: theme.spacing.md,
                opacity: i === at ? 1 : 0.75,
              },
            ]}
          >
            <AppText
              variant="caption"
              color={i === at ? 'primary' : 'textSecondary'}
              style={{ fontFamily: theme.fontFamilies.semibold }}
            >
              {`${i + 1}. ${stage.label}`}
            </AppText>
            <MathExpression tex={stage.tex} display />
            <MathText text={stage.note} variant="small" color="textSecondary" />
          </View>
        </FadeIn>
      ))}
      {nextHint && at < stages.length - 1 ? (
        <GameHint hint={nextHint} shown={hintAt === at} onShow={() => setHintAt(at)} />
      ) : null}
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        <LoadingButton
          variant="secondary"
          label="Back"
          disabled={at === 0}
          onPress={() => setAt((v) => Math.max(0, v - 1))}
          style={styles.grow}
        />
        <LoadingButton label="Next" disabled={at === stages.length - 1} onPress={next} style={styles.grow} />
        <LoadingButton
          variant="secondary"
          label="Reset"
          onPress={() => {
            setAt(0);
            setHintAt(null);
          }}
          style={styles.grow}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  grow: { flexGrow: 1 },
  stage: { borderLeftWidth: 3 },
});
