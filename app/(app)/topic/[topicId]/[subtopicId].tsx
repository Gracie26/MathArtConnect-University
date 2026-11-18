import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonSection } from '@/components/learning/LessonSection';
import { LessonStepNav } from '@/components/learning/LessonStepNav';
import { SectionChips } from '@/components/learning/SectionChips';
import { FormError } from '@/components/forms/FormError';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getTopic } from '@/content/registry';
import type { LearningUnitDefinition, TopicDefinition } from '@/content/types';
import { topicHref } from '@/features/learning/navigation';
import { useTopicProgress } from '@/features/learning/useTopicProgress';
import { useAppTheme } from '@/hooks/useAppTheme';

/** Lesson shell for one subtopic: Concept → See it → … → Review. */
export default function SubtopicScreen() {
  const { topicId, subtopicId, step } = useLocalSearchParams<{ topicId: string; subtopicId: string; step?: string }>();
  const topic = topicId ? getTopic(topicId) : undefined;
  const unit = topic?.units.find((u) => u.slug === subtopicId);

  if (!topic || topic.isDemo || !unit) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Lesson' }} />
        <AppText variant="h2">This lesson is not available.</AppText>
      </Screen>
    );
  }
  return <Lesson topic={topic} unit={unit} initialStepKey={step} />;
}

function Lesson({
  topic,
  unit,
  initialStepKey,
}: {
  topic: TopicDefinition;
  unit: LearningUnitDefinition;
  initialStepKey?: string;
}) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { state, completeStep } = useTopicProgress(topic);
  // The step the learner navigated to; null until they move.
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const unitNumber = topic.units.indexOf(unit) + 1;
  const subtopicProgress = state.status === 'loading' ? undefined : state.progress.subtopics[unit.id];
  const completedKeys = subtopicProgress?.completedStepKeys ?? new Set<string>();

  // Until the learner moves, open at the requested step, else where they left off.
  const openingIndex = (() => {
    if (state.status === 'loading') return null;
    const requested = unit.steps.findIndex((s) => s.key === initialStepKey);
    const next = unit.steps.findIndex((s) => s.key === subtopicProgress?.nextStepKey);
    return requested >= 0 ? requested : next >= 0 ? next : 0;
  })();
  const index = chosenIndex ?? openingIndex;

  const current = index === null ? undefined : unit.steps[index];
  const isLast = index !== null && index === unit.steps.length - 1;

  const goTo = (target: number) => {
    setSaveError(null);
    setChosenIndex(Math.max(0, Math.min(unit.steps.length - 1, target)));
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const leave = () => (router.canGoBack() ? router.back() : router.replace(topicHref(topic.id)));

  const onContinue = async () => {
    if (!current || index === null) return;
    // Only steps with real content can be completed; planned steps never count.
    if (current.availability.status === 'available' && !completedKeys.has(current.key)) {
      setSaving(true);
      const result = await completeStep(unit.id, current.key);
      setSaving(false);
      if (!result.ok) {
        setSaveError(result.error.message);
        return;
      }
    }
    if (isLast) leave();
    else goTo(index + 1);
  };

  const continueLabel =
    current?.availability.status === 'available' && !completedKeys.has(current.key)
      ? isLast
        ? 'Complete and finish'
        : 'Continue'
      : isLast
        ? 'Finish'
        : 'Next';

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: unit.title }} />
      <ScrollView
        ref={scrollRef}
        style={styles.fill}
        contentContainerStyle={{ padding: theme.layout.screenGutter, paddingBottom: theme.spacing.huge }}
      >
        <View style={[styles.column, { maxWidth: theme.layout.maxContentWidth, gap: theme.spacing.xl }]}>
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="eyebrow" color="textSecondary">
              {`${topic.title.toUpperCase()} · SUBTOPIC ${unitNumber} OF ${topic.units.length}`}
            </AppText>
            <AppText variant="h1">{unit.title}</AppText>
            <ProgressBar
              value={subtopicProgress?.fraction ?? 0}
              height={5}
              accessibilityLabel={`${unit.title} progress`}
            />
          </View>
          <SectionChips topicId={topic.id} sections={(topic.sections ?? []).filter((s) => s.unitId === unit.id)} />
          {index !== null ? (
            <LessonStepNav steps={unit.steps} currentIndex={index} completedKeys={completedKeys} onSelect={goTo} />
          ) : null}
          {state.status === 'error' ? <FormError message={state.message} /> : null}
          {current ? <LessonSection step={current} /> : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, theme.spacing.md),
            paddingHorizontal: theme.layout.screenGutter,
          },
        ]}
      >
        <View style={[styles.column, { maxWidth: theme.layout.maxContentWidth, gap: theme.spacing.sm }]}>
          <FormError message={saveError} />
          <View style={[styles.buttons, { gap: theme.spacing.md }]}>
            <LoadingButton
              variant="secondary"
              label="Previous"
              disabled={index === null || index === 0}
              onPress={() => index !== null && goTo(index - 1)}
              style={styles.previous}
            />
            <LoadingButton
              label={saveError ? 'Try again' : continueLabel}
              loading={saving}
              loadingLabel="Saving progress"
              disabled={index === null}
              onPress={() => void onContinue()}
              style={styles.next}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { width: '100%', alignSelf: 'center' },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  buttons: { flexDirection: 'row' },
  previous: { flex: 1 },
  next: { flex: 2 },
});
