import { memo, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText, TSpan } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  type FigureItem,
  type FigureScene,
  type FigureSpec,
  type FillTone,
  labelRuns,
  type StrokeTone,
} from '@/lib/figures/scene';

/** Number array (not a string) so dashes look the same on iOS, Android and web. */
const DASH = [6, 4];
const SAMPLES = 240;

interface Palette {
  stroke: Record<StrokeTone, string>;
  fill: Record<FillTone, string>;
  rectStroke: string;
  axis: string;
  label: string;
  grid: string;
}

function usePalette(): Palette {
  const theme = useAppTheme();
  const g = theme.colors.graph;
  return {
    stroke: {
      curve: g.curveTertiary,
      curve2: g.curvePrimary,
      edge: theme.colors.textPrimary,
      asymptote: theme.colors.secondary,
      guide: g.axis,
      text: theme.colors.textPrimary,
    },
    fill: { fill: theme.colors.accentSoft, fill2: g.area, fill3: theme.colors.achievementSoft },
    rectStroke: theme.colors.textPrimary,
    axis: g.axisLabel,
    label: theme.colors.textPrimary,
    grid: g.grid,
  };
}

interface Mapper {
  px: (x: number) => number;
  py: (y: number) => number;
  width: number;
  height: number;
}

function mapperFor(scene: FigureScene, width: number): Mapper {
  const height = width * scene.aspect;
  const { xMin, xMax, yMin, yMax } = scene.view;
  return {
    px: (x) => ((x - xMin) / (xMax - xMin)) * width,
    py: (y) => (1 - (y - yMin) / (yMax - yMin)) * height,
    width,
    height,
  };
}

/** Values far outside the view are clamped so a curve still runs off the edge (e.g. up an asymptote). */
function clampY(scene: FigureScene, y: number): number {
  const span = scene.view.yMax - scene.view.yMin;
  return Math.max(scene.view.yMin - span, Math.min(scene.view.yMax + span, y));
}

