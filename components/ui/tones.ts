import type { AppTheme } from '@/theme';
import type { AccentTone } from '@/types/dashboard';

export interface ToneColors {
  /** Tinted tile background. */
  soft: string;
  /** Icon / text / line colour that stays legible on `soft`. */
  strong: string;
}

/** Maps an accent family to theme roles (blue = maths, coral = games, teal = create, amber = practice). */
export function toneColors(theme: AppTheme, tone: AccentTone): ToneColors {
  const { colors } = theme;
  switch (tone) {
    case 'blue':
      return { soft: colors.secondarySoft, strong: colors.secondary };
    case 'coral':
      return { soft: colors.accentSoft, strong: colors.accentStrong };
    case 'teal':
      return { soft: colors.primarySoft, strong: colors.primary };
    case 'amber':
      return { soft: colors.achievementSoft, strong: colors.achievementStrong };
  }
}
