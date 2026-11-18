import { router } from 'expo-router';
import { ArrowRight, Timer } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { estimateTopicMinutes, formatStudyTime, spokenStudyTime } from '@/content/estimate';
import type { TopicDefinition } from '@/content/types';
import { buildContinueLearning } from '@/features/learning/navigation';
import type { TopicProgress } from '@/features/learning/progress';
import { MIN_ANSWERS_FOR_ACCURACY, practiceAccuracy } from '@/features/learning/studyDay';
import { useAppTheme } from '@/hooks/useAppTheme';
import { toPercent } from '@/lib/utils/format';

interface TopicProgressSummaryProps {
  topic: TopicDefinition;
  progress: TopicProgress;
  /** This topic's checked practice answers (null while loading). */
  practice: { checked: number; correct: number } | null;
}

/**
 * The top of a topic page: progress, realistic time left, practice accuracy
 * (once there are enough checked answers) and the one primary action:
 * start or continue the current subtopic.
 */
export function TopicProgressSummary({ topic, progress, practice }: TopicProgressSummaryProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const percent = toPercent(progress.fraction);
  const total = estimateTopicMinutes(topic);
  const finished = progress.minutesRemaining <= 0 || progress.currentUnitId === null;
  const time = finished
    ? 'All subtopics completed'
    : progress.started
      ? `About ${formatStudyTime(progress.minutesRemaining)} left`
      : `About ${formatStudyTime(total)} in total`;
  const spokenTime = finished
    ? 'All subtopics completed'
    : progress.started
      ? `${spokenStudyTime(progress.minutesRemaining)} left`
      : `${spokenStudyTime(total)} in total`;
  const accuracy = practice ? practiceAccuracy(practice.checked, practice.correct) : null;
  const next = buildContinueLearning(topic, progress);
  const cta = finished ? 'Review the topic' : progress.started ? 'Continue' : 'Start learning';

  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={styles.between}>
          <AppText variant="title">Topic progress</AppText>
          <AppText variant="title" color="primary">{`${percent}%`}</AppText>
        </View>
        <ProgressBar value={progress.fraction} accessibilityLabel={`${topic.title} progress`} />
        <AppText variant="small" color="textSecondary">
          {`${progress.completedSubtopics} of ${topic.units.length} subtopics completed`}
        </AppText>
      </View>

      <View style={[styles.facts, { gap: theme.spacing.lg }]}>
        <View style={[styles.fact, { gap: 6 }]} accessible accessibilityLabel={`Estimated time: ${spokenTime}.`}>
          <Timer size={16} color={colors.accentStrong} />
          <AppText variant="caption">{time}</AppText>
        </View>
        <AppText
          variant="caption"
          color="textSecondary"
          accessibilityLabel={
            accuracy === null
              ? `Practice accuracy appears after ${MIN_ANSWERS_FOR_ACCURACY} checked answers.`
              : `Practice accuracy ${accuracy} percent.`
          }
        >
          {accuracy === null
            ? `Practice accuracy appears after ${MIN_ANSWERS_FOR_ACCURACY} checked answers`
            : `Practice accuracy ${accuracy}%`}
        </AppText>
      </View>

      {next ? (
        <Pressable
          onPress={() => router.push(next.href)}
          accessibilityRole="button"
          accessibilityLabel={`${cta}: ${next.topicTitle}`}
          style={({ pressed }) => [
            styles.cta,
            {
              minHeight: theme.touchTarget.comfortable,
              gap: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.md,
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            },
          ]}
        >
          <View style={styles.ctaText}>
            <AppText variant="eyebrow" color="onPrimary" style={{ opacity: 0.85 }}>
              {finished ? 'REVIEW' : progress.started ? 'CONTINUE LEARNING' : 'START LEARNING'}
            </AppText>
            <AppText variant="button" color="onPrimary" numberOfLines={2}>
              {next.topicTitle}
            </AppText>
          </View>
          <ArrowRight size={20} color={colors.onPrimary} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  fact: { flexDirection: 'row', alignItems: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center' },
  ctaText: { flex: 1, gap: 2 },
});
