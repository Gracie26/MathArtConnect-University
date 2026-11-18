import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { ScenePanel } from '@/components/figures/MathFigure';
import type { FigureScene } from '@/lib/figures/scene';

/**
 * A live figure that can be tapped to inspect it: the tap is converted to the
 * figure's own coordinates (x, y for a graph; the projected point for a 3D
 * view) and passed to `onTap`. Only a tap is taken, never a drag, so the page
 * scrolls normally and nearby sliders keep working. The drawing itself still
 * ignores touches. Screen-reader users get the same information from the
 * readout and the step buttons next to the figure.
 */
export function TapScene({
  scene,
  description,
  onTap,
  tapLabel,
}: {
  scene: FigureScene;
  description: string;
  onTap: (x: number, y: number) => void;
  /** Accessible name of the tap target, e.g. "Select the nearest arrow". */
  tapLabel: string;
}) {
  const [width, setWidth] = useState(0);
  const panel = Math.min(width, 640);
  const height = panel * scene.aspect;
  const onLayout = (event: LayoutChangeEvent) => setWidth(Math.floor(event.nativeEvent.layout.width));
  const { xMin, xMax, yMin, yMax } = scene.view;

  return (
    <View testID="tap-scene-frame" onLayout={onLayout} style={styles.fill}>
      <View accessible accessibilityRole="image" accessibilityLabel={description}>
        <View pointerEvents="none">{panel > 0 ? <ScenePanel scene={scene} width={panel} /> : null}</View>
      </View>
      {panel > 0 ? (
        <Pressable
          testID="tap-scene"
          accessibilityRole="button"
          accessibilityLabel={tapLabel}
          accessibilityHint="Tap a place on the graph to inspect it."
          onPress={(event) => {
            const { locationX, locationY } = event.nativeEvent;
            onTap(xMin + (locationX / panel) * (xMax - xMin), yMax - (locationY / height) * (yMax - yMin));
          }}
          style={[styles.overlay, { width: panel, height }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%' },
  overlay: { position: 'absolute', left: 0, top: 0 },
});
