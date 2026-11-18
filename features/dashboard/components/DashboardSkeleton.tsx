import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { useAppTheme } from '@/hooks/useAppTheme';

/** Placeholder matching the dashboard's shape while data loads. */
export function DashboardSkeleton({ columns }: { columns: 2 | 4 }) {
  const theme = useAppTheme();
  const card = theme.radius.card;

  return (
    <View
      accessible
      accessibilityLabel="Loading your dashboard"
      accessibilityState={{ busy: true }}
      style={{ gap: theme.spacing.xxl }}
    >
      <View style={{ gap: theme.spacing.sm }}>
        <Skeleton width="62%" height={26} />
        <Skeleton width="48%" height={16} />
      </View>
      <Skeleton height={columns === 4 ? 220 : 280} radius={theme.radius.lg} />
      <Skeleton height={64} radius={card} />
      <View style={{ gap: theme.spacing.md }}>
        <Skeleton width={90} height={20} />
        <View style={[styles.grid, { gap: theme.spacing.md }]}>
          {Array.from({ length: 4 }, (_, i) => (
            <View key={i} style={{ flexBasis: columns === 4 ? '22%' : '46%', flexGrow: 1 }}>
              <Skeleton height={116} radius={card} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
