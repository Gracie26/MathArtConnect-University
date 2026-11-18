import { useMemo } from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';
import { type PlotFrame, plotFunction, plotParametric, tangentSegment, toCanvas } from '@/lib/art/curves';

export type OnboardingArtName = 'differently' | 'explore' | 'create' | 'practise';

const W = 300;
const H = 240;

const DIFFERENTLY_FRAME: PlotFrame = {
  xMin: 0,
  xMax: Math.PI * 2,
  yMin: -1.4,
  yMax: 1.4,
  left: 30,
  top: 50,
  width: 240,
  height: 140,
};
const EXPLORE_FRAME: PlotFrame = {
  xMin: -2.2,
  xMax: 2.2,
  yMin: -1.6,
  yMax: 2.6,
  left: 40,
  top: 26,
  width: 220,
  height: 160,
};
const CREATE_FRAME: PlotFrame = {
  xMin: -1.15,
  xMax: 1.15,
  yMin: -1.15,
  yMax: 1.15,
  left: 55,
  top: 25,
  width: 190,
  height: 190,
};
const parabola = (x: number) => 0.5 * x * x - 0.6;

/** Soft circular stage behind each illustration. */
function Stage({ color }: { color: string }) {
  return <Circle cx={W / 2} cy={H / 2} r={108} fill={color} />;
}

function DifferentlyArt() {
  const { colors } = useAppTheme();
  const frame = DIFFERENTLY_FRAME;
  const waves = useMemo(
    () => [0, 0.7, 1.4, 2.1].map((phase, i) => plotFunction((x) => Math.sin(x + phase) * (1 - i * 0.18), frame, 64)),
    [frame],
  );
  const strokes = [colors.secondary, colors.primary, colors.accent, colors.achievement];
  const point = toCanvas(frame, Math.PI / 2, 1);

  return (
    <>
      <Stage color={colors.primarySoft} />
      <G stroke={colors.border} strokeWidth={1}>
        {[70, 120, 170].map((y) => (
          <Line key={y} x1={40} y1={y} x2={260} y2={y} />
        ))}
        {[90, 150, 210].map((x) => (
          <Line key={x} x1={x} y1={30} x2={x} y2={210} />
        ))}
      </G>
      {waves.map((d, i) => (
        <Path key={i} d={d} stroke={strokes[i]} strokeWidth={3 - i * 0.4} strokeLinecap="round" fill="none" />
      ))}
      <Circle cx={point[0]} cy={point[1]} r={7} fill={colors.surface} stroke={colors.secondary} strokeWidth={3} />
    </>
  );
}

function ExploreArt() {
  const { colors } = useAppTheme();
  const frame = EXPLORE_FRAME;
  const curve = useMemo(() => plotFunction(parabola, frame, 64), [frame]);
  const tangent = useMemo(() => tangentSegment(parabola, 1.15, 0.9, frame), [frame]);
  const [ox, oy] = toCanvas(frame, 0, 0);
  const [px, py] = tangent.point;

  return (
    <>
      <Stage color={colors.secondarySoft} />
      <G stroke={colors.textMuted} strokeWidth={1.5} strokeOpacity={0.6}>
        <Line x1={40} y1={oy} x2={260} y2={oy} />
        <Line x1={ox} y1={22} x2={ox} y2={190} />
      </G>
      <G stroke={colors.secondary} strokeWidth={1.2} strokeDasharray="4 4" strokeOpacity={0.7}>
        <Line x1={px} y1={py} x2={px} y2={oy} />
        <Line x1={px} y1={py} x2={ox} y2={py} />
      </G>
      <Path d={curve} stroke={colors.secondary} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <Path d={tangent.path} stroke={colors.accent} strokeWidth={2.4} strokeLinecap="round" />
      <Circle cx={px} cy={py} r={15} fill={colors.secondary} fillOpacity={0.18} />
      <Circle cx={px} cy={py} r={8} fill={colors.surface} stroke={colors.secondary} strokeWidth={3.5} />
      {/* Parameter slider */}
      <Rect x={80} y={210} width={140} height={6} rx={3} fill={colors.border} />
      <Rect x={80} y={210} width={92} height={6} rx={3} fill={colors.secondary} />
      <Circle cx={172} cy={213} r={9} fill={colors.surface} stroke={colors.secondary} strokeWidth={3} />
    </>
  );
}

