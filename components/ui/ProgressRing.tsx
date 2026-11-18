import Svg, { Circle } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';

interface ProgressRingProps {
  /** 0–100 */
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/** Small decorative ring; pair it with the number as text (never colour alone). */
export function ProgressRing({ percent, size = 22, strokeWidth = 3, color }: ProgressRingProps) {
  const theme = useAppTheme();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={theme.colors.surfaceMuted}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* At 0% the round cap of an empty arc would draw a stray dot, so only the track shows. */}
      {clamped > 0 ? (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? theme.colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
    </Svg>
  );
}
