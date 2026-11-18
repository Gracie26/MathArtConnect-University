import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeIn } from '@/components/ui/FadeIn';
import { useLearnerName } from '@/features/auth/AuthProvider';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { DashboardData } from '@/types/dashboard';

import { ContinueLearningCard } from './ContinueLearningCard';
import { GreetingSection } from './GreetingSection';
import { LearningStats } from './LearningStats';
import { NextActionCard } from './NextActionCard';
import { RecentActivityList } from './RecentActivityList';
import { SyncStatusBadge } from './SyncStatusBadge';

interface DashboardContentProps {
  data: DashboardData;
  responsive: ResponsiveLayout;
  /** A one-time milestone moment (shown under the greeting). */
  celebration?: ReactNode;
  /** The compact weekly-goal and badge summary. */
  rewards?: ReactNode;
}

/**
 * Home, in order of importance so "what should I study next?" is answered at a glance:
 *   top        greeting with streak, XP and accuracy as small chips; Continue Learning (the one primary action)
 *   main       the next best step (only when there is one), weekly goal and next badge
 *   secondary  the latest activities
 * Desktop (≥ 960 dp) keeps that hierarchy in two columns: the main column
 * (Continue Learning, next step) beside a narrower one (goals, recent).
 * Practice hub and all-games links live on the Learn tab.
 */
export function DashboardContent({ data, responsive, celebration, rewards }: DashboardContentProps) {
  const theme = useAppTheme();
  const learnerName = useLearnerName();

  const greeting = (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.sm }}>
        <SyncStatusBadge />
        <GreetingSection learnerName={learnerName} />
      </View>
      <LearningStats stats={data.stats} />
    </View>
  );
  const hero = <ContinueLearningCard item={data.continueLearning} />;
  const next = data.nextAction ? <NextActionCard action={data.nextAction} /> : null;
  const recent = <RecentActivityList items={data.recentActivities} />;

  if (responsive.isWide) {
    return (
      <View style={{ gap: theme.spacing.xxl }}>
        <FadeIn>{greeting}</FadeIn>
        {celebration}
        <View style={[styles.columns, { gap: theme.spacing.xxl }]}>
          <View style={[styles.main, { gap: theme.spacing.xxl }]}>
            <FadeIn index={1}>{hero}</FadeIn>
            {next ? <FadeIn index={2}>{next}</FadeIn> : null}
          </View>
          <View style={[styles.side, { gap: theme.spacing.xxl }]}>
            {rewards ? <FadeIn index={1}>{rewards}</FadeIn> : null}
            <FadeIn index={2}>{recent}</FadeIn>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.xxl }}>
      <FadeIn>{greeting}</FadeIn>
      {celebration}
      <FadeIn index={1}>{hero}</FadeIn>
      {next || rewards ? (
        <FadeIn index={2} style={{ gap: theme.spacing.md }}>
          {next}
          {rewards}
        </FadeIn>
      ) : null}
      <FadeIn index={3}>{recent}</FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1.75, minWidth: 0 },
  side: { flex: 1, minWidth: 0 },
});
