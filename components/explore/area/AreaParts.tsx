import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { ScenePanel } from '@/components/figures/MathFigure';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureScene } from '@/lib/figures/scene';

/** A live figure that fills the available width (one accessible image described in words). */
export function LiveScene({ scene, description }: { scene: FigureScene; description: string }) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(Math.floor(event.nativeEvent.layout.width));
  return (
    <View onLayout={onLayout} accessible accessibilityRole="image" accessibilityLabel={description} style={styles.fill}>
      {/* Display only: the drawing never takes touches (react-native-svg would otherwise hit-test every
          path on each touch), so taps and drags reach the controls and page scrolling stays normal. */}
      <View pointerEvents="none">{width > 0 ? <ScenePanel scene={scene} width={Math.min(width, 640)} /> : null}</View>
    </View>
  );
}

/** A card holding the figure and its controls. */
export function LabCard({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.md }]}>{children}</View>;
}

/** Label / value rows, values in TeX. */
export function Readout({ rows }: { rows: [label: string, tex: string][] }) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.readout,
        { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm, gap: theme.spacing.xs },
      ]}
      accessibilityLiveRegion="polite"
    >
      {rows.map(([label, tex]) => (
        <View key={label} style={[styles.row, { gap: theme.spacing.sm }]}>
          <AppText variant="small" color="textSecondary" style={styles.label}>
            {label}
          </AppText>
          <View style={styles.value}>
            <MathExpression tex={tex} size={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** What the learner should notice: a short explanation tied to the notes. */
export function Insight({ title, text }: { title: string; text: string }) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        cardStyle(theme),
        { padding: theme.spacing.lg, gap: theme.spacing.sm, backgroundColor: theme.colors.primarySoft },
      ]}
    >
      <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {title}
      </AppText>
      <MathText text={text} />
    </View>
  );
}

/** Six significant decimals, for readouts. */
export const show = (v: number): string =>
  !Number.isFinite(v)
    ? v > 0
      ? '\\infty'
      : '-\\infty'
    : Math.abs(v) >= 1e5
      ? v.toExponential(4)
      : String(Number(v.toFixed(6)));

const styles = StyleSheet.create({
  fill: { width: '100%', alignItems: 'center' },
  readout: { padding: 10 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  label: { minWidth: 120, flexShrink: 1 },
  value: { flexShrink: 1 },
});
