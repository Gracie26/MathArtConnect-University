import { useId, useMemo, useRef, useState } from 'react';
import { type GestureResponderEvent, type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { curvePalette } from '@/components/graph/plot';
import { useScrollLock } from '@/components/graph/ScrollLock';
import { useAppTheme } from '@/hooks/useAppTheme';
import { niceTicks } from '@/lib/figures/ticks';
import {
  type AreaArtProject,
  type Bounds,
  describeArtwork,
  layerShapes,
  type Shape,
  shapeBounds,
  viewWindow,
} from '@/lib/art/areaArt';

const touchDistance = (event: GestureResponderEvent) => {
  const [a, b] = event.nativeEvent.touches;
  return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0;
};

const pathOf = (points: [number, number][], toX: (x: number) => number, toY: (y: number) => number, close = false) =>
  points.length === 0
    ? ''
    : `M${points.map(([x, y]) => `${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join('L')}${close ? 'Z' : ''}`;

/**
 * Draws an area artwork: every layer's shapes, in stack order, inside the
 * zoomed and panned window. Colours come from the theme's curve palette, so
 * the art follows light, dark and high-contrast themes.
 */
export function AreaArtCanvas({
  project,
  height,
  thumbnail = false,
  description,
  onGesture,
}: {
  project: AreaArtProject;
  height: number;
  /** Thumbnails skip the backdrop and use a fixed fit (no zoom or pan). */
  thumbnail?: boolean;
  description?: string;
  /**
   * Pinch and drag on the canvas: a zoom factor (> 1 zooms in) and a pan as fractions of the
   * visible canvas width and height. Omit for a fixed artwork.
   */
  onGesture?: (zoomFactor: number, panX: number, panY: number) => void;
}) {
  const theme = useAppTheme();
  const palette = useMemo(() => curvePalette(theme), [theme]);
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(Math.floor(event.nativeEvent.layout.width));

  const layers = useMemo(
    () => project.layers.map((layer) => ({ id: layer.id, shapes: layerShapes(layer, palette.length) })),
    [project.layers, palette.length],
  );
  const window: Bounds = useMemo(() => {
    const fit = shapeBounds(layers.flatMap((l) => l.shapes));
    return thumbnail ? fit : viewWindow(fit, project.view);
  }, [layers, project.view, thumbnail]);

  const toX = (x: number) => ((x - window.xMin) / (window.xMax - window.xMin)) * width;
  const toY = (y: number) => height - ((y - window.yMin) / (window.yMax - window.yMin)) * height;
  const colour = (i: number) => palette[i % palette.length] ?? theme.colors.secondary;
  const clipId = `area-art-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  // Pinch to zoom and drag to pan: updates are batched to one per frame, and the page does not
  // scroll while a finger is on the artwork. Refs are only read inside these event handlers.
  const setScrollLocked = useScrollLock();
  const gesture = useRef({ x: 0, y: 0, pinch: 0 });
  const pending = useRef({ zoom: 1, dx: 0, dy: 0, frame: null as number | null });
  const flush = () => {
    const p = pending.current;
    p.frame = null;
    if (p.zoom !== 1 || p.dx !== 0 || p.dy !== 0) onGesture?.(p.zoom, p.dx, p.dy);
    p.zoom = 1;
    p.dx = 0;
    p.dy = 0;
  };
  const schedule = () => {
    if (pending.current.frame === null) pending.current.frame = requestAnimationFrame(flush);
  };
  const end = () => {
    if (pending.current.frame !== null) {
      cancelAnimationFrame(pending.current.frame);
      flush();
    }
    setScrollLocked?.(false);
  };
  const gestureHandlers =
    onGesture && !thumbnail
      ? {
          onStartShouldSetResponder: () => true,
          onMoveShouldSetResponder: () => true,
          onResponderTerminationRequest: () => false,
          onResponderGrant: (event: GestureResponderEvent) => {
            gesture.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY, pinch: touchDistance(event) };
            setScrollLocked?.(true);
          },
          onResponderMove: (event: GestureResponderEvent) => {
            const { pageX, pageY } = event.nativeEvent;
            if (event.nativeEvent.touches.length >= 2) {
              const d = touchDistance(event);
              if (gesture.current.pinch > 0 && d > 0) {
                pending.current.zoom *= d / gesture.current.pinch;
                schedule();
              }
              gesture.current = { x: pageX, y: pageY, pinch: d };
              return;
            }
            if (width === 0) return;
            // Drag right moves the artwork right (the window left): pan in fractions of the canvas.
            pending.current.dx += -(pageX - gesture.current.x) / width;
            pending.current.dy += (pageY - gesture.current.y) / height;
            gesture.current = { x: pageX, y: pageY, pinch: 0 };
            schedule();
          },
          onResponderRelease: end,
          onResponderTerminate: end,
        }
      : {};
  const draw = (shape: Shape, key: string) => {
    switch (shape.t) {
      case 'rect': {
        const x = toX(shape.x);
        const y = toY(shape.y + shape.h);
        const w = Math.max(0.5, toX(shape.x + shape.w) - x);
        const h = Math.max(0.5, toY(shape.y) - y);
        if (shape.outline) {
          return (
            <Rect
              key={key}
              x={x}
              y={y}
              width={w}
              height={h}
              fill="none"
              stroke={colour(shape.colour)}
              strokeOpacity={shape.opacity}
              strokeWidth={1.5}
            />
          );
        }
        if (shape.tone === 'surface') {
          return (
            <Rect
              key={key}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={1}
              fill={theme.colors.surface}
              fillOpacity={shape.opacity}
            />
          );
        }
        return (
          <Rect
            key={key}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={Math.min(3, w / 6)}
            fill={colour(shape.colour)}
            fillOpacity={shape.opacity}
            stroke={theme.colors.surface}
            strokeOpacity={0.6}
            strokeWidth={w > 6 ? 1 : 0}
          />
        );
      }
      case 'fill':
        return (
          <Path
            key={key}
            d={pathOf(shape.points, toX, toY, true)}
            fill={colour(shape.colour)}
            fillOpacity={shape.opacity}
          />
        );
      case 'path':
        return (
          <Path
            key={key}
            d={pathOf(shape.points, toX, toY)}
            stroke={colour(shape.colour)}
            strokeOpacity={shape.opacity}
            strokeWidth={shape.width}
            strokeDasharray={shape.dashed ? '6 5' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'dot':
        return (
          <Circle
            key={key}
            cx={toX(shape.x)}
            cy={toY(shape.y)}
            r={shape.r}
            fill={colour(shape.colour)}
            fillOpacity={shape.opacity}
          />
        );
    }
  };

  const gridLines = () => {
    if (thumbnail || project.backdrop === 'none') return null;
    const lines = [];
    if (project.backdrop === 'grid') {
      const step = niceStep((window.xMax - window.xMin) / 8);
      for (let x = Math.ceil(window.xMin / step) * step; x <= window.xMax; x += step) {
        lines.push(
          <Line
            key={`gx${x}`}
            x1={toX(x)}
            x2={toX(x)}
            y1={0}
            y2={height}
            stroke={theme.colors.graph.grid}
            strokeWidth={1}
          />,
        );
      }
      const ystep = niceStep((window.yMax - window.yMin) / 6);
      for (let y = Math.ceil(window.yMin / ystep) * ystep; y <= window.yMax; y += ystep) {
        lines.push(
          <Line
            key={`gy${y}`}
            x1={0}
            x2={width}
            y1={toY(y)}
            y2={toY(y)}
            stroke={theme.colors.graph.grid}
            strokeWidth={1}
          />,
        );
      }
    }
    lines.push(
      <Line key="ax" x1={0} x2={width} y1={toY(0)} y2={toY(0)} stroke={theme.colors.graph.axis} strokeWidth={1} />,
    );
    if (window.xMin < 0 && window.xMax > 0) {
      lines.push(
        <Line key="ay" x1={toX(0)} x2={toX(0)} y1={0} y2={height} stroke={theme.colors.graph.axis} strokeWidth={1} />,
      );
    }
    // Numbers on the axes (Grid and Axes backdrops), so positions can be read off. When an axis
    // is panned out of view its numbers stay at the nearest edge.
    const size = 10;
    const rowY = Math.min(height - 3, Math.max(size + 2, toY(0) + size + 2));
    const colX = Math.min(width - 3, Math.max(size * 3, toX(0) - 4));
    for (const t of niceTicks(window.xMin, window.xMax, 6)) {
      lines.push(
        <SvgText
          key={`tx${t.at}`}
          x={toX(t.at)}
          y={rowY}
          fontSize={size}
          fill={theme.colors.textSecondary}
          textAnchor="middle"
        >
          {t.label}
        </SvgText>,
      );
    }
    for (const t of niceTicks(window.yMin, window.yMax, 5)) {
      lines.push(
        <SvgText
          key={`ty${t.at}`}
          x={colX}
          y={toY(t.at) + size / 3}
          fontSize={size}
          fill={theme.colors.textSecondary}
          textAnchor="end"
        >
          {t.label}
        </SvgText>,
      );
    }
    return lines;
  };

  return (
    <View
      onLayout={onLayout}
      {...gestureHandlers}
      accessible
      accessibilityRole="image"
      accessibilityLabel={description ?? describeArtwork(project)}
      style={[styles.frame, { height, borderRadius: theme.radius.md, borderColor: theme.colors.border }]}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={`${clipId}-bg`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.surface} stopOpacity={1} />
              <Stop offset="1" stopColor={theme.colors.surfaceMuted} stopOpacity={1} />
            </LinearGradient>
            <ClipPath id={clipId}>
              <Rect x={0} y={0} width={width} height={height} />
            </ClipPath>
          </Defs>
          <Rect x={0} y={0} width={width} height={height} fill={`url(#${clipId}-bg)`} />
          <G clipPath={`url(#${clipId})`}>
            {gridLines()}
            {layers.map((layer) => (
              <G key={layer.id}>{layer.shapes.map((shape, i) => draw(shape, `${layer.id}-${i}`))}</G>
            ))}
          </G>
        </Svg>
      ) : null}
    </View>
  );
}

function niceStep(raw: number): number {
  const power = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-9)));
  const n = raw / power;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * power;
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
