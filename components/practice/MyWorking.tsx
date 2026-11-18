import { CircleAlert, CircleCheck, CircleHelp, Info, Lightbulb, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StepLines } from '@/components/learning/ContentCards';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { PracticeItem } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { FormError } from '@/components/forms/FormError';
import { useAuth } from '@/features/auth/AuthProvider';
import { checkerFor } from '@/features/practice/checkProblem';
import { newId } from '@/lib/utils/id';
import { recordStudyDay } from '@/features/learning/useLearningHistory';
import { questionAttemptRepository } from '@/services/repositories/learning';
import type { AnswerStatus, Feedback, FeedbackStatus } from '@/lib/math/check';

import { type InputKey, MathInput, MathPreview } from './MathInput';

/** How much help a practice mode offers. */
export type HelpPolicy = 'full' | 'afterFirstCheck';

interface StepState {
  key: number;
  text: string;
  editing: boolean;
  feedback: Feedback | null;
}

/** Extra keys for definite and improper integrals: Riemann sums, limits and comparisons. */
const DEFINITE_KEYS: InputKey[] = [
  { insert: 'Δx', label: 'Δx', spoken: 'delta x' },
  { insert: 'n', label: 'n', spoken: 'n' },
  { insert: 'i', label: 'i', spoken: 'i' },
  { insert: 'x_i', label: 'xᵢ', spoken: 'x sub i' },
  { insert: 'lim ', label: 'lim', spoken: 'limit' },
  { insert: 't', label: 't', spoken: 't' },
  { insert: '∞', label: '∞', spoken: 'infinity' },
  { insert: ' <= ', label: '≤', spoken: 'less than or equal to' },
];

const HINT_TITLES = ['Hint 1 · Think about it', 'Hint 2 · Method', 'Hint 3 · Next action'];

function FeedbackLine({ status, message }: { status: FeedbackStatus | AnswerStatus; message: string }) {
  const theme = useAppTheme();
  const good = status === 'correct' || status === 'missingConstant';
  const Icon = good ? CircleCheck : status === 'incorrect' ? CircleAlert : status === 'info' ? Info : CircleHelp;
  const background = good
    ? theme.colors.successSoft
    : status === 'incorrect'
      ? theme.colors.achievementSoft
      : theme.colors.surfaceMuted;
  const color = good
    ? theme.colors.success
    : status === 'incorrect'
      ? theme.colors.achievementStrong
      : theme.colors.textSecondary;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.feedback, { backgroundColor: background, borderRadius: theme.radius.sm, gap: theme.spacing.sm }]}
    >
      <Icon size={16} color={color} strokeWidth={2.4} />
      <AppText variant="small" color="textPrimary" style={styles.flex}>
        {message}
      </AppText>
    </View>
  );
}

function SmallAction({
  label,
  icon: Icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: typeof Pencil;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.smallAction,
        { gap: 4, minHeight: theme.touchTarget.min, opacity: disabled ? 0.5 : pressed ? 0.6 : 1 },
      ]}
    >
      <Icon size={15} color={theme.colors.primary} strokeWidth={2.4} />
      <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * "My working": the learner writes steps, checks each one, asks for help in
 * stages and checks a final answer. Help is app guidance, clearly labelled,
 * never an official UNAM or lecturer solution.
 */
