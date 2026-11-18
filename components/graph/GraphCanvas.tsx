import { memo, useMemo, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';
import { fmt, type GraphView, niceStep, type Point } from '@/lib/graph/sample';

import { useScrollLock } from './ScrollLock';

export interface CanvasCurve {
  id: string;
  segments: Point[][];
  color: string;
  width: number;
  dashed?: boolean;
}

export interface GraphCanvasProps {
  view: GraphView;
  /** Curves, or a function that samples them for the view actually drawn (needed with equalScale). */
  curves: CanvasCurve[] | ((view: GraphView) => CanvasCurve[]);
  /** Text summary for screen readers (the layer list gives the details). */
  summary: string;
  /** Drag to pan and pinch to zoom; omit for a fixed graph. */
  onPan?: (dx: number, dy: number) => void;
  onZoom?: (factor: number) => void;
  /** Tap to inspect: receives the x (or θ) value under the finger. */
  onTap?: (x: number, y: number) => void;
  /** Marked point (e.g. the traced value). */
  marker?: Point | null;
  height?: number;
  /**
   * Keep one unit the same length on both axes (circles stay round). The
   * shorter direction of the view is widened around its centre to fit.
   */
  equalScale?: boolean;
}

/** The view actually drawn: with equal scaling, widened to the canvas shape. */
export function fittedView(view: GraphView, width: number, height: number): GraphView {
  if (width <= 0 || height <= 0) return view;
  const unit = Math.max((view.xMax - view.xMin) / width, (view.yMax - view.yMin) / height);
  const cx = (view.xMin + view.xMax) / 2;
  const cy = (view.yMin + view.yMax) / 2;
  return {
    ...view,
    xMin: cx - (unit * width) / 2,
    xMax: cx + (unit * width) / 2,
    yMin: cy - (unit * height) / 2,
    yMax: cy + (unit * height) / 2,
  };
}

/** Number array (not a string) so react-native-svg draws the dashes the same on iOS, Android and web. */
const DASH = [6, 5];

const distance = (event: GestureResponderEvent) => {
  const [a, b] = event.nativeEvent.touches;
  return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0;
};

/** Graph paper with curves, drawn with SVG in theme colours (light and dark). */
export const GraphCanvas = memo(function GraphCanvas({
  view: requestedView,
  curves,
  summary,
  onPan,
  onZoom,
  onTap,
  marker,
  height: fixedHeight,
  equalScale = false,
}: GraphCanvasProps) {
  const theme = useAppTheme();
  const g = theme.colors.graph;
  const windowSize = useWindowDimensions();
  const setScrollLocked = useScrollLock();
  const [width, setWidth] = useState(0);
  // Never taller than about 60% of the screen, so controls stay reachable (short phones, landscape).
  const height =
    fixedHeight ?? Math.round(Math.min(460, Math.max(220, Math.min(width * 0.78, windowSize.height * 0.6))));
  const view = useMemo(
    () => (equalScale ? fittedView(requestedView, width, height) : requestedView),
    [equalScale, requestedView, width, height],
  );
  const spanX = view.xMax - view.xMin;
  const spanY = view.yMax - view.yMin;
  const px = (x: number) => ((x - view.xMin) / spanX) * width;
  const py = (y: number) => (1 - (y - view.yMin) / spanY) * height;

  // Gesture state lives in refs so the responder (created once) sees the latest view.
  const latest = useRef({ width, height, spanX, spanY, view, onPan, onZoom, onTap, setScrollLocked });
  latest.current = { width, height, spanX, spanY, view, onPan, onZoom, onTap, setScrollLocked };
  const gesture = useRef({ lastDx: 0, lastDy: 0, pinch: 0, moved: false });
  // Pan and pinch are batched into one update per frame, so phones redraw at most once per frame.
  const pending = useRef({ dx: 0, dy: 0, zoom: 1, frame: null as number | null });
  const flush = () => {
    const p = pending.current;
    p.frame = null;
    const l = latest.current;
    if (p.zoom !== 1 && l.onZoom) l.onZoom(p.zoom);
    if ((p.dx !== 0 || p.dy !== 0) && l.onPan) l.onPan(p.dx, p.dy);
    p.dx = 0;
    p.dy = 0;
    p.zoom = 1;
  };
  const schedule = () => {
    if (pending.current.frame === null) pending.current.frame = requestAnimationFrame(flush);
  };
  const end = () => {
    if (pending.current.frame !== null) {
      cancelAnimationFrame(pending.current.frame);
      flush();
    }
    latest.current.setScrollLocked?.(false);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        gesture.current = { lastDx: 0, lastDy: 0, pinch: distance(event), moved: false };
        latest.current.setScrollLocked?.(true);
      },
      onPanResponderMove: (event, state) => {
        const l = latest.current;
        if (event.nativeEvent.touches.length >= 2 && l.onZoom) {
          const d = distance(event);
          if (gesture.current.pinch > 0 && d > 0) {
            pending.current.zoom *= gesture.current.pinch / d;
            schedule();
          }
          gesture.current.pinch = d;
          gesture.current.moved = true;
          // Lifting one finger must not make the view jump: restart the pan from here.
          gesture.current.lastDx = state.dx;
          gesture.current.lastDy = state.dy;
          return;
        }
        gesture.current.pinch = 0;
        if (!l.onPan || l.width === 0) return;
        const ddx = state.dx - gesture.current.lastDx;
        const ddy = state.dy - gesture.current.lastDy;
        if (Math.abs(state.dx) + Math.abs(state.dy) > 4) gesture.current.moved = true;
        gesture.current.lastDx = state.dx;
        gesture.current.lastDy = state.dy;
        if (gesture.current.moved) {
          pending.current.dx += (-ddx / l.width) * l.spanX;
          pending.current.dy += (ddy / l.height) * l.spanY;
          schedule();
        }
      },
      onPanResponderRelease: (event) => {
        end();
        const l = latest.current;
        if (gesture.current.moved || !l.onTap || l.width === 0) return;
        const { locationX, locationY } = event.nativeEvent;
        l.onTap(l.view.xMin + (locationX / l.width) * l.spanX, l.view.yMax - (locationY / l.height) * l.spanY);
      },
      onPanResponderTerminate: () => end(),
    }),
  ).current;

  const grid = useMemo(() => {
    if (width === 0) return { xs: [], ys: [], step: 1 };
    const step = niceStep(Math.max(spanX, spanY * (width / height)));
    const xs: number[] = [];
    const ys: number[] = [];
    for (let x = Math.ceil(view.xMin / step) * step; x <= view.xMax; x += step) xs.push(Number(x.toFixed(10)));
    for (let y = Math.ceil(view.yMin / step) * step; y <= view.yMax; y += step) ys.push(Number(y.toFixed(10)));
    return { xs, ys, step };
  }, [view, width, height, spanX, spanY]);

  const paths = useMemo(() => {
    if (width === 0) return [];
    const toX = (x: number) => ((x - view.xMin) / (view.xMax - view.xMin)) * width;
    const toY = (y: number) => (1 - (y - view.yMin) / (view.yMax - view.yMin)) * height;
    const list = typeof curves === 'function' ? curves(view) : curves;
    return list.map((curve) => ({
      ...curve,
      d: curve.segments
        .map((segment) =>
          segment.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(''),
        )
        .join(''),
    }));
  }, [curves, view, width, height]);

  const axisX = Math.min(Math.max(py(0), 0), height);
  const axisY = Math.min(Math.max(px(0), 0), width);
  const fontSize = 11;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={[
        styles.frame,
        { height, borderRadius: theme.radius.md, borderColor: theme.colors.border, backgroundColor: g.background },
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
      {...(onPan || onZoom || onTap ? responder.panHandlers : {})}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Rect x={0} y={0} width={width} height={height} fill={g.background} />
          {view.grid
            ? [
                ...grid.xs.map((x) => (
                  <Line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={0} y2={height} stroke={g.grid} strokeWidth={1} />
                )),
                ...grid.ys.map((y) => (
                  <Line key={`gy${y}`} x1={0} x2={width} y1={py(y)} y2={py(y)} stroke={g.grid} strokeWidth={1} />
                )),
              ]
            : null}
          {view.axes ? (
            <>
              <Line x1={0} x2={width} y1={axisX} y2={axisX} stroke={g.axis} strokeWidth={1.5} />
              <Line x1={axisY} x2={axisY} y1={0} y2={height} stroke={g.axis} strokeWidth={1.5} />
              {grid.xs
                .filter((x) => x !== 0)
                .map((x) => (
                  <SvgText
                    key={`lx${x}`}
                    x={px(x)}
                    y={Math.min(axisX + 14, height - 4)}
                    fontSize={fontSize}
                    fill={g.axisLabel}
                    textAnchor="middle"
                  >
                    {fmt(x)}
                  </SvgText>
                ))}
              {grid.ys
                .filter((y) => y !== 0)
                .map((y) => (
                  <SvgText
                    key={`ly${y}`}
                    x={Math.max(axisY - 4, 18)}
                    y={py(y) + 4}
                    fontSize={fontSize}
                    fill={g.axisLabel}
                    textAnchor="end"
                  >
                    {fmt(y)}
                  </SvgText>
                ))}
              {/* Axis names: x at the right end of the x-axis, y at the top of the y-axis. */}
              <SvgText
                x={width - 6}
                y={axisX > 18 ? axisX - 6 : axisX + 28}
                fontSize={fontSize + 2}
                fontStyle="italic"
                fill={g.axisLabel}
                textAnchor="end"
              >
                x
              </SvgText>
              <SvgText
                x={axisY < width - 18 ? axisY + 6 : axisY - 14}
                y={14}
                fontSize={fontSize + 2}
                fontStyle="italic"
                fill={g.axisLabel}
                textAnchor="start"
              >
                y
              </SvgText>
            </>
          ) : null}
          {paths.map((curve) => (
            <Path
              key={curve.id}
              d={curve.d}
              stroke={curve.color}
              strokeWidth={curve.width}
              strokeDasharray={curve.dashed ? DASH : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {marker ? (
            <Circle cx={px(marker.x)} cy={py(marker.y)} r={5} fill={g.point} stroke={g.background} strokeWidth={2} />
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
