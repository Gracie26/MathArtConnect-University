import { palette } from './palette';

/**
 * Semantic colour roles. Colour usage rules:
 *   primary (teal)      main brand, primary actions, selected states
 *   secondary (blue)    mathematical information, graphs, links
 *   accent (coral)      challenges, games, important calls to action
 *   achievement (amber) XP, streaks, rewards
 *   success (green)     correct / completed
 *   error (red)         errors
 *
 * Colour must never be the only carrier of meaning: pair it with an icon,
 * label or pattern in components.
 *
 * `on*` roles are the text/icon colours to use on top of a filled role.
 * Coral and amber fills use dark text because white on them fails WCAG AA.
 */
export interface ColorRoles {
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;

  secondary: string;
  secondarySoft: string;
  onSecondary: string;
  link: string;

  accent: string;
  accentSoft: string;
  onAccent: string;

  achievement: string;
  achievementSoft: string;
  onAchievement: string;

  success: string;
  successSoft: string;
  onSuccess: string;

  error: string;
  errorSoft: string;
  onError: string;

  /** Icon/text colour on accentSoft / achievementSoft tiles (fills fail 3:1 there). */
  accentStrong: string;
  achievementStrong: string;

  /** Continue Learning hero: gradient fill, text and line-art colours. */
  heroStart: string;
  heroEnd: string;
  onHero: string;
  onHeroMuted: string;
  heroLine: string;
  heroCurve: string;
  heroPoint: string;
  heroTrack: string;
  heroButton: string;
  onHeroButton: string;

  /** Extremely faint line art behind screen content. */
  backdropLine: string;
  surfacePressed: string;

  tabActive: string;
  tabInactive: string;
  tabIndicator: string;
  focusRing: string;
  overlay: string;

  graph: GraphColors;
}

/** Colours reserved for mathematical visualisation (blue-led). */
export interface GraphColors {
  background: string;
  grid: string;
  axis: string;
  axisLabel: string;
  curvePrimary: string;
  curveSecondary: string;
  curveTertiary: string;
  curveQuaternary: string;
  tangent: string;
  secant: string;
  area: string;
  point: string;
  derivativePositive: string;
  derivativeNegative: string;
  derivativeZero: string;
}

export const lightColors: ColorRoles = {
  background: palette.sand,
  surface: palette.white,
  surfaceRaised: palette.white,
  surfaceMuted: palette.sandDeep,
  border: palette.border,
  borderStrong: palette.borderStrong,

  textPrimary: palette.ink,
  textSecondary: palette.slateTextAA,
  /** Non-essential or large text and icons only (3:1 threshold). */
  textMuted: palette.slateText,
  textInverse: palette.textOnDark,

  primary: palette.teal600,
  primaryPressed: palette.teal700,
  primarySoft: palette.teal50,
  onPrimary: palette.white,

  secondary: palette.blue600,
  secondarySoft: palette.blue100,
  onSecondary: palette.white,
  link: palette.blue600,

  accent: palette.coral500,
  accentSoft: palette.coral100,
  onAccent: palette.ink,

  achievement: palette.amber500,
  achievementSoft: palette.amber100,
  onAchievement: palette.ink,

  success: palette.green600,
  successSoft: palette.green100,
  // White on #16A34A is only 3.3:1, so solid success fills use near-black text.
  onSuccess: palette.inkBlack,

  error: palette.red600,
  errorSoft: palette.red100,
  onError: palette.white,

  accentStrong: palette.coral700,
  achievementStrong: palette.amber700,

  heroStart: palette.teal600,
  heroEnd: palette.teal700,
  onHero: palette.white,
  onHeroMuted: 'rgba(255, 255, 255, 0.86)',
  heroLine: 'rgba(255, 255, 255, 0.08)',
  heroCurve: 'rgba(255, 255, 255, 0.34)',
  heroPoint: palette.amber400,
  heroTrack: 'rgba(255, 255, 255, 0.24)',
  heroButton: palette.white,
  onHeroButton: palette.teal700,

  backdropLine: 'rgba(15, 118, 110, 0.07)',
  surfacePressed: palette.sandDeep,

  tabActive: palette.teal600,
  tabInactive: palette.slateText,
  tabIndicator: palette.teal50,
  focusRing: palette.blue600,
  overlay: 'rgba(15, 23, 42, 0.45)',

  graph: {
    background: palette.white,
    grid: '#EEF2F7',
    axis: '#94A3B8',
    axisLabel: palette.slateText,
    curvePrimary: palette.blue600,
    curveSecondary: palette.teal600,
    curveTertiary: palette.coral500,
    curveQuaternary: palette.amber500,
    tangent: palette.coral500,
    secant: palette.amber500,
    area: 'rgba(37, 99, 235, 0.18)',
    point: palette.blue700,
    derivativePositive: palette.green600,
    derivativeNegative: palette.red600,
    derivativeZero: palette.amber500,
  },
};

