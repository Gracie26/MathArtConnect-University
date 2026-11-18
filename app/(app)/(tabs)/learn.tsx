import { router } from 'expo-router';
import { ListChecks, Target } from 'lucide-react-native';
import { View } from 'react-native';

import { TopicCard } from '@/components/learning/TopicCard';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { ListRow, ListSection } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { listLearnerTopics } from '@/content/registry';
import { focusTopicId, useTopicsProgress } from '@/features/learning/useTopicsProgress';
import { useAppTheme } from '@/hooks/useAppTheme';

const topics = listLearnerTopics();

/**
 * Learn: the course topics. The topic to work on now is a full card with the
 * one primary action; every other topic is a compact row (progress, study
 * time), so the screen says at a glance what to study next. The Practice hub
 * and every game across topics are linked at the bottom.
 */
export default function LearnScreen() {
  const theme = useAppTheme();
  const progress = useTopicsProgress(topics);
  const focus = progress ? focusTopicId(topics, progress) : (topics[0]?.id ?? null);
  const featured = topics.find((t) => t.id === focus);
  const others = topics.filter((t) => t.id !== focus);

  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h1">Your topics</AppText>
        <AppText variant="body" color="textSecondary">
          Calculus II, built from your course material.
        </AppText>
      </View>
      {featured ? (
        <TopicCard
          topic={featured}
          number={topics.indexOf(featured) + 1}
          progress={progress?.[featured.id] ?? null}
          featured
        />
      ) : null}
      {others.length > 0 ? (
        <View>
          <SectionHeader title="All topics" />
          <View style={{ gap: theme.spacing.sm }}>
            {others.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                number={topics.indexOf(topic) + 1}
                progress={progress?.[topic.id] ?? null}
              />
            ))}
          </View>
        </View>
      ) : null}
      <ListSection title="Practise & play">
        <ListRow
          first
          icon={ListChecks}
          label="Practice hub"
          description="Every topic's questions, by source, mode and subtopic"
          onPress={() => router.push('/practice')}
        />
        <ListRow
          icon={Target}
          label="All games"
          description="Every game, grouped by topic and subtopic"
          onPress={() => router.push('/games')}
        />
      </ListSection>
    </Screen>
  );
}
