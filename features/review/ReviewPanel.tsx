import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { Disclosure } from '@/components/learning/Disclosure';
import { PracticeItemCard } from '@/components/learning/PracticeItems';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { Skeleton } from '@/components/ui/Skeleton';
import { answerableItems, getTopic } from '@/content/registry';
import type { PracticeItem, TopicDefinition } from '@/content/types';
import { activityHref, sectionHref, subtopicHref } from '@/features/learning/navigation';
import { useLearningHistory } from '@/features/learning/useLearningHistory';
import { useAppTheme } from '@/hooks/useAppTheme';

import { buildUnitReview, nextAction, similarQuestion, type UnitReview } from './buildReview';

function LinkAction({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({
        minHeight: theme.touchTarget.min,
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {label}
      </AppText>
    </Pressable>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  const theme = useAppTheme();
  return (
    <View
      style={[cardStyle(theme), styles.stat, { padding: theme.spacing.md }]}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <AppText variant="h3">{String(value)}</AppText>
      <AppText variant="small" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

function MistakeCard({
  topic,
  review,
  item,
  attempts,
  hints,
}: {
  topic: TopicDefinition;
  review: UnitReview;
  item: PracticeItem;
  attempts: number;
  hints: number;
}) {
  const theme = useAppTheme();
  const explore = topic.activities.find((a) => a.unitId === item.unitId && a.kind === 'lab');
  const similar = similarQuestion(item, topic.practiceItems ?? [], review);
  const section = topic.sections?.find((s) => s.id === item.sourceSection);
  const unit = topic.units.find((u) => u.id === item.unitId);
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
      <AppText variant="small" color="textSecondary">
        {`${item.techniqueLabel} · ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} · ${hints} hints`}
      </AppText>
      <MathExpression tex={item.problemTex} display />
      <Disclosure showLabel="Retry" hideLabel="Hide retry">
        <PracticeItemCard item={item} index={0} />
      </Disclosure>
      <View style={[styles.actions, { gap: theme.spacing.md }]}>
        {section ? (
          <LinkAction
            label={`Review concept (${section.label})`}
            onPress={() => router.push(sectionHref(topic.id, section.id))}
          />
        ) : unit ? (
          <LinkAction
            label="Review concept"
            onPress={() => router.push(subtopicHref(topic.id, unit.slug, 'concept'))}
          />
        ) : null}
        {unit ? (
          <LinkAction
            label="Open worked example"
            onPress={() => router.push(subtopicHref(topic.id, unit.slug, 'worked-example'))}
          />
        ) : null}
        {explore ? (
          <LinkAction
            label={`Open Explore tool: ${explore.title}`}
            onPress={() => router.push(activityHref(topic.id, explore.id))}
          />
        ) : null}
      </View>
      {similar ? (
        <Disclosure showLabel="Practice a similar question" hideLabel="Hide the similar question">
          <PracticeItemCard item={similar} index={0} />
        </Disclosure>
      ) : null}
    </View>
  );
}

/**
 * Review: the learner's own history for this subtopic, with actions to
 * retry, revisit the concept, open a tool, practise something similar or
 * reopen saved Create work. Uses real data only.
 */
export function ReviewPanel({ topicId, unitId }: { topicId: string; unitId: string }) {
  const theme = useAppTheme();
  const topic = getTopic(topicId);
  const { state } = useLearningHistory(topicId);
  if (!topic) return null;
  if (state.status === 'loading') return <Skeleton height={160} radius={theme.radius.card} />;
  if (state.status === 'error') return <FormError message={state.message} />;

  const review = buildUnitReview(unitId, state.history, answerableItems(topic), topic.activities);
  const next = nextAction(unitId, review, topic.activities);
  const nextCard = (
    <View
      style={[
        cardStyle(theme),
        { padding: theme.spacing.lg, gap: theme.spacing.sm, backgroundColor: theme.colors.primarySoft },
      ]}
    >
      <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        NEXT STEP
      </AppText>
      <AppText variant="body">{next.text}</AppText>
      {next.activity ? (
        <LinkAction
          label={`Open ${next.activity.title}`}
          onPress={() => next.activity && router.push(activityHref(topic.id, next.activity.id))}
        />
      ) : null}
    </View>
  );
  if (review.isEmpty) {
    return (
      <View style={{ gap: theme.spacing.lg }}>
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
          <AppText variant="title">Nothing to review yet</AppText>
          <AppText variant="body" color="textSecondary">
            Your mistakes, hints, retries, games and saved work for this subtopic will appear here once you practise,
            play or create.
          </AppText>
        </View>
        {nextCard}
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {nextCard}
      <View style={[styles.stats, { gap: theme.spacing.sm }]}>
        <Stat value={review.mistakes.length} label="to review" />
        <Stat value={review.completed.length} label="completed" />
        <Stat value={review.retried.length} label="retried" />
        <Stat value={review.totalHints} label="hints used" />
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="h3">Mistakes to review</AppText>
        {review.mistakes.length === 0 ? (
          <AppText variant="body" color="textSecondary">
            No open mistakes. Well done.
          </AppText>
        ) : (
          review.mistakes.map((q) => (
            <MistakeCard
              key={q.item.id}
              topic={topic}
              review={review}
              item={q.item}
              attempts={q.attempts.length}
              hints={q.hintsUsed}
            />
          ))
        )}
      </View>

      {review.weakTechniques.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="h3">Techniques to strengthen</AppText>
          {review.weakTechniques.map((t) => (
            <AppText key={t.technique} variant="body">
              {`${t.label}: ${t.wrong} of ${t.attempts} answers not yet right`}
            </AppText>
          ))}
        </View>
      ) : null}

      {review.lastAttempts.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="h3">Last attempts</AppText>
          {review.lastAttempts.map(({ item, attempt }) => (
            <View key={attempt.id} style={[styles.actions, { gap: theme.spacing.sm }]}>
              <AppText variant="small" color={attempt.isCorrect ? 'success' : 'textSecondary'}>
                {attempt.isCorrect ? '✓ Correct' : '✗ Not yet'}
              </AppText>
              <AppText variant="small" color="textSecondary">
                {`${item.techniqueLabel} · ${new Date(attempt.answeredAt).toLocaleDateString()}${attempt.hintsUsed ? ` · ${attempt.hintsUsed} hints` : ''}`}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {review.games.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="h3">Games</AppText>
          {review.games.map((g) => (
            <View key={g.activity.id} style={[styles.actions, { gap: theme.spacing.md }]}>
              <AppText variant="body" style={styles.flex}>
                {`${g.activity.title}: best score ${g.bestScore} · played ${g.sessions.length} ${g.sessions.length === 1 ? 'time' : 'times'} · ${g.retries} retried steps`}
              </AppText>
              <LinkAction label="Play again" onPress={() => router.push(activityHref(topic.id, g.activity.id))} />
            </View>
          ))}
        </View>
      ) : null}

      {review.art.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="h3">Your saved Create work</AppText>
          {review.art.map(({ activity, project }) => (
            <View key={project.id} style={[styles.actions, { gap: theme.spacing.md }]}>
              <AppText variant="body" style={styles.flex}>
                {`${project.title} · ${activity.title}`}
              </AppText>
              <LinkAction
                label={`Open ${project.title}`}
                onPress={() => router.push(activityHref(topic.id, activity.id, project.id))}
              />
            </View>
          ))}
        </View>
      ) : null}

      {review.explored.length > 0 || review.reflections > 0 ? (
        <AppText variant="small" color="textSecondary">
          {[
            review.explored.length > 0 ? `Explored: ${review.explored.map((a) => a.title).join(', ')}` : '',
            review.reflections > 0
              ? `${review.reflections} ${review.reflections === 1 ? 'reflection' : 'reflections'} saved`
              : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { flexGrow: 1, flexBasis: '22%', minWidth: 72, gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  flex: { flex: 1, minWidth: 160 },
});
