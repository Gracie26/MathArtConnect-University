import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';

interface LogoMarkProps {
  size?: number;
}

/**
 * MathArt Connect mark: a smooth curve rising through a highlighted point on
 * a teal tile, where mathematics meets a single artistic stroke.
 */
export function LogoMark({ size = 30 }: LogoMarkProps) {
  const theme = useAppTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect x={0} y={0} width={32} height={32} rx={9} fill={theme.colors.primary} />
      <Path
        d="M6 23 C 11 23 12 9 17.5 9 C 22 9 23 16 26.5 16"
        stroke={theme.colors.onPrimary}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={17.5} cy={9} r={2.6} fill={theme.colors.heroPoint} />
    </Svg>
  );
}
