/**
 * Raw brand palette. Only theme/tokens/colors.ts should import this file;
 * screens and components use semantic roles from the active theme instead.
 *
 * Brand rule: no purple, violet or indigo as brand colours.
 */
export const palette = {
  // Primary: Deep Teal
  teal800: '#134E4A',
  teal700: '#115E59',
  teal600: '#0F766E',
  teal400: '#14B8A6',
  teal100: '#CCFBF1',
  teal50: '#F0FDFA',

  // Secondary: Modern Blue (mathematics, graphs)
  blue700: '#1D4ED8',
  blue600: '#2563EB',
  blue400: '#60A5FA',
  blue100: '#DBEAFE',

  // Accent: Warm Coral (challenge, interaction)
  coral700: '#C2410C',
  coral500: '#F97360',
  coral400: '#FB806F',
  coral100: '#FFE4DE',

  // Achievement: Amber (XP, streaks, rewards)
  amber700: '#B45309',
  amber500: '#F59E0B',
  amber400: '#FBBF24',
  amber100: '#FEF3C7',

  // Success: Emerald
  green700: '#15803D',
  green600: '#16A34A',
  green400: '#4ADE80',
  green100: '#DCFCE7',

  // Error: Modern Red
  red700: '#B91C1C',
  red600: '#DC2626',
  red400: '#F87171',
  red100: '#FEE2E2',

  // Neutrals
  sand: '#F7F4EF',
  sandDeep: '#EFEAE2',
  white: '#FFFFFF',
  ink: '#1F2937',
  inkBlack: '#0B1117',
  slateText: '#64748B',
  /** #64748B fails AA (4.34:1) for body text on Soft Sand; this passes on sand, white and muted surfaces. */
  slateTextAA: '#5B6A80',
  slateTextDark: '#475569',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  charcoal: '#18212B',
  slate: '#24313D',
  slateRaised: '#2E3D4B',
  slateBorder: '#364655',
  textOnDark: '#F8FAFC',
  textOnDarkSecondary: '#CBD5E1',
  grey400: '#94A3B8',

  // Third-party brand marks (sign-in buttons only; required by provider guidelines).
  googleBlue: '#4285F4',
  googleRed: '#EA4335',
  googleYellow: '#FBBC05',
  googleGreen: '#34A853',
  googleText: '#1F1F1F',
  // Google's dark-theme button (fill, stroke, text).
  googleDarkFill: '#131314',
  googleDarkStroke: '#8E918F',
  googleDarkText: '#E3E3E3',
  appleBlack: '#000000',
} as const;

export type PaletteKey = keyof typeof palette;
