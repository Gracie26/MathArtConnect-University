import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface LoadingButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  /** Screen-reader text while loading, e.g. "Signing in". */
  loadingLabel?: string;
  icon?: LucideIcon;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Full-width action button with loading and disabled states. Loading keeps
 * the label width stable and announces busy state to assistive technology.
 */
export function LoadingButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  loadingLabel,
  icon: Icon,
  accessibilityHint,
  style,
  testID,
}: LoadingButtonProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const inactive = disabled || loading;

  const palette = {
    primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary, border: 'transparent' },
    secondary: {
      bg: colors.surface,
      pressed: colors.surfacePressed,
      fg: colors.textPrimary,
      border: colors.borderStrong,
    },
    danger: { bg: colors.surface, pressed: colors.errorSoft, fg: colors.error, border: colors.borderStrong },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: theme.touchTarget.comfortable + 4,
          borderRadius: theme.radius.md,
          backgroundColor: pressed ? palette.pressed : palette.bg,
          borderColor: palette.border,
          opacity: disabled && !loading ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={18} color={palette.fg} strokeWidth={2.2} /> : null}
          <AppText variant="button" style={[styles.label, { color: palette.fg }]}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderWidth: 1 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 1 },
  label: { textAlign: 'center', flexShrink: 1 },
});
