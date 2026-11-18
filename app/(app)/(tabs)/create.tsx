import { View } from 'react-native';

import { CreateCatalog } from '@/components/activities/ActivityCatalog';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function CreateScreen() {
  const theme = useAppTheme();
  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h1">Create</AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          Create mathematics visually.
        </AppText>
      </View>
      <CreateCatalog />
    </Screen>
  );
}
