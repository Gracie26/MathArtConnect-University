import type { TextStyle } from 'react-native';

/**
 * Font families. Inter for interface text; JetBrains Mono for mathematical
 * labels and typed expressions (clear distinction of x, ×, 1, l, 0, O).
 * Names must match the keys passed to useFonts() in app/_layout.tsx.
 */
export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'stat'
  | 'bodyLarge'
  | 'body'
  | 'caption'
  | 'small'
  | 'eyebrow'
  | 'button'
  | 'mathLabel';

type TypographyToken = Required<Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight'>> &
  Pick<TextStyle, 'letterSpacing'>;

export const typography: Record<TypographyVariant, TypographyToken> = {
  display: { fontFamily: fontFamilies.bold, fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontFamily: fontFamilies.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontFamily: fontFamilies.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  h3: { fontFamily: fontFamilies.semibold, fontSize: 18, lineHeight: 24 },
  /** Compact bold card / list-row titles. */
  title: { fontFamily: fontFamilies.semibold, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  /** Numbers in stat rows. */
  stat: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 22, letterSpacing: -0.2 },
  bodyLarge: { fontFamily: fontFamilies.regular, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fontFamilies.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16 },
  /** Uppercase section labels, e.g. "CONTINUE LEARNING". */
  eyebrow: { fontFamily: fontFamilies.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1 },
  button: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 20, letterSpacing: 0.1 },
  mathLabel: { fontFamily: fontFamilies.mono, fontSize: 15, lineHeight: 22 },
};

/** Heading variants are announced as headers to screen readers. */
export const headingVariants: readonly TypographyVariant[] = ['display', 'h1', 'h2', 'h3'];
