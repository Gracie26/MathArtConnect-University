import { Stack, useLocalSearchParams } from 'expo-router';

import { ActivityHost } from '@/components/activities/ActivityHost';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { getTopic } from '@/content/registry';

/** An Explore tool, game or Create activity; `?project=` reopens a saved Create project. */
export default function ActivityScreen() {
  const { topicId, activityId, project } = useLocalSearchParams<{
    topicId: string;
    activityId: string;
    project?: string;
  }>();
  const topic = topicId ? getTopic(topicId) : undefined;
  const activity = topic?.activities.find((a) => a.id === activityId);
  if (!topic || topic.isDemo || !activity || activity.availability.status !== 'available') {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Activity' }} />
        <AppText variant="h2">This activity is not available.</AppText>
      </Screen>
    );
  }
  return (
    <>
      <Stack.Screen options={{ title: activity.title }} />
      <ActivityHost activity={activity} projectId={project || undefined} />
    </>
  );
}
