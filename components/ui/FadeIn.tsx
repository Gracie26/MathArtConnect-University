import { type ReactNode, useEffect, useState } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useNativeDriver } from '@/lib/utils/animation';

interface FadeInProps {
  children: ReactNode;
  /** Stagger index; each step delays the entrance slightly. */
  index?: number;
  style?: StyleProp<ViewStyle>;
}

/** Subtle entrance: fade and rise 8 dp. Renders instantly under reduced motion. */
export function FadeIn({ children, index = 0, style }: FadeInProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: theme.motion.slow,
      delay: index * 60,
      useNativeDriver,
    }).start();
  }, [index, progress, reducedMotion, theme.motion.slow]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
