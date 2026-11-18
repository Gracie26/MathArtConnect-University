/**
 * Ambient mathematical art for low-cognitive-load screens (sign in,
 * registration, onboarding, the top of Home, selected empty states). Never
 * used behind lesson text, formulas, practice or My Working.
 *
 * Each variant is real mathematics, drawn once as SVG in the existing palette
 * at low opacity:
 *   curves     two function graphs (y = sin x + 0.3 sin 3x, y = cos 0.8x · e^(−0.05x)),
 *              each with a short tangent line sliding along it, always at the true slope f′(x)
 *   lissajous  the parametric curve x = sin 3t, y = sin 2t, with a point tracing it
 *   contours   level curves of a surface with two peaks, with a point travelling one level curve
 *   field      the gradient field of f = x² − y², ∇f = (2x, −2y), with two particles
 *              following its flow lines x = x₀e^(2t), y = y₀e^(−2t) (the hyperbolas xy = x₀y₀)
 * Movement is only slow transforms: the finished drawing drifts, turns or
 * gently scales (20–40 s per cycle) and each tracer is moved along points
 * computed once, so nothing is redrawn per frame and low-end phones are not
 * loaded (native driver on iOS and Android). No flashing.
 *
 * Decorative: it ignores touch, is hidden from screen readers, stays still
 * (tracers hidden) when Reduce Motion is on, and pauses while its screen is
 * not focused or the app is in the background.
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { useDisplayPreferences } from '@/features/preferences/displayPreferences';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  type PlotFrame,
  plotFunction,
  plotParametric,
  type Trace,
  traceFunction,
  traceParametric,
} from '@/lib/art/curves';
import { useNativeDriver } from '@/lib/utils/animation';

export type AmbientVariant = 'curves' | 'lissajous' | 'contours' | 'field';

interface AmbientMathArtProps {
  variant?: AmbientVariant;
  /** Height of the art (dp); it spans the full width of its parent. */
  height?: number;
  /** Overall strength; 'faint' for empty states. */
  strength?: 'subtle' | 'faint';
}

const CYCLE_MS: Record<AmbientVariant, number> = { curves: 24000, lissajous: 40000, contours: 20000, field: 36000 };

/** A point moving along a curve: with `tangent`, a short line turned to the curve's direction. */
interface Tracer {
  trace: Trace;
  tangent: boolean;
  tone: 'primary' | 'secondary';
  durationMs: number;
  /** Closed curves loop round; open ones glide there and back. */
  closed: boolean;
}

interface Artwork {
  /** Width of the drawing (the curves variant is wider so it can drift sideways). */
  width: number;
  lines: string[];
  /** One line repeated in the accent colour. */
  accent?: string;
  tracers: Tracer[];
  centre?: [number, number];
}

const fn1 = (x: number) => Math.sin(x) + 0.3 * Math.sin(3 * x);
const fn2 = (x: number) => Math.cos(0.8 * x) * Math.exp(-0.05 * x);

