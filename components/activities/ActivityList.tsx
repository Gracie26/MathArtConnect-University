import { router } from 'expo-router';
import { ChartSpline, ChevronRight, Gamepad2, GitBranch, type LucideIcon, Network, Palette } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import type { TopicActivity } from '@/content/types';
import { activityHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AccentTone } from '@/types/dashboard';

/** What kind of activity this is, in words (never colour alone). */
export function activityTypeLabel(activity: TopicActivity): string {
  if (activity.kind === 'lab') return 'Explore tool';
  if (activity.kind === 'game') return 'Game';
  return activity.createType === 'graphArt'
    ? 'Graph art'
    : activity.createType === 'areaArt'
      ? 'Area art'
      : activity.createType === 'rnArt'
        ? 'Multivariable art'
        : activity.createType === 'paArt'
          ? 'Gradient and surface art'
          : activity.createType === 'structure'
            ? 'Structure map'
            : 'Solution flow';
}

const LOOK = (activity: TopicActivity): { icon: LucideIcon; tone: AccentTone } => {
  if (activity.kind === 'lab') return { icon: ChartSpline, tone: 'blue' };
  if (activity.kind === 'game') return { icon: Gamepad2, tone: 'coral' };
  if (
    activity.createType === 'graphArt' ||
    activity.createType === 'areaArt' ||
    activity.createType === 'rnArt' ||
    activity.createType === 'paArt'
  )
    return { icon: Palette, tone: 'teal' };
  if (activity.createType === 'structure') return { icon: Network, tone: 'amber' };
  return { icon: GitBranch, tone: 'amber' };
};

/** A tappable card that opens an Explore tool, game or Create activity; `compact` for long catalogues. */
export function ActivityCard({
  activity,
  context,
  compact = false,
}: {
  activity: TopicActivity;
  context?: string;
  compact?: boolean;
}) {
  const theme = useAppTheme();
  const { icon, tone } = LOOK(activity);
  const type = activityTypeLabel(activity);
  return (
    <Pressable
      onPress={() => router.push(activityHref(activity.topicId, activity.id))}
      accessibilityRole="button"
      accessibilityLabel={`Open ${activity.title}. ${type}. ${activity.summary}`}
      style={({ pressed }) => [
        cardStyle(theme),
        styles.card,
        {
          padding: compact ? theme.spacing.md : theme.spacing.lg,
          gap: theme.spacing.md,
          minHeight: theme.touchTarget.comfortable,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <IconTile icon={icon} tone={tone} size={compact ? 32 : 40} />
      <View style={styles.text}>
        {compact ? null : (
          <AppText variant="small" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            {context ? `${type} · ${context}` : type}
          </AppText>
        )}
        <AppText variant="title">{activity.title}</AppText>
        <AppText variant="small" color="textSecondary" numberOfLines={compact ? 1 : undefined}>
          {activity.summary}
        </AppText>
      </View>
      <ChevronRight size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

export function ActivityList({
  activities,
  context,
  compact = false,
}: {
  activities: readonly TopicActivity[];
  context?: (a: TopicActivity) => string;
  compact?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: compact ? theme.spacing.sm : theme.spacing.md }}>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} context={context?.(activity)} compact={compact} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, gap: 2 },
});
