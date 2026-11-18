import { router } from 'expo-router';
import { ArrowRight, Check, ChevronRight, Sigma } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Skeleton } from '@/components/ui/Skeleton';
import { estimateTopicMinutes, formatStudyTime, spokenStudyTime } from '@/content/estimate';
import type { TopicDefinition } from '@/content/types';
import { topicHref } from '@/features/learning/navigation';
import type { TopicProgress } from '@/features/learning/progress';
import { useAppTheme } from '@/hooks/useAppTheme';
import { toPercent } from '@/lib/utils/format';

interface TopicCardProps {
  topic: TopicDefinition;
  number: number;
  /** Saved progress; null while loading. */
  progress: TopicProgress | null;
  /** The topic to work on now: a full card with the one primary action. Others are compact rows. */
  featured?: boolean;
}

/** Learn tab entry for one topic (numbered in course order), with real saved progress and calculated study time. */
export function TopicCard({ topic, number, progress, featured = false }: TopicCardProps) {
  const theme = useAppTheme();
  const percent = toPercent(progress?.fraction ?? 0);
  const action = progress?.started ? 'Continue' : 'Start';
  const total = estimateTopicMinutes(topic);
  const left = progress?.started ? progress.minutesRemaining : total;
  const done = (progress?.fraction ?? 0) >= 1;
  const timeText = done
    ? 'Completed'
    : progress?.started
      ? `About ${formatStudyTime(left)} left`
      : `About ${formatStudyTime(total)}`;
  const facts = `${topic.units.length} subtopics · ${timeText}`;
  const label = `${topic.title}. Topic ${number}. ${topic.units.length} subtopics, ${
    done ? 'completed' : progress?.started ? `${spokenStudyTime(left)} left` : spokenStudyTime(total)
  }. ${percent} percent complete.`;

  if (!featured) {
    return (
      <PressableScale
        onPress={() => router.push(topicHref(topic.id))}
        accessibilityRole="button"
        accessibilityLabel={`${label} Open.`}
        style={[cardStyle(theme), styles.row, { padding: theme.spacing.md, gap: theme.spacing.md }]}
      >
        {done ? (
          <View style={[styles.done, { backgroundColor: theme.colors.successSoft }]}>
            <Check size={18} color={theme.colors.success} strokeWidth={3} />
          </View>
        ) : (
          <ProgressRing percent={percent} size={40} strokeWidth={4} />
        )}
        <View style={styles.text}>
          <AppText variant="eyebrow" color="textSecondary">{`TOPIC ${number}`}</AppText>
          <AppText variant="title" numberOfLines={2}>
            {topic.title}
          </AppText>
          <AppText variant="small" color="textSecondary">
            {progress ? `${facts} · ${percent}%` : facts}
          </AppText>
        </View>
        <ChevronRight size={20} color={theme.colors.textSecondary} />
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={() => router.push(topicHref(topic.id))}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${topic.description} ${action}.`}
      style={[
        cardStyle(theme),
        {
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <IconTile icon={Sigma} tone="teal" size={48} />
        <View style={styles.text}>
          {topic.course ? (
            <AppText variant="eyebrow" color="primary">
              {`${topic.course.title.toUpperCase()} · TOPIC ${number}`}
            </AppText>
          ) : null}
          <AppText variant="h2">{topic.title}</AppText>
        </View>
      </View>
      <AppText variant="body" color="textSecondary">
        {topic.description}
      </AppText>
      <AppText variant="small" color="textSecondary">
        {facts}
      </AppText>
      {progress ? (
        <View style={{ gap: theme.spacing.xs }}>
          <ProgressBar value={progress.fraction} />
          <AppText variant="small" color="textSecondary">{`${percent}% complete`}</AppText>
        </View>
      ) : (
        <Skeleton height={22} />
      )}
      <View
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            minHeight: theme.touchTarget.comfortable,
          },
        ]}
      >
        <AppText variant="button" color="onPrimary">
          {action}
        </AppText>
        <ArrowRight size={18} color={theme.colors.onPrimary} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, gap: 2 },
  done: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