function buildArtwork(variant: AmbientVariant, width: number, height: number): Artwork {
  switch (variant) {
    case 'curves': {
      const wide = width * 1.4;
      const periods = wide / 260;
      const xMax = Math.PI * 2 * periods;
      const frame1: PlotFrame = {
        xMin: 0,
        xMax,
        yMin: -1.6,
        yMax: 1.6,
        left: 0,
        top: height * 0.18,
        width: wide,
        height: 90,
      };
      const frame2: PlotFrame = {
        xMin: 0,
        xMax,
        yMin: -1.4,
        yMax: 1.4,
        left: 0,
        top: height * 0.6,
        width: wide,
        height: 110,
      };
      const steps = Math.ceil(periods * 24);
      const line1 = plotFunction(fn1, frame1, steps);
      return {
        width: wide,
        lines: [line1, plotFunction(fn2, frame2, steps)],
        accent: line1,
        tracers: [
          {
            trace: traceFunction(fn1, frame1, xMax * 0.08, xMax * 0.85),
            tangent: true,
            tone: 'primary',
            durationMs: 26000,
            closed: false,
          },
          {
            trace: traceFunction(fn2, frame2, xMax * 0.8, xMax * 0.15),
            tangent: true,
            tone: 'secondary',
            durationMs: 34000,
            closed: false,
          },
        ],
      };
    }
    case 'lissajous': {
      const size = Math.min(width, height) * 0.8;
      const frame: PlotFrame = {
        xMin: -1,
        xMax: 1,
        yMin: -1,
        yMax: 1,
        left: width - size * 0.9,
        top: (height - size) / 2,
        width: size,
        height: size,
      };
      const fx = (t: number) => Math.sin(3 * t);
      const fy = (t: number) => Math.sin(2 * t);
      const line = plotParametric(fx, fy, frame, 0, Math.PI * 2, 240);
      return {
        width,
        lines: [line],
        accent: line,
        tracers: [
          {
            trace: traceParametric(fx, fy, frame, 0, Math.PI * 2, 96),
            tangent: false,
            tone: 'primary',
            durationMs: 30000,
            closed: true,
          },
        ],
      };
    }
    case 'contours': {
      // Level curves of f = e^(−((x−1)² + y²)) + 0.8 e^(−((x+1)² + (y−0.4)²)), as rings around each peak.
      const cx = width * 0.72;
      const cy = height * 0.45;
      const s = Math.min(width, height) * 0.22;
      const frame: PlotFrame = {
        xMin: -3,
        xMax: 3,
        yMin: -2,
        yMax: 2,
        left: cx - 3 * s,
        top: cy - 2 * s,
        width: 6 * s,
        height: 4 * s,
      };
      const ring = (px: number, py: number, r: number) => ({
        fx: (t: number) => px + r * Math.cos(t) * (1 + 0.08 * Math.sin(2 * t)),
        fy: (t: number) => py + r * Math.sin(t),
      });
      const rings: string[] = [];
      for (const [px, py, k] of [
        [1, 0, 5],
        [-1, 0.4, 4],
      ] as const) {
        for (let i = 1; i <= k; i++) {
          const { fx, fy } = ring(px, py, (0.28 * i) / (1 + 0.15 * i));
          rings.push(plotParametric(fx, fy, frame, 0, Math.PI * 2, 72));
        }
      }
      const outer = ring(1, 0, (0.28 * 4) / (1 + 0.15 * 4));
      return {
        width,
        lines: rings,
        tracers: [
          {
            trace: traceParametric(outer.fx, outer.fy, frame, 0, Math.PI * 2, 72),
            tangent: false,
            tone: 'secondary',
            durationMs: 28000,
            closed: true,
          },
        ],
      };
    }
    case 'field': {
      // ∇f = (2x, −2y) for f = x² − y², drawn as short strokes on a grid (y up, so the saddle shows).
      const unit = 80;
      const ox = width * 0.7;
      const oy = height / 2;
      const lines: string[] = [];
      const step = 34;
      for (let gx = width * 0.35; gx < width; gx += step) {
        for (let gy = step / 2; gy < height; gy += step) {
          const x = (gx - ox) / unit;
          const y = (oy - gy) / unit;
          const vx = 2 * x;
          const vy = -2 * y;
          const len = Math.hypot(vx, vy) || 1;
          const L = 9;
          // Canvas y grows downwards, so the y component is negated.
          lines.push(`M${gx - (vx / len) * L} ${gy + (vy / len) * L} L${gx + (vx / len) * L} ${gy - (vy / len) * L}`);
        }
      }
      // Flow lines of ∇f: x = x₀e^(2t), y = y₀e^(−2t). Particles drift in along y and out along x.
      const frame: PlotFrame = {
        xMin: -ox / unit,
        xMax: (width - ox) / unit,
        yMin: -oy / unit,
        yMax: oy / unit,
        left: 0,
        top: 0,
        width,
        height,
      };
      const flow = (x0: number, y0: number) =>
        traceParametric(
          (t) => x0 * Math.exp(2 * t),
          (t) => y0 * Math.exp(-2 * t),
          frame,
          0,
          0.75,
          48,
        );
      return {
        width,
        lines,
        centre: [ox, oy],
        tracers: [
          { trace: flow(0.12, 2), tangent: false, tone: 'secondary', durationMs: 22000, closed: false },
          { trace: flow(-0.15, -1.8), tangent: false, tone: 'primary', durationMs: 27000, closed: false },
        ],
      };
    }
  }
}

/** True while the art may move: Reduce Motion off, its screen focused and the app in the foreground. */
function useMayAnimate(): boolean {
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);
  return !reduced && focused && foreground;
}

