import { Platform, type ViewStyle } from 'react-native';

/** Spacing scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

/** Moderate radii: professional, not cartoon-like. */
export const radius = {
  sm: 10,
  md: 16,
  /** Standard card radius. */
  card: 18,
  lg: 22,
  pill: 999,
} as const;

/** Width breakpoints (dp). Phones are designed first; these only add space. */
export const breakpoints = {
  tablet: 600,
  desktop: 960,
} as const;

/** Minimum touch target (WCAG 2.5.5 / platform guidelines). */
export const touchTarget = {
  min: 44,
  comfortable: 48,
} as const;

/** Content width cap so tablet and web layouts stay readable. */
export const layout = {
  screenGutter: spacing.lg,
  screenGutterWide: spacing.xxl,
  maxContentWidth: 720,
  /** Centred dashboard area on desktop web; never stretch edge to edge. */
  maxDashboardWidth: 1160,
  /** Bottom tab bar row height, excluding the safe-area inset. */
  tabBarHeight: 58,
} as const;

export type ShadowLevel = 'none' | 'subtle' | 'raised';

function makeShadow(opacity: number, radiusPx: number, offsetY: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    web: { boxShadow: `0px ${offsetY}px ${radiusPx}px rgba(15, 23, 42, ${opacity})` },
    android: { elevation },
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: offsetY },
    },
  });
}

/** Subtle shadows; most cards should use `subtle` or a border instead. */
export const shadows: Record<ShadowLevel, ViewStyle> = {
  none: {},
  subtle: makeShadow(0.06, 8, 2, 1),
  raised: makeShadow(0.1, 16, 6, 4),
};

/** Motion durations (ms). Always gate animation on the reduced-motion setting. */
export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;
