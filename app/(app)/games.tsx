import { View } from 'react-native';

import { GamesCatalog } from '@/components/activities/ActivityCatalog';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

/** Every game in every learner topic, under the subtopic whose mathematics it practises. */
export default function GamesScreen() {
  const theme = useAppTheme();
  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h1">Games</AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          Short challenges that put ideas into play.
        </AppText>
      </View>
      <GamesCatalog />
    </Screen>
  );
}
