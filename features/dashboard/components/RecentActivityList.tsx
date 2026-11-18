import { router } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActivityGlyph } from '@/components/art/ActivityGlyph';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatRelativeDay } from '@/lib/utils/time';
import type { RecentActivity } from '@/types/dashboard';

function ResultBadge({ item }: { item: RecentActivity }) {
  const theme = useAppTheme();

  if (item.result.type === 'completed') {
    return (
      <View style={styles.result}>
        <CircleCheck size={16} color={theme.colors.success} strokeWidth={2.4} />
        <AppText variant="caption" style={{ color: theme.colors.textPrimary }}>
          Done
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.result}>
      <ProgressRing percent={item.result.percent} size={18} strokeWidth={2.5} />
      <AppText variant="caption">{`${item.result.percent}% done`}</AppText>
    </View>
  );
}

interface RecentActivityListProps {
  items: RecentActivity[];
  now?: Date;
  /** Only the latest few are shown on Home; "See all" opens My Work. */
  limit?: number;
}

export function RecentActivityList({ items: all, now, limit = 3 }: RecentActivityListProps) {
  const theme = useAppTheme();
  const items = all.slice(0, limit);

  return (
    <View>
      <SectionHeader
        title="Recent activity"
        actionLabel={items.length > 0 ? 'See all' : undefined}
        actionAccessibilityLabel="See all recent activity"
        onAction={() => router.push('/my-work')}
      />
      <View style={[cardStyle(theme), styles.list]}>
        {items.length === 0 ? (
          <View style={{ padding: theme.spacing.xl, gap: theme.spacing.xs }}>
            <AppText variant="title">No activity yet</AppText>
            <AppText variant="small" color="textSecondary">
              Start a lesson and your work will show up here.
            </AppText>
          </View>
        ) : (
          items.map((item, index) => {
            const when = formatRelativeDay(item.occurredAt, now);
            const outcome =
              item.result.type === 'completed' ? 'completed' : `in progress, ${item.result.percent} percent done`;
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.href)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${item.kindLabel}, ${outcome}, ${when}`}
                style={({ pressed }) => [
                  styles.row,
                  {
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    gap: theme.spacing.md,
                    borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: theme.colors.border,
                    backgroundColor: pressed ? theme.colors.surfacePressed : 'transparent',
                  },
                ]}
              >
                <ActivityGlyph name={item.glyph} tone={item.tone} size={42} />
                <View style={styles.text}>
                  <AppText variant="title" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="small" color="textSecondary" numberOfLines={1}>
                    {item.kindLabel}
                  </AppText>
                </View>
                <View style={styles.trailing}>
                  <ResultBadge item={item} />
                  <AppText variant="small" color="textSecondary">
                    {when}
                  </AppText>
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, gap: 2 },
  trailing: { alignItems: 'flex-end', gap: 4 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
