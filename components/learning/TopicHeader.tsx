import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { TopicDefinition } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';

export function TopicHeader({ topic }: { topic: TopicDefinition }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {topic.course ? (
        <AppText variant="eyebrow" color="primary">
          {topic.course.title.toUpperCase()}
        </AppText>
      ) : null}
      <AppText variant="display">{topic.title}</AppText>
      <AppText variant="bodyLarge" color="textSecondary">
        {topic.description}
      </AppText>
    </View>
  );
}