function Drawing({ art, height }: { art: Artwork; height: number }) {
  const { colors } = useAppTheme();
  return (
    <Svg width={art.width} height={height}>
      <G stroke={colors.backdropLine} strokeWidth={1.5} fill="none">
        {art.lines.map((d, i) => (
          <Path key={i} d={d} />
        ))}
      </G>
      {art.accent ? (
        <G stroke={colors.primary} strokeOpacity={0.12} strokeWidth={1.2} fill="none">
          <Path d={art.accent} />
        </G>
      ) : null}
      {art.centre ? (
        <G fill={colors.secondary} fillOpacity={0.1}>
          <Circle cx={art.centre[0]} cy={art.centre[1]} r={3} />
        </G>
      ) : null}
    </Svg>
  );
}

const TANGENT = 56;
const DOT = 6;

/** One tracer: a faint point (and tangent line) moved along precomputed points by a single animated value. */
function MovingTracer({ tracer }: { tracer: Tracer }) {
  const { colors } = useAppTheme();
  const [t] = useState(() => new Animated.Value(0));
  const { points, angles } = tracer.trace;

  useEffect(() => {
    const timing = (toValue: number, duration: number) =>
      Animated.timing(t, { toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver });
    const loop = tracer.closed
      ? Animated.loop(
          Animated.timing(t, { toValue: 1, duration: tracer.durationMs, easing: Easing.linear, useNativeDriver }),
        )
      : Animated.loop(Animated.sequence([timing(1, tracer.durationMs / 2), timing(0, tracer.durationMs / 2)]));
    loop.start();
    return () => loop.stop();
  }, [t, tracer]);

  const input = points.map((_, i) => i / (points.length - 1));
  const color = tracer.tone === 'primary' ? colors.primary : colors.secondary;
  const transform = [
    { translateX: t.interpolate({ inputRange: input, outputRange: points.map((p) => p[0]) }) },
    { translateY: t.interpolate({ inputRange: input, outputRange: points.map((p) => p[1]) }) },
    ...(tracer.tangent
      ? [{ rotate: t.interpolate({ inputRange: input, outputRange: angles.map((a) => `${a}deg`) }) }]
      : []),
  ];

  return (
    <Animated.View style={[styles.tracer, { transform }]}>
      {tracer.tangent ? (
        <View
          style={[
            styles.tangent,
            { backgroundColor: color, opacity: 0.28, width: TANGENT, left: -TANGENT / 2, top: -0.75 },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.dot,
          { backgroundColor: color, opacity: 0.4, width: DOT, height: DOT, left: -DOT / 2, top: -DOT / 2 },
        ]}
      />
    </Animated.View>
  );
}

export function AmbientMathArt(props: AmbientMathArtProps) {
  // The learner can turn ambient art off (Profile › Appearance & motion).
  const { ambientArt } = useDisplayPreferences();
  return ambientArt ? <AmbientLayer {...props} /> : null;
}

function AmbientLayer({ variant = 'curves', height = 360, strength = 'subtle' }: AmbientMathArtProps) {
  const { width } = useWindowDimensions();
  const moving = useMayAnimate();
  const [progress] = useState(() => new Animated.Value(0));
  const art = useMemo(() => buildArtwork(variant, width, height), [variant, width, height]);

  useEffect(() => {
    if (!moving) {
      progress.stopAnimation();
      return;
    }
    const half = CYCLE_MS[variant] / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(progress, { toValue: 0, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [moving, progress, variant]);

  const transform =
    variant === 'curves'
      ? [
          { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 0.25] }) },
          { scaleY: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
        ]
      : variant === 'contours'
        ? [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }]
        : [
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', variant === 'field' ? '8deg' : '12deg'],
              }),
            },
          ];

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      testID={moving ? 'ambient-art-moving' : 'ambient-art-still'}
      style={[styles.wrap, { height, opacity: strength === 'faint' ? 0.6 : 1 }]}
    >
      <Animated.View style={{ transform, width: art.width, height }}>
        <Drawing art={art} height={height} />
        {/* Tracers only move; with Reduce Motion (or off screen) the drawing stays still and they are not shown. */}
        {moving ? art.tracers.map((tracer, i) => <MovingTracer key={i} tracer={tracer} />) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  tracer: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  tangent: { position: 'absolute', height: 1.5, borderRadius: 1 },
  dot: { position: 'absolute', borderRadius: 3 },
});
