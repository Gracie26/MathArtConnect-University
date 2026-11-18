import { CircleCheck, CircleDot, Lightbulb, RotateCcw } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { QuickCheckQuestion } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { speakTex, splitInlineMath } from '@/lib/math/tex';

import { Disclosure } from './Disclosure';

type Outcome = { index: number; correct: boolean } | null;

/** Words and formulas as one spoken phrase (the formulas read aloud). */
const spoken = (text: string) =>
  splitInlineMath(text)
    .map((p) => (p.type === 'math' ? speakTex(p.value) : p.value))
    .join('')
    .replace(/s+/g, ' ')
    .trim();

/**
 * App practice recognition questions, one at a time: choose an option, check
 * it, read feedback written for that choice, then try again or move on. The
 * answer is never revealed before the learner finds it; a hint (app guidance)
 * is there on request. Results stay on screen only (it is not a test).
 */
export function QuickCheck({
  title,
  text,
  questions,
}: {
  title: string;
  text?: string;
  questions: QuickCheckQuestion[];
}) {
  const theme = useAppTheme();
  const { colors } = theme;
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({});
  const finished = position >= questions.length;
  const question = questions[Math.min(position, questions.length - 1)]!;
  const solved = outcome?.correct === true;

  const check = () => {
    if (selected === null) return;
    const correct = selected === question.correctIndex;
    setOutcome({ index: selected, correct });
    setFirstTry((previous) => (question.id in previous ? previous : { ...previous, [question.id]: correct }));
  };
  const retry = () => {
    setSelected(null);
    setOutcome(null);
  };
  const next = () => {
    setPosition((p) => p + 1);
    retry();
  };
  const restart = () => {
    setPosition(0);
    setFirstTry({});
    retry();
  };

  const firstTryCorrect = Object.values(firstTry).filter(Boolean).length;

  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <View style={[styles.header, { gap: theme.spacing.sm }]}>
        <View style={[styles.chip, { backgroundColor: colors.achievementSoft, borderRadius: theme.radius.pill }]}>
          <AppText variant="eyebrow" color="textPrimary">
            APP PRACTICE
          </AppText>
        </View>
        {!finished ? (
          <AppText variant="small" color="textSecondary">{`Question ${position + 1} of ${questions.length}`}</AppText>
        ) : null}
      </View>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h3" accessibilityRole="header">
          {title}
        </AppText>
        {text ? <MathText text={text} variant="small" color="textSecondary" /> : null}
      </View>
      <ProgressBar
        value={finished ? 1 : position / questions.length}
        height={4}
        accessibilityLabel={`${title}: ${Math.min(position, questions.length)} of ${questions.length} questions done`}
      />

      {finished ? (
        <View style={{ gap: theme.spacing.md }} accessibilityLiveRegion="polite">
          <View style={[styles.row, { gap: theme.spacing.sm }]}>
            <CircleCheck size={20} color={colors.success} />
            <AppText variant="title">All questions done</AppText>
          </View>
          <AppText variant="body" color="textSecondary">
            {`${firstTryCorrect} of ${questions.length} right first time. Questions you found harder are worth another look in the lesson.`}
          </AppText>
          <LoadingButton variant="secondary" label="Start again" icon={RotateCcw} onPress={restart} />
        </View>
      ) : (
        <>
          <MathText text={question.prompt} variant="bodyLarge" />
          {question.tex ? <MathExpression tex={question.tex} display /> : null}

          <View accessibilityRole="radiogroup" style={{ gap: theme.spacing.sm }}>
            {question.options.map((option, index) => {
              const chosen = selected === index;
              const locked = solved;
              return (
                <Pressable
                  key={index}
                  disabled={locked}
                  onPress={() => {
                    setSelected(index);
                    setOutcome(null);
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={spoken(option.text)}
                  accessibilityState={{ checked: chosen, disabled: locked }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      minHeight: theme.touchTarget.min,
                      gap: theme.spacing.md,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.radius.md,
                      borderWidth: chosen ? 2 : StyleSheet.hairlineWidth,
                      borderColor: chosen ? colors.primary : colors.borderStrong,
                      backgroundColor: chosen ? colors.primarySoft : pressed ? colors.surfacePressed : colors.surface,
                    },
                  ]}
                >
                  <View style={[styles.radio, { borderColor: chosen ? colors.primary : colors.borderStrong }]}>
                    {chosen ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
                  </View>
                  <View style={styles.grow}>
                    <MathText text={option.text} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {outcome ? (
            <View
              accessibilityLiveRegion="polite"
              style={[
                styles.feedback,
                {
                  gap: theme.spacing.sm,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  backgroundColor: outcome.correct ? colors.successSoft : colors.accentSoft,
                },
              ]}
            >
              {outcome.correct ? (
                <CircleCheck size={18} color={colors.success} />
              ) : (
                <CircleDot size={18} color={colors.accentStrong} />
              )}
              <View style={styles.grow}>
                <AppText variant="title">{outcome.correct ? 'Correct' : 'Not quite'}</AppText>
                <MathText text={question.options[outcome.index]!.feedback} />
              </View>
            </View>
          ) : null}

          {!solved ? (
            <Disclosure showLabel="Show hint" hideLabel="Hide hint">
              <View style={[styles.row, { gap: theme.spacing.sm, alignItems: 'flex-start' }]}>
                <Lightbulb size={16} color={colors.achievementStrong} />
                <View style={styles.grow}>
                  <AppText variant="eyebrow" color="textSecondary">
                    APP GUIDANCE
                  </AppText>
                  <MathText text={question.hint} variant="small" />
                </View>
              </View>
            </Disclosure>
          ) : null}

          <View style={[styles.row, { gap: theme.spacing.md }]}>
            {solved ? (
              <LoadingButton
                label={position === questions.length - 1 ? 'Finish' : 'Next question'}
                onPress={next}
                style={styles.grow}
              />
            ) : outcome ? (
              <>
                <LoadingButton variant="secondary" label="Skip" onPress={next} style={styles.grow} />
                <LoadingButton label="Try again" icon={RotateCcw} onPress={retry} style={styles.grow} />
              </>
            ) : (
              <LoadingButton
                label="Check answer"
                disabled={selected === null}
                accessibilityHint={selected === null ? 'Choose an answer first' : undefined}
                onPress={check}
                style={styles.grow}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: { paddingHorizontal: 10, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  option: { flexDirection: 'row', alignItems: 'center' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start' },
  grow: { flex: 1 },
});
