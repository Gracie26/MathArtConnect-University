import { router } from 'expo-router';
import { Award, ChevronRight, Target } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppTheme } from '@/hooks/useAppTheme';

import { remainingText } from './achievements';
import type { RewardsData } from './useRewards';
import { goalMet, weeklyNudge } from './weeklyGoals';

/**
 * Home: a compact reward summary under the learning snapshot (streak and XP are already in the
 * snapshot): weekly goal progress and the next badge. Deliberately smaller than Continue Learning.
 */
export function RewardsSummaryCard({ data, showGoals }: { data: RewardsData; showGoals: boolean }) {
  const theme = useAppTheme();
  const done = data.goals.filter(goalMet).length;
  const next = data.next;
  const label = [
    showGoals ? `Weekly goals: ${done} of ${data.goals.length} complete. ${weeklyNudge(data.goals)}` : null,
    next ? `Next badge: ${next.title}, ${remainingText(next)} to go.` : 'Every badge earned.',
    'Open rewards',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      onPress={() => router.push('/rewards')}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        cardStyle(theme),
        { padding: theme.spacing.md, gap: theme.spacing.sm, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {showGoals ? (
        <View style={[styles.row, { gap: theme.spacing.md }]}>
          <IconTile icon={Target} tone="blue" size={32} />
          <View style={styles.grow}>
            <AppText variant="small" color="textSecondary">
              {`Weekly goals · ${done} of ${data.goals.length} complete`}
            </AppText>
            <ProgressBar value={done / Math.max(1, data.goals.length)} height={6} />
            <AppText variant="small">{weeklyNudge(data.goals)}</AppText>
          </View>
        </View>
      ) : null}
      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <IconTile icon={Award} tone="amber" size={32} />
        <View style={styles.grow}>
          <AppText variant="small" color="textSecondary">
            {`Badges · ${data.earnedCount} of ${data.badges.length}`}
          </AppText>
          <AppText variant="small">
            {next ? `Next: ${next.title}, ${remainingText(next)} to go.` : 'You have earned every badge.'}
          </AppText>
        </View>
        <ChevronRight size={18} color={theme.colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1, gap: 4 },
});
