import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { listLearnerTopics } from '@/content/registry';
import { useAuth } from '@/features/auth/AuthProvider';
import { useLearnerRecords } from '@/features/insights/useLearnerRecord';
import { computeTopicProgress } from '@/features/learning/progress';
import { studyDay } from '@/features/learning/studyDay';
import { learnerSummaryRepository } from '@/services/repositories/learnerSummary';

import { type BadgeStatus, evaluateBadges, nextBadge } from './achievements';
import { EMPTY_REWARDS, loadRewardsState, type RewardsState, saveRewardsState } from './rewardsStore';
import { goalMet, type WeeklyGoal, weeklyGoals, weekStart } from './weeklyGoals';

/** A genuine milestone worth a small moment on Home (each shown once per device). */
export interface Celebration {
  id: string;
  title: string;
  text: string;
}

export type RewardsData = {
  badges: BadgeStatus[];
  earnedCount: number;
  next: BadgeStatus | null;
  goals: WeeklyGoal[];
  xp: number;
  streakDays: number;
  longestStreak: number;
  /** Milestones reached since they were last seen on this device. */
  pending: Celebration[];
  /** Every milestone reached so far (badges, completed topics, this week's goals). */
  milestoneIds: string[];
};

/**
 * Badges, weekly goals and personal bests from the learner's real record across every topic,
 * with the device choices (celebrated milestones, weekly goals on or off, chosen backdrop).
 */
export function useRewards() {
  const { user } = useAuth();
  const topics = useMemo(() => listLearnerTopics(), []);
  const { state: records, reload } = useLearnerRecords(topics);
  const [summary, setSummary] = useState<{ xp: number; streakDays: number; longestStreak: number } | null>(null);
  const [store, setStore] = useState<RewardsState | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      void learnerSummaryRepository.getSummary(user.id).then((r) => {
        if (active && r.ok)
          setSummary({ xp: r.data.xp, streakDays: r.data.streakDays, longestStreak: r.data.longestStreak });
      });
      void loadRewardsState(user.id).then((s) => {
        if (active) setStore(s);
      });
      return () => {
        active = false;
      };
    }, [user]),
  );

  const data = useMemo<RewardsData | null>(() => {
    if (records.status !== 'ready' || !summary || !store) return null;
    const badges = evaluateBadges({
      topics: records.records,
      xp: summary.xp,
      longestStreak: Math.max(summary.longestStreak, summary.streakDays),
    });
    const goals = weeklyGoals(records.records.map((r) => r.record));
    const milestones: Celebration[] = [
      ...badges
        .filter((b) => b.earned)
        .map((b) => ({ id: `badge-${b.id}`, title: `New badge: ${b.title}`, text: b.criterion })),
      ...records.records
        .filter(({ topic, record }) => {
          const p = computeTopicProgress(topic, record.lessons);
          return topic.units.length > 0 && p.completedSubtopics === topic.units.length;
        })
        .map(({ topic }) => ({
          id: `topic-${topic.id}`,
          title: `Topic complete: ${topic.title}`,
          text: 'You have completed every subtopic of this topic.',
        })),
      ...(store.weeklyGoals && goals.every(goalMet)
        ? [
            {
              id: `week-${weekStart(studyDay())}`,
              title: 'Weekly goals complete',
              text: 'Every weekly goal is complete this week.',
            },
          ]
        : []),
    ];
    const seen = new Set(store.celebrated);
    return {
      badges,
      earnedCount: badges.filter((b) => b.earned).length,
      next: nextBadge(badges),
      goals,
      xp: summary.xp,
      streakDays: summary.streakDays,
      longestStreak: Math.max(summary.longestStreak, summary.streakDays),
      // Before the first load, existing milestones are recorded quietly (no flood of moments).
      pending: store.initialised ? milestones.filter((m) => !seen.has(m.id)) : [],
      milestoneIds: milestones.map((m) => m.id),
    };
  }, [records, summary, store]);

  const update = useCallback(
    (change: (s: RewardsState) => RewardsState) => {
      setStore((current) => {
        const next = change(current ?? EMPTY_REWARDS);
        if (user) void saveRewardsState(user.id, next).catch(() => undefined);
        return next;
      });
    },
    [user],
  );

  // First load on this device: record everything already reached as celebrated, without a moment.
  const firstIds = store && !store.initialised ? data?.milestoneIds : undefined;
  useEffect(() => {
    if (firstIds)
      update((s) => ({ ...s, initialised: true, celebrated: [...new Set([...s.celebrated, ...firstIds])] }));
  }, [firstIds, update]);

  return {
    status: records.status === 'error' ? ('error' as const) : data ? ('ready' as const) : ('loading' as const),
    error: records.status === 'error' ? records.message : null,
    data,
    settings: store ?? EMPTY_REWARDS,
    reload,
    markCelebrated: (id: string) =>
      update((s) => (s.celebrated.includes(id) ? s : { ...s, celebrated: [...s.celebrated, id] })),
    setWeeklyGoals: (on: boolean) => update((s) => ({ ...s, weeklyGoals: on })),
    setBackdrop: (backdrop: RewardsState['backdrop']) => update((s) => ({ ...s, backdrop })),
  };
}