function CreateArt() {
  const { colors } = useAppTheme();
  const frame = CREATE_FRAME;
  const roses = useMemo(
    () => [
      plotParametric(
        (t) => Math.cos(5 * t) * Math.cos(t),
        (t) => Math.cos(5 * t) * Math.sin(t),
        frame,
        0,
        Math.PI,
        240,
      ),
      plotParametric(
        (t) => 0.62 * Math.cos(3 * t) * Math.cos(t + Math.PI / 6),
        (t) => 0.62 * Math.cos(3 * t) * Math.sin(t + Math.PI / 6),
        frame,
        0,
        Math.PI,
        180,
      ),
      plotParametric(
        (t) => 0.3 * Math.cos(t),
        (t) => 0.3 * Math.sin(t),
        frame,
      ),
    ],
    [frame],
  );

  return (
    <>
      <Stage color={colors.primarySoft} />
      <Path d={roses[0]} stroke={colors.primary} strokeWidth={2.6} fill="none" strokeLinejoin="round" />
      <Path d={roses[1]} stroke={colors.accent} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
      <Path d={roses[2]} stroke={colors.achievement} strokeWidth={2} fill="none" />
      <Circle cx={W / 2} cy={H / 2} r={4} fill={colors.primary} />
    </>
  );
}

function PractiseArt() {
  const { colors } = useAppTheme();
  const r = 34;
  const c = 2 * Math.PI * r;
  const rows = [0, 1, 2];

  return (
    <>
      <Stage color={colors.achievementSoft} />
      {/* Practice card */}
      <Rect x={58} y={44} width={150} height={150} rx={18} fill={colors.surface} stroke={colors.border} />
      {rows.map((i) => {
        const y = 78 + i * 38;
        const done = i < 2;
        return (
          <G key={i}>
            <Circle
              cx={84}
              cy={y}
              r={10}
              fill={done ? colors.success : colors.surface}
              stroke={done ? colors.success : colors.borderStrong}
              strokeWidth={2}
            />
            {done ? (
              <Path
                d={`M79 ${y} l3.5 3.5 l6.5 -7`}
                stroke={colors.onSuccess}
                strokeWidth={2.4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            <Rect x={104} y={y - 8} width={i === 2 ? 60 : 84} height={7} rx={3.5} fill={colors.border} />
            <Rect x={104} y={y + 3} width={i === 2 ? 40 : 56} height={5} rx={2.5} fill={colors.surfaceMuted} />
          </G>
        );
      })}
      {/* Progress ring */}
      <G transform="translate(222 92)">
        <Circle r={r + 10} fill={colors.surface} stroke={colors.border} />
        <Circle r={r} stroke={colors.surfaceMuted} strokeWidth={8} fill="none" />
        <Circle
          r={r}
          stroke={colors.primary}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * 0.68} ${c}`}
          transform="rotate(-90)"
        />
      </G>
      {/* Hint bubble */}
      <G transform="translate(206 168)">
        <Rect x={0} y={0} width={58} height={44} rx={14} fill={colors.achievement} />
        <Circle cx={29} cy={18} r={8} fill="none" stroke={colors.onAchievement} strokeWidth={2.4} />
        <Line x1={25} y1={30} x2={33} y2={30} stroke={colors.onAchievement} strokeWidth={2.4} strokeLinecap="round" />
      </G>
    </>
  );
}

/** Original line art for each onboarding page (no stock imagery). Decorative. */
export function OnboardingArt({ name, size = 280 }: { name: OnboardingArtName; size?: number }) {
  const Art = { differently: DifferentlyArt, explore: ExploreArt, create: CreateArt, practise: PractiseArt }[name];
  return (
    <Svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Art />
    </Svg>
  );
}
