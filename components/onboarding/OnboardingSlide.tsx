import { StyleSheet, View } from 'react-native';

import { OnboardingArt, type OnboardingArtName } from '@/components/art/OnboardingArt';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface OnboardingSlideContent {
  key: string;
  art: OnboardingArtName;
  title: string;
  body: string;
}

interface OnboardingSlideProps {
  slide: OnboardingSlideContent;
  width: number;
  /** Illustration width; shrinks on short screens. */
  artSize: number;
}

export function OnboardingSlide({ slide, width, artSize }: OnboardingSlideProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.slide, { width, gap: theme.spacing.xxl }]}>
      <View aria-hidden style={styles.art}>
        <OnboardingArt name={slide.art} size={artSize} />
      </View>
      <View style={[styles.text, { gap: theme.spacing.md }]}>
        <AppText variant="h1" style={styles.center}>
          {slide.title}
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary" style={styles.center}>
          {slide.body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  art: { alignItems: 'center' },
  text: { maxWidth: 400 },
  center: { textAlign: 'center' },
});
