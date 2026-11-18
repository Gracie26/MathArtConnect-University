import { type ReactNode, useRef, useState } from 'react';
import { ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import { BACK_TO_TOP_AFTER, BackToTop } from './BackToTop';

interface ScreenProps {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. canvases). */
  scroll?: boolean;
}

/**
 * Base screen container: themed background, consistent gutters and a
 * max content width so tablet and web layouts stay readable. Safe-area
 * insets are handled by the navigator headers and tab bar (which sits below
 * the content, never over it). Long screens offer "Back to top".
 */
export function Screen({ children, scroll = true }: ScreenProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [farDown, setFarDown] = useState(false);
  const content = (
    <View style={[styles.content, { maxWidth: theme.layout.maxContentWidth, gap: theme.spacing.lg }]}>{children}</View>
  );

  if (!scroll) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.colors.background, padding: theme.layout.screenGutter }]}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.fill}
        contentContainerStyle={{ padding: theme.layout.screenGutter, paddingBottom: theme.spacing.huge }}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => {
          const next = event.nativeEvent.contentOffset.y > BACK_TO_TOP_AFTER;
          if (next !== farDown) setFarDown(next);
        }}
        scrollEventThrottle={64}
      >
        {content}
      </ScrollView>
      <BackToTop visible={farDown} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: !reducedMotion })} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { width: '100%', alignSelf: 'center' },
});
