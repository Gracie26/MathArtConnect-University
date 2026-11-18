import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { FadeIn } from '@/components/ui/FadeIn';
import { IconTile } from '@/components/ui/IconTile';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';

import type { Celebration } from './useRewards';

/**
 * A small moment for a genuine milestone (badge earned, topic completed, weekly goals complete):
 * one card that fades in (instantly under Reduce Motion), is announced politely to screen
 * readers, and is shown once per milestone on this device. No confetti.
 */
export function CelebrationBanner({
  item,
  more,
  onDone,
}: {
  item: Celebration;
  more: number;
  onDone: (id: string) => void;
}) {
  const theme = useAppTheme();
  return (
    <FadeIn>
      <View
        accessibilityLiveRegion="polite"
        style={[
          cardStyle(theme),
          styles.card,
          { padding: theme.spacing.md, gap: theme.spacing.sm, borderColor: theme.colors.primary },
        ]}
      >
        <View style={[styles.row, { gap: theme.spacing.md }]}>
          <IconTile icon={Sparkles} tone="teal" size={36} />
          <View style={styles.grow}>
            <AppText variant="title">{item.title}</AppText>
            <AppText variant="small" color="textSecondary">
              {item.text}
            </AppText>
            {more > 0 ? (
              <AppText variant="small" color="textSecondary">
                {`${more} more new ${more === 1 ? 'milestone' : 'milestones'}`}
              </AppText>
            ) : null}
          </View>
        </View>
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          <LoadingButton label="Great" onPress={() => onDone(item.id)} style={styles.grow} />
          <LoadingButton
            variant="secondary"
            label="See rewards"
            onPress={() => {
              onDone(item.id);
              router.push('/rewards');
            }}
            style={styles.grow}
          />
        </View>
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
});