export function MyWorking({ item, helpPolicy = 'full' }: { item: PracticeItem; helpPolicy?: HelpPolicy }) {
  const theme = useAppTheme();
  const checker = useMemo(() => checkerFor(item), [item]);
  const extraKeys = item.definite ? DEFINITE_KEYS : [];
  const [steps, setSteps] = useState<StepState[]>([{ key: 1, text: '', editing: true, feedback: null }]);
  const [nextKey, setNextKey] = useState(2);
  const [answer, setAnswer] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState<{ status: AnswerStatus; message: string } | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [walkthroughShown, setWalkthroughShown] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { user } = useAuth();
  const walkthrough = item.solution?.steps ?? [];
  const appGenerated = item.solution?.appGenerated === true;
  const fullWalkthrough = walkthroughShown >= walkthrough.length + 1;

  const helpUnlocked = helpPolicy === 'full' || answerFeedback !== null;

  const update = (index: number, change: Partial<StepState>) =>
    setSteps((current) => current.map((s, i) => (i === index ? { ...s, ...change } : s)));

  const checkStepAt = (index: number) => {
    if (!checker) return;
    // Each step is checked with the substitutions defined in the steps above it.
    const lines = steps.slice(0, index + 1).map((s) => s.text);
    const feedback = checker.checkLines(lines)[index] ?? null;
    update(index, { feedback, editing: false });
  };

  const addStep = () => {
    setSteps((current) => [...current, { key: nextKey, text: '', editing: true, feedback: null }]);
    setNextKey((k) => k + 1);
  };

  const deleteStep = (index: number) =>
    setSteps((current) =>
      current.length === 1
        ? [{ ...current[0]!, text: '', editing: true, feedback: null }]
        : current.filter((_, i) => i !== index),
    );

  /** Checks the answer and saves the attempt (retry link, hints, walkthrough use) for Review. */
  const checkAnswer = async () => {
    if (!checker) return;
    const result = checker.checkAnswer(answer);
    setAnswerFeedback(result);
    // Written comments and unreadable answers are not graded, so nothing is saved as an attempt.
    if (result.status === 'cannotCheck' || !checker.gradesAnswer) return;
    if (!user) {
      setSaveError('Sign in to save your practice history.');
      return;
    }
    const history = await questionAttemptRepository.list(user.id, item.topicId);
    const previous = history.ok ? history.data.filter((a) => a.questionId === item.id) : [];
    const correct = result.status === 'correct';
    const saved = await questionAttemptRepository.record(user.id, {
      id: newId(),
      topicId: item.topicId,
      unitId: item.unitId,
      questionId: item.id,
      retryOfId: previous[previous.length - 1]?.id ?? null,
      // `outcome` is the checker's verdict (e.g. missingConstant), so Review can group real mistakes.
      learnerAnswer: {
        answer,
        steps: steps.map((s) => s.text).filter((t) => t.trim().length > 0),
        outcome: result.status,
      },
      isCorrect: correct,
      hintsUsed: hintsShown,
      hintLevelsViewed: Array.from({ length: hintsShown }, (_, i) => i + 1),
      viewedSteps: walkthroughShown > 0,
      viewedAnswer: fullWalkthrough,
    });
    if (!saved.ok) {
      setSaveError(saved.error.message);
      return;
    }
    // Checking an answer is study: it counts towards the streak (no XP).
    void recordStudyDay(user.id, 'practice', item.topicId).catch(() => undefined);
    // A correct answer resolves this question's earlier open mistakes.
    const open = previous.filter((a) => !a.isCorrect && !a.reviewResolvedAt).map((a) => a.id);
    if (correct && open.length > 0) {
      const resolved = await questionAttemptRepository.resolve(user.id, open);
      if (!resolved.ok) {
        setSaveError(resolved.error.message);
        return;
      }
    }
    setSaveError(history.ok ? null : history.error.message);
  };

  const showHint = () => setHintsShown((n) => Math.min(3, n + 1));
  const imStuck = () => {
    if (hintsShown < 3) setHintsShown((n) => n + 1);
    else setWalkthroughShown((n) => Math.min(walkthrough.length + 1, n + 1));
  };

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <AppText variant="eyebrow" color="primary">
        MY WORKING
      </AppText>
      {!checker ? (
        <FeedbackLine status="cannotCheck" message="Automatic checking is not available for this question." />
      ) : null}

      {steps.map((stepState, index) => (
        <View
          key={stepState.key}
          style={[
            styles.step,
            { borderColor: theme.colors.border, borderRadius: theme.radius.md, gap: theme.spacing.sm },
          ]}
        >
          {stepState.editing ? (
            <MathInput
              label={`Step ${index + 1}`}
              value={stepState.text}
              onChangeText={(text) => update(index, { text, feedback: null })}
              placeholder={index === 0 ? (checker?.stepPlaceholder ?? 'Step 1') : 'Next step'}
              extraKeys={extraKeys}
            />
          ) : (
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                {`Step ${index + 1}`}
              </AppText>
              <MathPreview text={stepState.text} />
            </View>
          )}
          {stepState.feedback ? (
            <FeedbackLine status={stepState.feedback.status} message={stepState.feedback.message} />
          ) : null}
          <View style={[styles.actions, { gap: theme.spacing.md }]}>
            <SmallAction
              label={`Check step ${index + 1}`}
              icon={CircleCheck}
              onPress={() => checkStepAt(index)}
              disabled={!checker || stepState.text.trim().length === 0}
            />
            {stepState.editing ? null : (
              <SmallAction
                label={`Edit step ${index + 1}`}
                icon={Pencil}
                onPress={() => update(index, { editing: true })}
              />
            )}
            <SmallAction label={`Delete step ${index + 1}`} icon={Trash2} onPress={() => deleteStep(index)} />
          </View>
        </View>
      ))}

      <View style={[styles.actions, { gap: theme.spacing.md }]}>
        <SmallAction label="Add step" icon={Plus} onPress={addStep} />
        {helpUnlocked ? (
          <>
            <SmallAction label="Hint" icon={Lightbulb} onPress={showHint} disabled={hintsShown >= 3} />
            <SmallAction label="I'm stuck" icon={CircleHelp} onPress={imStuck} disabled={fullWalkthrough} />
          </>
        ) : null}
      </View>
      {helpUnlocked ? null : (
        <AppText variant="small" color="textSecondary">
          Challenge: hints unlock after your first answer check.
        </AppText>
      )}

      {hintsShown > 0 ? (
        <View
          style={[
            styles.guidance,
            { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.md, gap: theme.spacing.md },
          ]}
        >
          <AppText variant="small" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            {appGenerated
              ? 'APP GUIDANCE · written for this app, not an official UNAM or lecturer solution'
              : 'App guidance · written for this app, not an official UNAM or lecturer solution'}
          </AppText>
          {item.hints.slice(0, hintsShown).map((hint, index) => (
            <View key={HINT_TITLES[index]} style={{ gap: 2 }}>
              <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                {HINT_TITLES[index]}
              </AppText>
              <MathText text={hint} />
            </View>
          ))}
          {hintsShown >= 3 && !item.solution && item.needsManualReview ? (
            <AppText variant="small" color="textSecondary">
              No app walkthrough is shown for this question: it is awaiting lecturer guidance.
            </AppText>
          ) : null}
          {hintsShown >= 3 && item.solution ? (
            <View style={{ gap: theme.spacing.sm }}>
              {appGenerated && walkthroughShown > 0 ? (
                <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  APP-GENERATED SOLUTION · pending lecturer review
                </AppText>
              ) : null}
              {walkthroughShown > 0 ? (
                <StepLines steps={walkthrough.slice(0, Math.min(walkthroughShown, walkthrough.length))} />
              ) : null}
              {fullWalkthrough && item.solution ? (
                <View
                  style={[styles.answer, { backgroundColor: theme.colors.successSoft, borderRadius: theme.radius.sm }]}
                >
                  <AppText variant="caption" color="textSecondary">
                    {appGenerated
                      ? 'Answer (APP-GENERATED SOLUTION, pending lecturer review)'
                      : 'Answer (app guidance)'}
                  </AppText>
                  <MathExpression tex={item.solution.answerTex} display />
                </View>
              ) : null}
              {fullWalkthrough ? null : (
                <View style={[styles.actions, { gap: theme.spacing.md }]}>
                  {walkthroughShown < walkthrough.length ? (
                    <SmallAction
                      label={walkthroughShown === 0 ? 'Show Next Step' : 'Show Another Step'}
                      icon={Plus}
                      onPress={() => setWalkthroughShown((n) => n + 1)}
                    />
                  ) : null}
                  <SmallAction
                    label="Show Full Walkthrough"
                    icon={Lightbulb}
                    onPress={() => setWalkthroughShown(walkthrough.length + 1)}
                  />
                </View>
              )}
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.step,
          { borderColor: theme.colors.primary, borderRadius: theme.radius.md, gap: theme.spacing.sm },
        ]}
      >
        <MathInput
          label={checker?.answerLabel ?? 'Final answer'}
          value={answer}
          onChangeText={(text) => {
            setAnswer(text);
            setAnswerFeedback(null);
          }}
          placeholder={checker?.answerPlaceholder ?? ''}
          extraKeys={extraKeys}
        />
        {answerFeedback ? <FeedbackLine status={answerFeedback.status} message={answerFeedback.message} /> : null}
        <FormError message={saveError} />
        <LoadingButton
          label={checker && !checker.gradesAnswer ? 'Compare with guidance' : 'Check answer'}
          disabled={!checker || answer.trim().length === 0}
          onPress={() => void checkAnswer()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  step: { borderWidth: 1, padding: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  smallAction: { flexDirection: 'row', alignItems: 'center' },
  feedback: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  guidance: { padding: 14 },
  answer: { padding: 10, gap: 4 },
});
