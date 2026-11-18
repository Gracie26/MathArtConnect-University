import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getGreeting } from '@/lib/utils/time';

interface GreetingSectionProps {
  learnerName: string | null;
  now?: Date;
}

export function GreetingSection({ learnerName, now }: GreetingSectionProps) {
  const theme = useAppTheme();
  const greeting = getGreeting(now);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="h1" style={{ fontSize: 22, lineHeight: 28 }}>
        {learnerName ? `${greeting}, ${learnerName}` : greeting}
      </AppText>
      <AppText variant="small" color="textSecondary">
        {learnerName ? 'What will you explore today?' : 'Explore mathematics differently today.'}
      </AppText>
    </View>
  );
}
