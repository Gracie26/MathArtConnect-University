import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';
import { type PlotFrame, plotFunction, plotParametric, tangentSegment } from '@/lib/art/curves';

/** The artwork's own drawing area; the card places it beside or above the text, never under it. */
const W = 200;
const H = 180;
const GRID = 20;

// A cubic with two turning points, so the tangent tells a slope story.
const f = (x: number) => 0.35 * x * x * x - 1.6 * x;
const frame: PlotFrame = { xMin: -2.6, xMax: 2.6, yMin: -2.6, yMax: 2.6, left: 20, top: 8, width: 168, height: 164 };

/** The Continue Learning card's gradient fill, covering the whole card. */
export function HeroFill() {
  const { colors } = useAppTheme();
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1 1">
      <Defs>
        <LinearGradient id="heroFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.heroStart} />
          <Stop offset="1" stopColor={colors.heroEnd} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={1} height={1} fill="url(#heroFill)" />
    </Svg>
  );
}

/**
 * Decoration for the Continue Learning card: a faint coordinate grid, the
 * graph of a cubic with a tangent line, and a small Lissajous figure. It fills
 * the box it is given (anchored right) and the card keeps text out of that box.
 */
export function HeroCurvesArt() {
  const { colors } = useAppTheme();

  const art = useMemo(() => {
    const curve = plotFunction(f, frame, 64);
    const tangent = tangentSegment(f, 1.75, 0.75, frame);
    const lissajous = plotParametric(
      (t) => Math.sin(3 * t),
      (t) => Math.sin(2 * t),
      { xMin: -1, xMax: 1, yMin: -1, yMax: 1, left: 146, top: 4, width: 44, height: 32 },
    );
    return { curve, tangent, lissajous };
  }, []);

  const gridX = [];
  for (let x = 0; x <= W; x += GRID) gridX.push(x);
  const gridY = [];
  for (let y = 0; y <= H; y += GRID) gridY.push(y);
  const axisX = frame.left + frame.width / 2;
  const axisY = frame.top + frame.height / 2;

  return (
    // Decorative: hidden from screen readers (on the wrapper, so web gets no unknown SVG props).
    <View style={styles.fill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMid meet">
        <Defs>
          {/* Fades the grid in from the left so it never forms a hard edge. */}
          <LinearGradient id="gridFade" gradientUnits="userSpaceOnUse" x1={0} y1="0" x2={90} y2="0">
            <Stop offset="0" stopColor={colors.heroLine} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.heroLine} stopOpacity={1} />
          </LinearGradient>
        </Defs>

        <G stroke="url(#gridFade)" strokeWidth={1}>
          {gridX.map((x) => (
            <Line key={`gx${x}`} x1={x} y1={0} x2={x} y2={H} />
          ))}
          {gridY.map((y) => (
            <Line key={`gy${y}`} x1={0} y1={y} x2={W} y2={y} />
          ))}
        </G>
        <G stroke={colors.heroCurve} strokeWidth={1} strokeOpacity={0.55}>
          <Line x1={40} y1={axisY} x2={W} y2={axisY} />
          <Line x1={axisX} y1={0} x2={axisX} y2={H} />
        </G>

        <Path d={art.lissajous} stroke={colors.heroCurve} strokeWidth={1.2} fill="none" strokeOpacity={0.7} />
        <Path d={art.curve} stroke={colors.heroCurve} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path
          d={art.tangent.path}
          stroke={colors.heroPoint}
          strokeWidth={1.8}
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <Circle cx={art.tangent.point[0]} cy={art.tangent.point[1]} r={9} fill={colors.heroPoint} fillOpacity={0.22} />
        <Circle cx={art.tangent.point[0]} cy={art.tangent.point[1]} r={4.5} fill={colors.heroPoint} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
