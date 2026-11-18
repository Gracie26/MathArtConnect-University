import { Circle, CircleCheck, CircleDot, Clock3, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { SubtopicStatus } from '@/features/learning/progress';
import { useAppTheme } from '@/hooks/useAppTheme';

type Status = SubtopicStatus | 'comingSoon';

const LABELS: Record<Status, string> = {
  notStarted: 'Not started',
  inProgress: 'In progress',
  completed: 'Completed',
  comingSoon: 'Coming soon',
};

/** Status shown with an icon and a word, never by colour alone. */
export function StatusLabel({ status }: { status: Status }) {
  const theme = useAppTheme();
  const { colors } = theme;
  const look: Record<Status, { icon: LucideIcon; color: string }> = {
    notStarted: { icon: Circle, color: colors.textSecondary },
    inProgress: { icon: CircleDot, color: colors.primary },
    completed: { icon: CircleCheck, color: colors.success },
    comingSoon: { icon: Clock3, color: colors.textSecondary },
  };
  const { icon: Icon, color } = look[status];

  return (
    <View style={styles.row}>
      <Icon size={14} color={color} strokeWidth={2.4} />
      <AppText variant="small" color="textSecondary" style={{ fontFamily: theme.fontFamilies.medium }}>
        {LABELS[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