function curvePath(scene: FigureScene, m: Mapper, f: (x: number) => number, from: number, to: number): string {
  let d = '';
  let pen = false;
  for (let i = 0; i <= SAMPLES; i++) {
    const x = from + ((to - from) * i) / SAMPLES;
    const y = f(x);
    if (!Number.isFinite(y)) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${m.px(x).toFixed(2)},${m.py(clampY(scene, y)).toFixed(2)}`;
    pen = true;
  }
  return d;
}

function areaPath(
  scene: FigureScene,
  m: Mapper,
  f: (x: number) => number,
  base: (x: number) => number,
  from: number,
  to: number,
): string {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = from + ((to - from) * i) / SAMPLES;
    const y = f(x);
    const y0 = base(x);
    if (!Number.isFinite(y) || !Number.isFinite(y0)) continue;
    top.push(`${m.px(x).toFixed(2)},${m.py(clampY(scene, y)).toFixed(2)}`);
    bottom.unshift(`${m.px(x).toFixed(2)},${m.py(clampY(scene, y0)).toFixed(2)}`);
  }
  if (top.length === 0) return '';
  return `M${top.join('L')}L${bottom.join('L')}Z`;
}

function arrowHead(x: number, y: number, fromX: number, fromY: number, size: number): string {
  const angle = Math.atan2(y - fromY, x - fromX);
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  return `M${x},${y}L${x + size * Math.cos(a1)},${y + size * Math.sin(a1)}L${x + size * Math.cos(a2)},${y + size * Math.sin(a2)}Z`;
}

/** A curly brace between two screen points, bulging to the left of the direction of travel. */
function bracePath(x1: number, y1: number, x2: number, y2: number, w: number): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const tx = (x2 - x1) / len;
  const ty = (y2 - y1) / len;
  const nx = ty;
  const ny = -tx;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const p = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const s = Math.min(w, len / 4);
  return [
    `M${p(x1, y1)}`,
    `Q${p(x1 + nx * w, y1 + ny * w)} ${p(x1 + tx * s + nx * w, y1 + ty * s + ny * w)}`,
    `L${p(mx - tx * s + nx * w, my - ty * s + ny * w)}`,
    `Q${p(mx + nx * w, my + ny * w)} ${p(mx + nx * 2 * w, my + ny * 2 * w)}`,
    `Q${p(mx + nx * w, my + ny * w)} ${p(mx + tx * s + nx * w, my + ty * s + ny * w)}`,
    `L${p(x2 - tx * s + nx * w, y2 - ty * s + ny * w)}`,
    `Q${p(x2 + nx * w, y2 + ny * w)} ${p(x2, y2)}`,
  ].join('');
}

const FONT_SIZE = { small: 11, normal: 13, large: 15 } as const;

function Label({
  x,
  y,
  text,
  anchor = 'middle',
  size,
  color,
  font,
  italic,
}: {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  size: number;
  color: string;
  font: string;
  italic?: boolean;
}) {
  const runs = labelRuns(text);
  // Each run's vertical offset relative to the previous run (computed before rendering).
  const offsets = runs.map((run) => (run.script === 'sub' ? size * 0.32 : run.script === 'sup' ? -size * 0.42 : 0));
  return (
    <SvgText
      x={x}
      y={y}
      fill={color}
      fontSize={size}
      fontFamily={font}
      fontStyle={italic ? 'italic' : 'normal'}
      textAnchor={anchor}
    >
      {runs.map((run, index) => {
        const dy = (offsets[index] ?? 0) - (index > 0 ? (offsets[index - 1] ?? 0) : 0);
        return (
          <TSpan key={index} dy={dy} fontSize={run.script === 'none' ? size : size * 0.72}>
            {run.text}
          </TSpan>
        );
      })}
    </SvgText>
  );
}

function SceneItem({
  item,
  scene,
  m,
  palette,
  font,
  scale,
}: {
  item: FigureItem;
  scene: FigureScene;
  m: Mapper;
  palette: Palette;
  font: string;
  scale: number;
}) {
  switch (item.k) {
    case 'curve': {
      const color = palette.stroke[item.tone ?? 'curve'];
      const d = curvePath(scene, m, item.f, item.from, item.to);
      const head = (x: number, dir: 1 | -1) => {
        const y = item.f(x);
        const back = x - dir * ((item.to - item.from) / 60);
        return arrowHead(m.px(x), m.py(y), m.px(back), m.py(item.f(back)), 8 * scale);
      };
      return (
        <G>
          <Path
            d={d}
            stroke={color}
            strokeWidth={2.4 * scale}
            fill="none"
            strokeDasharray={item.dashed ? DASH : undefined}
          />
          {item.arrows === 'end' || item.arrows === 'both' ? <Path d={head(item.to, 1)} fill={color} /> : null}
          {item.arrows === 'start' || item.arrows === 'both' ? <Path d={head(item.from, -1)} fill={color} /> : null}
        </G>
      );
    }
    case 'area':
      return (
        <Path
          d={areaPath(scene, m, item.f, item.base ?? (() => 0), item.from, item.to)}
          fill={palette.fill[item.tone ?? 'fill']}
        />
      );
    case 'rect': {
      const x = m.px(item.x0);
      const w = m.px(item.x1) - x;
      const top = m.py(Math.max(item.height, item.y0 ?? 0));
      const bottom = m.py(Math.min(item.height, item.y0 ?? 0));
      return (
        <Rect
          x={x}
          y={top}
          width={w}
          height={bottom - top}
          fill={item.outlineOnly ? 'none' : palette.fill[item.tone ?? 'fill']}
          stroke={palette.rectStroke}
          strokeWidth={1.1 * scale}
        />
      );
    }
    case 'segment': {
      const color = palette.stroke[item.tone ?? 'edge'];
      const [x1, y1, x2, y2] = [m.px(item.x1), m.py(item.y1), m.px(item.x2), m.py(item.y2)];
      return (
        <G>
          <Line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={(item.width ?? 1.6) * scale}
            strokeDasharray={item.dashed ? DASH : undefined}
          />
          {item.arrow === 'end' || item.arrow === 'both' ? (
            <Path d={arrowHead(x2, y2, x1, y1, 7 * scale)} fill={color} />
          ) : null}
          {item.arrow === 'start' || item.arrow === 'both' ? (
            <Path d={arrowHead(x1, y1, x2, y2, 7 * scale)} fill={color} />
          ) : null}
        </G>
      );
    }
    case 'label':
      return (
        <Label
          x={m.px(item.x)}
          y={m.py(item.y)}
          text={item.text}
          anchor={item.anchor}
          size={FONT_SIZE[item.size ?? 'normal'] * scale}
          color={item.tone ? palette.stroke[item.tone] : palette.label}
          font={font}
          italic={item.italic}
        />
      );
    case 'brace':
      return (
        <Path
          d={bracePath(m.px(item.x1), m.py(item.y1), m.px(item.x2), m.py(item.y2), 5 * scale)}
          stroke={palette.label}
          strokeWidth={1.2 * scale}
          fill="none"
        />
      );
    case 'point':
      return <Circle cx={m.px(item.x)} cy={m.py(item.y)} r={3.5 * scale} fill={palette.stroke[item.tone ?? 'curve']} />;
    case 'node': {
      const [cx, cy] = [m.px(item.x), m.py(item.y)];
      const r = Math.abs(m.px(item.x + item.r) - cx);
      const size = FONT_SIZE.normal * scale;
      return (
        <G>
          <Circle cx={cx} cy={cy} r={r} stroke={palette.label} strokeWidth={1.3 * scale} fill="none" />
          <Label
            x={cx}
            y={cy + size * 0.35}
            text={item.text}
            anchor="middle"
            size={size}
            color={palette.label}
            font={font}
            italic
          />
        </G>
      );
    }
    case 'polyline': {
      // A new subpath starts after every point that is not finite.
      let d = '';
      let pen = false;
      for (const [x, y] of item.points) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          pen = false;
          continue;
        }
        d += `${pen ? 'L' : 'M'}${m.px(x).toFixed(1)},${m.py(y).toFixed(1)}`;
        pen = true;
      }
      return d ? (
        <Path
          d={d}
          stroke={palette.stroke[item.tone ?? 'curve']}
          strokeWidth={(item.width ?? 1.6) * scale}
          strokeOpacity={item.opacity ?? 1}
          strokeDasharray={item.dashed ? DASH : undefined}
          strokeLinejoin="round"
          fill="none"
        />
      ) : null;
    }
    case 'polygon': {
      if (item.points.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) return null;
      const d = `${item.points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${m.px(x).toFixed(1)},${m.py(y).toFixed(1)}`).join('')}Z`;
      return (
        <Path
          d={d}
          fill={palette.fill[item.tone ?? 'fill']}
          fillOpacity={item.opacity ?? 1}
          stroke={item.outline ? palette.stroke[item.outline] : 'none'}
          strokeWidth={0.8 * scale}
          strokeLinejoin="round"
        />
      );
    }
    case 'polygons': {
      // One SVG path for all the polygons: a single native view however many cells there are.
      let d = '';
      for (const poly of item.polys) {
        if (poly.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) continue;
        poly.forEach(([x, y], i) => {
          d += `${i === 0 ? 'M' : 'L'}${m.px(x).toFixed(1)},${m.py(y).toFixed(1)}`;
        });
        d += 'Z';
      }
      return d ? <Path d={d} fill={palette.fill[item.tone ?? 'fill']} fillOpacity={item.opacity ?? 1} /> : null;
    }
    case 'fraction': {
      const [cx, cy] = [m.px(item.x), m.py(item.y)];
      const size = FONT_SIZE.normal * scale;
      const half = Math.max(item.num.length, item.den.length) * size * 0.32;
      return (
        <G>
          <Label
            x={cx}
            y={cy - size * 0.35}
            text={item.num}
            anchor="middle"
            size={size}
            color={palette.label}
            font={font}
            italic
          />
          <Line x1={cx - half} y1={cy} x2={cx + half} y2={cy} stroke={palette.label} strokeWidth={1.1 * scale} />
          <Label
            x={cx}
            y={cy + size * 1.05}
            text={item.den}
            anchor="middle"
            size={size}
            color={palette.label}
            font={font}
            italic
          />
        </G>
      );
    }
  }
}

