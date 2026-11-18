import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { TopicDefinition } from '@/content/types';
import { useAuth } from '@/features/auth/AuthProvider';
import type { LearningHistory } from '@/features/learning/useLearningHistory';
import {
  activityLogRepository,
  artProjectRepository,
  gameSessionRepository,
  questionAttemptRepository,
} from '@/services/repositories/learning';
import { lessonProgressRepository } from '@/services/repositories/lessonProgress';
import type { LessonProgressEntry } from '@/services/repositories/types';

/** Everything the learner has done in a topic: lesson steps plus practice, games, art and the activity log. */
export interface LearnerRecord extends LearningHistory {
  lessons: LessonProgressEntry[];
}

export type RecordState =
  { status: 'loading' } | { status: 'ready'; record: LearnerRecord } | { status: 'error'; message: string };

type Loaded = { ok: true; record: LearnerRecord } | { ok: false; message: string };

/** Loads one topic's record for a learner through the repositories. */
export async function loadLearnerRecord(userId: string, topic: TopicDefinition): Promise<Loaded> {
  const [lessons, attempts, games, art, activity] = await Promise.all([
    lessonProgressRepository.listForUnits(
      userId,
      topic.units.map((u) => u.id),
    ),
    questionAttemptRepository.list(userId, topic.id),
    gameSessionRepository.list(userId, topic.id),
    artProjectRepository.list(userId, topic.id),
    activityLogRepository.list(userId, topic.id),
  ]);
  for (const result of [lessons, attempts, games, art, activity]) {
    if (!result.ok) return { ok: false, message: result.error.message };
  }
  return {
    ok: true,
    record: {
      lessons: lessons.ok ? lessons.data : [],
      attempts: attempts.ok ? attempts.data : [],
      games: games.ok ? games.data : [],
      art: art.ok ? art.data : [],
      activity: activity.ok ? activity.data : [],
    },
  };
}

/**
 * Loads the signed-in learner's real record for a topic (never sample data),
 * and reloads whenever the screen regains focus. A failed request is shown as
 * an error with a retry, not replaced by empty data.
 */
export function useLearnerRecord(topic: TopicDefinition | undefined) {
  const { user } = useAuth();
  const [state, setState] = useState<RecordState>({ status: 'loading' });

  const load = useCallback(async () => {
    if (!topic) {
      setState({ status: 'error', message: 'This topic is not available.' });
      return;
    }
    if (!user) {
      setState({ status: 'error', message: 'Sign in to see your learning record.' });
      return;
    }
    const loaded = await loadLearnerRecord(user.id, topic);
    setState(loaded.ok ? { status: 'ready', record: loaded.record } : { status: 'error', message: loaded.message });
  }, [user, topic]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { state, reload: load };
}

export type RecordsState =
  | { status: 'loading' }
  | { status: 'ready'; records: { topic: TopicDefinition; record: LearnerRecord }[] }
  | { status: 'error'; message: string };

/** The learner's records for several topics at once (e.g. notifications across every topic). */
export function useLearnerRecords(topics: readonly TopicDefinition[]) {
  const { user } = useAuth();
  const [state, setState] = useState<RecordsState>({ status: 'loading' });

  const load = useCallback(async () => {
    if (!user) {
      setState({ status: 'error', message: 'Sign in to see your learning record.' });
      return;
    }
    const loaded = await Promise.all(topics.map((topic) => loadLearnerRecord(user.id, topic)));
    const failed = loaded.find((l) => !l.ok);
    if (failed && !failed.ok) {
      setState({ status: 'error', message: failed.message });
      return;
    }
    setState({
      status: 'ready',
      records: loaded.flatMap((l, i) => (l.ok ? [{ topic: topics[i] as TopicDefinition, record: l.record }] : [])),
    });
  }, [user, topics]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { state, reload: load };
}
