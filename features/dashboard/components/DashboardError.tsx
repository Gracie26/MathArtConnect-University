import { RotateCcw } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  const theme = useAppTheme();

  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.xl, gap: theme.spacing.md, alignItems: 'flex-start' }]}>
      <AppText variant="title">Your dashboard could not load</AppText>
      <AppText variant="small" color="textSecondary">
        {message}
      </AppText>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          minHeight: theme.touchTarget.min,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.pill,
          backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary,
        })}
      >
        <RotateCcw size={16} color={theme.colors.onPrimary} />
        <AppText variant="button" color="onPrimary">
          Try again
        </AppText>
      </Pressable>
    </View>
  );
}
