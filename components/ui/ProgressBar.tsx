import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { toPercent } from '@/lib/utils/format';

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  height?: number;
  fillColor?: string;
  trackColor?: string;
  accessibilityLabel?: string;
}

export function ProgressBar({ value, height = 6, fillColor, trackColor, accessibilityLabel }: ProgressBarProps) {
  const theme = useAppTheme();
  const percent = toPercent(value);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { height, borderRadius: height, backgroundColor: trackColor ?? theme.colors.surfaceMuted }]}
    >
      <View
        style={[
          styles.fill,
          { width: `${percent}%`, borderRadius: height, backgroundColor: fillColor ?? theme.colors.primary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
