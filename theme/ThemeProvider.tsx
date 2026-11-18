import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { setDisplayPreference, useDisplayPreferences } from '@/features/preferences/displayPreferences';

import { type AppTheme, buildTheme, type ThemePreference } from './themes';

interface ThemeContextValue {
  theme: AppTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /** Fixes the theme for an isolated tree (tests, previews) instead of the learner's saved choice. */
  initialPreference?: ThemePreference;
}

/**
 * Resolves the active theme from the learner's preference (system / light /
 * dark) and the high-contrast setting. Light is the default first-run
 * experience. The choice lives in the display-preference store, which saves it
 * on this device and (signed in) in the learner's account, so it survives
 * reloads, restarts and signing in again.
 */
export function ThemeProvider({ children, initialPreference }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const saved = useDisplayPreferences();
  const [local, setLocal] = useState(() =>
    initialPreference ? { theme: initialPreference, highContrast: false } : null,
  );

  const value = useMemo<ThemeContextValue>(() => {
    const preference = local?.theme ?? saved.theme;
    const highContrast = local?.highContrast ?? saved.highContrast;
    const scheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return {
      theme: buildTheme(scheme, highContrast),
      preference,
      setPreference: (next) => (local ? setLocal({ ...local, theme: next }) : setDisplayPreference('theme', next)),
      highContrast,
      setHighContrast: (enabled) =>
        local ? setLocal({ ...local, highContrast: enabled }) : setDisplayPreference('highContrast', enabled),
    };
  }, [local, saved.theme, saved.highContrast, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used inside <ThemeProvider>');
  }
  return context;
}
