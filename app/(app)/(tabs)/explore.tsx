import { View } from 'react-native';

import { ExploreCatalog } from '@/components/activities/ActivityCatalog';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ExploreScreen() {
  const theme = useAppTheme();
  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h1">Visual Calculus Lab</AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          Explore mathematics visually.
        </AppText>
      </View>
      <ExploreCatalog />
    </Screen>
  );
}
