import { ArrowUp } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

/** Scroll distance (dp) after which a long screen offers "Back to top". */
export const BACK_TO_TOP_AFTER = 1400;

/**
 * A small floating "Back to top" button for long screens. The screen decides
 * when it shows (see BACK_TO_TOP_AFTER) and does the scrolling.
 */
export function BackToTop({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  if (!visible) return null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back to top"
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        theme.shadows.raised,
        {
          right: theme.spacing.lg,
          bottom: theme.spacing.lg,
          width: theme.touchTarget.min,
          height: theme.touchTarget.min,
          borderRadius: theme.touchTarget.min / 2,
          backgroundColor: pressed ? theme.colors.surfacePressed : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <ArrowUp size={20} color={theme.colors.primary} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
