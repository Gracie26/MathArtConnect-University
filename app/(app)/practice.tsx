import { router, Stack } from 'expo-router';
import { BookOpenText, ClipboardList, Dumbbell, Layers } from 'lucide-react-native';
import { View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { ListRow } from '@/components/ui/ListRow';
import { matchesPracticeSource, practiceSourceOptions } from '@/content/practiceSources';
import { listLearnerTopics } from '@/content/registry';
import type { TopicDefinition } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { practiceHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const plural = (n: number) => (n === 1 ? '1 question' : `${n} questions`);

/** One topic's practice: by source (chapter and tutorial, or each tutorial), by mode, and by subtopic. */
function TopicPractice({ topic }: { topic: TopicDefinition }) {
  const theme = useAppTheme();
  const items = (topic.practiceItems ?? []).filter((item) => isPracticeItemVisible(item));
  const sources = practiceSourceOptions(topic).map((option) => ({
    option,
    count: items.filter((item) => matchesPracticeSource(item, option)).length,
  }));
  const units = topic.units
    .map((unit) => ({ unit, count: items.filter((i) => i.unitId === unit.id).length }))
    .filter(({ count }) => count > 0);
  const group = { ...cardStyle(theme), overflow: 'hidden' as const };

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="eyebrow" color="textSecondary">
          {topic.subtitle.toUpperCase()}
        </AppText>
        <AppText variant="h2" accessibilityRole="header">
          {topic.title}
        </AppText>
        <AppText variant="small" color="textSecondary">
          {`${plural(items.length)} from the course material`}
        </AppText>
      </View>

      <View style={group}>
        {sources.map(({ option, count }, index) => (
          <ListRow
            key={option.id}
            first={index === 0}
            icon={option.id === 'chapter' ? BookOpenText : ClipboardList}
            label={option.label}
            {...(option.description ? { description: option.description } : {})}
            value={plural(count)}
            onPress={
              count > 0 ? () => router.push(practiceHref(topic.id, 'independent', undefined, option.id)) : undefined
            }
            accessibilityLabel={`${option.label}, ${topic.title}, ${plural(count)}`}
          />
        ))}
      </View>

      <View style={group}>
        {topic.practiceModes
          .filter((mode) => mode.availability.status === 'available')
          .map((mode, index) => (
            <ListRow
              key={mode.id}
              first={index === 0}
              icon={Dumbbell}
              label={mode.title}
              description={mode.summary}
              onPress={() => router.push(practiceHref(topic.id, mode.id))}
              accessibilityLabel={`${mode.title}, ${topic.title}`}
            />
          ))}
      </View>

      {units.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="h3">By subtopic</AppText>
          <View style={group}>
            {units.map(({ unit, count }, index) => (
              <ListRow
                key={unit.id}
                first={index === 0}
                icon={Layers}
                label={unit.title}
                value={plural(count)}
                onPress={() => router.push(practiceHref(topic.id, 'independent', unit.slug))}
                accessibilityLabel={`Practise ${unit.title}, ${plural(count)}`}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Practice hub: every topic's real practice questions, by source, mode and subtopic. */
export default function PracticeHubScreen() {
  const theme = useAppTheme();
  const topics = listLearnerTopics().filter((t) => (t.practiceItems?.length ?? 0) > 0);
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Practice' }} />
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h1">Practice</AppText>
        <AppText variant="body" color="textSecondary">
          Questions from the course notes and tutorials. Work each one in My Working: check every step, ask for hints,
          and check your final answer.
        </AppText>
        <AppText variant="small" color="textSecondary">
          Hints and walkthroughs are app guidance, not official UNAM or lecturer solutions.
        </AppText>
      </View>
      {topics.map((topic) => (
        <TopicPractice key={topic.id} topic={topic} />
      ))}
    </Screen>
  );
}
