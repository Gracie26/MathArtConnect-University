import { useRef, useState } from 'react';
import { ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native';

import { AmbientMathArt } from '@/components/art/AmbientMathArt';
import { BACK_TO_TOP_AFTER, BackToTop } from '@/components/layout/BackToTop';
import { AppHeader } from '@/components/navigation/AppHeader';
import { DashboardContent } from '@/features/dashboard/components/DashboardContent';
import { DashboardError } from '@/features/dashboard/components/DashboardError';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { useDashboard } from '@/features/dashboard/useDashboard';
import { useNotifications } from '@/features/notifications/useNotifications';
import { CelebrationBanner } from '@/features/rewards/CelebrationBanner';
import { RewardsSummaryCard } from '@/features/rewards/RewardsSummaryCard';
import { useRewards } from '@/features/rewards/useRewards';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export default function HomeScreen() {
  const theme = useAppTheme();
  const responsive = useResponsiveLayout();
  const dashboard = useDashboard();
  // The bell's dot shows real unread in-app notifications.
  const notifications = useNotifications();
  const rewards = useRewards();
  const pending = rewards.data?.pending ?? [];
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [scrolled, setScrolled] = useState(false);
  const [farDown, setFarDown] = useState(false);

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <AppHeader unreadNotifications={notifications.unread} elevated={scrolled} />
      <ScrollView
        ref={scrollRef}
        style={styles.fill}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          setScrolled(y > 4);
          setFarDown(y > BACK_TO_TOP_AFTER);
        }}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.huge }}
      >
        {/* Decorative, behind the greeting and hero only; never behind lesson content. */}
        <AmbientMathArt variant={rewards.settings.backdrop} height={460} />
        <View
          style={[styles.content, { maxWidth: theme.layout.maxDashboardWidth, paddingHorizontal: responsive.gutter }]}
        >
          {dashboard.status === 'loading' ? (
            <DashboardSkeleton columns={responsive.isTablet ? 4 : 2} />
          ) : dashboard.status === 'error' ? (
            <DashboardError message={dashboard.error.message} onRetry={dashboard.reload} />
          ) : (
            <DashboardContent
              data={dashboard.data}
              responsive={responsive}
              celebration={
                pending[0] ? (
                  <CelebrationBanner item={pending[0]} more={pending.length - 1} onDone={rewards.markCelebrated} />
                ) : null
              }
              rewards={
                rewards.data ? (
                  <RewardsSummaryCard data={rewards.data} showGoals={rewards.settings.weeklyGoals} />
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>
      <BackToTop visible={farDown} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: !reducedMotion })} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { width: '100%', alignSelf: 'center' },
});
