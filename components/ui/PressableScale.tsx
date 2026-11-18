import { type ReactNode, useState } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useNativeDriver } from '@/lib/utils/animation';

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  /** Visual style of the animated card. */
  style?: StyleProp<ViewStyle>;
  /** Layout style of the outer touch area (width, flex …). */
  containerStyle?: StyleProp<ViewStyle>;
  pressedScale?: number;
}

/**
 * Touchable surface with a small scale + fade on press. Scale is skipped when
 * the OS "reduce motion" setting is on; the fade remains as press feedback.
 */
export function PressableScale({
  children,
  style,
  containerStyle,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  const animateTo = (toValue: number) =>
    Animated.timing(progress, { toValue, duration: theme.motion.fast, useNativeDriver }).start();

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, reducedMotion ? 1 : pressedScale] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] });

  return (
    <Pressable
      style={containerStyle}
      onPressIn={(event) => {
        animateTo(1);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(0);
        onPressOut?.(event);
      }}
      {...rest}
    >
      <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
