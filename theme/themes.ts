import {
  type ColorRoles,
  darkColors,
  highContrastDarkOverrides,
  highContrastLightOverrides,
  lightColors,
} from './tokens/colors';
import { layout, motion, radius, shadows, spacing, touchTarget } from './tokens/layout';
import { fontFamilies, typography } from './tokens/typography';

export type ColorSchemeName = 'light' | 'dark';
export type ThemePreference = 'system' | ColorSchemeName;

export interface AppTheme {
  scheme: ColorSchemeName;
  highContrast: boolean;
  colors: ColorRoles;
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  motion: typeof motion;
  touchTarget: typeof touchTarget;
  layout: typeof layout;
}

export function buildTheme(scheme: ColorSchemeName, highContrast = false): AppTheme {
  const base = scheme === 'dark' ? darkColors : lightColors;
  const overrides = highContrast ? (scheme === 'dark' ? highContrastDarkOverrides : highContrastLightOverrides) : {};

  return {
    scheme,
    highContrast,
    colors: { ...base, ...overrides },
    typography,
    fontFamilies,
    spacing,
    radius,
    shadows,
    motion,
    touchTarget,
    layout,
  };
}

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
