import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { listLearnerTopics } from '@/content/registry';
import { ReviewMyWork } from '@/features/insights/ReviewMyWork';
import type { KindFilter, StatusFilter } from '@/features/insights/workHistory';
import { useAppTheme } from '@/hooks/useAppTheme';

const KINDS: readonly KindFilter[] = ['all', 'practice', 'game', 'explore', 'create', 'lesson'];
const STATUSES: readonly StatusFilter[] = ['any', 'review', 'completed', 'recent'];

/**
 * Review My Work for any learner topic. `?topic=` chooses the topic (it is also chosen from `?unit=`);
 * `?filter=review` opens the mistakes to review; `?kind=` and `?unit=` preselect filters.
 */
export default function MyWorkScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ filter?: string; kind?: string; unit?: string; topic?: string }>();
  const topics = listLearnerTopics();
  const fromParams =
    topics.find((t) => t.id === params.topic) ?? topics.find((t) => t.units.some((u) => u.id === params.unit));
  const [topicId, setTopicId] = useState(fromParams?.id ?? topics[0]?.id);
  const topic = topics.find((t) => t.id === topicId) ?? topics[0];
  const status = STATUSES.find((s) => s === params.filter);
  const kind = KINDS.find((k) => k === params.kind);
  const unitId = topic?.units.some((u) => u.id === params.unit) ? (params.unit ?? null) : null;
  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h1">Review My Work</AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          My learning history: attempts, mistakes, games and saved creations.
        </AppText>
      </View>
      {topics.length > 1 ? (
        <ChipRow>
          {topics.map((t) => (
            <ChipButton
              key={t.id}
              label={t.shortTitle ?? t.title}
              selected={t.id === topic?.id}
              accessibilityLabel={`Show my work for ${t.title}`}
              onPress={() => setTopicId(t.id)}
            />
          ))}
        </ChipRow>
      ) : null}
      {topic ? (
        <ReviewMyWork
          key={topic.id}
          topic={topic}
          initialFilter={{
            ...(status ? { status } : {}),
            ...(kind ? { kind } : {}),
            ...(unitId ? { unitId } : {}),
          }}
        />
      ) : null}
    </Screen>
  );
}
