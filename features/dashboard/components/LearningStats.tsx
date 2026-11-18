import { Flame, type LucideIcon, Star, Target } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { toneColors } from '@/components/ui/tones';
import { MIN_ANSWERS_FOR_ACCURACY, practiceAccuracy } from '@/features/learning/studyDay';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCompactNumber } from '@/lib/utils/format';
import type { AccentTone, LearningStatsData } from '@/types/dashboard';

interface StatItem {
  key: string;
  icon: LucideIcon;
  tone: AccentTone;
  value: string;
  label: string;
  spoken: string;
}

/**
 * Study streak, XP and practice accuracy as three compact chips (not a card),
 * so they sit beside the greeting without competing with Continue Learning.
 * There is no mastery score; accuracy appears only once enough practice
 * answers have been checked, and is a plain share of correct answers.
 */
export function LearningStats({ stats }: { stats: LearningStatsData }) {
  const theme = useAppTheme();
  const accuracy = practiceAccuracy(stats.practice.checked, stats.practice.correct);
  const days = stats.streakDays === 1 ? 'day' : 'days';

  const items: StatItem[] = [
    {
      key: 'streak',
      icon: Flame,
      tone: 'coral',
      value: String(stats.streakDays),
      label: 'day streak',
      spoken: `Study streak: ${stats.streakDays} ${days} in a row`,
    },
    {
      key: 'xp',
      icon: Star,
      tone: 'amber',
      value: formatCompactNumber(stats.xp),
      label: 'XP',
      spoken: `${stats.xp} XP earned`,
    },
    {
      key: 'accuracy',
      icon: Target,
      tone: 'teal',
      value: accuracy === null ? '—' : `${accuracy}%`,
      label: 'accuracy',
      spoken:
        accuracy === null
          ? `Practice accuracy appears after ${MIN_ANSWERS_FOR_ACCURACY} checked answers; ${stats.practice.checked} so far`
          : `Practice accuracy ${accuracy} percent: ${stats.practice.correct} of ${stats.practice.checked} checked answers correct`,
    },
  ];

  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      {items.map((item) => {
        const { soft, strong } = toneColors(theme, item.tone);
        const Icon = item.icon;
        return (
          <View
            key={item.key}
            accessible
            accessibilityLabel={item.spoken}
            style={[
              styles.chip,
              {
                gap: 6,
                minHeight: 36,
                paddingHorizontal: theme.spacing.md,
                borderRadius: theme.radius.pill,
                backgroundColor: soft,
              },
            ]}
          >
            <Icon size={15} color={strong} strokeWidth={2.4} />
            <AppText variant="caption" style={{ fontFamily: theme.fontFamilies.bold }}>
              {item.value}
            </AppText>
            <AppText variant="small" color="textSecondary">
              {item.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center' },
});
