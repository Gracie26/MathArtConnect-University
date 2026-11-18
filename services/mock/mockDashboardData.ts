/**
 * ⚠ DEVELOPMENT MOCK DATA ⚠
 *
 * Placeholder dashboard values for UI previews and component tests ONLY.
 * The app itself never uses this: Home is built from real learner data by
 * services/repositories/dashboardRepository.ts.
 */
import type { DashboardData } from '@/types/dashboard';

const DAY_MS = 24 * 60 * 60 * 1000;

export function createMockDashboardData(now: Date = new Date()): DashboardData {
  const daysAgo = (days: number, hour: number) => {
    const date = new Date(now.getTime() - days * DAY_MS);
    date.setHours(hour, 15, 0, 0);
    return date.toISOString();
  };

  return {
    continueLearning: {
      subject: 'Calculus',
      topicTitle: 'Derivatives',
      summary: 'Explore how slopes change along a curve.',
      progress: 0.72,
      isStarted: true,
      href: '/learn',
    },
    stats: {
      streakDays: 4,
      xp: 240,
      practice: { checked: 12, correct: 9 },
    },
    nextAction: {
      id: 'review-mistakes',
      title: 'Review 3 mistakes',
      reason: 'Going back over a checked answer that was not right yet helps it stick.',
      actionLabel: 'Review now',
      tone: 'coral',
      href: '/mistakes',
    },
    review: {
      conceptsNeedingAttention: 3,
      href: '/mistakes',
    },
    recentActivities: [
      {
        id: 'limits-visual-lab',
        title: 'Limits Visual Lab',
        kindLabel: 'Interactive exploration',
        glyph: 'limits',
        tone: 'blue',
        result: { type: 'score', percent: 85 },
        occurredAt: daysAgo(0, 9),
        href: '/my-work',
      },
      {
        id: 'derivative-match',
        title: 'Derivative Match',
        kindLabel: 'Game',
        glyph: 'match',
        tone: 'coral',
        result: { type: 'score', percent: 70 },
        occurredAt: daysAgo(1, 19),
        href: '/my-work',
      },
      {
        id: 'function-art',
        title: 'Function Art',
        kindLabel: 'Creative activity',
        glyph: 'function-art',
        tone: 'teal',
        result: { type: 'completed' },
        occurredAt: daysAgo(1, 16),
        href: '/my-work',
      },
    ],
    unreadNotifications: 2,
  };
}

/** A brand-new learner with nothing started; used to check empty states. */
export function createEmptyDashboardData(): DashboardData {
  return {
    continueLearning: null,
    stats: { streakDays: 0, xp: 0, practice: { checked: 0, correct: 0 } },
    nextAction: null,
    review: { conceptsNeedingAttention: 0, href: '/mistakes' },
    recentActivities: [],
    unreadNotifications: 0,
  };
}