/** One panel of a figure, drawn at the given width. */
export const ScenePanel = memo(function ScenePanel({ scene, width }: { scene: FigureScene; width: number }) {
  const theme = useAppTheme();
  const palette = usePalette();
  const m = useMemo(() => mapperFor(scene, width), [scene, width]);
  // Labels and strokes keep a readable size on small phones and do not balloon on tablets.
  const scale = Math.max(0.85, Math.min(1.15, width / 340));
  const { view, axes } = scene;
  const font = theme.fontFamilies.regular;
  const axisColor = palette.axis;
  const showX = axes.x !== false && view.yMin <= 0 && view.yMax >= 0;
  const showY = axes.y !== false && view.xMin <= 0 && view.xMax >= 0;
  const x0 = m.px(0);
  const y0 = m.py(0);
  const small = FONT_SIZE.small * scale;
  const normal = FONT_SIZE.normal * scale;

  // Tick rows sit on their axis, or along the bottom / left edge when that axis is out of view.
  const tickRowY = showX ? y0 : m.height - small * 1.9;
  const tickColX = showY ? x0 : small * 3.2;

  return (
    <Svg width={width} height={m.height}>
      {axes.grid ? (
        <G stroke={palette.grid} strokeWidth={1}>
          {(axes.xTicks ?? []).map((t) => (
            <Line key={`gx${t.at}`} x1={m.px(t.at)} y1={0} x2={m.px(t.at)} y2={m.height} />
          ))}
          {(axes.yTicks ?? []).map((t) => (
            <Line key={`gy${t.at}`} x1={0} y1={m.py(t.at)} x2={m.width} y2={m.py(t.at)} />
          ))}
        </G>
      ) : null}
      {scene.items
        .filter((i) => i.k === 'area' || i.k === 'rect')
        .map((item, index) => (
          <SceneItem key={`f${index}`} item={item} scene={scene} m={m} palette={palette} font={font} scale={scale} />
        ))}
      {showX ? (
        <G>
          <Line x1={0} y1={y0} x2={m.width - 2} y2={y0} stroke={axisColor} strokeWidth={1.3 * scale} />
          <Path d={arrowHead(m.width - 1, y0, 0, y0, 7 * scale)} fill={axisColor} />
          {axes.xLabel ? (
            <Label
              x={m.width - 4}
              y={y0 + normal * 1.35}
              text={axes.xLabel}
              anchor="end"
              size={normal}
              color={palette.label}
              font={font}
              italic
            />
          ) : null}
        </G>
      ) : null}
      {showY ? (
        <G>
          <Line x1={x0} y1={m.height} x2={x0} y2={2} stroke={axisColor} strokeWidth={1.3 * scale} />
          <Path d={arrowHead(x0, 1, x0, m.height, 7 * scale)} fill={axisColor} />
          {axes.yLabel ? (
            <Label
              x={x0 - 6 * scale}
              y={normal}
              text={axes.yLabel}
              anchor="end"
              size={normal}
              color={palette.label}
              font={font}
              italic
            />
          ) : null}
        </G>
      ) : null}
      {axes.origin && showX && showY ? (
        <Label
          x={x0 - 4 * scale}
          y={y0 + normal * 1.2}
          text="0"
          anchor="end"
          size={normal}
          color={palette.label}
          font={font}
        />
      ) : null}
      {(axes.xTicks ?? []).map((tick) => (
        <G key={`xt${tick.at}${tick.label}`}>
          <Line
            x1={m.px(tick.at)}
            y1={tickRowY - 3 * scale}
            x2={m.px(tick.at)}
            y2={tickRowY + 3 * scale}
            stroke={axisColor}
          />
          <Label
            x={m.px(tick.at)}
            y={tickRowY + small * 1.5}
            text={tick.label}
            size={small}
            color={palette.label}
            font={font}
            italic={/^[a-z]/.test(tick.label)}
          />
        </G>
      ))}
      {(axes.yTicks ?? []).map((tick) => (
        <G key={`yt${tick.at}${tick.label}`}>
          <Line
            x1={tickColX - 3 * scale}
            y1={m.py(tick.at)}
            x2={tickColX + 3 * scale}
            y2={m.py(tick.at)}
            stroke={axisColor}
          />
          <Label
            x={tickColX - 6 * scale}
            y={m.py(tick.at) + small * 0.35}
            text={tick.label}
            anchor="end"
            size={small}
            color={palette.label}
            font={font}
          />
        </G>
      ))}
      {scene.items
        .filter((i) => i.k !== 'area' && i.k !== 'rect')
        .map((item, index) => (
          <SceneItem key={`s${index}`} item={item} scene={scene} m={m} palette={palette} font={font} scale={scale} />
        ))}
    </Svg>
  );
});

