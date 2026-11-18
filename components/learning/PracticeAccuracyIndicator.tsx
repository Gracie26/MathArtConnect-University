import { Target } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { IconTile } from '@/components/ui/IconTile';
import { MIN_ANSWERS_FOR_ACCURACY, practiceAccuracy } from '@/features/learning/studyDay';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Practice accuracy: the share of answers checked in My Working that were
 * correct. It is a plain count, not a "mastery" judgement, and no percentage
 * is shown until there are enough checked answers to mean something.
 */
export function PracticeAccuracyIndicator({ checked, correct }: { checked: number; correct: number }) {
  const theme = useAppTheme();
  const percent = practiceAccuracy(checked, correct);
  const value = percent === null ? '—' : `${percent}%`;
  const detail =
    percent === null
      ? checked === 0
        ? `Appears after ${MIN_ANSWERS_FOR_ACCURACY} checked answers`
        : `${checked} of ${MIN_ANSWERS_FOR_ACCURACY} checked answers so far`
      : `${correct} of ${checked} checked answers correct`;

  return (
    <View
      style={[styles.row, { gap: theme.spacing.md }]}
      accessible
      accessibilityLabel={`Practice accuracy: ${percent === null ? 'not shown yet' : `${percent} percent`}. ${detail}.`}
    >
      <IconTile icon={Target} tone="teal" size={36} />
      <View style={styles.text}>
        <AppText variant="small" color="textSecondary">
          Practice accuracy
        </AppText>
        <AppText variant="title">{value}</AppText>
        <AppText variant="small" color="textSecondary">
          {detail}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
});
