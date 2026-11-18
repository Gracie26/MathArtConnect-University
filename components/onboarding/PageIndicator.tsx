import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

interface PageIndicatorProps {
  count: number;
  index: number;
}

/** Dots with the current page as a teal pill; announced as "Page n of N". */
export function PageIndicator({ count, index }: PageIndicatorProps) {
  const theme = useAppTheme();

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={`Page ${index + 1} of ${count}`} style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === index ? 24 : 8,
              backgroundColor: i === index ? theme.colors.primary : theme.colors.borderStrong,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
});
