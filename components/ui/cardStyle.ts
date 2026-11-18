import { StyleSheet, type ViewStyle } from 'react-native';

import type { AppTheme } from '@/theme';

/** Standard app card: white/slate surface, hairline border, very soft shadow. */
export function cardStyle(theme: AppTheme): ViewStyle {
  return {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    ...theme.shadows.subtle,
  };
}
