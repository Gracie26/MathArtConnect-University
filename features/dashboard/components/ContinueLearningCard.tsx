import { router } from 'expo-router';
import { ArrowRight, Timer } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HeroCurvesArt, HeroFill } from '@/components/art/HeroCurvesArt';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatStudyTime } from '@/content/estimate';
import { useAppTheme } from '@/hooks/useAppTheme';
import { toPercent } from '@/lib/utils/format';
import type { ContinueLearning } from '@/types/dashboard';

interface ContinueLearningCardProps {
  item: ContinueLearning | null;
}

/** Cards at least this wide put the art beside the text; narrower ones put it in the top corner. */
const SIDE_BY_SIDE_MIN = 520;
/** Share of a wide card's width given to the art. */
const SIDE_ART_SHARE = 0.38;

/**
 * The primary action on Home. The whole card is one large touch target. The
 * decorative art has its own region (beside the text on wide cards, beside
 * the eyebrow on phones), so text never runs over it.
 */
export function ContinueLearningCard({ item }: ContinueLearningCardProps) {
  const theme = useAppTheme();
  const [width, setWidth] = useState(0);
  const sideBySide = width >= SIDE_BY_SIDE_MIN;
  const sideArtWidth = Math.round(width * SIDE_ART_SHARE);
  const percent = item ? toPercent(item.progress) : 0;

  const started = item?.isStarted ?? false;
  const eyebrow = started ? 'CONTINUE LEARNING' : 'START LEARNING';
  const title = item ? item.topicTitle : 'Your first lesson';
  const summary = item ? item.summary : 'See how mathematics comes alive through graphs and art.';
  const cta = started ? 'Continue' : 'Start';

  return (
    <PressableScale
      onPress={() => router.push(item ? item.href : '/learn')}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="button"
      accessibilityLabel={
        item
          ? started
            ? `Continue learning ${item.topicTitle}, ${item.subject}, ${percent}% complete`
            : `Start ${item.topicTitle}, ${item.subject}`
          : 'Start your first lesson'
      }
      pressedScale={0.985}
      style={[
        styles.card,
        { borderRadius: theme.radius.lg, backgroundColor: theme.colors.heroEnd },
        theme.shadows.raised,
      ]}
    >
      <HeroFill />
      {sideBySide ? (
        <View style={[styles.sideArt, { width: sideArtWidth }]} pointerEvents="none">
          <HeroCurvesArt />
        </View>
      ) : null}
      <View
        style={[
          styles.content,
          { padding: theme.spacing.xl, gap: theme.spacing.md },
          sideBySide ? { marginRight: sideArtWidth } : null,
        ]}
      >
        <View style={[styles.top, { gap: theme.spacing.md }]}>
          <View style={[styles.eyebrow, { gap: theme.spacing.sm }]}>
            <AppText variant="eyebrow" color="onHeroMuted">
              {eyebrow}
            </AppText>
            {item ? (
              <View style={[styles.chip, { borderColor: theme.colors.heroCurve }]}>
                <AppText variant="small" color="onHero" style={{ fontFamily: theme.fontFamilies.medium }}>
                  {item.subject}
                </AppText>
              </View>
            ) : null}
          </View>
          {!sideBySide ? (
            <View style={styles.cornerArt} pointerEvents="none">
              <HeroCurvesArt />
            </View>
          ) : null}
        </View>

        <View style={styles.text}>
          <AppText variant="h1" color="onHero" accessibilityRole="none">
            {title}
          </AppText>
          <AppText variant="body" color="onHeroMuted">
            {summary}
          </AppText>
          {item?.minutesLeft ? (
            <View style={[styles.time, { gap: 6, marginTop: theme.spacing.xs }]}>
              <Timer size={14} color={theme.colors.onHeroMuted} />
              <AppText variant="caption" color="onHero">
                {`About ${formatStudyTime(item.minutesLeft)}${started ? ' left' : ''}`}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={[styles.footer, { gap: theme.spacing.lg }]}>
          {item ? (
            <View style={[styles.progress, { gap: theme.spacing.sm }]}>
              <AppText variant="caption" color="onHero">{`${percent}% complete`}</AppText>
              <ProgressBar value={item.progress} fillColor={theme.colors.onHero} trackColor={theme.colors.heroTrack} />
            </View>
          ) : (
            <View style={styles.progress} />
          )}
          <View
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.heroButton,
                borderRadius: theme.radius.pill,
                minHeight: theme.touchTarget.min,
                paddingHorizontal: theme.spacing.xl,
              },
            ]}
          >
            <AppText variant="button" color="onHeroButton">
              {cta}
            </AppText>
            <ArrowRight size={18} color={theme.colors.onHeroButton} strokeWidth={2.4} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', minHeight: 220 },
  content: { flex: 1, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  eyebrow: { flex: 1, alignItems: 'flex-start' },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  sideArt: { position: 'absolute', top: 12, right: 12, bottom: 12 },
  cornerArt: { width: 116, height: 88, marginTop: -10, marginRight: -10 },
  text: { gap: 4 },
  time: { flexDirection: 'row', alignItems: 'center' },
  footer: { flexDirection: 'row', alignItems: 'flex-end' },
  progress: { flex: 1, maxWidth: 220 },
  button: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
