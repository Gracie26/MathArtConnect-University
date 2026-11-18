import { router } from 'expo-router';
import { BookOpenCheck, ChevronRight, CircleCheck, Layers, ListChecks, RotateCcw } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TopicDefinition } from '@/content/types';
import { MIN_ANSWERS_FOR_ACCURACY, practiceAccuracy } from '@/features/learning/studyDay';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AccentTone } from '@/types/dashboard';

import { Card, percent, Section } from './components';
import { buildProgressOverview, type ProgressOverview as Overview, type TopicOverview } from './overviewModel';
import { buildProgressReport } from './progressReport';
import { useLearnerRecords } from './useLearnerRecord';

const progressDetailHref = (topicId: string) => ({ pathname: '/progress/[topicId]', params: { topicId } }) as const;

/**
 * The Progress tab: a short overview across every topic, up to three
 * rule-based insights, and one compact card per topic. Each card opens the
 * topic's full report. Only the learner's real record is used; there is no
 * mastery score.
 */
export function ProgressOverview({ topics }: { topics: readonly TopicDefinition[] }) {
  const theme = useAppTheme();
  const { state, reload } = useLearnerRecords(topics);
  const overview = useMemo(
    () =>
      state.status === 'ready'
        ? buildProgressOverview(
            state.records.map(({ topic, record }) => ({ topic, report: buildProgressReport(topic, record) })),
          )
        : null,
    [state],
  );

  if (state.status === 'loading') {
    return (
      <View style={{ gap: theme.spacing.md }} accessibilityLabel="Loading your progress">
        <Skeleton height={150} radius={theme.radius.card} />
        <Skeleton height={170} radius={theme.radius.card} />
        <Skeleton height={170} radius={theme.radius.card} />
      </View>
    );
  }
  if (state.status === 'error' || !overview) {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <FormError message={state.status === 'error' ? state.message : 'Your progress could not be loaded.'} />
        <LoadingButton label="Try again" onPress={() => void reload()} />
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.xl }}>
      <OverviewCard overview={overview} />
      {overview.insights.length > 0 ? (
        <Section title="Worth doing next" subtitle="Simple rules based on your record.">
          {overview.insights.map((r) => (
            <Card key={r.id} onPress={() => router.push(r.href)} label={`${r.title}. ${r.reason} ${r.actionLabel}`}>
              <AppText variant="title">{r.title}</AppText>
              <AppText variant="small" color="textSecondary">
                {r.reason}
              </AppText>
              <View style={styles.inlineAction}>
                <AppText variant="caption" color="primary">
                  {r.actionLabel}
                </AppText>
                <ChevronRight size={16} color={theme.colors.primary} strokeWidth={2.4} />
              </View>
            </Card>
          ))}
        </Section>
      ) : null}
      <Section title="Topics">
        {overview.topics.map((t, index) => (
          <TopicProgressCard key={t.topic.id} item={t} number={index + 1} />
        ))}
      </Section>
    </View>
  );
}

function OverviewStat({
  icon,
  tone,
  value,
  label,
  spoken,
}: {
  icon: typeof Layers;
  tone: AccentTone;
  value: string;
  label: string;
  spoken: string;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.stat, { gap: theme.spacing.sm }]} accessible accessibilityLabel={spoken}>
      <IconTile icon={icon} tone={tone} size={32} />
      <View style={styles.grow}>
        <AppText variant="title">{value}</AppText>
        <AppText variant="small" color="textSecondary">
          {label}
        </AppText>
      </View>
    </View>
  );
}

