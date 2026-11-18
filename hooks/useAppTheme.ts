import { type AppTheme, useThemeContext } from '@/theme';

/** The active theme (colours, typography, spacing …) for styling components. */
export function useAppTheme(): AppTheme {
  return useThemeContext().theme;
}
