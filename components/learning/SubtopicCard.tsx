import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { toneColors } from '@/components/ui/tones';
import type { LearningUnitDefinition } from '@/content/types';
import type { SubtopicProgress } from '@/features/learning/progress';
import { useAppTheme } from '@/hooks/useAppTheme';
import { toPercent } from '@/lib/utils/format';

import { StatusLabel } from './StatusLabel';

interface SubtopicCardProps {
  unit: LearningUnitDefinition;
  index: number;
  progress: SubtopicProgress | undefined;
  onPress: () => void;
}

const ACTION = { notStarted: 'Start', inProgress: 'Continue', completed: 'Review' } as const;

export function SubtopicCard({ unit, index, progress, onPress }: SubtopicCardProps) {
  const theme = useAppTheme();
  const { soft, strong } = toneColors(theme, unit.tone);
  const status = progress?.status ?? 'notStarted';
  const percent = toPercent(progress?.fraction ?? 0);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Subtopic ${index}: ${unit.title}. ${unit.summary} ${percent} percent, ${status === 'notStarted' ? 'not started' : status === 'inProgress' ? 'in progress' : 'completed'}. ${ACTION[status]}.`}
      style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}
    >
      <View style={[styles.top, { gap: theme.spacing.md }]}>
        <View style={[styles.number, { backgroundColor: soft, borderRadius: theme.radius.sm }]}>
          <AppText variant="title" style={{ color: strong, fontFamily: theme.fontFamilies.bold }}>
            {String(index)}
          </AppText>
        </View>
        <View style={styles.text}>
          <AppText variant="title">{unit.title}</AppText>
          <AppText variant="small" color="textSecondary">
            {unit.summary}
          </AppText>
        </View>
      </View>
      <ProgressBar value={progress?.fraction ?? 0} height={5} />
      <View style={styles.bottom}>
        <StatusLabel status={status} />
        <View style={styles.action}>
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            {ACTION[status]}
          </AppText>
          <ChevronRight size={16} color={theme.colors.primary} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  number: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
