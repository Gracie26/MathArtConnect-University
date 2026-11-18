import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ActivityGroups } from '@/components/learning/ActivityGroups';
import { CollapsibleSection } from '@/components/learning/CollapsibleSection';
import { LearningPath } from '@/components/learning/LearningPath';
import { PracticeModeCard } from '@/components/learning/PracticeModeCard';
import { TopicHeader } from '@/components/learning/TopicHeader';
import { TopicProgressSummary } from '@/components/learning/TopicProgressSummary';
import { FormError } from '@/components/forms/FormError';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { getTopic } from '@/content/registry';
import { practiceHref } from '@/features/learning/navigation';
import { useLearningHistory } from '@/features/learning/useLearningHistory';
import { useTopicProgress } from '@/features/learning/useTopicProgress';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Topic landing page, simplest first: header, progress with the one primary
 * action (start or continue), the subtopics as a guided learning path, then
 * secondary material (practice modes, activities) folded away until asked for.
 */
export default function TopicScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const topic = topicId ? getTopic(topicId) : undefined;

  if (!topic || topic.isDemo) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Topic' }} />
        <AppText variant="h2">This topic is not available.</AppText>
      </Screen>
    );
  }
  return <TopicContent topicId={topic.id} />;
}

function TopicContent({ topicId }: { topicId: string }) {
  const theme = useAppTheme();
  const topic = getTopic(topicId)!;
  const { state } = useTopicProgress(topic);
  const progress = state.status === 'loading' ? null : state.progress;
  // This topic's checked practice answers (practice accuracy; there is no mastery score).
  const { state: history } = useLearningHistory(topic.id);
  const attempts = history.status === 'ready' ? history.history.attempts : null;
  const practice = attempts ? { checked: attempts.length, correct: attempts.filter((a) => a.isCorrect).length } : null;
  const modes = topic.practiceModes.filter((m) => m.availability.status === 'available');
  const sources = topic.practiceSources;

  return (
    <Screen>
      <Stack.Screen options={{ title: '' }} />
      <TopicHeader topic={topic} />

      {state.status === 'error' ? <FormError message={state.message} /> : null}

      {progress ? (
        <TopicProgressSummary topic={topic} progress={progress} practice={practice} />
      ) : (
        <Skeleton height={190} radius={theme.radius.card} />
      )}

      <View>
        <SectionHeader title="Learning path" />
        <LearningPath topic={topic} progress={progress} />
      </View>

      <CollapsibleSection
        title="Practice"
        summary={`${[...modes.map((m) => m.title), ...(sources ? [sources.chapter, sources.tutorial] : [])].length} ways to practise every subtopic`}
      >
        <View style={{ gap: theme.spacing.md }}>
          {topic.practiceModes.map((mode) => (
            <PracticeModeCard key={mode.id} mode={mode} onPress={() => router.push(practiceHref(topic.id, mode.id))} />
          ))}
          {sources
            ? (['chapter', 'tutorial'] as const).map((source) => (
                <PracticeModeCard
                  key={source}
                  mode={{
                    id: 'independent',
                    title: sources[source],
                    summary:
                      source === 'chapter'
                        ? 'The “You Try It” questions from the course notes, worked in My Working.'
                        : 'Every tutorial question for this topic, by subtopic and method, worked in My Working.',
                    availability: { status: 'available' },
                  }}
                  onPress={() => router.push(practiceHref(topic.id, 'independent', undefined, source))}
                />
              ))
            : null}
        </View>
      </CollapsibleSection>

      <View>
        <SectionHeader title="Activities" />
        <ActivityGroups activities={topic.activities} />
      </View>

      <AppText variant="small" color="textSecondary">
        {`Designed to support Calculus learning. Based on the ${topic.course?.institution ?? 'University of Namibia'} ${topic.course?.code ?? 'S3512MC'} ${topic.course?.title ?? 'Calculus II'} course material.`}
      </AppText>
    </Screen>
  );
}
