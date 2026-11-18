import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

interface IconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  /** Shows a small coral dot (e.g. unread notifications). */
  showBadge?: boolean;
}

/** 44 dp round toolbar button. */
export function IconButton({ icon: Icon, accessibilityLabel, onPress, showBadge = false }: IconButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        {
          width: theme.touchTarget.min,
          height: theme.touchTarget.min,
          backgroundColor: pressed ? theme.colors.surfacePressed : 'transparent',
        },
      ]}
    >
      <Icon size={22} color={theme.colors.textPrimary} strokeWidth={2} />
      {showBadge ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.accent, borderColor: theme.colors.background }]} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  badge: { position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
});
