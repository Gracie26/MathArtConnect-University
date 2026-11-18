import { Minus, Plus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { type GestureResponderEvent, type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { useScrollLock } from '@/components/graph/ScrollLock';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Text for the value, e.g. "a = 2.5". Defaults to the number. */
  valueText?: string;
}

const snapTo = (value: number, min: number, max: number, step: number) => {
  const clamped = Math.min(max, Math.max(min, value));
  return Number((min + Math.round((clamped - min) / step) * step).toFixed(6));
};

/**
 * Compact slider: drag the thumb or use − / + (also keyboard-accessible
 * buttons on the web). Screen readers get an adjustable control with the
 * value spoken. Updates are batched to one per animation frame while dragging.
 */
export function Slider({ label, value, min, max, step, onChange, valueText }: SliderProps) {
  const theme = useAppTheme();
  const setScrollLocked = useScrollLock();
  const [width, setWidth] = useState(0);
  const start = useRef({ x: 0, page: 0 });
  const frame = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  // The value most recently sent, so quick repeated taps on − / + build on each other even before
  // the parent has re-rendered with the new value.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);
  const fraction = max > min ? (value - min) / (max - min) : 0;

  const send = (next: number) => {
    latest.current = next;
    onChange(next);
  };

  // While dragging, at most one update per animation frame.
  const emit = (next: number) => {
    pending.current = next;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (pending.current !== null) send(pending.current);
      pending.current = null;
    });
  };
  // Apply a drag position still waiting for its frame (so the release position always counts).
  const flush = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    if (pending.current !== null) send(pending.current);
    pending.current = null;
  };
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const valueFromX = (x: number) => snapTo(min + (x / Math.max(1, width)) * (max - min), min, max, step);

  // Position along the track from where the touch started plus how far it has moved (page
  // coordinates, so the value follows the finger even when it leaves the track vertically).
  const onGrant = (event: GestureResponderEvent) => {
    start.current = { x: event.nativeEvent.locationX, page: event.nativeEvent.pageX };
    // Keep the page still while dragging, so the scroll view cannot take the gesture (iOS and Android).
    setScrollLocked?.(true);
    emit(valueFromX(start.current.x));
  };
  const onEnd = () => {
    flush();
    setScrollLocked?.(false);
  };
  const onMove = (event: GestureResponderEvent) =>
    emit(valueFromX(start.current.x + event.nativeEvent.pageX - start.current.page));

  const spoken = valueText ?? String(value);
  const nudge = (direction: 1 | -1) => send(snapTo(latest.current + direction * step, min, max, step));

  return (
    <View style={{ gap: 4 }}>
      <View style={styles.row}>
        <AppText
          variant="caption"
          color="textPrimary"
          style={[styles.flex, { fontFamily: theme.fontFamilies.semibold }]}
        >
          {label}
        </AppText>
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          {spoken}
        </AppText>
      </View>
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        <Pressable
          onPress={() => nudge(-1)}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          style={[styles.button, { borderColor: theme.colors.border, borderRadius: theme.radius.pill }]}
        >
          <Minus size={16} color={theme.colors.primary} />
        </Pressable>
        <View
          style={[styles.flex, styles.trackArea]}
          onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min, max, now: value, text: spoken }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) => nudge(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={onGrant}
          onResponderMove={onMove}
          onResponderRelease={onEnd}
          onResponderTerminate={onEnd}
        >
          <View style={[styles.track, { backgroundColor: theme.colors.border, borderRadius: 3 }]}>
            <View
              style={[
                styles.fill,
                { width: `${fraction * 100}%`, backgroundColor: theme.colors.primary, borderRadius: 3 },
              ]}
            />
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                left: Math.max(0, fraction * width - 11),
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <Pressable
          onPress={() => nudge(1)}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          style={[styles.button, { borderColor: theme.colors.border, borderRadius: theme.radius.pill }]}
        >
          <Plus size={16} color={theme.colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1, minWidth: 0 },
  trackArea: { height: 44, justifyContent: 'center' },
  track: { height: 6, overflow: 'hidden' },
  fill: { height: 6 },
  thumb: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
