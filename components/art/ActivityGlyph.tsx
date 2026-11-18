import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { toneColors } from '@/components/ui/tones';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type PlotFrame, plotFunction, plotParametric, tangentSegment, toCanvas } from '@/lib/art/curves';
import type { AccentTone, ActivityGlyphName } from '@/types/dashboard';

const BOX: PlotFrame = { xMin: -1, xMax: 1, yMin: -1, yMax: 1, left: 10, top: 10, width: 44, height: 44 };

interface Shape {
  paths: { d: string; dashed?: boolean; faint?: boolean; width?: number }[];
  dots: { at: [number, number]; open?: boolean }[];
  axes?: boolean;
}

function buildShape(name: ActivityGlyphName): Shape {
  switch (name) {
    case 'tangent': {
      const f = (x: number) => 0.9 * x * x - 0.6;
      const t = tangentSegment(f, 0.45, 0.6, BOX);
      return { axes: true, paths: [{ d: plotFunction(f, BOX) }, { d: t.path, dashed: true }], dots: [{ at: t.point }] };
    }
    case 'function-art':
      return {
        paths: [
          {
            d: plotParametric(
              (t) => Math.cos(2 * t) * Math.cos(t),
              (t) => Math.cos(2 * t) * Math.sin(t),
              BOX,
            ),
          },
          {
            d: plotParametric(
              (t) => 0.45 * Math.cos(t),
              (t) => 0.45 * Math.sin(t),
              BOX,
            ),
            faint: true,
          },
        ],
        dots: [{ at: toCanvas(BOX, 0, 0) }],
      };
    case 'match': {
      const top = { ...BOX, top: 8, height: 22 };
      const bottom = { ...BOX, top: 34, height: 22 };
      return {
        paths: [
          { d: plotFunction((x) => x * x * x - x, top) },
          { d: plotFunction((x) => 3 * x * x - 1, { ...bottom, yMin: -1.2, yMax: 2.2 }), dashed: true },
        ],
        dots: [],
      };
    }
    case 'limits': {
      const f = (x: number) => 0.18 / (1.05 - x) - 0.75;
      return {
        axes: true,
        paths: [
          { d: plotFunction(f, { ...BOX, xMax: 0.88 }) },
          { d: `M${toCanvas(BOX, 1, -1).join(' ')} L${toCanvas(BOX, 1, 1).join(' ')}`, dashed: true, faint: true },
        ],
        dots: [{ at: toCanvas(BOX, -0.3, f(-0.3)), open: true }],
      };
    }
    case 'practice': {
      const pts = [-0.75, -0.25, 0.25, 0.75].map((x) => toCanvas(BOX, x, x * 0.9));
      return {
        axes: true,
        paths: [{ d: plotFunction((x) => x * 0.9, BOX), faint: true }],
        dots: pts.map((at) => ({ at })),
      };
    }
    case 'wave':
      return {
        axes: true,
        paths: [{ d: plotFunction((x) => 0.6 * Math.sin(x * Math.PI * 1.5), BOX) }],
        dots: [],
      };
  }
}

interface ActivityGlyphProps {
  name: ActivityGlyphName;
  tone: AccentTone;
  size?: number;
  /** Draw on a tinted tile (default) or transparent, for larger art areas. */
  tile?: boolean;
}

/** Small mathematical illustration (tangent, rose curve, limit …) in an accent tone. */
export function ActivityGlyph({ name, tone, size = 40, tile = true }: ActivityGlyphProps) {
  const theme = useAppTheme();
  const { soft, strong } = toneColors(theme, tone);
  const shape = useMemo(() => buildShape(name), [name]);
  const [ox, oy] = toCanvas(BOX, 0, 0);

  return (
    <View
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: tile ? Math.round(size * 0.28) : 0,
        backgroundColor: tile ? soft : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {shape.axes ? (
          <G stroke={strong} strokeOpacity={0.25} strokeWidth={1.2}>
            <Line x1={8} y1={oy} x2={56} y2={oy} />
            <Line x1={ox} y1={8} x2={ox} y2={56} />
          </G>
        ) : null}
        {shape.paths.map((p) => (
          <Path
            key={p.d}
            d={p.d}
            stroke={strong}
            strokeOpacity={p.faint ? 0.4 : 1}
            strokeWidth={p.width ?? 2.6}
            strokeDasharray={p.dashed ? '4 3' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
        {shape.dots.map((dot) => (
          <Circle
            key={dot.at.join(',')}
            cx={dot.at[0]}
            cy={dot.at[1]}
            r={3.4}
            fill={dot.open ? soft : strong}
            stroke={strong}
            strokeWidth={dot.open ? 2 : 0}
          />
        ))}
      </Svg>
    </View>
  );
}
