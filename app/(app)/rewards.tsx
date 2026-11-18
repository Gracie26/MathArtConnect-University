import { Award, CircleCheck, Flame, Lock, Star, Target, Trophy } from 'lucide-react-native';
import { StyleSheet, Switch, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatWhen, Section } from '@/features/insights/components';
import { type BadgeCategory, type BadgeStatus, remainingText } from '@/features/rewards/achievements';
import { backdropUnlocked, BACKDROPS } from '@/features/rewards/rewardsStore';
import { useRewards } from '@/features/rewards/useRewards';
import { goalMet } from '@/features/rewards/weeklyGoals';
import { useAppTheme } from '@/hooks/useAppTheme';

const CATEGORY_TITLES: Record<BadgeCategory, string> = {
  firsts: 'First steps',
  practice: 'Practice',
  progress: 'Lessons',
  streak: 'Study days',
  xp: 'XP',
  topic: 'Topic 4: Applications of Partial Derivatives',
};

function Stat({
  icon,
  tone,
  value,
  label,
}: {
  icon: typeof Award;
  tone: 'teal' | 'coral' | 'amber' | 'blue';
  value: string;
  label: string;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.stat, { gap: theme.spacing.sm }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <IconTile icon={icon} tone={tone} size={32} />
      <View>
        <AppText variant="title">{value}</AppText>
        <AppText variant="small" color="textSecondary">
          {label}
        </AppText>
      </View>
    </View>
  );
}

function BadgeRow({ badge }: { badge: BadgeStatus }) {
  const theme = useAppTheme();
  const status = badge.earned
    ? `Earned${badge.earnedAt ? ` ${formatWhen(badge.earnedAt)}` : ''}`
    : `${badge.progress} of ${badge.target} · ${remainingText(badge)} to go`;
  return (
    <View
      accessible
      accessibilityLabel={`${badge.title}. ${badge.earned ? 'Earned' : 'Not earned yet'}. ${badge.criterion} ${status}.`}
      style={[styles.row, { gap: theme.spacing.md, paddingVertical: theme.spacing.sm }]}
    >
      <IconTile icon={badge.earned ? CircleCheck : Lock} tone={badge.earned ? 'teal' : 'blue'} size={36} />
      <View style={styles.grow}>
        <AppText variant="title">{badge.title}</AppText>
        <AppText variant="small" color="textSecondary">
          {badge.criterion}
        </AppText>
        {badge.earned ? null : <ProgressBar value={badge.progress / badge.target} height={5} />}
        <AppText variant="small" color={badge.earned ? 'primary' : 'textSecondary'}>
          {status}
        </AppText>
      </View>
    </View>
  );
}

/** Rewards: personal bests, optional weekly goals, every badge with its criterion, and cosmetic backdrops. */
export default function RewardsScreen() {
  const theme = useAppTheme();
  const rewards = useRewards();
  const data = rewards.data;

  return (
    <Screen>
      <AppText variant="bodyLarge" color="textSecondary">
        Personal progress from your own learning record. Badges are earned by learning, never by opening a page, and
        nothing in the course is locked behind them.
      </AppText>
      <FormError message={rewards.error} />
      {rewards.status === 'loading' ? <Skeleton height={220} radius={theme.radius.card} /> : null}
      {rewards.status === 'error' ? <LoadingButton label="Try again" onPress={() => void rewards.reload()} /> : null}
      {data ? (
        <>
          <Section title="Personal bests">
            <View
              style={[
                cardStyle(theme),
                styles.grid,
                { padding: theme.spacing.lg, rowGap: theme.spacing.lg, columnGap: theme.spacing.md },
              ]}
            >
              <Stat icon={Flame} tone="coral" value={`${data.streakDays}`} label="current study streak (days)" />
              <Stat icon={Trophy} tone="amber" value={`${data.longestStreak}`} label="longest streak (days)" />
              <Stat icon={Star} tone="amber" value={`${data.xp}`} label="XP earned" />
              <Stat
                icon={Award}
                tone="teal"
                value={`${data.earnedCount} of ${data.badges.length}`}
                label="badges earned"
              />
            </View>
            {data.next ? (
              <AppText variant="small">{`Next badge: ${data.next.title}, ${remainingText(data.next)} to go.`}</AppText>
            ) : null}
          </Section>

          <Section
            title="Weekly goals"
            subtitle="Optional. They reset every Monday; a missed goal is never counted against you."
          >
            <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
              <View style={[styles.row, { gap: theme.spacing.md }]}>
                <AppText variant="title" style={styles.grow}>
                  Show weekly goals on Home
                </AppText>
                <Switch
                  value={rewards.settings.weeklyGoals}
                  onValueChange={rewards.setWeeklyGoals}
                  accessibilityLabel="Show weekly goals on Home"
                  trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }}
                  thumbColor={theme.colors.surface}
                />
              </View>
              {data.goals.map((g) => (
                <View
                  key={g.id}
                  accessible
                  accessibilityLabel={`${g.title}: ${g.done} of ${g.target} this week${goalMet(g) ? ', complete' : ''}. Last week ${g.lastWeek}.`}
                  style={{ gap: 4 }}
                >
                  <View style={styles.row}>
                    <IconTile icon={goalMet(g) ? CircleCheck : Target} tone={goalMet(g) ? 'teal' : 'blue'} size={28} />
                    <AppText variant="title" style={[styles.grow, { marginLeft: theme.spacing.sm }]}>
                      {g.title}
                    </AppText>
                    <AppText variant="caption">{`${Math.min(g.done, g.target)} / ${g.target}${goalMet(g) ? ' · done' : ''}`}</AppText>
                  </View>
                  <ProgressBar value={Math.min(1, g.done / g.target)} height={6} />
                  <AppText variant="small" color="textSecondary">
                    {`Last week: ${g.lastWeek}`}
                  </AppText>
                </View>
              ))}
            </View>
          </Section>

          {(Object.keys(CATEGORY_TITLES) as BadgeCategory[]).map((category) => {
            const list = data.badges.filter((b) => b.category === category);
            return (
              <Section key={category} title={CATEGORY_TITLES[category]}>
                <View
                  style={[cardStyle(theme), { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm }]}
                >
                  {list.map((b) => (
                    <BadgeRow key={b.id} badge={b} />
                  ))}
                </View>
              </Section>
            );
          })}

          <Section
            title="Home backdrops"
            subtitle="Optional decoration for the top of Home, unlocked by badges. Every lesson, tool and question stays open to everyone."
          >
            <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
              {BACKDROPS.map((b) => {
                const open = backdropUnlocked(b.id, data.earnedCount);
                const chosen = rewards.settings.backdrop === b.id;
                return (
                  <View key={b.id} style={[styles.row, { gap: theme.spacing.md }]}>
                    <View style={styles.grow}>
                      <AppText variant="title">{b.title}</AppText>
                      <AppText variant="small" color="textSecondary">
                        {open ? b.description : `Earn ${b.badgesNeeded} badges to unlock. ${b.description}`}
                      </AppText>
                    </View>
                    <LoadingButton
                      variant={chosen ? 'primary' : 'secondary'}
                      label={chosen ? 'In use' : open ? 'Use' : 'Locked'}
                      disabled={!open || chosen}
                      onPress={() => rewards.setBackdrop(b.id)}
                      style={styles.button}
                    />
                  </View>
                );
              })}
            </View>
          </Section>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1, gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', flexBasis: '46%', flexGrow: 1 },
  button: { minWidth: 96 },
});
