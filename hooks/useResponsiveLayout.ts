import { useWindowDimensions } from 'react-native';

import { breakpoints, layout } from '@/theme';

export interface ResponsiveLayout {
  width: number;
  /** ≥ 600 dp: tablets and small desktop windows. */
  isTablet: boolean;
  /** ≥ 960 dp: desktop web; dashboard switches to two columns. */
  isWide: boolean;
  gutter: number;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;
  return {
    width,
    isTablet,
    isWide: width >= breakpoints.desktop,
    gutter: isTablet ? layout.screenGutterWide : layout.screenGutter,
  };
}