function OverviewCard({ overview }: { overview: Overview }) {
  const theme = useAppTheme();
  const t = overview.totals;
  const completion = t.stepsTotal === 0 ? 0 : t.stepsDone / t.stepsTotal;
  const accuracy = practiceAccuracy(t.practiceChecked, t.practiceCorrect);

  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.lg }]}>
      <View style={[styles.statGrid, { rowGap: theme.spacing.lg, columnGap: theme.spacing.md }]}>
        <OverviewStat
          icon={Layers}
          tone="blue"
          value={`${t.topicsStarted} of ${t.topicsTotal}`}
          label="topics started"
          spoken={`${t.topicsStarted} of ${t.topicsTotal} topics started`}
        />
        <OverviewStat
          icon={BookOpenCheck}
          tone="teal"
          value={percent(completion)}
          label="lesson steps done"
          spoken={`${percent(completion)} of required lesson steps done: ${t.stepsDone} of ${t.stepsTotal}`}
        />
        <OverviewStat
          icon={ListChecks}
          tone="amber"
          value={String(t.practiceChecked)}
          label={accuracy === null ? 'practice answers checked' : `answers checked · ${accuracy}% correct`}
          spoken={
            accuracy === null
              ? `${t.practiceChecked} practice answers checked. Accuracy appears after ${MIN_ANSWERS_FOR_ACCURACY}.`
              : `${t.practiceChecked} practice answers checked, ${accuracy} percent correct`
          }
        />
        <OverviewStat
          icon={t.openMistakes > 0 ? RotateCcw : CircleCheck}
          tone={t.openMistakes > 0 ? 'coral' : 'teal'}
          value={String(t.openMistakes)}
          label={t.openMistakes === 1 ? 'answer to review' : 'answers to review'}
          spoken={t.openMistakes === 0 ? 'Nothing to review' : `${t.openMistakes} answers waiting in Review Mistakes`}
        />
      </View>
      {t.openMistakes > 0 ? (
        <LoadingButton
          variant="secondary"
          icon={RotateCcw}
          label="Review mistakes"
          onPress={() => router.push('/mistakes')}
        />
      ) : null}
    </View>
  );
}

function TopicProgressCard({ item, number }: { item: TopicOverview; number: number }) {
  const theme = useAppTheme();
  const { topic, report } = item;
  const accuracy = practiceAccuracy(item.practice.checked, item.practice.correct);
  const practiceText =
    item.practice.checked === 0
      ? 'No practice checked yet'
      : accuracy === null
        ? `${item.practice.checked} practice ${item.practice.checked === 1 ? 'answer' : 'answers'} checked`
        : `${item.practice.checked} answers checked · ${accuracy}% correct`;
  const reviewText =
    item.openMistakes === 0
      ? 'Nothing to review'
      : `${item.openMistakes} ${item.openMistakes === 1 ? 'answer' : 'answers'} to review`;
  const c = report.completion;

  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <View style={{ gap: 2 }}>
        <AppText variant="eyebrow" color="textSecondary">{`TOPIC ${number}`}</AppText>
        <AppText variant="h3" accessibilityRole="header">
          {topic.title}
        </AppText>
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <View style={styles.row}>
          <AppText variant="small" color="textSecondary" style={styles.grow}>
            {item.started ? `${c.completedSubtopics} of ${c.totalSubtopics} subtopics completed` : 'Not started yet'}
          </AppText>
          <AppText variant="caption">{percent(item.completion)}</AppText>
        </View>
        <ProgressBar
          value={item.completion}
          height={8}
          accessibilityLabel={`${topic.title}: ${percent(item.completion)} of required lesson steps done`}
        />
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <Indicator icon={ListChecks} tone="amber" text={practiceText} />
        <Indicator
          icon={item.openMistakes > 0 ? RotateCcw : CircleCheck}
          tone={item.openMistakes > 0 ? 'coral' : 'teal'}
          text={reviewText}
        />
      </View>

      <View style={[styles.actions, { gap: theme.spacing.sm }]}>
        {/* Compact, and filled only once a topic is under way, so three untouched topics don't shout. */}
        <LoadingButton
          variant={item.started ? 'primary' : 'secondary'}
          style={styles.cardButton}
          label={item.continueLabel}
          accessibilityHint={`${item.continueLabel} ${topic.title}`}
          onPress={() => router.push(item.continueHref)}
        />
        <Pressable
          onPress={() => router.push(progressDetailHref(topic.id))}
          accessibilityRole="button"
          accessibilityLabel={`View progress details for ${topic.title}`}
          style={({ pressed }) => [
            styles.details,
            {
              minHeight: theme.touchTarget.min,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.pill,
              backgroundColor: pressed ? theme.colors.surfacePressed : 'transparent',
            },
          ]}
        >
          <AppText variant="caption" color="primary">
            View details
          </AppText>
          <ChevronRight size={16} color={theme.colors.primary} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

function Indicator({ icon: Icon, tone, text }: { icon: typeof Layers; tone: AccentTone; text: string }) {
  const theme = useAppTheme();
  const color =
    tone === 'coral'
      ? theme.colors.accentStrong
      : tone === 'amber'
        ? theme.colors.achievementStrong
        : theme.colors.primary;
  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      <Icon size={16} color={color} strokeWidth={2.2} />
      <AppText variant="small" color="textPrimary" style={styles.grow}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', flexBasis: '46%', flexGrow: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  cardButton: { minWidth: 132 },
  details: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
