import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { type ColorRoles, headingVariants, type TypographyVariant } from '@/theme';

/** Any flat colour role (the nested graph palette is for visualisations only). */
export type TextColorRole = Exclude<keyof ColorRoles, 'graph'>;

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColorRole;
}

/** Themed text. Heading variants are exposed to screen readers as headers. */
export function AppText({ variant = 'body', color = 'textPrimary', style, accessibilityRole, ...rest }: AppTextProps) {
  const theme = useAppTheme();
  const isHeading = headingVariants.includes(variant);

  return (
    <Text
      accessibilityRole={accessibilityRole ?? (isHeading ? 'header' : undefined)}
      maxFontSizeMultiplier={isHeading ? 1.4 : 1.8}
      style={[theme.typography[variant], { color: theme.colors[color] }, styles.base, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
