import { useMemo } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { listLearnerTopics } from '@/content/registry';
import { ProgressOverview } from '@/features/insights/ProgressOverview';
import { useAppTheme } from '@/hooks/useAppTheme';

/** Progress: an overview across topics, with each topic's full report one tap away. */
export default function ProgressScreen() {
  const theme = useAppTheme();
  // A stable list, so the records hook does not reload on every render.
  const topics = useMemo(() => listLearnerTopics(), []);
  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h1" accessibilityRole="header">
          Progress
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          Your learning at a glance.
        </AppText>
      </View>
      <ProgressOverview topics={topics} />
    </Screen>
  );
}