export const darkColors: ColorRoles = {
  background: palette.charcoal,
  surface: palette.slate,
  surfaceRaised: palette.slateRaised,
  surfaceMuted: '#1F2A35',
  border: palette.slateBorder,
  borderStrong: '#4B5B6B',

  textPrimary: palette.textOnDark,
  textSecondary: palette.textOnDarkSecondary,
  textMuted: palette.grey400,
  textInverse: palette.ink,

  primary: palette.teal400,
  primaryPressed: '#2DD4BF',
  primarySoft: 'rgba(20, 184, 166, 0.16)',
  onPrimary: palette.inkBlack,

  secondary: palette.blue400,
  secondarySoft: 'rgba(96, 165, 250, 0.16)',
  onSecondary: palette.inkBlack,
  link: palette.blue400,

  accent: palette.coral400,
  accentSoft: 'rgba(251, 128, 111, 0.16)',
  onAccent: palette.inkBlack,

  achievement: palette.amber400,
  achievementSoft: 'rgba(251, 191, 36, 0.16)',
  onAchievement: palette.inkBlack,

  success: palette.green400,
  successSoft: 'rgba(74, 222, 128, 0.14)',
  onSuccess: palette.inkBlack,

  error: palette.red400,
  errorSoft: 'rgba(248, 113, 113, 0.14)',
  onError: palette.inkBlack,

  accentStrong: palette.coral400,
  achievementStrong: palette.amber400,

  // Dark hero is a deeper teal so it glows less than the light-mode card.
  heroStart: palette.teal700,
  heroEnd: palette.teal800,
  onHero: palette.textOnDark,
  onHeroMuted: 'rgba(248, 250, 252, 0.84)',
  heroLine: 'rgba(153, 246, 228, 0.08)',
  heroCurve: 'rgba(153, 246, 228, 0.32)',
  heroPoint: palette.amber400,
  heroTrack: 'rgba(248, 250, 252, 0.18)',
  heroButton: palette.teal400,
  onHeroButton: palette.inkBlack,

  backdropLine: 'rgba(20, 184, 166, 0.06)',
  surfacePressed: palette.slateRaised,

  tabActive: palette.teal400,
  tabInactive: palette.grey400,
  tabIndicator: 'rgba(20, 184, 166, 0.16)',
  focusRing: palette.blue400,
  overlay: 'rgba(0, 0, 0, 0.6)',

  graph: {
    background: palette.slate,
    grid: '#2C3A47',
    axis: '#64748B',
    axisLabel: palette.textOnDarkSecondary,
    curvePrimary: palette.blue400,
    curveSecondary: palette.teal400,
    curveTertiary: palette.coral400,
    curveQuaternary: palette.amber400,
    tangent: palette.coral400,
    secant: palette.amber400,
    area: 'rgba(96, 165, 250, 0.22)',
    point: '#93C5FD',
    derivativePositive: palette.green400,
    derivativeNegative: palette.red400,
    derivativeZero: palette.amber400,
  },
};

/** High-contrast overrides: stronger text, borders and darker brand fills. */
export const highContrastLightOverrides: Partial<ColorRoles> = {
  textSecondary: palette.slateTextDark,
  textMuted: palette.slateTextDark,
  border: palette.borderStrong,
  borderStrong: palette.slateText,
  primary: palette.teal700,
  secondary: palette.blue700,
  link: palette.blue700,
  tabActive: palette.teal700,
  tabInactive: palette.slateTextDark,
};

export const highContrastDarkOverrides: Partial<ColorRoles> = {
  background: palette.inkBlack,
  textSecondary: palette.textOnDark,
  textMuted: palette.textOnDarkSecondary,
  border: '#64748B',
  tabInactive: palette.textOnDarkSecondary,
};

/**
 * Sign-in provider brand colours. Fixed by Google / Apple guidelines, so they
 * do not change with the app theme (Apple's button inverts in dark mode).
 */
export const providerBrandColors = {
  google: {
    blue: palette.googleBlue,
    red: palette.googleRed,
    yellow: palette.googleYellow,
    green: palette.googleGreen,
    text: palette.googleText,
    darkFill: palette.googleDarkFill,
    darkStroke: palette.googleDarkStroke,
    darkText: palette.googleDarkText,
  },
  apple: { black: palette.appleBlack, white: palette.white },
} as const;
