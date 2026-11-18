import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { newId } from '@/lib/utils/id';

import { dailyActivityId } from './studyDay';
import {
  activityLogRepository,
  artProjectRepository,
  gameSessionRepository,
  questionAttemptRepository,
} from '@/services/repositories/learning';
import type {
  ActivityInput,
  ActivityRecord,
  ArtProjectRecord,
  GameSessionRecord,
  QuestionAttemptRecord,
} from '@/services/repositories/types';
import { fail, type ServiceResult } from '@/services/types';

export interface LearningHistory {
  attempts: QuestionAttemptRecord[];
  games: GameSessionRecord[];
  art: ArtProjectRecord[];
  activity: ActivityRecord[];
}

export type HistoryState =
  { status: 'loading' } | { status: 'ready'; history: LearningHistory } | { status: 'error'; message: string };

/** The signed-in learner's history for a topic; reloads whenever the screen regains focus. */
export function useLearningHistory(topicId: string) {
  const { user } = useAuth();
  const [state, setState] = useState<HistoryState>({ status: 'loading' });

  const load = useCallback(async () => {
    if (!user) {
      setState({ status: 'error', message: 'Sign in to see your history.' });
      return;
    }
    const [attempts, games, art, activity] = await Promise.all([
      questionAttemptRepository.list(user.id, topicId),
      gameSessionRepository.list(user.id, topicId),
      artProjectRepository.list(user.id, topicId),
      activityLogRepository.list(user.id, topicId),
    ]);
    const failed = [attempts, games, art, activity].find((r) => !r.ok);
    if (failed && !failed.ok) {
      setState({ status: 'error', message: failed.error.message });
      return;
    }
    setState({
      status: 'ready',
      history: {
        attempts: attempts.ok ? attempts.data : [],
        games: games.ok ? games.data : [],
        art: art.ok ? art.data : [],
        activity: activity.ok ? activity.data : [],
      },
    });
  }, [user, topicId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { state, reload: load };
}

/**
 * Records a timeline event (explore use, reflection, review, or a study-day marker) for the
 * signed-in learner. With `oncePerDay`, the same item is recorded once per study day: repeating
 * it that day adds no row, no XP and no streak change.
 */
export function useActivityRecorder() {
  const { user } = useAuth();
  return useCallback(
    async (
      event: Omit<ActivityInput, 'id'>,
      options: { oncePerDay?: string } = {},
    ): Promise<ServiceResult<ActivityRecord>> =>
      user
        ? activityLogRepository.record(user.id, {
            ...event,
            id: options.oncePerDay ? dailyActivityId(user.id, event.type, options.oncePerDay) : newId(),
          })
        : fail('unauthenticated', 'Sign in to save this.'),
    [user],
  );
}

/**
 * Marks a study day for an activity that has no XP of its own (checking a practice answer,
 * completing a lesson step, saving artwork), so all real study counts towards the streak.
 * One zero-XP row per kind and topic per study day.
 */
export async function recordStudyDay(
  userId: string,
  type: 'practice' | 'lesson' | 'art',
  topicId: string,
): Promise<void> {
  await activityLogRepository.record(userId, {
    id: dailyActivityId(userId, type, topicId),
    type,
    refId: topicId,
    topicId,
    summary: 'Study day',
    xp: 0,
    metadata: { studyDayMarker: true },
  });
}
