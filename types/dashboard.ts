import type { Href } from 'expo-router';

/**
 * Home dashboard view model, built by services/repositories/dashboardRepository
 * from real data (topic content, lesson_progress, profile totals, review
 * items). services/mock/mockDashboardData.ts is kept for UI previews and tests only.
 */

/** Accent family used for tiles and illustrations. */
export type AccentTone = 'blue' | 'coral' | 'teal' | 'amber';

/** App-native vector illustration drawn by components/art/ActivityGlyph. */
export type ActivityGlyphName = 'tangent' | 'function-art' | 'match' | 'limits' | 'wave' | 'practice';

export interface ContinueLearning {
  /** Chip label, e.g. the topic name "Integration". */
  subject: string;
  /** Heading: the subtopic to continue, e.g. "Understanding Integration". */
  topicTitle: string;
  summary: string;
  /** 0–1, topic progress. */
  progress: number;
  /** False before the learner has completed anything: shows "Start" instead of "Continue". */
  isStarted: boolean;
  /** Estimated minutes left in this subtopic (content/estimate.ts); absent in previews. */
  minutesLeft?: number;
  href: Href;
}

export interface LearningStatsData {
  streakDays: number;
  xp: number;
  /**
   * Practice answers checked in My Working and how many were correct. Shown as
   * practice accuracy once there are enough answers; there is no mastery score.
   */
  practice: { checked: number; correct: number };
}

/** One rule-based suggestion for what to do next (see dashboardRepository). */
export interface NextAction {
  id: 'review-mistakes' | 'try-practice';
  title: string;
  /** Why this is suggested, in plain words. */
  reason: string;
  actionLabel: string;
  tone: AccentTone;
  href: Href;
}

export type ActivityResult = { type: 'score'; percent: number } | { type: 'completed' };

export interface RecentActivity {
  id: string;
  title: string;
  kindLabel: string;
  glyph: ActivityGlyphName;
  tone: AccentTone;
  result: ActivityResult;
  /** ISO timestamp. */
  occurredAt: string;
  href: Href;
}

export interface ReviewSummary {
  conceptsNeedingAttention: number;
  href: Href;
}

/** Learner identity (name, avatar) comes from the auth profile, not from here. */
export interface DashboardData {
  continueLearning: ContinueLearning | null;
  stats: LearningStatsData;
  /** Null when "Continue learning" is already the best next step. */
  nextAction: NextAction | null;
  review: ReviewSummary;
  recentActivities: RecentActivity[];
  unreadNotifications: number;
}
