import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ScrollView, type ScrollViewInstance, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientMathArt } from '@/components/art/AmbientMathArt';
import { IconButton } from '@/components/navigation/IconButton';
import { OnboardingSlide, type OnboardingSlideContent } from '@/components/onboarding/OnboardingSlide';
import { PageIndicator } from '@/components/onboarding/PageIndicator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { setAuthEntryIntent } from '@/features/onboarding/entryIntent';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Topic-neutral wording: valid whichever Calculus focus is finally selected. */
const SLIDES: OnboardingSlideContent[] = [
  {
    key: 'differently',
    art: 'differently',
    title: 'See Mathematics Differently',
    body: 'Explore university mathematics through visual explanations, interaction and creative learning.',
  },
  {
    key: 'explore',
    art: 'explore',
    title: 'Explore Visually',
    body: 'Move points, adjust values and watch mathematical relationships respond instantly.',
  },
  {
    key: 'create',
    art: 'create',
    title: 'Create With Mathematics',
    body: 'Use functions, patterns and mathematical ideas to create meaningful visual art.',
  },
  {
    key: 'practise',
    art: 'practise',
    title: 'Practise Smarter',
    body: 'Use guided practice, progressive hints and review tools to strengthen understanding.',
  },
];

const MAX_WIDTH = 560;

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  // Replaying from Settings (signed in): finishing simply returns.
  const isReplay = replay === '1' || auth.status === 'signedIn';

  const pageWidth = Math.min(windowWidth, MAX_WIDTH);
  const artSize = Math.min(pageWidth - 56, windowHeight < 720 ? 230 : 300);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    setIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: !reducedMotion });
  };

  const finish = async (destination: 'sign-up' | 'sign-in') => {
    if (isReplay) {
      if (router.canGoBack()) router.back();
      else router.replace('/');
      return;
    }
    setAuthEntryIntent(destination === 'sign-up' ? 'sign-up' : null);
    // Flips the route guard; the router then shows Sign In (see app/_layout.tsx).
    await auth.completeOnboarding();
  };

  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: theme.colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
      ]}
    >
      {/* Decorative: slow contour motion behind the introduction (ignores touch; still under Reduce Motion). */}
      <AmbientMathArt variant="contours" height={520} strength="faint" />
      <View style={[styles.column, { maxWidth: MAX_WIDTH }]}>
        <View style={[styles.topBar, { paddingHorizontal: theme.spacing.sm }]}>
          {index > 0 ? (
            <IconButton icon={ArrowLeft} accessibilityLabel="Back" onPress={() => goTo(index - 1)} />
          ) : (
            <View style={{ width: theme.touchTarget.min }} />
          )}
          {!isLast ? (
            <SecondaryTextButton
              label="Skip"
              color="textSecondary"
              accessibilityLabel="Skip introduction"
              onPress={() => void finish('sign-in')}
              style={{ paddingHorizontal: theme.spacing.md }}
            />
          ) : null}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={32}
          onScroll={(event) => {
            const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
            if (next !== index && next >= 0 && next < SLIDES.length) setIndex(next);
          }}
          style={styles.pager}
          contentContainerStyle={styles.pagerContent}
        >
          {SLIDES.map((slide) => (
            <OnboardingSlide key={slide.key} slide={slide} width={pageWidth} artSize={artSize} />
          ))}
        </ScrollView>

        <View style={[styles.controls, { paddingHorizontal: theme.spacing.xxl, gap: theme.spacing.lg }]}>
          <PageIndicator count={SLIDES.length} index={index} />
          <PrimaryButton
            label={isLast ? (isReplay ? 'Done' : 'Get Started') : 'Next'}
            onPress={() => (isLast ? void finish('sign-up') : goTo(index + 1))}
            style={styles.button}
          />
          <View style={styles.secondary}>
            {isLast && !isReplay ? (
              <SecondaryTextButton label="I already have an account" onPress={() => void finish('sign-in')} />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { flex: 1, width: '100%', alignSelf: 'center' },
  topBar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pager: { flex: 1 },
  pagerContent: { alignItems: 'center' },
  controls: { alignItems: 'center' },
  button: { alignSelf: 'stretch' },
  secondary: { minHeight: 44, justifyContent: 'center' },
});
