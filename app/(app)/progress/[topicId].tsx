import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { getTopic } from '@/content/registry';
import { ProgressDashboard } from '@/features/insights/ProgressDashboard';

/** One topic's full progress report, opened from a Progress tab topic card. */
export default function TopicProgressScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const topic = topicId ? getTopic(topicId) : undefined;
  return (
    <Screen>
      <Stack.Screen options={{ title: topic ? `${topic.title} progress` : 'Progress' }} />
      {topic ? (
        <ProgressDashboard topic={topic} />
      ) : (
        <AppText variant="body" color="textSecondary">
          This topic is not in this version of the app.
        </AppText>
      )}
    </Screen>
  );
}