/** The figure's heading: "Figure 2.3", an unnumbered drawing from the notes, or an app illustration. */
export const figureHeading = (figure: FigureSpec): string =>
  figure.number
    ? `Figure ${figure.number}`
    : figure.origin === 'unamFigure'
      ? 'Figure from the course notes (unnumbered)'
      : 'Illustration made for the app';

/**
 * Draws every panel of a figure, side by side when there is room and two per
 * row on phones. The whole figure is one accessible element described in words.
 */
export function MathFigure({ figure }: { figure: FigureSpec }) {
  const theme = useAppTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(Math.floor(event.nativeEvent.layout.width));
  const count = figure.panels.length;
  const columns = count === 1 ? 1 : width >= 560 ? Math.min(count, 4) : Math.min(count, 2);
  const gap = theme.spacing.md;
  const panelWidth = columns > 0 ? Math.floor((Math.min(width, 640) - gap * (columns - 1)) / columns) : 0;

  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${figureHeading(figure)}. ${figure.description}${figure.caption ? ` ${figure.caption}` : ''}`}
      style={styles.figure}
    >
      {width > 0 ? (
        <View style={[styles.panels, { gap, maxWidth: 640 }]}>
          {figure.panels.map((scene, index) => (
            <View key={index} style={{ width: panelWidth, gap: theme.spacing.xs }}>
              <ScenePanel scene={scene} width={panelWidth} />
              {scene.caption ? (
                <AppText variant="small" color="textSecondary" style={styles.center}>
                  {scene.caption}
                </AppText>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { width: '100%', alignItems: 'center' },
  panels: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  center: { textAlign: 'center' },
});
